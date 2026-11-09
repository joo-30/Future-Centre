import { chromium } from 'playwright';
import path from 'path';

const chromeSystem = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:/Users/makah/.gemini/antigravity/brain/2057bfec-2a0f-40f7-b7e0-8582b8d1ddb0';

async function main() {
  const browser = await chromium.launch({ executablePath: chromeSystem, headless: true });
  const page = await browser.newPage({
    viewport: { width: 320, height: 750 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true
  });

  await page.goto('http://127.0.0.1:5176/login');
  await page.click('.quick-login-panel button:has-text("Admin")');
  await page.waitForURL('**/admin**');

  await page.goto('http://127.0.0.1:5176/admin/patients');
  await page.waitForTimeout(1000);

  // Click on "الروشتات والأنظمة الغذائية" tab
  const rxTab = page.locator('.patient-console-tabs button:has-text("الروشتات")');
  if (await rxTab.count() > 0) {
    await rxTab.click();
    await page.waitForTimeout(800);
  }

  // Inspect the card and its actions
  const cardData = await page.evaluate(() => {
    const card = document.querySelector('.inbody-record-card');
    if (!card) return 'No card found';
    const actions = card.querySelector('.inbody-card-actions');
    const buttons = Array.from(actions ? actions.querySelectorAll('button, a') : []).map(b => {
      const r = b.getBoundingClientRect();
      const cs = getComputedStyle(b);
      return {
        tag: b.tagName,
        className: b.className,
        text: b.innerText.replace(/\n/g, ' ').trim(),
        position: cs.position,
        left: Math.round(r.left),
        right: Math.round(r.right),
        top: Math.round(r.top),
        bottom: Math.round(r.bottom),
        width: Math.round(r.width),
        height: Math.round(r.height),
      };
    });

    const cardRect = card.getBoundingClientRect();
    return {
      card: {
        width: Math.round(cardRect.width),
        left: Math.round(cardRect.left),
        right: Math.round(cardRect.right),
        scrollWidth: card.scrollWidth
      },
      buttons
    };
  });

  console.log('Prescription Card Data at 360px:', JSON.stringify(cardData, null, 2));

  const shot = path.join(ARTIFACT_DIR, 'debug_rx_card_mobile.png');
  await page.screenshot({ path: shot });
  console.log('Saved screenshot:', shot);

  await browser.close();
}

main().catch(console.error);
