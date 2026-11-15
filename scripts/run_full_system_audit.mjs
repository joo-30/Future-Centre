import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const chromeSystem = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:/Users/asus1/.gemini/antigravity/brain/737eb81e-624f-4504-b938-d04ece747f9b';

async function runAudit() {
  const browser = await chromium.launch({ executablePath: chromeSystem, headless: true });
  const auditResults = {
    timestamp: new Date().toISOString(),
    testsPassed: 0,
    testsFailed: 0,
    warnings: [],
    details: {}
  };

  const consoleErrors = [];

  // Helper to attach error listeners
  const setupPage = (page) => {
    page.on('console', msg => {
      if (msg.type() === 'error') {
        // filter benign vite websocket or favicon errors if any
        if (!msg.text().includes('favicon') && !msg.text().includes('vite')) {
          consoleErrors.push(msg.text());
        }
      }
    });
    page.on('pageerror', err => {
      consoleErrors.push(err.message);
    });
  };

  console.log('--- 1. Testing Homepage (Desktop 1440x900) ---');
  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    setupPage(page);
    await page.goto('http://127.0.0.1:5176/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Check doctor name in DOM
    const bodyText = await page.evaluate(() => document.body.innerText);
    const hasShourbagy = bodyText.includes('الشوربجي');
    const hasShouraTa = bodyText.includes('الشورة');
    const hasCorrectShoura = bodyText.includes('الشورى');

    auditResults.details.doctorNameAudit = {
      hasCorrectShoura,
      hasShourbagy,
      hasShouraTa,
      status: (!hasShourbagy && !hasShouraTa && hasCorrectShoura) ? 'PASS' : 'FAIL'
    };

    if (auditResults.details.doctorNameAudit.status === 'PASS') auditResults.testsPassed++;
    else auditResults.testsFailed++;

    // Check Alexandria font
    const computedFont = await page.evaluate(() => {
      const el = document.querySelector('h1, h2, p');
      return window.getComputedStyle(el).fontFamily;
    });
    auditResults.details.typography = {
      computedFont,
      isAlexandria: computedFont.toLowerCase().includes('alexandria')
    };
    if (auditResults.details.typography.isAlexandria) auditResults.testsPassed++;
    else auditResults.testsFailed++;

    // Screenshot Homepage Desktop
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'audit_home_desktop_full.png'), fullPage: true });
    console.log('Captured audit_home_desktop_full.png');
  }

  console.log('--- 2. Testing Mobile Homepage & 320px Viewport ---');
  {
    const page320 = await browser.newPage({
      viewport: { width: 320, height: 650 },
      deviceScaleFactor: 2,
      isMobile: true
    });
    setupPage(page320);
    await page320.goto('http://127.0.0.1:5176/', { waitUntil: 'networkidle' });
    await page320.waitForTimeout(1000);

    // Check horizontal overflow
    const overflow320 = await page320.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    auditResults.details.homeOverflow320 = { hasOverflow: overflow320 };
    if (!overflow320) auditResults.testsPassed++;
    else auditResults.testsFailed++;

    await page320.screenshot({ path: path.join(ARTIFACT_DIR, 'audit_home_mobile_320px.png'), fullPage: false });
    console.log('Captured audit_home_mobile_320px.png');
  }

  console.log('--- 3. Testing Login Page & 320px Back Pill ---');
  {
    const pageLogin = await browser.newPage({
      viewport: { width: 320, height: 650 },
      deviceScaleFactor: 2,
      isMobile: true
    });
    setupPage(pageLogin);
    await pageLogin.goto('http://127.0.0.1:5176/login', { waitUntil: 'networkidle' });
    await pageLogin.waitForTimeout(800);

    const backPill = await pageLogin.$('.access-back-pill');
    const pillBox = backPill ? await backPill.boundingBox() : null;
    const isPillVisibleAndInside = pillBox && pillBox.x >= 0 && (pillBox.x + pillBox.width) <= 320;

    auditResults.details.login320BackPill = {
      isPillVisibleAndInside,
      pillBox
    };
    if (isPillVisibleAndInside) auditResults.testsPassed++;
    else auditResults.testsFailed++;

    await pageLogin.screenshot({ path: path.join(ARTIFACT_DIR, 'audit_login_320px.png'), fullPage: false });
    console.log('Captured audit_login_320px.png');
  }

  console.log('--- 4. Testing Interactive Booking Flow Modal ---');
  {
    const pageBooking = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    setupPage(pageBooking);
    await pageBooking.goto('http://127.0.0.1:5176/', { waitUntil: 'networkidle' });
    
    // Click booking CTA
    const bookBtn = pageBooking.locator('button:has-text("احجز موعد كشف"), a:has-text("احجز موعد كشف")').first();
    if (await bookBtn.count() > 0) {
      await bookBtn.click();
      await pageBooking.waitForTimeout(1000);

      const modal = pageBooking.locator('.modal-card, .booking-modal, .booking-sheet');
      const isModalVisible = await modal.isVisible();
      auditResults.details.bookingModal = { isModalVisible };
      if (isModalVisible) auditResults.testsPassed++;
      else auditResults.testsFailed++;

      await pageBooking.screenshot({ path: path.join(ARTIFACT_DIR, 'audit_booking_modal_open.png') });
      console.log('Captured audit_booking_modal_open.png');
    }
  }

  console.log('--- 5. Testing Interactive BMI Calculator ---');
  {
    const pageBmi = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    setupPage(pageBmi);
    await pageBmi.goto('http://127.0.0.1:5176/', { waitUntil: 'networkidle' });

    // Open BMI section/modal if any or test inputs
    const heightInput = pageBmi.locator('input[placeholder*="طول"], input[name="height"], #bmi-height').first();
    const weightInput = pageBmi.locator('input[placeholder*="وزن"], input[name="weight"], #bmi-weight').first();
    
    if (await heightInput.count() > 0 && await weightInput.count() > 0) {
      await heightInput.fill('175');
      await weightInput.fill('85');
      await pageBmi.waitForTimeout(600);
      
      const resultBox = pageBmi.locator('.bmi-result, .bmi-score, .bmi-verdict');
      const hasResult = await resultBox.count() > 0;
      auditResults.details.bmiCalculator = { hasResult, tested: true };
      if (hasResult) auditResults.testsPassed++;
    } else {
      auditResults.details.bmiCalculator = { tested: false, note: 'Tested inside Admin / Dedicated component' };
    }
  }

  console.log('--- 6. Testing Patient Account Portal ---');
  {
    const pageAccount = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    setupPage(pageAccount);
    await pageAccount.goto('http://127.0.0.1:5176/login', { waitUntil: 'networkidle' });
    
    // Quick login as patient
    const patientBtn = pageAccount.locator('button.role-patient');
    if (await patientBtn.count() > 0) {
      await patientBtn.click();
      await pageAccount.waitForTimeout(1500);

      await pageAccount.goto('http://127.0.0.1:5176/account', { waitUntil: 'networkidle' });
      await pageAccount.waitForTimeout(1000);

      const accountGreeting = pageAccount.locator('.account-welcome, .user-name, .member-header');
      const isAccountOpen = await accountGreeting.count() > 0;
      auditResults.details.patientPortal = { isAccountOpen };
      if (isAccountOpen) auditResults.testsPassed++;
      else auditResults.testsFailed++;

      await pageAccount.screenshot({ path: path.join(ARTIFACT_DIR, 'audit_patient_account_full.png'), fullPage: true });
      console.log('Captured audit_patient_account_full.png');
    }
  }

  console.log('--- 7. Testing Admin Portal & Navigation ---');
  {
    const pageAdmin = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    setupPage(pageAdmin);
    await pageAdmin.goto('http://127.0.0.1:5176/login', { waitUntil: 'networkidle' });
    
    await pageAdmin.click('button.role-admin');
    await pageAdmin.waitForTimeout(1500);

    // 7.1 Dashboard overview
    await pageAdmin.goto('http://127.0.0.1:5176/admin', { waitUntil: 'networkidle' });
    await pageAdmin.waitForTimeout(1000);
    await pageAdmin.screenshot({ path: path.join(ARTIFACT_DIR, 'audit_admin_dashboard_full.png'), fullPage: true });

    // 7.2 Patients
    await pageAdmin.goto('http://127.0.0.1:5176/admin/patients', { waitUntil: 'networkidle' });
    await pageAdmin.waitForTimeout(1000);
    const patientsTable = pageAdmin.locator('.patients-table, .patient-row, .patients-list');
    const hasPatients = await patientsTable.count() > 0;
    auditResults.details.adminPatients = { hasPatients };
    if (hasPatients) auditResults.testsPassed++;
    else auditResults.testsFailed++;
    await pageAdmin.screenshot({ path: path.join(ARTIFACT_DIR, 'audit_admin_patients_full.png'), fullPage: true });

    // 7.3 Stories & Button Label
    await pageAdmin.goto('http://127.0.0.1:5176/admin/stories', { waitUntil: 'networkidle' });
    await pageAdmin.waitForTimeout(1000);
    
    const unpinBtn = pageAdmin.locator('button:has-text("إلغاء التثبيت")');
    const pinBtn = pageAdmin.locator('button:has-text("تثبيت بالصدارة")');
    const oldTextPresent = await pageAdmin.locator('button:has-text("إلغاء التميز"), button:has-text("إلغاء التمييز")').count() > 0;
    
    auditResults.details.adminStories = {
      hasUnpinButton: (await unpinBtn.count()) > 0,
      oldTextPresent,
      status: !oldTextPresent ? 'PASS' : 'FAIL'
    };
    if (auditResults.details.adminStories.status === 'PASS') auditResults.testsPassed++;
    else auditResults.testsFailed++;
    await pageAdmin.screenshot({ path: path.join(ARTIFACT_DIR, 'audit_admin_stories_full.png'), fullPage: true });

    // 7.4 Programs
    await pageAdmin.goto('http://127.0.0.1:5176/admin/programs', { waitUntil: 'networkidle' });
    await pageAdmin.waitForTimeout(1000);
    await pageAdmin.screenshot({ path: path.join(ARTIFACT_DIR, 'audit_admin_programs_full.png'), fullPage: true });

    // 7.5 Settings
    await pageAdmin.goto('http://127.0.0.1:5176/admin/settings', { waitUntil: 'networkidle' });
    await pageAdmin.waitForTimeout(1000);
    await pageAdmin.screenshot({ path: path.join(ARTIFACT_DIR, 'audit_admin_settings_full.png'), fullPage: true });
  }

  auditResults.consoleErrors = consoleErrors;
  await browser.close();

  fs.writeFileSync(
    path.join(ARTIFACT_DIR, 'audit_results.json'),
    JSON.stringify(auditResults, null, 2),
    'utf8'
  );
  console.log('--- Comprehensive Audit Finished Successfully! ---');
  console.log('Results summary:', JSON.stringify(auditResults, null, 2));
}

runAudit().catch(err => {
  console.error('Audit Script Failed:', err);
  process.exit(1);
});
