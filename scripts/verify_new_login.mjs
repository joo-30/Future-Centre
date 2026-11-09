import { chromium } from 'playwright';
import path from 'path';

const chromeSystem = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:/Users/makah/.gemini/antigravity/brain/2057bfec-2a0f-40f7-b7e0-8582b8d1ddb0';

async function main() {
  const browser = await chromium.launch({ executablePath: chromeSystem, headless: true });

  // 1. Desktop 1366
  {
    const page = await browser.newPage({ viewport: { width: 1366, height: 768 } });
    await page.goto('http://127.0.0.1:5176/login', { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'new_login_desktop_1366.png'), fullPage: true });
    console.log('Saved new_login_desktop_1366.png');
  }

  // 2. Desktop 1440
  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto('http://127.0.0.1:5176/login', { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'new_login_desktop_1440.png') });
    console.log('Saved new_login_desktop_1440.png');
  }

  // 3. Tablet 768
  {
    const page = await browser.newPage({ viewport: { width: 768, height: 1024 } });
    await page.goto('http://127.0.0.1:5176/login', { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'new_login_tablet_768.png') });
    console.log('Saved new_login_tablet_768.png');
  }

  // 4. Mobile 375
  {
    const mobilePage = await browser.newPage({
      viewport: { width: 375, height: 812 },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true
    });
    await mobilePage.goto('http://127.0.0.1:5176/login', { waitUntil: 'networkidle' });
    await mobilePage.waitForTimeout(600);
    await mobilePage.screenshot({ path: path.join(ARTIFACT_DIR, 'new_login_mobile_375.png') });
    console.log('Saved new_login_mobile_375.png');
  }

  // 5. Mobile 320
  {
    const mobilePage = await browser.newPage({
      viewport: { width: 320, height: 650 },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true
    });
    await mobilePage.goto('http://127.0.0.1:5176/login', { waitUntil: 'networkidle' });
    await mobilePage.waitForTimeout(600);
    await mobilePage.screenshot({ path: path.join(ARTIFACT_DIR, 'new_login_mobile_320.png') });
    console.log('Saved new_login_mobile_320.png');
  }

  // 6. Register Mode Desktop
  {
    const page = await browser.newPage({ viewport: { width: 1366, height: 768 } });
    await page.goto('http://127.0.0.1:5176/register', { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'new_register_desktop.png') });
    console.log('Saved new_register_desktop.png');
  }

  // 7. Recover Mode Desktop
  {
    const page = await browser.newPage({ viewport: { width: 1366, height: 768 } });
    await page.goto('http://127.0.0.1:5176/recover', { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'new_recover_desktop.png') });
    console.log('Saved new_recover_desktop.png');
  }

  await browser.close();
}

main().catch(console.error);
