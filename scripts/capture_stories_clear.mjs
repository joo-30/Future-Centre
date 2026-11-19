import { chromium } from 'playwright';

const chromeSystem = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:/Users/makah/.gemini/antigravity/brain/c5420236-75f6-4eb0-aed5-e6d16c5e7077';

async function main() {
  const browser = await chromium.launch({ executablePath: chromeSystem, headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
  await page.goto('http://127.0.0.1:5176', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Scroll to stories section
  await page.evaluate(() => {
    const el = document.querySelector('.transformations-block');
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
  });
  await page.waitForTimeout(500);

  const block = await page.$('.transformations-block');
  if (block) {
    await block.screenshot({ path: `${artifactDir}/some_clients_3cards_clear_1440.png` });
  }

  console.log('Saved some_clients_3cards_clear_1440.png');
  await browser.close();
}

main().catch(console.error);
