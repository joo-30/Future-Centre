import fs from 'node:fs';

function replaceInFile(filePath, transforms) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  for (const t of transforms) {
    if (typeof t.from === 'string') {
      content = content.split(t.from).join(t.to);
    } else if (t.from instanceof RegExp) {
      content = content.replace(t.from, t.to);
    }
  }

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated:', filePath);
  }
}

// Booking.tsx
replaceInFile('Future-Centre/client/src/features/booking/Booking.tsx', [
  { from: 'Sparkles,', to: 'CheckCircle2,' },
  { from: 'const SIcon = icons[s.icon] || Sparkles;', to: 'const SIcon = icons[s.icon] || Leaf;' },
  { from: '<Sparkles size={16} />', to: '<CheckCircle2 size={16} />' }
]);

// Tracking.tsx
replaceInFile('Future-Centre/client/src/features/booking/Tracking.tsx', [
  { from: 'Sparkles,', to: 'CheckCircle2,' },
  { from: '<Sparkles size={14} />', to: '<CheckCircle2 size={14} />' },
  { from: '<Sparkles size={18} style={{ color: \'#16a34a\' }} />', to: '<CheckCircle2 size={18} style={{ color: \'#16a34a\' }} />' },
  { from: '<Sparkles size={15} style={{ color: \'#1b4f2c\' }} />', to: '<CheckCircle2 size={15} style={{ color: \'#1b4f2c\' }} />' }
]);

// Account.tsx
replaceInFile('Future-Centre/client/src/features/account/Account.tsx', [
  { from: 'Sparkles,', to: 'Award,' },
  { from: 'icon: Sparkles,', to: 'icon: Award,' },
  { from: '<Sparkles size={18} />', to: '<Award size={18} />' },
  { from: '<Sparkles size={13} />', to: '<Award size={13} />' },
  { from: '<Sparkles size={16} />', to: '<Award size={16} />' }
]);

// AuthPage.tsx
replaceInFile('Future-Centre/client/src/features/auth/AuthPage.tsx', [
  { from: 'Sparkles,\r\n  Star,', to: 'Award,\r\n  CheckCircle2,' },
  { from: 'Sparkles,\n  Star,', to: 'Award,\n  CheckCircle2,' },
  { from: '<Sparkles size={12} className="mob-perk-icon" />', to: '<CheckCircle2 size={12} className="mob-perk-icon" />' },
  { from: '<Sparkles size={14} />', to: '<CheckCircle2 size={14} />' },
  { from: '<span className="pill-rating">★ 4.9 (+5K حالة)</span>', to: '<span className="pill-rating">4.9 (+5K حالة موثقة)</span>' }
]);

// AdminPatients.tsx
replaceInFile('Future-Centre/client/src/features/admin/patients/AdminPatients.tsx', [
  { from: 'Sparkles,', to: 'CheckCircle2,' },
  { from: '<Sparkles size={11} />', to: '<CheckCircle2 size={11} />' },
  { from: '<Sparkles size={13} />', to: '<CheckCircle2 size={13} />' },
  { from: '<Sparkles size={14} className="footnote-icon" />', to: '<ShieldCheck size={14} className="footnote-icon" />' }
]);

// InBodyEditor.tsx
replaceInFile('Future-Centre/client/src/features/admin/patients/InBodyEditor.tsx', [
  { from: 'Sparkles,', to: 'Activity,' },
  { from: '<Sparkles size={16} />', to: '<Activity size={16} />' }
]);

// PatientHistoryDrawer.tsx
replaceInFile('Future-Centre/client/src/features/admin/patients/PatientHistoryDrawer.tsx', [
  { from: 'Sparkles,', to: 'Award,' },
  { from: '<Sparkles size={18} />', to: '<Award size={18} />' }
]);

// SubscriptionEditor.tsx
replaceInFile('Future-Centre/client/src/features/admin/patients/SubscriptionEditor.tsx', [
  { from: 'Sparkles,', to: 'CheckCircle2,' },
  { from: '<Sparkles size={17} />', to: '<CheckCircle2 size={17} />' }
]);

// DietPrescriptionModal.tsx
replaceInFile('Future-Centre/client/src/features/admin/prescription/DietPrescriptionModal.tsx', [
  { from: 'Sparkles,', to: 'Activity,' },
  { from: '<Sparkles size={14} />', to: '<Activity size={14} />' }
]);

// ScheduleEditor.tsx
replaceInFile('Future-Centre/client/src/features/admin/schedule/ScheduleEditor.tsx', [
  { from: 'Sparkles,', to: 'Clock,' },
  { from: '<Sparkles size={20} />', to: '<Clock size={20} />' }
]);

// SettingsEditor.tsx
replaceInFile('Future-Centre/client/src/features/admin/settings/SettingsEditor.tsx', [
  { from: 'Sparkles,', to: 'ShieldCheck,' },
  { from: '<Sparkles size={15} />', to: '<ShieldCheck size={15} />' }
]);

// AdminBmi.tsx
replaceInFile('Future-Centre/client/src/features/admin/bmi/AdminBmi.tsx', [
  { from: 'Sparkles,', to: 'Activity,' },
  { from: '<Sparkles size={13} />', to: '<Activity size={13} />' }
]);

// AdminQrScannerModal.tsx
replaceInFile('Future-Centre/client/src/features/admin/components/AdminQrScannerModal.tsx', [
  { from: 'Sparkles,', to: 'CheckCircle2,' },
  { from: '<Sparkles size={16} />', to: '<CheckCircle2 size={16} />' }
]);

// AdvancedCapacityModal.tsx
replaceInFile('Future-Centre/client/src/features/admin/appointments/AdvancedCapacityModal.tsx', [
  { from: 'Sparkles,', to: 'CheckCircle2,' },
  { from: '<Sparkles size={18} />', to: '<CheckCircle2 size={18} />' }
]);

// DailyRemindersModal.tsx
replaceInFile('Future-Centre/client/src/features/admin/appointments/DailyRemindersModal.tsx', [
  { from: 'Sparkles,', to: 'Clock,' },
  { from: '<Sparkles size={13} />', to: '<Clock size={13} />' }
]);

// ArticleEditor.tsx
replaceInFile('Future-Centre/client/src/features/admin/articles/ArticleEditor.tsx', [
  { from: 'Sparkles,', to: 'CheckCircle2,' },
  { from: '<Sparkles size={14} />', to: '<CheckCircle2 size={14} />' }
]);

// AdminCapacity.tsx
replaceInFile('Future-Centre/client/src/features/admin/capacity/AdminCapacity.tsx', [
  { from: 'Sparkles,', to: 'Activity,' },
  { from: '<Sparkles size={14} />', to: '<Activity size={14} />' },
  { from: '<Sparkles size={14} className="notice-icon" />', to: '<Activity size={14} className="notice-icon" />' }
]);

// CapacityAnalyticsCharts.tsx
replaceInFile('Future-Centre/client/src/features/admin/capacity/CapacityAnalyticsCharts.tsx', [
  { from: 'Sparkles,', to: 'Activity,' },
  { from: '<Sparkles size={14} className="text-forest" />', to: '<Activity size={14} className="text-forest" />' }
]);

// NotificationBell.tsx
replaceInFile('Future-Centre/client/src/components/notifications/NotificationBell.tsx', [
  { from: 'Sparkles,', to: 'CheckCircle2,' },
  { from: '<Sparkles size={14} />', to: '<CheckCircle2 size={14} />' }
]);

// TimePicker.tsx
replaceInFile('Future-Centre/client/src/components/forms/TimePicker.tsx', [
  { from: 'Sparkles,', to: 'Clock,' },
  { from: '<Sparkles size={14} />', to: '<Clock size={14} />' }
]);

// BookingQrPass.tsx
replaceInFile('Future-Centre/client/src/components/appointments/BookingQrPass.tsx', [
  { from: 'Sparkles,', to: 'CheckCircle2,' },
  { from: '<Sparkles size={14} />', to: '<CheckCircle2 size={14} />' }
]);

console.log('Pass 2 completed!');
