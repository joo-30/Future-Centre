import { chromium } from 'playwright';
import path from 'path';

const chromeSystem = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:/Users/makah/.gemini/antigravity/brain/e2976ba3-c954-4b1f-8cdb-775aa48d6049';

async function main() {
  const browser = await chromium.launch({ executablePath: chromeSystem, headless: true });

  // 1. Hero Mobile (360px)
  {
    const page = await browser.newPage({ viewport: { width: 360, height: 800 }, deviceScaleFactor: 2 });
    await page.goto('http://127.0.0.1:5176/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'final_proof_hero_mobile_top.png') });

    // Doctor card on mobile
    const doc = page.locator('.hero-doctor-showcase');
    if (await doc.count() > 0) {
      await doc.scrollIntoViewIfNeeded();
      await page.waitForTimeout(600);
      await doc.screenshot({ path: path.join(ARTIFACT_DIR, 'final_proof_hero_mobile_doctor.png') });
    }
  }

  // 2. Hero Desktop (1440px)
  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto('http://127.0.0.1:5176/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'final_proof_hero_desktop.png') });
  }

  // 3. Client Account Mobile (360px)
  {
    const context = await browser.newContext({ viewport: { width: 360, height: 800 }, deviceScaleFactor: 2 });
    const page = await context.newPage();
    await page.goto('http://127.0.0.1:5176/login', { waitUntil: 'networkidle' });
    const patientBtn = page.locator('.quick-login-btn.role-patient');
    if (await patientBtn.isVisible()) {
      await patientBtn.click();
      await page.waitForURL('**/account', { timeout: 10000 });
      await page.waitForTimeout(1200);

      // Top profile header
      await page.screenshot({ path: path.join(ARTIFACT_DIR, 'final_proof_account_mobile_top.png') });

      // Scrolled view with cards and code lookup
      await page.evaluate(() => window.scrollBy(0, 480));
      await page.waitForTimeout(600);
      await page.screenshot({ path: path.join(ARTIFACT_DIR, 'final_proof_account_mobile_cards.png') });
    }
    await context.close();
  }

  // 4. Programs Page Motion Check (Desktop)
  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto('http://127.0.0.1:5176/programs', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1200);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'final_proof_programs_desktop.png') });
  }

  await browser.close();
  console.log('All final master proofs captured successfully!');
}

main().catch(console.error);
