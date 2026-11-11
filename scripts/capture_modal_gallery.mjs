import fs from 'node:fs';
import { chromium } from '@playwright/test';

const chromeSystem = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function captureModalGallery() {
  const browser = await chromium.launch({ executablePath: chromeSystem, headless: true });
  const page = await browser.newPage();

  await page.setViewportSize({ width: 1440, height: 950 });
  await page.goto('http://127.0.0.1:5176/login', { waitUntil: 'networkidle' });
  await page.click('button.role-admin');
  await page.waitForTimeout(1500);

  await page.goto('http://127.0.0.1:5176/admin/stories', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Click edit on Safia (3rd story)
  await page.evaluate(() => {
    const editBtns = document.querySelectorAll('.btn-story-action.is-primary');
    if (editBtns[2]) editBtns[2].click();
  });
  await page.waitForTimeout(1000);

  // Scroll down to the gallery section
  await page.evaluate(() => {
    const modal = document.querySelector('dialog.modal, .modal');
    if (modal) modal.scrollTop = 1200;
  });
  await page.waitForTimeout(600);

  const modal = await page.$('dialog.modal, .modal');
  if (modal) {
    await modal.screenshot({
      path: 'C:/Users/asus1/.gemini/antigravity/brain/737eb81e-624f-4504-b938-d04ece747f9b/admin_story_modal_gallery_view.png',
    });
    console.log('Saved admin_story_modal_gallery_view.png');
  }

  await browser.close();
}

captureModalGallery().catch(console.error);
