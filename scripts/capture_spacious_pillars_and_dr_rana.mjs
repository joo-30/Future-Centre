import { chromium } from 'playwright';

const chromeSystem = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:/Users/makah/.gemini/antigravity/brain/c5420236-75f6-4eb0-aed5-e6d16c5e7077';

async function capture() {
  const browser = await chromium.launch({ executablePath: chromeSystem, headless: true });
  
  // 1. Desktop (1440px)
  const pageDesk = await browser.newPage();
  await pageDesk.setViewportSize({ width: 1440, height: 900 });
  await pageDesk.goto('http://127.0.0.1:5176/', { waitUntil: 'networkidle' });
  await pageDesk.waitForTimeout(1000);

  // Pillars & Hero
  const heroIndex = await pageDesk.$('.clinic-intro');
  if (heroIndex) await heroIndex.screenshot({ path: `${artifactDir}/spacious_pillars_live_1440.png` });

  // Doctor section
  const doctor = await pageDesk.$('.clinic-doctor-profile');
  if (doctor) await doctor.screenshot({ path: `${artifactDir}/master_doctor_live_1440.png` });

  // 2. Mobile (390px)
  const pageMob = await browser.newPage();
  await pageMob.setViewportSize({ width: 390, height: 844 });
  await pageMob.goto('http://127.0.0.1:5176/', { waitUntil: 'networkidle' });
  await pageMob.waitForTimeout(1000);

  const heroIndexMob = await pageMob.$('.clinic-intro-index');
  if (heroIndexMob) await heroIndexMob.screenshot({ path: `${artifactDir}/spacious_pillars_live_390.png` });

  const doctorMob = await pageMob.$('.clinic-doctor-profile');
  if (doctorMob) await doctorMob.screenshot({ path: `${artifactDir}/master_doctor_live_390.png` });

  console.log('Spacious pillars and doctor showcase screenshots captured successfully!');
  await browser.close();
}

capture().catch(console.error);
