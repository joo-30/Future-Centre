import { chromium } from 'playwright';
import path from 'path';

const chromeSystem = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function main() {
  const browser = await chromium.launch({ executablePath: chromeSystem, headless: true });
  const page = await browser.newPage();
  const files = [
    'Future-Centre/client/public/assets/dr-rana.jpg',
    'Future-Centre/client/public/assets/dr-rana-ai.jpg',
    'Future-Centre/client/public/assets/dr-rana-old.jpg',
    'Future-Centre/client/public/stories/clinic_dr_rana.jpg'
  ];
  for (const f of files) {
    const abs = path.resolve(f);
    await page.goto('file:///' + abs.replace(/\\/g, '/'));
    const dim = await page.evaluate(() => {
      const img = document.querySelector('img');
      return img ? { w: img.naturalWidth, h: img.naturalHeight } : null;
    });
    console.log(f, dim);
  }
  await browser.close();
}
main();
