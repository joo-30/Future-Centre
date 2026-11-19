import fs from 'node:fs';
import path from 'node:path';

// ========================================================
// 1. Update AdminAppointments.tsx
// ========================================================
const appointmentsPath = path.resolve('client/src/features/admin/appointments/AdminAppointments.tsx');
let appCode = fs.readFileSync(appointmentsPath, 'utf8').replace(/\r\n/g, '\n');

const oldRemindersAndPanel = `      <div className="admin-reminder-action">
        <Button
          kind="outline"
          onClick={() => setRemindersOpen(true)}
          disabled={todayAppointments.length === 0}
          icon={false}
        >
          <WhatsAppIcon size={17} /> تذكيرات مواعيد اليوم
        </Button>
        {!remindersQuery.isPending && !remindersQuery.isError && todayAppointments.length === 0 && (
          <small>لا توجد مواعيد للتذكير اليوم.</small>
        )}
      </div>

      <DailyRemindersModal
        open={remindersOpen}
        onClose={() => setRemindersOpen(false)}
        appointments={todayAppointments}
        todayStr={todayStr}
      />

      <div className={'booking-console-grid ' + (current ? 'has-detail' : '')}>
        <section className="console-panel">
          <h2 className="admin-appointment-results" ref={results} tabIndex={-1}>قائمة المواعيد</h2>
          {/* Modern Segmented Status Tabs */}`;

const newRemindersAndPanel = `      <DailyRemindersModal
        open={remindersOpen}
        onClose={() => setRemindersOpen(false)}
        appointments={todayAppointments}
        todayStr={todayStr}
      />

      <div className={'booking-console-grid ' + (current ? 'has-detail' : '')}>
        <section className="console-panel">
          {/* Card Header Containing Title & Key Actions */}
          <div className="console-panel-card-header">
            <div className="console-panel-card-title-group">
              <div className="console-panel-header-icon" aria-hidden="true">
                <CalendarDays size={20} />
              </div>
              <div className="console-panel-headings">
                <h2 className="admin-appointment-results" ref={results} tabIndex={-1}>
                  قائمة المواعيد
                </h2>
                <p className="console-panel-subtitle">إدارة وتصفية ومتابعة مواعيد العيادة والحجوزات</p>
              </div>
            </div>
            <div className="console-panel-card-actions">
              <Button
                kind="outline"
                className="console-panel-reminder-btn"
                onClick={() => setRemindersOpen(true)}
                disabled={todayAppointments.length === 0}
                icon={false}
              >
                <WhatsAppIcon size={16} />
                <span>تذكيرات مواعيد اليوم</span>
              </Button>
              <Button
                kind="brand"
                className="console-panel-add-manual-btn"
                onClick={() => setManual(true)}
                icon={false}
              >
                <Plus size={16} />
                <span>إضافة موعد يدوي</span>
              </Button>
            </div>
          </div>

          {/* Modern Segmented Status Tabs */}`;

if (appCode.includes(oldRemindersAndPanel)) {
  appCode = appCode.replace(oldRemindersAndPanel, newRemindersAndPanel);
  fs.writeFileSync(appointmentsPath, appCode, 'utf8');
  console.log('Successfully updated AdminAppointments.tsx');
} else {
  console.error('Could NOT find oldRemindersAndPanel in AdminAppointments.tsx');
}

// ========================================================
// 2. Add styles for console-panel-card-header in admin.css
// ========================================================
const adminCssPath = path.resolve('client/src/styles/portal/admin.css');
let adminCss = fs.readFileSync(adminCssPath, 'utf8').replace(/\r\n/g, '\n');

const panelHeaderStyles = `
/* ==========================================================================
   CONSOLE PANEL UNIFIED CARD HEADER (UI/UX PRO MAX)
   ========================================================================== */
.console-panel-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 14px;
  padding: 18px 24px 16px;
  background: #ffffff;
  border-bottom: 1.5px solid #e7eee2;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
}

.console-panel-card-title-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.console-panel-header-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 11px;
  background: #edf5ea;
  color: #174d2b;
  border: 1px solid #cee2ca;
  flex-shrink: 0;
}

.console-panel-headings {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.console-panel-card-header .admin-appointment-results {
  margin: 0 !important;
  font-size: 21px !important;
  font-weight: 850 !important;
  color: #0d281a !important;
  font-family: Alex, 'Alexandria', sans-serif !important;
  letter-spacing: -0.015em !important;
  line-height: 1.25 !important;
}

.console-panel-subtitle {
  margin: 0 !important;
  font-size: 13px !important;
  color: #55705d !important;
  font-weight: 500 !important;
}

.console-panel-card-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.console-panel-reminder-btn {
  display: inline-flex !important;
  align-items: center !important;
  gap: 7px !important;
  min-height: 40px !important;
  padding: 0 16px !important;
  border-radius: 10px !important;
  font-size: 13px !important;
  font-weight: 700 !important;
  border-color: #c9dbca !important;
  color: #164627 !important;
  background: #f7faf5 !important;
  transition: all 0.2s ease !important;
}

.console-panel-reminder-btn:hover:not(:disabled) {
  background: #eef6ec !important;
  border-color: #88a97c !important;
}

.console-panel-add-manual-btn {
  display: inline-flex !important;
  align-items: center !important;
  gap: 6px !important;
  min-height: 40px !important;
  padding: 0 16px !important;
  border-radius: 10px !important;
  font-size: 13px !important;
  font-weight: 700 !important;
  background: #194f2c !important;
  color: #ffffff !important;
  box-shadow: 0 2px 6px rgba(25, 79, 44, 0.15) !important;
}

@media (max-width: 768px) {
  .console-panel-card-header {
    padding: 14px 16px !important;
    gap: 12px !important;
  }
  
  .console-panel-card-actions {
    width: 100% !important;
    justify-content: stretch !important;
  }

  .console-panel-reminder-btn,
  .console-panel-add-manual-btn {
    flex: 1 1 auto !important;
    justify-content: center !important;
  }
}
`;

if (!adminCss.includes('console-panel-card-header')) {
  adminCss += panelHeaderStyles;
  fs.writeFileSync(adminCssPath, adminCss, 'utf8');
  console.log('Successfully appended console-panel-card-header styles to admin.css');
} else {
  console.log('console-panel-card-header styles already present in admin.css');
}

// ========================================================
// 3. Update daily-pulse.css margin-top
// ========================================================
const pulseCssPath = path.resolve('client/src/styles/portal/daily-pulse.css');
let pulseCss = fs.readFileSync(pulseCssPath, 'utf8').replace(/\r\n/g, '\n');

const oldPulseContainer = `.daily-pulse-container {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 24px;
  direction: rtl;
}`;

const newPulseContainer = `.daily-pulse-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-block-start: clamp(34px, 3.8vw, 52px) !important;
  margin-block-end: 28px !important;
  direction: rtl;
}`;

if (pulseCss.includes(oldPulseContainer)) {
  pulseCss = pulseCss.replace(oldPulseContainer, newPulseContainer);
  fs.writeFileSync(pulseCssPath, pulseCss, 'utf8');
  console.log('Successfully updated daily-pulse-container in daily-pulse.css');
} else {
  console.error('Could NOT find oldPulseContainer in daily-pulse.css');
}

// ========================================================
// 4. Update mobile.css daily-pulse margin-top
// ========================================================
const mobileCssPath = path.resolve('client/src/styles/portal/mobile.css');
let mobileCss = fs.readFileSync(mobileCssPath, 'utf8').replace(/\r\n/g, '\n');

const oldMobilePulse = `  /* Daily Pulse Cards 2x2 Grid on Mobile */
  .daily-pulse-container {
    padding: 14px !important;
    gap: 12px !important;
    margin-bottom: 18px !important;
  }`;

const newMobilePulse = `  /* Daily Pulse Cards 2x2 Grid on Mobile */
  .daily-pulse-container {
    padding: 16px 14px !important;
    gap: 12px !important;
    margin-block-start: 28px !important;
    margin-block-end: 22px !important;
  }`;

if (mobileCss.includes(oldMobilePulse)) {
  mobileCss = mobileCss.replace(oldMobilePulse, newMobilePulse);
  fs.writeFileSync(mobileCssPath, mobileCss, 'utf8');
  console.log('Successfully updated daily-pulse-container in mobile.css');
} else {
  console.error('Could NOT find oldMobilePulse in mobile.css');
}

// ========================================================
// 5. Fix QR Scanner button & BMI search bar in qr-and-scanner.css
// ========================================================
const qrCssPath = path.resolve('client/src/styles/qr-and-scanner.css');
let qrCss = fs.readFileSync(qrCssPath, 'utf8').replace(/\r\n/g, '\n');

const oldQrSearchBlock = `/* Patient Search Select - Fully Contained, Number typing visible */
.pss-controls-row {
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
  width: 100% !important;
  max-width: 100% !important;
  min-width: 0 !important;
  box-sizing: border-box !important;
  overflow: hidden !important;
}

.pss-trigger {
  flex: 1 1 auto !important;
  min-width: 0 !important;
  max-width: calc(100% - 52px) !important;
  box-sizing: border-box !important;
  overflow: hidden !important;
}

.pss-trigger:not(.has-value) {
  max-width: calc(100% - 52px) !important;
}

.pss-main-search-input {
  text-align: right !important;
  direction: rtl !important;
  font-size: 15px !important;
  font-weight: 700 !important;
  color: #11341c !important;
}

.pss-selected-preview {
  min-width: 0 !important;
  flex: 1 !important;
  overflow: hidden !important;
}

.pss-name {
  max-width: 120px !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  white-space: nowrap !important;
}

.pss-scan-qr-btn {
  flex-shrink: 0 !important;
  width: 44px !important;
  min-width: 44px !important;
  max-width: 44px !important;
  height: 46px !important;
  min-height: 46px !important;
  padding: 0 !important;
  border-radius: 12px !important;
  box-sizing: border-box !important;
}`;

const newQrSearchBlock = `/* Patient Search Select - Fully Contained, Number typing visible & Perfect Button Flow */
.pss-controls-row {
  display: flex !important;
  align-items: center !important;
  gap: 10px !important;
  width: 100% !important;
  max-width: 100% !important;
  min-width: 0 !important;
  box-sizing: border-box !important;
  overflow: visible !important;
}

.pss-trigger {
  flex: 1 1 0 !important;
  min-width: 0 !important;
  width: auto !important;
  max-width: none !important;
  box-sizing: border-box !important;
}

.pss-trigger:not(.has-value) {
  max-width: none !important;
}

.pss-main-search-input {
  text-align: right !important;
  direction: rtl !important;
  font-size: 14.5px !important;
  font-weight: 600 !important;
  color: #11341c !important;
  width: 100% !important;
  min-width: 0 !important;
}

.pss-selected-preview {
  min-width: 0 !important;
  flex: 1 !important;
  overflow: hidden !important;
}

.pss-name {
  max-width: 140px !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  white-space: nowrap !important;
}

.pss-scan-qr-btn {
  flex-shrink: 0 !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 8px !important;
  width: auto !important;
  min-width: fit-content !important;
  max-width: none !important;
  height: 48px !important;
  min-height: 48px !important;
  padding: 0 16px !important;
  border-radius: 13px !important;
  background: #194f2c !important;
  color: #ffffff !important;
  box-sizing: border-box !important;
  cursor: pointer !important;
  transition: all 0.2s ease !important;
}

.pss-scan-qr-btn:hover {
  background: #206237 !important;
  box-shadow: 0 4px 12px rgba(25, 79, 44, 0.22) !important;
}

.pss-scan-qr-btn .pss-scan-text {
  display: inline-block !important;
  font-size: 13.5px !important;
  font-weight: 700 !important;
  white-space: nowrap !important;
}

@media (max-width: 560px) {
  .pss-scan-qr-btn {
    width: 46px !important;
    min-width: 46px !important;
    max-width: 46px !important;
    padding: 0 !important;
    gap: 0 !important;
  }

  .pss-scan-qr-btn .pss-scan-text {
    display: none !important;
  }
}`;

if (qrCss.includes(oldQrSearchBlock)) {
  qrCss = qrCss.replace(oldQrSearchBlock, newQrSearchBlock);
  fs.writeFileSync(qrCssPath, qrCss, 'utf8');
  console.log('Successfully updated qr-and-scanner.css');
} else {
  console.error('Could NOT find oldQrSearchBlock in qr-and-scanner.css');
}

console.log('All updates finished.');
