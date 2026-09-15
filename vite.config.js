import { defineConfig } from 'vite';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = dirname(fileURLToPath(import.meta.url));

// 第一阶段只负责构建与兼容入口；旧版开始游戏.html 仍由普通 script 顺序加载。
export default defineConfig({
  base: './',
  build: {
    rollupOptions: {
      input: {
        // 旧游戏页不交给 Rollup 转换；构建后由兼容复制脚本原样带入 dist。
        index: resolve(projectRoot, 'index.html')
      }
    }
  },
  server: { host: 'localhost' }
});
