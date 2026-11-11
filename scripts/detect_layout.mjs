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

        // Find the split between left photo and right photo
        // Let's check vertical line between x=280 and 360
        // And let's find the y ranges where the photos are (between top text 'Before/After' and bottom text '92k/77k')
        const yTopText = 70; // approx
        // Let's inspect rows around y=60..120
        window.c = c;
      };
      img.src = 'data:image/jpeg;base64,${rawBase64}';
    </script>
  </body>
  </html>`);

  await page.waitForFunction(() => window.c !== undefined);

  // Let's take a crop of the whole active area from x=130 to 535, y=0 to 597
  const activeCrop = await page.evaluate(() => {
    const c2 = document.createElement('canvas');
    c2.width = 410;
    c2.height = 597;
    const ctx2 = c2.getContext('2d');
    ctx2.drawImage(window.c, 130, 0, 410, 597, 0, 0, 410, 597);
    return c2.toDataURL('image/png');
  });

  const base64Data = activeCrop.replace(/^data:image\/png;base64,/, '');
  fs.writeFileSync('C:/Users/asus1/.gemini/antigravity/brain/737eb81e-624f-4504-b938-d04ece747f9b/active_safia_crop.png', base64Data, 'base64');
  console.log('Saved active_safia_crop.png');
  await browser.close();
}

main().catch(console.error);
