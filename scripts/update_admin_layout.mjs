import fs from 'node:fs';

const filePath = 'Future-Centre/client/src/features/admin/layout/AdminLayout.tsx';
let code = fs.readFileSync(filePath, 'utf8');

// 1. Update doctor role tag in sidebar
code = code.replace(
  '<span className="doctor-role-tag">المدير الطبي · حساب الإدارة</span>',
  '<span className="doctor-role-tag">المدير الطبي · {user?.name || \'المدير العام\'}</span>'
);

// 2. Remove console-user from topbar
const userBlockRegex = /<div className="console-user">[\s\S]*?<\/div>/;
code = code.replace(userBlockRegex, '{/* User role relocated to sidebar profile card */}');

fs.writeFileSync(filePath, code, 'utf8');
console.log('AdminLayout.tsx updated successfully!');
