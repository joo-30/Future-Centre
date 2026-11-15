import fs from 'fs';
import path from 'path';

const basePath = path.resolve('Future-Center/client/src/styles/site/base.css');
const homePath = path.resolve('Future-Center/client/src/styles/reference/home.css');
const mobilePath = path.resolve('Future-Center/client/src/styles/site/mobile.css');

// 1. Update base.css
let base = fs.readFileSync(basePath, 'utf8');
const targetBaseRegex = /\.hero-badge-pill\s*\{[\s\S]*?\.reassurance-pill svg\s*\{[\s\S]*?\}/;

const replacementBase = `/* ==========================================================================
   HERO SECTION LUXURY UPGRADE (Exact Approved Proposal Colors)
   ========================================================================== */
.hero-section {
  position: relative;
  max-width: 1360px;
  margin: 16px auto 32px;
  padding: 12px 16px 20px;
  background: linear-gradient(180deg, #f9faf6 0%, #f4f8f1 50%, #edf5ea 100%) !important;
  border: 1.5px solid #d8e6d2 !important;
  border-radius: 28px !important;
  box-shadow: 0 16px 45px rgba(20, 68, 42, 0.08) !important;
  overflow: hidden;
}

.hero-section::before {
  content: '';
  position: absolute;
  top: -100px;
  left: -100px;
  width: 480px;
  height: 480px;
  background: radial-gradient(circle, rgba(16, 185, 129, 0.22) 0%, transparent 70%);
  border-radius: 50%;
  pointer-events: none;
  z-index: 0;
}

.hero-section::after {
  content: '';
  position: absolute;
  bottom: 0px;
  right: 25%;
  width: 440px;
  height: 440px;
  background: radial-gradient(circle, rgba(245, 158, 11, 0.14) 0%, transparent 70%);
  border-radius: 50%;
  pointer-events: none;
  z-index: 0;
}

.home-hero {
  position: relative;
  z-index: 1;
}

.hero-main-title,
.hero-copy h1 {
  color: #0f172a !important;
  font-size: clamp(34px, 3.4vw, 50px);
  font-weight: 900 !important;
  line-height: 1.25 !important;
  letter-spacing: -0.6px !important;
  margin: 10px 0 16px !important;
}

.hero-title-accent,
.hero-copy h1 span {
  background: linear-gradient(135deg, #065f46 0%, #047857 50%, #0f766e 100%) !important;
  -webkit-background-clip: text !important;
  -webkit-text-fill-color: transparent !important;
  display: inline-block !important;
}

.hero-badge-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  background: rgba(209, 250, 229, 0.88) !important;
  border: 1px solid rgba(110, 231, 183, 0.85) !important;
  border-radius: 999px !important;
  color: #064e3b !important;
  font-size: 12.5px !important;
  font-weight: 800 !important;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(6, 78, 59, 0.08) !important;
  backdrop-filter: blur(8px);
}

.hero-badge-sparkle {
  color: #059669 !important;
  flex-shrink: 0;
}

.hero-badge-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #059669 !important;
}

.hero-badge-pill small {
  color: #047857 !important;
  font-size: 11.5px !important;
  font-weight: 800 !important;
}

.hero-description {
  font-size: 17.5px !important;
  line-height: 1.85 !important;
  color: #475569 !important;
  max-width: 520px;
  margin: 0 0 22px;
}

.hero-description strong {
  color: #0f172a !important;
  font-weight: 800;
}

.hero-cta-grid {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-top: 24px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.btn-hero-primary {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 10px !important;
  min-height: 52px !important;
  padding: 12px 28px !important;
  font-size: 15.5px !important;
  font-weight: 800 !important;
  border-radius: 14px !important;
  background: #064e3b !important;
  color: #ffffff !important;
  border: none !important;
  box-shadow: 0 10px 24px rgba(6, 78, 59, 0.25) !important;
  transition: all 0.25s ease !important;
  text-decoration: none !important;
}

.btn-hero-primary:hover {
  background: #043629 !important;
  color: #ffffff !important;
  box-shadow: 0 14px 30px rgba(6, 78, 59, 0.35) !important;
  transform: translateY(-2px) !important;
}

.btn-hero-secondary {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 8px !important;
  min-height: 52px !important;
  padding: 12px 22px !important;
  font-size: 15px !important;
  font-weight: 800 !important;
  border-radius: 14px !important;
  background: #ffffff !important;
  border: 1.5px solid #a7f3d0 !important;
  color: #064e3b !important;
  box-shadow: 0 4px 14px rgba(6, 78, 59, 0.06) !important;
  transition: all 0.25s ease !important;
  cursor: pointer !important;
  text-decoration: none !important;
}

.btn-hero-secondary:hover {
  background: #f0fdf4 !important;
  border-color: #34d399 !important;
  color: #064e3b !important;
  box-shadow: 0 6px 18px rgba(6, 78, 59, 0.1) !important;
  transform: translateY(-2px) !important;
}

.hero-btn-chip {
  background: #dcfce7 !important;
  color: #065f46 !important;
  font-size: 11.5px !important;
  font-weight: 800 !important;
  padding: 3px 8px !important;
  border-radius: 8px !important;
  margin-inline-start: 6px !important;
}

.reassurance-badges {
  display: flex !important;
  align-items: center !important;
  gap: 16px !important;
  padding-top: 18px !important;
  margin-top: 10px !important;
  border-top: 1px solid rgba(16, 185, 129, 0.25) !important;
  flex-wrap: wrap !important;
}

.reassurance-pill {
  display: inline-flex !important;
  align-items: center !important;
  gap: 7px !important;
  font-size: 12.5px !important;
  font-weight: 700 !important;
  color: #334155 !important;
}

.reassurance-icon,
.reassurance-pill svg {
  color: #059669 !important;
  background: #d1fae5 !important;
  border-radius: 50% !important;
  padding: 2px !important;
  width: 18px !important;
  height: 18px !important;
}`;

if (targetBaseRegex.test(base)) {
  base = base.replace(targetBaseRegex, replacementBase);
  fs.writeFileSync(basePath, base, 'utf8');
  console.log('✅ Updated base.css');
} else {
  console.error('❌ Could not find target in base.css');
}

// 2. Update home.css for doctor showcase card
let home = fs.readFileSync(homePath, 'utf8');

// Replace .hds-card styling
const hdsCardRegex = /\.hds-card\s*\{[\s\S]*?\.hds-card:hover\s*\{[\s\S]*?\}/;
const replacementHdsCard = `.hds-card {
  position: relative;
  z-index: 2;
  width: 430px;
  height: 540px;
  border-radius: 28px !important;
  background: linear-gradient(180deg, #ffffff 0%, #f4f8f1 100%) !important;
  border: 2px solid #064e3b !important;
  box-shadow:
    0 24px 60px rgba(6, 78, 59, 0.18),
    0 4px 16px rgba(0, 0, 0, 0.04) !important;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s ease;
}

.hds-card:hover {
  transform: translateY(-4px);
  box-shadow:
    0 30px 70px rgba(6, 78, 59, 0.24),
    0 8px 24px rgba(0, 0, 0, 0.06) !important;
}`;

if (hdsCardRegex.test(home)) {
  home = home.replace(hdsCardRegex, replacementHdsCard);
  console.log('✅ Updated .hds-card in home.css');
} else {
  console.error('❌ Could not find .hds-card in home.css');
}

// Also update .hds-glow-layer
const hdsGlowRegex = /\.hds-glow-layer\s*\{[\s\S]*?\}/;
const replacementGlow = `.hds-glow-layer {
  position: absolute;
  inset: -12px;
  background: radial-gradient(circle, rgba(16, 185, 129, 0.26) 0%, rgba(16, 185, 129, 0.08) 50%, transparent 72%);
  filter: blur(36px);
  z-index: 1;
  pointer-events: none;
}`;
if (hdsGlowRegex.test(home)) {
  home = home.replace(hdsGlowRegex, replacementGlow);
  console.log('✅ Updated .hds-glow-layer in home.css');
}

// Update .hds-details
const hdsDetailsRegex = /\.hds-details\s*\{[\s\S]*?padding: 16px 20px 18px;[\s\S]*?\}/;
const replacementDetails = `.hds-details {
  position: relative;
  z-index: 4;
  padding: 14px 18px 16px !important;
  display: flex;
  flex-direction: column;
  gap: 10px !important;
  margin: 0 10px 10px !important;
  background: rgba(255, 255, 255, 0.95) !important;
  backdrop-filter: blur(14px) !important;
  -webkit-backdrop-filter: blur(14px) !important;
  border: 1px solid rgba(255, 255, 255, 0.9) !important;
  border-radius: 22px !important;
  box-shadow: 0 10px 30px rgba(6, 78, 59, 0.1) !important;
  margin-top: auto !important;
}`;
if (hdsDetailsRegex.test(home)) {
  home = home.replace(hdsDetailsRegex, replacementDetails);
  console.log('✅ Updated .hds-details in home.css');
}

fs.writeFileSync(homePath, home, 'utf8');

// 3. Update mobile.css
let mobile = fs.readFileSync(mobilePath, 'utf8');

const mobileHeroBtnRegex = /\.btn-hero-primary\s*\{[\s\S]*?\.btn-hero-secondary\s*\{[\s\S]*?box-sizing: border-box;\s*\}/;
const replacementMobileHeroBtns = `.btn-hero-primary {
    width: 100%;
    min-height: 50px;
    padding: 10px 16px;
    font-size: 15px;
    font-weight: 800;
    justify-content: center;
    border-radius: 14px;
    background: #064e3b !important;
    color: #ffffff !important;
    box-shadow: 0 8px 20px rgba(6, 78, 59, 0.22);
    box-sizing: border-box;
  }
  .btn-hero-secondary {
    width: 100%;
    min-height: 50px;
    padding: 10px 14px;
    font-size: 14px;
    font-weight: 800;
    justify-content: center;
    border-radius: 14px;
    border: 1.5px solid #a7f3d0 !important;
    background: #ffffff !important;
    color: #064e3b !important;
    box-shadow: 0 4px 14px rgba(6, 78, 59, 0.06);
    box-sizing: border-box;
  }`;

if (mobileHeroBtnRegex.test(mobile)) {
  mobile = mobile.replace(mobileHeroBtnRegex, replacementMobileHeroBtns);
  fs.writeFileSync(mobilePath, mobile, 'utf8');
  console.log('✅ Updated mobile hero buttons in mobile.css');
} else {
  console.log('ℹ️ mobile hero buttons pattern not matched directly in mobile.css');
}

console.log('🎉 All color updates applied!');
