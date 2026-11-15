import fs from 'fs';
import path from 'path';

const homePath = path.resolve('client/src/styles/reference/home.css');
const mobilePath = path.resolve('client/src/styles/site/mobile.css');

// 1. Refine home.css mobile rules
let home = fs.readFileSync(homePath, 'utf8');

const mobileRefinement = `
/* Mobile Doctor Card badges refinement to prevent collision */
@media (max-width: 440px) {
  .hds-card {
    height: 440px !important;
    max-width: 330px !important;
  }
  .hds-float-top-right {
    top: 8px !important;
    right: 8px !important;
    padding: 4px 8px !important;
  }
  .hds-float-top-right small {
    display: none !important;
  }
  .hds-float-top-left {
    top: 8px !important;
    left: 8px !important;
    padding: 4px 8px !important;
    font-size: 10px !important;
  }
  .hds-float-mid-right {
    bottom: 160px !important;
    right: 8px !important;
    padding: 4px 8px !important;
  }
  .hds-float-mid-right small {
    font-size: 9px !important;
  }
}
`;

home += mobileRefinement;
fs.writeFileSync(homePath, home, 'utf8');
console.log('✅ Refined home.css for mobile badges');

// 2. Refine mobile.css for hero-badge-pill
let mobile = fs.readFileSync(mobilePath, 'utf8');
mobile = mobile.replace(
  /\.hero-badge-pill\s*\{[\s\S]*?margin-bottom:\s*12px;\s*\}/,
  `.hero-badge-pill {
    font-size: 11px !important;
    padding: 5px 10px !important;
    gap: 5px !important;
    margin-bottom: 14px !important;
    display: inline-flex !important;
    align-items: center !important;
    flex-wrap: wrap !important;
    border-radius: 12px !important;
    line-height: 1.3 !important;
  }`
);
fs.writeFileSync(mobilePath, mobile, 'utf8');
console.log('✅ Refined mobile.css for hero-badge-pill');
