import fs from 'node:fs';

// 1. Update AdminPatients.tsx to add className="modal-subscription"
const adminPatientsPath = 'Future-Centre/client/src/features/admin/patients/AdminPatients.tsx';
let apContent = fs.readFileSync(adminPatientsPath, 'utf8');

const targetModal = `title={editing?.id ? 'إدارة الاشتراك' : 'تسجيل اشتراك جديد'}`;
if (apContent.includes(targetModal) && !apContent.includes('modal-subscription')) {
  apContent = apContent.replace(
    targetModal,
    `${targetModal}\n        className="modal-subscription"`
  );
  fs.writeFileSync(adminPatientsPath, apContent, 'utf8');
  console.log('Updated AdminPatients.tsx with modal-subscription class');
} else {
  console.log('AdminPatients already has modal-subscription or target not found');
}

// 2. Update SubscriptionEditor.tsx for sub-total-chips structure
const subEditorPath = 'Future-Centre/client/src/features/admin/patients/SubscriptionEditor.tsx';
let seContent = fs.readFileSync(subEditorPath, 'utf8');

const oldChips = `<div className="sub-total-chips">
              <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>إجمالي الباقة:</span>
              {[4, 8, 12].map((num) => (
                <button
                  key={num}
                  type="button"
                  className={\`sub-chip-btn \${sessionsTotal === num ? 'is-active' : ''}\`}
                  onClick={() => setSessionsTotal(num)}
                >
                  {num} جلسات
                </button>
              ))}
            </div>`;

const newChips = `<div className="sub-total-chips">
              <span className="sub-total-chips-label">إجمالي الباقة:</span>
              <div className="sub-total-chips-group">
                {[4, 8, 12].map((num) => (
                  <button
                    key={num}
                    type="button"
                    className={\`sub-chip-btn \${sessionsTotal === num ? 'is-active' : ''}\`}
                    onClick={() => setSessionsTotal(num)}
                  >
                    {num} جلسات
                  </button>
                ))}
              </div>
            </div>`;

// Normalize CRLF to LF for reliable replace
const seNormalized = seContent.replace(/\r\n/g, '\n');
const oldChipsNormalized = oldChips.replace(/\r\n/g, '\n');
const newChipsNormalized = newChips.replace(/\r\n/g, '\n');

if (seNormalized.includes(oldChipsNormalized)) {
  const updatedSe = seNormalized.replace(oldChipsNormalized, newChipsNormalized);
  fs.writeFileSync(subEditorPath, updatedSe, 'utf8');
  console.log('Updated SubscriptionEditor.tsx sub-total-chips structure');
} else {
  console.log('sub-total-chips already updated or pattern slightly differs');
}
