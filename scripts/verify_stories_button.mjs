import { chromium } from 'playwright';
import path from 'path';

const chromeSystem = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:/Users/asus1/.gemini/antigravity/brain/737eb81e-624f-4504-b938-d04ece747f9b';

async function main() {
  const browser = await chromium.launch({ executablePath: chromeSystem, headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  console.log('Logging in as admin...');
  await page.goto('http://127.0.0.1:5176/login', { waitUntil: 'networkidle' });
  await page.click('button.role-admin');
  await page.waitForTimeout(1500);

  console.log('Navigating to admin stories (/admin/stories)...');
  await page.goto('http://127.0.0.1:5176/admin/stories', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  // Find the action buttons of the first story card
  const storyActions = page.locator('.story-card-actions, .request-actions, div:has(> .btn-story-action)').first();
  if (await storyActions.count() > 0) {
    await storyActions.screenshot({
      path: path.join(ARTIFACT_DIR, 'verify_story_action_buttons.png'),
    });
    console.log('Saved verify_story_action_buttons.png');
  }

  // Also screenshot the first card completely
  const firstCard = page.locator('.story-card, .request-item-card, .admin-story-card').first();
  if (await firstCard.count() > 0) {
    await firstCard.screenshot({
      path: path.join(ARTIFACT_DIR, 'verify_first_story_card.png'),
    });
    console.log('Saved verify_first_story_card.png');
  }

  // Full page snapshot
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'verify_admin_stories_page.png'),
  });
  console.log('Saved verify_admin_stories_page.png');

  await browser.close();
  console.log('Stories verification completed!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
