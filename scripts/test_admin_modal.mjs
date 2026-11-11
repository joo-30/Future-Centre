import fs from 'node:fs';
import { chromium } from '@playwright/test';

const chromeSystem = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function testAdminModal() {
  const browser = await chromium.launch({ executablePath: chromeSystem, headless: true });
  const page = await browser.newPage();

  // 1. Mobile 390px
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://127.0.0.1:5176/login?next=%2Fadmin%2Fstories', { waitUntil: 'networkidle' });

  // Click the quick login button for Admin
  await page.click('button.role-admin');
  await page.waitForTimeout(500);

  // Submit the form
  await page.click('.auth-submit-btn');
  await page.waitForTimeout(2000);

  console.log('After login URL:', page.url());

  // Wait for stories page
  await page.waitForSelector('.btn-story-action, .btn-primary-action', { timeout: 8000 }).catch(() => {});

  // Click edit button on first story
  const clicked = await page.evaluate(() => {
    const editBtn = document.querySelector('.btn-story-action.is-outline') || Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('تعديل'));
    if (editBtn) {
      editBtn.click();
      return true;
    }
    return false;
  });

  console.log('Clicked edit button:', clicked);
  await page.waitForTimeout(1000);

  // Capture modal on mobile 390px
  const modal = await page.$('dialog.modal, .modal, dialog');
  if (modal) {
    await modal.screenshot({
      path: 'C:/Users/asus1/.gemini/antigravity/brain/737eb81e-624f-4504-b938-d04ece747f9b/verify_admin_modal_mobile_390.png'
    });
    console.log('Saved verify_admin_modal_mobile_390.png');
  } else {
    console.log('Modal element not found');
  }

  // 2. Tablet 768px
  await page.setViewportSize({ width: 768, height: 900 });
  await page.waitForTimeout(600);
  const modalTablet = await page.$('dialog.modal, .modal, dialog');
  if (modalTablet) {
    await modalTablet.screenshot({
      path: 'C:/Users/asus1/.gemini/antigravity/brain/737eb81e-624f-4504-b938-d04ece747f9b/verify_admin_modal_tablet_768.png'
    });
    console.log('Saved verify_admin_modal_tablet_768.png');
  }

  await browser.close();
}

testAdminModal().catch(console.error);
