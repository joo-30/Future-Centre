import { chromium } from 'playwright';

const chromeSystem = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const outDir = 'C:/Users/makah/.gemini/antigravity/brain/c5420236-75f6-4eb0-aed5-e6d16c5e7077';

async function main() {
  const browser = await chromium.launch({ executablePath: chromeSystem, headless: true });

  const viewports = [
    { name: 'mobile_375', w: 375, h: 812 },
    { name: 'mobile_390', w: 390, h: 844 },
    { name: 'tablet_portrait_768', w: 768, h: 1024 },
    { name: 'tablet_landscape_1024', w: 1024, h: 768 },
    { name: 'laptop_1366', w: 1366, h: 768 },
    { name: 'desktop_1440', w: 1440, h: 900 }
  ];

  for (const vp of viewports) {
    const page = await browser.newPage();
    await page.setViewportSize({ width: vp.w, height: vp.h });
    await page.goto('http://127.0.0.1:5176/login', { waitUntil: 'networkidle' });
    await page.waitForTimeout(650);

    const shotPath = `${outDir}/concept1_${vp.name}.png`;
    await page.screenshot({ path: shotPath });
    console.log(`Saved screenshot: concept1_${vp.name}.png`);
    await page.close();
  }

  await browser.close();
  console.log('All Concept 1 screenshots saved successfully!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
