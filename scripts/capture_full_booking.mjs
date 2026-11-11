import fs from 'node:fs';
import path from 'node:path';
import { chromium } from '@playwright/test';

const chromeSystem = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:/Users/asus1/.gemini/antigravity/brain/737eb81e-624f-4504-b938-d04ece747f9b/site_tour';

async function captureFullBooking() {
  const browser = await chromium.launch({ executablePath: chromeSystem, headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://127.0.0.1:5176/booking', { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);

  // Scroll to calendar
  await page.evaluate(() => {
    document.querySelector('.booking-calendar-card')?.scrollIntoView();
  });
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, '05c_booking_calendar_view.png') });

  // Scroll to bottom (contact fields)
  await page.evaluate(() => {
    document.querySelector('.booking-step-two')?.scrollIntoView();
  });
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, '05d_booking_contact_fields.png') });

  await page.close();
  await browser.close();
}

captureFullBooking().catch(console.error);
