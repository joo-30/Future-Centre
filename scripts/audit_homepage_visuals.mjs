import { chromium } from 'playwright';
import path from 'path';

const chromeSystem = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:/Users/asus1/.gemini/antigravity/brain/737eb81e-624f-4504-b938-d04ece747f9b';

async function main() {
  const browser = await chromium.launch({ executablePath: chromeSystem, headless: true });

  // Desktop 1440
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://127.0.0.1:5176/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Scroll through page to trigger any lazy loaders/animations
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 400;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;
        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });

  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);

  // Capture Hero section
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'home_hero_audit.png'), clip: { x: 0, y: 0, width: 1440, height: 900 } });
  console.log('Saved home_hero_audit.png');

  // Capture Full Page
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'home_full_page_audit.png'), fullPage: true });
  console.log('Saved home_full_page_audit.png');

  // Mobile 390
  const mobilePage = await browser.newPage({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true
  });
  await mobilePage.goto('http://127.0.0.1:5176/', { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(800);
  await mobilePage.screenshot({ path: path.join(ARTIFACT_DIR, 'home_mobile_hero_audit.png'), clip: { x: 0, y: 0, width: 390, height: 844 } });
  console.log('Saved home_mobile_hero_audit.png');

  await browser.close();
}

main().catch(console.error);
