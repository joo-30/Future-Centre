import { chromium } from 'playwright';
import path from 'path';

const chromeSystem = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:/Users/makah/.gemini/antigravity/brain/e2976ba3-c954-4b1f-8cdb-775aa48d6049';

async function main() {
  const browser = await chromium.launch({ executablePath: chromeSystem, headless: true });

  // 1. Check Hero on Mobile 360px
  {
    const page = await browser.newPage({ viewport: { width: 360, height: 780 }, deviceScaleFactor: 2 });
    await page.goto('http://127.0.0.1:5176/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'current_hero_mobile_360.png') });
    console.log('Saved current_hero_mobile_360.png');
  }

  // 2. Check Account on Mobile 360px
  {
    const context = await browser.newContext({ viewport: { width: 360, height: 780 }, deviceScaleFactor: 2 });
    const page = await context.newPage();
    await page.goto('http://127.0.0.1:5176/login', { waitUntil: 'networkidle' });
    const patientBtn = page.locator('.quick-login-btn.role-patient');
    if (await patientBtn.isVisible()) {
      await patientBtn.click();
      await page.waitForURL('**/account', { timeout: 10000 });
      await page.waitForTimeout(1000);
      await page.screenshot({ path: path.join(ARTIFACT_DIR, 'current_account_mobile_360.png') });
      console.log('Saved current_account_mobile_360.png');

      // Scroll down to check floating buttons & cards
      await page.evaluate(() => window.scrollBy(0, 400));
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(ARTIFACT_DIR, 'current_account_mobile_360_scrolled.png') });
      console.log('Saved current_account_mobile_360_scrolled.png');
    } else {
      console.log('Quick login patient button not visible');
    }
    await context.close();
  }

  // 3. Check Hero on Desktop 1440px
  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto('http://127.0.0.1:5176/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'current_hero_desktop_1440.png') });
    console.log('Saved current_hero_desktop_1440.png');
  }

  await browser.close();
}

main().catch(console.error);
