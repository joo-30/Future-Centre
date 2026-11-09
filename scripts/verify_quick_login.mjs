import { chromium } from 'playwright';

const chromeSystem = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function testQuickLogin() {
  const browser = await chromium.launch({ executablePath: chromeSystem, headless: true });
  
  // Test User login
  {
    const page = await browser.newPage({ viewport: { width: 1366, height: 768 } });
    await page.goto('http://127.0.0.1:5176/login', { waitUntil: 'networkidle' });
    
    // Find the patient button
    const patientBtn = page.locator('.quick-login-btn.role-patient');
    console.log('Patient button visible:', await patientBtn.isVisible());
    await patientBtn.click();
    await page.waitForURL('**/account', { timeout: 10000 });
    console.log('Successfully logged in as patient! URL:', page.url());
  }

  // Test Admin login
  {
    const page = await browser.newPage({ viewport: { width: 1366, height: 768 } });
    await page.goto('http://127.0.0.1:5176/login', { waitUntil: 'networkidle' });
    
    // Find the admin button
    const adminBtn = page.locator('.quick-login-btn.role-admin');
    console.log('Admin button visible:', await adminBtn.isVisible());
    await adminBtn.click();
    await page.waitForURL('**/admin', { timeout: 10000 });
    console.log('Successfully logged in as admin! URL:', page.url());
  }

  await browser.close();
}

testQuickLogin().catch(console.error);
