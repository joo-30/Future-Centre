import path from 'node:path';
import fs from 'node:fs';
import { chromium } from '@playwright/test';

const chromeSystem = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const RAW_DIR = 'E:/Project Work/videos media🔥❤️/Future Center/Future-Centre/video_production/raw';

if (!fs.existsSync(RAW_DIR)) {
  fs.mkdirSync(RAW_DIR, { recursive: true });
}

async function smoothScroll(page, targetY, durationMs = 2000, steps = 30) {
  const currentY = await page.evaluate(() => window.scrollY);
  const diff = targetY - currentY;
  const stepDelay = durationMs / steps;
  for (let i = 1; i <= steps; i++) {
    const nextY = currentY + (diff * (i / steps));
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), nextY);
    await page.waitForTimeout(stepDelay);
  }
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

  // Find the generated webm file and rename it
  const files = fs.readdirSync(sceneDir).filter(f => f.endsWith('.webm'));
  if (files.length > 0) {
    const oldPath = path.join(sceneDir, files[0]);
    const finalPath = path.join(RAW_DIR, `${sceneName}.webm`);
    if (fs.existsSync(finalPath)) fs.unlinkSync(finalPath);
    fs.renameSync(oldPath, finalPath);
    // remove temp dir
    try { fs.rmdirSync(sceneDir); } catch(e){}
    console.log(`Saved: ${finalPath}`);
  }
}

async function main() {
  // Mobile Viewport for Client-facing mobile flow (approx 440 x 956 @ scale 1.5 = 660 x 1434)
  const mobileViewport = { width: 540, height: 1100 };
  // Desktop Viewport for Admin Dashboard
  const desktopViewport = { width: 1440, height: 900 };

  // SCENE 1: Home Hero, Philosophy & Programs (24s)
  await recordScene('scene1_hero_programs', mobileViewport, async (page) => {
    await page.goto('http://localhost:5176/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    // Hero overview
    await smoothScrollBy(page, 200, 2000);
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
      await page.waitForTimeout(3500);
    }

    // Scroll slightly down to show consultation programs
    await smoothScrollBy(page, 400, 2500);
    await page.waitForTimeout(3000);
  });

  // SCENE 2: Interactive InBody / BMI Calculator (22s)
  await recordScene('scene2_inbody_calculator', mobileViewport, async (page) => {
    await page.goto('http://localhost:5176/#bmi', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    const bmiSection = page.locator('#bmi');
    if (await bmiSection.count() > 0) {
      await bmiSection.scrollIntoViewIfNeeded();
      await page.waitForTimeout(1500);
    }

    // Fill inputs
    const heightInput = page.locator('input[name="height"], input[placeholder*="طول"], input#height');
    if (await heightInput.count() > 0) {
      await heightInput.first().fill('168');
      await page.waitForTimeout(1000);
    }

    const weightInput = page.locator('input[name="weight"], input[placeholder*="وزن"], input#weight');
    if (await weightInput.count() > 0) {
      await weightInput.first().fill('85');
      await page.waitForTimeout(1000);
    }

    // Click calculate
    const calcBtn = page.locator('button:has-text("احسبي"), button:has-text("حساب"), button[type="submit"]');
    if (await calcBtn.count() > 0) {
      await calcBtn.first().click();
      await page.waitForTimeout(4000);
    }

    // Scroll to see full result card
    await smoothScrollBy(page, 250, 1500);
    await page.waitForTimeout(4000);
  });

  // SCENE 3: Success Stories & WhatsApp Lightbox (24s)
  await recordScene('scene3_stories_lightbox', mobileViewport, async (page) => {
    await page.goto('http://localhost:5176/#stories', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    const storiesSection = page.locator('#stories');
    if (await storiesSection.count() > 0) {
      await storiesSection.scrollIntoViewIfNeeded();
      await page.waitForTimeout(2000);
    }

    // Click on Nada card
    const firstCard = page.locator('.transform-card-compact').first();
    if (await firstCard.count() > 0) {
      await firstCard.click();
      await page.waitForTimeout(3000);

      // In modal, click image to open lightbox
      const modalImg = page.locator('.cmd-image-frame');
      if (await modalImg.count() > 0) {
        await modalImg.click();
        await page.waitForTimeout(3000);

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
    await smoothScrollBy(page, 600, 2000);
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

  // SCENE 4: Booking Flow & Instant QR Pass (22s)
  await recordScene('scene4_booking_qr', mobileViewport, async (page) => {
    await page.goto('http://localhost:5176/booking', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Select first service if available
    const serviceCard = page.locator('.service-select-card, .bk-service-pill').first();
    if (await serviceCard.count() > 0) {
      await serviceCard.click();
      await page.waitForTimeout(1000);
    }

    // Scroll to form fields
    await smoothScrollBy(page, 400, 1500);
    await page.waitForTimeout(1000);

    // Fill patient details
    const nameInput = page.locator('input[name="name"], input[placeholder*="اسم"]');
    if (await nameInput.count() > 0) {
      await nameInput.first().fill('سارة عبد الرحمن');
      await page.waitForTimeout(800);
    }

    const phoneInput = page.locator('input[name="phone"], input[type="tel"]');
    if (await phoneInput.count() > 0) {
      await phoneInput.first().fill('01041504201');
      await page.waitForTimeout(800);
    }

    // Submit booking
    const submitBtn = page.locator('button[type="submit"], button:has-text("تأكيد الحجز")');
    if (await submitBtn.count() > 0) {
      await submitBtn.first().click();
      await page.waitForTimeout(4000);
    }

    // Focus on QR pass
    await page.waitForTimeout(3000);
  });

  // SCENE 5: Admin Dashboard, Daily Operations Pulse & Agenda (24s)
  await recordScene('scene5_admin_pulse_agenda', desktopViewport, async (page) => {
    await page.goto('http://localhost:5176/login', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Login as admin
    const adminBtn = page.locator('button.role-admin');
    if (await adminBtn.count() > 0) {
      await adminBtn.click();
      await page.waitForTimeout(2000);
    }

    // Land on dashboard - highlight pulse
    await page.goto('http://localhost:5176/admin', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    // Highlight agenda & capacity override
    await smoothScrollBy(page, 300, 1500);
    await page.waitForTimeout(3000);

    // Open QR Scanner Modal
    const qrBtn = page.locator('button:has-text("مسح كود المريض")');
    if (await qrBtn.count() > 0) {
      await qrBtn.click();
      await page.waitForTimeout(3500);
      const closeQr = page.locator('button:has-text("إغلاق"), .modal-close');
      if (await closeQr.count() > 0) {
        await closeQr.first().click();
        await page.waitForTimeout(1000);
      }
    }

    // Navigate to Programs to show newly redesigned badges
    await page.goto('http://localhost:5176/admin/programs', { waitUntil: 'networkidle' });
    await page.waitForTimeout(4000);
  });

  // SCENE 6: Patient CRM & Diet Prescription (18s)
  await recordScene('scene6_patient_crm_rx', desktopViewport, async (page) => {
    await page.goto('http://localhost:5176/admin/patients', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Open first patient drawer
    const patientRow = page.locator('tr.patient-row, .patient-card, tr:has-text("010")').first();
    if (await patientRow.count() > 0) {
      await patientRow.click();
      await page.waitForTimeout(3500);
    }

    // Scroll inside drawer if possible
    await smoothScrollBy(page, 200, 1500);
    await page.waitForTimeout(3000);

    // Show Prescription or inbody
    await page.waitForTimeout(3000);
  });

  console.log('\n========================================');
  console.log('ALL RAW SCENES RECORDED SUCCESSFULLY!');
  console.log('========================================');
}

main().catch(console.error);
