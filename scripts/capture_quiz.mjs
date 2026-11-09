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

  console.log('Navigating to Home...');
  await page.goto('http://127.0.0.1:5176/');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);

  const quizSection = page.locator('#care-guide');
  await quizSection.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);

  console.log('Capturing step 1...');
  await page.screenshot({
    path: 'C:/Users/makah/.gemini/antigravity/brain/2057bfec-2a0f-40f7-b7e0-8582b8d1ddb0/care_guide_quiz_step1.png',
  });

  console.log('Clicking option 1 (goal)...');
  await page.locator('.quiz-option-btn').first().click();
  await page.waitForTimeout(400);

  console.log('Clicking option 2 (challenge)...');
  await page.locator('.quiz-option-btn').first().click();
  await page.waitForTimeout(400);

  console.log('Clicking option 3 (preference)...');
  await page.locator('.quiz-option-btn').first().click();
  await page.waitForTimeout(600);

  console.log('Capturing result card...');
  await page.screenshot({
    path: 'C:/Users/makah/.gemini/antigravity/brain/2057bfec-2a0f-40f7-b7e0-8582b8d1ddb0/care_guide_quiz_result.png',
  });

  console.log('Done capturing quiz!');
  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
