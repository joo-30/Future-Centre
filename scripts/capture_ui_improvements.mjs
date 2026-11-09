import { chromium } from '@playwright/test';

const chromeSystem = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function main() {
  const browser = await chromium.launch({
    executablePath: chromeSystem,
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 950 },
    locale: 'ar-EG',
  });

  const page = await context.newPage();

  // Quick Login as Admin
  await page.goto('http://127.0.0.1:5176/login');
  await page.waitForLoadState('networkidle');

  const adminQuickBtn = page.locator('button:has-text("Admin")');
  await adminQuickBtn.click();
  await page.waitForURL('**/admin', { timeout: 15000 });
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  // Open Capacity Modal
  const capacityBtn = page.locator('.tcq-edit-btn');
  if (await capacityBtn.isVisible()) {
    console.log('Clicking .tcq-edit-btn...');
    await capacityBtn.click();
    await page.waitForTimeout(600);
    await page.screenshot({
      path: 'C:/Users/makah/.gemini/antigravity/brain/2057bfec-2a0f-40f7-b7e0-8582b8d1ddb0/ui_improved_capacity_modal.png',
      fullPage: false,
    });
  }

  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
