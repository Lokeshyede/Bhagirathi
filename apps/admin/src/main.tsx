import React from "react";
import ReactDOM from "react-dom/client";
import { initApiClient } from "@bhagirathi/api-client";
import App from "./App";
import "./index.css";
import { registerServiceWorker } from "./registerServiceWorker";

// Explicitly declare this portal's identity BEFORE any React renders or API calls.
// This ensures the shared api-client always uses admin_auth_token regardless
// of which port Vite assigns at startup.
initApiClient("admin");

// Register PWA service worker for app shell caching (active only in production)
registerServiceWorker();

// Handle notification-click navigation from the service worker.
// When WindowClient.navigate() is unavailable (Safari iOS/macOS), the SW sends
// a NAVIGATE postMessage. This listener performs the actual route change.
if (typeof window !== "undefined" && "serviceWorker" in navigator) {
  navigator.serviceWorker.addEventListener("message", (event: MessageEvent) => {
    if (event.data?.type === "NAVIGATE" && typeof event.data?.url === "string") {
      window.location.href = event.data.url;
    }
  });
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);