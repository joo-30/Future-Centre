import fs from 'fs';
import { chromium } from 'playwright';

const chromeSystem = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function testPositions() {
  const browser = await chromium.launch({ executablePath: chromeSystem, headless: true });

  const positions = ['center bottom', 'center 90%', 'center 80%', 'center 70%'];

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
    await page.waitForTimeout(400);

    const safeName = pos.replace(/\s+/g, '_').replace(/%/g, 'pct');
    const shotPath = `C:/Users/makah/.gemini/antigravity/brain/e2976ba3-c954-4b1f-8cdb-775aa48d6049/test_pos_square_${safeName}.png`;
    await page.screenshot({ path: shotPath });
    console.log(`Saved: ${safeName}`);
    await page.close();
  }

  // Also test with portrait version
  const authPagePath = 'E:/Future Center/Future-Center/client/src/features/auth/AuthPage.tsx';
  let authContent = fs.readFileSync(authPagePath, 'utf8');
  authContent = authContent.replace(/src="\/assets\/[^"]+"/g, 'src="/assets/concept_2_vitality_centered_portrait.jpg"');
  fs.writeFileSync(authPagePath, authContent, 'utf8');
  await new Promise(r => setTimeout(r, 1000));

  for (const pos of ['center bottom', 'center 90%', 'center 85%']) {
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
    await page.waitForTimeout(400);

    const safeName = pos.replace(/\s+/g, '_').replace(/%/g, 'pct');
    const shotPath = `C:/Users/makah/.gemini/antigravity/brain/e2976ba3-c954-4b1f-8cdb-775aa48d6049/test_pos_portrait_${safeName}.png`;
    await page.screenshot({ path: shotPath });
    console.log(`Saved portrait: ${safeName}`);
    await page.close();
  }

  await browser.close();
}

testPositions().catch(console.error);
