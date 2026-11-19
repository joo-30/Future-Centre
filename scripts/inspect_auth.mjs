import fs from 'fs';

const txt = fs.readFileSync('client/src/features/auth/AuthPage.tsx', 'utf8');
const lines = txt.split('\n');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('access-page') || lines[i].includes('access-form-area') || lines[i].includes('access-visual')) {
    console.log(`Line ${i+1}: ${lines[i].trim()}`);
  }
}
