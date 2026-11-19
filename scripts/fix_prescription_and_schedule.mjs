import fs from 'node:fs';
import path from 'node:path';

// 1. Fix admin.css for Diet Prescription Modal
const adminCssPath = path.resolve('client/src/styles/portal/admin.css');
let adminCss = fs.readFileSync(adminCssPath, 'utf8');

// Target 1: .prescription-modal-container
const oldContainerCss = `.prescription-modal-container {
  background: #ffffff;
  border-radius: 20px;
  width: 100%;
  max-width: 900px;
  max-height: 94vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 25px 60px rgba(10, 30, 18, 0.35);
  border: 1px solid #cfdeca;
  direction: rtl;
}`;

const newContainerCss = `.prescription-modal-container {
  background: #ffffff;
  border-radius: 20px;
  width: 100%;
  max-width: 900px;
  max-height: 94vh;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  box-shadow: 0 25px 60px rgba(10, 30, 18, 0.35);
  border: 1px solid #cfdeca;
  direction: rtl;
}`;

// Target 2: .prescription-actions-bar sticky top
const oldActionsBarCss = `.prescription-actions-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  background: #fafdf7;
  border-bottom: 1px solid #e2ebd9;
  flex-shrink: 0;
}`;

const newActionsBarCss = `.prescription-actions-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  background: #fafdf7;
  border-bottom: 1px solid #e2ebd9;
  flex-shrink: 0;
  position: sticky;
  top: 0;
  z-index: 30;
}`;

// Target 3: .printable-prescription-sheet
const oldSheetCss = `.printable-prescription-sheet {
  padding: 28px 34px;
  overflow-y: visible;
  height: auto;
  flex: none;
  background: #ffffff;
}`;

const newSheetCss = `.printable-prescription-sheet {
  padding: 28px 34px;
  overflow-y: visible;
  height: auto;
  flex: 1 0 auto;
  background: #ffffff;
}`;

let normAdmin = adminCss.replace(/\r\n/g, '\n');

if (normAdmin.includes(oldContainerCss.replace(/\r\n/g, '\n'))) {
  normAdmin = normAdmin.replace(oldContainerCss.replace(/\r\n/g, '\n'), newContainerCss);
  console.log('Fixed .prescription-modal-container in admin.css');
} else {
  console.warn('Could not find exact .prescription-modal-container block in admin.css');
}

if (normAdmin.includes(oldActionsBarCss.replace(/\r\n/g, '\n'))) {
  normAdmin = normAdmin.replace(oldActionsBarCss.replace(/\r\n/g, '\n'), newActionsBarCss);
  console.log('Fixed .prescription-actions-bar in admin.css');
} else {
  console.warn('Could not find exact .prescription-actions-bar block in admin.css');
}

if (normAdmin.includes(oldSheetCss.replace(/\r\n/g, '\n'))) {
  normAdmin = normAdmin.replace(oldSheetCss.replace(/\r\n/g, '\n'), newSheetCss);
  console.log('Fixed .printable-prescription-sheet in admin.css');
} else {
  console.warn('Could not find exact .printable-prescription-sheet block in admin.css');
}

fs.writeFileSync(adminCssPath, normAdmin, 'utf8');

// 2. Update TimePicker.tsx slots to 45-minute intervals
const timePickerPath = path.resolve('client/src/components/forms/TimePicker.tsx');
let tpContent = fs.readFileSync(timePickerPath, 'utf8');

const oldEveningSlots = `const eveningSlots = [
  '12:00',
  '12:30',
  '13:00',
  '13:30',
  '14:00',
  '14:30',
  '15:00',
  '15:30',
  '16:00',
  '16:30',
  '17:00',
  '17:30',
  '18:00',
  '18:30',
  '19:00',
  '19:30',
  '20:00',
  '20:30',
  '21:00',
  '21:30',
  '22:00',
  '22:30',
  '23:00',
  '23:30',
];`;

const newEveningSlots = `const eveningSlots = [
  '12:15',
  '13:00',
  '13:45',
  '14:30',
  '15:15',
  '16:00',
  '16:45',
  '17:30',
  '18:15',
  '19:00',
  '19:45',
  '20:00',
  '20:30',
  '21:15',
  '22:00',
  '22:45',
  '23:30',
];`;

const oldMorningSlots = `const morningSlots = [
  '08:00',
  '08:30',
  '09:00',
  '09:30',
  '10:00',
  '10:30',
  '11:00',
  '11:30',
];`;

const newMorningSlots = `const morningSlots = [
  '08:00',
  '08:45',
  '09:30',
  '10:15',
  '11:00',
  '11:45',
  '12:00',
  '12:30',
];`;

let normTp = tpContent.replace(/\r\n/g, '\n');
if (normTp.includes(oldEveningSlots.replace(/\r\n/g, '\n'))) {
  normTp = normTp.replace(oldEveningSlots.replace(/\r\n/g, '\n'), newEveningSlots);
  console.log('Fixed eveningSlots in TimePicker.tsx');
}
if (normTp.includes(oldMorningSlots.replace(/\r\n/g, '\n'))) {
  normTp = normTp.replace(oldMorningSlots.replace(/\r\n/g, '\n'), newMorningSlots);
  console.log('Fixed morningSlots in TimePicker.tsx');
}
fs.writeFileSync(timePickerPath, normTp, 'utf8');

// 3. Update ScheduleEditor.tsx
const scheduleEditorPath = path.resolve('client/src/features/admin/schedule/ScheduleEditor.tsx');
let seContent = fs.readFileSync(scheduleEditorPath, 'utf8');
let normSe = seContent.replace(/\r\n/g, '\n');

// Update break default
normSe = normSe.replace(
  "{ start: '15:00', end: '15:30' }",
  "{ start: '15:00', end: '15:45' }"
);

// Update doctor preset message
normSe = normSe.replace(
  'جدول الدكتورة المعتمد (الاثنين إلى الخميس من 01:00 م إلى 08:00 م بدون استراحة). اضغطي حفظ لتأكيد التغيير.',
  'جدول الدكتورة المعتمد (الاثنين إلى الخميس من 01:00 م إلى 08:00 م بفواصل 45 دقيقة بدون استراحة). اضغطي حفظ لتأكيد التغيير.'
);

// Update metric label
normSe = normSe.replace(
  '<div className="metric-label">السعة الاستيعابية أسبوعياً</div>',
  '<div className="metric-label">السعة الاستيعابية أسبوعياً (فواصل 45 دقيقة)</div>'
);

fs.writeFileSync(scheduleEditorPath, normSe, 'utf8');
console.log('Fixed ScheduleEditor.tsx');
