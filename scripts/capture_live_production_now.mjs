import { chromium } from 'playwright';

const chromeSystem = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:/Users/makah/.gemini/antigravity/brain/c5420236-75f6-4eb0-aed5-e6d16c5e7077';

async function main() {
  const browser = await chromium.launch({ executablePath: chromeSystem, headless: true });

  // 1. Desktop 1440px
  const pageDesk = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await pageDesk.goto('http://127.0.0.1:5176', { waitUntil: 'networkidle' });
  await pageDesk.waitForTimeout(1200);

  // Full page
  await pageDesk.screenshot({ path: `${artifactDir}/live_prod_now_1440_full.png`, fullPage: true });

  // Section 1: Hero
  const hero = await pageDesk.$('.clinic-intro');
  if (hero) await hero.screenshot({ path: `${artifactDir}/live_prod_now_hero_1440.png` });

  // Section 2: Services
  const services = await pageDesk.$('.clinic-services');
  if (services) await services.screenshot({ path: `${artifactDir}/live_prod_now_services_1440.png` });

  // Section 3: Doctor
  const doctor = await pageDesk.$('.clinic-doctor-profile');
  if (doctor) await doctor.screenshot({ path: `${artifactDir}/live_prod_now_doctor_1440.png` });

  // Section 4: Stories
  const stories = await pageDesk.$('.stories-section');
  if (stories) await stories.screenshot({ path: `${artifactDir}/live_prod_now_stories_1440.png` });

  // 2. Mobile 390px
  const pageMob = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await pageMob.goto('http://127.0.0.1:5176', { waitUntil: 'networkidle' });
  await pageMob.waitForTimeout(1200);

  const heroMob = await pageMob.$('.clinic-intro');
  if (heroMob) await heroMob.screenshot({ path: `${artifactDir}/live_prod_now_hero_390.png` });

  const servicesMob = await pageMob.$('.clinic-services');
  if (servicesMob) await servicesMob.screenshot({ path: `${artifactDir}/live_prod_now_services_390.png` });

  const doctorMob = await pageMob.$('.clinic-doctor-profile');
  if (doctorMob) await doctorMob.screenshot({ path: `${artifactDir}/live_prod_now_doctor_390.png` });

  const storiesMob = await pageMob.$('.stories-section');
  if (storiesMob) await storiesMob.screenshot({ path: `${artifactDir}/live_prod_now_stories_390.png` });

  console.log('All live production screenshots captured successfully!');
  await browser.close();
}

main().catch(console.error);
