import { chromium } from 'playwright';

const chromeSystem = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:/Users/makah/.gemini/antigravity/brain/c5420236-75f6-4eb0-aed5-e6d16c5e7077';

async function main() {
  const browser = await chromium.launch({ executablePath: chromeSystem, headless: true });

  // 1. Desktop View (1440x900)
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://127.0.0.1:5176/login', { waitUntil: 'networkidle' });
  await page.click('.quick-login-btn.role-admin');
  await page.waitForTimeout(1000);

  // A. Admin Appointments
  await page.goto('http://127.0.0.1:5176/admin/appointments', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);

  // Screenshot card header of appointments table
  const cardHeader = await page.$('.console-panel-card-header');
  if (cardHeader) {
    await cardHeader.screenshot({ path: `${artifactDir}/verified_appointments_card_header.png` });
    console.log('Saved verified_appointments_card_header.png');
  }

  // Screenshot the pulse section and spacing above it
  const pulseSection = await page.$('.daily-pulse-container');
  if (pulseSection) {
    await pulseSection.screenshot({ path: `${artifactDir}/verified_daily_pulse_desktop.png` });
    console.log('Saved verified_daily_pulse_desktop.png');
  }

  // Screenshot the entire appointments area showing the card and pulse
  await page.screenshot({ path: `${artifactDir}/verified_appointments_full_page.png`, fullPage: true });
  console.log('Saved verified_appointments_full_page.png');

  // B. Admin BMI Search Bar
  await page.goto('http://127.0.0.1:5176/admin/bmi', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);

  const bmiSelect = await page.$('.patient-search-select-wrap');
  if (bmiSelect) {
    await bmiSelect.screenshot({ path: `${artifactDir}/verified_bmi_search_desktop.png` });
    console.log('Saved verified_bmi_search_desktop.png');
  }

  // 2. Mobile View (390x844)
  const mobilePage = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await mobilePage.goto('http://127.0.0.1:5176/login', { waitUntil: 'networkidle' });
  await mobilePage.click('.quick-login-btn.role-admin');
  await mobilePage.waitForTimeout(1000);

  // Mobile Appointments
  await mobilePage.goto('http://127.0.0.1:5176/admin/appointments', { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(1200);

  const mCardHeader = await mobilePage.$('.console-panel-card-header');
  if (mCardHeader) {
    await mCardHeader.screenshot({ path: `${artifactDir}/verified_appointments_card_header_mobile.png` });
    console.log('Saved verified_appointments_card_header_mobile.png');
  }

  const mPulse = await mobilePage.$('.daily-pulse-container');
  if (mPulse) {
    await mPulse.screenshot({ path: `${artifactDir}/verified_daily_pulse_mobile.png` });
    console.log('Saved verified_daily_pulse_mobile.png');
  }

  // Mobile BMI
  await mobilePage.goto('http://127.0.0.1:5176/admin/bmi', { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(1200);

  const mBmiSelect = await mobilePage.$('.patient-search-select-wrap');
  if (mBmiSelect) {
    await mBmiSelect.screenshot({ path: `${artifactDir}/verified_bmi_search_mobile.png` });
    console.log('Saved verified_bmi_search_mobile.png');
  }

  await browser.close();
  console.log('All verification screenshots captured successfully!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
