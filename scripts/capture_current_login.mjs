import { chromium } from 'playwright';
import path from 'path';

const chromeSystem = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:/Users/makah/.gemini/antigravity/brain/2057bfec-2a0f-40f7-b7e0-8582b8d1ddb0';

async function main() {
  const browser = await chromium.launch({ executablePath: chromeSystem, headless: true });

  // Desktop
  const page = await browser.newPage({ viewport: { width: 1366, height: 768 } });
  await page.goto('http://127.0.0.1:5176/login', { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'current_login_desktop.png') });
  console.log('Saved current_login_desktop.png');

  // Mobile
  const mobilePage = await browser.newPage({
    viewport: { width: 375, height: 812 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true
  });
  await mobilePage.goto('http://127.0.0.1:5176/login', { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(600);
  await mobilePage.screenshot({ path: path.join(ARTIFACT_DIR, 'current_login_mobile.png') });
  console.log('Saved current_login_mobile.png');

  await browser.close();
}

main().catch(console.error);
