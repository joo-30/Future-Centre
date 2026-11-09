import { chromium } from 'playwright';

const chromeSystem = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function main() {
  const browser = await chromium.launch({ executablePath: chromeSystem, headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto('http://127.0.0.1:5176/login');
  await page.click('.quick-login-panel button:has-text("Admin")');
  await page.waitForURL('**/admin**');
  await page.waitForTimeout(1000);

  const debug = await page.evaluate(() => {
    const el = document.querySelector('.console-sidebar');
    const matched = [];
    for (const sheet of document.styleSheets) {
      try {
        function checkRules(rules) {
          for (const rule of rules) {
            if (rule.cssRules) {
              checkRules(rule.cssRules);
            }
            if (rule.selectorText && rule.selectorText.includes('.console-sidebar')) {
              matched.push({
                selector: rule.selectorText,
                media: rule.parentRule && rule.parentRule.media ? rule.parentRule.media.mediaText : 'none',
                cssText: rule.cssText
              });
            }
          }
        }
        checkRules(sheet.cssRules || []);
      } catch (e) {}
    }
    return matched;
  });

  console.log('All rules matching .console-sidebar:');
  debug.forEach(r => {
    console.log(`[Media: ${r.media}] ${r.cssText.slice(0, 150)}...`);
  });

  await browser.close();
}

main().catch(console.error);
