import { chromium } from 'playwright';

const chromeSystem = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:/Users/makah/.gemini/antigravity/brain/c5420236-75f6-4eb0-aed5-e6d16c5e7077';

async function main() {
  const browser = await chromium.launch({ executablePath: chromeSystem, headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://127.0.0.1:5176/login', { waitUntil: 'networkidle' });
  await page.click('.quick-login-btn.role-admin');
  await page.waitForTimeout(1000);
  await page.goto('http://127.0.0.1:5176/admin/bmi', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  const patientSelect = await page.$('.patient-search-select-wrap');
  if (patientSelect) {
    await patientSelect.screenshot({ path: `${artifactDir}/inspect_bmi_patient_select.png` });
    console.log('Saved inspect_bmi_patient_select.png');
  }
  await page.screenshot({ path: `${artifactDir}/inspect_bmi_page.png` });
  console.log('Saved inspect_bmi_page.png');
  await browser.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
