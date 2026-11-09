import { chromium } from 'playwright';
import path from 'path';

const chromeSystem = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:/Users/makah/.gemini/antigravity/brain/2057bfec-2a0f-40f7-b7e0-8582b8d1ddb0';

async function main() {
  console.log('🚀 Verifying Mobile Drawer Sidebar...');
  const browser = await chromium.launch({ executablePath: chromeSystem, headless: true });
  const page = await browser.newPage({
    viewport: { width: 375, height: 812 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true
  });

  await page.goto('http://127.0.0.1:5176/login');
  await page.click('.quick-login-panel button:has-text("Admin")');
  await page.waitForURL('**/admin**');
  await page.waitForTimeout(800);

  // Click mobile hamburger menu in topbar
  const burgerBtn = page.locator('.console-topbar button.console-mobile');
  console.log('Clicking topbar burger button...');
  await burgerBtn.click();
  await page.waitForTimeout(600);

  // Check if sidebar has is-open class
  const sidebar = page.locator('.console-sidebar');
  const isOpen = await sidebar.evaluate(el => el.classList.contains('is-open'));
  console.log('Sidebar is-open class:', isOpen);

  const sidebarVisible = await sidebar.isVisible();
  console.log('Sidebar is visible:', sidebarVisible);

  const shot = path.join(ARTIFACT_DIR, 'verified_mobile_drawer_open.png');
  await page.screenshot({ path: shot });
  console.log('Saved screenshot of mobile drawer open:', shot);

  await browser.close();
  console.log('✅ Mobile drawer check complete!');
}

main().catch(console.error);
