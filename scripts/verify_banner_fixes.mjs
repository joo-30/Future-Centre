import path from 'node:path';
import { chromium } from '@playwright/test';

const chromeSystem = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:/Users/asus1/.gemini/antigravity/brain/737eb81e-624f-4504-b938-d04ece747f9b';

async function verifyUpdates() {
  const browser = await chromium.launch({ executablePath: chromeSystem, headless: true });
  
  // 1. Desktop Homepage - Stories CTA & Footer
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://127.0.0.1:5176/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);

  // Scroll to the redesigned stories CTA banner
  await page.evaluate(() => {
    const el = document.querySelector('.stories-cta-banner');
    if (el) el.scrollIntoView({ block: 'center' });
  });
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_redesigned_stories_cta.png') });

  // Scroll to footer to verify no duplicate dark banner
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_footer_no_cta.png') });

  // 2. Mobile View
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => {
    const el = document.querySelector('.stories-cta-banner');
    if (el) el.scrollIntoView({ block: 'center' });
  });
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_mobile_stories_cta.png') });

  // 3. Client Account page bottom
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://127.0.0.1:5176/login', { waitUntil: 'networkidle' });
  const rolePatient = await page.$('button.role-patient');
  if (rolePatient) {
    await rolePatient.click();
    await page.waitForTimeout(1000);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_account_bottom_no_cta.png') });
  }

  await browser.close();
  console.log('Verification screenshots captured successfully!');
}

verifyUpdates().catch(console.error);
