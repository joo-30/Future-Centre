import fs from 'node:fs';
import path from 'node:path';

// ==========================================
// 1. Update clinic-intro.css
// ==========================================
const clinicIntroPath = path.resolve('client/src/styles/site/clinic-intro.css');
let introCss = fs.readFileSync(clinicIntroPath, 'utf8').replace(/\r\n/g, '\n');

// 1.1 Header refinements for home page
const oldHeaderBlock = `.site-head.site-head-home {
  background: #fff;
  border-block-end: 1px solid var(--intro-rule);
  box-shadow: none;
}

.site-head-home .brand-symbol,
.site-head-home .brand:hover .brand-symbol {
  background: #213d2d;
  border-color: transparent;
  box-shadow: none;
}

.site-head-home .brand-symbol img {
  transform: scale(1.24);
}

.site-head-home .brand .brand-name {
  color: var(--intro-ink);
}

.site-head-home .brand .brand-sub {
  color: var(--intro-muted);
}

.site-head-home .nav-capsule {
  background: transparent;
  border: 0;
  box-shadow: none;
}

.site-head-home .nav-capsule .nav-capsule-link {
  color: var(--intro-ink);
}

.site-head-home .nav-capsule .nav-capsule-link:hover,
.site-head-home .nav-capsule .nav-capsule-link.is-active {
  background: #edf3ec;
  border-color: transparent;
  box-shadow: none;
}

.site-head-home .head-auth-pill.is-guest,
.site-head-home .menu-mobile {
  background: transparent;
  border-color: var(--intro-rule);
  color: var(--intro-ink);
  box-shadow: none;
}

.site-head-home .head-auth-pill.is-guest:hover,
.site-head-home .menu-mobile:hover {
  background: #edf3ec;
  border-color: var(--intro-muted);
}`;

const newHeaderBlock = `.site-head.site-head-home {
  background: rgba(255, 255, 255, 0.94);
  backdrop-filter: blur(16px) saturate(160%);
  -webkit-backdrop-filter: blur(16px) saturate(160%);
  border-block-end: 1px solid rgba(216, 229, 214, 0.9);
  box-shadow: 0 2px 14px -3px rgba(18, 48, 28, 0.04);
}

.site-head-home .brand-symbol,
.site-head-home .brand:hover .brand-symbol {
  background: #0f3526;
  border-color: rgba(255, 255, 255, 0.2);
  box-shadow: 0 3px 10px rgba(15, 53, 38, 0.15);
  border-radius: 12px;
}

.site-head-home .brand-symbol img {
  transform: scale(1.22);
}

.site-head-home .brand .brand-name {
  color: #0e2b1d;
  font-weight: 850;
}

.site-head-home .brand .brand-sub {
  color: #4b6656;
  font-weight: 600;
}

.site-head-home .nav-capsule {
  background: rgba(243, 248, 241, 0.9);
  border: 1px solid rgba(215, 230, 212, 0.95);
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.02);
  border-radius: 999px;
  padding: 4px 6px;
}

.site-head-home .nav-capsule .nav-capsule-link {
  color: #274534;
  font-size: 14.5px;
  font-weight: 600;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.site-head-home .nav-capsule .nav-capsule-link:hover {
  background: rgba(255, 255, 255, 0.7);
  color: #0e2b1d;
}

.site-head-home .nav-capsule .nav-capsule-link.is-active {
  background: #ffffff;
  color: #0e2b1d;
  font-weight: 800;
  box-shadow: 0 2px 8px rgba(18, 52, 28, 0.08);
  border: 1px solid rgba(198, 222, 195, 0.95);
}

.site-head-home .head-auth-pill.is-guest,
.site-head-home .menu-mobile {
  background: rgba(246, 250, 244, 0.7);
  border-color: rgba(208, 224, 206, 0.9);
  color: #1a3c2a;
  box-shadow: none;
  border-radius: 999px;
  transition: all 0.2s ease;
}

.site-head-home .head-auth-pill.is-guest:hover,
.site-head-home .menu-mobile:hover {
  background: #ffffff;
  border-color: #799e6d;
  color: #0d281a;
  box-shadow: 0 2px 8px rgba(18, 52, 28, 0.07);
}`;

if (introCss.includes(oldHeaderBlock)) {
  introCss = introCss.replace(oldHeaderBlock, newHeaderBlock);
  console.log('Successfully updated site-head-home in clinic-intro.css');
} else {
  console.warn('Could not find oldHeaderBlock in clinic-intro.css');
}

// 1.2 Dr. Rana Section Typography (Right Column)
const oldDoctorBlock = `.clinic-doctor-identity h2 {
  margin: 0;
  color: #0f2c1f;
  font: 700 clamp(32px, 3.8vw, 52px) / 1.25 Alex, 'Alexandria', sans-serif;
  letter-spacing: -0.015em;
  text-wrap: balance;
}

.clinic-doctor-identity p {
  margin: 10px 0 0;
  color: #3b5847;
  font-size: clamp(17px, 1.35vw, 19.5px);
  font-weight: 600;
  line-height: 1.55;
  letter-spacing: -0.005em;
}

.clinic-doctor-approach {
  margin-block-start: clamp(19px, 1.95vw, 28px);
  padding-inline-start: 19px;
  border-inline-start: 2.5px solid #7c9b68;
}

.clinic-doctor-approach h3 {
  margin: 0 0 8px;
  color: #1a3827;
  font: 700 17.5px / 1.45 Alex, 'Alexandria', sans-serif;
  letter-spacing: -0.01em;
}

.clinic-doctor-approach p {
  max-inline-size: 48ch;
  margin: 0;
  color: #2b4537;
  font-size: clamp(17px, 1.4vw, 20.5px);
  line-height: 1.76;
  text-wrap: pretty;
  letter-spacing: -0.005em;
}

.clinic-doctor-credentials {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.07fr);
  gap: 14px 18px;
  margin: clamp(20px, 2vw, 29px) 0 0;
  padding-block: 15px 17px;
  border-block: 1px solid #d5dfce;
}

.clinic-doctor-credentials dt {
  margin-block-end: 4px;
  color: #4b6845;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.01em;
}

.clinic-doctor-credentials dd {
  max-inline-size: 28ch;
  margin: 0;
  color: #112a1d;
  font-size: 17px;
  font-weight: 700;
  line-height: 1.58;
}

.clinic-doctor-credentials bdi {
  color: #3f5d37;
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
}

.clinic-doctor-fields {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 10px;
  margin: 18px 0 0;
  padding: 0;
  list-style: none;
}

.clinic-doctor-fields li {
  display: inline-flex;
  align-items: center;
  padding: 5px 13px;
  border-radius: 999px;
  background: #f1f6ee;
  border: 1px solid #d9e6d4;
  color: #1f3d2a;
  font-size: 14px;
  font-weight: 600;
  font-family: Alex, 'Alexandria', sans-serif;
}

.clinic-doctor-fields li + li::before {
  display: none;
}`;

const newDoctorBlock = `.clinic-doctor-identity h2 {
  margin: 0;
  color: #0c2619;
  font: 800 clamp(32px, 3.8vw, 52px) / 1.25 Alex, 'Alexandria', sans-serif;
  letter-spacing: -0.018em;
  text-wrap: balance;
}

.clinic-doctor-identity p {
  display: inline-flex;
  align-items: center;
  margin: 12px 0 0;
  padding: 6px 14px;
  border-radius: 999px;
  background: #edf5eb;
  border: 1px solid #cfe2ca;
  color: #174228;
  font-size: clamp(15px, 1.25vw, 17.5px);
  font-weight: 700;
  font-family: Alex, 'Alexandria', sans-serif;
  letter-spacing: -0.01em;
}

.clinic-doctor-approach {
  margin-block-start: clamp(20px, 2.1vw, 30px);
  padding-inline-start: 20px;
  border-inline-start: 3px solid #578246;
}

.clinic-doctor-approach h3 {
  margin: 0 0 9px;
  color: #12311e;
  font: 800 clamp(17px, 1.3vw, 19px) / 1.4 Alex, 'Alexandria', sans-serif;
  letter-spacing: -0.01em;
}

.clinic-doctor-approach p {
  max-inline-size: 48ch;
  margin: 0;
  color: #264332;
  font-size: clamp(16px, 1.32vw, 18.5px);
  line-height: 1.82;
  font-weight: 500;
  font-family: Alex, 'Alexandria', sans-serif;
  text-wrap: pretty;
  letter-spacing: -0.005em;
}

.clinic-doctor-credentials {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.07fr);
  gap: 16px 20px;
  margin: clamp(20px, 2vw, 30px) 0 0;
  padding-block: 16px 18px;
  border-block: 1px solid #d5dfce;
}

.clinic-doctor-credentials dt {
  margin-block-end: 4px;
  color: #45663f;
  font-size: 13.5px;
  font-weight: 800;
  letter-spacing: 0.02em;
  font-family: Alex, 'Alexandria', sans-serif;
}

.clinic-doctor-credentials dd {
  max-inline-size: 28ch;
  margin: 0;
  color: #0f271a;
  font-size: 17.5px;
  font-weight: 750;
  line-height: 1.55;
  font-family: Alex, 'Alexandria', sans-serif;
}

.clinic-doctor-credentials bdi {
  color: #3b5a33;
  font-size: 14.5px;
  font-weight: 700;
  white-space: nowrap;
}

.clinic-doctor-fields {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 12px;
  margin: 20px 0 0;
  padding: 0;
  list-style: none;
}

.clinic-doctor-fields li {
  display: inline-flex;
  align-items: center;
  padding: 6px 15px;
  border-radius: 999px;
  background: #f2f7ef;
  border: 1.5px solid #d3e4cd;
  color: #183b25;
  font-size: 14.5px;
  font-weight: 700;
  font-family: Alex, 'Alexandria', sans-serif;
  box-shadow: 0 1px 3px rgba(18, 56, 32, 0.04);
  transition: all 0.2s ease;
}

.clinic-doctor-fields li + li::before {
  display: none;
}`;

if (introCss.includes(oldDoctorBlock)) {
  introCss = introCss.replace(oldDoctorBlock, newDoctorBlock);
  console.log('Successfully updated Dr. Rana section in clinic-intro.css');
} else {
  console.warn('Could not find oldDoctorBlock in clinic-intro.css');
}

// 1.3 Services Cards Typography & Duration Badge Highlighting
const oldDurationBlock = `.clinic-service-duration {
  margin-block-start: 9px;
  color: var(--service-muted);
  font-size: 15px;
}`;

const newDurationBlock = `.clinic-service-duration {
  display: inline-flex;
  align-items: center;
  align-self: flex-start;
  gap: 7px;
  margin-block-start: 12px;
  padding: 5px 12px;
  border-radius: 999px;
  background: #edf5ea;
  border: 1px solid #cee2ca;
  color: #154128;
  font-size: 14px;
  font-weight: 700;
  font-family: Alex, 'Alexandria', sans-serif;
  letter-spacing: -0.01em;
}

.clinic-service.is-featured .clinic-service-duration {
  background: rgba(255, 255, 255, 0.16);
  border: 1px solid rgba(255, 255, 255, 0.28);
  color: #ffffff;
  backdrop-filter: blur(8px);
}

.clinic-service:not(.is-featured) h3 {
  color: #102d20;
  font: 800 clamp(21px, 1.7vw, 25px) / 1.35 Alex, 'Alexandria', sans-serif;
  letter-spacing: -0.015em;
}

.clinic-service:not(.is-featured) .clinic-service-description {
  color: #274434;
  font-size: clamp(15.5px, 1.2vw, 16.5px);
  line-height: 1.72;
  font-weight: 500;
  font-family: Alex, 'Alexandria', sans-serif;
  margin-block-start: 8px;
}

.clinic-service:not(.is-featured) .clinic-service-period {
  color: #3b5f33;
  font-size: 15px;
  font-weight: 700;
  font-family: Alex, 'Alexandria', sans-serif;
}`;

if (introCss.includes(oldDurationBlock)) {
  introCss = introCss.replace(oldDurationBlock, newDurationBlock);
  console.log('Successfully updated services duration & card typography in clinic-intro.css');
} else {
  console.warn('Could not find oldDurationBlock in clinic-intro.css');
}

fs.writeFileSync(clinicIntroPath, introCss, 'utf8');

// ==========================================
// 2. Update stories.css for Client Cards Hover
// ==========================================
const storiesCssPath = path.resolve('client/src/styles/site/stories.css');
let storiesCss = fs.readFileSync(storiesCssPath, 'utf8').replace(/\r\n/g, '\n');

const oldFeedbackCardBlock = `.feedback-micro-card {
  position: relative;
  display: flex;
  min-width: 0;
  flex-direction: column;
  align-items: start;
  gap: 9px;
  padding: clamp(17px, 1.7vw, 24px);
  border: 1px solid #dce4d7;
  border-radius: 13px;
  background: #fffefa;
  transition: border-color 0.18s ease, background-color 0.18s ease;
}`;

const newFeedbackCardBlock = `.feedback-micro-card {
  position: relative;
  display: flex;
  min-width: 0;
  flex-direction: column;
  align-items: start;
  gap: 9px;
  padding: clamp(17px, 1.7vw, 24px);
  border: 1px solid #dce4d7;
  border-radius: 14px;
  background: #fffefa;
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1),
              box-shadow 0.25s cubic-bezier(0.16, 1, 0.3, 1),
              border-color 0.2s ease,
              background-color 0.2s ease;
}`;

const oldHoverBlock = `@media (hover: hover) {
  .feedback-micro-card:hover {
    background: #fbfcf8;
    border-color: #a3b998;
  }

  .feedback-micro-card:hover .fmc-view-screenshot-btn {
    text-decoration: underline;
    text-underline-offset: 4px;
  }
}`;

const newHoverBlock = `@media (hover: hover) {
  .feedback-micro-card:hover {
    transform: translateY(-4px);
    background: #ffffff;
    border-color: #88a97c;
    box-shadow: 0 14px 28px -6px rgba(15, 45, 27, 0.09), 0 2px 6px rgba(0, 0, 0, 0.02);
  }

  .feedback-micro-card:hover .fmc-headline {
    color: #0c291b;
  }

  .feedback-micro-card:hover .fmc-view-screenshot-btn {
    color: #124024;
    text-decoration: underline;
    text-underline-offset: 4px;
  }

  .feedback-micro-card:hover .fmc-view-screenshot-btn svg {
    transform: translateX(-3px);
  }
}

.fmc-view-screenshot-btn svg {
  transition: transform 0.2s ease;
}`;

if (storiesCss.includes(oldFeedbackCardBlock)) {
  storiesCss = storiesCss.replace(oldFeedbackCardBlock, newFeedbackCardBlock);
  console.log('Successfully updated feedback-micro-card in stories.css');
} else {
  console.warn('Could not find oldFeedbackCardBlock in stories.css');
}

if (storiesCss.includes(oldHoverBlock)) {
  storiesCss = storiesCss.replace(oldHoverBlock, newHoverBlock);
  console.log('Successfully updated feedback-micro-card:hover in stories.css');
} else {
  console.warn('Could not find oldHoverBlock in stories.css');
}

fs.writeFileSync(storiesCssPath, storiesCss, 'utf8');
console.log('All updates finished successfully!');
