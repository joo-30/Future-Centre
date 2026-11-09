import { chromium } from 'playwright';

const chromeSystem = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function main() {
  const browser = await chromium.launch({ executablePath: chromeSystem, headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  
  await page.goto('http://127.0.0.1:5176/login', { waitUntil: 'networkidle' });
  const adminBtn = await page.$('.quick-login-panel button:has-text("Admin")');
  if (adminBtn) {
    await adminBtn.click();
    await page.waitForTimeout(1000);
  }

  await page.goto('http://127.0.0.1:5176/admin', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  const res = await page.evaluate(() => {
    const a = document.querySelector('.console-sidebar nav a');
    const cs = getComputedStyle(a);
    const sidebar = document.querySelector('.console-sidebar');
    const sidebarCS = getComputedStyle(sidebar);
    return {
      sidebarWidth: sidebarCS.width,
      sidebarPadding: sidebarCS.padding,
      sidebarBoxSizing: sidebarCS.boxSizing,
      aPadding: cs.padding,
      aMargin: cs.margin,
      aBorder: cs.border,
      aLineHeight: cs.lineHeight,
      aHeight: cs.height,
    };
  });

  console.log(res);
  await browser.close();
}

main();
