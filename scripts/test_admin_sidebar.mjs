import { chromium } from 'playwright';
import path from 'path';

const chromeSystem = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:/Users/makah/.gemini/antigravity/brain/2057bfec-2a0f-40f7-b7e0-8582b8d1ddb0';

async function main() {
  const browser = await chromium.launch({ executablePath: chromeSystem, headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  console.log('Navigating to /login...');
  await page.goto('http://127.0.0.1:5176/login', { waitUntil: 'networkidle' });

  // Quick admin login button
  const quickAdminBtn = page.locator('.quick-login-panel button:has-text("Admin")');
  await quickAdminBtn.waitFor({ state: 'visible', timeout: 5000 });
  console.log('Clicking quick login Admin...');
  await quickAdminBtn.click();

  // Wait for redirect to /admin
  await page.waitForURL('**/admin**', { timeout: 10000 });
  await page.waitForTimeout(1000);

  console.log('Current URL:', page.url());
  const sidebar = page.locator('.console-sidebar');
  await sidebar.waitFor({ state: 'visible', timeout: 5000 });

  // Check sidebar width & computed styles
  const sidebarInfo = await page.evaluate(() => {
    const s = document.querySelector('.console-sidebar');
    const cs = getComputedStyle(s);
    const navItems = Array.from(document.querySelectorAll('.console-sidebar nav a')).map(a => {
      const span = a.querySelector('.nav-item-label');
      return {
        text: span?.innerText,
        height: a.offsetHeight,
        width: a.offsetWidth,
      };
    });
    return {
      sidebarWidth: cs.width,
      sidebarBackground: cs.background,
      navItems,
    };
  });

  console.log('Sidebar Info:', JSON.stringify(sidebarInfo, null, 2));

  const shot = path.join(ARTIFACT_DIR, 'verified_upgraded_admin_sidebar_desktop.png');
  await sidebar.screenshot({ path: shot });
  console.log('Saved screenshot:', shot);

  const fullShot = path.join(ARTIFACT_DIR, 'verified_upgraded_admin_full_desktop.png');
  await page.screenshot({ path: fullShot });
  console.log('Saved full screenshot:', fullShot);

  await browser.close();
  console.log('✅ Sidebar verification complete!');
}

main();
