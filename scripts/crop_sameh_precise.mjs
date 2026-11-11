import fs from 'node:fs';
import { chromium } from '@playwright/test';

const chromeSystem = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function cropSamehPrecise() {
  const browser = await chromium.launch({
    executablePath: chromeSystem,
    headless: true,
  });

  const page = await browser.newPage();
  const samehB64 = fs.readFileSync('C:/Users/asus1/.gemini/antigravity/brain/737eb81e-624f-4504-b938-d04ece747f9b/view_trans_sameh.jpg').toString('base64');

  await page.setContent(`<!DOCTYPE html><html><body><img id="s" src="data:image/jpeg;base64,${samehB64}"><canvas id="c"></canvas></body></html>`);
  const crops = await page.evaluate(() => {
    const img = document.getElementById('s');
    const c = document.getElementById('c');
    c.width = img.naturalWidth; // 540
    c.height = img.naturalHeight; // 960
    const ctx = c.getContext('2d');
    ctx.drawImage(img, 0, 0);

    // In 540 x 960:
    // Let's see: In the bottom photo (Before):
    // Sameh sitting in rattan chair.
    // Where is his head?
    // In our earlier crop_sameh_sync.mjs, we did:
    // ctxB.drawImage(c, 240, 410, 280, 420, 0, 0, 280, 420);
    // Let's test a wider crop of the bottom photo:
    // From y=380 to 860, and from x=150 to 540
    const cB = document.createElement('canvas');
    cB.width = 390;
    cB.height = 480;
    const ctxB = cB.getContext('2d');
    ctxB.drawImage(c, 150, 380, 390, 480, 0, 0, 390, 480);

    // Top photo (After, sitting at desk):
    // From y=140 to 600, x=0 to 380
    const cA = document.createElement('canvas');
    cA.width = 380;
    cA.height = 460;
    const ctxA = cA.getContext('2d');
    ctxA.drawImage(c, 0, 140, 380, 460, 0, 0, 380, 460);

    return { before: cB.toDataURL('image/png'), after: cA.toDataURL('image/png') };
  });

  fs.writeFileSync('C:/Users/asus1/.gemini/antigravity/brain/737eb81e-624f-4504-b938-d04ece747f9b/test_sameh_b.png', crops.before.replace(/^data:image\/png;base64,/, ''), 'base64');
  fs.writeFileSync('C:/Users/asus1/.gemini/antigravity/brain/737eb81e-624f-4504-b938-d04ece747f9b/test_sameh_a.png', crops.after.replace(/^data:image\/png;base64,/, ''), 'base64');
  console.log('Saved test sameh crops');
  await browser.close();
}

cropSamehPrecise().catch(console.error);
