import path from 'node:path';
import { chromium } from '@playwright/test';

const chromeSystem = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:/Users/asus1/.gemini/antigravity/brain/737eb81e-624f-4504-b938-d04ece747f9b';

async function main() {
  const browser = await chromium.launch({ executablePath: chromeSystem, headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  console.log('Navigating to homepage stories section...');
  await page.goto('http://localhost:5176/#stories', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  // Scroll to stories section
  const storiesSection = page.locator('#stories');
  if (await storiesSection.count() > 0) {
    await storiesSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);
    await storiesSection.screenshot({
      path: path.join(ARTIFACT_DIR, 'verify_stories_simplified_full.png'),
    });
    console.log('Saved verify_stories_simplified_full.png');
  }

  // Go to admin programs
  console.log('Navigating to admin programs...');
  await page.goto('http://localhost:5176/admin/programs', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  if (page.url().includes('/auth')) {
    const phoneInput = page.locator('input[type="tel"]');
    if (await phoneInput.count() > 0) {
      await phoneInput.fill('01041504201');
      await page.locator('button[type="submit"]').click();
      await page.waitForTimeout(1000);
    }
    await page.goto('http://localhost:5176/admin/programs', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
  }

  const progGrid = page.locator('.prog-cards-grid');
  if (await progGrid.count() > 0) {
    await progGrid.screenshot({
      path: path.join(ARTIFACT_DIR, 'verify_admin_programs_nostar.png'),
    });
    console.log('Saved verify_admin_programs_nostar.png');
  }

  // Also capture admin dashboard pulse
  await page.goto('http://localhost:5176/admin', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  const pulse = page.locator('.daily-pulse-container');
  if (await pulse.count() > 0) {
    await pulse.screenshot({
      path: path.join(ARTIFACT_DIR, 'verify_admin_pulse_activity.png'),
    });
    console.log('Saved verify_admin_pulse_activity.png');
  }

  await browser.close();
  console.log('Verification completed successfully!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
