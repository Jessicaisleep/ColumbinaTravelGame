# 哥伦比娅的旅行

《哥伦比娅的旅行》是一款可在浏览器中运行的离线旅行放置小游戏。玩家在挪德卡莱的家园照顾哥伦比娅，安排她前往提瓦特各地区旅行；她会根据路程、路上事件和同行角色带回明信片、玩具与旅途记录。

当前版本重点是稳定的本地单机体验：核心玩法不依赖网络，存档保存在浏览器本地，关闭页面后旅途和作物仍会按时间推进。

> 非商业同人项目。角色与世界观相关知识产权归原权利人所有。本项目仅供学习与交流。

## 当前功能

- 家园场景：哥伦比娅会在家中不同位置之间移动，并根据状态说话、响应点击。
- 独立田地场景：四块旱田和两块水田，共六块可操作田地；哥伦比娅在家时会跟随进入田地。
- 作物系统：作物按真实时间生长，收获后进入仓库，可用于厨房料理，并有机会获得稀有道具。
- 旅行系统：随机旅行、指定地区、指定方向；旅途中会发生补给、挫折、改道、风景和角色相遇等事件。
- 明信片册：每次旅行生成可回看的明信片、旅途日志、天气、时段、同行角色和事件内容。
- 家园互动：厨房、仓库、玩具、聊天、成就、来访角色和设置面板。
- 离线进度：本地存档支持旅行结算、作物生长和家园状态的时间补偿。
- 图片管线：支持真实图片素材；素材未就绪时自动使用程序化占位图，不会白屏。
- 命令栏：按 `~` 或 `` ` `` 打开，也可以点击画面右下角 `~`。命令栏用于本地测试和内容检查，完整列表见 [`命令栏使用说明.txt`](命令栏使用说明.txt)。

## 快速运行

双击 `开始游戏.html` 即可运行。也可以打开 `index.html`，它会跳转到游戏入口。

使用 Vite 开发：

```bash
npm install
npm run dev
```

生产构建：

```bash
npm run build
```

## Capacitor 手机工程

Android 工程已初始化，使用 Vite `dist/` 作为 Web 资源目录：

    npm run cap:sync
    npx cap open android

原生桥仅处理 Android 返回键、暂停/恢复、低内存恢复、状态栏和安全区；AndroidManifest 不申请相机、定位、通讯录或通知权限。Android Studio、JDK、SDK、adb 未安装在当前 Windows 环境时，只能完成工程同步，不能代替真实设备验收。iOS 需要在 macOS + Xcode 上执行 `npx cap add ios` 和 `npx cap sync ios`，并使用 Apple Developer 账号签名。设备矩阵、低内存重启、APK/AAB 与商店发布限制见 [CAPACITOR-MOBILE-RELEASE.md](docs/CAPACITOR-MOBILE-RELEASE.md)。

## PWA 安装与离线验证

PWA 必须通过 HTTPS 或 `localhost` 打开；直接双击 `开始游戏.html` 的 `file://` 模式适合便携预览，但浏览器不会注册 Service Worker，也不能作为安装验收环境。

- Windows / Chrome（或 Edge）：打开 HTTPS 发布地址，等待页面加载完成后，在地址栏右侧选择“安装哥伦比娅的旅行”（或菜单“保存并分享 → 安装页面”）。安装后从开始菜单打开；浏览器站点数据与普通网页分开保存，清除站点数据会同时清除本机存档。
- Android / Chrome：打开 HTTPS 发布地址，选择地址栏“安装应用”或菜单“添加到主屏幕”。首次在线打开后，已缓存的静态发布文件可在断网时再次打开；`localStorage` 存档只保留在当前浏览器/应用容器，不会上传或跨设备同步。
- iOS / Safari：打开 HTTPS 发布地址，点“分享”→“添加到主屏幕”。iOS 的 PWA 能力和后台回收策略受系统版本限制；切后台前游戏会保存进度，但仍建议定期使用“设置 → 导出存档”备份 JSON。

升级发布时 Service Worker 会使用新的静态缓存版本并在激活阶段删除旧缓存；它只缓存同源静态文件，不缓存 `localStorage`、存档 JSON 或第三方请求。若升级后仍看到旧画面，请关闭已安装窗口后重新打开，或在浏览器开发者工具中注销旧 Service Worker。

验收建议：先在线首次打开并进入家园、田地、厨房、仓库、明信片、设置和命令栏，再断网重新加载；清除站点数据后重新打开，设置页应提示“未找到这台设备的旧存档”，此时可用导入 JSON 恢复。

项目也保留 pnpm 兼容用法：

```bash
pnpm install
pnpm dev
pnpm build
```

## 调试与自检

常用 URL 参数：

| 参数 | 用途 |
|---|---|
| `?demo=1` | 写入试玩数据，快速查看主要界面 |
| `?selftest=1` | 运行浏览器内置自检 |
| `?screen=farm` | 直接查看田地场景 |
| `?modal=kitchen` | 直接打开指定面板 |

命令栏示例：

```text
help
trip region 须弥 柯莱
trip finish
visitor 派蒙
encounter 赛诺
event aurora
farm plant dry1 potato
farm ready dry1
farm harvest dry1
```

命令栏只作用于当前设备的本地存档，不会上传数据。执行 `reset confirm` 或 `trip cancel confirm` 前请确认确实需要修改本地进度。

## 技术结构

- 页面入口：`index.html`、`开始游戏.html`
- 构建：Vite
- 游戏核心：现有 JavaScript 游戏逻辑，按数据、引擎、时间、存档、渲染和 UI 分层
- 数据与引擎：`src/data/`、`src/engine/`、`src/time/`
- 家园与田地：`src/home.js`、`src/farm.js`、`src/data/farm.js`
- 本地存档：`src/store.js`；存档不保存图片文件
- 图片加载：`src/assets.js`、`assets/manifest.js`
- 自检：`src/core/selftest.js`
- 命令栏：`src/commands.js`
- 图片素材：`图片素材/`

## 存档与隐私

- 核心玩法支持完全离线运行。
- 游戏进度保存在当前浏览器设备中；清理浏览器站点数据会影响存档。
- 当前版本不要求 API Key，不把密钥写入前端代码、URL 或存档。
- 使用“导出存档”可备份当前进度；导出的 JSON 文件请自行妥善保存。

## 资源说明

素材清单和命名规范见 `图片素材/素材标准.txt`。素材缺失时游戏会回退到程序化占位图；替换或新增素材后，应同步检查 `assets/manifest.js` 和设置页的素材状态。

## 开发检查

```bash
npm test
npm run build
git diff --check
```

浏览器自检入口：`开始游戏.html?selftest=1`

## 许可证

代码部分采用 MIT 许可证，见 [`LICENSE`](LICENSE)。游戏中的角色、美术素材及相关世界观内容不因代码许可证而获得额外授权；公开分发时请遵守相应素材和知识产权要求。
