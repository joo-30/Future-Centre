import { chromium } from '@playwright/test';

const chromeSystem = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function main() {
  const browser = await chromium.launch({ executablePath: chromeSystem, headless: true });
  const page = await browser.newPage({ viewport: { width: 375, height: 800 } });
  
  // 1. Quick login as patient
  await page.goto('http://127.0.0.1:5176/login', { waitUntil: 'networkidle' });
  const userBtn = await page.$('.quick-login-panel button:has-text("User")');
  if (userBtn) {
    await userBtn.click();
    await page.waitForTimeout(1000);
  }

  // Go to account
  await page.goto('http://127.0.0.1:5176/account', { waitUntil: 'networkidle' });

  const data = await page.evaluate(() => {
    const person = document.querySelector('.member-person');
    const nav = document.querySelector('.member-nav nav');
    const settings = document.querySelector('.member-settings');
    const summary = document.querySelector('.member-summary');
    return {
      personHTML: person?.innerHTML,
      personRect: person?.getBoundingClientRect(),
      navButtons: nav ? Array.from(nav.querySelectorAll('button')).map(b => ({
        text: b.innerText,
        rect: b.getBoundingClientRect(),
        cs: {
          display: getComputedStyle(b).display,
          width: getComputedStyle(b).width,
          whiteSpace: getComputedStyle(b).whiteSpace,
        }
      })) : [],
      settingsHTML: settings?.innerHTML,
      summaryHTML: summary?.innerHTML,
    };
  });

  console.log(JSON.stringify(data, null, 2));

  const memberNav = await page.$('.member-nav');
  if (memberNav) {
    await memberNav.screenshot({ path: 'Future-Center/scripts/shot_member_nav_mobile.png' });
    console.log('Saved shot_member_nav_mobile.png');
  }

  await browser.close();
}

main().catch(console.error);
