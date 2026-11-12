import { chromium } from '@playwright/test';

const chromeSystem = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:/Users/asus1/.gemini/antigravity/brain/8e61b3db-cb1a-48d8-a864-e3eea3ec64d7';

async function main() {
  const browser = await chromium.launch({ executablePath: chromeSystem, headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 375, height: 750 });

  await page.goto('http://127.0.0.1:5176/booking', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);

  // Check days grid columns and time slot columns
  const info = await page.evaluate(() => {
    const daysGrid = document.querySelector('.booking-days-grid');
    const dayCards = document.querySelectorAll('.booking-day-card');
    const times = document.querySelector('.times');
    const slots = document.querySelectorAll('.time');
    const capacityBanner = document.querySelector('.booking-capacity-banner');
    const mobileNext = document.querySelector('.mobile-next');

    const daysStyle = daysGrid ? window.getComputedStyle(daysGrid) : null;
    const timesStyle = times ? window.getComputedStyle(times) : null;
    const nextStyle = mobileNext ? window.getComputedStyle(mobileNext) : null;

    return {
      daysCount: dayCards.length,
      daysColumns: daysStyle ? daysStyle.gridTemplateColumns : null,
      daysColsCount: daysStyle ? daysStyle.gridTemplateColumns.split(' ').length : null,
      timesCount: slots.length,
      timesColumns: timesStyle ? timesStyle.gridTemplateColumns : null,
      timesColsCount: timesStyle ? timesStyle.gridTemplateColumns.split(' ').length : null,
      capacityBannerHeight: capacityBanner ? Math.round(capacityBanner.getBoundingClientRect().height) : null,
      mobileNextBg: nextStyle ? nextStyle.backgroundColor : null,
    };
  });

  console.log('MOBILE APPOINTMENT PICKER DETAILS:\n', JSON.stringify(info, null, 2));

  // Screenshot 1: Scrolled to calendar and times
  const calCard = page.locator('.booking-calendar-card');
  if (await calCard.count() > 0) {
    await calCard.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    await page.screenshot({
      path: `${artifactDir}/mobile_calendar_and_times.png`,
      animations: 'disabled',
    });
  }

  // Click a time slot
  const slotBtn = page.locator('.times button:not(:disabled)').first();
  if (await slotBtn.count() > 0) {
    await slotBtn.click();
    await page.waitForTimeout(400);
    await page.screenshot({
      path: `${artifactDir}/mobile_time_selected.png`,
      animations: 'disabled',
    });
  }

  // Scroll all the way down to inspect sticky bar and last slot
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(400);
  await page.screenshot({
    path: `${artifactDir}/mobile_scrolled_to_bottom.png`,
    animations: 'disabled',
  });

  await browser.close();
}

main().catch(console.error);
