import { chromium } from 'playwright';

const chromeSystem = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function verify() {
  const browser = await chromium.launch({ executablePath: chromeSystem, headless: true });

  for (const width of [1366, 1024, 768, 375, 320]) {
    const page = await browser.newPage({ viewport: { width, height: 800 } });
    await page.goto('http://127.0.0.1:5176/login', { waitUntil: 'networkidle' });
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const innerWidth = await page.evaluate(() => window.innerWidth);
    console.log(`Width ${width}: scrollWidth=${scrollWidth}, innerWidth=${innerWidth}, overflow=${scrollWidth > innerWidth}`);
  }

  await browser.close();
}

verify().catch(console.error);
