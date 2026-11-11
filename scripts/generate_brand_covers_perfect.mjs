import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const chromeSystem = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const cases = [
  {
    id: 'nada',
    code: '#FC-T107',
    tag: '✓ دراسة حالة تحول كبرى • ٥ أشهر',
    name: 'مدام ندى 32 سنة',
    program: 'كورس التغذية العلاجية وتنظيم الأيض',
    condition: 'علاج خمول الغدة الدرقية وارتجاع المريء ونقص الفيتامينات',
    loss: '-27 كجم',
    before: '107 كجم',
    after: '80 كجم',
    filePublic: path.resolve(__dirname, '../client/public/stories/case_cover_nada.png'),
    file27: path.resolve(__dirname, '../client/public/stories/case_cover_27kg.png'),
    fileDist: path.resolve(__dirname, '../client/dist/stories/case_cover_nada.png'),
    fileDist27: path.resolve(__dirname, '../client/dist/stories/case_cover_27kg.png'),
  },
  {
    id: 'sameh',
    code: '#FC-T098',
    tag: '✓ دراسة حالة إكلينيكية • ٣ أشهر',
    name: 'أستاذ سامح (42 سنة)',
    program: 'برنامج التغذية الإكلينيكية وضبط السكر',
    condition: 'علاج سكر الدم والأعراض واستعادة النشاط الحيوي',
    loss: '-14 كجم',
    before: '98.5 كجم',
    after: '86 كجم',
    filePublic: path.resolve(__dirname, '../client/public/stories/case_cover_sameh.png'),
    fileDist: path.resolve(__dirname, '../client/dist/stories/case_cover_sameh.png'),
  },
  {
    id: 'safia',
    code: '#FC-T092',
    tag: '✓ دراسة حالة تحول كبرى • شهرين',
    name: 'مدام صفية (38 سنة)',
    program: 'تحدي كورس النحت السريع وتنظيم القوام',
    condition: 'نزول 15 كجم ونحت محيط الخصر بدون ترهلات أو حرمان',
    loss: '-15 كجم',
    before: '92 كجم',
    after: '77 كجم',
    filePublic: path.resolve(__dirname, '../client/public/stories/case_cover_safia.png'),
    fileDist: path.resolve(__dirname, '../client/dist/stories/case_cover_safia.png'),
  },
];

async function generateCovers() {
  const browser = await chromium.launch({
    executablePath: chromeSystem,
    headless: true,
  });

  const page = await browser.newPage();
  // Exact 800 x 420 px viewport to match 1.9 : 1 aspect ratio of .tc-cover-wrap!
  await page.setViewportSize({ width: 800, height: 420 });

  for (const c of cases) {
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
          width: 800px;
          height: 420px;
          font-family: 'Cairo', sans-serif;
          background: linear-gradient(135deg, #022c22 0%, #064e3b 50%, #033428 100%);
          color: #ffffff;
          padding: 22px 32px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
          overflow: hidden;
        }

        /* Subtle radial luxury glows */
        body::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: 
            radial-gradient(circle at 85% 15%, rgba(245, 158, 11, 0.16) 0%, transparent 45%),
            radial-gradient(circle at 15% 85%, rgba(16, 185, 129, 0.20) 0%, transparent 50%);
          pointer-events: none;
        }

        .frame {
          position: absolute;
          inset: 12px;
          border: 1.5px solid rgba(245, 158, 11, 0.35);
          border-radius: 16px;
          pointer-events: none;
        }

        /* Top Header Row - Elevated & Compact */
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
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          color: #064e3b;
          font-weight: 900;
          font-size: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(245, 158, 11, 0.35);
        }

        .clinic-text h2 {
          font-size: 16px;
          font-weight: 800;
          color: #ffffff;
          line-height: 1.2;
        }

        .clinic-text p {
          font-size: 11.5px;
          color: #a7f3d0;
          font-weight: 600;
        }

        .code-pill {
          padding: 5px 14px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.18);
          border-radius: 30px;
          font-size: 12.5px;
          font-weight: 700;
          color: #fde68a;
          font-family: monospace;
        }

        /* Middle Showcase Row - Elevated slightly so it is clearly visible */
        .showcase-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 24px;
          position: relative;
          z-index: 2;
          margin-top: -4px;
        }

        .patient-info {
          flex: 1;
        }

        .tag-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 3px 12px;
          background: rgba(16, 185, 129, 0.22);
          border: 1px solid rgba(16, 185, 129, 0.45);
          color: #6ee7b7;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 700;
          margin-bottom: 8px;
        }

        .patient-title {
          font-size: 32px;
          font-weight: 900;
          line-height: 1.2;
          margin-bottom: 4px;
          color: #ffffff;
          letter-spacing: -0.3px;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.35);
        }

        .program-sub {
          font-size: 14px;
          color: #cbd5e1;
          font-weight: 600;
          margin-bottom: 10px;
        }

        .condition-box {
          background: rgba(2, 44, 34, 0.65);
          border: 1px solid rgba(16, 185, 129, 0.35);
          border-radius: 10px;
          padding: 8px 12px;
          font-size: 12.5px;
          color: #a7f3d0;
          line-height: 1.45;
          max-width: 440px;
        }

        /* Metric Card - Clean, Elevated, Prominent */
        .metric-card {
          background: rgba(2, 44, 34, 0.9);
          border: 1.5px solid rgba(245, 158, 11, 0.45);
          border-radius: 14px;
          padding: 14px 22px;
          text-align: center;
          min-width: 230px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
        }

        .metric-badge-top {
          font-size: 11.5px;
          font-weight: 700;
          color: #f59e0b;
          text-transform: uppercase;
          margin-bottom: 4px;
        }

        .metric-loss {
          font-size: 42px;
          font-weight: 900;
          color: #34d399;
          line-height: 1;
          margin-bottom: 6px;
          text-shadow: 0 2px 12px rgba(52, 211, 153, 0.35);
        }

        .metric-flow {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding-top: 6px;
          border-top: 1px solid rgba(255, 255, 255, 0.12);
        }

        .flow-col {
          display: flex;
          flex-direction: column;
        }

        .flow-col span {
          font-size: 10.5px;
          color: #94a3b8;
          font-weight: 600;
        }

        .flow-col strong {
          font-size: 15px;
          color: #ffffff;
          font-weight: 800;
        }

        .flow-arrow {
          color: #f59e0b;
          font-size: 16px;
          font-weight: 900;
        }

        /* Bottom Footer Row */
        .footer-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 10px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          position: relative;
          z-index: 2;
        }

        .verified-stamp {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 11.5px;
          color: #a7f3d0;
          font-weight: 700;
        }

        .verified-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 6px #10b981;
        }

        .cta-hint {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 800;
          color: #fde68a;
          background: rgba(245, 158, 11, 0.15);
          padding: 5px 12px;
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
        <div class="code-pill">${c.code}</div>
      </div>

      <div class="showcase-row">
        <div class="patient-info">
          <span class="tag-pill">${c.tag}</span>
          <h1 class="patient-title">${c.name}</h1>
          <p class="program-sub">${c.program}</p>
          <div class="condition-box">${c.condition}</div>
        </div>

        <div class="metric-card">
          <div class="metric-badge-top">إجمالي نزول الوزن</div>
          <div class="metric-loss">${c.loss}</div>
          <div class="metric-flow">
            <div class="flow-col">
              <span>قبل البرنامج</span>
              <strong>${c.before}</strong>
            </div>
            <span class="flow-arrow">➔</span>
            <div class="flow-col">
              <span>بعد البرنامج</span>
              <strong style="color: #6ee7b7">${c.after}</strong>
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
          <span>انقر لمعاينة صور التحول</span>
          <span>←</span>
        </div>
      </div>
    </body>
    </html>`;

    await page.setContent(html);
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(300);

    await page.screenshot({ path: c.filePublic });
    console.log('Saved cover to public:', c.filePublic);

    if (c.file27) {
      await page.screenshot({ path: c.file27 });
    }

    if (fs.existsSync(path.dirname(c.fileDist))) {
      fs.copyFileSync(c.filePublic, c.fileDist);
      if (c.fileDist27 && c.file27) {
        fs.copyFileSync(c.file27, c.fileDist27);
      }
    }
  }

  await browser.close();
}

generateCovers().catch(console.error);
