import { chromium } from 'playwright';

const chromeSystem = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:/Users/makah/.gemini/antigravity/brain/c5420236-75f6-4eb0-aed5-e6d16c5e7077';

async function main() {
  const browser = await chromium.launch({ executablePath: chromeSystem, headless: true });
  
  // 1. Desktop Verification (1440x900)
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://127.0.0.1:5176/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Capture Header
  const header = await page.$('.site-head');
  if (header) {
    await header.screenshot({ path: `${artifactDir}/polish_header_1440.png` });
    console.log('Saved polish_header_1440.png');
  }

  // Capture Services Block
  const services = await page.$('.clinic-services');
  if (services) {
    await services.screenshot({ path: `${artifactDir}/polish_services_1440.png` });
    console.log('Saved polish_services_1440.png');
  }

  // Capture Doctor Section
  const doctor = await page.$('.clinic-doctor-profile');
  if (doctor) {
    await doctor.screenshot({ path: `${artifactDir}/polish_doctor_1440.png` });
    console.log('Saved polish_doctor_1440.png');
  }

  // Capture Feedback Block (Cards)
  const feedback = await page.$('.feedback-block');
  if (feedback) {
    await feedback.screenshot({ path: `${artifactDir}/polish_feedback_1440.png` });
    console.log('Saved polish_feedback_1440.png');
  }

  // Test Hover on Feedback Micro Card
  const firstCard = await page.$('.feedback-micro-card');
  if (firstCard) {
    await firstCard.hover();
    await page.waitForTimeout(400);
    await firstCard.screenshot({ path: `${artifactDir}/polish_feedback_card_hovered.png` });
    console.log('Saved polish_feedback_card_hovered.png');
  }

  // 2. Mobile Verification (390x844)
  const mobilePage = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await mobilePage.goto('http://127.0.0.1:5176/', { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(1000);

  const mHeader = await mobilePage.$('.site-head');
  if (mHeader) {
    await mHeader.screenshot({ path: `${artifactDir}/polish_header_390.png` });
    console.log('Saved polish_header_390.png');
  }

  const mServices = await mobilePage.$('.clinic-services');
  if (mServices) {
    await mServices.screenshot({ path: `${artifactDir}/polish_services_390.png` });
    console.log('Saved polish_services_390.png');
  }

  const mDoctor = await mobilePage.$('.clinic-doctor-profile');
  if (mDoctor) {
    await mDoctor.screenshot({ path: `${artifactDir}/polish_doctor_390.png` });
    console.log('Saved polish_doctor_390.png');
  }

  const mFeedback = await mobilePage.$('.feedback-block');
  if (mFeedback) {
    await mFeedback.screenshot({ path: `${artifactDir}/polish_feedback_390.png` });
    console.log('Saved polish_feedback_390.png');
  }

  await browser.close();
  console.log('Verification finished successfully!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
