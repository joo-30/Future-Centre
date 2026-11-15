import fs from 'fs';
import path from 'path';

const baseCssPath = path.resolve('client/src/styles/site/base.css');
let base = fs.readFileSync(baseCssPath, 'utf8');

// Replace .hero-section and ::before / ::after
base = base.replace(
  /\.hero-section\s*\{[\s\S]*?overflow:\s*hidden\s*!important;\s*\}/,
  `.hero-section {
  position: relative;
  width: 100% !important;
  max-width: 100% !important;
  margin: 0 !important;
  padding: 8px 0 20px !important;
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
}`
);

base = base.replace(
  /\.hero-section::before\s*\{[\s\S]*?z-index:\s*0;\s*\}\s*\.hero-section::after\s*\{[\s\S]*?z-index:\s*0;\s*\}/,
  `.hero-section::before,
.hero-section::after {
  display: none !important;
}`
);

fs.writeFileSync(baseCssPath, base, 'utf8');
console.log('✅ Updated base.css: Hero background is now completely seamless with the website!');
