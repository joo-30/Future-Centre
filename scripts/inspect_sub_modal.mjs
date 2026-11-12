import { chromium } from '@playwright/test';

const chromeSystem = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function main() {
  const browser = await chromium.launch({
    executablePath: chromeSystem,
    headless: true,
  });
  const page = await browser.newPage();

  // Test at 375px (iPhone standard width)
  await page.setViewportSize({ width: 375, height: 812 });
  console.log('1. Opening login...');
  await page.goto('http://127.0.0.1:5176/login', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(600);

  console.log('2. Clicking admin role...');
  await page.click('button.role-admin');
  await page.waitForTimeout(1200);

  console.log('3. Navigating to /admin/patients...');
  await page.goto('http://127.0.0.1:5176/admin/patients', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);

  console.log('4. Clicking sub button on patient...');
  const clicked = await page.evaluate(() => {
    const subBtns = Array.from(document.querySelectorAll('button')).filter(b => b.innerText.includes('إضافة اشتراك'));
    if (subBtns.length > 0) {
      const specific = subBtns.find(b => b.classList.contains('btn-patient-subaction')) || subBtns[0];
      specific.click();
      return true;
    }
    return false;
  });
  console.log('Clicked:', clicked);
  await page.waitForTimeout(800);

  console.log('5. Taking screenshots with page.screenshot...');
  await page.screenshot({
    path: 'C:/Users/asus1/.gemini/antigravity/brain/8e61b3db-cb1a-48d8-a864-e3eea3ec64d7/current_sub_modal_before_fix_top.png',
    animations: 'disabled',
  });
  console.log('Saved top screenshot!');

  // Scroll inside dialog
  await page.evaluate(() => {
    const m = document.querySelector('dialog.modal, .modal');
    if (m) m.scrollTop = 500;
  });
  await page.waitForTimeout(400);

  await page.screenshot({
    path: 'C:/Users/asus1/.gemini/antigravity/brain/8e61b3db-cb1a-48d8-a864-e3eea3ec64d7/current_sub_modal_before_fix_bottom.png',
    animations: 'disabled',
  });
  console.log('Saved bottom screenshot!');

  await browser.close();
  console.log('ALL DONE!');
}

main().catch(e => {
  console.error('Error:', e);
  process.exit(1);
});
