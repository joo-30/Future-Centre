import { chromium } from '@playwright/test';

const chromeSystem = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function main() {
  const browser = await chromium.launch({
    executablePath: chromeSystem,
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 950 },
    locale: 'ar-EG',
  });

  const page = await context.newPage();

  // Quick Login as Admin
  await page.goto('http://127.0.0.1:5176/login');
  await page.waitForLoadState('networkidle');

  const adminQuickBtn = page.locator('button:has-text("Admin")');
  await adminQuickBtn.click();
  await page.waitForURL('**/admin', { timeout: 15000 });
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  // 1. Check DatePicker in Admin Appointments
  await page.goto('http://127.0.0.1:5176/admin/appointments');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  const trigger = page.locator('.custom-datepicker-trigger');
  await trigger.scrollIntoViewIfNeeded();
  await trigger.click();
  await page.waitForTimeout(600);

  await page.screenshot({
    path: 'C:/Users/makah/.gemini/antigravity/brain/c5a2d578-79e0-4272-a5fc-e64001de35e9/datepicker_working_final.png',
    fullPage: false,
  });
  console.log('Saved datepicker_working_final.png');

  // Select a day (e.g. 15)
  const dayBtn = page.locator('.custom-datepicker-popup .day-cell.in-month').filter({ hasText: '15' }).first();
  if (await dayBtn.isVisible()) {
    await dayBtn.click();
    await page.waitForTimeout(500);
    await page.screenshot({
      path: 'C:/Users/makah/.gemini/antigravity/brain/c5a2d578-79e0-4272-a5fc-e64001de35e9/datepicker_date_selected.png',
      fullPage: false,
    });
    console.log('Saved datepicker_date_selected.png');
  }

  // 2. Check Patients tab for clean cards (single WhatsApp button, clean avatar)
  await page.goto('http://127.0.0.1:5176/admin/patients');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  await page.screenshot({
    path: 'C:/Users/makah/.gemini/antigravity/brain/c5a2d578-79e0-4272-a5fc-e64001de35e9/admin_patients_final_clean.png',
    fullPage: false,
  });
  console.log('Saved admin_patients_final_clean.png');

  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
