// 原生平台占位：第一阶段不生成 Tauri/Capacitor 工程，也不伪装执行构建。
const command = process.argv[2] || 'platform command';
console.error(`[${command}] 尚未启用：请先安装对应平台工具链，并按 docs/PLATFORM-BUILD.md 初始化工程。`);
process.exitCode = 1;
