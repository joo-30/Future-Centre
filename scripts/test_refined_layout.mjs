import fs from 'fs';
import { chromium } from 'playwright';

const chromeSystem = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function main() {
  const browser = await chromium.launch({ executablePath: chromeSystem, headless: true });

  const candidates = [
    {
      id: 'square_v1',
      file: 'C:/Users/makah/.gemini/antigravity/brain/e2976ba3-c954-4b1f-8cdb-775aa48d6049/concept_2_vitality_square_1794729202917.jpg',
      dest: 'E:/Future Center/Future-Center/client/public/assets/test_opt_square.jpg',
      url: '/assets/test_opt_square.jpg',
      pos: 'center center'
    },
    {
      id: 'portrait_v2',
      file: 'C:/Users/makah/.gemini/antigravity/brain/e2976ba3-c954-4b1f-8cdb-775aa48d6049/concept_2_vitality_portrait_v2_1794729220904.jpg',
      dest: 'E:/Future Center/Future-Center/client/public/assets/test_opt_portrait_v2.jpg',
      url: '/assets/test_opt_portrait_v2.jpg',
      pos: 'center bottom'
    },
    {
      id: 'portrait_v1',
      file: 'C:/Users/makah/.gemini/antigravity/brain/e2976ba3-c954-4b1f-8cdb-775aa48d6049/concept_2_vitality_portrait_1794729182734.jpg',
      dest: 'E:/Future Center/Future-Center/client/public/assets/test_opt_portrait_v1.jpg',
      url: '/assets/test_opt_portrait_v1.jpg',
      pos: 'center 80%'
    }
  ];

  for (const c of candidates) {
    fs.copyFileSync(c.file, c.dest);
  }

  const authPagePath = 'E:/Future Center/Future-Center/client/src/features/auth/AuthPage.tsx';
  const originalAuth = fs.readFileSync(authPagePath, 'utf8');

  for (const c of candidates) {
    const updated = originalAuth.replace(/src="\/assets\/[^"]+"/g, `src="${c.url}"`);
    fs.writeFileSync(authPagePath, updated, 'utf8');

    await new Promise(r => setTimeout(r, 1200));

    // Test on 1366x768 (Laptop)
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.goto('http://127.0.0.1:5176/login', { waitUntil: 'networkidle' });

    // Inject refined layout: form gets max 460px, visual gets remaining ~906px
    await page.addStyleTag({
      content: `
        .access-page {
          grid-template-columns: minmax(400px, 460px) 1fr !important;
        }
        .access-visual .showcase-img {
          object-position: ${c.pos} !important;
        }
      `
    });
    await page.waitForTimeout(500);

    const shotPath = `C:/Users/makah/.gemini/antigravity/brain/e2976ba3-c954-4b1f-8cdb-775aa48d6049/refined_${c.id}_laptop1366.png`;
    await page.screenshot({ path: shotPath });
    console.log(`Saved screenshot: ${shotPath}`);
    await page.close();
  }

  await browser.close();
  console.log('Done testing all refined options!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
