// 新资源层的只读登记表（第一阶段）。旧 assets/manifest.js 继续负责实际加载。
export const legacyAssetManifestPath = 'assets/manifest.js';
export const assetRegistry = Object.freeze({
  manifest: legacyAssetManifestPath,
  groups: Object.freeze(['backgrounds', 'nahida', 'companions', 'toys', 'icons', 'stickers'])
});
