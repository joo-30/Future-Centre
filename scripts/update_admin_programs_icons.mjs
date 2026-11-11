import fs from 'node:fs';

// 1. AdminPrograms.tsx
const adminProgPath = 'Future-Centre/client/src/features/admin/programs/AdminPrograms.tsx';
let adminProg = fs.readFileSync(adminProgPath, 'utf8');

// Replace Star with Award in imports
adminProg = adminProg.replace(/Star,/g, 'Award,');

// Replace badge
adminProg = adminProg.replace(
  /<Star size=\{12\} fill="currentColor" \/>[\r\n\s]+باقة مميزة/,
  '<Award size={13} />\r\n                        باقة رئيسية'
);

// Replace button
adminProg = adminProg.replace(
  /<Star size=\{14\} fill=\{s\.featured \? 'currentColor' : 'none'\} \/>[\r\n\s]+\{s\.featured \? 'مميز' : 'تمييز'\}/,
  '<Award size={14} />\r\n                    {s.featured ? \'باقة رئيسية\' : \'تمييز كباقة رئيسية\'}'
);

adminProg = adminProg.replace(
  /title=\{s\.featured \? 'إلغاء التمييز' : 'تمييز كباقة مفضلة'\}/,
  'title={s.featured ? \'إلغاء التمييز كباقة رئيسية\' : \'تمييز كباقة رئيسية موصى بها\'}'
);

fs.writeFileSync(adminProgPath, adminProg, 'utf8');
console.log('AdminPrograms.tsx updated');

// 2. ServiceEditor.tsx
const svcEditorPath = 'Future-Centre/client/src/features/admin/programs/ServiceEditor.tsx';
let svcEditor = fs.readFileSync(svcEditorPath, 'utf8');

svcEditor = svcEditor.replace(/Star,/g, 'Award,');
svcEditor = svcEditor.replace(
  /<Star size=\{15\} \/>[\r\n\s]+<span>برنامج مميز \(Featured\)<\/span>/,
  '<Award size={15} />\r\n                <span>باقة رئيسية موصى بها</span>'
);

fs.writeFileSync(svcEditorPath, svcEditor, 'utf8');
console.log('ServiceEditor.tsx updated');
