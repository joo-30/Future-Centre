import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const chromeSystem = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function cropSameh() {
  const browser = await chromium.launch({
    executablePath: chromeSystem,
    headless: true,
  });

  const page = await browser.newPage();
  const samehSrc = path.resolve(__dirname, '../client/public/stories/transformation_sameh.jpg');
  const samehB64 = fs.readFileSync(samehSrc).toString('base64');

  await page.setContent(`<!DOCTYPE html>
  <html>
  <body>
    <img id="s" src="data:image/jpeg;base64,${samehB64}">
    <canvas id="c"></canvas>
  </body>
  </html>`);

  const samehCrops = await page.evaluate(() => {
    const img = document.getElementById('s');
    const c = document.getElementById('c');
    c.width = img.naturalWidth;
    c.height = img.naturalHeight;
    const ctx = c.getContext('2d');
    ctx.drawImage(img, 0, 0);

    // In 540 x 960:
    // Before: sitting in chair at bottom right (y=410..880, x=500..950 roughly)
    const cB = document.createElement('canvas');
    cB.width = 280;
    cB.height = 420;
    const ctxB = cB.getContext('2d');
    ctxB.drawImage(c, 240, 410, 280, 420, 0, 0, 280, 420);

    // After: sitting at desk top left (y=160..580, x=10..310)
    const cA = document.createElement('canvas');
    cA.width = 280;
    cA.height = 420;
    const ctxA = cA.getContext('2d');
    ctxA.drawImage(c, 10, 160, 280, 420, 0, 0, 280, 420);

    return {
      before: cB.toDataURL('image/png'),
      after: cA.toDataURL('image/png')
    };
  });

  fs.writeFileSync('C:/Users/asus1/.gemini/antigravity/brain/737eb81e-624f-4504-b938-d04ece747f9b/sameh_before_full.png', samehCrops.before.replace(/^data:image\/png;base64,/, ''), 'base64');
  fs.writeFileSync('C:/Users/asus1/.gemini/antigravity/brain/737eb81e-624f-4504-b938-d04ece747f9b/sameh_after_full.png', samehCrops.after.replace(/^data:image\/png;base64,/, ''), 'base64');
  console.log('Saved Sameh crops synchronously');
  await browser.close();
}

cropSameh().catch(console.error);
