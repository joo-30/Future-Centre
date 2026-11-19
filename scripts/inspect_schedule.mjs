import { chromium } from 'playwright';

const chromeSystem = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:/Users/makah/.gemini/antigravity/brain/c5420236-75f6-4eb0-aed5-e6d16c5e7077';

async function main() {
  const browser = await chromium.launch({ executablePath: chromeSystem, headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 950 } });

  // Go to login
  await page.goto('http://127.0.0.1:5176/auth/login', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  // Click 'إدارة المركز Admin Portal'
  const adminBtn = await page.getByText('Admin Portal');
  if (adminBtn) {
    await adminBtn.click();
    await page.waitForTimeout(1000);
  }

  // Go to /admin/schedule
  await page.goto('http://127.0.0.1:5176/admin/schedule', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${artifactDir}/admin_schedule_view.png`, fullPage: true });
  console.log('Saved admin_schedule_view.png');

  // Click on a TimePicker trigger to open the popup
  const tp = await page.$('.custom-timepicker-trigger');
  if (tp) {
    await tp.click();
    await page.waitForTimeout(400);
    await page.screenshot({ path: `${artifactDir}/admin_schedule_timepicker_popup.png` });
    console.log('Saved admin_schedule_timepicker_popup.png');
  }

  await browser.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
