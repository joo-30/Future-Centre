import { chromium } from 'playwright';

const chromeSystem = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function testViewportFixed() {
  const browser = await chromium.launch({ executablePath: chromeSystem, headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1366, height: 768 });
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

  await page.waitForTimeout(600);
  const shotPath = 'C:/Users/makah/.gemini/antigravity/brain/e2976ba3-c954-4b1f-8cdb-775aa48d6049/test_viewport_fixed_1366.png';
  await page.screenshot({ path: shotPath });
  console.log('Saved test viewport fixed screenshot:', shotPath);

  await browser.close();
}

testViewportFixed().catch(console.error);
