import { defineConfig, devices } from "@playwright/test";

const PORT = process.env.PORT ?? "3000";
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "list",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      // Playwright iPhone SE is 320×568; override to 375×667 for M0 baseline.
      // Force Chromium: postinstall only installs chromium (not WebKit).
      name: "mobile-375",
      use: {
        ...devices["iPhone SE"],
        browserName: "chromium",
        viewport: { width: 375, height: 667 },
      },
    },
    {
      name: "mobile-393",
      use: {
        ...devices["iPhone 14 Pro"],
        browserName: "chromium",
      },
    },
    {
      name: "mobile-412",
      use: { ...devices["Pixel 7"] },
    },
    {
      name: "tablet-768",
      use: { viewport: { width: 768, height: 1024 } },
    },
    {
      name: "tablet-1024",
      use: { viewport: { width: 1024, height: 1366 } },
    },
  ],
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command:
          "NEXT_PUBLIC_API_MOCKING=enabled npm run build && NEXT_PUBLIC_API_MOCKING=enabled npm run start",
        url: baseURL,
        reuseExistingServer: true,
        timeout: 300_000,
      },
});
