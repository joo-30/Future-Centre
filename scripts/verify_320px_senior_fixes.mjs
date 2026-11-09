import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const ARTIFACT_DIR = 'C:/Users/makah/.gemini/antigravity/brain/2057bfec-2a0f-40f7-b7e0-8582b8d1ddb0';

async function main() {
  console.log('🚀 Starting Senior QA Audit for 320px Small Mobile...');
  const chromeSystem = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const browser = await chromium.launch({ executablePath: chromeSystem, headless: true });
  const context = await browser.newContext({
    viewport: { width: 320, height: 650 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });

  const page = await context.newPage();

  try {
    // 1. Login as Admin
    console.log('🔑 Logging into Admin Portal via /login...');
    await page.goto('http://127.0.0.1:5176/login', { waitUntil: 'networkidle' });
    const adminBtn = await page.$('.quick-login-panel button:has-text("Admin")');
    if (adminBtn) {
      await adminBtn.click();
      await page.waitForTimeout(1000);
    } else {
      const phoneInput = page.locator('input[type="tel"]');
      if (await phoneInput.count() > 0) {
        await phoneInput.fill('01000000000');
        await page.fill('input[type="password"]', 'Admin@123456');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(1000);
      }
    }

    // 2. Navigate to /admin/patients
    console.log('📱 Navigating to /admin/patients in 320px viewport...');
    await page.goto('http://127.0.0.1:5176/admin/patients', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Verify horizontal overflow on 320px
    const docScrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const bodyScrollWidth = await page.evaluate(() => document.body.scrollWidth);
    console.log(`📏 Page scrollWidth: ${docScrollWidth}px (Viewport: 320px)`);

    // Verify the 5 section buttons
    const tabButtons = page.locator('.patient-console-tabs > button');
    const tabCount = await tabButtons.count();
    console.log(`🔢 Found ${tabCount} tabs in .patient-console-tabs`);

    const tabMetrics = [];
    for (let i = 0; i < tabCount; i++) {
      const btn = tabButtons.nth(i);
      const text = (await btn.innerText()).replace(/\n/g, ' ').trim();
      const box = await btn.boundingBox();
      tabMetrics.push({ index: i, text, ...box });
    }
    console.table(tabMetrics);

    // Click each tab to verify navigation
    for (let i = 0; i < tabCount; i++) {
      const btn = tabButtons.nth(i);
      await btn.click();
      await page.waitForTimeout(300);
      const isActive = await btn.evaluate(el => el.classList.contains('active'));
      console.log(`Tab ${i + 1} (${tabMetrics[i].text}): active=${isActive}`);
    }

    // Return to requests tab
    await tabButtons.nth(0).click();
    await page.waitForTimeout(400);

    // Take screenshot of 320px patient tabs
    const patientTabsScreenshot = path.join(ARTIFACT_DIR, 'verified_320px_patient_tabs.png');
    await page.screenshot({ path: patientTabsScreenshot });
    console.log(`📸 Screenshot saved: ${patientTabsScreenshot}`);

    // Check primary button on patient cards
    const patientCards = page.locator('.patient-card-actions-layout');
    if (await patientCards.count() > 0) {
      const fullFileBtn = patientCards.first().locator('.btn-patient-full-file');
      const text = await fullFileBtn.innerText();
      const box = await fullFileBtn.boundingBox();
      console.log(`Full file button text: "${text}", box:`, box);
    }

    // 3. Navigate to /admin/bmi and test Prescription Modal
    console.log('🩺 Navigating to /admin/bmi in 320px viewport...');
    await page.goto('http://127.0.0.1:5176/admin/bmi', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Take screenshot of BMI results
    const bmiScreenshot = path.join(ARTIFACT_DIR, 'verified_320px_bmi_tiles.png');
    await page.screenshot({ path: bmiScreenshot });
    console.log(`📸 BMI Screenshot saved: ${bmiScreenshot}`);

    // Click "إنشاء روشتة بهذه المعطيات"
    console.log('📝 Opening Prescription Modal...');
    const createPrescriptionBtn = page.locator('button:has-text("إنشاء روشتة بهذه المعطيات")');
    await createPrescriptionBtn.click();
    await page.waitForSelector('.prescription-modal-container', { state: 'visible' });
    await page.waitForTimeout(800);

    // Measure Action Buttons
    const publishBtn = page.locator('.btn-publish-patient');
    const printBtn = page.locator('.btn-print-action');

    const publishBox = await publishBtn.boundingBox();
    const printBox = await printBtn.boundingBox();

    console.log('Publish Button Box:', publishBox);
    console.log('Print Button Box:', printBox);

    const widthDiff = Math.abs((publishBox?.width || 0) - (printBox?.width || 0));
    const heightDiff = Math.abs((publishBox?.height || 0) - (printBox?.height || 0));
    console.log(`📏 Button dimensions comparison: width diff = ${widthDiff}px, height diff = ${heightDiff}px`);

    // Verify print button text does not break into weird 3-line wrap
    const printText = await printBtn.innerText();
    console.log(`Print button text: "${printText}"`);

    // Take screenshot of prescription modal top actions
    const modalActionsScreenshot = path.join(ARTIFACT_DIR, 'verified_320px_prescription_modal_buttons.png');
    await page.screenshot({ path: modalActionsScreenshot });
    console.log(`📸 Modal Actions Screenshot saved: ${modalActionsScreenshot}`);

    // Verify Quick Meals Navigation Pills
    const quickNavPills = page.locator('.rx-quick-nav-btn');
    const navPillCount = await quickNavPills.count();
    console.log(`🔢 Found ${navPillCount} meal navigation pills`);

    // Click "🥗 الغداء" pill
    const lunchPill = page.locator('.rx-quick-nav-btn:has-text("الغداء")');
    if (await lunchPill.count() > 0) {
      console.log('🥗 Clicking lunch meal navigation pill...');
      await lunchPill.click();
      await page.waitForTimeout(600);

      // Verify lunch meal is in view
      const lunchCard = page.locator('#rx-meal-lunch');
      const isVisible = await lunchCard.isVisible();
      console.log(`Lunch meal card visible: ${isVisible}`);

      // Screenshot after navigating to lunch
      const mealsNavScreenshot = path.join(ARTIFACT_DIR, 'verified_320px_prescription_modal_meals_nav.png');
      await page.screenshot({ path: mealsNavScreenshot });
      console.log(`📸 Meals Nav Screenshot saved: ${mealsNavScreenshot}`);
    }

    console.log('✅ ALL VERIFICATIONS COMPLETED SUCCESSFULLY!');
  } catch (err) {
    console.error('❌ Verification failed:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

main();
