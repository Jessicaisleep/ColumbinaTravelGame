// Vite/ES Module 应用入口（第一阶段）。不迁移旧游戏模块，只启动兼容层和可选平台能力。
import { startLegacyEntry } from './legacy-entry.js';
import { registerServiceWorker } from './pwa/registerServiceWorker.js';
import { setupCapacitorBridge } from './platform/capacitor.js';

startLegacyEntry();
registerServiceWorker();
setupCapacitorBridge().catch(() => {
  // Native lifecycle enhancements are optional; the local game remains usable.
});
