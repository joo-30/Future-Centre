import fs from 'fs';
import { chromium } from 'playwright';

const chromeSystem = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function main() {
  const browser = await chromium.launch({ executablePath: chromeSystem, headless: true });

  const testCases = [
    {
      id: 'centered_portrait',
      src: '/assets/concept_2_vitality_centered_portrait.jpg',
      pos: 'center 75%'
    },
    {
      id: 'centered_square',
      src: '/assets/concept_2_vitality_centered_square.jpg',
      pos: 'center 60%'
    }
  ];

  const authPagePath = 'E:/Future Center/Future-Center/client/src/features/auth/AuthPage.tsx';
  const originalAuth = fs.readFileSync(authPagePath, 'utf8');

  for (const tc of testCases) {
    const updated = originalAuth.replace(/src="\/assets\/[^"]+"/g, `src="${tc.src}"`);
    fs.writeFileSync(authPagePath, updated, 'utf8');

    await new Promise(r => setTimeout(r, 1200));

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

      await page.addStyleTag({
        content: `
          .access-page {
            grid-template-columns: minmax(380px, 480px) 1fr !important;
          }
          .access-visual .showcase-img {
            object-position: ${tc.pos} !important;
          }
          .mobile-reception-img {
            object-position: ${tc.pos} !important;
          }
        `
      });
      await page.waitForTimeout(500);

      const shotName = `final_verify_${tc.id}_${vp.name}.png`;
      const shotPath = `C:/Users/makah/.gemini/antigravity/brain/e2976ba3-c954-4b1f-8cdb-775aa48d6049/${shotName}`;
      await page.screenshot({ path: shotPath });
      console.log(`Generated: ${shotName}`);
      await page.close();
    }
  }

  await browser.close();
  console.log('All final verifications generated!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
