import { chromium } from 'playwright';

const chromeSystem = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:/Users/makah/.gemini/antigravity/brain/c5420236-75f6-4eb0-aed5-e6d16c5e7077';

async function main() {
  const browser = await chromium.launch({ executablePath: chromeSystem, headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://127.0.0.1:5176/login', { waitUntil: 'networkidle' });
  await page.click('.quick-login-btn.role-admin');
  await page.waitForTimeout(1000);
  await page.goto('http://127.0.0.1:5176/admin/appointments', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.click('.console-panel-add-manual-btn');
  await page.waitForTimeout(600);

  const nameInput = await page.$('.mb-input-wrap input[type="text"]');
  if (nameInput) await nameInput.fill('سارة محمد عبدالله');

  const phoneInput = await page.$('.mb-input-wrap input[type="tel"]');
  if (phoneInput) await phoneInput.fill('01012345678');

  const slot = await page.$('.mb-slot-btn');
  if (slot) await slot.click();

  await page.evaluate(() => {
    const el = document.querySelector('.manual-booking-form');
    if (el) el.scrollTop = el.scrollHeight;
  });
  await page.waitForTimeout(400);

  const modal = await page.$('dialog.modal.manual-booking-dialog');
  if (modal) {
    await modal.screenshot({ path: `${artifactDir}/verified_manual_booking_modal_bottom.png` });
    console.log('Saved verified_manual_booking_modal_bottom.png');
  }
  await browser.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
