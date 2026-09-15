// 存档兼容 API（第一阶段仅提供 ES Module 外观，不替换旧 src/store.js）。
export const LEGACY_SAVE_KEY = 'nahida-travel/save/v2';
export function saveGame(save, storage = globalThis.localStorage) {
  storage.setItem(LEGACY_SAVE_KEY, JSON.stringify(save)); return true;
}
export function loadGame(storage = globalThis.localStorage) {
  const raw = storage.getItem(LEGACY_SAVE_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}
export function deleteSave(storage = globalThis.localStorage) { storage.removeItem(LEGACY_SAVE_KEY); }
export function exportSave(save) { return JSON.stringify(save, null, 2); }
export function importSave(raw) {
  const value = typeof raw === 'string' ? JSON.parse(raw) : raw;
  if (!value || typeof value !== 'object') throw new TypeError('存档必须是对象');
  return value;
}
export function migrateSave(save) { return save; }
