import React from "react";
import ReactDOM from "react-dom/client";
import { initApiClient } from "@bhagirathi/api-client";
import App from "./App";
import "./index.css";

// Explicitly declare this portal's identity BEFORE any React renders or API calls.
// This ensures the shared api-client always uses tenant_auth_token regardless
// of which port Vite assigns at startup.
initApiClient("tenant");

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
