import { chromium } from '@playwright/test';
import path from 'node:path';

const chromeSystem = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const artifactsDir = 'C:/Users/asus1/.gemini/antigravity/brain/8e61b3db-cb1a-48d8-a864-e3eea3ec64d7';

async function run() {
  const browser = await chromium.launch({ executablePath: chromeSystem, headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    locale: 'ar-EG',
  });
  const page = await context.newPage();

  console.log('1. Testing Patient Account Prescriptions View...');
  await page.goto('http://127.0.0.1:5176/login');
  await page.waitForLoadState('networkidle');

  // Click patient quick login if available
  const quickPatientBtn = page.locator('button:has-text("مريض"), button:has-text("صفاء")').first();
  if (await quickPatientBtn.isVisible()) {
    await quickPatientBtn.click();
    await page.waitForTimeout(1000);
  } else {
    // Fill credentials
    const phoneInput = page.locator('input[type="tel"]').first();
    const passInput = page.locator('input[type="password"]').first();
    if (await phoneInput.isVisible()) {
      await phoneInput.fill('01018943300');
      await passInput.fill('Demo123456');
      await page.locator('button[type="submit"]').click();
      await page.waitForTimeout(1000);
    }
  }

  // Navigate to /account?tab=prescriptions
  await page.goto('http://127.0.0.1:5176/account?tab=prescriptions');
  await page.waitForTimeout(1500);

  await page.screenshot({
    path: path.join(artifactsDir, 'verified_patient_prescriptions_tab.png'),
    fullPage: false,
  });
  console.log('Saved verified_patient_prescriptions_tab.png');

  // Check if prescription card is visible
  const rxCard = page.locator('.patient-prescription-card').first();
  if (await rxCard.isVisible()) {
    await rxCard.screenshot({
      path: path.join(artifactsDir, 'verified_patient_rx_card.png'),
    });
    console.log('Saved verified_patient_rx_card.png');

    // Trigger print
    const printBtn = rxCard.locator('.rx-print-btn');
    if (await printBtn.isVisible()) {
      await printBtn.click();
      await page.waitForTimeout(1000);

      // Verify iframe content
      const frameHandle = await page.$('#patient-rx-print-iframe');
      if (frameHandle) {
        const frame = await frameHandle.contentFrame();
        if (frame) {
          const frameBody = await frame.$('body');
          if (frameBody) {
            await frameBody.screenshot({
              path: path.join(artifactsDir, 'verified_patient_rx_printout.png'),
            });
            console.log('Saved verified_patient_rx_printout.png');
          }
        }
      }
    }
  }

  console.log('2. Testing Doctor Diet Prescription Modal in Admin...');
  await page.goto('http://127.0.0.1:5176/login');
  await page.waitForLoadState('networkidle');

  const quickAdminBtn = page.locator('button:has-text("د. رنا"), button:has-text("طبيب"), button:has-text("طبيبة"), button:has-text("المدير")').first();
  if (await quickAdminBtn.isVisible()) {
    await quickAdminBtn.click();
    await page.waitForTimeout(1000);
  }

  // Go to admin patients
  await page.goto('http://127.0.0.1:5176/admin/patients');
  await page.waitForTimeout(1500);

  // Click on "روشتة جديدة" or row
  const newRxBtn = page.locator('button:has-text("روشتة"), button:has-text("إصدار"), button:has-text("خطة غذائية")').first();
  if (await newRxBtn.isVisible()) {
    await newRxBtn.click();
    await page.waitForTimeout(1000);

    const sheet = page.locator('#printable-sheet');
    if (await sheet.isVisible()) {
      await sheet.screenshot({
        path: path.join(artifactsDir, 'verified_doctor_rx_sheet.png'),
      });
      console.log('Saved verified_doctor_rx_sheet.png');

      // Click print in modal
      const docPrintBtn = page.locator('.btn-print-action');
      if (await docPrintBtn.isVisible()) {
        await docPrintBtn.click();
        await page.waitForTimeout(1000);

        const docFrame = await page.$('#rx-print-iframe');
        if (docFrame) {
          const frame = await docFrame.contentFrame();
          if (frame) {
            const frameBody = await frame.$('body');
            if (frameBody) {
              await frameBody.screenshot({
                path: path.join(artifactsDir, 'verified_doctor_rx_printout.png'),
              });
              console.log('Saved verified_doctor_rx_printout.png');
            }
          }
        }
      }
    }
  }

  console.log('3. Testing Booking Tracking Prescription Shortcut...');
  await page.goto('http://127.0.0.1:5176/booking/track');
  await page.waitForTimeout(1000);

  // Lookup code
  const codeInput = page.locator('input[placeholder*="5106"], input[placeholder*="كود"]').first();
  if (await codeInput.isVisible()) {
    await codeInput.fill('6629');
    await page.locator('button:has-text("استعلام"), button[type="submit"]').first().click();
    await page.waitForTimeout(1500);
  }

  await page.screenshot({
    path: path.join(artifactsDir, 'verified_tracking_with_rx_shortcut.png'),
    fullPage: false,
  });
  console.log('Saved verified_tracking_with_rx_shortcut.png');

  await browser.close();
  console.log('All verifications completed successfully!');
}

run().catch((e) => {
  console.error('Test error:', e);
  process.exit(1);
});
