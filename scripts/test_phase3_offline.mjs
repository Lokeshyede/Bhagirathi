import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

// ─────────────────────────────────────────────────────────────────────────────
// Test Suite 1: Utils Offline Detection & parseApiError
// ─────────────────────────────────────────────────────────────────────────────
test("Test Suite 1: Offline Detection & parseApiError in @bhagirathi/utils", async (t) => {
  // Load compiled utils dist
  const utilsPath = path.join(rootDir, "packages", "utils", "dist", "index.js");
  assert.ok(fs.existsSync(utilsPath), "Utils compiled bundle must exist");

  const { isNetworkOnline, parseApiError } = await import(`file://${utilsPath.replace(/\\/g, "/")}`);

  await t.test("1.1 isNetworkOnline() returns boolean", () => {
    const online = isNetworkOnline();
    assert.equal(typeof online, "boolean");
  });

  await t.test("1.2 parseApiError returns 'Internet connection required for this action.' on offline mutation error", () => {
    const offlineErr = {
      name: "OfflineMutationError",
      isOffline: true,
      message: "Internet connection required for this action.",
    };
    const msg = parseApiError(offlineErr);
    assert.equal(msg, "Internet connection required for this action.");
  });

  await t.test("1.3 parseApiError returns network failure message on ERR_NETWORK for GET", () => {
    const networkErr = {
      code: "ERR_NETWORK",
      message: "Network Error",
      config: { method: "get" },
    };
    const msg = parseApiError(networkErr);
    assert.equal(msg, "Unable to connect to server. Please check your internet connection.");
  });

  await t.test("1.4 parseApiError returns connection required on ERR_NETWORK for mutation", () => {
    const networkErr = {
      code: "ERR_NETWORK",
      message: "Network Error",
      config: { method: "post" },
    };
    const msg = parseApiError(networkErr);
    assert.equal(msg, "Internet connection required for this action.");
  });

  await t.test("1.5 parseApiError extracts standard server validation detail", () => {
    const apiErr = {
      response: {
        data: {
          detail: "Invalid room allocation",
        },
      },
    };
    const msg = parseApiError(apiErr);
    assert.equal(msg, "Invalid room allocation");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Test Suite 2: API Client Offline Mutation Guard
// ─────────────────────────────────────────────────────────────────────────────
test("Test Suite 2: API Client Offline Mutation Blocking in @bhagirathi/api-client", async (t) => {
  const apiClientPath = path.join(rootDir, "packages", "api-client", "dist", "index.js");
  assert.ok(fs.existsSync(apiClientPath), "API Client compiled bundle must exist");

  const { apiClient, OfflineMutationError } = await import(`file://${apiClientPath.replace(/\\/g, "/")}`);

  await t.test("2.1 OfflineMutationError class instantiation", () => {
    const err = new OfflineMutationError();
    assert.equal(err.name, "OfflineMutationError");
    assert.equal(err.isOffline, true);
    assert.equal(err.message, "Internet connection required for this action.");
  });

  await t.test("2.2 POST request while offline is rejected immediately without calling network", async () => {
    // Mock navigator.onLine as false using Object.defineProperty for Node 24 compatibility
    Object.defineProperty(globalThis.navigator, "onLine", {
      value: false,
      configurable: true,
      writable: true,
    });

    let networkCalled = false;
    // Create an adapter that tracks if a request was actually attempted
    const originalAdapter = apiClient.defaults.adapter;
    apiClient.defaults.adapter = async (config) => {
      networkCalled = true;
      return { data: {}, status: 200, statusText: "OK", headers: {}, config };
    };

    try {
      await apiClient.post("/api/v1/payments/submit", { amount: 5000 });
      assert.fail("POST request while offline should have rejected");
    } catch (err) {
      assert.equal(networkCalled, false, "Network must NEVER be called when offline!");
      assert.equal(err.message, "Internet connection required for this action.");
      assert.equal(err.isOffline, true);
      assert.equal(err.response?.data?.detail, "Internet connection required for this action.");
    } finally {
      apiClient.defaults.adapter = originalAdapter;
    }
  });

  await t.test("2.3 PUT, PATCH, DELETE requests while offline are rejected immediately", async () => {
    Object.defineProperty(globalThis.navigator, "onLine", {
      value: false,
      configurable: true,
      writable: true,
    });

    const methods = ["put", "patch", "delete"];
    for (const method of methods) {
      let networkCalled = false;
      const originalAdapter = apiClient.defaults.adapter;
      apiClient.defaults.adapter = async (config) => {
        networkCalled = true;
        return { data: {}, status: 200, statusText: "OK", headers: {}, config };
      };

      try {
        await apiClient[method]("/api/v1/tenants/123", {});
        assert.fail(`${method.toUpperCase()} request while offline should have rejected`);
      } catch (err) {
        assert.equal(networkCalled, false, `Network must NEVER be called for ${method.toUpperCase()} when offline!`);
        assert.equal(err.message, "Internet connection required for this action.");
        assert.equal(err.isOffline, true);
      } finally {
        apiClient.defaults.adapter = originalAdapter;
      }
    }
  });

  await t.test("2.4 When online, requests pass through to the network adapter", async () => {
    Object.defineProperty(globalThis.navigator, "onLine", {
      value: true,
      configurable: true,
      writable: true,
    });

    let networkCalled = false;
    const originalAdapter = apiClient.defaults.adapter;
    apiClient.defaults.adapter = async (config) => {
      networkCalled = true;
      return { data: { success: true }, status: 200, statusText: "OK", headers: {}, config };
    };

    try {
      const res = await apiClient.post("/api/v1/test", { online: true });
      assert.equal(networkCalled, true, "Network adapter should be called when online");
      assert.equal(res.data.success, true);
    } finally {
      apiClient.defaults.adapter = originalAdapter;
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Test Suite 3: Service Worker Safety Verification
// ─────────────────────────────────────────────────────────────────────────────
test("Test Suite 3: Service Worker Architecture & Safety across Admin, Tenant, Maintenance", async (t) => {
  const swPaths = [
    { app: "Admin", path: path.join(rootDir, "apps", "admin", "public", "sw.js") },
    { app: "Tenant", path: path.join(rootDir, "apps", "tenant", "public", "sw.js") },
    { app: "Maintenance", path: path.join(rootDir, "apps", "maintenance", "public", "sw.js") },
  ];

  for (const { app, path: swFile } of swPaths) {
    await t.test(`3.${app}: Service Worker in ${app} satisfies all Phase 1, 2, and 3 constraints`, () => {
      assert.ok(fs.existsSync(swFile), `${app} sw.js must exist`);
      const swContent = fs.readFileSync(swFile, "utf-8");

      // 1. Cache name updated deliberately to v2
      assert.ok(swContent.includes("bhagirathi-shell-v2"), `${app} sw.js must use bhagirathi-shell-v2`);

      // 2. Safe cache cleanup: removes only bhagirathi-shell-* and keeps unrelated caches
      assert.ok(
        swContent.includes("cacheName.startsWith('bhagirathi-shell-')"),
        `${app} sw.js must selectively clean only Bhagirathi shell caches`
      );

      // 3. GET-only filter: never intercept or queue non-GET business mutations
      assert.ok(
        swContent.includes("request.method !== 'GET'"),
        `${app} sw.js must bypass non-GET requests immediately`
      );

      // 4. Strict API bypass: never intercept or cache backend API or Auth
      assert.ok(
        swContent.includes("url.pathname.startsWith('/api')") ||
        swContent.includes("url.pathname.includes('/auth/')"),
        `${app} sw.js must bypass /api and /auth/`
      );
      assert.ok(
        swContent.includes("request.headers.has('Authorization')"),
        `${app} sw.js must bypass Authorization headers`
      );

      // 5. App shell navigation fallback
      assert.ok(
        swContent.includes("request.mode === 'navigate'"),
        `${app} sw.js must handle navigate requests with network-first`
      );
      assert.ok(
        swContent.includes("caches.match('/index.html')"),
        `${app} sw.js must fall back to /index.html when offline`
      );

      // 6. Phase 2 Web Push notification handler preserved intact
      assert.ok(
        swContent.includes("self.addEventListener('push'"),
        `${app} sw.js must retain push event handler`
      );
      assert.ok(
        swContent.includes("self.registration.showNotification"),
        `${app} sw.js must show notifications on push`
      );

      // 7. Phase 2 Notification click handler preserved intact
      assert.ok(
        swContent.includes("self.addEventListener('notificationclick'"),
        `${app} sw.js must retain notificationclick event handler`
      );
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Test Suite 4: UI Components & App Shell Integration
// ─────────────────────────────────────────────────────────────────────────────
test("Test Suite 4: Global Offline Indicator Mounted in Apps", async (t) => {
  const appPaths = [
    { app: "Admin", file: path.join(rootDir, "apps", "admin", "src", "App.tsx") },
    { app: "Tenant", file: path.join(rootDir, "apps", "tenant", "src", "App.tsx") },
    { app: "Maintenance", file: path.join(rootDir, "apps", "maintenance", "src", "App.tsx") },
  ];

  for (const { app, file } of appPaths) {
    await t.test(`4.${app}: OfflineIndicator is mounted in ${app} App.tsx`, () => {
      assert.ok(fs.existsSync(file), `${app} App.tsx must exist`);
      const content = fs.readFileSync(file, "utf-8");

      assert.ok(
        content.includes("OfflineIndicator"),
        `${app} App.tsx must import and render OfflineIndicator`
      );
      assert.ok(
        content.includes("<OfflineIndicator"),
        `${app} App.tsx must include <OfflineIndicator /> component`
      );
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Test Suite 5: Security Audit Constraints
// ─────────────────────────────────────────────────────────────────────────────
test("Test Suite 5: Security & Anti-Pattern Audit", async (t) => {
  const swFiles = [
    path.join(rootDir, "apps", "admin", "public", "sw.js"),
    path.join(rootDir, "apps", "tenant", "public", "sw.js"),
    path.join(rootDir, "apps", "maintenance", "public", "sw.js"),
  ];

  for (const swFile of swFiles) {
    const content = fs.readFileSync(swFile, "utf-8");

    // SW must NOT touch IndexedDB or queue requests
    assert.ok(!content.includes("indexedDB"), "Service worker must not use indexedDB for mutation queueing");
    assert.ok(!content.includes("sync"), "Service worker must not register background sync for mutations");
    assert.ok(!content.includes("offlineQueue"), "Service worker must not implement offline queue");
  }

  // Verify UI package components exist
  const offlineComponentsPath = path.join(rootDir, "packages", "ui", "src", "components", "offline");
  assert.ok(fs.existsSync(path.join(offlineComponentsPath, "useNetworkStatus.ts")), "useNetworkStatus.ts exists");
  assert.ok(fs.existsSync(path.join(offlineComponentsPath, "OfflineIndicator.tsx")), "OfflineIndicator.tsx exists");
  assert.ok(fs.existsSync(path.join(offlineComponentsPath, "OfflineNotice.tsx")), "OfflineNotice.tsx exists");
});
