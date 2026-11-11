import { chromium } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const chromeSystem = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const covers = [
  {
    filename: 'case_cover_27kg.png',
    code: '#FC-T107',
    tag: 'دراسة حالة تحول كبرى',
    patient: 'مدام ندى (32 سنة)',
    metricLoss: '27 كجم',
    metricFrom: '107 كجم',
    metricTo: '80 كجم',
    duration: '٥ أشهر',
    condition: 'علاج خمول الغدة الدرقية وارتجاع المريء ونقص الفيتامينات',
    program: 'كورس التغذية العلاجية وتنظيم الأيض',
    accentColor: '#10b981',
    goldColor: '#f59e0b',
  },
  {
    filename: 'case_cover_sameh.png',
    code: '#FC-T098',
    tag: 'دراسة حالة إكلينيكية',
    patient: 'أستاذ سامح (42 سنة)',
    metricLoss: '14 كجم',
    metricFrom: '98.5 كجم',
    metricTo: '86 كجم',
    duration: '٣ أشهر',
    condition: 'تنظيم سكر الدم والتراكمي واستعادة النشاط الحيوي',
    program: 'برنامج التغذية الإكلينيكية وضبط السكر',
    accentColor: '#10b981',
    goldColor: '#f59e0b',
  },
  {
    filename: 'case_cover_safia.png',
    code: '#FC-T092',
    tag: 'دراسة حالة تحول كبرى',
    patient: 'مدام صفية (38 سنة)',
    metricLoss: '15 كجم',
    metricFrom: '92 كجم',
    metricTo: '77 كجم',
    duration: 'شهرين',
    condition: 'نزول 15 كجم ونحت محيط الخصر وتنسيق القوام بدون حرمان',
    program: 'تحدي كورس النحت والتغذية العلاجية بالعيادة',
    accentColor: '#10b981',
    goldColor: '#f59e0b',
  },
];

async function generateCovers() {
  const browser = await chromium.launch({
    executablePath: chromeSystem,
    headless: true,
  });
  const page = await browser.newPage({ viewport: { width: 800, height: 500 } });

  for (const c of covers) {
    const html = `<!DOCTYPE html>
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
          letter-spacing: -0.3px;
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
          letter-spacing: 0.5px;
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
          font-size: 32px;
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
          box-shadow: 0 0 8px #10b981;
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
        <div class="code-pill">${c.code}</div>
      </div>

      <div class="showcase-row">
        <div class="patient-info">
          <span class="tag-pill">✓ ${c.tag} • ${c.duration}</span>
          <h1 class="patient-title">${c.patient}</h1>
          <p class="program-sub">${c.program}</p>
          <div class="condition-box">
            ${c.condition}
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-badge-top">إجمالي نزول الوزن</div>
          <div class="metric-loss">-${c.metricLoss}</div>
          <div class="metric-flow">
            <div class="flow-col">
              <span>قبل البرنامج</span>
              <strong>${c.metricFrom}</strong>
            </div>
            <span class="flow-arrow">➔</span>
            <div class="flow-col">
              <span>بعد البرنامج</span>
              <strong style="color: #6ee7b7">${c.metricTo}</strong>
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

    await page.setContent(html);
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(500);
    const targetPath = path.join(__dirname, '../client/public/stories', c.filename);
    await page.screenshot({ path: targetPath });
    console.log(`Saved cover: ${c.filename}`);
  }

  await browser.close();
}

generateCovers().catch((err) => {
  console.error(err);
  process.exit(1);
});
