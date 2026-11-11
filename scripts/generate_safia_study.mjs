import { chromium } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const chromeSystem = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function generateSafiaStudy() {
  const browser = await chromium.launch({
    executablePath: chromeSystem,
    headless: true,
  });

  const page = await browser.newPage({ viewport: { width: 720, height: 760 } });

  const rawBeforeAfterPath = path.resolve(__dirname, '../client/public/stories/safeya_pure_body.jpg').replace(/\\/g, '/');

  const html = `<!DOCTYPE html>
  <html dir="rtl" lang="ar">
  <head>
    <meta charset="utf-8">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@600;700;800;900&display=swap" rel="stylesheet">
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body {
        width: 720px;
        height: 760px;
        font-family: 'Cairo', sans-serif;
        background: #022c22;
        color: #ffffff;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        position: relative;
        overflow: hidden;
      }

      .top-banner {
        background: linear-gradient(180deg, rgba(2, 44, 34, 0.95) 0%, rgba(2, 44, 34, 0.75) 100%);
        padding: 14px 20px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 1.5px solid rgba(245, 158, 11, 0.4);
        z-index: 10;
      }

      .brand-title {
        font-size: 15px;
        font-weight: 800;
        color: #ffffff;
      }
      .brand-sub {
        font-size: 11.5px;
        color: #a7f3d0;
        font-weight: 600;
      }
      .loss-pill {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        color: #ffffff;
        font-weight: 900;
        font-size: 14px;
        padding: 6px 16px;
        border-radius: 20px;
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
      }

      .split-container {
        flex: 1;
        display: grid;
        grid-template-columns: 1fr 1fr;
        position: relative;
        background: #000000;
        overflow: hidden;
      }

      .pane {
        position: relative;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      /* Before image */
      .pane-before {
        border-left: 2px solid #f59e0b;
      }

      .pane-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      /* Clean subtle badges overlaying the photos */
      .weight-tag {
        position: absolute;
        bottom: 24px;
        display: inline-flex;
        flex-direction: column;
        align-items: center;
        padding: 8px 18px;
        border-radius: 14px;
        backdrop-filter: blur(8px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
        z-index: 5;
        border: 1.5px solid;
      }

      .weight-tag.is-before {
        right: 20px;
        background: rgba(15, 23, 42, 0.85);
        border-color: #f87171;
        color: #ffffff;
      }

      .weight-tag.is-after {
        left: 20px;
        background: rgba(6, 78, 59, 0.88);
        border-color: #34d399;
        color: #ffffff;
      }

      .tag-lbl {
        font-size: 11.5px;
        font-weight: 700;
        opacity: 0.85;
      }

      .tag-val {
        font-size: 22px;
        font-weight: 900;
        line-height: 1.1;
      }
      .weight-tag.is-before .tag-val {
        color: #fca5a5;
      }
      .weight-tag.is-after .tag-val {
        color: #6ee7b7;
      }

      .bottom-bar {
        background: #042f26;
        padding: 12px 20px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        font-size: 12px;
        color: #cbd5e1;
        font-weight: 600;
      }

      .verified-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        color: #a7f3d0;
        font-weight: 700;
      }
      .dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #10b981;
      }
    </style>
  </head>
  <body>
    <div class="top-banner">
      <div>
        <div class="brand-title">مدام صفية • توثيق نتائج التحول السريري</div>
        <div class="brand-sub">مركز المستقبل للتغذية العلاجية والتخسيس • د. رنا ياسر الشوري</div>
      </div>
      <div class="loss-pill">
        <span>خسارة 15 كجم</span>
      </div>
    </div>

    <div class="split-container">
      <!-- Before (Right in RTL) -->
      <div class="pane pane-before">
        <img src="file:///${rawBeforeAfterPath}" style="width: 200%; height: 100%; object-fit: cover; object-position: right;" />
        <div class="weight-tag is-before">
          <span class="tag-lbl">الوزن السابق</span>
          <span class="tag-val">92 كجم</span>
        </div>
      </div>

      <!-- After (Left in RTL) -->
      <div class="pane">
        <img src="file:///${rawBeforeAfterPath}" style="width: 200%; height: 100%; object-fit: cover; object-position: left;" />
        <div class="weight-tag is-after">
          <span class="tag-lbl">الوزن الحالي</span>
          <span class="tag-val">77 كجم</span>
        </div>
      </div>
    </div>

    <div class="bottom-bar">
      <div class="verified-badge">
        <span class="dot"></span>
        <span>حالة سريرية موثقة ومعتمدة بفحص قياسات العيادة</span>
      </div>
      <div style="color: #fde68a; font-weight: 700;">
        الفرق: نزول 15 كجم مع نحت محيط الخصر
      </div>
    </div>
  </body>
  </html>`;

  await page.setContent(html);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(600);

  const targetPath = path.resolve(__dirname, '../client/public/stories/transformation_safia.jpg');
  await page.screenshot({ path: targetPath, quality: 95, type: 'jpeg' });
  console.log('Saved high-res study:', targetPath);

  await browser.close();
}

generateSafiaStudy().catch((err) => {
  console.error(err);
  process.exit(1);
});
