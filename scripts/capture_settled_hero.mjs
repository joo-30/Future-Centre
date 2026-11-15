import { chromium } from 'playwright';
import path from 'path';

const chromeSystem = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:/Users/makah/.gemini/antigravity/brain/e2976ba3-c954-4b1f-8cdb-775aa48d6049';

async function main() {
  const browser = await chromium.launch({ executablePath: chromeSystem, headless: true });

  // 1. Mobile 360px Full Hero Section
  {
    const page = await browser.newPage({ viewport: { width: 360, height: 800 }, deviceScaleFactor: 2 });
    await page.goto('http://127.0.0.1:5176/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2500); // Wait for all entrance animations to fully complete

    // Screenshot top
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'mobile360_hero_top_settled.png') });

    // Scroll to doctor card
    const docCard = page.locator('.hero-doctor-showcase');
    if (await docCard.count() > 0) {
      await docCard.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
      await docCard.screenshot({ path: path.join(ARTIFACT_DIR, 'mobile360_doctor_card_settled.png') });
    }

    // Check horizontal overflow
    const overflow = await page.evaluate(() => {
      return {
        bodyScrollWidth: document.body.scrollWidth,
        windowInnerWidth: window.innerWidth,
        hasHorizontalScroll: document.body.scrollWidth > window.innerWidth
      };
    });
    console.log('Mobile 360 overflow:', overflow);
  }

  // 2. Desktop 1440px Settled
  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto('http://127.0.0.1:5176/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2500);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'desktop1440_hero_settled.png') });
  }

  await browser.close();
}

main().catch(console.error);
