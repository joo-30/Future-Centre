import { chromium } from 'playwright';

const chromeSystem = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function testAutoLookup() {
  const browser = await chromium.launch({ executablePath: chromeSystem, headless: true });
  const context = await browser.newContext({ viewport: { width: 1366, height: 768 } });
  const page = await context.newPage();

  // Book directly via API for date 2026-11-12
  const res = await fetch('http://127.0.0.1:5001/api/appointments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Idempotency-Key': crypto.randomUUID(),
      'Origin': 'http://127.0.0.1:5176'
    },
    body: JSON.stringify({
      serviceId: 'nutrition',
      date: '2026-11-12',
      time: '13:30',
      name: 'هند علي',
      phone: '01012349988',
      consent: true
    })
  });

  const data = await res.json();
  console.log('Booked directly via API:', data.appointment.reference, data.trackingToken);

  // Set localStorage in the browser context as if the user booked previously
  await page.goto('http://127.0.0.1:5176/');
  await page.evaluate((appt) => {
    localStorage.setItem('fc_recent_booking', JSON.stringify({
      reference: appt.reference,
      phone: '01012349988',
      token: appt.token,
      savedAt: Date.now()
    }));
  }, { reference: data.appointment.reference, token: data.trackingToken });

  // Now client navigates to /booking/track
  console.log('Client visits /booking/track directly...');
  await page.goto('http://127.0.0.1:5176/booking/track', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Check if live status card loaded
  const statusHeadline = await page.locator('.tracking-core h2').innerText().catch(() => '');
  console.log('Loaded Status Headline:', statusHeadline);

  const refText = await page.locator('.ticket-code bdi').innerText().catch(() => '');
  console.log('Loaded Ticket Code:', refText);

  await browser.close();
}

testAutoLookup().catch(console.error);
