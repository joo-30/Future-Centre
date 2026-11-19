import { chromium } from 'playwright';

const chromeSystem = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function testAllResolutions() {
  const browser = await chromium.launch({ executablePath: chromeSystem, headless: true });

  const viewports = [
    { name: '1366x768_laptop', w: 1366, h: 768 },
    { name: '1280x800_laptop', w: 1280, h: 800 },
    { name: '1440x900_desktop', w: 1440, h: 900 },
    { name: '1920x1080_fhd', w: 1920, h: 1080 },
    { name: '1024x768_small', w: 1024, h: 768 }
  ];

  for (const vp of viewports) {
    const page = await browser.newPage();
    await page.setViewportSize({ width: vp.w, height: vp.h });
    await page.goto('http://127.0.0.1:5176/login', { waitUntil: 'networkidle' });

    await page.addStyleTag({
      content: `
        @media (min-width: 921px) {
          .access-page {
            height: 100vh !important;
            max-height: 100dvh !important;
            overflow: hidden !important;
            grid-template-columns: minmax(380px, 480px) 1fr !important;
          }
          .access-form-area {
            height: 100vh !important;
            overflow-y: auto !important;
          }
          .access-visual {
            height: 100vh !important;
            max-height: 100vh !important;
            position: relative !important;
            overflow: hidden !important;
          }
          .access-visual .showcase-img {
            width: 100% !important;
            height: 100% !important;
            object-fit: cover !important;
            object-position: center bottom !important;
          }
        }
      `
    });
    await page.waitForTimeout(400);

    const shotPath = `C:/Users/makah/.gemini/antigravity/brain/e2976ba3-c954-4b1f-8cdb-775aa48d6049/resolution_test_${vp.name}.png`;
    await page.screenshot({ path: shotPath });
    console.log(`Saved: ${vp.name}`);
    await page.close();
  }

  await browser.close();
  console.log('All resolution tests completed!');
}

testAllResolutions().catch(console.error);
