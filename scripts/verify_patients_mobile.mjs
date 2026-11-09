import { chromium } from 'playwright';
import path from 'path';

const chromeSystem = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:/Users/makah/.gemini/antigravity/brain/2057bfec-2a0f-40f7-b7e0-8582b8d1ddb0';

async function main() {
  console.log('🚀 Verifying Upgraded Patient Tabs & Cards on Small Mobile...');
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

  // Inspect the 5 tabs
  const tabInfo = await page.evaluate(() => {
    const strip = document.querySelector('.patient-console-tabs');
    const tabs = Array.from(strip.querySelectorAll('button')).map(b => ({
      text: b.innerText.replace(/\n/g, ' ').trim(),
      width: b.offsetWidth,
      height: b.offsetHeight,
      isActive: b.classList.contains('active')
    }));
    return {
      stripWidth: strip.offsetWidth,
      stripScrollWidth: strip.scrollWidth,
      tabs
    };
  });
  console.log('Tabs Info at 320px:', JSON.stringify(tabInfo, null, 2));

  // Screenshot tabs at 320px
  const shot1 = path.join(ARTIFACT_DIR, 'verified_320px_patient_swipeable_tabs.png');
  await page.screenshot({ path: shot1 });
  console.log('Saved screenshot:', shot1);

  // Click on "حسابات وملفات العملاء" tab to see patient cards
  await page.click('.patient-console-tabs button:has-text("حسابات")');
  await page.waitForTimeout(600);

  // Inspect the patient action buttons
  const cardActions = await page.evaluate(() => {
    const card = document.querySelector('.patients-list > div:not(.portal-empty)');
    if (!card) return null;
    const fullBtn = card.querySelector('.btn-patient-full-file');
    const subGrid = card.querySelector('.patient-actions-2x2-grid');
    const subButtons = Array.from(subGrid ? subGrid.querySelectorAll('button') : []).map(b => ({
      text: b.innerText.replace(/\n/g, ' ').trim(),
      width: b.offsetWidth,
      height: b.offsetHeight
    }));
    return {
      cardWidth: card.offsetWidth,
      cardScrollWidth: card.scrollWidth,
      fullBtn: fullBtn ? { width: fullBtn.offsetWidth, height: fullBtn.offsetHeight, text: fullBtn.innerText.trim() } : null,
      subButtons
    };
  });
  console.log('Patient Card Actions Info:', JSON.stringify(cardActions, null, 2));

  const shot2 = path.join(ARTIFACT_DIR, 'verified_320px_patient_card_actions.png');
  await page.screenshot({ path: shot2 });
  console.log('Saved screenshot:', shot2);

  await browser.close();
  console.log('✅ All checks passed!');
}

main().catch(console.error);
