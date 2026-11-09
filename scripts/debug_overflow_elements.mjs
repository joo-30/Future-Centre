import { chromium } from 'playwright';

const chromeSystem = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function main() {
  const browser = await chromium.launch({ executablePath: chromeSystem, headless: true });
  const page = await browser.newPage({ viewport: { width: 320, height: 750 } });
  await page.goto('http://127.0.0.1:5176/login');
  await page.click('.quick-login-panel button:has-text("Admin")');
  await page.waitForURL('**/admin**');
  await page.waitForTimeout(1000);

  const elements = await page.evaluate(() => {
    const list = [];
    document.querySelectorAll('*').forEach(el => {
      if (el.closest('.console-sidebar')) return;
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.height > 0 && (r.right > 321 || r.left < -1)) {
        list.push({
          tag: el.tagName,
          className: (el.className || '').toString().slice(0, 50),
          left: Math.round(r.left),
          right: Math.round(r.right),
          width: Math.round(r.width),
          text: (el.innerText || '').slice(0, 30).replace(/\n/g, ' ')
        });
      }
    });
    return list;
  });
  console.log('All overflowing elements on /admin at 320px:');
  console.table(elements.slice(0, 25));
  await browser.close();
}

main().catch(console.error);
