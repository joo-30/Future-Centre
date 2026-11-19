import { chromium } from 'playwright';

const chromeSystem = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:/Users/makah/.gemini/antigravity/brain/c5420236-75f6-4eb0-aed5-e6d16c5e7077';

async function main() {
  const browser = await chromium.launch({ executablePath: chromeSystem, headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://127.0.0.1:5176', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  await page.screenshot({ path: `${artifactDir}/github_latest_live_1440.png`, fullPage: true });

  const hero = await page.$('.clinic-intro');
  if (hero) await hero.screenshot({ path: `${artifactDir}/github_latest_hero_1440.png` });

  const services = await page.$('.clinic-services');
  if (services) await services.screenshot({ path: `${artifactDir}/github_latest_services_1440.png` });

  console.log('Captured GitHub latest version screenshots!');
  await browser.close();
}

main().catch(console.error);
