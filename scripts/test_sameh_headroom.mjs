import fs from 'node:fs';
import { chromium } from '@playwright/test';

const chromeSystem = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function testSamehHeadroom() {
  const browser = await chromium.launch({ executablePath: chromeSystem, headless: true });
  const page = await browser.newPage();
  const samehSrc = 'C:/Users/asus1/.gemini/antigravity/brain/737eb81e-624f-4504-b938-d04ece747f9b/view_trans_sameh.jpg';
  const samehB64 = fs.readFileSync(samehSrc).toString('base64');
  await page.setContent(`<!DOCTYPE html><html><body><img id="sameh" src="data:image/jpeg;base64,${samehB64}"><canvas id="c"></canvas></body></html>`);
  
  const crops = await page.evaluate(() => {
    const img = document.getElementById('sameh');
    const c = document.getElementById('c');
    c.width = img.naturalWidth;
    c.height = img.naturalHeight;
    const ctx = c.getContext('2d');
    ctx.drawImage(img, 0, 0);

    // Let's test Before with y: 350 vs 370
    const cB1 = document.createElement('canvas');
    cB1.width = 255;
    cB1.height = 490;
    const ctxB1 = cB1.getContext('2d');
    ctxB1.drawImage(c, 285, 350, 255, 490, 0, 0, 255, 490);

    const cB2 = document.createElement('canvas');
    cB2.width = 255;
    cB2.height = 490;
    const ctxB2 = cB2.getContext('2d');
    ctxB2.drawImage(c, 285, 365, 255, 490, 0, 0, 255, 490);

    return {
      b1: cB1.toDataURL('image/png'),
      b2: cB2.toDataURL('image/png')
    };
  });

  fs.writeFileSync('C:/Users/asus1/.gemini/antigravity/brain/737eb81e-624f-4504-b938-d04ece747f9b/test_sameh_headroom_350.png', Buffer.from(crops.b1.split(',')[1], 'base64'));
  fs.writeFileSync('C:/Users/asus1/.gemini/antigravity/brain/737eb81e-624f-4504-b938-d04ece747f9b/test_sameh_headroom_365.png', Buffer.from(crops.b2.split(',')[1], 'base64'));
  console.log('Exported headroom tests');
  await browser.close();
}

testSamehHeadroom().catch(console.error);
