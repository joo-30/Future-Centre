import fs from 'fs';

const filePath = 'Future-Centre/client/src/styles/reference/foundation.css';
let content = fs.readFileSync(filePath, 'utf8');

// Replace palette roots
content = content.replace(
  `:root {
  --forest: #073f33;
  --forest-hover: #0b4f40;
  --forest-active: #052e25;
  --deep: #042f26;
  --ink: #163d33;
  --ink-light: #2b5549;
  --muted: #687a70;
  --muted-light: #8d9e95;
  --canvas: #f5f6f1;
  --cream: #f8f5ec;
  --cream-card: #fdfcf7;`,
  `:root {
  --forest: #06382c;
  --forest-hover: #0a493b;
  --forest-active: #042920;
  --deep: #03241b;
  --ink: #0f2d24;
  --ink-light: #244b3e;
  --muted: #5e796c;
  --muted-light: #89a396;
  --canvas: #f8faf6;
  --cream: #f8faf6;
  --cream-card: #ffffff;`
);

// Replace html, body font
content = content.replace(
  `html,
body {
  margin: 0;
  min-height: 100%;
  background: var(--canvas);
  font-family: Plex, Arial, sans-serif;
  color: var(--ink);
  font-size: 18px;
  line-height: 1.7;
}`,
  `html,
body {
  margin: 0;
  min-height: 100%;
  background: var(--canvas);
  font-family: 'Alexandria', Alex, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: var(--ink);
  font-size: 16px;
  line-height: 1.75;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}`
);

// Headings
content = content.replace(
  `h1,
h2,
h3 {
  font-family: Alex, Plex, sans-serif;
  line-height: 1.45;
  letter-spacing: -0.65px;
}`,
  `h1,
h2,
h3 {
  font-family: 'Alexandria', Alex, sans-serif;
  line-height: 1.35;
  letter-spacing: -0.5px;
}`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully upgraded foundation.css');
