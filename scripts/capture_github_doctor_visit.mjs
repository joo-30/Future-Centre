import { chromium } from 'playwright';

const chromeSystem = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:/Users/makah/.gemini/antigravity/brain/c5420236-75f6-4eb0-aed5-e6d16c5e7077';

async function main() {
  const browser = await chromium.launch({ executablePath: chromeSystem, headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://127.0.0.1:5176', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  const doc = await page.$('.clinic-doctor-profile');
  if (doc) await doc.screenshot({ path: `${artifactDir}/github_latest_doctor_1440.png` });

  const visit = await page.$('.clinic-visit');
  if (visit) await visit.screenshot({ path: `${artifactDir}/github_latest_visit_1440.png` });

  const stories = await page.$('.stories-section');
  if (stories) await stories.screenshot({ path: `${artifactDir}/github_latest_stories_1440.png` });

  console.log('Saved doctor, visit, and stories screenshots!');
  await browser.close();
}

main().catch(console.error);
