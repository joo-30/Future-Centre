import { chromium } from '@playwright/test';

const chromeSystem = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function testWidth(width) {
  const browser = await chromium.launch({ executablePath: chromeSystem, headless: true });
  const page = await browser.newPage({ viewport: { width, height: 800 } });
  
  await page.goto('http://127.0.0.1:5176/', { waitUntil: 'networkidle' });
  
  const overflow = await page.evaluate(() => {
    const docWidth = document.documentElement.scrollWidth;
    const winWidth = window.innerWidth;
    const overflowingElements = [];
    
    document.querySelectorAll('*').forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.right > winWidth + 2 || rect.left < -2 || rect.width > winWidth + 2) {
        overflowingElements.push({
          tag: el.tagName,
          class: el.className,
          id: el.id,
          rect: { left: Math.round(rect.left), right: Math.round(rect.right), width: Math.round(rect.width) },
        });
      }
    });
    
    return {
      docWidth,
      winWidth,
      isOverflowing: docWidth > winWidth,
      overflowingElements: overflowingElements.slice(0, 15)
    };
  });
  
  console.log(`\n=== Viewport Width: ${width}px ===`);
  console.log(`docWidth: ${overflow.docWidth}, winWidth: ${overflow.winWidth}, isOverflowing: ${overflow.isOverflowing}`);
  if (overflow.isOverflowing) {
    console.log('Top overflowing elements:');
    overflow.overflowingElements.forEach(e => {
      console.log(`  <${e.tag} class="${e.class}"> width: ${e.rect.width}px, left: ${e.rect.left}px, right: ${e.rect.right}px`);
    });
  }
  
  await page.screenshot({ path: `C:/Users/makah/.gemini/antigravity/brain/c5a2d578-79e0-4272-a5fc-e64001de35e9/scratch/screenshot-${width}.png`, fullPage: false });
  await browser.close();
}

async function run() {
  for (const w of [320, 375, 768, 992]) {
    await testWidth(w);
  }
}

run().catch(console.error);
