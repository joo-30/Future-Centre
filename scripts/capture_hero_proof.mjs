import { chromium } from 'playwright';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const browser = await chromium.launch({ executablePath: edgePath, headless: true });

// Desktop 1440px Full Hero
const pageDesktop = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await pageDesktop.goto('http://127.0.0.1:5176/', { waitUntil: 'networkidle' });
await pageDesktop.evaluate(() => document.fonts.ready);
await pageDesktop.waitForTimeout(600);
await pageDesktop.screenshot({
  path: 'C:/Users/makah/.gemini/antigravity/brain/e2976ba3-c954-4b1f-8cdb-775aa48d6049/proof-v2-desktop-hero-fullwidth.png',
  fullPage: false
});

// Desktop BMI Calculator
await pageDesktop.evaluate(() => {
  const el = document.getElementById('bmi-calculator');
  if (el) el.scrollIntoView({ behavior: 'instant' });
});
await pageDesktop.waitForTimeout(600);
await pageDesktop.screenshot({
  path: 'C:/Users/makah/.gemini/antigravity/brain/e2976ba3-c954-4b1f-8cdb-775aa48d6049/proof-v2-desktop-bmi-calc.png',
  fullPage: false
});

// Mobile 390px Top Hero
const pageMobile = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true });
await pageMobile.goto('http://127.0.0.1:5176/', { waitUntil: 'networkidle' });
await pageMobile.evaluate(() => document.fonts.ready);
await pageMobile.waitForTimeout(600);
await pageMobile.screenshot({
  path: 'C:/Users/makah/.gemini/antigravity/brain/e2976ba3-c954-4b1f-8cdb-775aa48d6049/proof-v2-mobile-hero-top.png',
  fullPage: false
});

// Mobile 390px Doctor Card
await pageMobile.evaluate(() => {
  const el = document.querySelector('.hero-doctor-showcase');
  if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
});
await pageMobile.waitForTimeout(600);
await pageMobile.screenshot({
  path: 'C:/Users/makah/.gemini/antigravity/brain/e2976ba3-c954-4b1f-8cdb-775aa48d6049/proof-v2-mobile-doctor-card.png',
  fullPage: false
});

await browser.close();
console.log('✅ All v2 proof screenshots captured successfully!');
