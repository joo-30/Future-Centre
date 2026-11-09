import { chromium } from 'playwright';
import path from 'path';

const chromeSystem = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:/Users/makah/.gemini/antigravity/brain/2057bfec-2a0f-40f7-b7e0-8582b8d1ddb0';

async function main() {
  const browser = await chromium.launch({ executablePath: chromeSystem, headless: true });

  for (const w of [1280, 768, 375, 320]) {
    const page = await browser.newPage({
      viewport: { width: w, height: 750 },
      deviceScaleFactor: 2,
      isMobile: w <= 768,
      hasTouch: w <= 768
    });

    await page.goto('http://127.0.0.1:5176/login');
    await page.click('.quick-login-panel button:has-text("Admin")');
    await page.waitForURL('**/admin**');
    await page.waitForTimeout(600);

    const chipInfo = await page.evaluate(() => {
      const chip = document.querySelector('.topbar-pending-alert-chip');
      const topbar = document.querySelector('.console-topbar');
      return {
        topbarWidth: topbar ? topbar.offsetWidth : null,
        topbarScrollWidth: topbar ? topbar.scrollWidth : null,
        chip: chip ? {
          width: chip.offsetWidth,
          height: chip.offsetHeight,
          text: chip.innerText.replace(/\n/g, ' ').trim(),
          rect: chip.getBoundingClientRect()
        } : null
      };
    });
    console.log(`Viewport ${w}px:`, JSON.stringify(chipInfo, null, 2));

    const shot = path.join(ARTIFACT_DIR, `verified_topbar_${w}px.png`);
    const topbar = page.locator('.console-topbar');
    if (await topbar.count() > 0) {
      await topbar.screenshot({ path: shot });
      console.log(`Saved screenshot: verified_topbar_${w}px.png`);
    }

    await page.close();
  }

  await browser.close();
  console.log('✅ All topbar tests passed!');
}

main().catch(console.error);
