import { chromium } from 'playwright';
import path from 'path';

const chromeSystem = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:/Users/makah/.gemini/antigravity/brain/2057bfec-2a0f-40f7-b7e0-8582b8d1ddb0';

async function main() {
  console.log('🚀 Auditing New Luxury Footer...');
  const browser = await chromium.launch({ executablePath: chromeSystem, headless: true });

  // 1. Desktop Check (1280px)
  const desktopContext = await browser.newContext({
    viewport: { width: 1280, height: 900 },
  });
  const desktopPage = await desktopContext.newPage();
  await desktopPage.goto('http://127.0.0.1:5176/', { waitUntil: 'networkidle' });
  await desktopPage.waitForTimeout(1000);

  // Scroll to footer
  await desktopPage.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await desktopPage.waitForTimeout(500);

  const desktopShot = path.join(ARTIFACT_DIR, 'verified_new_footer_desktop.png');
  const footerEl = desktopPage.locator('.site-footer');
  await footerEl.screenshot({ path: desktopShot });
  console.log(`📸 Desktop Footer Screenshot: ${desktopShot}`);

  // 2. Small Mobile Check (320px)
  const mobileContext = await browser.newContext({
    viewport: { width: 320, height: 650 },
    isMobile: true,
    hasTouch: true,
  });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto('http://127.0.0.1:5176/', { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(1000);

  const docScrollWidth = await mobilePage.evaluate(() => document.documentElement.scrollWidth);
  console.log(`📏 Mobile 320px scrollWidth: ${docScrollWidth}px (Expected: 320px)`);

  await mobilePage.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await mobilePage.waitForTimeout(500);

  const mobileShot = path.join(ARTIFACT_DIR, 'verified_new_footer_320px.png');
  const mobileFooter = mobilePage.locator('.site-footer');
  await mobileFooter.screenshot({ path: mobileShot });
  console.log(`📸 Mobile 320px Footer Screenshot: ${mobileShot}`);

  await browser.close();
  console.log('✅ Footer audit complete!');
}

main();
