import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
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
  <head>
    <style>body { margin: 0; background: #000; }</style>
  </head>
  <body>
    <img id="raw" src="data:image/jpeg;base64,${rawBase64}" />
  </body>
  </html>`);

  const info = await page.evaluate(() => {
    const img = document.getElementById('raw');
    return {
      width: img.naturalWidth,
      height: img.naturalHeight,
    };
  });

  console.log('Original image size:', info);
  await browser.close();
}

main().catch(console.error);
