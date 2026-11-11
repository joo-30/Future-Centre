import fs from 'node:fs';

// BookingQrPass.tsx
let bqp = fs.readFileSync('Future-Centre/client/src/components/appointments/BookingQrPass.tsx', 'utf8');
bqp = bqp.replace('<Sparkles size={16} className="bqp-tip-icon" />', '<CheckCircle2 size={16} className="bqp-tip-icon" />');
bqp = bqp.replace('  Sparkles,\r\n', '');
bqp = bqp.replace('  Sparkles,\n', '');
fs.writeFileSync('Future-Centre/client/src/components/appointments/BookingQrPass.tsx', bqp, 'utf8');

// NotificationBell.tsx
let nb = fs.readFileSync('Future-Centre/client/src/components/notifications/NotificationBell.tsx', 'utf8');
nb = nb.replace('<Sparkles size={18} className="notif-type-icon is-sub" />', '<Award size={18} className="notif-type-icon is-sub" />');
nb = nb.replace('<Sparkles size={13} />', '<CheckCircle2 size={13} />');
nb = nb.replace('  Sparkles,', '  Award,\n  CheckCircle2,');
fs.writeFileSync('Future-Centre/client/src/components/notifications/NotificationBell.tsx', nb, 'utf8');

// Home.tsx
let home = fs.readFileSync('Future-Centre/client/src/features/home/Home.tsx', 'utf8');
home = home.replace('  Sparkles,\r\n', '');
home = home.replace('  Sparkles,\n', '');
fs.writeFileSync('Future-Centre/client/src/features/home/Home.tsx', home, 'utf8');

console.log('Fixed final 3 files!');
