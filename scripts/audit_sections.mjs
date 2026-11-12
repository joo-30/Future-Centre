import { chromium } from 'playwright';
import path from 'path';

const chromeSystem = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:/Users/asus1/.gemini/antigravity/brain/737eb81e-624f-4504-b938-d04ece747f9b';

async function main() {
  const browser = await chromium.launch({ executablePath: chromeSystem, headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://127.0.0.1:5176/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);

  // Capture Doctor Profile section
  const docSection = await page.$('.doctor-profile-section');
  if (docSection) {
    await docSection.screenshot({ path: path.join(ARTIFACT_DIR, 'home_doc_section_audit.png') });
    console.log('Saved home_doc_section_audit.png');
  }

  // Capture Programs section
  const progSection = await page.$('.programs-section');
  if (progSection) {
    await progSection.screenshot({ path: path.join(ARTIFACT_DIR, 'home_programs_section_audit.png') });
    console.log('Saved home_programs_section_audit.png');
  }

  await browser.close();
}

main().catch(console.error);
