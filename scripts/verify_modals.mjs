import { chromium } from '@playwright/test';

async function verifyModals() {
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.goto('http://localhost:5176/#stories');
  await page.waitForTimeout(1000);

  // 1. Safia Modal
  const card3 = page.locator('.transform-card-compact').nth(2);
  await card3.scrollIntoViewIfNeeded();
  await card3.click();
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'C:/Users/asus1/.gemini/antigravity/brain/737eb81e-624f-4504-b938-d04ece747f9b/verify_safia_modal.png' });
  console.log('Saved Safia modal verification');

  // Close modal by clicking close button or pressing Escape
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);

  // 2. Nada Modal
  const card1 = page.locator('.transform-card-compact').first();
  await card1.scrollIntoViewIfNeeded();
  await card1.click();
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'C:/Users/asus1/.gemini/antigravity/brain/737eb81e-624f-4504-b938-d04ece747f9b/verify_nada_modal.png' });
  console.log('Saved Nada modal verification');

  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);

  // 3. Sameh Modal
  const card2 = page.locator('.transform-card-compact').nth(1);
  await card2.scrollIntoViewIfNeeded();
  await card2.click();
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'C:/Users/asus1/.gemini/antigravity/brain/737eb81e-624f-4504-b938-d04ece747f9b/verify_sameh_modal.png' });
  console.log('Saved Sameh modal verification');

  await browser.close();
}

verifyModals().catch(console.error);
