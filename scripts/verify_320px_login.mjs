import { chromium } from 'playwright';
import path from 'path';

const chromeSystem = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:/Users/asus1/.gemini/antigravity/brain/737eb81e-624f-4504-b938-d04ece747f9b';

async function main() {
  const browser = await chromium.launch({ executablePath: chromeSystem, headless: true });
  const context = await browser.newContext({
    viewport: { width: 320, height: 650 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true
  });
  const page = await context.newPage();
  
  // Go to login page
  console.log('Navigating to http://127.0.0.1:5176/login ...');
  await page.goto('http://127.0.0.1:5176/login', { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);

  // Get computed font of body and back pill
  const metrics = await page.evaluate(() => {
    const body = document.body;
    const style = window.getComputedStyle(body);
    const pill = document.querySelector('.access-back-pill');
    const pillStyle = pill ? window.getComputedStyle(pill) : null;
    const pillRect = pill ? pill.getBoundingClientRect() : null;
    const doctorSpecialty = document.querySelector('.mob-doctor-specialty');
    const specialtyText = doctorSpecialty ? doctorSpecialty.textContent : '';
    const specialtyRect = doctorSpecialty ? doctorSpecialty.getBoundingClientRect() : null;
    return {
      bodyFontFamily: style.fontFamily,
      bodyFontSize: style.fontSize,
      pillFontFamily: pillStyle ? pillStyle.fontFamily : null,
      pillFontSize: pillStyle ? pillStyle.fontSize : null,
      pillRect: pillRect ? { x: pillRect.x, y: pillRect.y, width: pillRect.width, height: pillRect.height } : null,
      specialtyText,
      specialtyRect: specialtyRect ? { width: specialtyRect.width, height: specialtyRect.height } : null
    };
  });

  console.log('Computed styles and layout metrics on 320px:', JSON.stringify(metrics, null, 2));

  // Screenshot topbar
  const topBar = await page.$('.access-top');
  if (topBar) {
    await topBar.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_login_topbar_320px.png') });
    console.log('Saved verify_login_topbar_320px.png');
  }

  // Screenshot doctor card
  const docCard = await page.$('.mobile-doctor-hero');
  if (docCard) {
    await docCard.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_login_doc_card_320px.png') });
    console.log('Saved verify_login_doc_card_320px.png');
  }

  // Screenshot full viewport
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'verify_login_320px_final.png'),
    fullPage: false
  });
  console.log('Screenshot saved to verify_login_320px_final.png');

  await browser.close();
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
