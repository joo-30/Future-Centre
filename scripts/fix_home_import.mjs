import fs from 'node:fs';

const homePath = 'Future-Centre/client/src/features/home/Home.tsx';
let homeCode = fs.readFileSync(homePath, 'utf8');

homeCode = homeCode.replace(
  '  Activity,',
  '  Activity,\n  ChevronDown,'
);

fs.writeFileSync(homePath, homeCode, 'utf8');
console.log('ChevronDown added to Home.tsx imports!');
