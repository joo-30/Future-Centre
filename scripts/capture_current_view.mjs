import { chromium } from 'playwright';

const chromeSystem = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:/Users/makah/.gemini/antigravity/brain/c5420236-75f6-4eb0-aed5-e6d16c5e7077';

async function main() {
  const browser = await chromium.launch({ executablePath: chromeSystem, headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 950 } });
  await page.goto('http://127.0.0.1:5176', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // 1. Services section
  const srv = await page.$('.clinic-services');
  if (srv) {
    await srv.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    await srv.screenshot({ path: `${artifactDir}/before_services_section.png` });
    console.log('Saved before_services_section.png');
  }

  // 2. Doctor section
  const doc = await page.$('.clinic-doctor-profile');
  if (doc) {
    await doc.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    await doc.screenshot({ path: `${artifactDir}/before_doctor_profile.png` });
    console.log('Saved before_doctor_profile.png');
  }

  // 3. Feedback block
  const el = await page.$('.feedback-block');
  if (el) {
    await el.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    await el.screenshot({ path: `${artifactDir}/before_feedback_block.png` });
    console.log('Saved before_feedback_block.png');
  }

  await browser.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
