import { chromium } from 'playwright';
import { resolve } from 'path';

const chromeSystem = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const outDir = 'C:/Users/makah/.gemini/antigravity/brain/c5420236-75f6-4eb0-aed5-e6d16c5e7077';
const scratchDir = 'C:/Users/makah/.gemini/antigravity/brain/c5420236-75f6-4eb0-aed5-e6d16c5e7077/scratch';

async function main() {
  const browser = await chromium.launch({ executablePath: chromeSystem, headless: true });

  const concepts = [
    { id: 'concept1', file: `${scratchDir}/mockup_concept1.html` },
    { id: 'concept2', file: `${scratchDir}/mockup_concept2.html` },
    { id: 'concept3', file: `${scratchDir}/mockup_concept3.html` }
  ];

  for (const c of concepts) {
    const fileUrl = 'file:///' + c.file.replace(/\\/g, '/');

    // Desktop
    const pageDesk = await browser.newPage();
    await pageDesk.setViewportSize({ width: 1440, height: 900 });
    await pageDesk.goto(fileUrl, { waitUntil: 'networkidle' });
    await pageDesk.waitForTimeout(500);
    const deskPath = `${outDir}/${c.id}_preview_desktop.png`;
    await pageDesk.screenshot({ path: deskPath });
    console.log(`Saved: ${c.id}_preview_desktop.png`);
    await pageDesk.close();

    // Mobile
    const pageMob = await browser.newPage();
    await pageMob.setViewportSize({ width: 390, height: 844 });
    await pageMob.goto(fileUrl, { waitUntil: 'networkidle' });
    await pageMob.waitForTimeout(500);
    const mobPath = `${outDir}/${c.id}_preview_mobile.png`;
    await pageMob.screenshot({ path: mobPath });
    console.log(`Saved: ${c.id}_preview_mobile.png`);
    await pageMob.close();
  }

  await browser.close();
  console.log('All 3 concept mockups successfully captured!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
