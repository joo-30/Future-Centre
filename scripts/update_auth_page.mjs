import fs from 'fs';
import path from 'path';

const authPagePath = path.resolve('client/src/features/auth/AuthPage.tsx');
let content = fs.readFileSync(authPagePath, 'utf8');

// 1. Replace mobile doctor hero with mobile reception showcase
const mobileDoctorRegex = /\{\/\* Dedicated Mobile & Tablet Doctor Hero Card \*\/\}[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/;

const newMobileShowcase = `{/* Dedicated Mobile Reception Showcase Banner (Clean, no text) */}
        <div className="mobile-reception-showcase" aria-label="استقبال مركز المستقبل">
          <img
            src="/assets/clinic-reception.jpg"
            alt="استقبال مركز المستقبل للتغذية العلاجية ونحت القوام"
            className="mobile-reception-img"
            width="1280"
            height="720"
            loading="eager"
          />
        </div>`;

if (mobileDoctorRegex.test(content)) {
  content = content.replace(mobileDoctorRegex, newMobileShowcase);
  console.log('Successfully replaced mobile doctor hero with mobile reception showcase.');
} else {
  console.log('Mobile doctor regex did not match, trying alternative search...');
  const startIdx = content.indexOf('{/* Dedicated Mobile & Tablet Doctor Hero Card */}');
  const endIdx = content.indexOf('<div className="auth-card-elevated">');
  if (startIdx !== -1 && endIdx !== -1) {
    content = content.slice(0, startIdx) + newMobileShowcase + '\n\n        ' + content.slice(endIdx);
    console.log('Successfully replaced using slice indices.');
  } else {
    console.error('Could not locate mobile hero section!');
  }
}

// 2. Replace desktop aside showcase
const desktopAsideRegex = /\{\/\* Luxury Showcase Aside - 100% Unobstructed Doctor Portrait \*\/\}[\s\S]*?<\/aside>/;

const newDesktopAside = `{/* Luxury Showcase Aside - Clean Reception Visual (No text overlay) */}
      <aside className="access-visual" aria-label="استقبال مركز المستقبل">
        <div className="showcase-bg-wrap">
          <img
            src="/assets/clinic-reception.jpg"
            alt="استقبال مركز المستقبل للتغذية العلاجية ونحت القوام"
            className="showcase-img"
            width="1920"
            height="1080"
          />
          <div className="showcase-subtle-vignette" />
        </div>
      </aside>`;

if (desktopAsideRegex.test(content)) {
  content = content.replace(desktopAsideRegex, newDesktopAside);
  console.log('Successfully replaced desktop aside with clean reception visual.');
} else {
  console.log('Desktop aside regex did not match, trying alternative search...');
  const startAside = content.indexOf('<aside className="access-visual">');
  const endAside = content.indexOf('</main>');
  if (startAside !== -1 && endAside !== -1) {
    content = content.slice(0, startAside) + newDesktopAside + '\n    ' + content.slice(endAside);
    console.log('Successfully replaced aside using slice indices.');
  } else {
    console.error('Could not locate desktop aside section!');
  }
}

fs.writeFileSync(authPagePath, content, 'utf8');
console.log('AuthPage.tsx updated successfully!');
