import { defineConfig, devices } from "@playwright/test";

const PORT = 4173;
const CI = Boolean(process.env.CI);

/**
 * Browser tests of the built app (e2e/). The API and YouTube are faked inside
 * Each test (see e2e/fixtures.ts), so nothing else needs to be running and no
 * Request leaves the machine.
 */
export default defineConfig({
  testDir: "./e2e",
  // Not *.test.ts, so `bun test` (the unit tests) never picks these up.
  testMatch: "**/*.e2e.ts",
  fullyParallel: true,
  forbidOnly: CI,
  retries: CI ? 1 : 0,
  reporter: CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "desktop",
      testIgnore: "**/mobile.e2e.ts",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } },
    },
    {
      // Chromium, like desktop, so local runs and CI see the same browser.
      name: "phone",
      testMatch: "**/mobile.e2e.ts",
      use: { ...devices["Pixel 7"] },
    },
  ],
  webServer: {
    // The production build, as it ships: never the dev server.
    command: `bunx vite build && bunx vite preview --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !CI,
    timeout: 120_000,
  },
});
