import { chromium } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const chromeSystem = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function generateAll() {
  const browser = await chromium.launch({
    executablePath: chromeSystem,
    headless: true,
  });

  const page = await browser.newPage();

  // -------------------------------------------------------------
  // 1. Generate Nada Cover with "مدام ندى 32 سنة"
  // -------------------------------------------------------------
  await page.setViewportSize({ width: 800, height: 500 });

  const htmlNada = `<!DOCTYPE html>
  <html dir="rtl" lang="ar">
  <head>
    <meta charset="utf-8">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap" rel="stylesheet">
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body {
        width: 800px;
        height: 500px;
        font-family: 'Cairo', sans-serif;
        background: linear-gradient(135deg, #022c22 0%, #064e3b 50%, #043629 100%);
        color: #ffffff;
        padding: 36px 42px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        position: relative;
        overflow: hidden;
      }
      body::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: 
          radial-gradient(circle at 85% 15%, rgba(245, 158, 11, 0.15) 0%, transparent 40%),
          radial-gradient(circle at 15% 85%, rgba(16, 185, 129, 0.18) 0%, transparent 45%);
        pointer-events: none;
      }
      .frame {
        position: absolute;
        inset: 16px;
        border: 1.5px solid rgba(245, 158, 11, 0.35);
        border-radius: 20px;
        pointer-events: none;
      }
      .header-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        position: relative;
        z-index: 2;
      }
      .brand-badge {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .clinic-monogram {
        width: 44px;
        height: 44px;
        border-radius: 12px;
        background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
        color: #064e3b;
        font-weight: 900;
        font-size: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 14px rgba(245, 158, 11, 0.35);
      }
      .clinic-text h2 {
        font-size: 17px;
        font-weight: 800;
        color: #ffffff;
      }
      .clinic-text p {
        font-size: 12px;
        color: #a7f3d0;
        font-weight: 600;
      }
      .code-pill {
        padding: 6px 14px;
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.15);
        border-radius: 30px;
        font-size: 13px;
        font-weight: 700;
        color: #fde68a;
        font-family: monospace;
      }
      .showcase-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 30px;
        position: relative;
        z-index: 2;
      }
      .patient-info {
        flex: 1;
      }
      .tag-pill {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 4px 12px;
        background: rgba(16, 185, 129, 0.2);
        border: 1px solid rgba(16, 185, 129, 0.4);
        color: #6ee7b7;
        border-radius: 20px;
        font-size: 12.5px;
        font-weight: 700;
        margin-bottom: 12px;
      }
      .patient-title {
        font-size: 34px;
        font-weight: 900;
        line-height: 1.25;
        margin-bottom: 6px;
        color: #ffffff;
        text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
      }
      .program-sub {
        font-size: 14.5px;
        color: #cbd5e1;
        font-weight: 600;
        margin-bottom: 14px;
      }
      .condition-box {
        background: rgba(2, 44, 34, 0.6);
        border: 1px solid rgba(16, 185, 129, 0.3);
        border-radius: 12px;
        padding: 10px 14px;
        font-size: 13px;
        color: #a7f3d0;
        line-height: 1.5;
      }
      .metric-card {
        background: rgba(2, 44, 34, 0.85);
        border: 1.5px solid rgba(245, 158, 11, 0.4);
        border-radius: 16px;
        padding: 18px 24px;
        text-align: center;
        min-width: 240px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.25);
      }
      .metric-badge-top {
        font-size: 12px;
        font-weight: 700;
        color: #f59e0b;
        text-transform: uppercase;
        margin-bottom: 6px;
      }
      .metric-loss {
        font-size: 44px;
        font-weight: 900;
        color: #34d399;
        line-height: 1;
        margin-bottom: 8px;
        text-shadow: 0 2px 10px rgba(52, 211, 153, 0.3);
      }
      .metric-flow {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
        padding-top: 8px;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
      }
      .flow-col {
        display: flex;
        flex-direction: column;
      }
      .flow-col span {
        font-size: 11px;
        color: #94a3b8;
        font-weight: 600;
      }
      .flow-col strong {
        font-size: 16px;
        color: #ffffff;
        font-weight: 800;
      }
      .flow-arrow {
        color: #f59e0b;
        font-size: 18px;
        font-weight: 900;
      }
      .footer-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-top: 14px;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        position: relative;
        z-index: 2;
      }
      .verified-stamp {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 12px;
        color: #a7f3d0;
        font-weight: 700;
      }
      .verified-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #10b981;
      }
      .cta-hint {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
        font-weight: 800;
        color: #fde68a;
        background: rgba(245, 158, 11, 0.15);
        padding: 6px 14px;
        border-radius: 20px;
        border: 1px solid rgba(245, 158, 11, 0.3);
      }
    </style>
  </head>
  <body>
    <div class="frame"></div>
    <div class="header-row">
      <div class="brand-badge">
        <div class="clinic-monogram">FC</div>
        <div class="clinic-text">
          <h2>مركز المستقبل للتغذية العلاجية</h2>
          <p>د. رنا ياسر الشوري • أخصائية التغذية وتنسيق القوام</p>
        </div>
      </div>
      <div class="code-pill">#FC-T107</div>
    </div>

    <div class="showcase-row">
      <div class="patient-info">
        <span class="tag-pill">✓ دراسة حالة تحول كبرى • ٥ أشهر</span>
        <h1 class="patient-title">مدام ندى 32 سنة</h1>
        <p class="program-sub">كورس التغذية العلاجية وتنظيم الأيض</p>
        <div class="condition-box">
          علاج خمول الغدة الدرقية وارتجاع المريء ونقص الفيتامينات
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-badge-top">إجمالي نزول الوزن</div>
        <div class="metric-loss">-27 كجم</div>
        <div class="metric-flow">
          <div class="flow-col">
            <span>قبل البرنامج</span>
            <strong>107 كجم</strong>
          </div>
          <span class="flow-arrow">➔</span>
          <div class="flow-col">
            <span>بعد البرنامج</span>
            <strong style="color: #6ee7b7">80 كجم</strong>
          </div>
        </div>
      </div>
    </div>

    <div class="footer-row">
      <div class="verified-stamp">
        <span class="verified-dot"></span>
        <span>حالة سريرية مثبتة بملف طبي وفحص InBody دوري بالمركز</span>
      </div>
      <div class="cta-hint">
        <span>انقر لمعاينة التقرير وصور التحول</span>
        <span>←</span>
      </div>
    </div>
  </body>
  </html>`;

  await page.setContent(htmlNada);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(500);

  const nadaCoverPath = path.resolve(__dirname, '../client/public/stories/case_cover_nada.png');
  const nada27CoverPath = path.resolve(__dirname, '../client/public/stories/case_cover_27kg.png');
  await page.screenshot({ path: nadaCoverPath });
  await page.screenshot({ path: nada27CoverPath });
  console.log('Saved Nada cover:', nadaCoverPath);

  // -------------------------------------------------------------
  // 2. Generate Safia Photo Card Cover (800x500)
  // Photo-first with "الوزن السابق 92" & "وأصبح 77" and no head cut-off!
  // -------------------------------------------------------------
  const beforeImg = path.resolve(__dirname, '../client/public/stories/safeya_crop_before.jpg').replace(/\\/g, '/');
  const afterImg = path.resolve(__dirname, '../client/public/stories/safeya_crop_after.jpg').replace(/\\/g, '/');

  const htmlSafiaCover = `<!DOCTYPE html>
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
        height: 500px;
        font-family: 'Cairo', sans-serif;
        background: #022c22;
        color: #ffffff;
        position: relative;
        overflow: hidden;
        display: flex;
        flex-direction: column;
      }

      .photos-wrapper {
        flex: 1;
        display: grid;
        grid-template-columns: 1fr 1fr;
        position: relative;
        overflow: hidden;
      }

      .side {
        position: relative;
        overflow: hidden;
        display: flex;
        align-items: flex-start;
        justify-content: center;
        background: #000000;
      }

      .side-before {
        border-left: 2.5px solid #f59e0b;
      }

      /* Safia images: positioned from top with 10px breathing room so head is fully visible */
      .side-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: center 10%;
      }

      /* Simple, elegant badges as requested */
      .simple-badge {
        position: absolute;
        top: 20px;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 8px 18px;
        border-radius: 30px;
        font-size: 15px;
        font-weight: 900;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6);
        z-index: 10;
        border: 2px solid;
      }

      .simple-badge.is-before {
        right: 20px;
        background: rgba(15, 23, 42, 0.88);
        border-color: #ef4444;
        color: #fee2e2;
      }

      .simple-badge.is-after {
        left: 20px;
        background: rgba(6, 78, 59, 0.9);
        border-color: #10b981;
        color: #d1fae5;
      }

      .bottom-strip {
        height: 48px;
        background: linear-gradient(90deg, #022c22 0%, #064e3b 50%, #022c22 100%);
        border-top: 1.5px solid rgba(245, 158, 11, 0.4);
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 24px;
        z-index: 10;
      }

      .strip-title {
        font-size: 13.5px;
        font-weight: 800;
        color: #ffffff;
      }

      .strip-loss {
        font-size: 14px;
        font-weight: 900;
        color: #fde68a;
        background: rgba(245, 158, 11, 0.2);
        padding: 4px 14px;
        border-radius: 20px;
        border: 1px solid rgba(245, 158, 11, 0.4);
      }
    </style>
  </head>
  <body>
    <div class="photos-wrapper">
      <!-- Right (Before in RTL) -->
      <div class="side side-before">
        <img class="side-img" src="file:///${beforeImg}" />
        <div class="simple-badge is-before">
          <span>الوزن السابق 92</span>
        </div>
      </div>

      <!-- Left (After in RTL) -->
      <div class="side">
        <img class="side-img" src="file:///${afterImg}" />
        <div class="simple-badge is-after">
          <span>وأصبح 77</span>
        </div>
      </div>
    </div>

    <div class="bottom-strip">
      <span class="strip-title">مدام صفية • توثيق نتائج التحول بالعيادة</span>
      <span class="strip-loss">خسارة 15 كجم (من 92 إلى 77)</span>
    </div>
  </body>
  </html>`;

  await page.setContent(htmlSafiaCover);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(500);

  const safiaCoverPath = path.resolve(__dirname, '../client/public/stories/case_cover_safia.png');
  await page.screenshot({ path: safiaCoverPath });
  console.log('Saved Safia Photo Cover:', safiaCoverPath);

  // -------------------------------------------------------------
  // 3. Generate Safia Modal Study Image (720x760)
  // -------------------------------------------------------------
  await page.setViewportSize({ width: 720, height: 760 });

  const htmlSafiaStudy = `<!DOCTYPE html>
  <html dir="rtl" lang="ar">
  <head>
    <meta charset="utf-8">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@700;800;900&display=swap" rel="stylesheet">
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
        background: #03362a;
        padding: 14px 22px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 2px solid #f59e0b;
        z-index: 10;
      }
      .brand-title {
        font-size: 16px;
        font-weight: 800;
        color: #ffffff;
      }
      .brand-sub {
        font-size: 12px;
        color: #a7f3d0;
        font-weight: 600;
      }
      .loss-pill {
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        color: #ffffff;
        font-weight: 900;
        font-size: 14px;
        padding: 6px 18px;
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
        align-items: flex-start;
        justify-content: center;
      }
      .pane-before {
        border-left: 2px solid #f59e0b;
      }
      .pane-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: center 10%;
      }
      .weight-tag {
        position: absolute;
        top: 24px;
        display: inline-flex;
        align-items: center;
        padding: 10px 22px;
        border-radius: 30px;
        font-size: 16px;
        font-weight: 900;
        backdrop-filter: blur(8px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
        z-index: 5;
        border: 2px solid;
      }
      .weight-tag.is-before {
        right: 20px;
        background: rgba(15, 23, 42, 0.88);
        border-color: #ef4444;
        color: #fee2e2;
      }
      .weight-tag.is-after {
        left: 20px;
        background: rgba(6, 78, 59, 0.9);
        border-color: #10b981;
        color: #d1fae5;
      }
      .bottom-bar {
        background: #042f26;
        padding: 14px 22px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        font-size: 13px;
        color: #cbd5e1;
        font-weight: 600;
      }
      .verified-badge {
        display: inline-flex;
        align-items: center;
        gap: 8px;
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
      <div class="pane pane-before">
        <img class="pane-img" src="file:///${beforeImg}" />
        <div class="weight-tag is-before">
          <span>الوزن السابق 92</span>
        </div>
      </div>

      <div class="pane">
        <img class="pane-img" src="file:///${afterImg}" />
        <div class="weight-tag is-after">
          <span>وأصبح 77</span>
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

  await page.setContent(htmlSafiaStudy);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(500);

  const safiaStudyPath = path.resolve(__dirname, '../client/public/stories/transformation_safia.jpg');
  await page.screenshot({ path: safiaStudyPath, quality: 95, type: 'jpeg' });
  console.log('Saved Safia Study Image:', safiaStudyPath);

  await browser.close();
}

generateAll().catch((err) => {
  console.error(err);
  process.exit(1);
});
