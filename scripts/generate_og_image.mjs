import { chromium } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const chromeSystem = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function main() {
  const browser = await chromium.launch({
    executablePath: chromeSystem,
    headless: true,
  });

  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
  });

  const htmlPath = path.resolve(__dirname, 'og-card-template.html');
  await page.goto('file:///' + htmlPath.replace(/\\/g, '/'));
  await page.waitForLoadState('networkidle');
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(600);

  const outJpg = path.resolve(__dirname, '../client/public/assets/og-card.jpg');
  const outPng = path.resolve(__dirname, '../client/public/assets/og-card.png');
  const outBrain = 'C:/Users/makah/.gemini/antigravity/brain/2057bfec-2a0f-40f7-b7e0-8582b8d1ddb0/og-card-preview.png';

  // Screenshot specifically the body or clip to 1200x630
  await page.screenshot({ path: outJpg, type: 'jpeg', quality: 95, clip: { x: 0, y: 0, width: 1200, height: 630 } });
  await page.screenshot({ path: outPng, type: 'png', clip: { x: 0, y: 0, width: 1200, height: 630 } });
  await page.screenshot({ path: outBrain, type: 'png', clip: { x: 0, y: 0, width: 1200, height: 630 } });

  console.log('Successfully captured clipped OpenGraph preview cards:');
  console.log('1:', outJpg);
  console.log('2:', outPng);
  console.log('3:', outBrain);

  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
