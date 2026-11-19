import fs from 'fs';

const cssPath = 'E:/Future Center/Future-Center/client/src/styles/portal/auth.css';
let css = fs.readFileSync(cssPath, 'utf8');

// Replace .access-page block with responsive desktop split & mobile stack
const desktopSplitReplacement = `
/* ==========================================================================
   DESKTOP & LAPTOP EDITORIAL SPLIT VIEW (Edge-to-Edge 100vh)
   ========================================================================== */
@media (min-width: 921px) {
  .access-page {
    display: grid !important;
    grid-template-columns: minmax(380px, 480px) 1fr !important;
    height: 100vh !important;
    max-height: 100dvh !important;
    overflow: hidden !important;
    background: #f8faf6 !important;
    color: #1a2e26;
    direction: rtl;
    font-family: 'Alexandria', sans-serif;
  }

  .access-form-area {
    height: 100vh !important;
    overflow-y: auto !important;
    padding: 32px 40px !important;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    max-width: 540px !important;
    margin: 0 auto;
    width: 100%;
    scrollbar-width: thin;
    scrollbar-color: rgba(6, 78, 59, 0.2) transparent;
  }

  .access-visual {
    height: 100vh !important;
    max-height: 100vh !important;
    position: relative !important;
    overflow: hidden !important;
    width: 100% !important;
    background: #041f17 !important;
    padding: 0 !important;
    margin: 0 !important;
    border: none !important;
  }

  .access-visual .showcase-img {
    position: absolute !important;
    inset: 0 !important;
    width: 100% !important;
    height: 100% !important;
    object-fit: cover !important;
    object-position: center bottom !important;
    filter: saturate(1.04) contrast(1.02) !important;
    display: block !important;
    transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1) !important;
  }

  .access-visual:hover .showcase-img {
    transform: scale(1.015) !important;
  }
}
`;

// Insert desktopSplitReplacement right before the existing .access-page declaration or replace it
css = css.replace(/\.access-page\s*\{[\s\S]*?direction:\s*rtl;[\s\S]*?\}/, desktopSplitReplacement);

// Make sure mobile showcase uses object-position center 65%
css = css.replace(/\.mob-showcase-img\s*\{[\s\S]*?\}/, `.mob-showcase-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 60%;
  display: block;
}`);

fs.writeFileSync(cssPath, css, 'utf8');
console.log('auth.css updated with desktop split and mobile rules!');
