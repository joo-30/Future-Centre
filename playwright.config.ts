import { defineConfig, chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
function browserPath() {
  const chromeSystem = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  if (fs.existsSync(chromeSystem)) return chromeSystem;
  const installed = chromium.executablePath();
  if (fs.existsSync(installed)) return installed;
  const cache = path.join(process.env.LOCALAPPDATA || '', 'ms-playwright');
  if (fs.existsSync(cache)) {
    for (const f of fs
      .readdirSync(cache)
      .filter((n) => /^chromium-\d+$/.test(n))
      .sort((a, b) => Number(b.split('-')[1]) - Number(a.split('-')[1]))) {
      for (const binary of ['chrome-win64/chrome.exe', 'chrome-win/chrome.exe']) {
        const p = path.join(cache, f, binary);
        if (fs.existsSync(p)) return p;
      }
    }
  }
  return installed;
}
export default defineConfig({
  testDir: './tests/e2e',
  globalSetup: './tests/e2e/fixtures.ts',
  globalTeardown: './tests/e2e/fixtures.ts',
  fullyParallel: false,
  workers: 1,
  timeout: 75000,
  use: {
    baseURL: 'http://127.0.0.1:5176',
    headless: true,
    launchOptions: { executablePath: browserPath() },
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  reporter: [['list'], ['html', { open: 'never' }]],
});
