import fs from 'fs';
import { chromium } from 'playwright';

const chromeSystem = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function main() {
  const browser = await chromium.launch({ executablePath: chromeSystem, headless: true });

  const testImages = [
    {
      id: 'square_1_1',
      file: 'C:/Users/makah/.gemini/antigravity/brain/e2976ba3-c954-4b1f-8cdb-775aa48d6049/concept_2_vitality_square_1794729202917.jpg',
      dest: 'E:/Future Center/Future-Center/client/public/assets/concept_2_vitality_square.jpg',
      url: '/assets/concept_2_vitality_square.jpg',
      pos: 'center center'
    },
    {
      id: 'portrait_3_4',
      file: 'C:/Users/makah/.gemini/antigravity/brain/e2976ba3-c954-4b1f-8cdb-775aa48d6049/concept_2_vitality_portrait_1794729182734.jpg',
      dest: 'E:/Future Center/Future-Center/client/public/assets/concept_2_vitality_portrait.jpg',
      url: '/assets/concept_2_vitality_portrait.jpg',
      pos: 'center 75%'
    }
  ];

  for (const item of testImages) {
    fs.copyFileSync(item.file, item.dest);
  }

  const authPagePath = 'E:/Future Center/Future-Center/client/src/features/auth/AuthPage.tsx';
  const originalAuth = fs.readFileSync(authPagePath, 'utf8');

  for (const item of testImages) {
    const updatedAuth = originalAuth
      .replace(/src="\/assets\/[^"]+"/g, `src="${item.url}"`);
    fs.writeFileSync(authPagePath, updatedAuth, 'utf8');

    // Wait for Vite HMR
    await new Promise(r => setTimeout(r, 1200));

    // Test across viewports
    const viewports = [
      { name: 'laptop_1366', w: 1366, h: 768 },
      { name: 'laptop_1280', w: 1280, h: 800 },
      { name: 'desktop_1440', w: 1440, h: 900 },
      { name: 'mobile_375', w: 375, h: 812 }
    ];

    for (const vp of viewports) {
      const page = await browser.newPage();
      await page.setViewportSize({ width: vp.w, height: vp.h });
      await page.goto('http://127.0.0.1:5176/login', { waitUntil: 'networkidle' });

      // Apply object-position
      await page.addStyleTag({
        content: `
          .access-visual .showcase-img {
            object-position: ${item.pos} !important;
          }
        `
      });
      await page.waitForTimeout(500);

      const shotName = `verify_${item.id}_${vp.name}.png`;
      const shotPath = `C:/Users/makah/.gemini/antigravity/brain/e2976ba3-c954-4b1f-8cdb-775aa48d6049/${shotName}`;
      await page.screenshot({ path: shotPath });
      console.log(`Generated: ${shotName}`);
      await page.close();
    }
  }

  await browser.close();
  console.log('Testing finished!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
