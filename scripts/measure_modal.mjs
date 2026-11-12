import { chromium } from '@playwright/test';

const chromeSystem = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function main() {
  const browser = await chromium.launch({ executablePath: chromeSystem, headless: true });
  const page = await browser.newPage();
  
  // Test at 360px (very small mobile viewport)
  await page.setViewportSize({ width: 360, height: 780 });
  await page.goto('http://127.0.0.1:5176/login', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(400);
  await page.click('button.role-admin');
  await page.waitForTimeout(1000);

  await page.goto('http://127.0.0.1:5176/admin/patients?tab=patients', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1200);

  // Click on "إضافة اشتراك" on the first patient
  await page.evaluate(() => {
    const subBtns = Array.from(document.querySelectorAll('button')).filter(b => b.innerText.includes('إضافة اشتراك') && b.classList.contains('btn-patient-subaction'));
    if (subBtns.length > 0) subBtns[0].click();
  });
  await page.waitForTimeout(800);

  // Measure all critical areas
  const report = await page.evaluate(() => {
    const results = {};

    // 1. Patient Card
    const changeBtn = document.querySelector('.sub-change-patient-btn');
    const avatar = document.querySelector('.sub-patient-avatar-box');
    const name = document.querySelector('.sub-patient-name-title');
    const cardPro = document.querySelector('.sub-patient-card-pro');
    if (changeBtn && avatar && cardPro) {
      const cRect = changeBtn.getBoundingClientRect();
      const aRect = avatar.getBoundingClientRect();
      const nRect = name ? name.getBoundingClientRect() : null;
      results.patientCard = {
        changeOverlapsAvatar: !(cRect.right < aRect.left || cRect.left > aRect.right),
        changeOverlapsName: nRect ? !(cRect.right < nRect.left || cRect.left > nRect.right) : false
      };
    }

    // 2. Patient Bottom Cluster
    const phoneTag = document.querySelector('.sub-patient-phone-tag');
    const waLink = document.querySelector('.sub-patient-whatsapp-link');
    if (phoneTag && waLink && cardPro) {
      const cpRect = cardPro.getBoundingClientRect();
      const pRect = phoneTag.getBoundingClientRect();
      const wRect = waLink.getBoundingClientRect();
      results.patientBottom = {
        waOverflowsCardLeftBy: Math.max(0, cpRect.left - wRect.left),
        phoneOverflowsCardRightBy: Math.max(0, pRect.right - cpRect.right)
      };
    }

    // 3. Sessions Lead
    const figures = document.querySelector('.sub-sessions-figures');
    const pill = document.querySelector('.sub-remaining-pill');
    if (figures && pill) {
      const fRect = figures.getBoundingClientRect();
      const pRect = pill.getBoundingClientRect();
      results.sessionsLead = {
        figuresWidth: fRect.width,
        pillWidth: pRect.width,
        overlaps2D: !(fRect.left >= pRect.right || fRect.right <= pRect.left || fRect.bottom <= pRect.top || fRect.top >= pRect.bottom), fTop: fRect.top, fBottom: fRect.bottom, pTop: pRect.top, pBottom: pRect.bottom
      };
    }

    // 4. Stepper Row & Total Chips
    const stepperBox = document.querySelector('.sub-sessions-box');
    const totalChips = document.querySelector('.sub-total-chips');
    if (stepperBox && totalChips) {
      const sbRect = stepperBox.getBoundingClientRect();
      const tcRect = totalChips.getBoundingClientRect();
      results.stepperRow = {
        boxWidth: sbRect.width,
        totalChipsLeft: tcRect.left,
        totalChipsRight: tcRect.right,
        totalChipsOverflowLeftBy: Math.max(0, sbRect.left - tcRect.left),
        totalChipsOverflowRightBy: Math.max(0, tcRect.right - sbRect.right)
      };
    }

    // 5. Quick Duration Strip & Chips
    const durationStrip = document.querySelector('.sub-quick-duration-strip');
    const durationChips = Array.from(document.querySelectorAll('.sub-duration-pill-btn'));
    if (durationStrip && durationChips.length > 0) {
      const dsRect = durationStrip.getBoundingClientRect();
      results.durationChips = durationChips.map(btn => {
        const bRect = btn.getBoundingClientRect();
        return {
          text: btn.innerText.trim(),
          width: Math.round(bRect.width),
          scrollWidth: btn.scrollWidth,
          isClipped: btn.scrollWidth > bRect.width + 1,
          overflowsStripLeftBy: Math.max(0, Math.round(dsRect.left - bRect.left)),
          overflowsStripRightBy: Math.max(0, Math.round(bRect.right - dsRect.right))
        };
      });
    }

    // 6. Overall Modal Horizontal Overflow Check
    const modal = document.querySelector('dialog[open]');
    if (modal) {
      const mRect = modal.getBoundingClientRect();
      const overflowingElements = [];
      for (const el of modal.querySelectorAll('*')) {
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) continue;
        if (r.left < mRect.left - 2 || r.right > mRect.right + 2) {
          overflowingElements.push({
            tag: el.tagName,
            className: el.className,
            text: el.innerText ? el.innerText.slice(0, 20) : '',
            left: r.left,
            right: r.right,
            modalLeft: mRect.left,
            modalRight: mRect.right
          });
        }
      }
      results.modalOverflow = {
        modalWidth: mRect.width,
        modalScrollWidth: modal.scrollWidth,
        hasHorizontalScroll: modal.scrollWidth > modal.clientWidth,
        overflowingElementsCount: overflowingElements.length,
        overflowingElements
      };
    }

    return results;
  });

  console.log('FULL 360PX VALIDATION REPORT:', JSON.stringify(report, null, 2));

  // Capture pristine screenshots for the user
  const basePath = 'C:/Users/asus1/.gemini/antigravity/brain/8e61b3db-cb1a-48d8-a864-e3eea3ec64d7';
  
  // 1. Top Section (Banner, Patient Card, Inputs)
  await page.screenshot({
    path: `${basePath}/verified_subscription_modal_mobile_top.png`,
    animations: 'disabled'
  });

  // 2. Middle Section (Programs, Status, Sessions Box)
  await page.evaluate(() => {
    const m = document.querySelector('dialog[open]');
    if (m) m.scrollTop = 380;
  });
  await page.waitForTimeout(300);
  await page.screenshot({
    path: `${basePath}/verified_subscription_modal_mobile_middle.png`,
    animations: 'disabled'
  });

  // 3. Bottom Section (Duration, Dates, Pricing, Actions)
  await page.evaluate(() => {
    const m = document.querySelector('dialog[open]');
    if (m) m.scrollTop = 850;
  });
  await page.waitForTimeout(300);
  await page.screenshot({
    path: `${basePath}/verified_subscription_modal_mobile_bottom.png`,
    animations: 'disabled'
  });

  console.log('All 3 mobile verification screenshots captured successfully!');
  await browser.close();
}

main().catch(console.error);
