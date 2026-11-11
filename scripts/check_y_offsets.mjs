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

  // Let's take crops at different y offsets for After (x=312..535)
  // Let's see y from 60..540
  const cropData = await page.evaluate(() => {
    const cAfter = document.createElement('canvas');
    cAfter.width = 224;
    cAfter.height = 460;
    const ctxA = cAfter.getContext('2d');
    // Start at y=60 instead of y=105!
    ctxA.drawImage(window.c, 312, 60, 224, 460, 0, 0, 224, 460);

    const cBefore = document.createElement('canvas');
    cBefore.width = 170;
    cBefore.height = 460;
    const ctxB = cBefore.getContext('2d');
    // Start at y=60 instead of y=105!
    ctxB.drawImage(window.c, 140, 60, 170, 460, 0, 0, 170, 460);

    return {
      before: cBefore.toDataURL('image/png'),
      after: cAfter.toDataURL('image/png'),
    };
  });

  fs.writeFileSync('C:/Users/asus1/.gemini/antigravity/brain/737eb81e-624f-4504-b938-d04ece747f9b/crop_before_y60.png', cropData.before.replace(/^data:image\/png;base64,/, ''), 'base64');
  fs.writeFileSync('C:/Users/asus1/.gemini/antigravity/brain/737eb81e-624f-4504-b938-d04ece747f9b/crop_after_y60.png', cropData.after.replace(/^data:image\/png;base64,/, ''), 'base64');
  console.log('Saved y60 crops');
  await browser.close();
}

main().catch(console.error);
