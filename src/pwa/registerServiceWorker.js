// PWA 能力的安全占位：file:// 下不注册，浏览器不支持时静默跳过。
export function registerServiceWorker() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
  // Vite 开发服务器不注册，避免缓存干扰热更新；生产构建在 localhost/HTTPS 下注册。
  if (import.meta.env?.DEV) return;
  if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') return;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js', { scope: './' }).catch(() => {});
  }, { once: true });
}
