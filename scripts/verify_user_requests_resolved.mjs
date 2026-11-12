import { chromium } from '@playwright/test';
import path from 'node:path';

const chromeSystem = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const artifactsDir = 'C:/Users/asus1/.gemini/antigravity/brain/8e61b3db-cb1a-48d8-a864-e3eea3ec64d7';

async function run() {
  const browser = await chromium.launch({ executablePath: chromeSystem, headless: true });

  // 1. Laptop Viewport 1280px for /booking
  console.log('1. Testing /booking on Laptop 1280px...');
  const laptopContext = await browser.newContext({
    viewport: { width: 1280, height: 850 },
    locale: 'ar-EG',
  });
  const page = await laptopContext.newPage();
  await page.goto('http://127.0.0.1:5176/booking', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Measure service cards grid
  const gridBox = await page.locator('.service-cards-grid').boundingBox();
  const cards = await page.locator('.service-select-card').all();
  console.log(`Found ${cards.length} service cards in grid of width ${gridBox?.width}px`);

  const cardBoxes = [];
  for (const c of cards) {
    const box = await c.boundingBox();
    cardBoxes.push(box);
  }
  console.log('Card Y positions:', cardBoxes.map(b => b?.y));

  // If all 3 cards have the same Y position (+/- 2px), they are on ONE ROW!
  const allInOneRow = cardBoxes.length === 3 && Math.abs(cardBoxes[0].y - cardBoxes[1].y) < 3 && Math.abs(cardBoxes[1].y - cardBoxes[2].y) < 3;
  console.log('All 3 cards in one row on 1280px laptop?', allInOneRow);

  // Take screenshot of booking step 1
  const stepOne = page.locator('.booking-step-one');
  await stepOne.screenshot({
    path: path.join(artifactsDir, 'verified_booking_3_cards_one_row_1280.png'),
  });
  console.log('Saved verified_booking_3_cards_one_row_1280.png');

  // Take full desktop overview of booking
  await page.screenshot({
    path: path.join(artifactsDir, 'verified_booking_page_perfect_width_1280.png'),
    fullPage: false,
  });
  console.log('Saved verified_booking_page_perfect_width_1280.png');

  await laptopContext.close();

  // 2. WhatsApp Stories Section on Homepage
  console.log('2. Testing WhatsApp Feedback Cards on Homepage...');
  const homeContext = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    locale: 'ar-EG',
  });
  const homePage = await homeContext.newPage();
  await homePage.goto('http://127.0.0.1:5176/#stories', { waitUntil: 'networkidle' });
  await homePage.waitForTimeout(1200);

  // Click on "رسائل واتساب" tab if exists
  const waTab = homePage.locator('.stories-tab-btn:has-text("واتساب")').first();
  if (await waTab.isVisible()) {
    await waTab.click();
    await homePage.waitForTimeout(600);
  }

  // Scroll to feedback block
  const feedbackBlock = homePage.locator('.feedback-block').first();
  if (await feedbackBlock.isVisible()) {
    await feedbackBlock.scrollIntoViewIfNeeded();
    await homePage.waitForTimeout(600);

    await feedbackBlock.screenshot({
      path: path.join(artifactsDir, 'verified_whatsapp_feedback_no_names.png'),
    });
    console.log('Saved verified_whatsapp_feedback_no_names.png');

    // Also click on the first card to verify lightbox modal without awkward names
    const firstCard = homePage.locator('.feedback-micro-card').first();
    await firstCard.click();
    await homePage.waitForTimeout(600);

    const lightboxModal = homePage.locator('.gallery-lightbox-overlay, .modal-lightbox, [role="dialog"]').first();
    if (await lightboxModal.isVisible()) {
      await lightboxModal.screenshot({
        path: path.join(artifactsDir, 'verified_whatsapp_lightbox_no_names.png'),
      });
      console.log('Saved verified_whatsapp_lightbox_no_names.png');
    }
  }

  await homeContext.close();
  await browser.close();
  console.log('All verifications finished!');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
