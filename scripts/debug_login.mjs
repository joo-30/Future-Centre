import { chromium } from 'playwright';

const chromeSystem = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function main() {
  const browser = await chromium.launch({ executablePath: chromeSystem, headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  page.on('console', msg => console.log('BROWSER LOG:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err));

  await page.goto('http://127.0.0.1:5176/auth/login', { waitUntil: 'load' });
  await page.waitForTimeout(3000);

  const html = await page.content();
  console.log('Body text:', await page.innerText('body'));

  await browser.close();
}

main().catch(console.error);
