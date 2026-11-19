import fs from 'fs';

const filePath = 'client/src/styles/site/clinic-intro.css';
let css = fs.readFileSync(filePath, 'utf8');

// 1. Fix hero frame in media query (remove the old clamp capsule corner)
css = css.replace(
  'border-radius: 20px clamp(60px, 16vw, 110px) clamp(60px, 16vw, 110px) 20px;',
  'border-radius: 22px;'
);

// 2. Fix doctor responsive credentials
css = css.replace(
  /\.clinic-doctor-credentials\s*\{\s*grid-template-columns:\s*minmax\(0,\s*1fr\);\s*\}/,
  `.clinic-doctor-credentials-grid {
    grid-template-columns: minmax(0, 1fr);
    gap: 12px;
  }

  .clinic-doctor-actions {
    width: 100%;
    flex-direction: column;
    align-items: stretch;
  }

  .clinic-doctor-book {
    width: 100%;
    justify-content: center;
  }

  .clinic-doctor-reassurance {
    text-align: center;
  }`
);

fs.writeFileSync(filePath, css, 'utf8');
console.log('Responsive media queries updated cleanly');
