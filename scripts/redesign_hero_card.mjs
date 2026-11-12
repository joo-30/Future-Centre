import fs from 'fs';

// 1. Update Home.tsx
const homeFile = 'Future-Centre/client/src/features/home/Home.tsx';
let home = fs.readFileSync(homeFile, 'utf8').replace(/\r\n/g, '\n');

const oldHeroCode = `<div className="hero-doctor-showcase" aria-label="بطاقة إشراف د. رنا ياسر الشورة">
            <div className="hds-glow-layer" />
            <div className="hds-card">
              <img
                src="/assets/dr-rana.jpg"
                alt="د. رنا ياسر الشورة - استشاري التغذية العلاجية ونحت القوام"
                className="hds-photo"
                width="1200"
                height="1500"
                fetchPriority="high"
              />
              <div className="hds-overlay" />

              <div className="hds-details">
                <div className="hds-name-row">
                  <h2 className="hds-name">د. رنا ياسر الشورة</h2>
                  <span className="hds-verified">
                    <ShieldCheck size={13} />
                    <span>معتمدة</span>
                  </span>
                </div>
                <p className="hds-title">استشاري التغذية العلاجية ونحت القوام</p>
                <p className="hds-association">عضو الجمعية المصرية لدراسة السمنة (EMASO)</p>
              </div>
            </div>

            {/* Floating Live Metric Pill 1: Cases */}
            <div className="hds-floating-stat stat-cases">
              <div className="hds-stat-icon">
                <Activity size={16} />
              </div>
              <div className="hds-stat-info">
                <div className="hds-stat-row">
                  <span className="hds-stat-num">+5,000</span>
                  <span className="hds-pulse-dot" />
                </div>
                <span className="hds-stat-label">حالة ومتابعة ناجحة</span>
              </div>
            </div>

            {/* Floating Live Metric Pill 2: InBody & Precision */}
            <div className="hds-floating-stat stat-inbody">
              <div className="hds-stat-icon icon-inbody">
                <Award size={16} />
              </div>
              <div className="hds-stat-info">
                <span className="hds-stat-num">InBody 770</span>
                <span className="hds-stat-label">فحص سريري دقيق</span>
              </div>
            </div>
          </div>`;

const newHeroCode = `<div className="hero-doctor-showcase" aria-label="بطاقة إشراف د. رنا ياسر الشورى">
            <div className="hds-glow-layer" />
            <div className="hds-card">
              {/* Top Verified Badges Bar */}
              <div className="hds-top-bar">
                <span className="hds-badge-verified">
                  <ShieldCheck size={14} />
                  <span>طبيبة معتمدة · EMASO</span>
                </span>
                <span className="hds-badge-pulse">
                  <span className="hds-pulse-dot" />
                  <span>العيادة متاحة للمتابعة</span>
                </span>
              </div>

              <img
                src="/assets/dr-rana.jpg"
                alt="د. رنا ياسر الشورى - استشاري التغذية العلاجية ونحت القوام"
                className="hds-photo"
                width="1200"
                height="1500"
                fetchPriority="high"
              />
              <div className="hds-overlay" />

              {/* Bottom Information Panel */}
              <div className="hds-details">
                <div className="hds-identity">
                  <h2 className="hds-name">د. رنا ياسر الشورى</h2>
                  <p className="hds-title">استشاري التغذية العلاجية ونحت القوام</p>
                  <p className="hds-association">عضو الجمعية المصرية لدراسة السمنة (EMASO)</p>
                </div>

                {/* Built-in Metrics Strip (Zero Collisions) */}
                <div className="hds-stats-strip">
                  <div className="hds-stat-box">
                    <span className="hds-stat-val">+5,000</span>
                    <span className="hds-stat-txt">حالة ناجحة</span>
                  </div>
                  <div className="hds-stat-divider" />
                  <div className="hds-stat-box">
                    <span className="hds-stat-val">InBody</span>
                    <span className="hds-stat-txt">فحص سريري</span>
                  </div>
                  <div className="hds-stat-divider" />
                  <div className="hds-stat-box">
                    <span className="hds-stat-val">100%</span>
                    <span className="hds-stat-txt">خطط مخصصة</span>
                  </div>
                </div>
              </div>
            </div>
          </div>`;

if (home.includes(oldHeroCode)) {
  home = home.replace(oldHeroCode, newHeroCode);
  console.log('Replaced hero-doctor-showcase in Home.tsx');
} else {
  console.log('Target hero code not found directly in Home.tsx, searching for wrapper');
  const regex = /<div className="hero-doctor-showcase"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/;
  home = home.replace(regex, newHeroCode);
}

// Normalize all occurrences of doctor name to الشورى (بالألف اللينة ى)
home = home.replaceAll('د. رنا ياسر الشورة', 'د. رنا ياسر الشورى');
home = home.replaceAll('د. رنا الشورة', 'د. رنا الشورى');
home = home.replaceAll('د. رنا ياسر الشوري', 'د. رنا ياسر الشورى');
home = home.replaceAll('د. رنا الشوري', 'د. رنا الشورى');

fs.writeFileSync(homeFile, home.replace(/\n/g, '\r\n'), 'utf8');
console.log('Saved Home.tsx with zero-collision hero and د. رنا ياسر الشورى');

// 2. Update home.css for the new integrated card styles
const cssFile = 'Future-Centre/client/src/styles/reference/home.css';
let css = fs.readFileSync(cssFile, 'utf8').replace(/\r\n/g, '\n');

// Replace the previous hero-doctor-showcase CSS block
const cssMarker = '/* ==========================================================================\n   HERO DOCTOR SHOWCASE (UI/UX Pro Max Edition)';
if (css.includes(cssMarker)) {
  css = css.substring(0, css.indexOf(cssMarker));
}

const updatedHeroCss = `
/* ==========================================================================
   HERO DOCTOR SHOWCASE (UI/UX Pro Max Edition - Zero Collisions)
   ========================================================================== */
.hero-doctor-showcase {
  position: relative;
  height: 570px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: -30px;
}

.hds-glow-layer {
  position: absolute;
  inset: 10% 8%;
  background: radial-gradient(circle, rgba(16, 185, 129, 0.18) 0%, transparent 68%);
  filter: blur(48px);
  z-index: 1;
  pointer-events: none;
}

.hds-card {
  position: relative;
  z-index: 2;
  width: 430px;
  height: 540px;
  border-radius: 28px;
  background: #ffffff;
  border: 1.5px solid rgba(7, 63, 51, 0.12);
  box-shadow: 
    0 24px 60px -12px rgba(7, 63, 51, 0.12),
    0 4px 16px rgba(7, 63, 51, 0.04);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s ease;
}

.hds-card:hover {
  transform: translateY(-4px);
  box-shadow: 
    0 32px 70px -12px rgba(7, 63, 51, 0.18),
    0 6px 20px rgba(7, 63, 51, 0.06);
}

/* Top Bar inside Card */
.hds-top-bar {
  position: relative;
  z-index: 4;
  padding: 16px 18px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.hds-badge-verified {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.94);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid #d2e4ce;
  color: #06382c;
  font-size: 11.5px;
  font-weight: 700;
  padding: 5px 12px;
  border-radius: 999px;
  box-shadow: 0 2px 8px rgba(7, 63, 51, 0.06);
}

.hds-badge-pulse {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.94);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid #d2e4ce;
  color: #06382c;
  font-size: 11.5px;
  font-weight: 600;
  padding: 5px 11px;
  border-radius: 999px;
  box-shadow: 0 2px 8px rgba(7, 63, 51, 0.06);
}

.hds-pulse-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 6px #10b981;
  animation: pulse-dot 2s infinite ease-in-out;
}

.hds-photo {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top center;
  transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.hds-card:hover .hds-photo {
  transform: scale(1.02);
}

.hds-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, 
    rgba(255, 255, 255, 0) 42%, 
    rgba(255, 255, 255, 0.88) 68%, 
    #ffffff 94%);
  z-index: 3;
  pointer-events: none;
}

/* Bottom Details */
.hds-details {
  position: relative;
  z-index: 4;
  padding: 16px 20px 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.hds-identity {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.hds-name {
  font-size: 22px;
  font-weight: 800;
  color: #06382c;
  letter-spacing: -0.4px;
  margin: 0;
}

.hds-title {
  font-size: 13.5px;
  font-weight: 600;
  color: #059669;
  margin: 0;
}

.hds-association {
  font-size: 11.5px;
  color: #5e796c;
  margin: 0;
}

/* Built-in Metrics Strip */
.hds-stats-strip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f7faf5;
  border: 1px solid #e0ecdc;
  border-radius: 14px;
  padding: 8px 14px;
}

.hds-stat-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
}

.hds-stat-val {
  font-size: 14.5px;
  font-weight: 800;
  color: #06382c;
  font-family: 'Plus Jakarta Sans', 'Alexandria', sans-serif;
  line-height: 1.2;
}

.hds-stat-txt {
  font-size: 10.5px;
  font-weight: 600;
  color: #5e796c;
}

.hds-stat-divider {
  width: 1px;
  height: 24px;
  background: #d8e5d2;
}

@media (max-width: 980px) {
  .hero-doctor-showcase {
    margin-left: 0;
    margin-top: 24px;
    height: auto;
    width: 100%;
    max-width: 390px;
    margin: 24px auto 0;
  }
  .hds-card {
    width: 100%;
    height: 480px;
  }
}

@media (max-width: 480px) {
  .hero-doctor-showcase {
    max-width: 340px;
  }
  .hds-card {
    height: 430px;
    border-radius: 22px;
  }
  .hds-top-bar {
    padding: 12px 14px 0;
  }
  .hds-badge-verified, .hds-badge-pulse {
    font-size: 10.5px;
    padding: 4px 9px;
  }
  .hds-details {
    padding: 12px 14px 14px;
    gap: 10px;
  }
  .hds-name {
    font-size: 19px;
  }
  .hds-title {
    font-size: 12px;
  }
  .hds-stat-val {
    font-size: 13px;
  }
  .hds-stat-txt {
    font-size: 9.5px;
  }
}
`;

css += '\n' + updatedHeroCss;
fs.writeFileSync(cssFile, css.replace(/\n/g, '\r\n'), 'utf8');
console.log('Saved home.css with zero-collision hero styles');
