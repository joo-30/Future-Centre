import { chromium } from 'playwright';

const chromeSystem = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function testNavbar() {
  const browser = await chromium.launch({ executablePath: chromeSystem, headless: true });
  
  // 1. Fresh context without any cookies
  const context = await browser.newContext();
  const page = await context.newPage({ viewport: { width: 1366, height: 768 } });
  await page.goto('http://127.0.0.1:5176/', { waitUntil: 'networkidle' });
  
  const headActionsText = await page.locator('.head-actions').innerText();
  console.log('Unauthenticated Header Actions text:', JSON.stringify(headActionsText));

  // 2. Also test with admin session
  const adminPage = await context.newPage({ viewport: { width: 1366, height: 768 } });
  await adminPage.goto('http://127.0.0.1:5176/login', { waitUntil: 'networkidle' });
  await adminPage.click('.quick-login-btn.role-admin');
  await adminPage.waitForURL('**/admin');
  
  // Now navigate to public home page as admin
  await adminPage.goto('http://127.0.0.1:5176/', { waitUntil: 'networkidle' });
  const adminOnHomeText = await adminPage.locator('.head-actions').innerText();
  console.log('Admin on Home Header Actions text:', JSON.stringify(adminOnHomeText));

  await browser.close();
}

testNavbar().catch(console.error);
