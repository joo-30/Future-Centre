import { chromium } from 'playwright';

const chromeSystem = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:/Users/makah/.gemini/antigravity/brain/c5420236-75f6-4eb0-aed5-e6d16c5e7077';

async function capture() {
  const browser = await chromium.launch({ executablePath: chromeSystem, headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://127.0.0.1:5176/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Hero
  const hero = await page.$('.clinic-intro');
  if (hero) await hero.screenshot({ path: `${artifactDir}/current_live_hero_1440.png` });

  // Services
  const services = await page.$('.clinic-services');
  if (services) await services.screenshot({ path: `${artifactDir}/current_live_services_1440.png` });

  // Doctor
  const doctor = await page.$('.clinic-doctor-profile');
  if (doctor) await doctor.screenshot({ path: `${artifactDir}/current_live_doctor_1440.png` });

  // Stories
  const stories = await page.$('.stories-section');
  if (stories) await stories.screenshot({ path: `${artifactDir}/current_live_stories_1440.png` });

  console.log('Screenshots captured successfully');
  await browser.close();
}

capture().catch(console.error);
