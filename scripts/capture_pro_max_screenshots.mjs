import fs from 'node:fs';
import { chromium } from '@playwright/test';

const chromeSystem = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function captureProMaxScreenshots() {
  const browser = await chromium.launch({ executablePath: chromeSystem, headless: true });
  const page = await browser.newPage();

  // Step 1: Login
  console.log('Logging into admin...');
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://127.0.0.1:5176/login?next=%2Fadmin%2Fstories', { waitUntil: 'networkidle' });
  await page.click('button.role-admin');
  await page.waitForTimeout(300);
  await page.click('.auth-submit-btn');
  await page.waitForTimeout(2000);

  // Step 2: Open Admin Stories Edit Modal on Desktop
  console.log('Navigating to admin stories...');
  await page.goto('http://127.0.0.1:5176/admin/stories', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Click edit on the first story (Nada)
  await page.evaluate(() => {
    const editBtn = document.querySelector('.btn-story-action.is-primary');
    if (editBtn) editBtn.click();
  });
  await page.waitForTimeout(1000);

  // Capture desktop modal
  const modal = await page.$('dialog.modal, .modal, dialog');
  if (modal) {
    await modal.screenshot({
      path: 'C:/Users/asus1/.gemini/antigravity/brain/737eb81e-624f-4504-b938-d04ece747f9b/admin_story_modal_desktop.png',
    });
    console.log('Saved admin_story_modal_desktop.png');
  }

  // Step 3: Switch to mobile viewport (390px) and capture modal
  console.log('Capturing mobile admin modal...');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(600);
  if (modal) {
    await modal.screenshot({
      path: 'C:/Users/asus1/.gemini/antigravity/brain/737eb81e-624f-4504-b938-d04ece747f9b/admin_story_modal_mobile.png',
    });
    console.log('Saved admin_story_modal_mobile.png');
  }

  // Step 4: Open Safia's card on homepage to test additional gallery thumbnails
  console.log('Testing public modal with additional gallery on homepage...');
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://127.0.0.1:5176/#stories', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Click Safia's card (3rd card)
  await page.evaluate(() => {
    const cards = document.querySelectorAll('.transform-card-compact');
    if (cards[2]) cards[2].click();
  });
  await page.waitForTimeout(800);

  const safiaModal = await page.$('.case-modal-dialog');
  if (safiaModal) {
    await safiaModal.screenshot({
      path: 'C:/Users/asus1/.gemini/antigravity/brain/737eb81e-624f-4504-b938-d04ece747f9b/public_safia_modal_with_gallery.png',
    });
    console.log('Saved public_safia_modal_with_gallery.png');
  }

  await browser.close();
  console.log('Screenshots captured successfully!');
}

captureProMaxScreenshots().catch(console.error);
