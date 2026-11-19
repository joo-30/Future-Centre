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

  // Capture individual sections
  const hero = await pageDesk.$('.clinic-intro');
  if (hero) await hero.screenshot({ path: `${artifactDir}/prod_final_hero_1440.png` });

  const services = await pageDesk.$('.clinic-services');
  if (services) await services.screenshot({ path: `${artifactDir}/prod_final_services_1440.png` });

  const doctor = await pageDesk.$('.clinic-doctor-profile');
  if (doctor) await doctor.screenshot({ path: `${artifactDir}/prod_final_doctor_1440.png` });

  const stories = await pageDesk.$('.stories-section');
  if (stories) await stories.screenshot({ path: `${artifactDir}/prod_final_stories_1440.png` });

  // Full page
  await pageDesk.screenshot({ path: `${artifactDir}/prod_final_full_page_1440.png`, fullPage: false });

  // 2. Mobile (390px)
  const pageMob = await browser.newPage();
  await pageMob.setViewportSize({ width: 390, height: 844 });
  await pageMob.goto('http://127.0.0.1:5176/', { waitUntil: 'networkidle' });
  await pageMob.waitForTimeout(1000);

  const heroMob = await pageMob.$('.clinic-intro');
  if (heroMob) await heroMob.screenshot({ path: `${artifactDir}/prod_final_hero_390.png` });

  const servicesMob = await pageMob.$('.clinic-services');
  if (servicesMob) await servicesMob.screenshot({ path: `${artifactDir}/prod_final_services_390.png` });

  const doctorMob = await pageMob.$('.clinic-doctor-profile');
  if (doctorMob) await doctorMob.screenshot({ path: `${artifactDir}/prod_final_doctor_390.png` });

  const storiesMob = await pageMob.$('.stories-section');
  if (storiesMob) await storiesMob.screenshot({ path: `${artifactDir}/prod_final_stories_390.png` });

  console.log('All live production screenshots captured successfully!');
  await browser.close();
}

capture().catch(console.error);
