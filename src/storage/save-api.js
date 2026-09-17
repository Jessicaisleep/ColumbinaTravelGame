// 存档兼容 API（第一阶段仅提供 ES Module 外观，不替换旧 src/store.js）。
export const SAVE_KEY = 'columbina-travel/save/v2';
const PREVIOUS_SAVE_KEY = ['nahida', 'travel/save/v2'].join('-');
export function saveGame(save, storage = globalThis.localStorage) {
  storage.setItem(SAVE_KEY, JSON.stringify(save)); return true;
}
export function loadGame(storage = globalThis.localStorage) {
  const currentRaw = storage.getItem(SAVE_KEY);
  const previousRaw = currentRaw ? null : storage.getItem(PREVIOUS_SAVE_KEY);
  const raw = currentRaw || previousRaw;
  if (!raw) return null;
  try {
    const value = JSON.parse(raw);
    if (!currentRaw && previousRaw) storage.setItem(SAVE_KEY, raw);
    return value;
  } catch { return null; }
}
export function deleteSave(storage = globalThis.localStorage) {
  storage.removeItem(SAVE_KEY);
  storage.removeItem(PREVIOUS_SAVE_KEY);
}
export function exportSave(save) { return JSON.stringify(save, null, 2); }
export function importSave(raw) {
  const value = typeof raw === 'string' ? JSON.parse(raw) : raw;
  if (!value || typeof value !== 'object') throw new TypeError('存档必须是对象');
  return value;
}
export function migrateSave(save) { return save; }
