# Capacitor 手机发布说明

## 当前状态

Capacitor 已初始化，webDir 固定为 Vite 的 dist/，应用标识为 com.columbina.travel。Android 工程已生成并同步；iOS 工程暂未生成，因为 iOS 构建必须在 macOS + Xcode 上执行。Android 与 Tauri/PWA 使用同一张 图片素材/图标-512.png 源图生成应用图标。当前原生桥只处理返回键、暂停/恢复、低内存恢复和状态栏，不申请相机、定位、通讯录或通知等无关权限。

## 工具链

Android：安装 Node.js/npm、JDK 21 LTS、Android Studio、Android SDK Platform/Build Tools、Android SDK Command-line Tools 和 adb。安装完成后，确认 ANDROID_HOME 或 ANDROID_SDK_ROOT 指向 SDK，并让 sdkmanager、adb 可在终端找到。

iOS：需要 macOS、Xcode、CocoaPods（如插件要求）和 Apple Developer 账号。签名、真机安装、TestFlight 和 App Store 发布都不能在 Windows 上完成。

## 工作流

    npm install
    npm run build
    npm run cap:sync
    npx cap open android

cap:sync 每次先构建 dist/，再执行 cap sync。只复制发布静态文件；不会把 localStorage 存档或任何用户数据写入仓库/安装包。Android 也可单独执行 npx cap copy android。

`npm run cap:sync:android` 和 `npm run cap:sync:ios` 可分别同步单个平台；`npm run cap:build` 会在 Android SDK 完整配置后调用原生构建，不会把“复制 Web 资源”误报成 APK。

在 macOS 上首次生成并同步 iOS：

    npm run build
    npx cap add ios
    npx cap sync ios
    npx cap open ios

## 权限与生命周期

AndroidManifest 当前没有 uses-permission，仅保留 Capacitor 默认的应用组件。状态栏使用深色主题并覆盖 WebView，页面继续使用 env(safe-area-inset-*) 处理刘海和底部导航区。

原生桥的返回键顺序是：关闭游戏弹窗/田地面板 → 回到家园 → 浏览历史回退 → 退出应用。appStateChange 进入后台时同步保存现有 localStorage 存档，恢复时重新结算到期旅程并重绘。WebView 被系统低内存回收后，appRestoredResult 会触发同样的恢复路径；存档仍依赖系统 WebView 数据目录，发布前要在低内存设备上验证。

## 验收矩阵

当前机器已验证：npm install、Vite build、npx cap add android、npx cap sync android、AndroidManifest 无额外权限、前端资源复制到 android/app/src/main/assets/public，以及同一张 图片素材/图标-512.png 生成 Android 多密度图标。Android Studio 安装程序已落盘；Gradle 探测因本机尚未配置 Android SDK（缺少 sdk.dir/ANDROID_HOME）而停止。

尚未声称完成的设备验收：本机没有 sdkmanager/adb，因此没有真实 Android 设备、不同屏幕比例或低内存重启实测；Windows 也无法生成 iOS 工程或连接 iOS 真机。发布前至少用一台 Android 设备和一台 iOS 设备检查首次启动、横竖屏、返回键、状态栏/安全区、后台恢复、低内存重启以及导出/导入存档。

## 发布选择

首版建议先生成内部 APK 或受控测试包，不直接承诺商店发布。正式 APK/AAB、测试版分发或商店版本需要另外准备签名密钥、商店图标、隐私说明、年龄分级、素材授权和数据安全表单。Android 签名 keystore、iOS 证书、provisioning profile 和 Apple Developer 凭据不得提交 Git。
