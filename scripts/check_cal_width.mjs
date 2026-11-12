import { chromium } from '@playwright/test';

const chromeSystem = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function main() {
  const browser = await chromium.launch({ executablePath: chromeSystem, headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 375, height: 750 });
  await page.goto('http://127.0.0.1:5176/booking', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);

  const res = await page.evaluate(() => {
    const card = document.querySelector('.booking-calendar-card');
    const grid = document.querySelector('.booking-days-grid');
    const csCard = card ? window.getComputedStyle(card) : null;
    const csGrid = grid ? window.getComputedStyle(grid) : null;

    return {
      cardPadding: csCard ? `${csCard.paddingTop} ${csCard.paddingRight} ${csCard.paddingBottom} ${csCard.paddingLeft}` : null,
      cardBorder: csCard ? csCard.borderWidth : null,
      gridMargin: csGrid ? `${csGrid.marginTop} ${csGrid.marginRight} ${csGrid.marginBottom} ${csGrid.marginLeft}` : null,
      gridPadding: csGrid ? `${csGrid.paddingTop} ${csGrid.paddingRight} ${csGrid.paddingBottom} ${csGrid.paddingLeft}` : null,
      gridWidth: csGrid ? csGrid.width : null,
      gridMaxWidth: csGrid ? csGrid.maxWidth : null,
    };
  });

  console.log(JSON.stringify(res, null, 2));
  await browser.close();
}

main().catch(console.error);
