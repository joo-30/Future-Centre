import { chromium } from 'playwright';

const chromeSystem = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function main() {
  const browser = await chromium.launch({ executablePath: chromeSystem, headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto('http://127.0.0.1:5176/login', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  const shotPath = 'C:/Users/makah/.gemini/antigravity/brain/e2976ba3-c954-4b1f-8cdb-775aa48d6049/actual_live_production_1366.png';
  await page.screenshot({ path: shotPath });
  console.log('Saved actual live production screenshot:', shotPath);

  await browser.close();
}

main().catch(console.error);
