import fs from 'fs';
import path from 'path';

const authCssPath = path.resolve('client/src/styles/portal/auth.css');
let cssContent = fs.readFileSync(authCssPath, 'utf8');

const centeredRules = `
/* ==========================================================================
   MINIMALIST LUXURY CENTERED AUTH PORTAL (Calm, Private, Trustworthy)
   ========================================================================== */
.access-page-centered {
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  justify-content: center !important;
  min-height: 100dvh !important;
  background: #faf8f5 !important;
  position: relative !important;
  overflow-x: hidden !important;
  padding: 36px 16px 28px !important;
  box-sizing: border-box !important;
}

.auth-ambient-orb {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
  filter: blur(100px);
  z-index: 0;
}

.auth-ambient-orb-1 {
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(6, 78, 59, 0.08) 0%, transparent 70%);
  top: -100px;
  right: -80px;
}

.auth-ambient-orb-2 {
  width: 450px;
  height: 450px;
  background: radial-gradient(circle, rgba(245, 158, 11, 0.06) 0%, transparent 70%);
  bottom: -60px;
  left: -80px;
}

.access-centered-container {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 490px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: stretch;
}

.access-top-centered {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
  width: 100%;
}

.access-page-centered .auth-card-elevated {
  background: #ffffff !important;
  border-radius: 26px !important;
  padding: 36px 36px 32px !important;
  border: 1px solid rgba(20, 68, 42, 0.12) !important;
  box-shadow: 
    0 1px 3px rgba(0, 0, 0, 0.02),
    0 20px 45px -10px rgba(6, 43, 33, 0.09),
    0 1px 2px rgba(6, 43, 33, 0.04) !important;
  margin: 0 !important;
  box-sizing: border-box !important;
  width: 100% !important;
}

.access-centered-footer {
  text-align: center;
  margin-top: 22px;
  color: #64748b;
  font-size: 12.5px;
  line-height: 1.6;
}

@media (max-width: 520px) {
  .access-page-centered {
    padding: 16px 12px 24px !important;
    justify-content: flex-start !important;
  }
  .access-page-centered .auth-card-elevated {
    padding: 24px 18px !important;
    border-radius: 20px !important;
  }
}
`;

if (!cssContent.includes('.access-page-centered')) {
  cssContent += centeredRules;
} else {
  cssContent = cssContent.replace(/\/\* =+[\s\S]*?\.access-page-centered[\s\S]*?\}\s*\}/, centeredRules.trim());
}

fs.writeFileSync(authCssPath, cssContent, 'utf8');
console.log('auth.css updated with centered portal styles!');
