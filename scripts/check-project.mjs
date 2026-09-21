import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
const root = resolve(import.meta.dirname, '..');
function pngSize(file) {
  try {
    const bytes = readFileSync(file);
    if (bytes.length < 24 || bytes.readUInt32BE(0) !== 0x89504e47 || bytes.readUInt32BE(4) !== 0x0d0a1a0a) return null;
    return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
  } catch { return null; }
}
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
  const manifestIconsExist = manifest.icons.every((icon) => {
    if (!icon.src.startsWith('./') || icon.src.includes('\\') || icon.src.includes('..')) return false;
    return existsSync(resolve(root, icon.src.replace(/^\.\//, '')));
  });
  const icon192 = pngSize(resolve(root, '图片素材/图标-192.png'));
  const icon512 = pngSize(resolve(root, '图片素材/图标-512.png'));
  const store = readFileSync(resolve(root, 'src/store.js'), 'utf8');
  const config = readFileSync(resolve(root, 'src/data/config.js'), 'utf8');
  const saveApi = readFileSync(resolve(root, 'src/storage/save-api.js'), 'utf8');
  const serviceWorker = readFileSync(resolve(root, 'public/service-worker.js'), 'utf8');
  const readme = readFileSync(resolve(root, 'README.md'), 'utf8');
  const gameHtml = readFileSync(resolve(root, '开始游戏.html'), 'utf8');
  const tauriConfigPath = resolve(root, 'src-tauri/tauri.conf.json');
  const tauriCapabilityPath = resolve(root, 'src-tauri/capabilities/default.json');
  const tauriConfig = existsSync(tauriConfigPath)
    ? JSON.parse(readFileSync(tauriConfigPath, 'utf8'))
    : null;
  const tauriCapability = existsSync(tauriCapabilityPath)
    ? JSON.parse(readFileSync(tauriCapabilityPath, 'utf8'))
    : null;
  const forbiddenPermissions = ['shell:', 'fs:', 'http:', 'opener:'];
  const tauriPermissions = tauriCapability?.permissions ?? [];
  const checks = [
    ['index module entry', index.includes('type="module"') && index.includes('./src/main.js')],
    ['game module entry', game.includes('type="module"') && game.includes('./src/main.js')],
    ['35 legacy scripts retained', legacyScripts.length === 35],
    ['legacy script order boundary', legacyScripts[0] === 'src/core/util.js' && legacyScripts.at(-1) === 'src/core/selftest.js'],
    ['all script paths exist', allScriptsExist],
    ['legacy namespace retained', game.includes('src/core/selftest.js')],
    ['save key renamed with migration', store.includes('C.PREVIOUS_SAVE_KEY') && config.includes('columbina-travel/save/v2') && saveApi.includes('columbina-travel/save/v2')],
    ['manifest icon paths are relative and exist', manifestIconsExist],
    ['192px icon is a real 192x192 PNG', !!icon192 && icon192.width === 192 && icon192.height === 192],
    ['512px icon is a real 512x512 PNG', !!icon512 && icon512.width === 512 && icon512.height === 512],
    ['service worker versions and clears old caches', /CACHE_NAME\s*=\s*['"]columbina-travel-static-v\d+['"]/.test(serviceWorker) && serviceWorker.includes('caches.delete')],
    ['service worker excludes local storage and API calls', !serviceWorker.includes('localStorage') && !serviceWorker.includes('/api/')],
    ['mobile controls provide coarse-pointer touch targets', gameHtml.includes('pointer:coarse') && gameHtml.includes('min-height:44px')],
    ['README documents HTTPS PWA installation on three platforms', ['Windows / Chrome', 'Android / Chrome', 'iOS / Safari', 'HTTPS'].every((term) => readme.includes(term))],
    ['Tauri config loads Vite dist', tauriConfig?.build?.frontendDist === '../dist'],
    ['Tauri uses stable app identifier', tauriConfig?.identifier === 'com.columbina.travel'],
    ['Tauri Windows bundles include MSI and NSIS', ['msi', 'nsis'].every((target) => tauriConfig?.bundle?.targets?.includes(target))],
    ['Tauri window is resizable with safe minimum size', tauriConfig?.app?.windows?.[0]?.resizable === true && tauriConfig.app.windows[0].minWidth >= 320 && tauriConfig.app.windows[0].minHeight >= 240],
    ['Tauri capability has no network, shell, filesystem, or opener permissions', tauriPermissions.length === 1 && tauriPermissions[0] === 'core:default' && !tauriPermissions.some((permission) => forbiddenPermissions.some((prefix) => permission.startsWith(prefix)))],
    ['Tauri release notes document signing and data policy', existsSync(resolve(root, 'docs/TAURI-WINDOWS-RELEASE.md')) && ['SmartScreen', 'localStorage', 'MSI', 'NSIS'].every((term) => readFileSync(resolve(root, 'docs/TAURI-WINDOWS-RELEASE.md'), 'utf8').includes(term))]
  ];
  checks.forEach(([name, ok]) => console.log(`${ok ? 'PASS' : 'FAIL'} ${name}`));
  if (checks.some(([, ok]) => !ok)) process.exitCode = 1;
}
