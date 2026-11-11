import { chromium } from '@playwright/test';

async function checkNadaSameh() {
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  // 1. Check Nada
  await page.goto('http://localhost:5176/#stories');
  await page.waitForTimeout(600);
  const card1 = page.locator('.transform-card-compact').first();
  await card1.scrollIntoViewIfNeeded();
  await card1.click();
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'C:/Users/asus1/.gemini/antigravity/brain/737eb81e-624f-4504-b938-d04ece747f9b/verify_nada_modal.png' });
  console.log('Saved Nada modal');

  // 2. Close and check Sameh
  await page.locator('.cmd-btn-secondary').click();
  await page.waitForTimeout(400);

  const card2 = page.locator('.transform-card-compact').nth(1);
  await card2.scrollIntoViewIfNeeded();
  await card2.click();
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'C:/Users/asus1/.gemini/antigravity/brain/737eb81e-624f-4504-b938-d04ece747f9b/verify_sameh_modal.png' });
  console.log('Saved Sameh modal');

  await browser.close();
}

checkNadaSameh().catch(console.error);
