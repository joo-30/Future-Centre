import fs from 'node:fs';
import path from 'node:path';

// 1. Update clinic-intro.css
const clinicIntroPath = path.resolve('client/src/styles/site/clinic-intro.css');
let introCss = fs.readFileSync(clinicIntroPath, 'utf8');

// Target block in clinic-intro.css
const oldIntroTarget = `.clinic-doctor-identity h2 {
  margin: 0;
  color: inherit;
  font: 665 clamp(30px, 3.68vw, 53px) / 1.3 Alex, 'Alexandria', sans-serif;
  text-wrap: balance;
}

.clinic-doctor-identity p {
  margin: 10px 0 0;
  color: #536951;
  font-size: clamp(17px, 1.39vw, 20px);
  font-weight: 600;
  line-height: 1.58;
}

.clinic-doctor-approach {
  margin-block-start: clamp(19px, 1.95vw, 28px);
  padding-inline-start: 19px;
  border-inline-start: 2px solid #a7ba7e;
}

.clinic-doctor-approach h3 {
  margin: 0 0 8px;
  color: #36533e;
  font: 650 17px / 1.48 Alex, 'Alexandria', sans-serif;
}

.clinic-doctor-approach p {
  max-inline-size: 48ch;
  margin: 0;
  color: #3e5548;
  font-size: clamp(17px, 1.46vw, 21px);
  line-height: 1.7;
  text-wrap: pretty;
}

.clinic-doctor-credentials {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.07fr);
  gap: 14px 18px;
  margin: clamp(20px, 2vw, 29px) 0 0;
  padding-block: 15px 17px;
  border-block: 1px solid #d9e3d3;
}

.clinic-doctor-credentials dt {
  margin-block-end: 4px;
  color: #536e4b;
  font-size: 15px;
  font-weight: 600;
}

.clinic-doctor-credentials dd {
  max-inline-size: 28ch;
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  line-height: 1.62;
}

.clinic-doctor-credentials bdi {
  color: #546a50;
  font-size: 14px;
  font-weight: 400;
  white-space: nowrap;
}

.clinic-doctor-fields {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 7px 15px;
  margin: 18px 0 0;
  padding: 0;
  list-style: none;
  color: #456148;
  font-size: 16px;
}

.clinic-doctor-fields li + li::before {
  content: '';
  display: inline-block;
  width: 4px;
  height: 4px;
  margin-inline-end: 14px;
  border-radius: 50%;
  background: #819b6a;
  vertical-align: middle;
}`;

const newIntroReplacement = `.clinic-doctor-identity h2 {
  margin: 0;
  color: #0f2c1f;
  font: 700 clamp(32px, 3.8vw, 52px) / 1.25 Alex, 'Alexandria', sans-serif;
  letter-spacing: -0.015em;
  text-wrap: balance;
}

.clinic-doctor-identity p {
  margin: 10px 0 0;
  color: #3b5847;
  font-size: clamp(17px, 1.35vw, 19.5px);
  font-weight: 600;
  line-height: 1.55;
  letter-spacing: -0.005em;
}

.clinic-doctor-approach {
  margin-block-start: clamp(19px, 1.95vw, 28px);
  padding-inline-start: 19px;
  border-inline-start: 2.5px solid #7c9b68;
}

.clinic-doctor-approach h3 {
  margin: 0 0 8px;
  color: #1a3827;
  font: 700 17.5px / 1.45 Alex, 'Alexandria', sans-serif;
  letter-spacing: -0.01em;
}

.clinic-doctor-approach p {
  max-inline-size: 48ch;
  margin: 0;
  color: #2b4537;
  font-size: clamp(17px, 1.4vw, 20.5px);
  line-height: 1.76;
  text-wrap: pretty;
  letter-spacing: -0.005em;
}

.clinic-doctor-credentials {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.07fr);
  gap: 14px 18px;
  margin: clamp(20px, 2vw, 29px) 0 0;
  padding-block: 15px 17px;
  border-block: 1px solid #d5dfce;
}

.clinic-doctor-credentials dt {
  margin-block-end: 4px;
  color: #4b6845;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.01em;
}

.clinic-doctor-credentials dd {
  max-inline-size: 28ch;
  margin: 0;
  color: #112a1d;
  font-size: 17px;
  font-weight: 700;
  line-height: 1.58;
}

.clinic-doctor-credentials bdi {
  color: #3f5d37;
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
}

.clinic-doctor-fields {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 10px;
  margin: 18px 0 0;
  padding: 0;
  list-style: none;
}

.clinic-doctor-fields li {
  display: inline-flex;
  align-items: center;
  padding: 5px 13px;
  border-radius: 999px;
  background: #f1f6ee;
  border: 1px solid #d9e6d4;
  color: #1f3d2a;
  font-size: 14px;
  font-weight: 600;
  font-family: Alex, 'Alexandria', sans-serif;
}

.clinic-doctor-fields li + li::before {
  display: none;
}`;

// Normalize CRLF to LF for matching and replace
const normalizedIntro = introCss.replace(/\r\n/g, '\n');
const normalizedTarget = oldIntroTarget.replace(/\r\n/g, '\n');
if (normalizedIntro.includes(normalizedTarget)) {
  const updated = normalizedIntro.replace(normalizedTarget, newIntroReplacement);
  fs.writeFileSync(clinicIntroPath, updated, 'utf8');
  console.log('Successfully updated clinic-intro.css typography!');
} else {
  console.error('Failed to find old target in clinic-intro.css!');
}

// 2. Update stories.css
const storiesCssPath = path.resolve('client/src/styles/site/stories.css');
let storiesCss = fs.readFileSync(storiesCssPath, 'utf8');

const oldStoriesTarget = `.feedback-block,
.stories-cta-banner {
  max-width: 1288px;
  margin-inline: auto;
  font-family: Plex, sans-serif;
}

.feedback-block {
  margin-block-end: clamp(27px, 4vw, 54px);
}`;

const newStoriesReplacement = `.stories-cta-banner {
  max-width: 1288px;
  margin-inline: auto;
  font-family: Plex, sans-serif;
}

.feedback-block {
  width: 100%;
  max-width: 100%;
  margin-inline: 0;
  margin-block-end: clamp(27px, 4vw, 54px);
  font-family: Plex, sans-serif;
}`;

const normalizedStories = storiesCss.replace(/\r\n/g, '\n');
const normalizedStoriesTarget = oldStoriesTarget.replace(/\r\n/g, '\n');
if (normalizedStories.includes(normalizedStoriesTarget)) {
  const updated = normalizedStories.replace(normalizedStoriesTarget, newStoriesReplacement);
  fs.writeFileSync(storiesCssPath, updated, 'utf8');
  console.log('Successfully updated stories.css feedback-block width!');
} else {
  console.error('Failed to find old target in stories.css!');
}
