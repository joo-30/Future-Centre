import { chromium } from '@playwright/test';

const chromeSystem = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:/Users/asus1/.gemini/antigravity/brain/8e61b3db-cb1a-48d8-a864-e3eea3ec64d7';

const viewports = [
  { name: 'mobile_360', width: 360, height: 780 },
  { name: 'mobile_375', width: 375, height: 812 },
  { name: 'mobile_390', width: 390, height: 844 },
  { name: 'mobile_430', width: 430, height: 932 },
  { name: 'tablet_768', width: 768, height: 1024 },
  { name: 'laptop_1280', width: 1280, height: 800 },
];

async function main() {
  const browser = await chromium.launch({ executablePath: chromeSystem, headless: true });
  const results = {};

  for (const vp of viewports) {
    const page = await browser.newPage();
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto('http://127.0.0.1:5176/booking', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    // Check step 1 metrics
    const metricsStep1 = await page.evaluate(() => {
      const doc = document.documentElement;
      const body = document.body;
      const hasHScroll = doc.scrollWidth > doc.clientWidth || body.scrollWidth > body.clientWidth;
      const bookLayout = document.querySelector('.book-layout');
      const bookMain = document.querySelector('.book-main');
      const serviceCards = document.querySelectorAll('.service-select-card');
      const serviceGrid = document.querySelector('.service-cards-grid');
      const calendar = document.querySelector('.booking-calendar-card');
      const times = document.querySelector('.times');
      const summary = document.querySelector('.booking-summary');

      return {
        hasHScroll,
        scrollWidth: doc.scrollWidth,
        clientWidth: doc.clientWidth,
        layoutWidth: bookLayout ? Math.round(bookLayout.getBoundingClientRect().width) : null,
        mainWidth: bookMain ? Math.round(bookMain.getBoundingClientRect().width) : null,
        serviceCardCount: serviceCards.length,
        serviceGridCols: serviceGrid ? window.getComputedStyle(serviceGrid).gridTemplateColumns.split(' ').length : null,
        summaryDisplay: summary ? window.getComputedStyle(summary).display : null,
        calendarWidth: calendar ? Math.round(calendar.getBoundingClientRect().width) : null,
        timesWidth: times ? Math.round(times.getBoundingClientRect().width) : null,
      };
    });

    // Capture full-page screenshot of Step 1
    await page.screenshot({
      path: `${artifactDir}/booking_${vp.name}_step1.png`,
      fullPage: true,
      animations: 'disabled',
    });

    // If mobile (<= 760px), test selecting a slot and moving to Step 2
    let metricsStep2 = null;
    if (vp.width <= 760) {
      // Click first available slot
      const slotBtn = page.locator('.times button:not(:disabled)').first();
      if (await slotBtn.count() > 0) {
        await slotBtn.click();
        await page.waitForTimeout(300);
      }

      // Click next step button
      const nextBtn = page.locator('.mobile-next button');
      if (await nextBtn.count() > 0) {
        await nextBtn.click();
        await page.waitForTimeout(500);

        metricsStep2 = await page.evaluate(() => {
          const doc = document.documentElement;
          const body = document.body;
          const hasHScroll = doc.scrollWidth > doc.clientWidth || body.scrollWidth > body.clientWidth;
          const reviewCard = document.querySelector('.booking-review-summary-card');
          const submitRow = document.querySelector('.submit-row');

          return {
            hasHScroll,
            scrollWidth: doc.scrollWidth,
            clientWidth: doc.clientWidth,
            reviewCardWidth: reviewCard ? Math.round(reviewCard.getBoundingClientRect().width) : null,
            submitRowWidth: submitRow ? Math.round(submitRow.getBoundingClientRect().width) : null,
          };
        });

        await page.screenshot({
          path: `${artifactDir}/booking_${vp.name}_step2.png`,
          fullPage: true,
          animations: 'disabled',
        });
      }
    }

    results[vp.name] = {
      step1: metricsStep1,
      step2: metricsStep2,
    };

    await page.close();
  }

  console.log('ALL VIEWPORTS VERIFICATION RESULTS:\n', JSON.stringify(results, null, 2));
  await browser.close();
}

main().catch(console.error);
