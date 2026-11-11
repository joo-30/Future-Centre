import fs from 'node:fs';
import path from 'node:path';
import { chromium } from '@playwright/test';

const chromeSystem = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:/Users/asus1/.gemini/antigravity/brain/737eb81e-624f-4504-b938-d04ece747f9b/site_tour';

async function testInteractions() {
  const browser = await chromium.launch({ executablePath: chromeSystem, headless: true });

  // 1. Booking Step 2 and Step 3
  const page1 = await browser.newPage();
  await page1.setViewportSize({ width: 1440, height: 900 });
  await page1.goto('http://127.0.0.1:5176/booking', { waitUntil: 'networkidle' });
  await page1.waitForTimeout(600);
  
  // In booking step 1, click next/continue button
  const continueBtn = page1.locator('button:has-text("متابعة"), button:has-text("التالي"), button:has-text("اختيار الموعد")').first();
  if (await continueBtn.isVisible()) {
    await continueBtn.click();
    await page1.waitForTimeout(800);
    await page1.screenshot({ path: path.join(ARTIFACT_DIR, '05b_booking_step2_slots.png') });
  }
  await page1.close();

  // 2. Admin side - Check BMI page & Patient tabs
  const page2 = await browser.newPage();
  await page2.setViewportSize({ width: 1440, height: 900 });
  await page2.goto('http://127.0.0.1:5176/login', { waitUntil: 'networkidle' });
  await page2.click('button.role-admin');
  await page2.waitForTimeout(1500);

  // Check BMI calculator in admin
  const bmiLink = await page2.evaluate(() => {
    const a = Array.from(document.querySelectorAll('aside a, nav a')).find(el => el.innerText.includes('حاسبة'));
    return a ? a.getAttribute('href') : null;
  });
  console.log('BMI Admin Link:', bmiLink);
  if (bmiLink) {
    await page2.goto(`http://127.0.0.1:5176${bmiLink}`, { waitUntil: 'networkidle' });
    await page2.waitForTimeout(600);
    await page2.screenshot({ path: path.join(ARTIFACT_DIR, '26_admin_bmi_page.png') });
  }

  // Check Admin Patients -> Accounts Tab
  await page2.goto('http://127.0.0.1:5176/admin/patients', { waitUntil: 'networkidle' });
  await page2.waitForTimeout(600);

  // Click on "حسابات العملاء" tab
  const accTab = page2.locator('button:has-text("حسابات العملاء")').first();
  if (await accTab.isVisible()) {
    await accTab.click();
    await page2.waitForTimeout(600);
    await page2.screenshot({ path: path.join(ARTIFACT_DIR, '27_admin_patient_accounts_tab.png') });

    // Click on first patient "عرض الملف الطبي" or row
    const viewBtn = page2.locator('button:has-text("الملف"), button:has-text("عرض"), a:has-text("الملف"), a:has-text("عرض")').first();
    if (await viewBtn.isVisible()) {
      await viewBtn.click();
      await page2.waitForTimeout(800);
      await page2.screenshot({ path: path.join(ARTIFACT_DIR, '28_admin_patient_detail_view.png') });
    }
  }

  await browser.close();
  console.log('Interaction testing complete!');
}

testInteractions().catch(console.error);
