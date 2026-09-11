import React from "react";
import ReactDOM from "react-dom/client";
import { initApiClient } from "@bhagirathi/api-client";
import App from "./App";
import "./index.css";
import { registerServiceWorker } from "./registerServiceWorker";

// Explicitly declare this portal's identity BEFORE any React renders or API calls.
// This ensures the shared api-client always uses maintenance_auth_token regardless
// of which port Vite assigns at startup.
initApiClient("maintenance");

// Register PWA service worker for app shell caching (active only in production)
registerServiceWorker();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);