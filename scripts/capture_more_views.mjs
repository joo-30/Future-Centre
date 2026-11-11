import fs from 'node:fs';
import path from 'node:path';
import { chromium } from '@playwright/test';

const chromeSystem = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:/Users/asus1/.gemini/antigravity/brain/737eb81e-624f-4504-b938-d04ece747f9b/site_tour';

async function captureMoreViews() {
  const browser = await chromium.launch({ executablePath: chromeSystem, headless: true });

  // 1. Admin Patient Profile
  const adminPage = await browser.newPage();
  await adminPage.setViewportSize({ width: 1440, height: 900 });
  await adminPage.goto('http://127.0.0.1:5176/login', { waitUntil: 'networkidle' });
  await adminPage.click('button.role-admin');
  await adminPage.waitForTimeout(1500);

  // Navigate to first patient profile
  await adminPage.goto('http://127.0.0.1:5176/admin/patients', { waitUntil: 'networkidle' });
  await adminPage.waitForTimeout(600);
  
  // Click on "حسابات العملاء"
  await adminPage.click('button:has-text("حسابات العملاء")');
  await adminPage.waitForTimeout(500);

  // Click the specific patient full file button: .btn-patient-full-file
  const fullFileBtn = adminPage.locator('.btn-patient-full-file').first();
  if (await fullFileBtn.isVisible()) {
    await fullFileBtn.click();
    await adminPage.waitForTimeout(800);
    console.log('Navigated to patient profile URL:', adminPage.url());
    await adminPage.screenshot({ path: path.join(ARTIFACT_DIR, '29_admin_patient_profile.png') });
  }

  await adminPage.close();

  // 2. Booking Step 2 (Select Slot)
  const bookingPage = await browser.newPage();
  await bookingPage.setViewportSize({ width: 1440, height: 900 });
  await bookingPage.goto('http://127.0.0.1:5176/booking', { waitUntil: 'networkidle' });
  await bookingPage.waitForTimeout(600);

  // Click the next button in booking
  const step1Next = bookingPage.locator('.booking-step-actions button, button:has-text("متابعة لبياناتك"), button:has-text("اختيار الموعد")').first();
  if (await step1Next.isVisible()) {
    await step1Next.click();
    await bookingPage.waitForTimeout(600);
    console.log('Booking URL after step 1:', bookingPage.url());
    await bookingPage.screenshot({ path: path.join(ARTIFACT_DIR, '30_booking_slots_calendar.png') });
  }

  // Booking on Mobile (iPhone 14)
  await bookingPage.setViewportSize({ width: 390, height: 844 });
  await bookingPage.waitForTimeout(400);
  await bookingPage.screenshot({ path: path.join(ARTIFACT_DIR, '31_booking_mobile_slots.png') });

  await bookingPage.close();
  await browser.close();
  console.log('More views captured successfully!');
}

captureMoreViews().catch(console.error);
