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

  await page.goto('http://127.0.0.1:5176/admin/bmi');
  await page.waitForTimeout(1000);

  const shot = path.join(ARTIFACT_DIR, 'debug_320px_bmi_inputs.png');
  await page.screenshot({ path: shot, fullPage: true });
  console.log('Saved screenshot of /admin/bmi at 320px');

  const overflow = await page.evaluate(() => {
    const list = [];
    document.querySelectorAll('*').forEach(el => {
      if (el.closest('.console-sidebar')) return;
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.height > 0 && (r.right > 321 || r.left < -1)) {
        list.push({
          tag: el.tagName,
          className: (el.className || '').toString().slice(0, 50),
          left: Math.round(r.left),
          right: Math.round(r.right),
          width: Math.round(r.width),
          text: (el.innerText || '').slice(0, 30).replace(/\n/g, ' ')
        });
      }
    });
    return list;
  });
  const cardInfo = await page.evaluate(() => {
    const card = document.querySelector('.calc-card');
    const parent = card ? card.parentElement : null;
    const body = document.querySelector('.console-body');
    const content = document.querySelector('.console-content');
    return {
      body: body ? { width: body.offsetWidth, padding: getComputedStyle(body).padding } : null,
      content: content ? { width: content.offsetWidth, padding: getComputedStyle(content).padding, margin: getComputedStyle(content).margin } : null,
      parent: parent ? { width: parent.offsetWidth, padding: getComputedStyle(parent).padding } : null,
      card: card ? {
        width: card.offsetWidth,
        padding: getComputedStyle(card).padding,
        margin: getComputedStyle(card).margin,
        minWidth: getComputedStyle(card).minWidth,
        maxWidth: getComputedStyle(card).maxWidth,
        rect: card.getBoundingClientRect()
      } : null,
    };
  });
  const wideChildren = await page.evaluate(() => {
    const card = document.querySelector('.calc-card');
    const wide = [];
    card.querySelectorAll('*').forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.width > 280) {
        wide.push({
          tag: el.tagName,
          className: el.className,
          width: r.width,
          scrollWidth: el.scrollWidth,
          text: (el.innerText || '').slice(0, 25).replace(/\n/g, ' ')
        });
      }
    });
    return wide;
  });
  const testWidths = await page.evaluate(() => {
    const card = document.querySelector('.calc-card');
    const results = [];
    card.querySelectorAll('*').forEach(el => {
      const cs = getComputedStyle(el);
      if (cs.minWidth && cs.minWidth !== '0px' && cs.minWidth !== 'auto') {
        results.push({ tag: el.tagName, class: el.className, minWidth: cs.minWidth });
      }
    });
    return results;
  });
  const parentInfo = await page.evaluate(() => {
    const card = document.querySelector('.calc-card');
    const p = card ? card.parentElement : null;
    return {
      parentTag: p?.tagName,
      parentClass: p?.className,
      parentDisplay: p ? getComputedStyle(p).display : null,
      parentGridTemplate: p ? getComputedStyle(p).gridTemplateColumns : null,
      parentFlexDirection: p ? getComputedStyle(p).flexDirection : null,
      cardWidth: card?.offsetWidth,
      cardComputedWidth: card ? getComputedStyle(card).width : null,
      cardFlex: card ? getComputedStyle(card).flex : null,
    };
  });
  const afterFix = await page.evaluate(() => {
    const layout = document.querySelector('.calc-layout');
    layout.style.gridTemplateColumns = 'minmax(0, 1fr)';
    document.querySelectorAll('.calc-card').forEach(c => {
      c.style.minWidth = '0';
    });
    const card = document.querySelector('.calc-card');
    return {
      layoutWidth: layout.offsetWidth,
      layoutScrollWidth: layout.scrollWidth,
      cardWidth: card.offsetWidth,
      cardScrollWidth: card.scrollWidth,
      cardRect: card.getBoundingClientRect()
    };
  });
  const measured = await page.evaluate(() => {
    const card = document.querySelector('.calc-card');
    const layout = document.querySelector('.calc-layout');
    return {
      layoutWidth: layout?.offsetWidth,
      layoutScrollWidth: layout?.scrollWidth,
      cardWidth: card?.offsetWidth,
      cardScrollWidth: card?.scrollWidth,
      cardRect: card?.getBoundingClientRect()
    };
  });
  console.log('Real measured layout on /admin/bmi at 320px:', measured);

  await browser.close();
}

main().catch(console.error);
