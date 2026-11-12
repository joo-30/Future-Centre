import fs from 'fs';

const file = 'Future-Centre/client/index.html';
let content = fs.readFileSync(file, 'utf8');

const target = `    <!-- Primary SEO Meta Tags -->
    <title>مركز المستقبل للتغذية والتخسيس — د. رنا ياسر الشوري</title>`;

const replacement = `    <!-- Google Fonts: Alexandria & Plus Jakarta Sans -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Alexandria:wght@300;400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
      rel="stylesheet"
    />

    <!-- Primary SEO Meta Tags -->
    <title>مركز المستقبل للتغذية والتخسيس — د. رنا ياسر الشورة</title>`;

const normContent = content.replace(/\r\n/g, '\n');
const normTarget = target.replace(/\r\n/g, '\n');
const normReplacement = replacement.replace(/\r\n/g, '\n');

if (normContent.includes(normTarget)) {
  let updated = normContent.replace(normTarget, normReplacement);
  // Also replace remaining الشوري with الشورة in author and description
  updated = updated.replaceAll('د. رنا ياسر الشوري', 'د. رنا ياسر الشورة');
  updated = updated.replaceAll('دكتورة رنا الشوري', 'دكتورة رنا الشورة');
  updated = updated.replaceAll('د. رنا الشوري', 'د. رنا الشورة');
  fs.writeFileSync(file, updated.replace(/\n/g, '\r\n'), 'utf8');
  console.log('Successfully updated index.html');
} else {
  console.log('Target not found in index.html');
}
