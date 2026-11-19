import { chromium } from 'playwright';

const chromeSystem = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:/Users/makah/.gemini/antigravity/brain/c5420236-75f6-4eb0-aed5-e6d16c5e7077';

async function main() {
  const browser = await chromium.launch({ executablePath: chromeSystem, headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  // 1. Login
  await page.goto('http://127.0.0.1:5176/login', { waitUntil: 'networkidle' });
  await page.click('.quick-login-btn.role-admin');
  await page.waitForTimeout(1000);

  // 2. Go to Appointments
  await page.goto('http://127.0.0.1:5176/admin/appointments', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  // 3. Test Agenda Section (Expanded State)
  const agendaSection = await page.$('.today-agenda-section');
  if (agendaSection) {
    await agendaSection.screenshot({ path: `${artifactDir}/verified_agenda_expanded.png` });
    console.log('Saved verified_agenda_expanded.png');
  }

  // 4. Click the Collapse Button
  const collapseBtn = await page.$('.agenda-toggle-collapse-btn');
  if (collapseBtn) {
    await collapseBtn.click();
    await page.waitForTimeout(600);
    if (agendaSection) {
      await agendaSection.screenshot({ path: `${artifactDir}/verified_agenda_collapsed.png` });
      console.log('Saved verified_agenda_collapsed.png');
    }

    // Click it again to expand
    await collapseBtn.click();
    await page.waitForTimeout(600);
  }

  // 5. Open Manual Booking Modal
  const manualBtn = await page.$('.console-panel-add-manual-btn');
  if (manualBtn) {
    await manualBtn.click();
    await page.waitForTimeout(1000);

    // Fill some demo text to check live summary
    const nameInput = await page.$('.mb-input-wrap input[type="text"]');
    if (nameInput) await nameInput.fill('سارة محمد عبدالله');

    const phoneInput = await page.$('.mb-input-wrap input[type="tel"]');
    if (phoneInput) await phoneInput.fill('01012345678');

    // Click first available slot if present
    const firstSlot = await page.$('.mb-slot-btn');
    if (firstSlot) await firstSlot.click();

    await page.waitForTimeout(600);

    const modalDialog = await page.$('dialog.modal.manual-booking-dialog');
    if (modalDialog) {
      await modalDialog.screenshot({ path: `${artifactDir}/verified_manual_booking_modal.png` });
      console.log('Saved verified_manual_booking_modal.png');
    }
  }

  await browser.close();
  console.log('All verification screenshots saved successfully!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
