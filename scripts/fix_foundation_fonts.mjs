import fs from 'fs';

// 1. Fix foundation.css
const foundFile = 'Future-Centre/client/src/styles/reference/foundation.css';
let found = fs.readFileSync(foundFile, 'utf8');

// Replace html, body font
found = found.replace(
  /html,\s*body\s*\{[\s\S]*?font-family:\s*Plex,\s*Arial,\s*sans-serif;[\s\S]*?font-size:\s*18px;[\s\S]*?\}/,
  `html,
body {
  margin: 0;
  min-height: 100%;
  background: var(--canvas);
  font-family: 'Alexandria', Alex, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
  color: var(--ink);
  font-size: 15.5px !important;
  line-height: 1.7;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}`
);

// Replace any remaining Plex in foundation.css
found = found.replaceAll('font-family: Plex, Arial, sans-serif', "font-family: 'Alexandria', sans-serif");
found = found.replaceAll('font-family: Alex, Plex, sans-serif', "font-family: 'Alexandria', sans-serif");

fs.writeFileSync(foundFile, found, 'utf8');
console.log('Fixed foundation.css font');

// 2. Fix home.css font
const homeCssFile = 'Future-Centre/client/src/styles/reference/home.css';
let homeCss = fs.readFileSync(homeCssFile, 'utf8');
homeCss = homeCss.replaceAll('font-family: Plex;', "font-family: 'Alexandria', sans-serif;");
homeCss = homeCss.replaceAll('font-family: Plex, sans-serif;', "font-family: 'Alexandria', sans-serif;");
fs.writeFileSync(homeCssFile, homeCss, 'utf8');
console.log('Fixed home.css fonts');

// 3. Fix auth.css for 320px viewport & font
const authCssFile = 'Future-Centre/client/src/styles/portal/auth.css';
let authCss = fs.readFileSync(authCssFile, 'utf8').replace(/\r\n/g, '\n');

// Add global font-family rule to auth.css
if (!authCss.includes("font-family: 'Alexandria'")) {
  authCss = "/* Primary UI Font */\nhtml, body, .access-page, input, button, select, textarea { font-family: 'Alexandria', sans-serif !important; }\n\n" + authCss;
}

// 320px polish block
const mobileFix320 = `
/* ==========================================================================
   ULTRA-RESPONSIVE FIX FOR 320PX (Galaxy Fold & iPhone SE)
   ========================================================================== */
@media (max-width: 440px) {
  .access-form-area {
    padding: 12px 10px 24px !important;
    max-width: 100% !important;
  }
  .access-top {
    gap: 8px !important;
    margin-bottom: 12px !important;
  }
  /* Hide the PWA button in login topbar on very small screens to give full room to back button */
  .access-top .head-pwa-btn {
    display: none !important;
  }
  .access-top .brand-sub {
    display: none !important;
  }
  .access-top .brand-symbol img {
    width: 32px !important;
    height: 32px !important;
  }
  .access-top .brand-name {
    font-size: 14.5px !important;
  }
  .access-back-pill {
    padding: 7px 12px !important;
    font-size: 12px !important;
    gap: 6px !important;
    background: #ffffff !important;
    border: 1.5px solid #d2e3cc !important;
    color: #06382c !important;
    font-weight: 700 !important;
    white-space: nowrap !important;
  }
  .mobile-doctor-hero {
    padding: 12px 10px !important;
    border-radius: 16px !important;
    margin-bottom: 14px !important;
    width: 100% !important;
    box-sizing: border-box !important;
    overflow: hidden !important;
  }
  .mob-hero-top {
    gap: 10px !important;
    min-width: 0 !important;
  }
  .mob-doctor-photo-wrap {
    width: 54px !important;
    height: 66px !important;
    border-radius: 12px !important;
    flex-shrink: 0 !important;
  }
  .mob-doctor-info {
    flex: 1 !important;
    min-width: 0 !important;
    overflow: hidden !important;
  }
  .mob-doctor-name-row h3 {
    font-size: 13.5px !important;
  }
  .mob-doctor-specialty {
    font-size: 10.5px !important;
    white-space: normal !important;
    overflow: visible !important;
    text-overflow: clip !important;
    line-height: 1.35 !important;
  }
  .mob-rating-pill {
    font-size: 10.5px !important;
    flex-wrap: wrap !important;
  }
  .mob-hero-perks {
    gap: 4px !important;
    padding-top: 8px !important;
  }
  .mob-perk-item {
    font-size: 9.5px !important;
    gap: 2px !important;
    padding: 3px 2px !important;
    white-space: nowrap !important;
  }
}
`;

authCss += '\n' + mobileFix320;
fs.writeFileSync(authCssFile, authCss.replace(/\n/g, '\r\n'), 'utf8');
console.log('Fixed auth.css for 320px');
