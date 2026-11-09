import { chromium } from 'playwright';
import path from 'path';

const chromeSystem = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:/Users/makah/.gemini/antigravity/brain/2057bfec-2a0f-40f7-b7e0-8582b8d1ddb0';

async function main() {
  console.log('🚀 Auditing Upgraded Enterprise Admin Sidebar...');
  const browser = await chromium.launch({ executablePath: chromeSystem, headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
  });
  const page = await context.newPage();

  // 1. Login
  console.log('🔑 Logging into Admin Portal via /login...');
  await page.goto('http://127.0.0.1:5176/login', { waitUntil: 'networkidle' });
  const adminBtn = await page.$('.quick-login-panel button:has-text("Admin")');
  if (adminBtn) {
    await adminBtn.click();
    await page.waitForTimeout(1000);
  } else {
    const phoneInput = page.locator('input[type="tel"]');
    if (await phoneInput.count() > 0) {
      await phoneInput.fill('01000000000');
      await page.fill('input[type="password"]', 'Admin@123456');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(1000);
    }
  }

  // 2. Go to /admin
  await page.goto('http://127.0.0.1:5176/admin', { waitUntil: 'networkidle' });
  await page.waitForSelector('.console-sidebar', { state: 'visible', timeout: 5000 });
  await page.waitForTimeout(600);

  // Measure all nav items to verify single-line text (no wrapping)
  const navItems = page.locator('.console-sidebar nav a');
  const count = await navItems.count();
  console.log(`🔢 Found ${count} navigation items in sidebar.`);

  const itemDetails = [];
  for (let i = 0; i < count; i++) {
    const item = navItems.nth(i);
    const text = (await item.innerText()).replace(/\n/g, ' ').trim();
    const box = await item.boundingBox();
    const isActive = await item.evaluate(el => el.classList.contains('active'));
    itemDetails.push({ text, isActive, height: box?.height, width: box?.width });
  }
  console.table(itemDetails);

  // Take screenshot of the sidebar specifically
  const sidebarEl = page.locator('.console-sidebar');
  const sidebarShot = path.join(ARTIFACT_DIR, 'verified_upgraded_admin_sidebar_desktop.png');
  await sidebarEl.screenshot({ path: sidebarShot });
  console.log(`📸 Desktop Sidebar Screenshot: ${sidebarShot}`);

  // Take full desktop screen
  const fullDesktopShot = path.join(ARTIFACT_DIR, 'verified_upgraded_admin_full_desktop.png');
  await page.screenshot({ path: fullDesktopShot });
  console.log(`📸 Full Desktop Screenshot: ${fullDesktopShot}`);

  await browser.close();
  console.log('✅ Sidebar verification complete!');
}

main();
