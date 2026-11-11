import fs from 'node:fs';

function cleanLucideImports(filePath, extraToAdd = []) {
  if (!fs.existsSync(filePath)) return;
  let code = fs.readFileSync(filePath, 'utf8');

  // Match import { ... } from 'lucide-react'
  const match = code.match(/import\s*\{([^}]+)\}\s*from\s*['"]lucide-react['"]/);
  if (!match) return;

  const rawNames = match[1]
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  const set = new Set([...rawNames, ...extraToAdd]);
  // Remove Sparkles if present
  set.delete('Sparkles');

  const sorted = Array.from(set).sort();
  const newImport = `import {\n  ${sorted.join(',\n  ')},\n} from 'lucide-react'`;

  code = code.replace(match[0], newImport);
  fs.writeFileSync(filePath, code, 'utf8');
  console.log('Cleaned lucide imports in:', filePath);
}

// 1. BookingQrPass.tsx
cleanLucideImports('Future-Centre/client/src/components/appointments/BookingQrPass.tsx');

// 2. TimePicker.tsx
cleanLucideImports('Future-Centre/client/src/components/forms/TimePicker.tsx');

// 3. NotificationBell.tsx
cleanLucideImports('Future-Centre/client/src/components/notifications/NotificationBell.tsx', ['Award', 'CheckCircle2']);

// 4. AdminAppointments.tsx
cleanLucideImports('Future-Centre/client/src/features/admin/appointments/AdminAppointments.tsx', ['Calendar', 'CalendarCheck']);

// 5. AdvancedCapacityModal.tsx
cleanLucideImports('Future-Centre/client/src/features/admin/appointments/AdvancedCapacityModal.tsx');

// 6. DailyRemindersModal.tsx
cleanLucideImports('Future-Centre/client/src/features/admin/appointments/DailyRemindersModal.tsx');

// 7. ArticleEditor.tsx
cleanLucideImports('Future-Centre/client/src/features/admin/articles/ArticleEditor.tsx');

// 8. AdminBmi.tsx
cleanLucideImports('Future-Centre/client/src/features/admin/bmi/AdminBmi.tsx');

// 9. AdminCapacity.tsx
cleanLucideImports('Future-Centre/client/src/features/admin/capacity/AdminCapacity.tsx');

// 10. AdminQrScannerModal.tsx
cleanLucideImports('Future-Centre/client/src/features/admin/components/AdminQrScannerModal.tsx');

// 11. AdminPatients.tsx
cleanLucideImports('Future-Centre/client/src/features/admin/patients/AdminPatients.tsx', ['ShieldCheck']);

// 12. InBodyEditor.tsx
cleanLucideImports('Future-Centre/client/src/features/admin/patients/InBodyEditor.tsx');

// 13. SubscriptionEditor.tsx
cleanLucideImports('Future-Centre/client/src/features/admin/patients/SubscriptionEditor.tsx');

// 14. ScheduleEditor.tsx
cleanLucideImports('Future-Centre/client/src/features/admin/schedule/ScheduleEditor.tsx');

// 15. SettingsEditor.tsx
cleanLucideImports('Future-Centre/client/src/features/admin/settings/SettingsEditor.tsx');

// 16. AdminStories.tsx
cleanLucideImports('Future-Centre/client/src/features/admin/stories/AdminStories.tsx', ['Activity', 'Award', 'Layers']);

// 17. AuthPage.tsx
cleanLucideImports('Future-Centre/client/src/features/auth/AuthPage.tsx', ['Star']);

// 18. Booking.tsx
cleanLucideImports('Future-Centre/client/src/features/booking/Booking.tsx', ['Leaf']);

// 19. Tracking.tsx
cleanLucideImports('Future-Centre/client/src/features/booking/Tracking.tsx');

// 20. Home.tsx
cleanLucideImports('Future-Centre/client/src/features/home/Home.tsx', ['TrendingUp', 'HelpCircle', 'Leaf', 'Heart', 'Compass', 'Award']);

console.log('All imports cleaned and deduped!');
