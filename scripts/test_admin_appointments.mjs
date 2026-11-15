import { chromium } from 'playwright';

const chromeSystem = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function main() {
  const browser = await chromium.launch({ executablePath: chromeSystem, headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  page.on('console', msg => console.log('BROWSER LOG:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message, err.stack));

  // 1. Login as admin
  await page.goto('http://127.0.0.1:5176/login', { waitUntil: 'networkidle' });
  const adminBtn = page.locator('.quick-login-btn.role-admin');
  if (await adminBtn.isVisible()) {
    console.log('Logging in as admin...');
    await adminBtn.click();
    await page.waitForURL('**/admin**', { timeout: 10000 });
    console.log('Current URL:', page.url());
    await page.waitForTimeout(2000);
  }

  // 2. Navigate directly to /admin/appointments
  console.log('Navigating to /admin/appointments...');
  await page.goto('http://127.0.0.1:5176/admin/appointments', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  console.log('Finished waiting at /admin/appointments, URL is:', page.url());

  await browser.close();
}

main().catch(console.error);
