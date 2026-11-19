import { chromium } from 'playwright';

const chromeSystem = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:/Users/makah/.gemini/antigravity/brain/c5420236-75f6-4eb0-aed5-e6d16c5e7077';

async function main() {
  const browser = await chromium.launch({ executablePath: chromeSystem, headless: true });
  const desktop = await browser.newPage({ viewport: { width: 1440, height: 950 } });
  await desktop.goto('http://127.0.0.1:5176/booking?service=nutrition', { waitUntil: 'networkidle' });
  await desktop.waitForTimeout(600);

  // Click next open day button if closed
  const buttons = await desktop.$$('button');
  for (const b of buttons) {
    const text = await b.textContent();
    if (text && text.includes('اليوم التالي')) {
      await b.click();
      await desktop.waitForTimeout(1000);
      break;
    }
  }

  const slotArea = await desktop.$('.slot-area');
  if (slotArea) {
    await slotArea.scrollIntoViewIfNeeded();
    await desktop.waitForTimeout(400);
    await slotArea.screenshot({ path: `${artifactDir}/verified_open_booking_slots_1440.png` });
    console.log('Saved verified_open_booking_slots_1440.png');
  }

  await browser.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
