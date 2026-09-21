# Tauri Windows 桌面发布说明

本项目的 Windows 桌面壳使用 Tauri 2，前端发布目录固定为 Vite 生成的 `dist/`。当前只启用本地页面和窗口能力，不添加账号系统、远程 API、网络插件、shell 或文件系统权限；游戏存档仍由 WebView 的 `localStorage` 管理。

## 环境要求

- Windows 10/11 x64
- Rustup、`stable-x86_64-pc-windows-msvc` 工具链和 MSVC C++ Build Tools
- Node.js/npm
- WebView2 Runtime（Windows 10/11 通常已提供；安装器会依赖它）

检查环境：

```powershell
$env:Path = "$env:USERPROFILE\.cargo\bin;$env:Path"
rustc --version
cargo --version
npx tauri info
```

## 开发与构建

```powershell
npm install
npm run tauri:dev
npm run tauri:build
```

`tauri:dev` 使用本机 `http://localhost:5173` 开发服务器；生产构建先执行 `npm run build`，再把 `dist/` 嵌入应用。`file://` 双击入口仍可作为便携预览，但不是 PWA 或 Service Worker 的验收环境。

Windows 产物位于：

- `src-tauri/target/release/app.exe`：未安装的可执行文件
- `src-tauri/target/release/bundle/msi/Columbina Travel_<version>_x64_en-US.msi`
- `src-tauri/target/release/bundle/nsis/Columbina Travel_<version>_x64-setup.exe`

当前优先验证 MSI/NSIS；macOS 和 Linux 目标按实际发布平台另行增加，不在 Windows 构建中混入。

## 窗口与存档策略

- 默认窗口 800×600，可缩放，最小 480×360；游戏内全屏按钮和系统关闭按钮沿用网页逻辑。
- Tauri 使用固定 identifier `com.columbina.travel`。覆盖安装时保持同一 identifier 和用户安装模式，WebView 数据目录不会由应用主动清理，`localStorage` 存档预期保留。
- 卸载流程没有自定义“清除存档”脚本，不主动删除导出的 JSON。Windows WebView 数据是否由系统/安装器清理取决于版本，不能把“卸载后仍保留”当作保证；卸载前应在“设置 → 导出存档”备份。
- 清除站点数据、手动删除 WebView 数据目录或更换用户配置可能使存档不可恢复；导入 JSON 是恢复路径。

## 签名与分发

本地构建的 `.exe`、`.msi` 和 NSIS 安装器默认未签名，首次运行可能触发 Windows SmartScreen“未知发布者”警告。正式分发时：

1. 购买或申请代码签名证书（企业可使用硬件/云 HSM），私钥只保存在发布机或 CI 密钥库，绝不提交仓库。
2. 使用 Windows SDK `signtool` 对可执行文件和安装器执行 Authenticode 签名，并使用可信 RFC 3161 时间戳服务。
3. 在干净 Windows 机器上验证签名链、安装、覆盖升级、卸载和 SmartScreen 信誉，再上传到官网或可信商店。
4. 记录证书到期、吊销和密钥轮换流程；未签名包只适合内部测试或明确提示风险的渠道。

示例（证书和时间戳地址仅作占位，发布时替换）：

```powershell
signtool sign /fd SHA256 /a /tr https://timestamp.example.com /td SHA256 `
  src-tauri\target\release\app.exe
signtool sign /fd SHA256 /a /tr https://timestamp.example.com /td SHA256 `
  src-tauri\target\release\bundle\msi\Columbina Travel_1.0.0_x64_en-US.msi
```

签名证书私钥、PFX 文件、CI token 和用户存档都不属于发布产物，不能上传 Git 或安装包仓库。

## 当前验证边界

已验证 Rust/MSVC/WebView2 环境、Cargo 检查、Vite 构建、Tauri release 编译以及 MSI/NSIS 产物生成。窗口缩放、全屏/退出、系统返回手势和 `localStorage` 读写沿用同一前端入口；每次正式发布仍应在干净 Windows 账户中手动验收首次启动、覆盖升级、卸载后的存档策略，并记录实际 WebView 数据行为。
