import fs from 'fs';
import path from 'path';

const cssPath = path.resolve('client/src/styles/portal/auth.css');
let css = fs.readFileSync(cssPath, 'utf8');

// Ensure .access-visual has flex layout to anchor bottom content cleanly
const oldVisual = `.access-visual {
  position: relative;
  min-height: 100%;
  background: transparent;
  overflow: hidden;
  padding: 20px 0 20px 24px;
  box-sizing: border-box;
}`;

const newVisual = `.access-visual {
  position: relative;
  min-height: 100%;
  background: transparent;
  overflow: hidden;
  padding: 32px 32px 36px 36px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}`;

css = css.replace(oldVisual.replace(/\r?\n/g, '\r\n'), newVisual.replace(/\n/g, '\r\n'));

// Ensure showcase-bg-wrap has balanced insets
const oldBgWrap = `.showcase-bg-wrap {
  position: absolute;
  inset: 20px 0 20px 24px;
  border-radius: 28px;
  overflow: hidden;
  border: 1px solid rgba(20, 68, 42, 0.12);
  box-shadow: 0 24px 60px -15px rgba(6, 43, 33, 0.16), 0 4px 16px rgba(0, 0, 0, 0.04);
  background: #041f17;
  z-index: 0;
}`;

const newBgWrap = `.showcase-bg-wrap {
  position: absolute;
  inset: 16px 16px 16px 20px;
  border-radius: 26px;
  overflow: hidden;
  border: 1px solid rgba(20, 68, 42, 0.12);
  box-shadow: 0 24px 60px -15px rgba(6, 43, 33, 0.16), 0 4px 16px rgba(0, 0, 0, 0.04);
  background: #041f17;
  z-index: 0;
}`;

css = css.replace(oldBgWrap.replace(/\r?\n/g, '\r\n'), newBgWrap.replace(/\n/g, '\r\n'));

// Add Mobile Showcase styles and Mobile Footer
const mobileShowcaseCss = `
/* ==========================================================================
   MOBILE NUTRITION SHOWCASE BANNER (Clean quiet-luxury preview)
   ========================================================================== */
.mobile-nutrition-showcase {
  display: none;
}

.access-mobile-footer {
  text-align: center;
  margin-top: 24px;
  color: #64748b;
  font-size: 12px;
  line-height: 1.6;
}

@media (max-width: 920px) {
  .mobile-nutrition-showcase {
    display: block;
    margin-bottom: 18px;
    border-radius: 18px;
    overflow: hidden;
    position: relative;
    height: 145px;
    box-shadow: 0 6px 20px -4px rgba(6, 43, 33, 0.12);
    border: 1px solid rgba(20, 68, 42, 0.14);
  }
  .mob-showcase-img-wrap {
    position: relative;
    width: 100%;
    height: 100%;
  }
  .mob-showcase-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center 42%;
    display: block;
  }
  .mob-showcase-gradient {
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(6, 43, 33, 0.15) 0%, rgba(4, 31, 23, 0.88) 100%);
  }
  .mob-showcase-overlay-content {
    position: absolute;
    bottom: 12px;
    right: 14px;
    left: 14px;
    color: #ffffff;
    z-index: 2;
  }
  .mob-showcase-chip {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 3px 10px;
    background: rgba(6, 43, 33, 0.88);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(255, 255, 255, 0.22);
    border-radius: 9999px;
    font-size: 11px;
    font-weight: 700;
    color: #a7f3d0;
    margin-bottom: 4px;
  }
  .mob-showcase-title {
    margin: 0;
    font-size: 13.5px;
    font-weight: 700;
    color: #ffffff;
    line-height: 1.35;
  }
}
`;

css += mobileShowcaseCss;

fs.writeFileSync(cssPath, css, 'utf8');
console.log('Successfully updated auth.css for split layout with image!');
