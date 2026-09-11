/**
 * Register Service Worker in production for PWA App Shell caching.
 * Registration is non-blocking and will not delay app bootstrap, login, or API calls.
 */
export function registerServiceWorker(): void {
  const isProd = Boolean((import.meta as any).env?.PROD);
  if (isProd && typeof window !== "undefined" && "serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .then((registration) => {
          registration.onupdatefound = () => {
            const installingWorker = registration.installing;
            if (installingWorker) {
              installingWorker.onstatechange = () => {
                if (installingWorker.state === "installed") {
                  if (navigator.serviceWorker.controller) {
                    console.info("[PWA] New version available; will update on next visit.");
                  } else {
                    console.info("[PWA] Application shell cached for offline use.");
                  }
                }
              };
            }
          };
        })
        .catch((error) => {
          console.warn("[PWA] Service worker registration failed:", error);
        });
    });
  }
}