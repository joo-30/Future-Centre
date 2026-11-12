import { chromium } from '@playwright/test';

const chromeSystem = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function main() {
  const browser = await chromium.launch({ executablePath: chromeSystem, headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 375, height: 812 });

  await page.goto('http://127.0.0.1:5176/booking', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);

  const report = await page.evaluate(() => {
    const bookLayout = document.querySelector('.book-layout');
    const bookMain = document.querySelector('.book-main');
    const bookingSummary = document.querySelector('.booking-summary');
    const serviceCardsGrid = document.querySelector('.service-cards-grid');

    const getMetrics = (el) => {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      return {
        width: Math.round(r.width),
        left: Math.round(r.left),
        right: Math.round(r.right),
        display: style.display,
        gridTemplateColumns: style.gridTemplateColumns,
        flexDirection: style.flexDirection,
      };
    };

    return {
      windowWidth: window.innerWidth,
      bookLayout: getMetrics(bookLayout),
      bookMain: getMetrics(bookMain),
      bookingSummary: getMetrics(bookingSummary),
      serviceCardsGrid: getMetrics(serviceCardsGrid),
    };
  });

  console.log('CURRENT BOOKING LAYOUT AT 375PX:', JSON.stringify(report, null, 2));

  await page.screenshot({
    path: 'C:/Users/asus1/.gemini/antigravity/brain/8e61b3db-cb1a-48d8-a864-e3eea3ec64d7/current_broken_booking_mobile.png',
    animations: 'disabled'
  });

  await browser.close();
}

main().catch(console.error);
