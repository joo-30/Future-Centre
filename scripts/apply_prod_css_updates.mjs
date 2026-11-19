import fs from 'fs';

// 1. Update clinic-intro.css
const clinicIntroPath = 'client/src/styles/site/clinic-intro.css';
let introCss = fs.readFileSync(clinicIntroPath, 'utf8');

// Replace capsule frame with natural cinematic frame + trust badge
introCss = introCss.replace(
  /\.clinic-intro-frame\s*\{[\s\S]*?aspect-ratio:\s*16\s*\/\s*13;[\s\S]*?\}/,
  `.clinic-intro-frame {
  border-radius: 28px;
  overflow: hidden;
  aspect-ratio: 16 / 12;
  background: #041f17;
  box-shadow: 
    0 24px 50px -12px rgba(6, 63, 50, 0.18),
    0 4px 16px rgba(6, 63, 50, 0.05);
  border: 1px solid rgba(6, 63, 50, 0.12);
}

.clinic-intro-trust-badge {
  position: absolute;
  bottom: -16px;
  right: 24px;
  background: #FFFFFF;
  border: 1px solid rgba(6, 63, 50, 0.1);
  border-radius: 9999px;
  padding: 10px 20px;
  font-size: 13px;
  font-weight: 750;
  color: var(--clinic-evergreen);
  box-shadow: 0 8px 24px rgba(6, 63, 50, 0.12);
  display: inline-flex;
  align-items: center;
  gap: 10px;
  z-index: 2;
}

.clinic-intro-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #16a34a;
}`
);

// Replace .clinic-intro-index and items with streamlined luxury ribbon
introCss = introCss.replace(
  /\/\* Signature Clinical Index Cards[\s\S]*?\.clinic-index-desc\s*\{[\s\S]*?\}/,
  `/* Signature Clinical Index Ribbon (Quiet Luxury Horizon Bar) */
.clinic-intro-index {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 28px;
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(6, 63, 50, 0.08);
  border-radius: 20px;
  box-shadow: 0 4px 18px rgba(6, 63, 50, 0.03);
}

.clinic-index-item {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  background: transparent;
  border: none;
  box-shadow: none;
  padding: 0;
  transition: transform 0.2s ease;
}

.clinic-index-item:not(:last-child) {
  border-left: 1px solid rgba(6, 63, 50, 0.1);
  padding-left: 16px;
}

.clinic-index-item:hover {
  transform: translateY(-2px);
}

.clinic-index-num {
  font-size: 12px;
  font-weight: 800;
  color: var(--clinic-sage);
  background: rgba(113, 131, 74, 0.12);
  padding: 4px 8px;
  border-radius: 6px;
  margin-block-end: 0;
  flex-shrink: 0;
}

.clinic-index-title {
  font-size: 14.5px;
  font-weight: 800;
  color: var(--clinic-evergreen);
  line-height: 1.25;
  display: block;
}

.clinic-index-desc {
  font-size: 12px;
  color: var(--clinic-lead);
  line-height: 1.5;
  display: block;
  margin-top: 2px;
}`
);

// Enlarge service cards sika and add features list styling
introCss = introCss.replace(
  /\.clinic-service-card\s*\{[\s\S]*?padding:[\s\S]*?\}/,
  `.clinic-service-card {
  background: #FFFFFF;
  border: 1px solid rgba(6, 63, 50, 0.09);
  border-radius: 24px;
  padding: clamp(36px, 3.2vw, 44px) clamp(26px, 2.6vw, 32px);
  box-shadow: 0 4px 20px -4px rgba(6, 63, 50, 0.05);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
}`
);

if (!introCss.includes('clinic-card-features-list')) {
  introCss = introCss.replace(
    '.clinic-card-desc {',
    `.clinic-card-features-list {
  list-style: none;
  padding: 0;
  margin: 18px 0 0 0;
  border-block-start: 1px solid rgba(6, 63, 50, 0.07);
  padding-block-start: 18px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
}

.clinic-card-features-list li {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 13.5px;
  font-weight: 600;
  color: var(--clinic-lead);
  line-height: 1.5;
}

.clinic-card-check {
  color: #16a34a;
  flex-shrink: 0;
  margin-block-start: 3px;
}

.clinic-card-desc {`
  );
}

fs.writeFileSync(clinicIntroPath, introCss, 'utf8');
console.log('Successfully updated clinic-intro.css');

// 2. Soften and lighten stories.css
const storiesCssPath = 'client/src/styles/site/stories.css';
let storiesCss = fs.readFileSync(storiesCssPath, 'utf8');

// Lighten transform-card-compact and cover
storiesCss = storiesCss.replace(
  /\.tc-cover-wrap\s*\{[\s\S]*?background:\s*#022c22;[\s\S]*?\}/,
  `.tc-cover-wrap {
  width: 100%;
  aspect-ratio: 800 / 420;
  height: auto;
  position: relative;
  overflow: hidden;
  background: #063F32;
}`
);

storiesCss = storiesCss.replace(
  /\.transform-card-compact\s*\{[\s\S]*?border:\s*1\.5px solid #e2e8f0;[\s\S]*?\}/,
  `.transform-card-compact {
  background: #ffffff;
  border: 1px solid rgba(6, 63, 50, 0.08);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 18px rgba(6, 63, 50, 0.04);
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  display: flex;
  flex-direction: column;
}`
);

fs.writeFileSync(storiesCssPath, storiesCss, 'utf8');
console.log('Successfully updated stories.css');
