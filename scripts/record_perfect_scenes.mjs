import path from 'node:path';
import fs from 'node:fs';
import { chromium } from '@playwright/test';

const chromeSystem = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const RAW_DIR = 'E:/Project Work/videos media🔥❤️/Future Center/Future-Centre/video_production/raw';

if (!fs.existsSync(RAW_DIR)) {
  fs.mkdirSync(RAW_DIR, { recursive: true });
}

async function smoothScrollBy(page, deltaY, durationMs = 1500, steps = 25) {
  const stepDelay = durationMs / steps;
  const perStep = deltaY / steps;
  for (let i = 0; i < steps; i++) {
    await page.mouse.wheel(0, perStep);
    await page.waitForTimeout(stepDelay);
  }
}

async function recordScene(sceneName, viewport, runActions) {
  console.log(`\n========================================`);
  console.log(`Starting Scene: ${sceneName}`);
  console.log(`========================================`);

  const browser = await chromium.launch({
    executablePath: chromeSystem,
    headless: true,
  });

  const sceneDir = path.join(RAW_DIR, sceneName);
  if (!fs.existsSync(sceneDir)) fs.mkdirSync(sceneDir, { recursive: true });

  const context = await browser.newContext({
    recordVideo: {
      dir: sceneDir,
      size: viewport,
    },
    viewport: viewport,
    deviceScaleFactor: 1.5,
  });

  const page = await context.newPage();

  try {
    await runActions(page);
  } catch (err) {
    console.error(`Error in ${sceneName}:`, err);
  } finally {
    await page.waitForTimeout(500);
    await page.close();
    await context.close();
    await browser.close();
  }

  const files = fs.readdirSync(sceneDir).filter(f => f.endsWith('.webm'));
  if (files.length > 0) {
    const oldPath = path.join(sceneDir, files[0]);
    const finalPath = path.join(RAW_DIR, `${sceneName}.webm`);
    if (fs.existsSync(finalPath)) fs.unlinkSync(finalPath);
    fs.renameSync(oldPath, finalPath);
    try { fs.rmdirSync(sceneDir); } catch(e){}
    console.log(`Saved: ${finalPath}`);
  }
}

async function main() {
  const mobileViewport = { width: 540, height: 1100 };
  const desktopViewport = { width: 1440, height: 900 };

  // SCENE 1: Home Hero, Philosophy & Programs (~22s)
  await recordScene('scene1_hero_programs', mobileViewport, async (page) => {
    await page.goto('http://localhost:5176/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    // Hero overview
    await smoothScrollBy(page, 220, 2000);
    await page.waitForTimeout(1500);

    // Philosophy
    await smoothScrollBy(page, 450, 2500);
    await page.waitForTimeout(1500);

    // Programs section - focus on 1,200 EGP featured monthly program
    await smoothScrollBy(page, 550, 2500);
    await page.waitForTimeout(1500);

    // Click to expand details
    const expandBtn = page.locator('.pfp-details-toggle');
    if (await expandBtn.count() > 0) {
      await expandBtn.click();
      await page.waitForTimeout(3000);
    }

    // Scroll slightly down to show other programs
    await smoothScrollBy(page, 350, 2000);
    await page.waitForTimeout(2500);
  });

  // SCENE 2: Interactive Clinical InBody Calculator (~20s)
  await recordScene('scene2_inbody_calculator', mobileViewport, async (page) => {
    await page.goto('http://localhost:5176/#bmi', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    const bmiSection = page.locator('.calculator-section');
    if (await bmiSection.count() > 0) {
      await bmiSection.scrollIntoViewIfNeeded();
      await page.waitForTimeout(1500);
    }

    // Select Male then Female toggle
    const maleBtn = page.locator('.calc-toggle-pill button:has-text("ذكر")');
    if (await maleBtn.count() > 0) {
      await maleBtn.click();
      await page.waitForTimeout(1200);
    }

    const femaleBtn = page.locator('.calc-toggle-pill button:has-text("أنثى")');
    if (await femaleBtn.count() > 0) {
      await femaleBtn.click();
      await page.waitForTimeout(1200);
    }

    // Click height quick-pill 165 -> 170
    const h170 = page.locator('.calc-quick-pills button:has-text("170")');
    if (await h170.count() > 0) {
      await h170.click();
      await page.waitForTimeout(1500);
    }

    // Click weight quick-pill 75 -> 82
    const w82 = page.locator('.calc-quick-pills button:has-text("82")');
    if (await w82.count() > 0) {
      await w82.click();
      await page.waitForTimeout(1500);
    }

    // Scroll slightly down to view the instant dynamic result card
    await smoothScrollBy(page, 350, 2000);
    await page.waitForTimeout(4500);
  });

  // SCENE 3: Success Stories & WhatsApp Lightbox (~24s)
  await recordScene('scene3_stories_lightbox', mobileViewport, async (page) => {
    await page.goto('http://localhost:5176/#stories', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    const storiesSection = page.locator('#stories');
    if (await storiesSection.count() > 0) {
      await storiesSection.scrollIntoViewIfNeeded();
      await page.waitForTimeout(1800);
    }

    // Click on Nada card
    const firstCard = page.locator('.transform-card-compact').first();
    if (await firstCard.count() > 0) {
      await firstCard.click();
      await page.waitForTimeout(2500);

      // In modal, click image to open lightbox
      const modalImg = page.locator('.cmd-image-frame');
      if (await modalImg.count() > 0) {
        await modalImg.click();
        await page.waitForTimeout(2500);

        // Close lightbox
        const closeLightbox = page.locator('.story-lightbox-close');
        if (await closeLightbox.count() > 0) {
          await closeLightbox.click();
          await page.waitForTimeout(1000);
        }
      }

      // Close case modal
      const closeModal = page.locator('.cmd-close-btn');
      if (await closeModal.count() > 0) {
        await closeModal.click();
        await page.waitForTimeout(1000);
      }
    }

    // Scroll down to WhatsApp reviews
    await smoothScrollBy(page, 550, 2000);
    await page.waitForTimeout(2000);

    // Click review to open WhatsApp chat preview
    const firstReview = page.locator('.feedback-micro-card.is-clickable').first();
    if (await firstReview.count() > 0) {
      await firstReview.click();
      await page.waitForTimeout(3000);
      const closeLb = page.locator('.story-lightbox-close');
      if (await closeLb.count() > 0) {
        await closeLb.click();
        await page.waitForTimeout(1000);
      }
    }
  });

  // SCENE 4: Booking Flow & Instant QR Pass (~24s)
  await recordScene('scene4_booking_qr', mobileViewport, async (page) => {
    await page.goto('http://localhost:5176/booking', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    // Select service if cards exist
    const serviceCard = page.locator('.service-select-card, .bk-service-pill').first();
    if (await serviceCard.count() > 0) {
      await serviceCard.click();
      await page.waitForTimeout(1000);
    }

    // Scroll down in step 1
    await smoothScrollBy(page, 300, 1500);
    await page.waitForTimeout(1000);

    // Click Next step button
    const nextBtn = page.locator('button:has-text("متابعة"), button:has-text("التالي")').first();
    if (await nextBtn.count() > 0) {
      await nextBtn.click();
      await page.waitForTimeout(1500);
    }

    // Step 2: Fill contact info
    const nameInput = page.locator('input[name="name"], input#name');
    if (await nameInput.count() > 0) {
      await nameInput.fill('سارة عبد الرحمن');
      await page.waitForTimeout(800);
    }

    const phoneInput = page.locator('input[name="phone"], input[type="tel"]');
    if (await phoneInput.count() > 0) {
      await phoneInput.fill('01041504201');
      await page.waitForTimeout(800);
    }

    // Confirm booking
    const submitBtn = page.locator('button[type="submit"], button:has-text("تأكيد الحجز")').first();
    if (await submitBtn.count() > 0) {
      await submitBtn.click();
      await page.waitForTimeout(3500);
    }

    // Highlight QR Pass
    await smoothScrollBy(page, 200, 1200);
    await page.waitForTimeout(3500);
  });

  // SCENE 5: Admin Dashboard, Daily Operations Pulse & Agenda (~25s)
  await recordScene('scene5_admin_pulse_agenda', desktopViewport, async (page) => {
    await page.goto('http://localhost:5176/login', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    const adminBtn = page.locator('button.role-admin');
    if (await adminBtn.count() > 0) {
      await adminBtn.click();
      await page.waitForTimeout(1800);
    }

    await page.goto('http://localhost:5176/admin', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2500);

    // Smooth scroll down to agenda
    await smoothScrollBy(page, 280, 1500);
    await page.waitForTimeout(2500);

    // Open QR Scanner Modal
    const qrBtn = page.locator('button:has-text("مسح كود المريض")');
    if (await qrBtn.count() > 0) {
      await qrBtn.click();
      await page.waitForTimeout(3000);
      const closeQr = page.locator('.scanner-close-btn, .modal-close, button:has-text("إغلاق")').first();
      if (await closeQr.count() > 0) {
        await closeQr.click();
        await page.waitForTimeout(1000);
      }
    }

    // Navigate to Programs to show newly redesigned badges
    await page.goto('http://localhost:5176/admin/programs', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3500);
  });

  // SCENE 6: Patient CRM & Diet Prescription (~16s)
  await recordScene('scene6_patient_crm_rx', desktopViewport, async (page) => {
    await page.goto('http://localhost:5176/admin/patients', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Open first patient drawer
    const patientRow = page.locator('tr.patient-row, .patient-card, tr:has-text("010")').first();
    if (await patientRow.count() > 0) {
      await patientRow.click();
      await page.waitForTimeout(3000);
    }

    // Scroll inside drawer
    await smoothScrollBy(page, 250, 1500);
    await page.waitForTimeout(3500);
  });

  console.log('\n========================================');
  console.log('ALL PERFECT RAW SCENES COMPLETED!');
  console.log('========================================');
}

main().catch(console.error);
