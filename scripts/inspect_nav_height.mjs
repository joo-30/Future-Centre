import { chromium } from 'playwright';

const chromeSystem = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function main() {
  const browser = await chromium.launch({ executablePath: chromeSystem, headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  
  await page.goto('http://127.0.0.1:5176/login', { waitUntil: 'networkidle' });
  const adminBtn = await page.$('.quick-login-panel button:has-text("Admin")');
  if (adminBtn) {
    await adminBtn.click();
    await page.waitForTimeout(1000);
  }

  await page.goto('http://127.0.0.1:5176/admin', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  const info = await page.evaluate(() => {
    const items = Array.from(document.querySelectorAll('.console-sidebar nav a'));
    return items.map(a => {
      const span = a.querySelector('.nav-item-label');
      return {
        text: span?.innerText,
        spanOffsetHeight: span?.offsetHeight,
        aOffsetHeight: a.offsetHeight,
        aOffsetWidth: a.offsetWidth,
        whiteSpace: getComputedStyle(span || a).whiteSpace,
        lineHeight: getComputedStyle(span || a).lineHeight,
      };
    });
  });

  console.table(info);
  await browser.close();
}

main();
