import { chromium } from 'playwright';

const chromeSystem = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:/Users/makah/.gemini/antigravity/brain/c5420236-75f6-4eb0-aed5-e6d16c5e7077';

async function main() {
  const browser = await chromium.launch({ executablePath: chromeSystem, headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  // 1. Login as admin
  await page.goto('http://127.0.0.1:5176/login', { waitUntil: 'networkidle' });
  await page.waitForSelector('.quick-login-btn.role-admin', { timeout: 10000 });
  await page.click('.quick-login-btn.role-admin');
  await page.waitForTimeout(1500);

  // 2. Go to Patients page
  await page.goto('http://127.0.0.1:5176/admin/patients', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);

  // Click 'روشتة وبرنامج غذائي'
  const rxBtn = await page.waitForSelector('button:has-text("روشتة وبرنامج غذائي")', { timeout: 10000 });
  await rxBtn.click();
  await page.waitForTimeout(800);

  // Check if modal container is open
  const modalContainer = await page.waitForSelector('.prescription-modal-container', { timeout: 10000 });
  if (modalContainer) {
    console.log('Modal opened successfully!');
    await page.screenshot({ path: `${artifactDir}/prescription_modal_top.png` });
    console.log('Saved prescription_modal_top.png');

    // Scroll down inside the modal container
    await page.evaluate(() => {
      const el = document.querySelector('.prescription-modal-container');
      if (el) el.scrollTop = el.scrollHeight;
    });
    await page.waitForTimeout(600);
    await page.screenshot({ path: `${artifactDir}/prescription_modal_scrolled_bottom.png` });
    console.log('Saved prescription_modal_scrolled_bottom.png');

    // Scroll to middle (meals section)
    await page.evaluate(() => {
      const el = document.querySelector('.prescription-modal-container');
      if (el) el.scrollTop = 550;
    });
    await page.waitForTimeout(600);
    await page.screenshot({ path: `${artifactDir}/prescription_modal_scrolled_meals.png` });
    console.log('Saved prescription_modal_scrolled_meals.png');

    // Close modal
    const closeBtn = await page.$('.btn-close-modal');
    if (closeBtn) await closeBtn.click();
    await page.waitForTimeout(500);
  }

  // 3. Go to /admin/schedule to verify 45-min interval TimePicker
  await page.goto('http://127.0.0.1:5176/admin/schedule', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Click first TimePicker trigger
  const tp = await page.waitForSelector('.custom-timepicker-trigger', { timeout: 10000 });
  await tp.click();
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${artifactDir}/admin_schedule_timepicker_45min.png` });
  console.log('Saved admin_schedule_timepicker_45min.png');

  await browser.close();
  console.log('All verification checks completed successfully!');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
