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

  const matched = await page.evaluate(() => {
    const el = document.querySelector('.console-sidebar');
    const rules = [];
    for (const sheet of Array.from(document.styleSheets)) {
      try {
        for (const rule of Array.from(sheet.cssRules || [])) {
          if (rule.selectorText && el.matches(rule.selectorText)) {
            rules.push({
              selector: rule.selectorText,
              cssText: rule.cssText,
              href: sheet.href,
            });
          }
        }
      } catch (e) {}
    }
    return rules;
  });

  console.log(JSON.stringify(matched, null, 2));
  await browser.close();
}

main();
