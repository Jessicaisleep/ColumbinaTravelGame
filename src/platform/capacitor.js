/* Capacitor-only lifecycle bridge. The browser/PWA path remains dependency-free. */
export async function setupCapacitorBridge() {
  if (typeof window === 'undefined' || !window.Capacitor?.isNativePlatform?.()) return false;

  const [{ App }, { StatusBar, Style }] = await Promise.all([
    import('@capacitor/app'),
    import('@capacitor/status-bar')
  ]);

  try {
    await StatusBar.setOverlaysWebView({ overlay: true });
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setBackgroundColor({ color: '#161512' });
  } catch {
    // Status bar APIs vary by Android/iOS version; CSS safe-area remains the fallback.
  }

  const saveNow = () => {
    try {
      if (window.NT?.app?.save && window.NT?.store?.save) window.NT.store.save(window.NT.app.save);
    } catch { /* lifecycle persistence must never prevent the app from resuming */ }
  };

  await App.addListener('appStateChange', ({ isActive }) => {
    if (isActive) {
      window.dispatchEvent(new Event('columbina:resume'));
      window.NT?.app?.settleIfDue?.();
      window.NT?.app?.render?.();
    } else {
      saveNow();
      window.dispatchEvent(new Event('columbina:pause'));
    }
  });

  await App.addListener('backButton', ({ canGoBack }) => {
    const app = window.NT?.app;
    if (!app) return;
    if (app.modal || app.fieldSheet) {
      app.closeModal?.();
      return;
    }
    if (app.screen && app.screen !== 'home') {
      app.go?.('home');
      return;
    }
    if (canGoBack) window.history.back();
    else App.exitApp();
  });

  // A low-memory restart can recreate the WebView without a normal pagehide.
  await App.addListener('appRestoredResult', () => {
    window.NT?.app?.settleIfDue?.();
    window.NT?.app?.render?.();
  });
  return true;
}
