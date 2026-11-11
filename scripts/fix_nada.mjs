import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const chromeSystem = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function fixNada() {
  const browser = await chromium.launch({
    executablePath: chromeSystem,
    headless: true,
  });

  const page = await browser.newPage();
  const nadaSrc = path.resolve(__dirname, '../client/public/stories/transformation_107kg.jpg');
  const nadaB64 = fs.readFileSync('C:/Users/asus1/.gemini/antigravity/brain/737eb81e-624f-4504-b938-d04ece747f9b/view_trans_107kg.jpg').toString('base64');

  await page.setContent(`<!DOCTYPE html><html><body><img id="nada" src="data:image/jpeg;base64,${nadaB64}"><canvas id="c"></canvas></body></html>`);
  const crops = await page.evaluate(() => {
    const img = document.getElementById('nada');
    const c = document.getElementById('c');
    c.width = img.naturalWidth;
    c.height = img.naturalHeight;
    const ctx = c.getContext('2d');
    ctx.drawImage(img, 0, 0);

    // Left photo: Before (purple coat)
    const cB = document.createElement('canvas');
    cB.width = 236;
    cB.height = 520;
    const ctxB = cB.getContext('2d');
    ctxB.drawImage(c, 24, 138, 236, 520, 0, 0, 236, 520);

    // Right photo: After (white jacket)
    const cA = document.createElement('canvas');
    cA.width = 236;
    cA.height = 520;
    const ctxA = cA.getContext('2d');
    ctxA.drawImage(c, 264, 138, 236, 520, 0, 0, 236, 520);

    return { before: cB.toDataURL('image/png'), after: cA.toDataURL('image/png') };
  });

  fs.writeFileSync('C:/Users/asus1/.gemini/antigravity/brain/737eb81e-624f-4504-b938-d04ece747f9b/nada_fixed_before.png', crops.before.replace(/^data:image\/png;base64,/, ''), 'base64');
  fs.writeFileSync('C:/Users/asus1/.gemini/antigravity/brain/737eb81e-624f-4504-b938-d04ece747f9b/nada_fixed_after.png', crops.after.replace(/^data:image\/png;base64,/, ''), 'base64');
  console.log('Saved fixed Nada crops');
  await browser.close();
}

fixNada().catch(console.error);
