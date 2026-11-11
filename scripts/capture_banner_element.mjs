import path from 'node:path';
import { chromium } from '@playwright/test';

const chromeSystem = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:/Users/asus1/.gemini/antigravity/brain/737eb81e-624f-4504-b938-d04ece747f9b';

async function captureElement() {
  const browser = await chromium.launch({ executablePath: chromeSystem, headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://127.0.0.1:5176/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  const banner = page.locator('.stories-cta-banner');
  if (await banner.isVisible()) {
    // Scroll so it's nicely visible in context
    await banner.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    // Take viewport screenshot showing the card and surrounding context
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'stories_cta_context.png') });
    // Also take element-only screenshot
    await banner.screenshot({ path: path.join(ARTIFACT_DIR, 'stories_cta_element.png') });
    console.log('Banner captured!');
  } else {
    console.log('Banner not found or not visible!');
  }

  // Mobile
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(500);
  if (await banner.isVisible()) {
    await banner.screenshot({ path: path.join(ARTIFACT_DIR, 'stories_cta_mobile_element.png') });
    console.log('Mobile banner captured!');
  }

  await browser.close();
}

captureElement().catch(console.error);
