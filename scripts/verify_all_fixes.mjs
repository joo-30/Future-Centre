import fs from 'node:fs';
import { chromium } from '@playwright/test';

const chromeSystem = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function verifyAllFixes() {
  const browser = await chromium.launch({
    executablePath: chromeSystem,
    headless: true,
  });

  const page = await browser.newPage();

  // Test 1: Desktop 1440x900
  console.log('--- Test 1: Desktop Alignment ---');
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://127.0.0.1:5176/', { waitUntil: 'networkidle' });

  // Scroll to stories section
  await page.evaluate(() => {
    const el = document.getElementById('stories');
    if (el) el.scrollIntoView();
  });
  await page.waitForTimeout(1000);

  // Measure RTL right edge coordinates (window.innerWidth - boundingBox.right)
  const coords = await page.evaluate(() => {
    const getRightOffset = (selector) => {
      const el = document.querySelector(selector);
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      // Distance from the right edge of viewport
      return {
        right: Math.round(rect.right),
        offsetFromWindowRight: Math.round(window.innerWidth - rect.right),
        left: Math.round(rect.left),
        width: Math.round(rect.width),
      };
    };

    return {
      section: getRightOffset('.stories-section'),
      tabsBar: getRightOffset('.stories-tabs-pro'),
      firstTabBtn: getRightOffset('.stories-tab-btn.is-active'),
      transBadge: getRightOffset('.transformations-block .block-icon-badge'),
      transCard1: getRightOffset('.transformations-grid .transform-card-compact:first-child'),
      whatsappBadge: getRightOffset('.feedback-block .block-icon-badge'),
      whatsappCard1: getRightOffset('.feedback-micro-grid .feedback-micro-card:first-child'),
    };
  });

  console.log('Element offsets from right edge of screen:');
  console.log('Section padding right:', coords.section?.offsetFromWindowRight, 'px');
  console.log('Tabs bar right offset:', coords.tabsBar?.offsetFromWindowRight, 'px');
  console.log('First tab button right offset:', coords.firstTabBtn?.offsetFromWindowRight, 'px');
  console.log('Transformation badge right offset:', coords.transBadge?.offsetFromWindowRight, 'px');
  console.log('Transformation card 1 right offset:', coords.transCard1?.offsetFromWindowRight, 'px');
  console.log('WhatsApp badge right offset:', coords.whatsappBadge?.offsetFromWindowRight, 'px');
  console.log('WhatsApp card 1 right offset:', coords.whatsappCard1?.offsetFromWindowRight, 'px');

  // Capture desktop section screenshot
  const sectionEl = await page.$('.stories-section');
  if (sectionEl) {
    await sectionEl.screenshot({
      path: 'C:/Users/asus1/.gemini/antigravity/brain/737eb81e-624f-4504-b938-d04ece747f9b/verify_desktop_aligned.png',
    });
    console.log('Saved verify_desktop_aligned.png');
  }

  // Test 2: Click Sameh's card to verify modal
  console.log('--- Test 2: Verify Sameh Modal ---');
  // Click Ustaz Sameh card (2nd card)
  await page.evaluate(() => {
    const cards = document.querySelectorAll('.transform-card-compact');
    if (cards[1]) cards[1].click();
  });
  await page.waitForTimeout(800);

  const modalEl = await page.$('.case-modal-dialog');
  if (modalEl) {
    await modalEl.screenshot({
      path: 'C:/Users/asus1/.gemini/antigravity/brain/737eb81e-624f-4504-b938-d04ece747f9b/verify_sameh_modal_fixed.png',
    });
    console.log('Saved verify_sameh_modal_fixed.png');
  }

  // Close modal
  await page.evaluate(() => {
    const closeBtn = document.querySelector('.cmd-close-btn');
    if (closeBtn) closeBtn.click();
  });
  await page.waitForTimeout(500);

  // Test 3: Click Safia's card to verify modal
  console.log('--- Test 3: Verify Safia Modal ---');
  await page.evaluate(() => {
    const cards = document.querySelectorAll('.transform-card-compact');
    if (cards[2]) cards[2].click();
  });
  await page.waitForTimeout(800);

  const safiaModalEl = await page.$('.case-modal-dialog');
  if (safiaModalEl) {
    await safiaModalEl.screenshot({
      path: 'C:/Users/asus1/.gemini/antigravity/brain/737eb81e-624f-4504-b938-d04ece747f9b/verify_safia_modal_fixed.png',
    });
    console.log('Saved verify_safia_modal_fixed.png');
  }

  // Test 4: Mobile Viewport 390x844 (iPhone 14)
  console.log('--- Test 4: Mobile Stories & Admin Modal ---');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://127.0.0.1:5176/', { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    const el = document.getElementById('stories');
    if (el) el.scrollIntoView();
  });
  await page.waitForTimeout(800);

  const mobileStories = await page.$('.stories-section');
  if (mobileStories) {
    await mobileStories.screenshot({
      path: 'C:/Users/asus1/.gemini/antigravity/brain/737eb81e-624f-4504-b938-d04ece747f9b/verify_mobile_stories.png',
    });
    console.log('Saved verify_mobile_stories.png');
  }

  // Test 5: Admin stories modal on mobile 390px
  console.log('--- Test 5: Admin Story Modal on Mobile ---');
  await page.goto('http://127.0.0.1:5176/admin/stories', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Check if redirected to auth or directly on page
  const url = page.url();
  console.log('Admin URL reached:', url);

  // If on auth, log in as admin
  if (url.includes('/auth') || url.includes('/login')) {
    console.log('Logging in as admin...');
    await page.fill('input[type="tel"]', '01000000000');
    await page.fill('input[type="password"]', 'Admin123456');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1500);
    await page.goto('http://127.0.0.1:5176/admin/stories', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
  }

  // Click edit on first story or "إضافة قصة جديدة"
  const clicked = await page.evaluate(() => {
    const btn = document.querySelector('.btn-story-action.is-outline') || document.querySelector('.btn-primary-action');
    if (btn) {
      btn.click();
      return true;
    }
    return false;
  });

  if (clicked) {
    await page.waitForTimeout(600);
    const adminModal = await page.$('dialog.story-admin-modal');
    if (adminModal) {
      await adminModal.screenshot({
        path: 'C:/Users/asus1/.gemini/antigravity/brain/737eb81e-624f-4504-b938-d04ece747f9b/verify_admin_modal_mobile.png',
      });
      console.log('Saved verify_admin_modal_mobile.png');
    }
  }

  await browser.close();
  console.log('All tests completed successfully!');
}

verifyAllFixes().catch(console.error);
