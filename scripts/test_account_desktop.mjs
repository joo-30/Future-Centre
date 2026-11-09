import { chromium } from '@playwright/test';

const chromeSystem = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function main() {
  const browser = await chromium.launch({ executablePath: chromeSystem, headless: true });
  const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
  
  // Quick login as patient
  await page.goto('http://127.0.0.1:5176/login', { waitUntil: 'networkidle' });
  const userBtn = await page.$('.quick-login-panel button:has-text("User")');
  if (userBtn) {
    await userBtn.click();
    await page.waitForTimeout(1000);
  }

  // Account on desktop
  await page.goto('http://127.0.0.1:5176/account', { waitUntil: 'networkidle' });
  await page.screenshot({ path: 'Future-Center/scripts/shot_account_desktop.png', fullPage: false });
  console.log('Saved shot_account_desktop.png');

  await browser.close();
}

main().catch(console.error);
