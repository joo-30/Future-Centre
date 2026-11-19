import fs from 'fs';
import { chromium } from 'playwright';

const chromeSystem = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function main() {
  const browser = await chromium.launch({ executablePath: chromeSystem, headless: true });

  const candidates = [
    {
      id: 'centered_square',
      file: 'C:/Users/makah/.gemini/antigravity/brain/e2976ba3-c954-4b1f-8cdb-775aa48d6049/concept_2_vitality_centered_square_1794729516585.jpg',
      dest: 'E:/Future Center/Future-Center/client/public/assets/perfect_square.jpg',
      src: '/assets/perfect_square.jpg',
      pos: 'center bottom'
    },
    {
      id: 'centered_portrait',
      file: 'C:/Users/makah/.gemini/antigravity/brain/e2976ba3-c954-4b1f-8cdb-775aa48d6049/concept_2_vitality_centered_portrait_1794729536846.jpg',
      dest: 'E:/Future Center/Future-Center/client/public/assets/perfect_portrait.jpg',
      src: '/assets/perfect_portrait.jpg',
      pos: 'center bottom'
    }
  ];

  for (const c of candidates) {
    fs.copyFileSync(c.file, c.dest);
  }

  const authPath = 'E:/Future Center/Future-Center/client/src/features/auth/AuthPage.tsx';
  const originalAuth = fs.readFileSync(authPath, 'utf8');

  for (const c of candidates) {
    const updated = originalAuth.replace(/src="\/assets\/[^"]+"/g, `src="${c.src}"`);
    fs.writeFileSync(authPath, updated, 'utf8');

    await new Promise(r => setTimeout(r, 1200));

    const page = await browser.newPage();
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.goto('http://127.0.0.1:5176/login', { waitUntil: 'networkidle' });

    await page.addStyleTag({
      content: `
        @media (min-width: 921px) {
          .access-page {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            min-height: 100dvh !important;
            background: #f8faf6 !important;
          }

          .access-form-area {
            min-height: 100dvh !important;
            padding: 40px 48px !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: center !important;
            align-items: center !important;
            max-width: 580px !important;
            margin: 0 auto !important;
            width: 100% !important;
            box-sizing: border-box !important;
          }

          .access-top {
            width: 100% !important;
            max-width: 480px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: space-between !important;
            gap: 12px !important;
            margin-bottom: 24px !important;
          }

          .auth-card-elevated {
            width: 100% !important;
            max-width: 480px !important;
            margin: 0 auto !important;
          }

          .access-visual {
            position: sticky !important;
            top: 0 !important;
            height: 100vh !important;
            max-height: 100vh !important;
            width: 100% !important;
            overflow: hidden !important;
            background: #041f17 !important;
          }

          .access-visual .showcase-img {
            position: absolute !important;
            inset: 0 !important;
            width: 100% !important;
            height: 100% !important;
            object-fit: cover !important;
            object-position: ${c.pos} !important;
          }
        }
      `
    });
    await page.waitForTimeout(500);

    const shotPath = `C:/Users/makah/.gemini/antigravity/brain/e2976ba3-c954-4b1f-8cdb-775aa48d6049/perfect_5050_${c.id}_1366.png`;
    await page.screenshot({ path: shotPath });
    console.log(`Saved: perfect_5050_${c.id}_1366.png`);
    await page.close();
  }

  await browser.close();
  console.log('All candidates tested!');
}

main().catch(console.error);
