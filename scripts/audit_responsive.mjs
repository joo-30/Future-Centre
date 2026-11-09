import { chromium } from '@playwright/test';

const chromeSystem = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function audit() {
  const browser = await chromium.launch({ executablePath: chromeSystem, headless: true });
  const urls = ['/', '/booking', '/programs', '/about', '/login', '/account'];
  const widths = [320, 360, 375, 412, 768, 820, 1024];

  for (const url of urls) {
    console.log(`\n=== PAGE: ${url} ===`);
    for (const w of widths) {
      const page = await browser.newPage({ viewport: { width: w, height: 900 } });
      await page.goto('http://127.0.0.1:5176' + url, { waitUntil: 'networkidle' });
      
      const res = await page.evaluate(() => {
        const docW = document.documentElement.scrollWidth;
        const winW = window.innerWidth;
        const overflows = [];
        
        document.querySelectorAll('*').forEach(el => {
          const r = el.getBoundingClientRect();
          if (r.width > winW + 2 || r.right > winW + 2 || r.left < -2) {
            overflows.push({
              tag: el.tagName,
              cls: (el.className || '').toString().slice(0, 45),
              w: Math.round(r.width),
              left: Math.round(r.left),
              right: Math.round(r.right),
            });
          }
        });
        
        // Also check if any text element has very small width (squished text causing letter wrapping)
        const squishedText = [];
        document.querySelectorAll('a, button, p, h1, h2, h3, h4, span, small, strong').forEach(el => {
          if (el.innerText && el.innerText.trim().length > 10) {
            const r = el.getBoundingClientRect();
            // If text has more than 10 characters but width is less than 50px
            if (r.width > 0 && r.width < 60) {
              squishedText.push({
                text: el.innerText.slice(0, 25),
                w: Math.round(r.width),
                cls: (el.className || '').toString().slice(0, 35)
              });
            }
          }
        });

        return { docW, winW, isOverflow: docW > winW, overflows: overflows.slice(0, 4), squishedText: squishedText.slice(0, 4) };
      });

      if (res.isOverflow || res.squishedText.length > 0) {
        console.log(`[FAIL] ${w}px: overflow = ${res.docW - res.winW}px, squished = ${res.squishedText.length}`);
        if (res.isOverflow) {
          res.overflows.forEach(o => console.log(`   Overflow: <${o.tag} class='${o.cls}'> w:${o.w} l:${o.left} r:${o.right}`));
        }
        if (res.squishedText.length > 0) {
          res.squishedText.forEach(s => console.log(`   Squished text: "${s.text}" w:${s.w}px in .${s.cls}`));
        }
      } else {
        console.log(`[PASS] ${w}px: clean`);
      }
      
      await page.close();
    }
  }
  await browser.close();
}

audit().catch(console.error);
