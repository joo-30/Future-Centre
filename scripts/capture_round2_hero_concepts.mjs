import { chromium } from 'playwright';

const chromeSystem = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const outDir = 'C:/Users/makah/.gemini/antigravity/brain/c5420236-75f6-4eb0-aed5-e6d16c5e7077';
const scratchDir = 'C:/Users/makah/.gemini/antigravity/brain/c5420236-75f6-4eb0-aed5-e6d16c5e7077/scratch';

async function main() {
  const browser = await chromium.launch({ executablePath: chromeSystem, headless: true });

  const concepts = [
    { id: 'round2_concept1', file: `${scratchDir}/round2_concept1_atelier.html` },
    { id: 'round2_concept2', file: `${scratchDir}/round2_concept2_horizon.html` },
    { id: 'round2_concept3', file: `${scratchDir}/round2_concept3_monogram.html` }
  ];

  for (const c of concepts) {
    const fileUrl = 'file:///' + c.file.replace(/\\/g, '/');

    // Desktop 1440
    const pageDesk = await browser.newPage();
    await pageDesk.setViewportSize({ width: 1440, height: 900 });
    await pageDesk.goto(fileUrl, { waitUntil: 'networkidle' });
    await pageDesk.waitForTimeout(600);
    const deskPath = `${outDir}/${c.id}_desktop.png`;
    await pageDesk.screenshot({ path: deskPath });
    console.log(`Saved: ${c.id}_desktop.png`);
    await pageDesk.close();

    // Mobile 390
    const pageMob = await browser.newPage();
    await pageMob.setViewportSize({ width: 390, height: 844 });
    await pageMob.goto(fileUrl, { waitUntil: 'networkidle' });
    await pageMob.waitForTimeout(600);
    const mobPath = `${outDir}/${c.id}_mobile.png`;
    await pageMob.screenshot({ path: mobPath });
    console.log(`Saved: ${c.id}_mobile.png`);
    await pageMob.close();
  }

  await browser.close();
  console.log('All Round 2 Hero section screenshots successfully captured!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
