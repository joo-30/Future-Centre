import { chromium } from 'playwright';

const chromeSystem = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function testClean5050() {
  const browser = await chromium.launch({ executablePath: chromeSystem, headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto('http://127.0.0.1:5176/login', { waitUntil: 'networkidle' });

  // Apply clean 50/50 balanced layout
  await page.addStyleTag({
    content: `
      @media (min-width: 921px) {
        .access-page {
          display: grid !important;
          grid-template-columns: 1fr 1fr !important;
          height: auto !important;
          min-height: 100dvh !important;
          max-height: none !important;
          overflow: visible !important;
          background: #f8faf6 !important;
        }

        .access-form-area {
          height: auto !important;
          min-height: 100dvh !important;
          overflow: visible !important;
          padding: 40px 48px !important;
          display: flex !important;
          flex-direction: column !important;
          justify-content: center !important;
          align-items: center !important;
          max-width: 580px !important;
          margin: 0 auto !important;
          width: 100% !important;
          box-sizing: border-box !important;
        }

        .access-top {
          width: 100% !important;
          max-width: 480px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: space-between !important;
          gap: 12px !important;
          margin-bottom: 24px !important;
          flex-wrap: nowrap !important;
        }

        .access-top .brand {
          flex-shrink: 0 !important;
        }

        .access-top-actions {
          display: flex !important;
          align-items: center !important;
          gap: 8px !important;
          flex-shrink: 0 !important;
        }

        .auth-card-elevated {
          width: 100% !important;
          max-width: 480px !important;
          margin: 0 auto !important;
          box-sizing: border-box !important;
        }

        .access-visual {
          position: sticky !important;
          top: 0 !important;
          height: 100vh !important;
          max-height: 100vh !important;
          width: 100% !important;
          overflow: hidden !important;
          background: #041f17 !important;
          border: none !important;
          padding: 0 !important;
          margin: 0 !important;
        }

        .access-visual .showcase-img {
          position: absolute !important;
          inset: 0 !important;
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important;
          object-position: center bottom !important;
          display: block !important;
        }
      }
    `
  });

  await page.waitForTimeout(600);
  const shotPath = 'C:/Users/makah/.gemini/antigravity/brain/e2976ba3-c954-4b1f-8cdb-775aa48d6049/test_clean_50_50_laptop.png';
  await page.screenshot({ path: shotPath });
  console.log('Saved test 50/50 screenshot:', shotPath);

  await browser.close();
}

testClean5050().catch(console.error);
