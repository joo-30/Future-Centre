import { chromium } from 'playwright';

const chromeSystem = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function checkLayout() {
  const browser = await chromium.launch({ executablePath: chromeSystem, headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto('http://127.0.0.1:5176/login', { waitUntil: 'networkidle' });

  const rects = await page.evaluate(() => {
    const form = document.querySelector('.access-form-area');
    const visual = document.querySelector('.access-visual');
    const page = document.querySelector('.access-page');
    return {
      window: { width: window.innerWidth, height: window.innerHeight },
      page: page ? page.getBoundingClientRect() : null,
      pageGrid: window.getComputedStyle(page).gridTemplateColumns,
      form: form ? form.getBoundingClientRect() : null,
      visual: visual ? visual.getBoundingClientRect() : null,
    };
  });

  console.log('Layout evaluation:', JSON.stringify(rects, null, 2));
  await browser.close();
}

checkLayout().catch(console.error);
