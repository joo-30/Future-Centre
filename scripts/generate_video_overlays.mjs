import path from 'node:path';
import fs from 'node:fs';
import { chromium } from '@playwright/test';

const chromeSystem = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OVERLAYS_DIR = 'E:/Project Work/videos media🔥❤️/Future Center/Future-Centre/video_production/overlays';

if (!fs.existsSync(OVERLAYS_DIR)) {
  fs.mkdirSync(OVERLAYS_DIR, { recursive: true });
}

const sceneOverlays = [
  {
    id: 1,
    chapter: 'الفصل 01 • برامج العيادة الذكية',
    title: 'مركز المستقبل للتغذية العلاجية',
    sub: 'باقة المتابعة الشهرية 1,200 ج.م — كشف دوري وخطة مخصصة بدون حرمان',
    features: ['إشراف د. رنا ياسر الشوري', 'فحص InBody دقيق', 'متابعة أسبوعية مباشرة'],
  },
  {
    id: 2,
    chapter: 'الفصل 02 • الفحص التفاعلي الفوري',
    title: 'حاسبة InBody السريرية',
    sub: 'تحليل دقيق لمؤشر كتلة الجسم (BMI) والسعرات والوزن المستهدف بلحظة',
    features: ['حساب فوري بدون انتظار', 'تحديد الوزن المثالي', 'توصية غذائية مخصصة'],
  },
  {
    id: 3,
    chapter: 'الفصل 03 • نتائج موثقة قبل وبعد',
    title: 'قصص نجاح ورسائل واتساب موثقة',
    sub: 'حالات واقعية موثقة من داخل العيادة — معاينة صور التحول والنتائج الحقيقية',
    features: ['توثيق سريري بالمركز', 'معرض محادثات واتساب', 'تكبير الصور بشاشة كاملة'],
  },
  {
    id: 4,
    chapter: 'الفصل 04 • الحجز الفوري وبطاقة QR',
    title: 'بطاقة المريض الرقمية (QR Pass)',
    sub: 'حجز الموعد واستلام كود الدخول الرقمي فوراً لمسحه بالعيادة بدون انتظار',
    features: ['حجز مؤكد بلحظات', 'باركود دخول رقمي ذكي', 'متابعة مباشرة عبر الهاتف'],
  },
  {
    id: 5,
    chapter: 'الفصل 05 • لوحة تشغيل العيادة (Admin OS)',
    title: 'النبض المالي والتشغيلي لليوم',
    sub: 'إدارة العمليات وحالات اليوم لحظياً، متابعة الإيرادات، وسكانر كود المريض',
    features: ['متابعة الإيرادات المباشرة', 'أجندة وسعة العيادة', 'سكانر كود المريض QR'],
  },
  {
    id: 6,
    chapter: 'الفصل 06 • رعاية وملف المريض السريري',
    title: 'ملف المريض والروشتة الغذائية',
    sub: 'سجل تاريخي كامل لقياسات InBody وتصميم الأنظمة الغذائية التخصصية',
    features: ['سجل إكلينيكي متكامل', 'توزيع السعرات والوجبات', 'أمان عالي وسرعة فائقة'],
  },
];

async function main() {
  const browser = await chromium.launch({
    executablePath: chromeSystem,
    headless: true,
  });

  const page = await browser.newPage();
  await page.setViewportSize({ width: 1080, height: 1920 });

  for (const s of sceneOverlays) {
    const html = `
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
      <head>
        <meta charset="UTF-8">
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap" rel="stylesheet">
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            width: 1080px;
            height: 1920px;
            background: transparent;
            font-family: 'Cairo', system-ui, sans-serif;
            position: relative;
            overflow: hidden;
          }

          /* Top Bar (Floating Header) */
          .top-bar {
            position: absolute;
            top: 50px;
            left: 50px;
            right: 50px;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 12px;
          }

          .brand-pill {
            display: inline-flex;
            align-items: center;
            gap: 10px;
            background: rgba(6, 78, 59, 0.85);
            border: 1px solid rgba(52, 211, 153, 0.4);
            padding: 10px 24px;
            border-radius: 999px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.4);
            backdrop-filter: blur(12px);
          }

          .brand-dot {
            width: 10px;
            height: 10px;
            background: #10b981;
            border-radius: 50%;
            box-shadow: 0 0 12px #10b981;
          }

          .brand-text {
            color: #ecfdf5;
            font-size: 22px;
            font-weight: 700;
            letter-spacing: -0.3px;
          }

          .chapter-tag {
            background: rgba(15, 23, 42, 0.8);
            border: 1px solid rgba(255, 255, 255, 0.15);
            color: #fde68a;
            font-size: 20px;
            font-weight: 600;
            padding: 6px 20px;
            border-radius: 999px;
          }

          /* Bottom Bar (Feature Showcase Card) */
          .bottom-bar {
            position: absolute;
            bottom: 45px;
            left: 50px;
            right: 50px;
            background: rgba(4, 30, 22, 0.92);
            border: 1px solid rgba(52, 211, 153, 0.35);
            border-radius: 28px;
            padding: 26px 36px;
            box-shadow: 0 20px 50px rgba(0,0,0,0.6), 0 0 40px rgba(5, 150, 105, 0.2);
            backdrop-filter: blur(20px);
            display: flex;
            flex-direction: column;
            gap: 12px;
          }

          .bottom-title {
            color: #ffffff;
            font-size: 32px;
            font-weight: 900;
            line-height: 1.2;
            display: flex;
            align-items: center;
            justify-content: space-between;
          }

          .bottom-title-badge {
            background: #059669;
            color: #ffffff;
            font-size: 16px;
            font-weight: 700;
            padding: 6px 14px;
            border-radius: 8px;
          }

          .bottom-sub {
            color: #d1fae5;
            font-size: 20px;
            font-weight: 600;
            line-height: 1.4;
          }

          .pills-row {
            display: flex;
            gap: 12px;
            margin-top: 6px;
          }

          .feature-pill {
            background: rgba(255, 255, 255, 0.08);
            border: 1px solid rgba(255, 255, 255, 0.12);
            color: #a7f3d0;
            font-size: 16px;
            font-weight: 600;
            padding: 6px 16px;
            border-radius: 999px;
          }
        </style>
      </head>
      <body>
        <div class="top-bar">
          <div class="brand-pill">
            <span class="brand-dot"></span>
            <span class="brand-text">مركز المستقبل للتغذية العلاجية</span>
          </div>
          <span class="chapter-tag">${s.chapter}</span>
        </div>

        <div class="bottom-bar">
          <div class="bottom-title">
            <span>${s.title}</span>
            <span class="bottom-title-badge">YANSY Tech</span>
          </div>
          <p class="bottom-sub">${s.sub}</p>
          <div class="pills-row">
            ${s.features.map(f => `<span class="feature-pill">✓ ${f}</span>`).join('')}
          </div>
        </div>
      </body>
      </html>
    `;

    await page.setContent(html);
    await page.waitForTimeout(500);

    const outPath = path.join(OVERLAYS_DIR, `overlay_${s.id}.png`);
    await page.screenshot({ path: outPath, omitBackground: true });
    console.log(`Rendered overlay: overlay_${s.id}.png`);
  }

  // Also render a Grand Finale Outro Card (overlay_outro.png)
  const outroHtml = `
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
      <meta charset="UTF-8">
      <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap" rel="stylesheet">
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          width: 1080px;
          height: 1920px;
          background: #021a14;
          font-family: 'Cairo', system-ui, sans-serif;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 60px;
        }

        .outro-glow {
          position: absolute;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(16, 185, 129, 0.3) 0%, transparent 70%);
          border-radius: 50%;
          filter: blur(60px);
          z-index: 1;
        }

        .outro-content {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 24px;
        }

        .logo-box {
          width: 130px;
          height: 130px;
          background: linear-gradient(135deg, #059669 0%, #047857 100%);
          border: 2px solid #34d399;
          border-radius: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 20px 50px rgba(5, 150, 105, 0.4);
        }

        .logo-icon {
          font-size: 64px;
        }

        h1 {
          color: #ffffff;
          font-size: 52px;
          font-weight: 900;
          line-height: 1.2;
          letter-spacing: -0.5px;
        }

        h2 {
          color: #34d399;
          font-size: 30px;
          font-weight: 700;
        }

        p {
          color: #d1fae5;
          font-size: 24px;
          font-weight: 600;
          max-width: 800px;
          line-height: 1.6;
        }

        .cta-box {
          margin-top: 20px;
          background: #ffffff;
          color: #064e3b;
          font-size: 28px;
          font-weight: 900;
          padding: 18px 48px;
          border-radius: 999px;
          box-shadow: 0 15px 40px rgba(0,0,0,0.5);
        }

        .credits {
          margin-top: 40px;
          color: #94a3b8;
          font-size: 20px;
          font-weight: 600;
          letter-spacing: 0.5px;
        }
      </style>
    </head>
    <body>
      <div class="outro-glow"></div>
      <div class="outro-content">
        <div class="logo-box">
          <span class="logo-icon">🌿</span>
        </div>
        <h1>مركز المستقبل للتغذية العلاجية</h1>
        <h2>د. رنا ياسر الشوري</h2>
        <p>ابدأي رحلتكِ الصحية الآن وتخلصي من الوزن الزائد بدون حرمان</p>
        <div class="cta-box">احجزي كشفك واستشارتكِ الآن</div>
        <div class="credits">Crafted with Precision by YANSY Tech</div>
      </div>
    </body>
    </html>
  `;

  await page.setContent(outroHtml);
  await page.waitForTimeout(500);
  const outroPath = path.join(OVERLAYS_DIR, 'overlay_outro.png');
  await page.screenshot({ path: outroPath });
  console.log(`Rendered outro: overlay_outro.png`);

  await browser.close();
  console.log('ALL OVERLAYS RENDERED SUCCESSFULLY!');
}

main().catch(console.error);
