import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:3312",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        launchOptions: { executablePath: "/opt/pw-browsers/chromium" },
      },
    },
  ],
  webServer: {
    command: "npm run build && npm run start -- -p 3312",
    url: "http://127.0.0.1:3312",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      ADMIN_USER: "e2e-admin",
      ADMIN_PASSWORD: "e2e-password",
    },
  },
});
