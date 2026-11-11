import fs from 'node:fs';
import path from 'node:path';
import { chromium } from '@playwright/test';

const chromeSystem = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function inspectSameh() {
  const browser = await chromium.launch({
    executablePath: chromeSystem,
    headless: true,
  });

  const page = await browser.newPage();
  const samehB64 = fs.readFileSync('C:/Users/asus1/.gemini/antigravity/brain/737eb81e-624f-4504-b938-d04ece747f9b/view_trans_sameh.jpg').toString('base64');

  await page.setContent(`<!DOCTYPE html><html><body><img id="s" src="data:image/jpeg;base64,${samehB64}"><canvas id="c"></canvas></body></html>`);
  const dims = await page.evaluate(() => {
    const img = document.getElementById('s');
    return { w: img.naturalWidth, h: img.naturalHeight };
  });
  console.log('Original Sameh dimensions:', dims);
  await browser.close();
}

inspectSameh().catch(console.error);
