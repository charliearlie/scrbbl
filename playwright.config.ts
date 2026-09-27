import { defineConfig, devices } from "@playwright/test";

const PORT = 3111;

/**
 * End-to-end tests run against a real production build, because the things
 * worth checking here — hydration, scroll-driven CSS, a form round-tripping
 * through the database — only behave properly once built.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : [["list"]],
  timeout: 30_000,

  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },

  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["iPhone 13"] } },
  ],

  webServer: {
    command: "yarn build && yarn start",
    port: PORT,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      NODE_ENV: "production",
      PORT: String(PORT),
      // A throwaway file database per run, so tests never see real records.
      TURSO_DATABASE_URL: "file:./e2e-scrbbl.db",
      SESSION_SECRET: "e2e-session-secret",
    },
  },
});
