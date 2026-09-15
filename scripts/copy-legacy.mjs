import { copyFileSync, cpSync, existsSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const out = resolve(root, 'dist');
mkdirSync(out, { recursive: true });

// Vite 不打包普通 script；构建完成后原样复制旧运行时和中文图片。
// 源文件不移动、不改写，dist 仍按开始游戏.html 中的相对路径运行。
for (const dir of ['src', 'assets', '图片素材']) {
  const source = resolve(root, dir);
  if (!existsSync(source)) throw new Error(`缺少旧运行时目录：${dir}`);
  cpSync(source, resolve(out, dir), { recursive: true });
}
copyFileSync(resolve(root, '开始游戏.html'), resolve(out, '开始游戏.html'));

console.log('Copied legacy runtime: 开始游戏.html, src, assets, 图片素材');
