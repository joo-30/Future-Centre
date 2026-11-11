import path from 'node:path';
import { chromium } from '@playwright/test';

const chromeSystem = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:/Users/asus1/.gemini/antigravity/brain/737eb81e-624f-4504-b938-d04ece747f9b';

async function verifyAll() {
  const browser = await chromium.launch({ executablePath: chromeSystem, headless: true });

  // 1. Admin Views
  const adminPage = await browser.newPage();
  await adminPage.setViewportSize({ width: 1440, height: 900 });
  await adminPage.goto('http://127.0.0.1:5176/login', { waitUntil: 'networkidle' });
  await adminPage.click('button.role-admin');
  await adminPage.waitForTimeout(1500);

  // Topbar and Sidebar Profile Verification
  await adminPage.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_admin_topbar_cleaned.png') });

  // Admin Programs Action Buttons Verification
  await adminPage.goto('http://127.0.0.1:5176/admin/programs', { waitUntil: 'networkidle' });
  await adminPage.waitForTimeout(800);
  const progActions = adminPage.locator('.prog-actions-row').first();
  if (await progActions.isVisible()) {
    await progActions.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_prog_actions_fixed.png') });
  }
  await adminPage.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_admin_programs_page.png') });
  await adminPage.close();

  // 2. Homepage Monthly Program Card Verification
  const homePage = await browser.newPage();
  await homePage.setViewportSize({ width: 1440, height: 900 });
  await homePage.goto('http://127.0.0.1:5176/', { waitUntil: 'networkidle' });
  await homePage.waitForTimeout(800);

  const progSection = homePage.locator('.programs-section');
  if (await progSection.isVisible()) {
    await progSection.scrollIntoViewIfNeeded();
    await homePage.waitForTimeout(500);
    // 2a. Collapsed default state
    await homePage.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_homepage_program_collapsed.png') });

    // 2b. Click toggle to expand
    const toggleBtn = homePage.locator('.pfp-toggle-details-btn');
    if (await toggleBtn.isVisible()) {
      await toggleBtn.click();
      await homePage.waitForTimeout(400);
      await homePage.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_homepage_program_expanded.png') });
    }
  }

  // 2c. Mobile view of the simplified card
  await homePage.setViewportSize({ width: 390, height: 844 });
  await homePage.waitForTimeout(400);
  await homePage.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_homepage_program_mobile.png') });

  await homePage.close();
  await browser.close();
  console.log('All verification screenshots captured successfully!');
}

verifyAll().catch(console.error);
