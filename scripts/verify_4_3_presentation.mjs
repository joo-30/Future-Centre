import { chromium } from 'playwright';

const chromeSystem = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function main() {
  const browser = await chromium.launch({ executablePath: chromeSystem, headless: true });

  const positions = ['center 65%', 'center 75%', 'center bottom', 'center center'];

  for (const pos of positions) {
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.goto('http://127.0.0.1:5176/login', { waitUntil: 'networkidle' });

    await page.addStyleTag({
      content: `
        .access-page {
          grid-template-columns: minmax(380px, 460px) 1fr !important;
        }
        .access-visual .showcase-img {
          object-position: ${pos} !important;
        }
      `
    });
    await page.waitForTimeout(500);

    const safe = pos.replace(/\s+/g, '_').replace(/%/g, 'pct');
    const path = `C:/Users/makah/.gemini/antigravity/brain/e2976ba3-c954-4b1f-8cdb-775aa48d6049/test_4_3_laptop1366_${safe}.png`;
    await page.screenshot({ path });
    console.log(`Saved: ${safe}`);
    await page.close();
  }

  await browser.close();
  console.log('4:3 test finished!');
}

main().catch(console.error);
