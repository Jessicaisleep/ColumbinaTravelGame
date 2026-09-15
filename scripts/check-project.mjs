import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
const root = resolve(import.meta.dirname, '..');
const required = [
  'index.html', '开始游戏.html', 'vite.config.js', 'src/main.js', 'src/legacy-entry.js',
  'public/manifest.webmanifest', 'public/service-worker.js', 'src/pwa/registerServiceWorker.js',
  'src/storage/save-api.js', 'src/assets/asset-registry.js'
];
const missing = required.filter((file) => !existsSync(resolve(root, file)));
if (missing.length) { console.error(`缺少文件：${missing.join(', ')}`); process.exitCode = 1; }
else {
  const index = readFileSync(resolve(root, 'index.html'), 'utf8');
  const game = readFileSync(resolve(root, '开始游戏.html'), 'utf8');
  const scriptReferences = [...game.matchAll(/<script[^>]+src=["']([^"']+)["']/g)].map((match) => match[1]);
  const legacyScripts = scriptReferences.filter((path) => !path.endsWith('src/main.js'));
  const allScriptsExist = scriptReferences.every((path) => existsSync(resolve(root, path.replace(/^\.\//, ''))));
  const manifest = JSON.parse(readFileSync(resolve(root, 'public/manifest.webmanifest'), 'utf8'));
  const manifestIconsExist = manifest.icons.every((icon) => existsSync(resolve(root, icon.src.replace(/^\.\//, ''))));
  const store = readFileSync(resolve(root, 'src/store.js'), 'utf8');
  const config = readFileSync(resolve(root, 'src/data/config.js'), 'utf8');
  const saveApi = readFileSync(resolve(root, 'src/storage/save-api.js'), 'utf8');
  const checks = [
    ['index module entry', index.includes('type="module"') && index.includes('./src/main.js')],
    ['game module entry', game.includes('type="module"') && game.includes('./src/main.js')],
    ['34 legacy scripts retained', legacyScripts.length === 34],
    ['legacy script order boundary', legacyScripts[0] === 'src/core/util.js' && legacyScripts.at(-1) === 'src/core/selftest.js'],
    ['all script paths exist', allScriptsExist],
    ['legacy namespace retained', game.includes('src/core/selftest.js')],
    ['legacy save key retained', store.includes('C.SAVE_KEY') && config.includes('nahida-travel/save/v2') && saveApi.includes('nahida-travel/save/v2')],
    ['manifest icon paths exist', manifestIconsExist]
  ];
  checks.forEach(([name, ok]) => console.log(`${ok ? 'PASS' : 'FAIL'} ${name}`));
  if (checks.some(([, ok]) => !ok)) process.exitCode = 1;
}
