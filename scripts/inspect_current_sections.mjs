import { chromium } from 'playwright';

const chromeSystem = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function check() {
  const browser = await chromium.launch({ executablePath: chromeSystem, headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://127.0.0.1:5176/', { waitUntil: 'networkidle' });
  
  const ribbonBox = await page.$eval('.clinic-intro-index', el => ({
    width: el.offsetWidth,
    height: el.offsetHeight,
    items: Array.from(el.querySelectorAll('.clinic-index-item')).map(it => ({
      title: it.querySelector('.clinic-index-title')?.innerText,
      desc: it.querySelector('.clinic-index-desc')?.innerText,
      width: it.offsetWidth
    }))
  }));
  console.log('Index bar:', JSON.stringify(ribbonBox, null, 2));

  const docBox = await page.$eval('.clinic-doctor-profile', el => ({
    width: el.offsetWidth,
    height: el.offsetHeight,
    hasImg: !!el.querySelector('img'),
    imgSrc: el.querySelector('img')?.getAttribute('src'),
    credsCount: el.querySelectorAll('.clinic-doctor-credentials li').length
  }));
  console.log('Doctor:', JSON.stringify(docBox, null, 2));

  await browser.close();
}

check().catch(console.error);
