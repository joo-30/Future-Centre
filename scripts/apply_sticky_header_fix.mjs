import fs from 'fs';
import path from 'path';

const mobileCssPath = 'E:/Future Center/Future-Center/client/src/styles/site/mobile.css';
const baseCssPath = 'E:/Future Center/Future-Center/client/src/styles/site/base.css';
const clinicIntroPath = 'E:/Future Center/Future-Center/client/src/styles/site/clinic-intro.css';

// 1. Remove duplicate lines 1650-1872 from mobile.css and ensure #root has overflow: visible
let mobileCss = fs.readFileSync(mobileCssPath, 'utf8').replace(/\r\n/g, '\n');

// Find the second occurrence of "/* ==========================================================================\n   MOBILE HERO & DOCTOR CARD BULLETPROOF RESPONSIVE FIX"
const comment = `/* ==========================================================================\n   MOBILE HERO & DOCTOR CARD BULLETPROOF RESPONSIVE FIX\n   ========================================================================== */`;
const firstIdx = mobileCss.indexOf(comment);
const secondIdx = mobileCss.indexOf(comment, firstIdx + comment.length);

if (secondIdx !== -1) {
  console.log('Found duplicate block in mobile.css at index', secondIdx);
  mobileCss = mobileCss.substring(0, secondIdx).trimEnd() + '\n';
}

// In the remaining block (around line 1429), ensure #root is not given overflow-x: clip, but rather overflow: visible
mobileCss = mobileCss.replace(
  `html, body, #root, .home-body, .hero-section {\n  max-width: 100vw !important;\n  overflow-x: clip !important;\n}`,
  `html, body, .home-body, .hero-section {\n  max-width: 100vw !important;\n  overflow-x: clip !important;\n}\n\n#root {\n  overflow: visible !important;\n}`
);

fs.writeFileSync(mobileCssPath, mobileCss, 'utf8');
console.log('Updated mobile.css successfully');

// 2. In base.css, ensure #root is excluded from overflow-x: clip so position: sticky is never blocked
let baseCss = fs.readFileSync(baseCssPath, 'utf8').replace(/\r\n/g, '\n');
baseCss = baseCss.replace(
  `body,\n#root,\n.site-layout,\n.home-body,\n.app-wrap {\n  overflow-x: clip;\n  max-width: 100vw;\n}`,
  `body,\n.site-layout,\n.home-body,\n.app-wrap {\n  overflow-x: clip;\n  max-width: 100vw;\n}\n\n#root {\n  overflow: visible !important;\n}`
);
fs.writeFileSync(baseCssPath, baseCss, 'utf8');
console.log('Updated base.css successfully');

// 3. In clinic-intro.css, explicitly define sticky header behavior
let clinicIntro = fs.readFileSync(clinicIntroPath, 'utf8').replace(/\r\n/g, '\n');
const targetHeader = `.site-head.site-head-home {
  background: rgba(255, 255, 255, 0.94);
  backdrop-filter: blur(16px) saturate(160%);
  -webkit-backdrop-filter: blur(16px) saturate(160%);
  border-block-end: 1px solid rgba(216, 229, 214, 0.9);
  box-shadow: 0 2px 14px -3px rgba(18, 48, 28, 0.04);
}`;

const replacementHeader = `.site-head,
.site-head.site-head-home {
  position: sticky !important;
  top: 0 !important;
  z-index: 100 !important;
  background: rgba(255, 255, 255, 0.94);
  backdrop-filter: blur(16px) saturate(160%);
  -webkit-backdrop-filter: blur(16px) saturate(160%);
  border-block-end: 1px solid rgba(216, 229, 214, 0.9);
  box-shadow: 0 2px 14px -3px rgba(18, 48, 28, 0.04);
}`;

if (clinicIntro.includes(targetHeader)) {
  clinicIntro = clinicIntro.replace(targetHeader, replacementHeader);
  fs.writeFileSync(clinicIntroPath, clinicIntro, 'utf8');
  console.log('Updated clinic-intro.css successfully');
} else {
  console.log('Target header not found in clinic-intro.css, checking variations...');
}
