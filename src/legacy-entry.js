// 旧系统兼容层：开始游戏.html 内的普通 script 及 NT 全局命名空间暂不迁移。
// 以保证原有加载顺序、中文资源相对路径和 file:// 行为不变。
export function startLegacyEntry() {
  // index.html 原有的 location.replace 负责真正进入旧游戏页面；不重复初始化 NT.app。
  if (typeof window !== 'undefined') window.__NAHIDA_TRAVEL_LEGACY_ENTRY__ = true;
}
