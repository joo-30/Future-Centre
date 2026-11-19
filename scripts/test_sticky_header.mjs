import { chromium } from 'playwright';

const chromeSystem = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:/Users/makah/.gemini/antigravity/brain/c5420236-75f6-4eb0-aed5-e6d16c5e7077';

async function run() {
  const browser = await chromium.launch({ executablePath: chromeSystem, headless: true });
  
  // Test /about
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://127.0.0.1:5176/about', { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);

  // Scroll 600px
  await page.evaluate(() => window.scrollTo(0, 600));
  await page.waitForTimeout(400);

  const scrolledAbout = await page.evaluate(() => {
    const el = document.querySelector('.site-head');
    return {
      scrollY: window.scrollY,
      rect: el ? el.getBoundingClientRect() : null
    };
  });
  console.log('About Scrolled 600px:', scrolledAbout);

  await page.screenshot({ path: `${artifactDir}/sticky_header_about_scrolled.png` });

  await browser.close();
}

run().catch(console.error);
