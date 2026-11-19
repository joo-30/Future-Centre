import fs from 'fs';
import path from 'path';

const cssPath = path.resolve('client/src/styles/site/clinic-intro.css');
let css = fs.readFileSync(cssPath, 'utf8');

const oldProfileBlock = `.clinic-doctor-profile {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 20px clamp(28px, 7vw, 100px);
  max-width: 1296px;
  margin: clamp(32px, 5vw, 72px) auto;
  padding: clamp(24px, 4vw, 48px);
  background: var(--clinic-paper);
  border-block: 1px solid var(--clinic-rule);
  color: var(--clinic-evergreen);
  scroll-margin-block-start: 100px;
}

.clinic-doctor-profile h2 {
  font-size: clamp(24px, 3vw, 38px);
  line-height: 1.4;
}

.clinic-doctor-profile p {
  max-width: 45ch;
  margin-block-start: 8px;
  font-size: 17px;
}

.clinic-doctor-profile ul {
  margin: 0;
  padding: 0;
  list-style: none;
}

.clinic-doctor-profile li {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-block: 10px;
  border-block-end: 1px solid var(--clinic-rule);
}

.clinic-doctor-profile li:last-child {
  border-block-end: 0;
}

.clinic-doctor-profile li svg {
  flex: 0 0 auto;
  color: var(--clinic-muted);
}`;

const newProfileBlock = `/* ==========================================================================
   DEDICATED DOCTOR PROFILE SHOWCASE (Single Official Showcase)
   ========================================================================== */
.clinic-doctor-profile {
  display: block;
  max-width: 1296px;
  margin: clamp(48px, 6vw, 90px) auto;
  padding: 0 clamp(16px, 4.5vw, 60px);
  scroll-margin-block-start: 100px;
}

.doctor-profile-grid {
  display: grid;
  grid-template-columns: minmax(0, 0.85fr) minmax(0, 1.15fr);
  gap: clamp(28px, 5vw, 64px);
  align-items: center;
  background: #ffffff;
  border: 1px solid #dce5d8;
  border-radius: 26px;
  padding: clamp(24px, 4vw, 48px);
  box-shadow:
    0 1px 3px rgba(18, 59, 52, 0.03),
    0 14px 40px -8px rgba(18, 59, 52, 0.08);
}

.doctor-profile-visual {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.doctor-photo-card {
  position: relative;
  border-radius: 20px;
  overflow: hidden;
  background: #e8eee4;
  box-shadow: 0 8px 26px -4px rgba(18, 59, 52, 0.12);
  aspect-ratio: 4 / 4.8;
}

.doctor-main-photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 22%;
  display: block;
  transition: transform 0.4s ease;
}

.doctor-photo-card:hover .doctor-main-photo {
  transform: scale(1.02);
}

.doctor-badge-floating {
  position: absolute;
  bottom: 14px;
  right: 14px;
  left: 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: rgba(18, 59, 52, 0.94);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(220, 232, 178, 0.35);
  border-radius: 14px;
  color: #fffdf5;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15);
}

.badge-emaso-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(220, 232, 178, 0.22);
  color: #dce8b2;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.doctor-badge-floating strong {
  display: block;
  font-size: 13.5px;
  font-weight: 700;
  color: #dce8b2;
  line-height: 1.3;
}

.doctor-badge-floating span {
  display: block;
  font-size: 11.5px;
  color: #e5edd8;
  margin-top: 2px;
}

.doctor-stats-ribbon {
  display: flex;
  align-items: center;
  justify-content: space-around;
  background: #f7faf5;
  border: 1px solid #dce7d9;
  border-radius: 14px;
  padding: 12px 14px;
}

.doc-ribbon-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.ribbon-num {
  font-family: 'Alexandria', sans-serif;
  font-size: 17px;
  font-weight: 800;
  color: #123b34;
}

.ribbon-lbl {
  font-size: 11px;
  font-weight: 600;
  color: #587168;
  margin-top: 2px;
}

.doc-ribbon-divider {
  width: 1px;
  height: 26px;
  background: #dce7d9;
}

.doctor-profile-details {
  display: flex;
  flex-direction: column;
}

.doctor-kicker {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 5px 12px;
  background: #eef5ea;
  border: 1px solid #d4e5ce;
  border-radius: 9999px;
  color: #1a5649;
  font-size: 12px;
  font-weight: 700;
  width: fit-content;
  margin-bottom: 12px;
}

.doctor-profile-details h2 {
  font-family: 'Alexandria', sans-serif;
  font-size: clamp(26px, 3.2vw, 36px);
  font-weight: 800;
  color: #123b34;
  margin: 0 0 6px;
  letter-spacing: -0.4px;
  line-height: 1.25;
}

.doctor-subtitle {
  font-size: 15px;
  font-weight: 600;
  color: #4b6b60;
  margin: 0 0 16px;
}

.doctor-philosophy-quote {
  background: #fafbf8;
  border-inline-start: 4px solid #1a5649;
  padding: 12px 18px;
  border-radius: 0 12px 12px 0;
  margin-bottom: 22px;
}

.doctor-philosophy-quote p {
  font-size: 14.5px;
  line-height: 1.7;
  color: #274b41;
  margin: 0;
  font-style: italic;
}

.doctor-credentials-list {
  list-style: none;
  padding: 0;
  margin: 0 0 24px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.doctor-credentials-list li {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.cred-icon-wrap {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: #eef6ec;
  border: 1px solid #d2e5ce;
  color: #166852;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 2px;
}

.doctor-credentials-list strong {
  display: block;
  font-size: 14.5px;
  font-weight: 700;
  color: #123b34;
  line-height: 1.4;
}

.doctor-credentials-list span {
  display: block;
  font-size: 13px;
  line-height: 1.55;
  color: #557166;
  margin-top: 2px;
}

.doctor-cta-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
}

.btn-doctor-book {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #123b34 0%, #1a5649 100%);
  color: #ffffff;
  border-radius: 12px;
  font-size: 14.5px;
  font-weight: 700;
  text-decoration: none;
  box-shadow: 0 4px 14px rgba(18, 59, 52, 0.22);
  transition: all 0.2s ease;
}

.btn-doctor-book:hover {
  background: #0d2e29;
  transform: translateY(-1.5px);
  box-shadow: 0 6px 20px rgba(18, 59, 52, 0.32);
}

.btn-doctor-wa {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: #ffffff;
  border: 1.5px solid #25d366;
  color: #128c7e;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 700;
  text-decoration: none;
  transition: all 0.2s ease;
}

.btn-doctor-wa:hover {
  background: #f0fdf4;
  border-color: #128c7e;
  transform: translateY(-1.5px);
}

@media (max-width: 900px) {
  .doctor-profile-grid {
    grid-template-columns: minmax(0, 1fr);
  }
  .doctor-photo-card {
    max-width: 400px;
    margin: 0 auto;
    width: 100%;
  }
}

@media (max-width: 520px) {
  .doctor-profile-grid {
    padding: 20px 16px;
    border-radius: 20px;
  }
  .doctor-cta-actions {
    flex-direction: column;
    width: 100%;
  }
  .btn-doctor-book,
  .btn-doctor-wa {
    width: 100%;
    justify-content: center;
  }
}`;

css = css.replace(oldProfileBlock.replace(/\r?\n/g, '\r\n'), newProfileBlock.replace(/\n/g, '\r\n'));

// Clean up duplicate media query at bottom if present
const oldMedia = `  .clinic-doctor-profile {
    grid-template-columns: minmax(0, 1fr);
    margin-inline: 14px;
  }`;
css = css.replace(oldMedia.replace(/\r?\n/g, '\r\n'), '');

fs.writeFileSync(cssPath, css, 'utf8');
console.log('Successfully updated clinic-intro.css!');
