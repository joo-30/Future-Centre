import { chromium } from 'playwright';

const chromeSystem = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:/Users/makah/.gemini/antigravity/brain/c5420236-75f6-4eb0-aed5-e6d16c5e7077';

async function main() {
  const browser = await chromium.launch({ executablePath: chromeSystem, headless: true });

  // 1. Desktop (1440x900)
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://127.0.0.1:5176/login', { waitUntil: 'networkidle' });
  await page.click('.quick-login-btn.role-admin');
  await page.waitForTimeout(1000);
  await page.goto('http://127.0.0.1:5176/admin/appointments', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);

  const agendaSection = await page.$('.today-agenda-section');
  if (agendaSection) {
    await agendaSection.screenshot({ path: `${artifactDir}/reorganized_agenda_desktop.png` });
    console.log('Saved reorganized_agenda_desktop.png');
  }

  // 2. Mobile (390x844)
  const mobilePage = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await mobilePage.goto('http://127.0.0.1:5176/login', { waitUntil: 'networkidle' });
  await mobilePage.click('.quick-login-btn.role-admin');
  await mobilePage.waitForTimeout(1000);
  await mobilePage.goto('http://127.0.0.1:5176/admin/appointments', { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(1200);

  const mAgendaSection = await mobilePage.$('.today-agenda-section');
  if (mAgendaSection) {
    await mAgendaSection.screenshot({ path: `${artifactDir}/reorganized_agenda_mobile.png` });
    console.log('Saved reorganized_agenda_mobile.png');
  }

  await browser.close();
  console.log('Verification finished.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
