import { chromium } from '@playwright/test';

const chromeSystem = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function testScreen(viewport, prefix) {
  const browser = await chromium.launch({ executablePath: chromeSystem, headless: true });
  const page = await browser.newPage();
  await page.setViewportSize(viewport);
  await page.goto('http://127.0.0.1:5176/login', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(400);
  await page.click('button.role-admin');
  await page.waitForTimeout(1000);

  await page.goto('http://127.0.0.1:5176/admin/patients?tab=patients', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1200);

  await page.evaluate(() => {
    const subBtns = Array.from(document.querySelectorAll('button')).filter(b => b.innerText.includes('إضافة اشتراك') && b.classList.contains('btn-patient-subaction'));
    if (subBtns.length > 0) subBtns[0].click();
  });
  await page.waitForTimeout(800);

  const report = await page.evaluate(() => {
    const modal = document.querySelector('dialog[open]');
    if (!modal) return { error: 'No modal' };
    const mRect = modal.getBoundingClientRect();
    const overflowing = [];
    for (const el of modal.querySelectorAll('*')) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      if (r.left < mRect.left - 2 || r.right > mRect.right + 2) {
        overflowing.push({ tag: el.tagName, className: el.className, text: el.innerText ? el.innerText.slice(0, 20) : '' });
      }
    }
    return {
      modalWidth: Math.round(mRect.width),
      modalScrollWidth: modal.scrollWidth,
      modalClientWidth: modal.clientWidth,
      hasHorizontalScroll: modal.scrollWidth > modal.clientWidth,
      overflowingCount: overflowing.length
    };
  });

  console.log(`[${prefix} ${viewport.width}x${viewport.height}] Report:`, report);

  const basePath = 'C:/Users/asus1/.gemini/antigravity/brain/8e61b3db-cb1a-48d8-a864-e3eea3ec64d7';
  await page.screenshot({
    path: `${basePath}/verified_subscription_${prefix}.png`,
    animations: 'disabled'
  });

  await browser.close();
}

async function main() {
  await testScreen({ width: 390, height: 844 }, 'mobile_390');
  await testScreen({ width: 768, height: 1024 }, 'tablet_768');
  await testScreen({ width: 1280, height: 800 }, 'laptop_1280');
  console.log('ALL SCREENS TESTED SUCCESSFULLY!');
}

main().catch(console.error);
