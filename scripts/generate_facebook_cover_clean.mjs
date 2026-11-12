import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const chromeSystem = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:/Users/asus1/.gemini/antigravity/brain/737eb81e-624f-4504-b938-d04ece747f9b';
const PUBLIC_DIR = 'E:/Project Work/videos media🔥❤️/Future Center/Future-Centre/client/public';

function getBase64(filePath, mime) {
  const buf = fs.readFileSync(filePath);
  return `data:${mime};base64,${buf.toString('base64')}`;
}

const doctorImg = getBase64(path.join(PUBLIC_DIR, 'assets/dr-rana.jpg'), 'image/jpeg');
const brandMark = getBase64(path.join(PUBLIC_DIR, 'assets/brand-mark.png'), 'image/png');

// 1. FACEBOOK COVER (1640 x 624 px) - Uncrowded, Chic, Clean Light Medical
const htmlCoverLight = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Alexandria:wght@300;400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    width: 1640px;
    height: 624px;
    background: #fbfdfa;
    font-family: 'Alexandria', sans-serif;
    color: #06382c;
    overflow: hidden;
    position: relative;
    display: flex;
    align-items: center;
  }

  /* Ambient Medical Clinic Background */
  .bg-base {
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at 75% 25%, #eef6ec 0%, #fbfdfa 55%, #f4f8f2 100%);
    z-index: 1;
  }
  .bg-glow-right {
    position: absolute;
    right: 5%;
    top: -20%;
    width: 700px;
    height: 700px;
    background: radial-gradient(circle, rgba(16, 185, 129, 0.09) 0%, transparent 65%);
    filter: blur(50px);
    z-index: 2;
  }
  .bg-mesh {
    position: absolute;
    inset: 0;
    background-image: radial-gradient(rgba(6, 56, 44, 0.035) 1px, transparent 1px);
    background-size: 32px 32px;
    z-index: 3;
  }

  /* Main Container (Safe Zone: 1420px centered) */
  .canvas-wrapper {
    position: relative;
    z-index: 10;
    width: 100%;
    height: 100%;
    display: grid;
    grid-template-columns: 1.15fr 0.85fr;
    padding: 44px 90px 42px;
    align-items: center;
  }

  /* Right Side: Branding, Headline, Contacts */
  .content-col {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 16px;
    padding-left: 30px;
  }

  .brand-chip {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    background: #ffffff;
    border: 1px solid #d8e5d2;
    box-shadow: 0 4px 14px rgba(6, 56, 44, 0.04);
    padding: 6px 18px 6px 8px;
    border-radius: 999px;
    width: fit-content;
  }
  .brand-logo-img {
    width: 32px;
    height: 32px;
    object-fit: contain;
  }
  .brand-chip-text {
    font-size: 14px;
    font-weight: 700;
    color: #06382c;
  }
  .brand-chip-tag {
    background: #06382c;
    color: #ffffff;
    font-size: 11px;
    font-weight: 800;
    padding: 3px 10px;
    border-radius: 999px;
    margin-right: 4px;
  }

  .main-title {
    font-size: 47px;
    font-weight: 900;
    line-height: 1.18;
    color: #042920;
    letter-spacing: -1.2px;
  }
  .main-title .highlight {
    color: #059669;
  }

  .subtitle {
    font-size: 18px;
    font-weight: 500;
    color: #3b5b4e;
    line-height: 1.55;
    max-width: 720px;
  }
  .subtitle strong {
    color: #06382c;
    font-weight: 700;
  }

  /* 3 Core Pillars */
  .pillars-row {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: 4px;
  }
  .pillar-item {
    display: flex;
    align-items: center;
    gap: 8px;
    background: #ffffff;
    border: 1px solid #dce8d5;
    padding: 8px 16px;
    border-radius: 12px;
    font-size: 13.5px;
    font-weight: 600;
    color: #06382c;
    box-shadow: 0 2px 8px rgba(6, 56, 44, 0.03);
  }
  .pillar-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #059669;
  }

  /* Footer Strip: Contacts & Address */
  .footer-strip {
    display: flex;
    align-items: center;
    gap: 26px;
    margin-top: 10px;
    padding-top: 18px;
    border-top: 1px solid #dce8d5;
  }
  .footer-item {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .footer-icon-wrap {
    width: 38px;
    height: 38px;
    border-radius: 11px;
    background: #eef6ec;
    border: 1px solid #d0e4c7;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #06382c;
    flex-shrink: 0;
  }
  .footer-info {
    display: flex;
    flex-direction: column;
  }
  .footer-label {
    font-size: 11px;
    font-weight: 600;
    color: #658375;
  }
  .footer-val {
    font-size: 15px;
    font-weight: 800;
    color: #06382c;
    font-family: 'Plus Jakarta Sans', 'Alexandria', sans-serif;
    direction: ltr;
    display: inline-block;
    unicode-bidi: isolate;
  }
  .footer-val-ar {
    font-size: 13.5px;
    font-weight: 700;
    color: #06382c;
    font-family: 'Alexandria', sans-serif;
  }

  /* Left Side: Doctor Presentation Card */
  .visual-col {
    position: relative;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .doctor-showcase-card {
    position: relative;
    width: 440px;
    height: 520px;
    border-radius: 28px;
    background: #ffffff;
    border: 1.5px solid #dce8d5;
    box-shadow: 
      0 24px 60px -12px rgba(6, 56, 44, 0.12),
      0 4px 16px rgba(6, 56, 44, 0.04);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
  }

  .doctor-photo {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: top center;
    filter: contrast(1.04) brightness(1.02);
  }

  .card-gradient-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, 
      rgba(255, 255, 255, 0) 48%, 
      rgba(255, 255, 255, 0.88) 72%, 
      #ffffff 96%);
    z-index: 2;
  }

  .doctor-badge-inner {
    position: relative;
    z-index: 5;
    padding: 20px 24px 22px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .dr-name-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .dr-name {
    font-size: 23px;
    font-weight: 800;
    color: #06382c;
    letter-spacing: -0.4px;
  }

  .dr-verified {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    background: #eaf3e6;
    border: 1px solid #c8e0be;
    color: #06382c;
    font-size: 11.5px;
    font-weight: 700;
    padding: 3px 9px;
    border-radius: 999px;
  }

  .dr-title {
    font-size: 13.5px;
    font-weight: 600;
    color: #047857;
  }

  .dr-association {
    font-size: 11.5px;
    color: #658375;
    margin-top: 2px;
  }
</style>
</head>
<body>
  <div class="bg-base"></div>
  <div class="bg-glow-right"></div>
  <div class="bg-mesh"></div>

  <div class="canvas-wrapper">
    <!-- Right: Text & Details -->
    <div class="content-col">
      <div class="brand-chip">
        <img src="${brandMark}" class="brand-logo-img" alt="Future Center Logo">
        <span class="brand-chip-text">مركز المستقبل للتغذية العلاجية</span>
        <span class="brand-chip-tag">EMASO</span>
      </div>

      <h1 class="main-title">
        صحتكِ تبدأ بفهمكِ..<br>
        <span class="highlight">ورعايتكِ بخطة على مقاس حياتكِ</span>
      </h1>

      <p class="subtitle">
        بإشراف <strong>د. رنا الشورى</strong> — استشاري التغذية العلاجية وعلاج السمنة ونحت القوام بأحدث البروتوكولات الطبية بدون حرمان.
      </p>

      <div class="pillars-row">
        <div class="pillar-item">
          <span class="pillar-dot"></span>
          <span>أنظمة غذائية تفصيلية 100%</span>
        </div>
        <div class="pillar-item">
          <span class="pillar-dot"></span>
          <span>أحدث أجهزة نحت وتفتيت الدهون</span>
        </div>
        <div class="pillar-item">
          <span class="pillar-dot"></span>
          <span>فحص InBody ومتابعة أسبوعية</span>
        </div>
      </div>

      <div class="footer-strip">
        <div class="footer-item">
          <div class="footer-icon-wrap">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
          </div>
          <div class="footer-info">
            <span class="footer-label">للحجز والاستفسار</span>
            <span class="footer-val">010 4150 4201 · 010 4150 7409</span>
          </div>
        </div>

        <div class="footer-item">
          <div class="footer-icon-wrap">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
          <div class="footer-info">
            <span class="footer-label">مقر العيادة</span>
            <span class="footer-val-ar">كفر الزيات — شارع مستول (أعلى أورانج) — الدور 6</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Left: Doctor Card -->
    <div class="visual-col">
      <div class="doctor-showcase-card">
        <img src="${doctorImg}" class="doctor-photo" alt="د. رنا الشورى">
        <div class="card-gradient-overlay"></div>
        <div class="doctor-badge-inner">
          <div class="dr-name-row">
            <h2 class="dr-name">د. رنا الشورى</h2>
            <span class="dr-verified">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              طبيبة معتمدة
            </span>
          </div>
          <p class="dr-title">استشاري التغذية العلاجية ونحت القوام</p>
          <p class="dr-association">عضو الجمعية المصرية لدراسة السمنة (EMASO)</p>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
`;

// 2. SOCIAL MEDIA SQUARE CARD (1080 x 1080 px) - Clean Light Medical
const htmlCardSquareLight = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Alexandria:wght@300;400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    width: 1080px;
    height: 1080px;
    background: #fbfdfa;
    font-family: 'Alexandria', sans-serif;
    color: #06382c;
    overflow: hidden;
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 54px 58px 48px;
  }

  .bg-base {
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at 50% 15%, #eef6ec 0%, #fbfdfa 60%, #f4f8f2 100%);
    z-index: 1;
  }
  .bg-glow-center {
    position: absolute;
    top: 20%;
    left: 20%;
    width: 650px;
    height: 650px;
    background: radial-gradient(circle, rgba(16, 185, 129, 0.08) 0%, transparent 65%);
    filter: blur(55px);
    z-index: 2;
  }
  .bg-mesh {
    position: absolute;
    inset: 0;
    background-image: radial-gradient(rgba(6, 56, 44, 0.035) 1px, transparent 1px);
    background-size: 28px 28px;
    z-index: 3;
  }

  .card-content {
    position: relative;
    z-index: 10;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .top-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .brand-group {
    display: flex;
    align-items: center;
    gap: 14px;
  }
  .brand-logo-img {
    width: 52px;
    height: 52px;
    object-fit: contain;
  }
  .brand-names {
    display: flex;
    flex-direction: column;
  }
  .b-main {
    font-size: 25px;
    font-weight: 800;
    color: #06382c;
    letter-spacing: -0.5px;
  }
  .b-sub {
    font-size: 13.5px;
    font-weight: 600;
    color: #059669;
  }
  .verified-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: #ffffff;
    border: 1px solid #cce2c4;
    padding: 7px 16px;
    border-radius: 999px;
    font-size: 13px;
    font-weight: 700;
    color: #06382c;
    box-shadow: 0 2px 8px rgba(6, 56, 44, 0.04);
  }

  .center-stage {
    display: grid;
    grid-template-columns: 1.15fr 0.85fr;
    gap: 36px;
    align-items: center;
    margin: 18px 0;
  }
  .center-text {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .badge-supervision {
    font-size: 15px;
    font-weight: 700;
    color: #059669;
    letter-spacing: 0.3px;
  }
  .headline-card {
    font-size: 41px;
    font-weight: 900;
    line-height: 1.22;
    color: #042920;
    letter-spacing: -1px;
  }
  .headline-card span {
    color: #059669;
  }
  .lead-desc {
    font-size: 16px;
    line-height: 1.6;
    color: #3b5b4e;
  }

  .pillars-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-top: 4px;
  }
  .p-item {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 14.5px;
    font-weight: 600;
    color: #06382c;
  }
  .p-icon {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: #eef6ec;
    color: #059669;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 800;
    flex-shrink: 0;
  }

  .doctor-frame {
    position: relative;
    width: 380px;
    height: 480px;
    border-radius: 26px;
    background: #ffffff;
    border: 1.5px solid #dce8d5;
    box-shadow: 0 20px 50px rgba(6, 56, 44, 0.1);
    overflow: hidden;
    margin-right: auto;
  }
  .doctor-frame img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: top center;
    filter: contrast(1.04) brightness(1.02);
  }
  .frame-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, transparent 50%, rgba(255, 255, 255, 0.95) 94%);
  }
  .frame-caption {
    position: absolute;
    bottom: 18px;
    right: 20px;
    left: 20px;
    z-index: 5;
  }
  .fc-name {
    font-size: 20px;
    font-weight: 800;
    color: #06382c;
  }
  .fc-sub {
    font-size: 13px;
    font-weight: 600;
    color: #059669;
  }

  .bottom-info-bar {
    background: #ffffff;
    border: 1.5px solid #dce8d5;
    box-shadow: 0 4px 16px rgba(6, 56, 44, 0.04);
    border-radius: 20px;
    padding: 16px 26px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .bi-block {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .bi-icon {
    width: 38px;
    height: 38px;
    border-radius: 12px;
    background: #eef6ec;
    color: #06382c;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .bi-text {
    display: flex;
    flex-direction: column;
  }
  .bi-label {
    font-size: 11.5px;
    font-weight: 600;
    color: #658375;
  }
  .bi-val {
    font-size: 15px;
    font-weight: 800;
    color: #06382c;
    font-family: 'Plus Jakarta Sans', 'Alexandria', sans-serif;
    direction: ltr;
    display: inline-block;
    unicode-bidi: isolate;
  }
  .bi-val-ar {
    font-size: 13.5px;
    font-weight: 700;
    color: #06382c;
  }
</style>
</head>
<body>
  <div class="bg-base"></div>
  <div class="bg-glow-center"></div>
  <div class="bg-mesh"></div>

  <div class="card-content">
    <div class="top-row">
      <div class="brand-group">
        <img src="${brandMark}" class="brand-logo-img" alt="Logo">
        <div class="brand-names">
          <span class="b-main">مركز المستقبل</span>
          <span class="b-sub">للتغذية العلاجية ونحت القوام</span>
        </div>
      </div>
      <div class="verified-pill">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
        <span>اعتماد الجمعية المصرية EMASO</span>
      </div>
    </div>

    <div class="center-stage">
      <div class="center-text">
        <span class="badge-supervision">بإشراف د. رنا الشورى</span>
        <h1 class="headline-card">
          صحتكِ تبدأ بفهمكِ..<br>
          ورعايتكِ <span>بنتائج حقيقية بدون حرمان</span>
        </h1>
        <p class="lead-desc">
          برامج علاجية متكاملة مصممة خصيصاً لجسمكِ، أسلوب حياتكِ، وهدفكِ الصحي بأحدث المعايير الطبية.
        </p>

        <div class="pillars-list">
          <div class="p-item">
            <span class="p-icon">✓</span>
            <span>أنظمة غذائية تفصيلية 100% لكل حالة</span>
          </div>
          <div class="p-item">
            <span class="p-icon">✓</span>
            <span>أحدث أجهزة الكافيتيشن والفاكيوم ونحت القوام</span>
          </div>
          <div class="p-item">
            <span class="p-icon">✓</span>
            <span>فحص دقيق بجهاز InBody ومتابعة أسبوعية</span>
          </div>
        </div>
      </div>

      <div class="doctor-frame">
        <img src="${doctorImg}" alt="د. رنا الشورى">
        <div class="frame-overlay"></div>
        <div class="frame-caption">
          <h2 class="fc-name">د. رنا الشورى</h2>
          <p class="fc-sub">استشاري التغذية العلاجية ونحت القوام</p>
        </div>
      </div>
    </div>

    <div class="bottom-info-bar">
      <div class="bi-block">
        <div class="bi-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
          </svg>
        </div>
        <div class="bi-text">
          <span class="bi-label">للحجز والتواصل</span>
          <span class="bi-val">010 4150 4201 · 010 4150 7409</span>
        </div>
      </div>

      <div class="bi-block">
        <div class="bi-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
        </div>
        <div class="bi-text">
          <span class="bi-label">مقر العيادة</span>
          <span class="bi-val-ar">كفر الزيات — شارع مستول (أعلى أورانج) — الدور 6</span>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
`;

async function render() {
  const browser = await chromium.launch({ executablePath: chromeSystem, headless: true });

  // 1. Facebook Cover Light (1640 x 624 px @ Retina 2x = 3280 x 1248 px)
  {
    const page = await browser.newPage({ viewport: { width: 1640, height: 624 }, deviceScaleFactor: 2 });
    await page.setContent(htmlCoverLight, { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'Future_Center_Facebook_Cover_Light.png') });
    await page.screenshot({ path: path.join(PUBLIC_DIR, 'assets/facebook_cover_light.png') });
    await page.screenshot({ path: 'E:/Project Work/videos media🔥❤️/Future Center/Future_Center_Facebook_Cover_Light.png' });
    console.log('Saved Future_Center_Facebook_Cover_Light.png');
  }

  // 2. Square Card Light (1080 x 1080 px @ Retina 2x = 2160 x 2160 px)
  {
    const page = await browser.newPage({ viewport: { width: 1080, height: 1080 }, deviceScaleFactor: 2 });
    await page.setContent(htmlCardSquareLight, { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'Future_Center_Social_Card_Square_Light.png') });
    await page.screenshot({ path: path.join(PUBLIC_DIR, 'assets/social_card_square_light.png') });
    await page.screenshot({ path: 'E:/Project Work/videos media🔥❤️/Future Center/Future_Center_Social_Card_Square_Light.png' });
    console.log('Saved Future_Center_Social_Card_Square_Light.png');
  }

  await browser.close();
}

render().catch(err => {
  console.error(err);
  process.exit(1);
});
