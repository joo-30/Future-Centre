import fs from 'fs';

// 1. Update auth.css
const cssFile = 'Future-Centre/client/src/styles/portal/auth.css';
let css = fs.readFileSync(cssFile, 'utf8').replace(/\r\n/g, '\n');

// Ensure Alexandria font on access-page
css = css.replace(
  `.access-page {
  display: grid;
  grid-template-columns: minmax(460px, 1fr) minmax(520px, 1.15fr);
  min-height: 100dvh;
  background: #fafbf8;
  color: #1a2e26;
  direction: rtl;
}`,
  `.access-page {
  display: grid;
  grid-template-columns: minmax(460px, 1fr) minmax(520px, 1.15fr);
  min-height: 100dvh;
  background: #f8faf6;
  color: #1a2e26;
  direction: rtl;
  font-family: 'Alexandria', sans-serif;
}`
);

// High-end Apple-style back pill
const oldPill = `.access-back-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 7px 14px;
  border-radius: 9999px;
  background: #f1f5ee;
  border: 1px solid #e2ebd9;
  color: #1b493c;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  white-space: nowrap;
  flex-shrink: 0;
  line-height: 1;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}`;

const newPill = `.access-back-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 9px 18px;
  border-radius: 9999px;
  background: #ffffff;
  border: 1.5px solid #d2e3cc;
  color: #06382c;
  font-family: 'Alexandria', sans-serif;
  font-size: 13.5px;
  font-weight: 700;
  text-decoration: none;
  white-space: nowrap;
  flex-shrink: 0;
  line-height: 1;
  box-shadow: 0 2px 8px rgba(6, 56, 44, 0.05);
  transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
}`;

if (css.includes(oldPill)) {
  css = css.replace(oldPill, newPill);
  console.log('Replaced .access-back-pill in auth.css');
} else {
  console.log('oldPill pattern not found, trying partial replace');
  css = css.replace(/\.access-back-pill\s*\{[^}]+\}/, newPill);
}

// Enhance hover state
css = css.replace(
  `.access-back-pill:hover {
  background: #e5eedf;
  color: #0c3328;
  transform: translateX(-2px);
  border-color: #cbdcc0;
}`,
  `.access-back-pill:hover {
  background: #06382c;
  border-color: #06382c;
  color: #ffffff;
  transform: translateX(-3px);
  box-shadow: 0 6px 18px rgba(6, 56, 44, 0.18);
}
.access-back-pill:hover svg {
  transform: translateX(-2px);
  color: #34d399;
}`
);

fs.writeFileSync(cssFile, css.replace(/\n/g, '\r\n'), 'utf8');
console.log('Saved auth.css');

// 2. Update AuthPage.tsx for surname
const authFile = 'Future-Centre/client/src/features/auth/AuthPage.tsx';
let authPage = fs.readFileSync(authFile, 'utf8');
authPage = authPage.replaceAll('د. رنا ياسر الشوري', 'د. رنا ياسر الشورى');
authPage = authPage.replaceAll('د. رنا الشوري', 'د. رنا الشورى');
fs.writeFileSync(authFile, authPage, 'utf8');
console.log('Saved AuthPage.tsx with د. رنا ياسر الشورى');
