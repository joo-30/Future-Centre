import path from 'node:path';
import { chromium } from '@playwright/test';

const chromeSystem = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:/Users/asus1/.gemini/antigravity/brain/737eb81e-624f-4504-b938-d04ece747f9b';

async function main() {
  const browser = await chromium.launch({ executablePath: chromeSystem, headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });

  console.log('Logging in as admin...');
  await page.goto('http://127.0.0.1:5176/login', { waitUntil: 'networkidle' });
  await page.click('button.role-admin');
  await page.waitForTimeout(1500);

  // 1. Admin Programs
  console.log('Navigating to admin programs...');
  await page.goto('http://127.0.0.1:5176/admin/programs', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  const progGrid = page.locator('.prog-cards-grid');
  if (await progGrid.count() > 0) {
    await progGrid.screenshot({
      path: path.join(ARTIFACT_DIR, 'verify_admin_programs_nostar.png'),
    });
    console.log('Saved verify_admin_programs_nostar.png');
  }

  // 2. Admin Dashboard
  console.log('Navigating to admin dashboard...');
  await page.goto('http://127.0.0.1:5176/admin', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  const pulse = page.locator('.daily-pulse-container');
  if (await pulse.count() > 0) {
    await pulse.screenshot({
      path: path.join(ARTIFACT_DIR, 'verify_admin_pulse_activity.png'),
    });
    console.log('Saved verify_admin_pulse_activity.png');
  }

  await browser.close();
  console.log('Admin verification completed!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
