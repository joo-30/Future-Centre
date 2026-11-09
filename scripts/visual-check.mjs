import { existsSync } from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';
let binary = chromium.executablePath();
if (!existsSync(binary)) {
  const cache = path.join(process.env.LOCALAPPDATA || '', 'ms-playwright');
  for (const f of (await fs.readdir(cache))
    .filter((n) => /^chromium-\d+$/.test(n))
    .sort((a, b) => Number(b.split('-')[1]) - Number(a.split('-')[1]))) {
    const candidate = path.join(cache, f, 'chrome-win64', 'chrome.exe');
    if (existsSync(candidate)) {
      binary = candidate;
      break;
    }
  }
}
await fs.mkdir('artifacts', { recursive: true });
const browser = await chromium.launch({ executablePath: binary, headless: true });
const checks = [];
for (const [width, route, name] of [
  [1440, '/', 'home-desktop'],
  [390, '/', 'home-mobile'],
  [1440, '/booking', 'booking-desktop'],
  [390, '/booking', 'booking-mobile'],
  [390, '/programs', 'programs-mobile'],
  [1440, '/contact', 'contact-desktop'],
]) {
  const page = await browser.newPage({ viewport: { width, height: 950 }, deviceScaleFactor: 1 });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('http://127.0.0.1:5176' + route);
  await page.waitForSelector('main h1');
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => document.querySelectorAll('img').forEach((i) => (i.loading = 'eager')));
  await page.waitForFunction(() => Array.from(document.images).every((i) => i.complete));
  if (route === '/booking') {
    const options = page.locator('.days .day');
    for (let i = 0; i < (await options.count()); i++) {
      if ((await options.nth(i).textContent()).includes('مغلق')) continue;
      await options.nth(i).click();
      await page.waitForTimeout(250);
      const available = page.locator('.times button:not(:disabled)');
      if (await available.count()) {
        await available.first().click();
        break;
      }
    }
  }
  await page.screenshot({ path: `artifacts/${name}.png`, fullPage: true });
  checks.push({
    name,
    width,
    errors,
    ...(await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth > innerWidth,
      fonts: document.fonts.check('18px Plex') && document.fonts.check('30px Alex'),
      missingImages: Array.from(document.images).filter((i) => !i.naturalWidth).length,
    }))),
  });
  await page.close();
}
await fs.writeFile('artifacts/visual-report.json', JSON.stringify(checks, null, 2));
console.log(JSON.stringify(checks, null, 2));
await browser.close();
