import { chromium } from 'playwright';

const chromeSystem = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function testGuestReturnFlow() {
  const browser = await chromium.launch({ executablePath: chromeSystem, headless: true });
  const context = await browser.newContext({ viewport: { width: 1366, height: 768 } });
  const page = await context.newPage();

  console.log('1. Guest opens booking page...');
  await page.goto('http://127.0.0.1:5176/booking', { waitUntil: 'networkidle' });

  // Verify the booking-lookup-nav link is present on /booking
  const trackNav = page.locator('.booking-lookup-nav-link');
  console.log('2. Direct tracking link visible on /booking:', await trackNav.isVisible());

  // Fill booking form
  console.log('3. Filling booking form...');
  await page.fill('input[name="name"]', 'مريم أحمد');
  await page.fill('input[name="phone"]', '01099887766');

  // If today is closed or has no slots, navigate to next day
  const emptyNotice = await page.locator('.empty-slots').isVisible();
  if (emptyNotice) {
    console.log('Today closed, clicking next day...');
    await page.click('.empty-slots button');
    await page.waitForTimeout(500);
  }

  // Pick available slot
  await page.waitForSelector('.times button.time:not(:disabled)', { timeout: 10000 });
  const slot = page.locator('.times button.time:not(:disabled)').first();
  await slot.click();

  // Check consent and submit
  await page.check('input[name="consent"]');
  console.log('4. Submitting booking...');
  await page.click('button[type="submit"]');

  // Wait for navigation to /booking/track
  await page.waitForURL('**/booking/track**', { timeout: 10000 });
  console.log('5. Navigated to tracking page:', page.url());

  // Check localStorage was populated
  const savedBooking = await page.evaluate(() => localStorage.getItem('fc_recent_booking'));
  console.log('6. Stored in localStorage:', savedBooking);

  // 7. Simulate client returning after 2 hours without URL token:
  console.log('7. Client visits /booking/track directly without token hash...');
  await page.goto('http://127.0.0.1:5176/booking/track', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);

  // Check if lookup form was automatically pre-filled and loaded
  const refValue = await page.inputValue('input[placeholder*="58392"]').catch(() => '');
  const phoneValue = await page.inputValue('input[placeholder*="01012345678"]').catch(() => '');
  console.log('8. Auto-filled Reference:', refValue, 'Phone:', phoneValue);

  // Check if QR pass / live status card loaded
  const ticketLoaded = await page.locator('.tracking-core').isVisible();
  console.log('9. Auto-loaded Live Status Card without typing:', ticketLoaded);

  await browser.close();
}

testGuestReturnFlow().catch(console.error);
