import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const chromeSystem = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const rawImagePath = 'C:/Users/asus1/.gemini/antigravity/brain/737eb81e-624f-4504-b938-d04ece747f9b/.user_uploaded/media_1794314887780_93c853a0.jpg';

async function generateAllSafiaAssets() {
  const browser = await chromium.launch({
    executablePath: chromeSystem,
    headless: true,
  });

  const page = await browser.newPage();
  const rawBase64 = fs.readFileSync(rawImagePath).toString('base64');

  await page.setContent(`<!DOCTYPE html>
  <html>
  <body>
    <canvas id="c"></canvas>
    <script>
      const img = new Image();
      img.onload = () => {
        const c = document.getElementById('c');
        c.width = img.width;
        c.height = img.height;
        const ctx = c.getContext('2d');
        ctx.drawImage(img, 0, 0);

        // Before crop: y=80..525, x=138..310 (w=172, h=445)
        const cBefore = document.createElement('canvas');
        cBefore.width = 172;
        cBefore.height = 445;
        const ctxB = cBefore.getContext('2d');
        ctxB.drawImage(c, 138, 80, 172, 445, 0, 0, 172, 445);

        // After crop: y=70..525, x=312..535 (w=223, h=455)
        const cAfter = document.createElement('canvas');
        cAfter.width = 223;
        cAfter.height = 455;
        const ctxA = cAfter.getContext('2d');
        ctxA.drawImage(c, 312, 70, 223, 455, 0, 0, 223, 455);

        window.beforeData = cBefore.toDataURL('image/png');
        window.afterData = cAfter.toDataURL('image/png');
      };
      img.src = 'data:image/jpeg;base64,${rawBase64}';
    </script>
  </body>
  </html>`);

  await page.waitForFunction(() => window.beforeData !== undefined && window.afterData !== undefined);
  const { beforeData, afterData } = await page.evaluate(() => ({
    beforeData: window.beforeData,
    afterData: window.afterData,
  }));

  // =========================================================================
  // 1. Generate Card Cover: case_cover_safia.png (800 x 480)
  // =========================================================================
  await page.setViewportSize({ width: 800, height: 480 });

  const htmlCover = `<!DOCTYPE html>
  <html dir="rtl" lang="ar">
  <head>
    <meta charset="utf-8">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@700;800;900&display=swap" rel="stylesheet">
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body {
        width: 800px;
        height: 480px;
        font-family: 'Cairo', sans-serif;
        background: #022c22;
        color: #ffffff;
        position: relative;
        overflow: hidden;
        display: flex;
        flex-direction: column;
      }

      .split-stage {
        flex: 1;
        display: grid;
        grid-template-columns: 1fr 1fr;
        position: relative;
        overflow: hidden;
        background: #000000;
      }

      .pane {
        position: relative;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .pane-before {
        border-left: 2px solid #f59e0b;
        background: #0b110f;
      }

      .pane-after {
        background: #050d0a;
      }

      .pane-img {
        height: 100%;
        max-width: 100%;
        object-fit: contain;
        display: block;
        filter: contrast(1.04) brightness(1.02);
      }

      .simple-badge {
        position: absolute;
        top: 20px;
        z-index: 10;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 8px 20px;
        border-radius: 30px;
        font-size: 16px;
        font-weight: 900;
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.7);
        backdrop-filter: blur(10px);
      }

      .badge-before {
        right: 20px;
        background: rgba(15, 23, 42, 0.9);
        border: 2px solid #ef4444;
        color: #ffffff;
      }

      .badge-before .dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #ef4444;
        box-shadow: 0 0 8px #ef4444;
      }

      .badge-after {
        left: 20px;
        background: rgba(6, 78, 59, 0.94);
        border: 2px solid #10b981;
        color: #ffffff;
      }

      .badge-after .dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #34d399;
        box-shadow: 0 0 8px #34d399;
      }

      .center-arrow {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 20;
        width: 42px;
        height: 42px;
        border-radius: 50%;
        background: #064e3b;
        border: 2px solid #f59e0b;
        color: #f59e0b;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        font-weight: 900;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.8);
      }

      .bottom-bar {
        height: 52px;
        background: linear-gradient(90deg, #022c22 0%, #064e3b 50%, #022c22 100%);
        border-top: 1.5px solid rgba(245, 158, 11, 0.35);
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 24px;
        z-index: 10;
      }

      .patient-name-title {
        font-size: 15px;
        font-weight: 800;
        color: #ffffff;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .loss-pill-bottom {
        font-size: 14px;
        font-weight: 900;
        color: #fde68a;
        background: rgba(245, 158, 11, 0.2);
        border: 1px solid rgba(245, 158, 11, 0.45);
        padding: 4px 16px;
        border-radius: 20px;
      }
    </style>
  </head>
  <body>
    <div class="split-stage">
      <div class="pane pane-before">
        <img class="pane-img" src="${beforeData}" />
        <div class="simple-badge badge-before">
          <span class="dot"></span>
          <span>الوزن السابق 92</span>
        </div>
      </div>

      <div class="center-arrow">➔</div>

      <div class="pane pane-after">
        <img class="pane-img" src="${afterData}" />
        <div class="simple-badge badge-after">
          <span class="dot"></span>
          <span>وأصبح 77</span>
        </div>
      </div>
    </div>

    <div class="bottom-bar">
      <div class="patient-name-title">
        <span>مدام صفية</span>
        <span style="color: #f59e0b">•</span>
        <span style="color: #a7f3d0; font-size: 13.5px">توثيق نتائج التحول بالعيادة</span>
      </div>
      <div class="loss-pill-bottom">
        <span>خسارة 15 كجم (نزول من 92 إلى 77)</span>
      </div>
    </div>
  </body>
  </html>`;

  await page.setContent(htmlCover);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);

  const coverPublic = path.resolve(__dirname, '../client/public/stories/case_cover_safia.png');
  const coverDist = path.resolve(__dirname, '../client/dist/stories/case_cover_safia.png');
  await page.screenshot({ path: coverPublic });
  if (fs.existsSync(path.dirname(coverDist))) {
    fs.copyFileSync(coverPublic, coverDist);
  }
  console.log('Saved Safia Cover:', coverPublic);

  // =========================================================================
  // 2. Generate Modal Study Image: transformation_safia.jpg (800 x 780)
  // =========================================================================
  await page.setViewportSize({ width: 800, height: 780 });

  const htmlStudy = `<!DOCTYPE html>
  <html dir="rtl" lang="ar">
  <head>
    <meta charset="utf-8">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@700;800;900&display=swap" rel="stylesheet">
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body {
        width: 800px;
        height: 780px;
        font-family: 'Cairo', sans-serif;
        background: #022c22;
        color: #ffffff;
        position: relative;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }

      .study-header {
        background: #03362a;
        padding: 16px 24px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 2px solid #f59e0b;
        z-index: 10;
      }

      .sh-clinic-info h2 {
        font-size: 16px;
        font-weight: 900;
        color: #ffffff;
      }

      .sh-clinic-info p {
        font-size: 12px;
        color: #a7f3d0;
        font-weight: 700;
        margin-top: 2px;
      }

      .sh-loss-pill {
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        color: #ffffff;
        font-weight: 900;
        font-size: 15px;
        padding: 7px 20px;
        border-radius: 24px;
        box-shadow: 0 4px 14px rgba(16, 185, 129, 0.35);
      }

      .split-photos-main {
        flex: 1;
        display: grid;
        grid-template-columns: 1fr 1fr;
        position: relative;
        background: #000000;
        overflow: hidden;
      }

      .pane-study {
        position: relative;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #080f0c;
      }

      .pane-study-before {
        border-left: 2px solid #f59e0b;
        background: #0b110f;
      }

      .pane-study-after {
        background: #050d0a;
      }

      .study-img {
        height: 100%;
        max-width: 100%;
        object-fit: contain;
        display: block;
        filter: contrast(1.04) brightness(1.02);
      }

      .study-badge {
        position: absolute;
        top: 24px;
        z-index: 10;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 9px 22px;
        border-radius: 30px;
        font-size: 17px;
        font-weight: 900;
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.7);
        backdrop-filter: blur(10px);
      }

      .sb-before {
        right: 24px;
        background: rgba(15, 23, 42, 0.9);
        border: 2px solid #ef4444;
        color: #fee2e2;
      }

      .sb-after {
        left: 24px;
        background: rgba(6, 78, 59, 0.94);
        border: 2px solid #10b981;
        color: #d1fae5;
      }

      .center-circle-study {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 20;
        width: 46px;
        height: 46px;
        border-radius: 50%;
        background: #064e3b;
        border: 2.5px solid #f59e0b;
        color: #f59e0b;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        font-weight: 900;
        box-shadow: 0 4px 18px rgba(0, 0, 0, 0.85);
      }

      .study-footer {
        background: #03362a;
        padding: 14px 24px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-top: 1.5px solid rgba(245, 158, 11, 0.35);
        z-index: 10;
      }

      .sf-title {
        font-size: 13.5px;
        color: #cbd5e1;
        font-weight: 700;
      }

      .sf-badge {
        font-size: 13.5px;
        font-weight: 800;
        color: #a7f3d0;
        display: flex;
        align-items: center;
        gap: 6px;
      }
    </style>
  </head>
  <body>
    <div class="study-header">
      <div class="sh-clinic-info">
        <h2>مركز المستقبل للتغذية العلاجية والتخسيس</h2>
        <p>د. رنا ياسر الشوري • توثيق نتائج التحول السريري (Before & After)</p>
      </div>
      <div class="sh-loss-pill">خسارة 15 كجم</div>
    </div>

    <div class="split-photos-main">
      <div class="pane-study pane-study-before">
        <img class="study-img" src="${beforeData}" />
        <div class="study-badge sb-before">
          <span>الوزن السابق 92</span>
        </div>
      </div>

      <div class="center-circle-study">➔</div>

      <div class="pane-study pane-study-after">
        <img class="study-img" src="${afterData}" />
        <div class="study-badge sb-after">
          <span>وأصبح 77</span>
        </div>
      </div>
    </div>

    <div class="study-footer">
      <span class="sf-title">حالة سريرية موثقة ومعتمدة بفحص قياسات العيادة</span>
      <span class="sf-badge">الفرق: نزول 15 كجم مع نحت محيط الخصر والقوام</span>
    </div>
  </body>
  </html>`;

  await page.setContent(htmlStudy);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);

  const studyPublic = path.resolve(__dirname, '../client/public/stories/transformation_safia.jpg');
  const studyDist = path.resolve(__dirname, '../client/dist/stories/transformation_safia.jpg');
  await page.screenshot({ path: studyPublic, type: 'jpeg', quality: 94 });
  if (fs.existsSync(path.dirname(studyDist))) {
    fs.copyFileSync(studyPublic, studyDist);
  }
  console.log('Saved Safia Study:', studyPublic);

  await browser.close();
}

generateAllSafiaAssets().catch(console.error);
