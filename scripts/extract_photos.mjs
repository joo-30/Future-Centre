import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const chromeSystem = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function extractPhotos() {
  const browser = await chromium.launch({
    executablePath: chromeSystem,
    headless: true,
  });

  const page = await browser.newPage();

  // 1. Inspect and extract Nada Before & After from transformation_107kg.jpg (526 x 704)
  const nadaRawBase64 = fs.readFileSync(path.resolve(__dirname, '../client/public/stories/transformation_107kg.jpg')).toString('base64');

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

        // In transformation_107kg.jpg (526 x 704):
        // Left photo: x=30 to 258, y=240 to 670 (Before, 107kg, purple coat)
        // Right photo: x=268 to 496, y=240 to 670 (After, 80kg, white jacket)
        const cBefore = document.createElement('canvas');
        cBefore.width = 228;
        cBefore.height = 430;
        const ctxB = cBefore.getContext('2d');
        ctxB.drawImage(c, 30, 240, 228, 430, 0, 0, 228, 430);

        const cAfter = document.createElement('canvas');
        cAfter.width = 228;
        cAfter.height = 430;
        const ctxA = cAfter.getContext('2d');
        ctxA.drawImage(c, 268, 240, 228, 430, 0, 0, 228, 430);

        window.nadaBefore = cBefore.toDataURL('image/png');
        window.nadaAfter = cAfter.toDataURL('image/png');
      };
      img.src = 'data:image/jpeg;base64,${nadaRawBase64}';
    </script>
  </body>
  </html>`);

  await page.waitForFunction(() => window.nadaBefore !== undefined && window.nadaAfter !== undefined);
  const nadaCrops = await page.evaluate(() => ({
    before: window.nadaBefore,
    after: window.nadaAfter,
  }));

  fs.writeFileSync('C:/Users/asus1/.gemini/antigravity/brain/737eb81e-624f-4504-b938-d04ece747f9b/nada_before_crop.png', nadaCrops.before.replace(/^data:image\/png;base64,/, ''), 'base64');
  fs.writeFileSync('C:/Users/asus1/.gemini/antigravity/brain/737eb81e-624f-4504-b938-d04ece747f9b/nada_after_crop.png', nadaCrops.after.replace(/^data:image\/png;base64,/, ''), 'base64');
  console.log('Saved Nada crops');

  // 2. Inspect and extract Sameh Before & After from transformation_sameh.jpg (540 x 960)
  const samehRawBase64 = fs.readFileSync(path.resolve(__dirname, '../client/public/stories/transformation_sameh.jpg')).toString('base64');

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

        // In transformation_sameh.jpg (540 x 960):
        // Before photo: sitting in dark chair at bottom right (y=410..840, x=500..950 roughly)
        // Let's inspect where the two photos are
        const cBefore = document.createElement('canvas');
        cBefore.width = 300;
        cBefore.height = 420;
        const ctxB = cBefore.getContext('2d');
        // Bottom right photo:
        ctxB.drawImage(c, 240, 410, 300, 420, 0, 0, 300, 420);

        // Top left photo (After):
        const cAfter = document.createElement('canvas');
        cAfter.width = 300;
        cAfter.height = 420;
        const ctxA = cAfter.getContext('2d');
        ctxA.drawImage(c, 10, 160, 300, 420, 0, 0, 300, 420);

        window.samehBefore = cBefore.toDataURL('image/png');
        window.samehAfter = cAfter.toDataURL('image/png');
      };
      img.src = 'data:image/jpeg;base64,${samehRawBase64}';
    </script>
  </body>
  </html>`);

  await page.waitForFunction(() => window.samehBefore !== undefined && window.samehAfter !== undefined);
  const samehCrops = await page.evaluate(() => ({
    before: window.samehBefore,
    after: window.samehAfter,
  }));

  fs.writeFileSync('C:/Users/asus1/.gemini/antigravity/brain/737eb81e-624f-4504-b938-d04ece747f9b/sameh_before_crop.png', samehCrops.before.replace(/^data:image\/png;base64,/, ''), 'base64');
  fs.writeFileSync('C:/Users/asus1/.gemini/antigravity/brain/737eb81e-624f-4504-b938-d04ece747f9b/sameh_after_crop.png', samehCrops.after.replace(/^data:image\/png;base64,/, ''), 'base64');
  console.log('Saved Sameh crops');

  await browser.close();
}

extractPhotos().catch(console.error);
