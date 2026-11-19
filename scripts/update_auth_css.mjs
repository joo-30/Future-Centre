import fs from 'fs';
import path from 'path';

const authCssPath = path.resolve('client/src/styles/portal/auth.css');
let content = fs.readFileSync(authCssPath, 'utf8');

// 1. Add / update .mobile-reception-showcase
const mobileShowcaseCss = `
/* ==========================================================================
   MOBILE & TABLET CLINIC RECEPTION SHOWCASE (Clean, 100% No Text Overlay)
   ========================================================================== */
.mobile-reception-showcase {
  display: none; /* hidden on desktop, shown on mobile/tablet */
  width: 100%;
  border-radius: 18px;
  overflow: hidden;
  border: 1.5px solid rgba(20, 68, 42, 0.12);
  box-shadow: 0 10px 24px -4px rgba(6, 43, 33, 0.12);
  margin-bottom: 20px;
  aspect-ratio: 16 / 9;
  background: #041f17;
}

.mobile-reception-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center center;
  display: block;
}
`;

// Insert after access-back-pill rules
if (!content.includes('.mobile-reception-showcase')) {
  content = content.replace('.access-back-pill:hover svg {', mobileShowcaseCss + '\n.access-back-pill:hover svg {');
}

// 2. Update .access-visual to clean reception visual
const oldVisualRegex = /\.access-visual\s*\{[\s\S]*?padding:\s*44px\s*48px;[\s\S]*?\}/;
const newVisualCss = `.access-visual {
  position: relative;
  min-height: 100%;
  background: #041f17;
  overflow: hidden;
  padding: 0;
}`;

if (oldVisualRegex.test(content)) {
  content = content.replace(oldVisualRegex, newVisualCss);
  console.log('Replaced .access-visual');
}

// 3. Update .showcase-img
const oldImgRegex = /\.showcase-img\s*\{[\s\S]*?\}/;
const newImgCss = `.showcase-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center center;
  filter: saturate(1.04) contrast(1.02);
  display: block;
}`;

if (oldImgRegex.test(content)) {
  content = content.replace(oldImgRegex, newImgCss);
  console.log('Replaced .showcase-img');
}

// 4. Add .showcase-subtle-vignette
if (!content.includes('.showcase-subtle-vignette')) {
  content = content.replace(
    '.showcase-img {',
    `.showcase-subtle-vignette {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(270deg, rgba(4, 31, 23, 0.15) 0%, transparent 15%);
}

.showcase-img {`
  );
  console.log('Added .showcase-subtle-vignette');
}

// 5. In responsive media queries, show .mobile-reception-showcase
content = content.replace(
  /\.mobile-doctor-hero\s*\{\s*display:\s*flex;[\s\S]*?\}/g,
  `.mobile-reception-showcase {
    display: block;
    margin-bottom: 18px;
  }`
);

// 6. In small mobile (<=440px):
content = content.replace(
  /\.mobile-doctor-hero\s*\{\s*padding:\s*12px[\s\S]*?overflow:\s*hidden\s*!important;\s*\}/g,
  `.mobile-reception-showcase {
    border-radius: 14px !important;
    margin-bottom: 14px !important;
    border-width: 1px !important;
    box-shadow: 0 6px 18px -2px rgba(6, 43, 33, 0.1) !important;
  }`
);

fs.writeFileSync(authCssPath, content, 'utf8');
console.log('auth.css updated successfully!');
