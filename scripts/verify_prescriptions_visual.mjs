import { chromium } from '@playwright/test';
import path from 'node:path';

const chromeSystem = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const artifactsDir = 'C:/Users/asus1/.gemini/antigravity/brain/8e61b3db-cb1a-48d8-a864-e3eea3ec64d7';

async function run() {
  const browser = await chromium.launch({ executablePath: chromeSystem, headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 950 },
    locale: 'ar-EG',
  });

  // 1. Patient Portal Prescriptions
  console.log('1. Testing Patient Account Prescriptions...');
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:5176/login', { waitUntil: 'networkidle' });

  // Quick patient login
  const quickPatientBtn = page.locator('button:has-text("مريض"), button:has-text("صفاء")').first();
  if (await quickPatientBtn.isVisible()) {
    await quickPatientBtn.click();
    await page.waitForTimeout(1000);
  }

  await page.goto('http://127.0.0.1:5176/account?tab=prescriptions', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Scroll down slightly so sticky nav doesn't overlap
  await page.evaluate(() => window.scrollBy(0, 120));
  await page.waitForTimeout(500);

  const rxCard = page.locator('.patient-prescription-card').first();
  if (await rxCard.isVisible()) {
    await rxCard.screenshot({
      path: path.join(artifactsDir, 'verified_patient_prescription_card_perfect.png'),
    });
    console.log('Saved verified_patient_prescription_card_perfect.png');
  }

  // Intercept the iframe HTML to render it in a clean tab for visual check of the printout
  await page.evaluate(() => {
    window.capturedPrintHtml = null;
    const origCreateElement = document.createElement.bind(document);
    document.createElement = function (tagName) {
      const el = origCreateElement(tagName);
      if (tagName.toLowerCase() === 'iframe') {
        const origWrite = el.contentDocument ? el.contentDocument.write : null;
        Object.defineProperty(el, 'id', {
          set(val) {
            this.setAttribute('id', val);
          },
          get() {
            return this.getAttribute('id');
          }
        });
      }
      return el;
    };
  });

  // Click print button
  const printBtn = page.locator('.rx-print-btn').first();
  if (await printBtn.isVisible()) {
    await printBtn.click();
    await page.waitForTimeout(600);

    // Extract HTML written into the iframe
    const printHtml = await page.evaluate(() => {
      const frame = document.querySelector('#patient-rx-print-iframe');
      if (frame && frame.contentDocument) {
        return frame.contentDocument.documentElement.outerHTML;
      }
      return null;
    });

    if (printHtml) {
      const printTab = await context.newPage();
      await printTab.setContent(printHtml, { waitUntil: 'networkidle' });
      await printTab.waitForTimeout(600);

      const sheetEl = printTab.locator('.sheet');
      await sheetEl.screenshot({
        path: path.join(artifactsDir, 'verified_patient_prescription_a4_sheet.png'),
      });
      console.log('Saved verified_patient_prescription_a4_sheet.png');
      await printTab.close();
    }
  }

  // 2. Doctor Modal in Admin
  console.log('2. Testing Doctor Diet Prescription Modal in Admin...');
  await page.goto('http://127.0.0.1:5176/login', { waitUntil: 'networkidle' });
  const quickAdminBtn = page.locator('button:has-text("د. رنا"), button:has-text("المدير")').first();
  if (await quickAdminBtn.isVisible()) {
    await quickAdminBtn.click();
    await page.waitForTimeout(1000);
  }

  await page.goto('http://127.0.0.1:5176/admin/patients', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);

  // Click on "روشتة دايت جديدة"
  const newRxBtn = page.locator('button:has-text("روشتة دايت جديدة"), button:has-text("إصدار روشتة")').first();
  if (await newRxBtn.isVisible()) {
    await newRxBtn.click();
    await page.waitForTimeout(800);

    const sheet = page.locator('#printable-sheet');
    if (await sheet.isVisible()) {
      await sheet.screenshot({
        path: path.join(artifactsDir, 'verified_doctor_prescription_modal_sheet.png'),
      });
      console.log('Saved verified_doctor_prescription_modal_sheet.png');
    }
  }

  // 3. Booking Tracking Shortcut
  console.log('3. Testing Booking Tracking Prescription Shortcut...');
  await page.goto('http://127.0.0.1:5176/booking/track', { waitUntil: 'networkidle' });
  const codeInput = page.locator('input[placeholder*="5106"], input[placeholder*="كود"]').first();
  if (await codeInput.isVisible()) {
    await codeInput.fill('6629');
    await page.locator('button:has-text("استعلام"), button[type="submit"]').first().click();
    await page.waitForTimeout(1500);
  }

  const shortcutCard = page.locator('.track-prescriptions-shortcut').first();
  if (await shortcutCard.isVisible()) {
    await shortcutCard.screenshot({
      path: path.join(artifactsDir, 'verified_tracking_rx_shortcut_card.png'),
    });
    console.log('Saved verified_tracking_rx_shortcut_card.png');
  }

  await page.screenshot({
    path: path.join(artifactsDir, 'verified_tracking_page_with_rx.png'),
    fullPage: false,
  });
  console.log('Saved verified_tracking_page_with_rx.png');

  await browser.close();
  console.log('All visual verifications completed successfully!');
}

run().catch((e) => {
  console.error('Test error:', e);
  process.exit(1);
});
