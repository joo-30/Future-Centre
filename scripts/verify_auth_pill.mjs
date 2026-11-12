import { chromium } from 'playwright';
import path from 'path';

const chromeSystem = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:/Users/asus1/.gemini/antigravity/brain/737eb81e-624f-4504-b938-d04ece747f9b';

async function main() {
  const browser = await chromium.launch({ executablePath: chromeSystem, headless: true });

  // 1. Desktop 1280
  {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    await page.goto('http://127.0.0.1:5176/login', { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);
    const topBar = await page.$('.access-top');
    if (topBar) {
      await topBar.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_login_pill_desktop.png') });
      console.log('Saved verify_login_pill_desktop.png');
    }
  }

  // 2. Mobile 375
  {
    const mobilePage = await browser.newPage({
      viewport: { width: 375, height: 812 },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true
    });
    await mobilePage.goto('http://127.0.0.1:5176/login', { waitUntil: 'networkidle' });
    await mobilePage.waitForTimeout(600);
    const topBar = await mobilePage.$('.access-top');
    if (topBar) {
      await topBar.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_login_pill_mobile.png') });
      console.log('Saved verify_login_pill_mobile.png');
    }
    await mobilePage.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_login_page_mobile.png') });
    console.log('Saved verify_login_page_mobile.png');
  }

  await browser.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
