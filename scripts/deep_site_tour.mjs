import fs from 'node:fs';
import path from 'node:path';
import { chromium } from '@playwright/test';

const chromeSystem = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:/Users/asus1/.gemini/antigravity/brain/737eb81e-624f-4504-b938-d04ece747f9b/site_tour';

if (!fs.existsSync(ARTIFACT_DIR)) {
  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
}

async function runDeepTour() {
  const browser = await chromium.launch({ executablePath: chromeSystem, headless: true });
  const findings = [];

  const logFinding = (persona, area, issue, recommendation, severity = 'medium') => {
    findings.push({ persona, area, issue, recommendation, severity });
    console.log(`[${persona.toUpperCase()}] [${area}] ${issue}`);
  };

  // -------------------------------------------------------------
  // PERSONA 1: PUBLIC VISITOR / NEW PATIENT
  // -------------------------------------------------------------
  console.log('\n=============================================');
  console.log('1. TOURING AS: PUBLIC VISITOR (زائر جديد للموقع)');
  console.log('=============================================');
  {
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1440, height: 900 });

    const consoleErrors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    // 1.1 Homepage
    await page.goto('http://127.0.0.1:5176/', { waitUntil: 'networkidle' });
    await page.screenshot({ path: path.join(ARTIFACT_DIR, '01_visitor_homepage_hero.png') });

    // Check navbar links
    const navLinks = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('.site-head nav a, .site-head .nav a')).map((a) => ({
        text: a.innerText.trim(),
        href: a.getAttribute('href'),
      }));
    });
    console.log('Homepage Nav Links:', navLinks);

    // Scroll to BMI Calculator
    const hasBmi = await page.$('.calculator-section, #calculator, #bmi');
    if (hasBmi) {
      await page.evaluate(() => {
        const el = document.querySelector('.calculator-section, #calculator, #bmi');
        if (el) el.scrollIntoView();
      });
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(ARTIFACT_DIR, '02_visitor_calculator.png') });

      // Test calculator interaction
      const canTypeBmi = await page.evaluate(() => {
        const weightInput = document.querySelector('input[name="weight"], input[placeholder*="وزن"], input[id*="weight"]');
        const heightInput = document.querySelector('input[name="height"], input[placeholder*="طول"], input[id*="height"]');
        if (weightInput && heightInput) {
          weightInput.value = '90';
          weightInput.dispatchEvent(new Event('input', { bubbles: true }));
          heightInput.value = '170';
          heightInput.dispatchEvent(new Event('input', { bubbles: true }));
          return true;
        }
        return false;
      });
      if (canTypeBmi) {
        await page.waitForTimeout(300);
        await page.screenshot({ path: path.join(ARTIFACT_DIR, '02b_visitor_calculator_result.png') });
      }
    }

    // Scroll to Programs
    await page.evaluate(() => {
      const el = document.querySelector('.programs-section, #programs');
      if (el) el.scrollIntoView();
    });
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, '03_visitor_programs.png') });

    // Scroll to Footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, '04_visitor_footer.png') });

    // 1.2 Booking Page
    console.log('Navigating to Booking (/booking)...');
    await page.goto('http://127.0.0.1:5176/booking', { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, '05_visitor_booking_step1.png') });

    // Inspect Booking Elements
    const bookingInfo = await page.evaluate(() => {
      const programs = Array.from(document.querySelectorAll('.program-choice, .service-card, .booking-program-card, input[type="radio"]')).map((el) => el.innerText || el.getAttribute('value'));
      const slots = Array.from(document.querySelectorAll('.slot-btn, .time-slot')).length;
      return { programsCount: programs.length, slotsCount: slots };
    });
    console.log('Booking Info:', bookingInfo);

    // 1.3 Tracking Page
    console.log('Navigating to Tracking (/booking/track)...');
    await page.goto('http://127.0.0.1:5176/booking/track', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, '06_visitor_tracking.png') });

    // 1.4 Programs List & Detail
    console.log('Navigating to Programs (/programs)...');
    await page.goto('http://127.0.0.1:5176/programs', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, '07_visitor_programs_page.png') });

    // 1.5 Articles List
    console.log('Navigating to Articles (/articles)...');
    await page.goto('http://127.0.0.1:5176/articles', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, '08_visitor_articles_page.png') });

    // 1.6 Contact Page
    console.log('Navigating to Contact (/contact)...');
    await page.goto('http://127.0.0.1:5176/contact', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, '09_visitor_contact_page.png') });

    // 1.7 Mobile check for Visitor (390px)
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('http://127.0.0.1:5176/', { waitUntil: 'networkidle' });
    await page.screenshot({ path: path.join(ARTIFACT_DIR, '10_visitor_mobile_homepage.png') });

    await page.goto('http://127.0.0.1:5176/booking', { waitUntil: 'networkidle' });
    await page.screenshot({ path: path.join(ARTIFACT_DIR, '11_visitor_mobile_booking.png') });

    if (consoleErrors.length) {
      logFinding('Visitor', 'Console', `Found ${consoleErrors.length} console errors`, consoleErrors.slice(0, 3).join(' | '), 'high');
    }

    await page.close();
  }

  // -------------------------------------------------------------
  // PERSONA 2: CLIENT / LOGGED-IN PATIENT
  // -------------------------------------------------------------
  console.log('\n=============================================');
  console.log('2. TOURING AS: PATIENT / CLIENT (مريض مشترك)');
  console.log('=============================================');
  {
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1440, height: 900 });

    // Login as Patient via dev quick login
    await page.goto('http://127.0.0.1:5176/login', { waitUntil: 'networkidle' });
    await page.screenshot({ path: path.join(ARTIFACT_DIR, '12_patient_login_screen.png') });

    // Click quick patient login
    const hasQuickPatient = await page.$('button.role-patient');
    if (hasQuickPatient) {
      await page.click('button.role-patient');
      await page.waitForTimeout(2000);
    } else {
      // Regular login with patient phone
      await page.fill('input[type="tel"]', '01018943002');
      await page.fill('input[type="password"]', 'Patient123456');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(2000);
    }

    console.log('Patient logged in, current URL:', page.url());
    await page.screenshot({ path: path.join(ARTIFACT_DIR, '13_patient_account_top.png') });

    // Scroll down account page to see InBody and appointments
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, '14_patient_account_inbody.png') });

    await page.evaluate(() => window.scrollTo(0, 1100));
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, '15_patient_account_subscriptions.png') });

    // Patient Mobile View
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('http://127.0.0.1:5176/account', { waitUntil: 'networkidle' });
    await page.screenshot({ path: path.join(ARTIFACT_DIR, '16_patient_account_mobile.png') });

    await page.close();
  }

  // -------------------------------------------------------------
  // PERSONA 3: CLINIC ADMIN / STAFF
  // -------------------------------------------------------------
  console.log('\n=============================================');
  console.log('3. TOURING AS: CLINIC ADMIN (لوحة تحكم العيادة)');
  console.log('=============================================');
  {
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1440, height: 900 });

    // Login as Admin
    await page.goto('http://127.0.0.1:5176/login', { waitUntil: 'networkidle' });
    await page.click('button.role-admin');
    await page.waitForTimeout(2000);

    // 3.1 Admin Appointments / Pulse Dashboard
    await page.goto('http://127.0.0.1:5176/admin/appointments', { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, '17_admin_agenda_pulse.png') });

    // 3.2 Admin Patients
    console.log('Navigating to Admin Patients (/admin/patients)...');
    await page.goto('http://127.0.0.1:5176/admin/patients', { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, '18_admin_patients_list.png') });

    // Click first patient to test slide-over / profile drawer
    const clickedPatient = await page.evaluate(() => {
      const row = document.querySelector('.patient-row, tr[data-patient-id], .table-row-clickable, tbody tr');
      if (row) {
        row.click();
        return true;
      }
      return false;
    });
    if (clickedPatient) {
      await page.waitForTimeout(800);
      await page.screenshot({ path: path.join(ARTIFACT_DIR, '19_admin_patient_drawer.png') });
    }

    // 3.3 Admin Capacity & Schedule
    console.log('Navigating to Admin Capacity (/admin/capacity)...');
    await page.goto('http://127.0.0.1:5176/admin/capacity', { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, '20_admin_capacity.png') });

    // 3.4 Admin Programs
    console.log('Navigating to Admin Programs (/admin/programs)...');
    await page.goto('http://127.0.0.1:5176/admin/programs', { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, '21_admin_programs.png') });

    // 3.5 Admin Stories
    console.log('Navigating to Admin Stories (/admin/stories)...');
    await page.goto('http://127.0.0.1:5176/admin/stories', { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, '22_admin_stories.png') });

    // 3.6 Admin Settings
    console.log('Navigating to Admin Settings (/admin/settings)...');
    await page.goto('http://127.0.0.1:5176/admin/settings', { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, '23_admin_settings.png') });

    // 3.7 Admin Mobile View (390px)
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('http://127.0.0.1:5176/admin/appointments', { waitUntil: 'networkidle' });
    await page.screenshot({ path: path.join(ARTIFACT_DIR, '24_admin_appointments_mobile.png') });

    await page.goto('http://127.0.0.1:5176/admin/patients', { waitUntil: 'networkidle' });
    await page.screenshot({ path: path.join(ARTIFACT_DIR, '25_admin_patients_mobile.png') });

    await page.close();
  }

  await browser.close();
  console.log('\nDeep Tour Finished! All screenshots saved to:', ARTIFACT_DIR);
}

runDeepTour().catch(console.error);
