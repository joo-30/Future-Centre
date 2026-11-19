import fs from 'fs';
import { chromium } from 'playwright';

const chromeSystem = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function testAmbientPresentation() {
  const browser = await chromium.launch({ executablePath: chromeSystem, headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto('http://127.0.0.1:5176/login', { waitUntil: 'networkidle' });

  // Style .access-visual with ambient blurred backdrop + uncropped crisp foreground
  await page.evaluate(() => {
    const visual = document.querySelector('.access-visual');
    if (!visual) return;

    visual.innerHTML = `
      <div style="position: absolute; inset: -30px; background: url('/assets/concept_2_nutrition_vitality.jpg') center center / cover no-repeat; filter: blur(36px) saturate(1.2) brightness(0.85); transform: scale(1.08); z-index: 1;"></div>
      <div style="position: absolute; inset: 0; background: linear-gradient(135deg, rgba(6, 43, 33, 0.45) 0%, rgba(6, 43, 33, 0.2) 100%); z-index: 2;"></div>
      <div style="position: relative; z-index: 3; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; padding: 32px;">
        <div style="position: relative; width: 100%; max-width: 760px; aspect-ratio: 16 / 9; border-radius: 20px; overflow: hidden; box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.15); transform: translateY(-8px);">
          <img src="/assets/concept_2_nutrition_vitality.jpg" alt="Nutrition & Vitality" style="width: 100%; height: 100%; object-fit: cover; display: block;" />
        </div>
      </div>
    `;
  });

  await page.waitForTimeout(600);
  const shotPath = 'C:/Users/makah/.gemini/antigravity/brain/e2976ba3-c954-4b1f-8cdb-775aa48d6049/test_ambient_uncropped_laptop.png';
  await page.screenshot({ path: shotPath });
  console.log('Saved ambient test:', shotPath);

  await browser.close();
}

testAmbientPresentation().catch(console.error);
