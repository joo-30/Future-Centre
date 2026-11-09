import { chromium } from 'playwright';

const chromeSystem = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function main() {
  const browser = await chromium.launch({ executablePath: chromeSystem, headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto('http://127.0.0.1:5176/login');
  const btn = page.locator('.quick-login-panel button:has-text("Admin")');
  if (await btn.count() > 0) await btn.click();
  await page.waitForTimeout(800);
  await page.goto('http://127.0.0.1:5176/admin');
  await page.waitForTimeout(800);

  const res = await page.evaluate(() => {
    const a = document.querySelector('.console-sidebar nav a');
    const cs = getComputedStyle(a);
    return {
      innerHTML: a.innerHTML,
      box: a.getBoundingClientRect(),
      display: cs.display,
      minHeight: cs.minHeight,
      padding: cs.padding,
      fontSize: cs.fontSize,
      whiteSpace: cs.whiteSpace,
      flexDirection: cs.flexDirection,
    };
  });
  console.log(res);
  await browser.close();
}

main();
