import { chromium } from 'playwright';

const chromeSystem = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const outDir = 'C:/Users/makah/.gemini/antigravity/brain/e2976ba3-c954-4b1f-8cdb-775aa48d6049';

async function main() {
  const browser = await chromium.launch({ executablePath: chromeSystem, headless: true });

  const viewports = [
    { name: 'laptop_1366', w: 1366, h: 768 },
    { name: 'laptop_1280', w: 1280, h: 800 },
    { name: 'desktop_1440', w: 1440, h: 900 },
    { name: 'desktop_1920', w: 1920, h: 1080 },
    { name: 'tablet_768', w: 768, h: 1024 },
    { name: 'mobile_375', w: 375, h: 812 }
  ];

  for (const vp of viewports) {
    const page = await browser.newPage();
    await page.setViewportSize({ width: vp.w, height: vp.h });
    await page.goto('http://127.0.0.1:5176/login', { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);

    const shotPath = `${outDir}/final_auth_${vp.name}.png`;
    await page.screenshot({ path: shotPath });
    console.log(`Saved screenshot: final_auth_${vp.name}.png`);
    await page.close();
  }

  await browser.close();
  console.log('All final auth screenshots saved successfully!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
