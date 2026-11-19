import { chromium } from 'playwright';

const chromeSystem = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const outDir = 'C:/Users/makah/.gemini/antigravity/brain/c5420236-75f6-4eb0-aed5-e6d16c5e7077';

async function main() {
  const browser = await chromium.launch({ executablePath: chromeSystem, headless: true });

  const viewports = [
    { name: '375', w: 375, h: 812 },
    { name: '768', w: 768, h: 1024 },
    { name: '1280', w: 1280, h: 800 },
    { name: '1366', w: 1366, h: 768 },
    { name: '1440', w: 1440, h: 900 }
  ];

  for (const vp of viewports) {
    const page = await browser.newPage();
    await page.setViewportSize({ width: vp.w, height: vp.h });
    await page.goto('http://127.0.0.1:5176/login', { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);

    const shotPath = `${outDir}/phase1_login_${vp.name}.png`;
    await page.screenshot({ path: shotPath });
    console.log(`Saved screenshot: phase1_login_${vp.name}.png`);
    await page.close();
  }

  await browser.close();
  console.log('All Phase 1 login screenshots saved successfully!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
