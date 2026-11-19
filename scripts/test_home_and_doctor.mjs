import { chromium } from 'playwright';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const outDir = 'C:\\Users\\makah\\.gemini\\antigravity\\brain\\e2976ba3-c954-4b1f-8cdb-775aa48d6049';

async function capture() {
  const browser = await chromium.launch({ executablePath: chromePath, headless: true });

  // 1. Desktop 1440px
  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto('http://127.0.0.1:5176/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Hero section
    const hero = page.locator('.clinic-intro');
    if (await hero.isVisible()) {
      await hero.screenshot({ path: path.join(outDir, 'verify_home_hero_desktop.png') });
      console.log('Saved verify_home_hero_desktop.png');
    }

    // Dedicated Doctor Profile Section
    const doctorProfile = page.locator('#doctor-profile');
    if (await doctorProfile.isVisible()) {
      await doctorProfile.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
      await doctorProfile.screenshot({ path: path.join(outDir, 'verify_doctor_section_desktop.png') });
      console.log('Saved verify_doctor_section_desktop.png');
    }

    await page.close();
  }

  // 2. Mobile 375px
  {
    const page = await browser.newPage({ viewport: { width: 375, height: 812 } });
    await page.goto('http://127.0.0.1:5176/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Hero section mobile
    const hero = page.locator('.clinic-intro');
    if (await hero.isVisible()) {
      await hero.screenshot({ path: path.join(outDir, 'verify_home_hero_mobile.png') });
      console.log('Saved verify_home_hero_mobile.png');
    }

    // Dedicated Doctor Profile Section mobile
    const doctorProfile = page.locator('#doctor-profile');
    if (await doctorProfile.isVisible()) {
      await doctorProfile.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
      await doctorProfile.screenshot({ path: path.join(outDir, 'verify_doctor_section_mobile.png') });
      console.log('Saved verify_doctor_section_mobile.png');
    }

    await page.close();
  }

  await browser.close();
  console.log('Completed capturing home and doctor sections!');
}

capture().catch((e) => {
  console.error(e);
  process.exit(1);
});
