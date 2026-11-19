import { chromium } from 'playwright';

const chromeSystem = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const htmlFile = 'file:///C:/Users/makah/.gemini/antigravity/brain/c5420236-75f6-4eb0-aed5-e6d16c5e7077/scratch/luxury_homepage_overhaul.html';
const artifactDir = 'C:/Users/makah/.gemini/antigravity/brain/c5420236-75f6-4eb0-aed5-e6d16c5e7077';

async function main() {
  const browser = await chromium.launch({ executablePath: chromeSystem, headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 1200 });
  await page.goto(htmlFile, { waitUntil: 'load' });
  await page.waitForTimeout(1000);

  // 1. Hero
  const heroEl = await page.$('.hero-atelier');
  if (heroEl) await heroEl.screenshot({ path: `${artifactDir}/overhaul_hero_1440.png` });

  // 2. Services
  const servicesEl = await page.$('.services-section');
  if (servicesEl) await servicesEl.screenshot({ path: `${artifactDir}/overhaul_services_1440.png` });

  // 3. Doctor
  const docEl = await page.$('.doctor-section-luxury');
  if (docEl) await docEl.screenshot({ path: `${artifactDir}/overhaul_doctor_1440.png` });

  // 4. Stories
  const storiesEl = await page.$('.stories-section-luxury');
  if (storiesEl) await storiesEl.screenshot({ path: `${artifactDir}/overhaul_stories_1440.png` });

  // Full page view
  await page.screenshot({ path: `${artifactDir}/overhaul_full_flow_1440.png`, fullPage: true });

  await browser.close();
  console.log('Saved overhaul mockup screenshots');
}

main().catch(console.error);
