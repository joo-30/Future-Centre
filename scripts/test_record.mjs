import path from 'node:path';
import { chromium } from '@playwright/test';

const chromeSystem = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function testRecord() {
  const browser = await chromium.launch({
    executablePath: chromeSystem,
    headless: true,
  });

  const outDir = 'E:/Project Work/videos media🔥❤️/Future Center/Future-Centre/video_production/raw';
  const context = await browser.newContext({
    recordVideo: {
      dir: outDir,
      size: { width: 1080, height: 1920 },
    },
    viewport: { width: 1080, height: 1920 },
    deviceScaleFactor: 1,
  });

  const page = await context.newPage();
  console.log('Navigating to homepage...');
  await page.goto('http://localhost:5176/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Smooth scroll
  for (let i = 0; i < 5; i++) {
    await page.mouse.wheel(0, 300);
    await page.waitForTimeout(500);
  }

  await page.close();
  await context.close();
  await browser.close();
  console.log('Recording finished.');
}

testRecord().catch(console.error);
