import fs from 'node:fs';
import { chromium } from '@playwright/test';

const chromeSystem = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const rawImagePath = 'C:/Users/asus1/.gemini/antigravity/brain/737eb81e-624f-4504-b938-d04ece747f9b/.user_uploaded/media_1794314887780_93c853a0.jpg';

async function main() {
  const browser = await chromium.launch({
    executablePath: chromeSystem,
    headless: true,
  });

  const page = await browser.newPage();
  const rawBase64 = fs.readFileSync(rawImagePath).toString('base64');

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
        window.c = c;
      };
      img.src = 'data:image/jpeg;base64,${rawBase64}';
    </script>
  </body>
  </html>`);

  await page.waitForFunction(() => window.c !== undefined);

  // Let's test crops:
  // In the active area:
  // Original raw image is 1024x597
  // Left photo (Before):
  // x: from 140 to 308 (width 168)
  // y: from 105 to 525 (height 420)
  // Right photo (After):
  // x: from 312 to 535 (width 223)
  // y: from 105 to 525 (height 420)

  const crops = await page.evaluate(() => {
    // Before crop
    const cBefore = document.createElement('canvas');
    cBefore.width = 170;
    cBefore.height = 420;
    const ctxB = cBefore.getContext('2d');
    // Notice in Before: top text 'Before' ends around y=105. Safia's hijab starts around y=190.
    // So y=105 includes all the background above her head!
    ctxB.drawImage(window.c, 140, 105, 170, 420, 0, 0, 170, 420);

    // After crop
    const cAfter = document.createElement('canvas');
    cAfter.width = 224;
    cAfter.height = 420;
    const ctxA = cAfter.getContext('2d');
    // In After: top text 'After' ends around y=95. The TV is above her head.
    ctxA.drawImage(window.c, 312, 105, 224, 420, 0, 0, 224, 420);

    return {
      before: cBefore.toDataURL('image/png'),
      after: cAfter.toDataURL('image/png'),
    };
  });

  fs.writeFileSync('C:/Users/asus1/.gemini/antigravity/brain/737eb81e-624f-4504-b938-d04ece747f9b/crop_before_test.png', crops.before.replace(/^data:image\/png;base64,/, ''), 'base64');
  fs.writeFileSync('C:/Users/asus1/.gemini/antigravity/brain/737eb81e-624f-4504-b938-d04ece747f9b/crop_after_test.png', crops.after.replace(/^data:image\/png;base64,/, ''), 'base64');
  console.log('Saved test crops!');
  await browser.close();
}

main().catch(console.error);
