import { chromium } from '@playwright/test';

const chromeSystem = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function main() {
  const browser = await chromium.launch({ executablePath: chromeSystem, headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 850 },
    locale: 'ar-EG',
  });
  const page = await context.newPage();

  console.log('1. Navigating to booking page...');
  await page.goto('http://127.0.0.1:5176/booking', { waitUntil: 'networkidle' });

  // Look for any existing appointment or create a quick test booking
  // Or navigate directly to tracking lookup
  console.log('2. Navigating to tracking page...');
  await page.goto('http://127.0.0.1:5176/booking/track', { waitUntil: 'networkidle' });

  // Lookup appointment by phone or reference
  console.log('3. Looking up appointment...');
  const input = page.locator('input[placeholder*="010"], input[type="text"]').first();
  await input.fill('01018943300');
  await page.click('button[type="submit"]');

  await page.waitForTimeout(2000);

  // Take screenshot of desktop tracking page overview
  await page.screenshot({ path: 'C:/Users/asus1/.gemini/antigravity/brain/8e61b3db-cb1a-48d8-a864-e3eea3ec64d7/verified_tracking_desktop_overview.png', fullPage: false });
  console.log('Saved verified_tracking_desktop_overview.png');

  // Scroll down to see buttons and safe tracking link
  await page.evaluate(() => window.scrollBy(0, 320));
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'C:/Users/asus1/.gemini/antigravity/brain/8e61b3db-cb1a-48d8-a864-e3eea3ec64d7/verified_tracking_buttons_scrolled.png' });
  console.log('Saved verified_tracking_buttons_scrolled.png');
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);

  // Test QR Zoom Lightbox
  console.log('4. Testing QR Zoom click...');
  const qrBox = page.locator('.bqp-clickable-zoom').first();
  if (await qrBox.isVisible()) {
    await qrBox.click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: 'C:/Users/asus1/.gemini/antigravity/brain/8e61b3db-cb1a-48d8-a864-e3eea3ec64d7/verified_qr_zoom_lightbox.png' });
    console.log('Saved verified_qr_zoom_lightbox.png');

    // Close zoom
    await page.click('.bqp-zoom-close-btn');
    await page.waitForTimeout(400);
  }

  // Test Reschedule Dialog & DatePicker
  console.log('5. Testing Reschedule Dialog & DatePicker...');
  const rescheduleBtn = page.locator('text=طلب تغيير الموعد').first();
  if (await rescheduleBtn.isVisible()) {
    await rescheduleBtn.click();
    await page.waitForTimeout(1000);

    // Take screenshot of reschedule modal
    await page.screenshot({ path: 'C:/Users/asus1/.gemini/antigravity/brain/8e61b3db-cb1a-48d8-a864-e3eea3ec64d7/verified_reschedule_modal_open.png' });
    console.log('Saved verified_reschedule_modal_open.png');

    // Click DatePicker trigger to open calendar
    const datePickerTrigger = page.locator('.custom-datepicker-trigger').first();
    if (await datePickerTrigger.isVisible()) {
      await datePickerTrigger.click();
      await page.waitForTimeout(600);
      await page.screenshot({ path: 'C:/Users/asus1/.gemini/antigravity/brain/8e61b3db-cb1a-48d8-a864-e3eea3ec64d7/verified_datepicker_in_place.png' });
      console.log('Saved verified_datepicker_in_place.png');
    }
  }

  await browser.close();
  console.log('Verification script completed successfully!');
}

main().catch((err) => {
  console.error('Error in verification script:', err);
  process.exit(1);
});
