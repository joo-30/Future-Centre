import fs from 'node:fs';
import path from 'node:path';
import { chromium } from '@playwright/test';

const chromeSystem = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function inspectSafia() {
  const browser = await chromium.launch({
    executablePath: chromeSystem,
    headless: true,
  });
  const page = await browser.newPage();
  const rawPath = 'C:/Users/asus1/.gemini/antigravity/brain/737eb81e-624f-4504-b938-d04ece747f9b/.user_uploaded/media_1794314887780_93c853a0.jpg';
  const b64 = fs.readFileSync(rawPath).toString('base64');
  
  await page.setContent(`<!DOCTYPE html><html><body style="margin:0"><img id="img" src="data:image/jpeg;base64,${b64}"></body></html>`);
  const info = await page.evaluate(() => {
    const img = document.getElementById('img');
    return { w: img.naturalWidth, h: img.naturalHeight };
  });
  console.log('Safia original image dims:', info);

  // Take test crops with generous headroom:
  // Before: Madame Safia on the left (at 92k)
  // After: Madame Safia on the right (at 77k)
  // Let's test different Y start offsets: y=0, y=20, y=40, y=60
  await page.evaluate(() => {
    const img = document.getElementById('img');
    const c = document.createElement('canvas');
    c.width = img.naturalWidth;
    c.height = img.naturalHeight;
    const ctx = c.getContext('2d');
    ctx.drawImage(img, 0, 0);

    // Let's crop Before and After with y=10 (to avoid slicing the top of her head/scarf)
    // In raw image, Before is roughly x:135..305, After is roughly x:310..535
    // Let's crop generous bounding boxes
    const cBefore = document.createElement('canvas');
    cBefore.width = 180;
    cBefore.height = 490;
    const ctxB = cBefore.getContext('2d');
    // Start y at 15 instead of 80!
    ctxB.drawImage(c, 136, 15, 180, 490, 0, 0, 180, 490);

    const cAfter = document.createElement('canvas');
    cAfter.width = 225;
    cAfter.height = 490;
    const ctxA = cAfter.getContext('2d');
    // Start y at 15 instead of 70!
    ctxA.drawImage(c, 312, 15, 225, 490, 0, 0, 225, 490);

    window.crops = {
      b: cBefore.toDataURL('image/png'),
      a: cAfter.toDataURL('image/png')
    };
  });

  const crops = await page.evaluate(() => window.crops);
  fs.writeFileSync('C:/Users/asus1/.gemini/antigravity/brain/737eb81e-624f-4504-b938-d04ece747f9b/test_safia_b.png', Buffer.from(crops.b.split(',')[1], 'base64'));
  fs.writeFileSync('C:/Users/asus1/.gemini/antigravity/brain/737eb81e-624f-4504-b938-d04ece747f9b/test_safia_a.png', Buffer.from(crops.a.split(',')[1], 'base64'));
  console.log('Exported test_safia_b.png and test_safia_a.png');

  await browser.close();
}

inspectSafia().catch(console.error);
