import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true
  });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://127.0.0.1:5176', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  
  const artifactDir = 'C:/Users/makah/.gemini/antigravity/brain/c5420236-75f6-4eb0-aed5-e6d16c5e7077';
  
  const intro = await page.$('.clinic-intro');
  if (intro) await intro.screenshot({ path: `${artifactDir}/inspect_intro.png` });
  
  const services = await page.$('.clinic-services');
  if (services) await services.screenshot({ path: `${artifactDir}/inspect_services.png` });

  const doc = await page.$('.clinic-doctor-profile');
  if (doc) await doc.screenshot({ path: `${artifactDir}/inspect_doc.png` });

  const stories = await page.$('.stories-section');
  if (stories) await stories.screenshot({ path: `${artifactDir}/inspect_stories.png` });

  console.log('All 4 section screenshots captured successfully!');
  await browser.close();
}

main().catch(console.error);
