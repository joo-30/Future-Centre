import { chromium } from 'playwright';
import fs from 'fs';

const chromeSystem = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:/Users/makah/.gemini/antigravity/brain/c5420236-75f6-4eb0-aed5-e6d16c5e7077';

const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>Elevated UI/UX: Clinical Pillars & Dr. Rana Master Showcase</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Alexandria:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    :root {
      --paper: #F3F0E5;
      --evergreen: #063F32;
      --moss: #C9DF83;
      --sage: #71834A;
      --lead: #4A5E52;
      --muted: #55695A;
      --border: rgba(6, 63, 50, 0.09);
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Alexandria', sans-serif;
      background: var(--paper);
      color: var(--evergreen);
      direction: rtl;
      padding: 40px 24px;
      line-height: 1.6;
    }
    .wrapper {
      max-width: 1320px;
      margin: 0 auto;
    }

    /* ═══════════════════════════════════════════════════════════════
       1. SPACIOUS, UNCOMPRESSED CLINICAL PILLARS (تحليل InBody والأنظمة)
       Zero cramp! Generous padding, relaxed typography, elegant cards
       ═══════════════════════════════════════════════════════════════ */
    .section-title-wrap {
      margin-bottom: 24px;
      text-align: right;
    }
    .section-kicker {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      font-weight: 750;
      color: var(--sage);
      background: rgba(113, 131, 74, 0.12);
      padding: 5px 14px;
      border-radius: 9999px;
      margin-bottom: 8px;
    }
    .section-h2 {
      font-size: clamp(26px, 3vw, 36px);
      font-weight: 850;
      color: var(--evergreen);
    }

    .spacious-pillars-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 22px;
      margin-bottom: 72px;
    }

    .sp-card {
      background: #FFFFFF;
      border: 1px solid rgba(6, 63, 50, 0.08);
      border-radius: 22px;
      padding: 28px 24px 26px;
      box-shadow: 0 4px 20px -4px rgba(6, 63, 50, 0.04);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      transition: all 0.25s ease;
      position: relative;
    }
    .sp-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 14px 32px -8px rgba(6, 63, 50, 0.1);
      border-color: rgba(6, 63, 50, 0.22);
    }
    .sp-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    .sp-num {
      font-size: 13px;
      font-weight: 800;
      color: var(--evergreen);
      background: rgba(113, 131, 74, 0.14);
      padding: 4px 10px;
      border-radius: 8px;
      letter-spacing: 0.5px;
    }
    .sp-icon-circle {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: #F4F7EC;
      color: var(--sage);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
    }
    .sp-title {
      font-size: 18px;
      font-weight: 850;
      color: var(--evergreen);
      margin-bottom: 10px;
      line-height: 1.35;
    }
    .sp-desc {
      font-size: 14px;
      color: var(--lead);
      line-height: 1.7;
      margin: 0;
    }

    /* ═══════════════════════════════════════════════════════════════
       2. MASTER LUXURY DR. RANA SHOWCASE (Top-Tier UI/UX)
       Swiss/London clinic prestige, authentic portrait, quote, credentials
       ═══════════════════════════════════════════════════════════════ */
    .dr-showcase {
      background: #FFFFFF;
      border: 1px solid rgba(6, 63, 50, 0.1);
      border-radius: 32px;
      padding: clamp(40px, 5vw, 68px);
      box-shadow: 
        0 24px 60px -15px rgba(6, 63, 50, 0.08),
        0 4px 20px rgba(6, 63, 50, 0.03);
      display: grid;
      grid-template-columns: 1.25fr 0.85fr;
      gap: clamp(40px, 5vw, 72px);
      align-items: center;
      position: relative;
      overflow: hidden;
    }
    .dr-showcase::before {
      content: '';
      position: absolute;
      top: -150px;
      left: -150px;
      width: 400px;
      height: 400px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(201, 223, 131, 0.25) 0%, transparent 70%);
      pointer-events: none;
    }

    /* Left Copy Column */
    .dr-copy {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      position: relative;
      z-index: 2;
    }
    .dr-kicker {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      font-weight: 750;
      color: var(--sage);
      background: rgba(113, 131, 74, 0.1);
      padding: 6px 16px;
      border-radius: 9999px;
      margin-bottom: 16px;
    }
    .dr-copy h2 {
      font-size: clamp(32px, 3.8vw, 46px);
      font-weight: 900;
      color: var(--evergreen);
      line-height: 1.2;
      margin-bottom: 8px;
      letter-spacing: -0.5px;
    }
    .dr-specialty {
      font-size: clamp(15.5px, 1.3vw, 18px);
      font-weight: 750;
      color: var(--sage);
      line-height: 1.5;
      margin-bottom: 22px;
    }

    /* Philosophy Quote Card */
    .dr-quote-card {
      background: #F8F6EF;
      border-right: 4px solid var(--sage);
      border-radius: 14px;
      padding: 18px 22px;
      margin-bottom: 26px;
      position: relative;
    }
    .dr-quote-card p {
      font-size: 15px;
      font-weight: 500;
      color: var(--evergreen);
      line-height: 1.8;
      margin: 0;
      font-style: italic;
    }
    .dr-quote-card span.quote-mark {
      font-size: 28px;
      font-weight: 900;
      color: var(--sage);
      line-height: 1;
      display: inline-block;
      margin-left: 6px;
    }

    /* Credentials 2x2 Grid */
    .dr-creds-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px 18px;
      width: 100%;
      margin-bottom: 30px;
    }
    .dr-cred-item {
      display: flex;
      align-items: center;
      gap: 12px;
      background: #FAFAF8;
      border: 1px solid rgba(6, 63, 50, 0.07);
      border-radius: 14px;
      padding: 14px 18px;
      transition: all 0.2s ease;
    }
    .dr-cred-item:hover {
      background: #F4F7EC;
      border-color: rgba(6, 63, 50, 0.18);
      transform: translateY(-2px);
    }
    .dr-cred-icon {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: rgba(113, 131, 74, 0.14);
      color: var(--evergreen);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 17px;
      flex-shrink: 0;
    }
    .dr-cred-text strong {
      display: block;
      font-size: 13.5px;
      font-weight: 800;
      color: var(--evergreen);
      line-height: 1.35;
    }
    .dr-cred-text span {
      display: block;
      font-size: 11.5px;
      color: var(--lead);
      margin-top: 2px;
    }

    /* Actions & Trust Note */
    .dr-actions {
      display: flex;
      align-items: center;
      gap: 20px;
      flex-wrap: wrap;
    }
    .btn-dr-book {
      display: inline-flex;
      align-items: center;
      gap: 12px;
      padding: 15px 36px;
      border-radius: 9999px;
      background: var(--evergreen);
      color: #FFFFFF;
      font-size: 15px;
      font-weight: 750;
      text-decoration: none;
      box-shadow: 0 4px 20px rgba(6, 63, 50, 0.18);
      transition: all 0.22s ease;
    }
    .btn-dr-book:hover {
      background: #094d3e;
      transform: translateY(-2px);
      box-shadow: 0 8px 26px rgba(6, 63, 50, 0.24);
    }
    .btn-dr-book span.arrow {
      color: var(--moss);
      font-size: 16px;
    }
    .dr-reassurance {
      font-size: 13px;
      color: var(--muted);
      font-weight: 500;
    }

    /* Right Visual Column (Architectural Dr. Rana Frame) */
    .dr-visual-wrap {
      position: relative;
      width: 100%;
      max-width: 420px;
      margin: 0 auto;
    }
    .dr-portrait-frame {
      position: relative;
      aspect-ratio: 4 / 5.1;
      border-radius: 32px;
      overflow: hidden;
      background: #EBF0E4;
      box-shadow: 
        0 24px 54px -14px rgba(6, 63, 50, 0.22),
        0 4px 18px rgba(6, 63, 50, 0.06);
      border: 2px solid rgba(201, 223, 131, 0.4);
    }
    .dr-portrait-frame img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center 18%;
      display: block;
    }

    /* Floating Trust Badges */
    .dr-badge-top {
      position: absolute;
      top: 20px;
      right: -16px;
      background: #FFFFFF;
      border: 1px solid rgba(6, 63, 50, 0.1);
      border-radius: 9999px;
      padding: 8px 16px;
      box-shadow: 0 8px 24px rgba(6, 63, 50, 0.14);
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12.5px;
      font-weight: 800;
      color: var(--evergreen);
      z-index: 3;
    }
    .dr-badge-top .star {
      color: #eab308;
    }

    .dr-badge-bottom {
      position: absolute;
      bottom: -18px;
      left: 20px;
      background: var(--evergreen);
      color: #FFFFFF;
      border-radius: 16px;
      padding: 12px 20px;
      box-shadow: 0 8px 26px rgba(6, 63, 50, 0.28);
      display: flex;
      flex-direction: column;
      gap: 2px;
      z-index: 3;
      border: 1px solid rgba(201, 223, 131, 0.3);
    }
    .dr-badge-bottom strong {
      font-size: 13.5px;
      font-weight: 800;
    }
    .dr-badge-bottom span {
      font-size: 11.5px;
      color: var(--moss);
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .live-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #22c55e;
      display: inline-block;
    }
  </style>
</head>
<body>

  <div class="wrapper">
    <!-- 1. THE SPACIOUS, UNCOMPRESSED CLINICAL PILLARS -->
    <div class="section-title-wrap">
      <span class="section-kicker">منهجية الرعاية بالمركز</span>
      <h2 class="section-h2">ركائز طبية متكاملة لضمان أفضل النتائج</h2>
    </div>

    <div class="spacious-pillars-grid">
      <!-- 01 -->
      <div class="sp-card">
        <div>
          <div class="sp-top">
            <span class="sp-num">01</span>
            <div class="sp-icon-circle">📊</div>
          </div>
          <h3 class="sp-title">تحليل InBody الشامل</h3>
          <p class="sp-desc">تتبع سريري دقيق لكتلة الدهون، العضلات، ومعدل الحرق وتوزيع السوائل لتحديد نقطة البداية الصحيحة علمياً.</p>
        </div>
      </div>

      <!-- 02 -->
      <div class="sp-card">
        <div>
          <div class="sp-top">
            <span class="sp-num">02</span>
            <div class="sp-icon-circle">🥗</div>
          </div>
          <h3 class="sp-title">أنظمة غذائية مخصصة</h3>
          <p class="sp-desc">برامج علمية مرنة مصممة خصيصاً لتلائم وتيرة يومكِ، أكلاتكِ المفضلة، وظروف عملكِ لتحقيق نتائج دائمة دون حرمان.</p>
        </div>
      </div>

      <!-- 03 -->
      <div class="sp-card">
        <div>
          <div class="sp-top">
            <span class="sp-num">03</span>
            <div class="sp-icon-circle">✨</div>
          </div>
          <h3 class="sp-title">نحت وتنسيق القوام</h3>
          <p class="sp-desc">أحدث تقنيات تفتيت الدهون الموضعية وشد الترهلات غير الجراحية للوصول لأفضل تناسق قوام ممكن بأمان تام.</p>
        </div>
      </div>

      <!-- 04 -->
      <div class="sp-card">
        <div>
          <div class="sp-top">
            <span class="sp-num">04</span>
            <div class="sp-icon-circle">🤝</div>
          </div>
          <h3 class="sp-title">متابعة إكلينيكية مباشرة</h3>
          <p class="sp-desc">إشراف طبي مباشر ومستمر من د. رنا في كل جلسة لمراجعة التطورات وتعديل الخطة وفق استجابة جسمكِ الحيوية.</p>
        </div>
      </div>
    </div>

    <!-- 2. MASTER LUXURY DR. RANA SHOWCASE -->
    <section class="dr-showcase">
      <div class="dr-copy">
        <span class="dr-kicker">🏛️ الإشراف الطبي والخبرة الإكلينيكية · مركز المستقبل</span>
        <h2>د. رنا ياسر الشورى</h2>
        <p class="dr-specialty">أخصائية التغذية العلاجية وعلاج السمنة وتنسيق القوام · عضو الجمعية المصرية لدراسة السمنة (EMASO)</p>
        
        <div class="dr-quote-card">
          <p>
            <span class="quote-mark">“</span>
            العلاج الغذائي الناجح لا يعتمد على الحرمان أو الجداول القاسية، بل على فهم كيمياء جسمكِ وتوازن هرموناتكِ، وبناء خطة علمية تناسب إيقاع حياتكِ اليومي لتحقيق نتائج تدوم مدى الحياة.
          </p>
        </div>

        <div class="dr-creds-grid">
          <div class="dr-cred-item">
            <div class="dr-cred-icon">🎓</div>
            <div class="dr-cred-text">
              <strong>ماجستير ودبلومة التغذية الإكلينيكية</strong>
              <span>تخصص معتمد في إدارة السمنة وصحة الأيض</span>
            </div>
          </div>

          <div class="dr-cred-item">
            <div class="dr-cred-icon">🏛️</div>
            <div class="dr-cred-text">
              <strong>عضو الجمعية المصرية لدراسة السمنة</strong>
              <span>تطبيق أحدث البروتوكولات الإكلينيكية (EMASO)</span>
            </div>
          </div>

          <div class="dr-cred-item">
            <div class="dr-cred-icon">📊</div>
            <div class="dr-cred-text">
              <strong>تتبع تكوين الجسم بتقنية InBody</strong>
              <span>متابعة دقيقة لنسب الدهون وتطور الكتلة العضلية</span>
            </div>
          </div>

          <div class="dr-cred-item">
            <div class="dr-cred-icon">🤝</div>
            <div class="dr-cred-text">
              <strong>إشراف طبي ومتابعة فردية مباشرة</strong>
              <span>تقييم شخصي وتعديل دوري مستمر في كل زيارة</span>
            </div>
          </div>
        </div>

        <div class="dr-actions">
          <a href="/booking" class="btn-dr-book">
            <span>احجزي استشارتكِ مع د. رنا</span>
            <span class="arrow">←</span>
          </a>
          <span class="dr-reassurance">المواعيد بالحضور الشخصي في عيادة كفر الزيات</span>
        </div>
      </div>

      <div class="dr-visual-wrap">
        <div class="dr-badge-top">
          <span class="star">★</span>
          <span>خبرة إكلينيكية معتمدة · كفر الزيات</span>
        </div>

        <div class="dr-portrait-frame">
          <img src="/assets/dr-rana.jpg" alt="د. رنا ياسر الشورى">
        </div>

        <div class="dr-badge-bottom">
          <strong>د. رنا الشورى</strong>
          <span><span class="live-dot"></span> استشارات حضورية ومتابعة دورية</span>
        </div>
      </div>
    </section>
  </div>

</body>
</html>
`;

fs.writeFileSync('client/public/test_elevated_sections.html', html);

async function capture() {
  const browser = await chromium.launch({ executablePath: chromeSystem, headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 1600 });
  await page.goto('http://127.0.0.1:5176/test_elevated_sections.html', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  const shotPath = `${artifactDir}/elevated_sections_preview_1440.png`;
  await page.screenshot({ path: shotPath, fullPage: true });
  console.log('Saved elevated preview screenshot:', shotPath);

  await browser.close();
}

capture().catch(console.error);
