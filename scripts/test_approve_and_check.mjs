import { chromium } from 'playwright';

const chromeSystem = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function testApproveAndCheck() {
  const browser = await chromium.launch({ executablePath: chromeSystem, headless: true });
  
  // 1. Admin logs in and approves FC-90403
  const adminContext = await browser.newContext();
  const adminPage = await adminContext.newPage();
  await adminPage.goto('http://127.0.0.1:5176/login');
  await adminPage.click('.quick-login-btn.role-admin');
  await adminPage.waitForURL('**/admin');

  // Direct decision call as admin
  await adminPage.evaluate(async () => {
    await fetch('/api/admin/appointments/FC-90403/decision', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'approve' })
    });
  });
  console.log('1. Admin approved FC-90403');

  // 2. Client on their phone/laptop opens /booking/track
  const clientContext = await browser.newContext();
  const clientPage = await clientContext.newPage();
  await clientPage.goto('http://127.0.0.1:5176/');
  await clientPage.evaluate(() => {
    localStorage.setItem('fc_recent_booking', JSON.stringify({
      reference: 'FC-90403',
      phone: '01012349988',
      savedAt: Date.now()
    }));
  });

  await clientPage.goto('http://127.0.0.1:5176/booking/track', { waitUntil: 'networkidle' });
  await clientPage.waitForTimeout(1000);

  const headline = await clientPage.locator('.tracking-core h2').innerText();
  const badgeText = await clientPage.locator('.tracking-core .badge').innerText();
  console.log('2. Client sees live status headline:', headline);
  console.log('3. Client sees badge:', badgeText);

  await browser.close();
}

testApproveAndCheck().catch(console.error);
