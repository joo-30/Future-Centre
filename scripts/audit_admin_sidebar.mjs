import { chromium } from 'playwright';
import path from 'path';

const chromeSystem = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:/Users/asus1/.gemini/antigravity/brain/737eb81e-624f-4504-b938-d04ece747f9b';

async function main() {
  const browser = await chromium.launch({ executablePath: chromeSystem, headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  console.log('Logging in as admin...');
  await page.goto('http://127.0.0.1:5176/login', { waitUntil: 'networkidle' });
  await page.click('button.role-admin');
  await page.waitForTimeout(1500);

  // 1. Dashboard active (/admin)
  console.log('Navigating to admin dashboard (/admin)...');
  await page.goto('http://127.0.0.1:5176/admin', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  const sidebar = page.locator('.console-sidebar');
  await sidebar.screenshot({
    path: path.join(ARTIFACT_DIR, 'admin_sidebar_desktop_fixed.png'),
  });
  console.log('Saved admin_sidebar_desktop_fixed.png');

  // Screenshot specifically the nav item "العملاء والاشتراكات"
  const patientsLink = page.locator('.console-sidebar nav a[href="/admin/patients"]');
  if (await patientsLink.count() > 0) {
    await patientsLink.screenshot({
      path: path.join(ARTIFACT_DIR, 'patients_nav_item_inactive.png'),
    });
    console.log('Saved patients_nav_item_inactive.png');
  }

  // 2. Navigate to /admin/patients so it becomes ACTIVE
  console.log('Navigating to /admin/patients...');
  await page.goto('http://127.0.0.1:5176/admin/patients', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  if (await patientsLink.count() > 0) {
    await patientsLink.screenshot({
      path: path.join(ARTIFACT_DIR, 'patients_nav_item_active.png'),
    });
    console.log('Saved patients_nav_item_active.png');
  }

  await sidebar.screenshot({
    path: path.join(ARTIFACT_DIR, 'admin_sidebar_patients_active.png'),
  });
  console.log('Saved admin_sidebar_patients_active.png');

  await browser.close();
  console.log('Sidebar audit completed successfully!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
