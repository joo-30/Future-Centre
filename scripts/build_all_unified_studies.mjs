import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const chromeSystem = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function buildAllUnifiedStudies() {
  const browser = await chromium.launch({
    executablePath: chromeSystem,
    headless: true,
  });

  const page = await browser.newPage();

  // 1. Safia crops from original raw user upload
  const rawSafiaPath = 'C:/Users/asus1/.gemini/antigravity/brain/737eb81e-624f-4504-b938-d04ece747f9b/.user_uploaded/media_1794314887780_93c853a0.jpg';
  const rawSafiaB64 = fs.readFileSync(rawSafiaPath).toString('base64');

  await page.setContent(`<!DOCTYPE html><html><body><img id="safia" src="data:image/jpeg;base64,${rawSafiaB64}"><canvas id="c"></canvas></body></html>`);
  const safiaCrops = await page.evaluate(() => {
    const img = document.getElementById('safia');
    const c = document.getElementById('c');
    c.width = img.naturalWidth;
    c.height = img.naturalHeight;
    const ctx = c.getContext('2d');
    ctx.drawImage(img, 0, 0);

    // Before: 92kg (head starts at y=62, so start at y=60 to preserve 100% of turban and head)
    const cBefore = document.createElement('canvas');
    cBefore.width = 176;
    cBefore.height = 465;
    const ctxB = cBefore.getContext('2d');
    ctxB.drawImage(c, 136, 60, 176, 465, 0, 0, 176, 465);

    // After: 77kg (head starts at y=105, start at y=65 for clean headroom)
    const cAfter = document.createElement('canvas');
    cAfter.width = 225;
    cAfter.height = 465;
    const ctxA = cAfter.getContext('2d');
    ctxA.drawImage(c, 312, 65, 225, 465, 0, 0, 225, 465);

    return { before: cBefore.toDataURL('image/png'), after: cAfter.toDataURL('image/png') };
  });

  // 2. Nada crops from pristine view_trans_107kg.jpg
  const nadaSrc = 'C:/Users/asus1/.gemini/antigravity/brain/737eb81e-624f-4504-b938-d04ece747f9b/view_trans_107kg.jpg';
  const nadaB64 = fs.readFileSync(nadaSrc).toString('base64');
  await page.setContent(`<!DOCTYPE html><html><body><img id="nada" src="data:image/jpeg;base64,${nadaB64}"><canvas id="c"></canvas></body></html>`);
  const nadaCrops = await page.evaluate(() => {
    const img = document.getElementById('nada');
    const c = document.getElementById('c');
    c.width = img.naturalWidth;
    c.height = img.naturalHeight;
    const ctx = c.getContext('2d');
    ctx.drawImage(img, 0, 0);

    const cB = document.createElement('canvas');
    cB.width = 236;
    cB.height = 520;
    const ctxB = cB.getContext('2d');
    ctxB.drawImage(c, 24, 138, 236, 520, 0, 0, 236, 520);

    const cA = document.createElement('canvas');
    cA.width = 236;
    cA.height = 520;
    const ctxA = cA.getContext('2d');
    ctxA.drawImage(c, 264, 138, 236, 520, 0, 0, 236, 520);

    return { before: cB.toDataURL('image/png'), after: cA.toDataURL('image/png') };
  });

  // 3. Sameh crops from pristine view_trans_sameh.jpg
  const samehSrc = 'C:/Users/asus1/.gemini/antigravity/brain/737eb81e-624f-4504-b938-d04ece747f9b/view_trans_sameh.jpg';
  const samehB64 = fs.readFileSync(samehSrc).toString('base64');
  await page.setContent(`<!DOCTYPE html><html><body><img id="sameh" src="data:image/jpeg;base64,${samehB64}"><canvas id="c"></canvas></body></html>`);
  const samehCrops = await page.evaluate(() => {
    const img = document.getElementById('sameh');
    const c = document.getElementById('c');
    c.width = img.naturalWidth;
    c.height = img.naturalHeight;
    const ctx = c.getContext('2d');
    ctx.drawImage(img, 0, 0);

    // Before: sitting in chair at 98.5kg (y: 365 gives clean wall headroom above his head, 100% face and body intact)
    const cB = document.createElement('canvas');
    cB.width = 255;
    cB.height = 480;
    const ctxB = cB.getContext('2d');
    ctxB.drawImage(c, 285, 365, 255, 480, 0, 0, 255, 480);

    // After: sitting at desk at 86kg (y: 175 cuts out "OOK" letters at top, keeping full head and torso)
    const cA = document.createElement('canvas');
    cA.width = 290;
    cA.height = 490;
    const ctxA = cA.getContext('2d');
    ctxA.drawImage(c, 20, 175, 290, 490, 0, 0, 290, 490);

    return { before: cB.toDataURL('image/png'), after: cA.toDataURL('image/png') };
  });

  console.log('All crops prepared with perfected headroom!');

  await page.setViewportSize({ width: 800, height: 780 });

  const studiesData = [
    {
      id: 'nada',
      name: 'مدام ندى (32 سنة)',
      lossPill: 'نزول 27 كجم',
      beforeBadge: 'الوزن السابق 107 كجم',
      afterBadge: 'وأصبح 80 كجم',
      footerDiff: 'الفرق: نزول 27 كجم والتعافي من خمول الغدة وارتجاع المريء',
      beforeImg: nadaCrops.before,
      afterImg: nadaCrops.after,
      outPublic: path.resolve(__dirname, '../client/public/stories/transformation_107kg.jpg'),
      outDist: path.resolve(__dirname, '../client/dist/stories/transformation_107kg.jpg'),
    },
    {
      id: 'sameh',
      name: 'أستاذ سامح (42 سنة)',
      lossPill: 'نزول 14 كجم',
      beforeBadge: 'الوزن السابق 98.5 كجم',
      afterBadge: 'وأصبح 86 كجم',
      footerDiff: 'الفرق: نزول 14 كجم مع انتظام السكر التراكمي واستعادة النشاط',
      beforeImg: samehCrops.before,
      afterImg: samehCrops.after,
      outPublic: path.resolve(__dirname, '../client/public/stories/transformation_sameh.jpg'),
      outDist: path.resolve(__dirname, '../client/dist/stories/transformation_sameh.jpg'),
    },
    {
      id: 'safia',
      name: 'مدام صفية (38 سنة)',
      lossPill: 'نزول 15 كجم',
      beforeBadge: 'الوزن السابق 92 كجم',
      afterBadge: 'وأصبح 77 كجم',
      footerDiff: 'الفرق: نزول 15 كجم مع نحت محيط الخصر والقوام بدون ترهلات',
      beforeImg: safiaCrops.before,
      afterImg: safiaCrops.after,
      outPublic: path.resolve(__dirname, '../client/public/stories/transformation_safia.jpg'),
      outDist: path.resolve(__dirname, '../client/dist/stories/transformation_safia.jpg'),
    },
  ];

  for (const s of studiesData) {
    const html = `<!DOCTYPE html>
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
          display: flex;
          flex-direction: column;
          overflow: hidden;
          position: relative;
        }

        /* Top Header */
        .header {
          height: 90px;
          background: linear-gradient(180deg, #064e3b 0%, #022c22 100%);
          border-bottom: 2px solid #059669;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 28px;
          position: relative;
          z-index: 10;
        }
        .header-title-box {
          display: flex;
          flex-direction: column;
          gap: 2px;
          text-align: right;
        }
        .clinic-brand {
          font-size: 20px;
          font-weight: 900;
          color: #ffffff;
          letter-spacing: -0.3px;
        }
        .clinic-sub {
          font-size: 13px;
          font-weight: 700;
          color: #6ee7b7;
        }
        .pill-loss {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: #ffffff;
          font-size: 16px;
          font-weight: 900;
          padding: 8px 20px;
          border-radius: 30px;
          box-shadow: 0 4px 14px rgba(16, 185, 129, 0.4);
          border: 1px solid #34d399;
        }

        /* Main Photos Split Comparison Area */
        .comparison-stage {
          flex: 1;
          display: flex;
          position: relative;
          background: #011d17;
          overflow: hidden;
        }

        /* Right Panel: Before */
        .panel-before {
          flex: 1;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #04241e;
          border-left: 2px solid #eab308;
          overflow: hidden;
        }
        .panel-before img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        /* Left Panel: After */
        .panel-after {
          flex: 1;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #03211b;
          overflow: hidden;
        }
        .panel-after img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        /* Badges over Photos */
        .badge-before {
          position: absolute;
          top: 24px;
          right: 24px;
          background: rgba(15, 23, 42, 0.88);
          border: 1.5px solid #ef4444;
          color: #ffffff;
          font-size: 16px;
          font-weight: 800;
          padding: 7px 18px;
          border-radius: 30px;
          display: flex;
          align-items: center;
          gap: 8px;
          backdrop-filter: blur(6px);
          box-shadow: 0 4px 16px rgba(0,0,0,0.4);
          z-index: 5;
        }
        .badge-before::before {
          content: '';
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #ef4444;
          box-shadow: 0 0 8px #ef4444;
        }

        .badge-after {
          position: absolute;
          top: 24px;
          right: 24px;
          background: rgba(6, 78, 59, 0.9);
          border: 1.5px solid #10b981;
          color: #ffffff;
          font-size: 16px;
          font-weight: 800;
          padding: 7px 18px;
          border-radius: 30px;
          display: flex;
          align-items: center;
          gap: 8px;
          backdrop-filter: blur(6px);
          box-shadow: 0 4px 16px rgba(0,0,0,0.4);
          z-index: 5;
        }
        .badge-after::before {
          content: '';
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #34d399;
          box-shadow: 0 0 8px #34d399;
        }

        /* Center Circular Transition Indicator */
        .center-divider {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: #064e3b;
          border: 2px solid #eab308;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #eab308;
          box-shadow: 0 0 20px rgba(0,0,0,0.6);
          z-index: 20;
        }
        .center-divider svg {
          width: 22px;
          height: 22px;
          transform: rotate(180deg); /* points to after (left in RTL) */
        }

        /* Bottom Clinical Stamp Footer */
        .footer-stamp {
          height: 64px;
          background: #011d17;
          border-top: 1.5px solid #064e3b;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 26px;
          font-size: 14px;
          font-weight: 800;
          color: #a7f3d0;
          position: relative;
          z-index: 10;
        }
        .footer-stamp .diff {
          color: #ffffff;
        }
        .footer-stamp .verified-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #6ee7b7;
        }
      </style>
    </head>
    <body>
      <header class="header">
        <div class="header-title-box">
          <div class="clinic-brand">مركز المستقبل للتغذية العلاجية والتخسيس</div>
          <div class="clinic-sub">د. رنا ياسر الشوري • توثيق نتائج التحول السريري (Before &amp; After) — ${s.name}</div>
        </div>
        <div class="pill-loss">${s.lossPill}</div>
      </header>

      <main class="comparison-stage">
        <!-- Before (Right in RTL) -->
        <section class="panel-before">
          <div class="badge-before">${s.beforeBadge}</div>
          <img src="${s.beforeImg}" alt="قبل البرنامج">
        </section>

        <!-- Center Divider Pill -->
        <div class="center-divider">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </div>

        <!-- After (Left in RTL) -->
        <section class="panel-after">
          <div class="badge-after">${s.afterBadge}</div>
          <img src="${s.afterImg}" alt="بعد البرنامج">
        </section>
      </main>

      <footer class="footer-stamp">
        <span class="diff">${s.footerDiff}</span>
        <span class="verified-badge">حالة سريرية موثقة ومعتمدة بفحص قياسات العيادة</span>
      </footer>
    </body>
    </html>`;

    await page.setContent(html, { waitUntil: 'networkidle' });
    const buf = await page.screenshot({ type: 'jpeg', quality: 95 });
    fs.writeFileSync(s.outPublic, buf);
    if (fs.existsSync(path.dirname(s.outDist))) {
      fs.writeFileSync(s.outDist, buf);
    }
    fs.writeFileSync(`C:/Users/asus1/.gemini/antigravity/brain/737eb81e-624f-4504-b938-d04ece747f9b/inspect_unified_${s.id}.jpg`, buf);
    console.log(`Successfully built unified study: ${s.id}`);
  }

  await browser.close();
}

buildAllUnifiedStudies().catch(console.error);
