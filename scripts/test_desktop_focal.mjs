import { chromium } from 'playwright';
import path from 'path';

const chromeSystem = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const outDir = 'C:\\Users\\makah\\.gemini\\antigravity\\brain\\e2976ba3-c954-4b1f-8cdb-775aa48d6049';

async function main() {
  const browser = await chromium.launch({ executablePath: chromeSystem, headless: true });

  for (const pos of ['60%', '65%', '70%', '75%']) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto('http://127.0.0.1:5176/login', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);

    // Apply object-position directly in DOM
    await page.evaluate((p) => {
      const img = document.querySelector('.showcase-img');
      if (img) img.style.objectPosition = `${p} center`;
    }, pos);

    await page.waitForTimeout(300);
    const shotPath = path.join(outDir, `test_focal_${pos.replace('%', '')}.png`);
    await page.screenshot({ path: shotPath });
    console.log(`Saved ${shotPath}`);
    await page.close();
  }

  await browser.close();
}

main().catch(console.error);
