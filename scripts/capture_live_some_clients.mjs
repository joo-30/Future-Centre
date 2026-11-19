import { chromium } from 'playwright';

const chromeSystem = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:/Users/makah/.gemini/antigravity/brain/c5420236-75f6-4eb0-aed5-e6d16c5e7077';

async function capture() {
  const browser = await chromium.launch({ executablePath: chromeSystem, headless: true });
  
  // 1. Desktop (1440px)
  const pageDesk = await browser.newPage();
  await pageDesk.setViewportSize({ width: 1440, height: 900 });
  await pageDesk.goto('http://127.0.0.1:5176/#stories', { waitUntil: 'networkidle' });
  await pageDesk.waitForTimeout(1000);

  const stories = await pageDesk.$('.stories-section');
  if (stories) await stories.screenshot({ path: `${artifactDir}/some_clients_redesign_live_1440.png` });

  // 2. Mobile (390px)
  const pageMob = await browser.newPage();
  await pageMob.setViewportSize({ width: 390, height: 844 });
  await pageMob.goto('http://127.0.0.1:5176/#stories', { waitUntil: 'networkidle' });
  await pageMob.waitForTimeout(1000);

  const storiesMob = await pageMob.$('.stories-section');
  if (storiesMob) await storiesMob.screenshot({ path: `${artifactDir}/some_clients_redesign_live_390.png` });

  console.log('Some clients redesign screenshots captured successfully!');
  await browser.close();
}

capture().catch(console.error);
