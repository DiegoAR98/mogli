import { defineConfig, devices } from '@playwright/test';
import { existsSync } from 'node:fs';

// This dev sandbox cannot download playwright-core's pinned Chromium build (network policy),
// but ships a pre-installed browser at this path (see README.md "Local dev sandbox" note).
// CI (.github/workflows/ci.yml) runs `playwright install --with-deps chromium` normally and
// this path will not exist there, so the override is skipped and Playwright picks its own build.
const sandboxChromiumPath = '/opt/pw-browsers/chromium';
const chromiumExecutablePath = process.env.PLAYWRIGHT_CHROMIUM_PATH ?? (existsSync(sandboxChromiumPath) ? sandboxChromiumPath : undefined);

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 60000,
  webServer: {
    command: 'npm run build && npm run preview',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    env: { VITE_E2E: '1' },
  },
  expect: {
    toHaveScreenshot: { maxDiffPixelRatio: 0.03 },
  },
  use: {
    baseURL: 'http://localhost:4173',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          ...(chromiumExecutablePath ? { executablePath: chromiumExecutablePath } : {}),
          args: ['--use-gl=swiftshader'],
        },
      },
    },
  ],
});
