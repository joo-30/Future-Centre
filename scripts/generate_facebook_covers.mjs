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

const doctorImgAi = getBase64(path.join(PUBLIC_DIR, 'assets/dr-rana-ai.jpg'), 'image/jpeg');
const brandMark = getBase64(path.join(PUBLIC_DIR, 'assets/brand-mark.png'), 'image/png');

// 1. SIGNATURE DEEP EMERALD LUXURY FACEBOOK COVER (1640 x 624)
const htmlCoverEmerald = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Alexandria:wght@300;400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    width: 1640px; height: 624px;
    background: #051b14;
    font-family: 'Alexandria', sans-serif;
    color: #ffffff;
    overflow: hidden;
    position: relative;
    display: flex; align-items: center;
  }
  .bg-base {
    position: absolute; inset: 0;
    background: radial-gradient(circle at 75% 20%, #114233 0%, #08291e 50%, #03140e 100%);
    z-index: 1;
  }
  .bg-glow-right {
    position: absolute; right: 8%; top: -20%;
    width: 650px; height: 650px;
    background: radial-gradient(circle, rgba(16, 185, 129, 0.16) 0%, transparent 65%);
    filter: blur(40px); z-index: 2;
  }
  .bg-glow-left {
    position: absolute; left: 8%; bottom: -15%;
    width: 550px; height: 550px;
    background: radial-gradient(circle, rgba(52, 211, 153, 0.12) 0%, transparent 70%);
    filter: blur(50px); z-index: 2;
  }
  .bg-mesh {
    position: absolute; inset: 0;
    background-image: radial-gradient(rgba(255, 255, 255, 0.045) 1px, transparent 1px);
    background-size: 30px 30px;
    opacity: 0.6; z-index: 3;
  }
  .canvas-wrapper {
    position: relative; z-index: 10;
    width: 100%; height: 100%;
    display: grid; grid-template-columns: 1.15fr 0.85fr;
    padding: 38px 84px 36px;
    align-items: center;
  }
  .content-col {
    display: flex; flex-direction: column; justify-content: center;
    gap: 15px; padding-left: 24px;
  }
  .brand-chip {
    display: inline-flex; align-items: center; gap: 12px;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.12);
    backdrop-filter: blur(12px);
    padding: 6px 18px 6px 8px; border-radius: 999px;
    width: fit-content;
  }
  .brand-logo-img {
    width: 32px; height: 32px; object-fit: contain;
    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
  }
  .brand-chip-text { font-size: 14px; font-weight: 600; color: #e2f2e9; }
  .brand-chip-tag {
    background: #10b981; color: #04261c;
    font-size: 11px; font-weight: 800;
    padding: 3px 10px; border-radius: 999px; margin-right: 4px;
  }
  .main-title {
    font-size: 47px; font-weight: 900; line-height: 1.15;
    color: #ffffff; letter-spacing: -1.2px;
  }
  .main-title .highlight {
    background: linear-gradient(135deg, #6ee7b7 0%, #34d399 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  }
  .subtitle {
    font-size: 18px; font-weight: 500; color: #c2dcd1;
    line-height: 1.5; max-width: 720px;
  }
  .pillars-row { display: flex; align-items: center; gap: 12px; margin-top: 2px; }
  .pillar-item {
    display: flex; align-items: center; gap: 8px;
    background: rgba(14, 58, 44, 0.65);
    border: 1px solid rgba(52, 211, 153, 0.22);
    padding: 8px 16px; border-radius: 12px;
    font-size: 13.5px; font-weight: 600; color: #f0fdf4;
    backdrop-filter: blur(8px);
  }
  .pillar-dot {
    width: 7px; height: 7px; border-radius: 50%;
    background: #34d399; box-shadow: 0 0 8px #34d399;
  }
  .footer-strip {
    display: flex; align-items: center; gap: 22px;
    margin-top: 8px; padding-top: 16px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }
  .footer-item { display: flex; align-items: center; gap: 10px; }
  .footer-icon-wrap {
    width: 36px; height: 36px; border-radius: 10px;
    background: rgba(16, 185, 129, 0.15);
    border: 1px solid rgba(52, 211, 153, 0.3);
    display: flex; align-items: center; justify-content: center;
    color: #34d399; flex-shrink: 0;
  }
  .footer-info { display: flex; flex-direction: column; }
  .footer-label { font-size: 11px; font-weight: 500; color: #94b8a8; }
  .footer-val {
    font-size: 14.5px; font-weight: 700; color: #ffffff;
    font-family: 'Plus Jakarta Sans', 'Alexandria', sans-serif;
    direction: ltr; display: inline-block; unicode-bidi: isolate;
  }
  .footer-val-ar { font-size: 13px; font-weight: 600; color: #ffffff; }

  .visual-col {
    position: relative; height: 100%;
    display: flex; align-items: center; justify-content: center;
  }
  .doctor-showcase-card {
    position: relative; width: 440px; height: 520px;
    border-radius: 28px;
    background: linear-gradient(170deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.03) 100%);
    border: 1.5px solid rgba(255, 255, 255, 0.18);
    box-shadow: 0 24px 60px -12px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(52, 211, 153, 0.15) inset;
    backdrop-filter: blur(20px);
    overflow: hidden; display: flex; flex-direction: column; justify-content: flex-end;
  }
  .doctor-photo {
    position: absolute; top: 0; left: 0; width: 100%; height: 100%;
    object-fit: cover; object-position: top center;
    filter: contrast(1.03) brightness(1.02);
  }
  .card-gradient-overlay {
    position: absolute; inset: 0;
    background: linear-gradient(180deg, rgba(6, 30, 23, 0) 42%, rgba(6, 30, 23, 0.78) 72%, rgba(4, 20, 15, 0.96) 96%);
    z-index: 2;
  }
  .doctor-badge-inner {
    position: relative; z-index: 5;
    padding: 18px 24px 20px;
    display: flex; flex-direction: column; gap: 4px;
  }
  .dr-name-row { display: flex; align-items: center; justify-content: space-between; }
  .dr-name { font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: -0.4px; }
  .dr-verified {
    display: inline-flex; align-items: center; gap: 5px;
    background: rgba(16, 185, 129, 0.2);
    border: 1px solid rgba(52, 211, 153, 0.4);
    color: #6ee7b7; font-size: 11.5px; font-weight: 700;
    padding: 3px 9px; border-radius: 999px;
  }
  .dr-title { font-size: 13px; font-weight: 500; color: #d1fae5; }
  .dr-association { font-size: 11.5px; color: #94b8a8; margin-top: 2px; }
  .floating-stat-pill {
    position: absolute; top: 32px; right: -14px; z-index: 6;
    background: rgba(6, 30, 23, 0.88);
    border: 1px solid rgba(52, 211, 153, 0.35);
    backdrop-filter: blur(14px);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.4);
    border-radius: 16px; padding: 10px 16px;
    display: flex; align-items: center; gap: 10px;
  }
  .stat-icon {
    width: 32px; height: 32px; border-radius: 10px;
    background: #10b981; color: #032219;
    display: flex; align-items: center; justify-content: center;
  }
  .stat-text { display: flex; flex-direction: column; }
  .stat-num { font-size: 15px; font-weight: 800; color: #ffffff; font-family: 'Plus Jakarta Sans', sans-serif; }
  .stat-label { font-size: 10.5px; font-weight: 500; color: #a7f3d0; }
</style>
</head>
<body>
  <div class="bg-base"></div>
  <div class="bg-glow-right"></div>
  <div class="bg-glow-left"></div>
  <div class="bg-mesh"></div>

  <div class="canvas-wrapper">
    <div class="content-col">
      <div class="brand-chip">
        <img src="${brandMark}" class="brand-logo-img" alt="Future Center Logo">
        <span class="brand-chip-text">مركز المستقبل للتغذية العلاجية</span>
        <span class="brand-chip-tag">EMASO</span>
      </div>

      <h1 class="main-title">
        صحتك تبدأ بفهمك..<br>
        <span class="highlight">ورعايتك بخطة على مقاس حياتك</span>
      </h1>

      <p class="subtitle">
        عيادة متخصصة في علاج السمنة والنحافة ونحت القوام بأحدث البروتوكولات الطبية بدون حرمان.
      </p>

      <div class="pillars-row">
        <div class="pillar-item">
          <span class="pillar-dot"></span>
          <span>أنظمة غذائية تفصيلية 100%</span>
        </div>
        <div class="pillar-item">
          <span class="pillar-dot"></span>
          <span>نحت وتفتيت الدهون بأحدث الأجهزة</span>
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

        <div class="footer-item">
          <div class="footer-icon-wrap">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/>
              <path d="M2 12h20"/>
            </svg>
          </div>
          <div class="footer-info">
            <span class="footer-label">المنصة الطبية</span>
            <span class="footer-val">futurecenter.com</span>
          </div>
        </div>
      </div>
    </div>

    <div class="visual-col">
      <div class="doctor-showcase-card">
        <img src="${doctorImgAi}" class="doctor-photo" alt="د. رنا ياسر الشورة">
        <div class="card-gradient-overlay"></div>
        <div class="doctor-badge-inner">
          <div class="dr-name-row">
            <h2 class="dr-name">د. رنا ياسر الشورة</h2>
            <span class="dr-verified">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              معتمدة
            </span>
          </div>
          <p class="dr-title">استشاري التغذية العلاجية ونحت القوام</p>
          <p class="dr-association">عضو الجمعية المصرية لدراسة السمنة (EMASO)</p>
        </div>
      </div>

      <div class="floating-stat-pill">
        <div class="stat-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
        </div>
        <div class="stat-text">
          <span class="stat-num">+5,000</span>
          <span class="stat-label">حالة ناجحة ومتابعة</span>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
`;

// 2. MINIMAL TECH LIGHT MEDICAL FACEBOOK COVER (1640 x 624)
const htmlCoverLight = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Alexandria:wght@300;400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    width: 1640px; height: 624px;
    background: #f8faf6;
    font-family: 'Alexandria', sans-serif;
    color: #0f2c22;
    overflow: hidden;
    position: relative;
    display: flex; align-items: center;
  }
  .bg-base {
    position: absolute; inset: 0;
    background: radial-gradient(circle at 80% 20%, #eef5eb 0%, #f8faf6 60%, #f2f7ef 100%);
    z-index: 1;
  }
  .bg-circle-acc {
    position: absolute; right: -100px; top: -100px;
    width: 500px; height: 500px;
    background: radial-gradient(circle, rgba(16, 185, 129, 0.08) 0%, transparent 70%);
    border-radius: 50%; z-index: 2;
  }
  .bg-mesh {
    position: absolute; inset: 0;
    background-image: radial-gradient(rgba(12, 51, 40, 0.04) 1px, transparent 1px);
    background-size: 28px 28px; z-index: 3;
  }
  .canvas-wrapper {
    position: relative; z-index: 10;
    width: 100%; height: 100%;
    display: grid; grid-template-columns: 1.15fr 0.85fr;
    padding: 38px 84px 36px;
    align-items: center;
  }
  .content-col {
    display: flex; flex-direction: column; justify-content: center;
    gap: 15px; padding-left: 24px;
  }
  .brand-chip {
    display: inline-flex; align-items: center; gap: 12px;
    background: #ffffff;
    border: 1px solid #dce8d5;
    box-shadow: 0 4px 14px rgba(12, 51, 40, 0.04);
    padding: 6px 18px 6px 8px; border-radius: 999px;
    width: fit-content;
  }
  .brand-logo-img { width: 32px; height: 32px; object-fit: contain; }
  .brand-chip-text { font-size: 14px; font-weight: 700; color: #0c3328; }
  .brand-chip-tag {
    background: #0c3328; color: #ffffff;
    font-size: 11px; font-weight: 800;
    padding: 3px 10px; border-radius: 999px; margin-right: 4px;
  }
  .main-title {
    font-size: 47px; font-weight: 900; line-height: 1.15;
    color: #06231b; letter-spacing: -1.2px;
  }
  .main-title .highlight { color: #059669; }
  .subtitle {
    font-size: 18px; font-weight: 500; color: #3b5b4e;
    line-height: 1.5; max-width: 720px;
  }
  .pillars-row { display: flex; align-items: center; gap: 12px; margin-top: 2px; }
  .pillar-item {
    display: flex; align-items: center; gap: 8px;
    background: #ffffff; border: 1px solid #dce8d5;
    padding: 8px 16px; border-radius: 12px;
    font-size: 13.5px; font-weight: 600; color: #0c3328;
    box-shadow: 0 2px 8px rgba(12, 51, 40, 0.03);
  }
  .pillar-dot { width: 7px; height: 7px; border-radius: 50%; background: #059669; }
  .footer-strip {
    display: flex; align-items: center; gap: 22px;
    margin-top: 8px; padding-top: 16px; border-top: 1px solid #dce8d5;
  }
  .footer-item { display: flex; align-items: center; gap: 10px; }
  .footer-icon-wrap {
    width: 36px; height: 36px; border-radius: 10px;
    background: #eaf3e6; border: 1px solid #d0e4c7;
    display: flex; align-items: center; justify-content: center;
    color: #0c3328; flex-shrink: 0;
  }
  .footer-info { display: flex; flex-direction: column; }
  .footer-label { font-size: 11px; font-weight: 600; color: #658375; }
  .footer-val {
    font-size: 14.5px; font-weight: 800; color: #0c3328;
    font-family: 'Plus Jakarta Sans', 'Alexandria', sans-serif;
    direction: ltr; display: inline-block; unicode-bidi: isolate;
  }
  .footer-val-ar { font-size: 13px; font-weight: 700; color: #0c3328; }

  .visual-col {
    position: relative; height: 100%;
    display: flex; align-items: center; justify-content: center;
  }
  .doctor-showcase-card {
    position: relative; width: 440px; height: 520px;
    border-radius: 28px; background: #ffffff;
    border: 1px solid #dce8d5;
    box-shadow: 0 24px 60px -12px rgba(12, 51, 40, 0.12), 0 2px 8px rgba(12, 51, 40, 0.04);
    overflow: hidden; display: flex; flex-direction: column; justify-content: flex-end;
  }
  .doctor-photo {
    position: absolute; top: 0; left: 0; width: 100%; height: 100%;
    object-fit: cover; object-position: top center;
  }
  .card-gradient-overlay {
    position: absolute; inset: 0;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0) 45%, rgba(255, 255, 255, 0.8) 72%, #ffffff 95%);
    z-index: 2;
  }
  .doctor-badge-inner {
    position: relative; z-index: 5;
    padding: 18px 24px 20px;
    display: flex; flex-direction: column; gap: 4px;
  }
  .dr-name-row { display: flex; align-items: center; justify-content: space-between; }
  .dr-name { font-size: 22px; font-weight: 800; color: #06231b; letter-spacing: -0.4px; }
  .dr-verified {
    display: inline-flex; align-items: center; gap: 5px;
    background: #eaf3e6; border: 1px solid #c8e0be;
    color: #0c3328; font-size: 11.5px; font-weight: 700;
    padding: 3px 9px; border-radius: 999px;
  }
  .dr-title { font-size: 13px; font-weight: 600; color: #047857; }
  .dr-association { font-size: 11.5px; color: #658375; margin-top: 2px; }
  .floating-stat-pill {
    position: absolute; top: 32px; right: -14px; z-index: 6;
    background: #0c3328; border: 1px solid #164e3f;
    box-shadow: 0 14px 32px rgba(6, 35, 27, 0.25);
    border-radius: 16px; padding: 10px 16px;
    display: flex; align-items: center; gap: 10px; color: #ffffff;
  }
  .stat-icon {
    width: 32px; height: 32px; border-radius: 10px;
    background: #34d399; color: #032219;
    display: flex; align-items: center; justify-content: center;
  }
  .stat-text { display: flex; flex-direction: column; }
  .stat-num { font-size: 15px; font-weight: 800; color: #ffffff; font-family: 'Plus Jakarta Sans', sans-serif; }
  .stat-label { font-size: 10.5px; font-weight: 500; color: #a7f3d0; }
</style>
</head>
<body>
  <div class="bg-base"></div>
  <div class="bg-circle-acc"></div>
  <div class="bg-mesh"></div>

  <div class="canvas-wrapper">
    <div class="content-col">
      <div class="brand-chip">
        <img src="${brandMark}" class="brand-logo-img" alt="Future Center Logo">
        <span class="brand-chip-text">مركز المستقبل للتغذية العلاجية</span>
        <span class="brand-chip-tag">EMASO</span>
      </div>

      <h1 class="main-title">
        صحتك تبدأ بفهمك..<br>
        <span class="highlight">ورعايتك بخطة على مقاس حياتك</span>
      </h1>

      <p class="subtitle">
        عيادة متخصصة في علاج السمنة والنحافة ونحت القوام بأحدث البروتوكولات الطبية بدون حرمان.
      </p>

      <div class="pillars-row">
        <div class="pillar-item">
          <span class="pillar-dot"></span>
          <span>أنظمة غذائية تفصيلية 100%</span>
        </div>
        <div class="pillar-item">
          <span class="pillar-dot"></span>
          <span>نحت وتفتيت الدهون بأحدث الأجهزة</span>
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

        <div class="footer-item">
          <div class="footer-icon-wrap">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/>
              <path d="M2 12h20"/>
            </svg>
          </div>
          <div class="footer-info">
            <span class="footer-label">المنصة الطبية</span>
            <span class="footer-val">futurecenter.com</span>
          </div>
        </div>
      </div>
    </div>

    <div class="visual-col">
      <div class="doctor-showcase-card">
        <img src="${doctorImgAi}" class="doctor-photo" alt="د. رنا ياسر الشورة">
        <div class="card-gradient-overlay"></div>
        <div class="doctor-badge-inner">
          <div class="dr-name-row">
            <h2 class="dr-name">د. رنا ياسر الشورة</h2>
            <span class="dr-verified">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              معتمدة
            </span>
          </div>
          <p class="dr-title">استشاري التغذية العلاجية ونحت القوام</p>
          <p class="dr-association">عضو الجمعية المصرية لدراسة السمنة (EMASO)</p>
        </div>
      </div>

      <div class="floating-stat-pill">
        <div class="stat-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
        </div>
        <div class="stat-text">
          <span class="stat-num">+5,000</span>
          <span class="stat-label">حالة ناجحة ومتابعة</span>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
`;

// 3. SOCIAL MEDIA ANNOUNCEMENT SQUARE CARD - DARK EMERALD (1080 x 1080)
const htmlCardSquareDark = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Alexandria:wght@300;400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    width: 1080px; height: 1080px;
    background: #041a13;
    font-family: 'Alexandria', sans-serif;
    color: #ffffff;
    overflow: hidden;
    position: relative;
    display: flex; flex-direction: column; justify-content: space-between;
    padding: 52px 56px 46px;
  }
  .bg-base {
    position: absolute; inset: 0;
    background: radial-gradient(circle at 50% 10%, #104233 0%, #062219 50%, #03140e 100%);
    z-index: 1;
  }
  .bg-glow-center {
    position: absolute; top: 25%; left: 20%;
    width: 600px; height: 600px;
    background: radial-gradient(circle, rgba(16, 185, 129, 0.16) 0%, transparent 65%);
    filter: blur(50px); z-index: 2;
  }
  .bg-mesh {
    position: absolute; inset: 0;
    background-image: radial-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px);
    background-size: 28px 28px; z-index: 3;
  }
  .card-content {
    position: relative; z-index: 10; height: 100%;
    display: flex; flex-direction: column; justify-content: space-between;
  }
  .top-row { display: flex; align-items: center; justify-content: space-between; }
  .brand-group { display: flex; align-items: center; gap: 14px; }
  .brand-logo-img {
    width: 52px; height: 52px; object-fit: contain;
    filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));
  }
  .brand-names { display: flex; flex-direction: column; }
  .b-main { font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; }
  .b-sub { font-size: 13.5px; font-weight: 500; color: #a7f3d0; }
  .verified-pill {
    display: inline-flex; align-items: center; gap: 6px;
    background: rgba(16, 185, 129, 0.15);
    border: 1px solid rgba(52, 211, 153, 0.35);
    padding: 7px 16px; border-radius: 999px;
    font-size: 13px; font-weight: 700; color: #6ee7b7;
  }
  .center-stage {
    display: grid; grid-template-columns: 1.15fr 0.85fr;
    gap: 36px; align-items: center; margin: 18px 0;
  }
  .center-text { display: flex; flex-direction: column; gap: 15px; }
  .badge-supervision { font-size: 15px; font-weight: 700; color: #34d399; letter-spacing: 0.3px; }
  .headline-card {
    font-size: 41px; font-weight: 900; line-height: 1.2;
    color: #ffffff; letter-spacing: -1px;
  }
  .headline-card span { color: #6ee7b7; }
  .lead-desc { font-size: 16px; line-height: 1.6; color: #c2dcd1; }
  .pillars-list { display: flex; flex-direction: column; gap: 10px; margin-top: 6px; }
  .p-item { display: flex; align-items: center; gap: 10px; font-size: 14.5px; font-weight: 600; color: #f0fdf4; }
  .p-icon {
    width: 22px; height: 22px; border-radius: 50%;
    background: rgba(52, 211, 153, 0.2); color: #34d399;
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; font-weight: 800; flex-shrink: 0;
  }
  .doctor-frame {
    position: relative; width: 380px; height: 480px;
    border-radius: 26px;
    background: linear-gradient(170deg, rgba(255,255,255,0.12), rgba(255,255,255,0.02));
    border: 1.5px solid rgba(255, 255, 255, 0.16);
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
    overflow: hidden; margin-right: auto;
  }
  .doctor-frame img { width: 100%; height: 100%; object-fit: cover; object-position: top center; }
  .frame-overlay {
    position: absolute; inset: 0;
    background: linear-gradient(180deg, transparent 50%, rgba(4, 20, 15, 0.95) 95%);
  }
  .frame-caption { position: absolute; bottom: 18px; right: 20px; left: 20px; z-index: 5; }
  .fc-name { font-size: 19px; font-weight: 800; color: #ffffff; }
  .fc-sub { font-size: 12.5px; font-weight: 500; color: #a7f3d0; }

  .bottom-info-bar {
    background: rgba(14, 58, 44, 0.65);
    border: 1px solid rgba(52, 211, 153, 0.22);
    backdrop-filter: blur(12px);
    border-radius: 20px; padding: 16px 26px;
    display: flex; align-items: center; justify-content: space-between;
  }
  .bi-block { display: flex; align-items: center; gap: 12px; }
  .bi-icon {
    width: 38px; height: 38px; border-radius: 12px;
    background: rgba(16, 185, 129, 0.2); color: #34d399;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .bi-text { display: flex; flex-direction: column; }
  .bi-label { font-size: 11.5px; font-weight: 500; color: #94b8a8; }
  .bi-val {
    font-size: 15px; font-weight: 800; color: #ffffff;
    font-family: 'Plus Jakarta Sans', 'Alexandria', sans-serif;
    direction: ltr; display: inline-block; unicode-bidi: isolate;
  }
  .bi-val-ar { font-size: 13.5px; font-weight: 600; color: #ffffff; }
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
        <span class="badge-supervision">بإشراف د. رنا ياسر الشورة</span>
        <h1 class="headline-card">
          صحتك تبدأ بفهمك..<br>
          ورعايتك <span>بنتائج حقيقية بدون حرمان</span>
        </h1>
        <p class="lead-desc">
          برامج علاجية متكاملة مصممة خصيصاً لجسمك، أسلوب حياتك، وهدفك الصحي بأحدث المعايير الطبية.
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
        <img src="${doctorImgAi}" alt="د. رنا الشورة">
        <div class="frame-overlay"></div>
        <div class="frame-caption">
          <h2 class="fc-name">د. رنا ياسر الشورة</h2>
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

      <div class="bi-block">
        <div class="bi-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/>
            <path d="M2 12h20"/>
          </svg>
        </div>
        <div class="bi-text">
          <span class="bi-label">المنصة الإلكترونية</span>
          <span class="bi-val">futurecenter.com</span>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
`;

// 4. SOCIAL MEDIA ANNOUNCEMENT SQUARE CARD - CLEAN LIGHT (1080 x 1080)
const htmlCardSquareLight = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Alexandria:wght@300;400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    width: 1080px; height: 1080px;
    background: #f8faf6;
    font-family: 'Alexandria', sans-serif;
    color: #0c3328;
    overflow: hidden;
    position: relative;
    display: flex; flex-direction: column; justify-content: space-between;
    padding: 52px 56px 46px;
  }
  .bg-base {
    position: absolute; inset: 0;
    background: radial-gradient(circle at 50% 10%, #eef5eb 0%, #f8faf6 60%, #f2f7ef 100%);
    z-index: 1;
  }
  .bg-glow-center {
    position: absolute; top: 20%; left: 20%;
    width: 600px; height: 600px;
    background: radial-gradient(circle, rgba(16, 185, 129, 0.08) 0%, transparent 65%);
    filter: blur(50px); z-index: 2;
  }
  .bg-mesh {
    position: absolute; inset: 0;
    background-image: radial-gradient(rgba(12, 51, 40, 0.04) 1px, transparent 1px);
    background-size: 28px 28px; z-index: 3;
  }
  .card-content {
    position: relative; z-index: 10; height: 100%;
    display: flex; flex-direction: column; justify-content: space-between;
  }
  .top-row { display: flex; align-items: center; justify-content: space-between; }
  .brand-group { display: flex; align-items: center; gap: 14px; }
  .brand-logo-img { width: 52px; height: 52px; object-fit: contain; }
  .brand-names { display: flex; flex-direction: column; }
  .b-main { font-size: 24px; font-weight: 800; color: #0c3328; letter-spacing: -0.5px; }
  .b-sub { font-size: 13.5px; font-weight: 600; color: #059669; }
  .verified-pill {
    display: inline-flex; align-items: center; gap: 6px;
    background: #eaf3e6; border: 1px solid #cce2c4;
    padding: 7px 16px; border-radius: 999px;
    font-size: 13px; font-weight: 700; color: #0c3328;
  }
  .center-stage {
    display: grid; grid-template-columns: 1.15fr 0.85fr;
    gap: 36px; align-items: center; margin: 18px 0;
  }
  .center-text { display: flex; flex-direction: column; gap: 15px; }
  .badge-supervision { font-size: 15px; font-weight: 700; color: #059669; letter-spacing: 0.3px; }
  .headline-card {
    font-size: 41px; font-weight: 900; line-height: 1.2;
    color: #06231b; letter-spacing: -1px;
  }
  .headline-card span { color: #059669; }
  .lead-desc { font-size: 16px; line-height: 1.6; color: #3b5b4e; }
  .pillars-list { display: flex; flex-direction: column; gap: 10px; margin-top: 6px; }
  .p-item { display: flex; align-items: center; gap: 10px; font-size: 14.5px; font-weight: 600; color: #0c3328; }
  .p-icon {
    width: 22px; height: 22px; border-radius: 50%;
    background: #eaf3e6; color: #059669;
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; font-weight: 800; flex-shrink: 0;
  }
  .doctor-frame {
    position: relative; width: 380px; height: 480px;
    border-radius: 26px; background: #ffffff;
    border: 1px solid #dce8d5;
    box-shadow: 0 20px 50px rgba(12, 51, 40, 0.1);
    overflow: hidden; margin-right: auto;
  }
  .doctor-frame img { width: 100%; height: 100%; object-fit: cover; object-position: top center; }
  .frame-overlay {
    position: absolute; inset: 0;
    background: linear-gradient(180deg, transparent 50%, rgba(255, 255, 255, 0.95) 95%);
  }
  .frame-caption { position: absolute; bottom: 18px; right: 20px; left: 20px; z-index: 5; }
  .fc-name { font-size: 19px; font-weight: 800; color: #06231b; }
  .fc-sub { font-size: 12.5px; font-weight: 600; color: #059669; }

  .bottom-info-bar {
    background: #ffffff; border: 1px solid #dce8d5;
    box-shadow: 0 4px 16px rgba(12, 51, 40, 0.04);
    border-radius: 20px; padding: 16px 26px;
    display: flex; align-items: center; justify-content: space-between;
  }
  .bi-block { display: flex; align-items: center; gap: 12px; }
  .bi-icon {
    width: 38px; height: 38px; border-radius: 12px;
    background: #eaf3e6; color: #0c3328;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .bi-text { display: flex; flex-direction: column; }
  .bi-label { font-size: 11.5px; font-weight: 600; color: #658375; }
  .bi-val {
    font-size: 15px; font-weight: 800; color: #0c3328;
    font-family: 'Plus Jakarta Sans', 'Alexandria', sans-serif;
    direction: ltr; display: inline-block; unicode-bidi: isolate;
  }
  .bi-val-ar { font-size: 13.5px; font-weight: 700; color: #0c3328; }
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
        <span class="badge-supervision">بإشراف د. رنا ياسر الشورة</span>
        <h1 class="headline-card">
          صحتك تبدأ بفهمك..<br>
          ورعايتك <span>بنتائج حقيقية بدون حرمان</span>
        </h1>
        <p class="lead-desc">
          برامج علاجية متكاملة مصممة خصيصاً لجسمك، أسلوب حياتك، وهدفك الصحي بأحدث المعايير الطبية.
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
        <img src="${doctorImgAi}" alt="د. رنا الشورة">
        <div class="frame-overlay"></div>
        <div class="frame-caption">
          <h2 class="fc-name">د. رنا ياسر الشورة</h2>
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

      <div class="bi-block">
        <div class="bi-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/>
            <path d="M2 12h20"/>
          </svg>
        </div>
        <div class="bi-text">
          <span class="bi-label">المنصة الإلكترونية</span>
          <span class="bi-val">futurecenter.com</span>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
`;

async function render() {
  const browser = await chromium.launch({ executablePath: chromeSystem, headless: true });

  // 1. Emerald Cover
  {
    const page = await browser.newPage({ viewport: { width: 1640, height: 624 }, deviceScaleFactor: 2 });
    await page.setContent(htmlCoverEmerald, { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'Future_Center_Facebook_Cover_Emerald.png') });
    await page.screenshot({ path: path.join(PUBLIC_DIR, 'assets/facebook_cover_emerald.png') });
    await page.screenshot({ path: 'E:/Project Work/videos media🔥❤️/Future Center/Future_Center_Facebook_Cover_Emerald.png' });
    console.log('Saved Future_Center_Facebook_Cover_Emerald.png');
  }

  // 2. Light Cover
  {
    const page = await browser.newPage({ viewport: { width: 1640, height: 624 }, deviceScaleFactor: 2 });
    await page.setContent(htmlCoverLight, { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'Future_Center_Facebook_Cover_Light.png') });
    await page.screenshot({ path: path.join(PUBLIC_DIR, 'assets/facebook_cover_light.png') });
    await page.screenshot({ path: 'E:/Project Work/videos media🔥❤️/Future Center/Future_Center_Facebook_Cover_Light.png' });
    console.log('Saved Future_Center_Facebook_Cover_Light.png');
  }

  // 3. Dark Square Card
  {
    const page = await browser.newPage({ viewport: { width: 1080, height: 1080 }, deviceScaleFactor: 2 });
    await page.setContent(htmlCardSquareDark, { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'Future_Center_Social_Card_Square_Dark.png') });
    await page.screenshot({ path: path.join(PUBLIC_DIR, 'assets/social_card_square_dark.png') });
    await page.screenshot({ path: 'E:/Project Work/videos media🔥❤️/Future Center/Future_Center_Social_Card_Square_Dark.png' });
    console.log('Saved Future_Center_Social_Card_Square_Dark.png');
  }

  // 4. Light Square Card
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
