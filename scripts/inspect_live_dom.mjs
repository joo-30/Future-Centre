import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true
  });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 1200 });
  await page.goto('http://127.0.0.1:5176', { waitUntil: 'networkidle' });
  
  const info = await page.evaluate(() => {
    const services = document.querySelector('.clinic-services');
    const intro = document.querySelector('.clinic-intro');
    const doc = document.querySelector('.clinic-doctor-profile');
    const stories = document.querySelector('.stories-section');
    return {
      services: services ? {
        className: services.className,
        gridClassName: services.querySelector('div, ol')?.className,
        cardsCount: services.querySelectorAll('.clinic-service-card, .clinic-service').length,
        firstCardClass: services.querySelector('.clinic-service-card, .clinic-service')?.className
      } : null,
      introIndex: intro ? {
        indexClass: intro.querySelector('.clinic-intro-index')?.className,
        itemsCount: intro.querySelectorAll('.clinic-index-item').length
      } : null,
      stories: stories ? {
        title: stories.querySelector('h2, h3, .block-title')?.innerText,
        images: Array.from(stories.querySelectorAll('img')).map(i => i.src)
      } : null
    };
  });
  console.log('Page info:', JSON.stringify(info, null, 2));
  await browser.close();
}

main().catch(console.error);
