import { chromium } from 'playwright';
import path from 'path';

const chromeSystem = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:/Users/makah/.gemini/antigravity/brain/2057bfec-2a0f-40f7-b7e0-8582b8d1ddb0';

async function main() {
  const browser = await chromium.launch({ executablePath: chromeSystem, headless: true });
  const page = await browser.newPage({
    viewport: { width: 320, height: 750 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true
  });

  await page.goto('http://127.0.0.1:5176/login');
  await page.click('.quick-login-panel button:has-text("Admin")');
  await page.waitForURL('**/admin**');
  await page.waitForTimeout(1000);

  // Take screenshot of appointments filter area
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'debug_mobile_appointments_filters.png') });

  // Get details of filter-chip-select and datepicker
  const filterInfo = await page.evaluate(() => {
    const chip = document.querySelector('.filter-chip-select');
    const wrap = document.querySelector('.filter-chip-select .custom-datepicker-wrap');
    const trigger = document.querySelector('.filter-chip-select .custom-datepicker-trigger');
    const label = document.querySelector('.filter-chip-select .chip-label');
    return {
      chip: {
        width: getComputedStyle(chip).width,
        display: getComputedStyle(chip).display,
        boxSizing: getComputedStyle(chip).boxSizing,
      },
      label: {
        width: getComputedStyle(label).width,
      },
      wrap: {
        width: getComputedStyle(wrap).width,
        flex: getComputedStyle(wrap).flex,
        minWidth: getComputedStyle(wrap).minWidth,
      },
      trigger: {
        width: getComputedStyle(trigger).width,
        minWidth: getComputedStyle(trigger).minWidth,
        display: getComputedStyle(trigger).display,
      }
    };
  });
  console.log('Filter Info at 320px:', JSON.stringify(filterInfo, null, 2));

  await browser.close();
}

main().catch(console.error);
