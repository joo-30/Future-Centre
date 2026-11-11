import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const chromeSystem = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function testCrops() {
  const browser = await chromium.launch({
    executablePath: chromeSystem,
    headless: true,
  });

  const page = await browser.newPage();

  // Nada source
  const nadaSrc = path.resolve(__dirname, '../client/public/stories/transformation_107kg.jpg');
  const nadaB64 = fs.readFileSync(nadaSrc).toString('base64');

  await page.setContent(`<!DOCTYPE html>
  <html>
  <body>
    <canvas id="c"></canvas>
    <script>
      const img = new Image();
      img.onload = () => {
        const c = document.getElementById('c');
        c.width = img.width;
        c.height = img.height;
        const ctx = c.getContext('2d');
        ctx.drawImage(img, 0, 0);

        // In 526 x 704 transformation_107kg.jpg:
        // Left photo (Before):
        // x: 30 to 258 (w=228)
        // y: 150 to 670 (h=520) - includes her head/face!
        const cBefore = document.createElement('canvas');
        cBefore.width = 228;
        cBefore.height = 520;
        const ctxB = cBefore.getContext('2d');
        ctxB.drawImage(c, 30, 150, 228, 520, 0, 0, 228, 520);

        // Right photo (After):
        // x: 268 to 496 (w=228)
        // y: 150 to 670 (h=520) - includes her head/face!
        const cAfter = document.createElement('canvas');
        cAfter.width = 228;
        cAfter.height = 520;
        const ctxA = cAfter.getContext('2d');
        ctxA.drawImage(c, 268, 150, 228, 520, 0, 0, 228, 520);

        window.nadaBefore = cBefore.toDataURL('image/png');
        window.nadaAfter = cAfter.toDataURL('image/png');
      };
      img.src = 'data:image/jpeg;base64,${nadaB64}';
    </script>
  </body>
  </html>`);

  await page.waitForFunction(() => window.nadaBefore !== undefined);
  const nada = await page.evaluate(() => ({ before: window.nadaBefore, after: window.nadaAfter }));
  fs.writeFileSync('C:/Users/asus1/.gemini/antigravity/brain/737eb81e-624f-4504-b938-d04ece747f9b/nada_before_full.png', nada.before.replace(/^data:image\/png;base64,/, ''), 'base64');
  fs.writeFileSync('C:/Users/asus1/.gemini/antigravity/brain/737eb81e-624f-4504-b938-d04ece747f9b/nada_after_full.png', nada.after.replace(/^data:image\/png;base64,/, ''), 'base64');
  console.log('Saved Nada full crops');

  // Sameh source: transformation_sameh.jpg (540 x 960)
  const samehSrc = path.resolve(__dirname, '../client/public/stories/transformation_sameh.jpg');
  const samehB64 = fs.readFileSync(samehSrc).toString('base64');

  await page.setContent(`<!DOCTYPE html>
  <html>
  <body>
    <canvas id="c"></canvas>
    <script>
      const img = new Image();
      img.onload = () => {
        const c = document.getElementById('c');
        c.width = img.width;
        c.height = img.height;
        const ctx = c.getContext('2d');
        ctx.drawImage(img, 0, 0);

        // In 540 x 960 transformation_sameh.jpg:
        // Before photo is bottom right: x=240..540, y=410..860 (w=300, h=450)
        const cBefore = document.createElement('canvas');
        cBefore.width = 300;
        cBefore.height = 450;
        const ctxB = cBefore.getContext('2d');
        ctxB.drawImage(c, 240, 410, 300, 450, 0, 0, 300, 450);

        // After photo is top left: x=10..310, y=180..630 (w=300, h=450)
        const cAfter = document.createElement('canvas');
        cAfter.width = 300;
        cAfter.height = 450;
        const ctxA = cAfter.getContext('2d');
        ctxA.drawImage(c, 10, 180, 300, 450, 0, 0, 300, 450);

        window.samehBefore = cBefore.toDataURL('image/png');
        window.samehAfter = cAfter.toDataURL('image/png');
      };
      img.src = 'data:image/jpeg;base64,${samehB64}';
    </script>
  </body>
  </html>`);

  await page.waitForFunction(() => window.samehBefore !== undefined);
  const sameh = await page.evaluate(() => ({ before: window.samehBefore, after: window.samehAfter }));
  fs.writeFileSync('C:/Users/asus1/.gemini/antigravity/brain/737eb81e-624f-4504-b938-d04ece747f9b/sameh_before_full.png', sameh.before.replace(/^data:image\/png;base64,/, ''), 'base64');
  fs.writeFileSync('C:/Users/asus1/.gemini/antigravity/brain/737eb81e-624f-4504-b938-d04ece747f9b/sameh_after_full.png', sameh.after.replace(/^data:image\/png;base64,/, ''), 'base64');
  console.log('Saved Sameh full crops');

  await browser.close();
}

testCrops().catch(console.error);
