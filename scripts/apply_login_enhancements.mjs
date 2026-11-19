import fs from 'fs';
import path from 'path';

// 1. Update AuthPage.tsx
const authPagePath = path.resolve('client/src/features/auth/AuthPage.tsx');
let authContent = fs.readFileSync(authPagePath, 'utf8');

// Update react import
authContent = authContent.replace(
  "import { useEffect, useState } from 'react';",
  "import { useEffect, useRef, useState } from 'react';\nimport { gsap, isReducedMotion, useGSAP } from '../../lib/motion';"
);

// Add pageRef and useGSAP
const searchExport = "export function AuthPage({ mode = 'login' }: { mode?: 'login' | 'register' | 'recover' }) {";
const gsapSnippet = `export function AuthPage({ mode = 'login' }: { mode?: 'login' | 'register' | 'recover' }) {
  const pageRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (isReducedMotion()) return;

      const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

      tl.fromTo(
        '.showcase-img',
        { opacity: 0, scale: 1.03 },
        { opacity: 1, scale: 1.0, duration: 0.95 }
      );

      tl.fromTo(
        '.mobile-reception-showcase',
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.7 },
        0
      );

      tl.fromTo(
        '.auth-card-elevated',
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.75 },
        0.1
      );
    },
    { scope: pageRef }
  );`;

authContent = authContent.replace(searchExport, gsapSnippet);

// Attach ref to main
authContent = authContent.replace(
  '<main className="access-page">',
  '<main ref={pageRef} className="access-page">'
);

fs.writeFileSync(authPagePath, authContent, 'utf8');
console.log('AuthPage.tsx updated with GSAP motion entrance!');

// 2. Update auth.css
const authCssPath = path.resolve('client/src/styles/portal/auth.css');
let cssContent = fs.readFileSync(authCssPath, 'utf8');

// Update .mobile-reception-showcase and .mobile-reception-img
const oldMobileRule = /\.mobile-reception-showcase\s*\{[\s\S]*?background:\s*#041f17;\s*\}/;
const newMobileRule = `.mobile-reception-showcase {
  display: none; /* hidden on desktop, shown on mobile/tablet */
  width: 100%;
  border-radius: 18px;
  overflow: hidden;
  border: 1.5px solid rgba(20, 68, 42, 0.12);
  box-shadow: 0 10px 24px -4px rgba(6, 43, 33, 0.12);
  margin-bottom: 18px;
  height: 168px;
  background: #041f17;
  position: relative;
}`;

if (oldMobileRule.test(cssContent)) {
  cssContent = cssContent.replace(oldMobileRule, newMobileRule);
  console.log('Replaced .mobile-reception-showcase');
}

const oldMobileImgRule = /\.mobile-reception-img\s*\{[\s\S]*?display:\s*block;\s*\}/;
const newMobileImgRule = `.mobile-reception-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: 60% 32% !important;
  transform: scale(1.14);
  transform-origin: 60% 32%;
  display: block;
}`;

if (oldMobileImgRule.test(cssContent)) {
  cssContent = cssContent.replace(oldMobileImgRule, newMobileImgRule);
  console.log('Replaced .mobile-reception-img');
}

// Update .access-visual and .showcase-bg-wrap for luxury editorial frame
const oldAccessVisual = /\.access-visual\s*\{[\s\S]*?padding:\s*0;\s*\}/;
const newAccessVisual = `.access-visual {
  position: relative;
  min-height: 100%;
  background: transparent;
  overflow: hidden;
  padding: 20px 0 20px 24px;
  box-sizing: border-box;
}`;

if (oldAccessVisual.test(cssContent)) {
  cssContent = cssContent.replace(oldAccessVisual, newAccessVisual);
  console.log('Replaced .access-visual with editorial padding');
}

const oldShowcaseWrap = /\.showcase-bg-wrap\s*\{[\s\S]*?z-index:\s*0;\s*\}/;
const newShowcaseWrap = `.showcase-bg-wrap {
  position: absolute;
  inset: 20px 0 20px 24px;
  border-radius: 28px;
  overflow: hidden;
  border: 1px solid rgba(20, 68, 42, 0.12);
  box-shadow: 0 24px 60px -15px rgba(6, 43, 33, 0.16), 0 4px 16px rgba(0, 0, 0, 0.04);
  background: #041f17;
  z-index: 0;
}`;

if (oldShowcaseWrap.test(cssContent)) {
  cssContent = cssContent.replace(oldShowcaseWrap, newShowcaseWrap);
  console.log('Replaced .showcase-bg-wrap with luxury frame');
}

// In small mobile (<=440px):
cssContent = cssContent.replace(
  /\.mobile-reception-showcase\s*\{\s*border-radius:\s*14px[\s\S]*?rgba\(6,\s*43,\s*33,\s*0\.1\)\s*!important;\s*\}/,
  `.mobile-reception-showcase {
    height: 150px !important;
    border-radius: 14px !important;
    margin-bottom: 14px !important;
    border-width: 1px !important;
    box-shadow: 0 6px 18px -2px rgba(6, 43, 33, 0.1) !important;
  }`
);

fs.writeFileSync(authCssPath, cssContent, 'utf8');
console.log('auth.css updated with luxury frame and mobile focus!');
