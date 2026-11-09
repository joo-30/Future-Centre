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

  await page.goto('http://127.0.0.1:5176/admin/patients');
  await page.waitForTimeout(1000);

  // Click on "حسابات وملفات العملاء" tab
  const clientTab = page.locator('.patient-console-tabs button:has-text("حسابات")');
  if (await clientTab.count() > 0) {
    await clientTab.click();
    await page.waitForTimeout(500);
  }

  // Click "روشتة دايت" button on the first patient
  const rxBtn = page.locator('button:has-text("روشتة دايت")').first();
  if (await rxBtn.count() > 0) {
    await rxBtn.click();
    await page.waitForTimeout(600);

    const modalShot = path.join(ARTIFACT_DIR, 'debug_320px_prescription_modal.png');
    await page.screenshot({ path: modalShot });
    console.log('Saved prescription modal screenshot at 320px');

    const btnInfo = await page.evaluate(() => {
      const b1 = document.querySelector('.btn-publish-patient');
      const b2 = document.querySelector('.btn-print-action');
      return {
        publishBtn: b1 ? { width: b1.offsetWidth, height: b1.offsetHeight, text: b1.innerText } : null,
        printBtn: b2 ? { width: b2.offsetWidth, height: b2.offsetHeight, text: b2.innerText } : null,
      };
    });
    const modalDetails = await page.evaluate(() => {
      const strip = document.querySelector('.prescription-presets-strip');
      const mealsNav = document.querySelector('.rx-meals-quicknav');
      const textarea = document.querySelector('.meal-block textarea');
      return {
        strip: strip ? { width: strip.offsetWidth, scrollWidth: strip.scrollWidth, scrollbarWidth: getComputedStyle(strip).scrollbarWidth } : null,
        mealsNav: mealsNav ? { width: mealsNav.offsetWidth, scrollWidth: mealsNav.scrollWidth } : null,
        textarea: textarea ? { width: textarea.offsetWidth, scrollWidth: textarea.scrollWidth } : null,
      };
    });
    console.log('Modal details:', modalDetails);
  } else {
    console.log('Could not find روشتة دايت button!');
  }

  await browser.close();
}

main().catch(console.error);
