import { chromium } from 'playwright';
import path from 'path';

const chromeSystem = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const outDir = 'C:\\Users\\makah\\.gemini\\antigravity\\brain\\e2976ba3-c954-4b1f-8cdb-775aa48d6049';

async function main() {
  const browser = await chromium.launch({ executablePath: chromeSystem, headless: true });
  
  // 1. Desktop Hero
  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto('http://127.0.0.1:5176/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    const hero = page.locator('.hero-section');
    await hero.screenshot({ path: path.join(outDir, 'proof_1_hero_desktop.png') });
    console.log('Saved proof_1_hero_desktop.png');
    await page.close();
  }

  // 2. Mobile Hero (Doctor card & CTA buttons)
  {
    const page = await browser.newPage({ viewport: { width: 375, height: 812 } });
    await page.goto('http://127.0.0.1:5176/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    
    // Screenshot top hero (buttons & copy)
    await page.screenshot({ path: path.join(outDir, 'proof_3_hero_mobile_buttons.png'), clip: { x: 0, y: 0, width: 375, height: 600 } });
    console.log('Saved proof_3_hero_mobile_buttons.png');

    // Screenshot doctor card
    const docCard = page.locator('.hero-doctor-showcase');
    if (await docCard.isVisible()) {
      await docCard.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
      await docCard.screenshot({ path: path.join(outDir, 'proof_2_hero_mobile_doctor_card.png') });
      console.log('Saved proof_2_hero_mobile_doctor_card.png');
    }
    await page.close();
  }

  // 3. Account Mobile (Buttons & Gap)
  {
    const page = await browser.newPage({ viewport: { width: 375, height: 812 } });
    await page.goto('http://127.0.0.1:5176/login', { waitUntil: 'networkidle' });
    const userBtn = page.locator('.quick-login-btn.role-patient');
    if (await userBtn.isVisible()) {
      await userBtn.click();
      await page.waitForURL('**/account**', { timeout: 10000 });
      await page.waitForTimeout(1000);
    } else {
      await page.goto('http://127.0.0.1:5176/account', { waitUntil: 'networkidle' });
      await page.waitForTimeout(1000);
    }
    const ctaRow = page.locator('.account-top-cta-row');
    if (await ctaRow.isVisible()) {
      await ctaRow.screenshot({ path: path.join(outDir, 'proof_4_account_mobile_buttons.png') });
      console.log('Saved proof_4_account_mobile_buttons.png');
    } else {
      console.log('ctaRow not visible on mobile account, taking full page screenshot...');
      await page.screenshot({ path: path.join(outDir, 'proof_4_account_mobile_full.png') });
    }
    await page.close();
  }

  // 4. Account Desktop (Buttons & Gap)
  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto('http://127.0.0.1:5176/login', { waitUntil: 'networkidle' });
    const userBtn = page.locator('.quick-login-btn.role-patient');
    if (await userBtn.isVisible()) {
      await userBtn.click();
      await page.waitForURL('**/account**', { timeout: 10000 });
      await page.waitForTimeout(1000);
    } else {
      await page.goto('http://127.0.0.1:5176/account', { waitUntil: 'networkidle' });
      await page.waitForTimeout(1000);
    }
    const ctaRow = page.locator('.account-top-cta-row');
    if (await ctaRow.isVisible()) {
      await ctaRow.screenshot({ path: path.join(outDir, 'proof_5_account_desktop_buttons.png') });
      console.log('Saved proof_5_account_desktop_buttons.png');
    } else {
      console.log('ctaRow not visible on desktop account, taking full page screenshot...');
      await page.screenshot({ path: path.join(outDir, 'proof_5_account_desktop_full.png') });
    }
    await page.close();
  }

  // 5. Admin Appointments page (Check console and page errors)
  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    page.on('pageerror', err => errors.push(err.message));
    
    await page.goto('http://127.0.0.1:5176/login', { waitUntil: 'networkidle' });
    const adminBtn = page.locator('.quick-login-btn.role-admin');
    if (await adminBtn.isVisible()) {
      await adminBtn.click();
      await page.waitForURL('**/admin**', { timeout: 10000 });
      await page.waitForTimeout(1000);
    }
    await page.goto('http://127.0.0.1:5176/admin/appointments', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    console.log('Admin appointments URL:', page.url());
    console.log('Errors caught on /admin/appointments:', errors);
    await page.close();
  }

  await browser.close();
  console.log('All tests and proof captures finished!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
