import { chromium } from 'playwright';
import path from 'path';

const chromeSystem = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const outDir = 'C:\\Users\\makah\\.gemini\\antigravity\\brain\\e2976ba3-c954-4b1f-8cdb-775aa48d6049';

async function main() {
  const browser = await chromium.launch({ executablePath: chromeSystem, headless: true });

  const viewports = [
    { name: 'desktop_1440', width: 1440, height: 900 },
    { name: 'laptop_1280', width: 1280, height: 800 },
    { name: 'tablet_768', width: 768, height: 1024 },
    { name: 'mobile_375', width: 375, height: 812 },
    { name: 'mobile_360', width: 360, height: 780 },
    { name: 'mobile_320', width: 320, height: 650 },
  ];

  for (const vp of viewports) {
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    page.on('pageerror', err => errors.push(err.message));

    await page.goto('http://127.0.0.1:5176/login', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    const shotPath = path.join(outDir, `verify_auth_${vp.name}.png`);
    await page.screenshot({ path: shotPath, fullPage: vp.width < 920 });
    console.log(`Saved screenshot: ${shotPath} | Errors: ${errors.length}`);
    await page.close();
  }

  await browser.close();
  console.log('All viewports captured successfully!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
