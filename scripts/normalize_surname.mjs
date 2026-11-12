import fs from 'fs';

const files = [
  'Future-Centre/client/src/features/account/Account.tsx',
  'Future-Centre/client/src/features/booking/Tracking.tsx',
  'Future-Centre/client/src/features/public/About.tsx',
  'Future-Centre/client/index.html'
];

for (const file of files) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replaceAll('الشوري', 'الشورى');
    content = content.replaceAll('الشورة', 'الشورى');
    fs.writeFileSync(file, content, 'utf8');
    console.log('Normalized', file);
  }
}
