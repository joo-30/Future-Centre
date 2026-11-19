import fs from 'fs';

// 1. Copy the perfect portrait image to concept_2_nutrition_vitality.jpg
fs.copyFileSync(
  'C:/Users/makah/.gemini/antigravity/brain/e2976ba3-c954-4b1f-8cdb-775aa48d6049/concept_2_vitality_centered_portrait_1794729536846.jpg',
  'E:/Future Center/Future-Center/client/public/assets/concept_2_nutrition_vitality.jpg'
);
console.log('Copied perfect image to concept_2_nutrition_vitality.jpg');

// 2. Ensure AuthPage.tsx uses /assets/concept_2_nutrition_vitality.jpg
const authPath = 'E:/Future Center/Future-Center/client/src/features/auth/AuthPage.tsx';
let auth = fs.readFileSync(authPath, 'utf8');
auth = auth.replace(/src="\/assets\/[^"]+"/g, 'src="/assets/concept_2_nutrition_vitality.jpg"');
fs.writeFileSync(authPath, auth, 'utf8');
console.log('AuthPage.tsx verified to use /assets/concept_2_nutrition_vitality.jpg');

// 3. Update auth.css with the perfect 50/50 balanced layout
const cssPath = 'E:/Future Center/Future-Center/client/src/styles/portal/auth.css';
let css = fs.readFileSync(cssPath, 'utf8');

// Replace the @media (min-width: 921px) block or .access-page block with the clean 50/50 rules
const desktopRules = `
/* ==========================================================================
   DESKTOP & LAPTOP BALANCED 50/50 EDITORIAL SPLIT (Timeless Luxury)
   ========================================================================== */
@media (min-width: 921px) {
  .access-page {
    display: grid !important;
    grid-template-columns: 1fr 1fr !important;
    min-height: 100dvh !important;
    background: #f8faf6 !important;
    color: #1a2e26;
    direction: rtl;
    font-family: 'Alexandria', sans-serif;
  }

  .access-form-area {
    min-height: 100dvh !important;
    padding: 24px 36px 40px !important;
    display: flex !important;
    flex-direction: column !important;
    justify-content: flex-start !important;
    align-items: center !important;
    max-width: 580px !important;
    margin: 0 auto !important;
    width: 100% !important;
    box-sizing: border-box !important;
  }

  .access-top {
    width: 100% !important;
    max-width: 480px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: space-between !important;
    gap: 12px !important;
    margin-bottom: 20px !important;
  }

  .auth-card-elevated {
    width: 100% !important;
    max-width: 480px !important;
    margin: 0 auto !important;
  }

  .access-visual {
    position: sticky !important;
    top: 0 !important;
    height: 100vh !important;
    max-height: 100vh !important;
    width: 100% !important;
    overflow: hidden !important;
    background: #041f17 !important;
    border: none !important;
    padding: 0 !important;
    margin: 0 !important;
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

// Replace desktop media block in auth.css
css = css.replace(/\/\* ==========================================================================\s*DESKTOP & LAPTOP EDITORIAL SPLIT VIEW[\s\S]*?@media \(min-width: 921px\) \{[\s\S]*?\}\s*\}/, desktopRules);

// If not matched, replace the start of .access-page
if (!css.includes('DESKTOP & LAPTOP BALANCED 50/50 EDITORIAL SPLIT')) {
  css = desktopRules + '\n' + css;
}

// Make sure mobile showcase is also clean
css = css.replace(/\.mob-showcase-img\s*\{[\s\S]*?\}/, `.mob-showcase-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 60%;
  display: block;
}`);

fs.writeFileSync(cssPath, css, 'utf8');
console.log('auth.css updated with clean 50/50 balanced layout!');
