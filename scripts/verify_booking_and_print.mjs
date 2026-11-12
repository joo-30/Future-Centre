import { chromium } from '@playwright/test';

const chromeSystem = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function main() {
  const browser = await chromium.launch({ executablePath: chromeSystem, headless: true });
  
  // 1. Verify Booking page at 1280px (laptop viewport)
  console.log('1. Testing /booking page at 1280px...');
  const page = await browser.newPage({ viewport: { width: 1280, height: 850 }, locale: 'ar-EG' });
  await page.goto('http://127.0.0.1:5176/booking', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  await page.screenshot({
    path: 'C:/Users/asus1/.gemini/antigravity/brain/8e61b3db-cb1a-48d8-a864-e3eea3ec64d7/verified_booking_page_spacious_1280.png',
    fullPage: false,
  });
  console.log('Saved verified_booking_page_spacious_1280.png');

  // Also full page screenshot
  await page.screenshot({
    path: 'C:/Users/asus1/.gemini/antigravity/brain/8e61b3db-cb1a-48d8-a864-e3eea3ec64d7/verified_booking_page_full.png',
    fullPage: true,
  });
  console.log('Saved verified_booking_page_full.png');

  // 2. Verify Print Ticket
  console.log('2. Testing Print Ticket from /booking/track...');
  await page.goto('http://127.0.0.1:5176/booking/track', { waitUntil: 'networkidle' });
  const input = page.locator('input[placeholder*="010"], input[type="text"]').first();
  await input.fill('01018943300');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(1500);

  // Intercept the hidden iframe created by handlePrint or trigger handlePrint
  const printBtn = page.locator('.bqp-btn-print').first();
  if (await printBtn.isVisible()) {
    console.log('Found Print button, clicking it...');
    
    // We can also evaluate what HTML handlePrint writes to the iframe, or capture the iframe content
    await page.evaluate(() => {
      // Find the print button and click
      const btn = document.querySelector('.bqp-btn-print');
      if (btn) btn.click();
    });

    await page.waitForTimeout(600);

    // Look for the print iframe in the DOM
    const iframeHandle = await page.$('iframe[aria-hidden="true"]');
    if (iframeHandle) {
      console.log('Found print iframe! Capturing print ticket content...');
      const frame = await iframeHandle.contentFrame();
      if (frame) {
        const ticketElement = await frame.$('.print-ticket-container');
        if (ticketElement) {
          await ticketElement.screenshot({
            path: 'C:/Users/asus1/.gemini/antigravity/brain/8e61b3db-cb1a-48d8-a864-e3eea3ec64d7/verified_printed_ticket_card.png',
          });
          console.log('Saved verified_printed_ticket_card.png');
        }
      }
    }
  }

  // Also test browser print media emulation on the tracking page!
  console.log('3. Testing @media print emulation on /booking/track...');
  await page.emulateMedia({ media: 'print' });
  await page.waitForTimeout(400);
  await page.screenshot({
    path: 'C:/Users/asus1/.gemini/antigravity/brain/8e61b3db-cb1a-48d8-a864-e3eea3ec64d7/verified_browser_print_emulation.png',
    fullPage: true,
  });
  console.log('Saved verified_browser_print_emulation.png');

  await browser.close();
  console.log('All verification completed successfully!');
}

main().catch((err) => {
  console.error('Error in verification:', err);
  process.exit(1);
});
