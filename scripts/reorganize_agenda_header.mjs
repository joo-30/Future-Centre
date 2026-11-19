import fs from 'node:fs';
import path from 'node:path';

// ========================================================
// 1. Update AdminAppointments.tsx
// ========================================================
const appointmentsPath = path.resolve('client/src/features/admin/appointments/AdminAppointments.tsx');
let appCode = fs.readFileSync(appointmentsPath, 'utf8').replace(/\r\n/g, '\n');

const oldHeaderBlock = `      {/* جدول مواعيد اليوم · المطلوب منكِ اليوم */}
      <section className="today-agenda-section">
        <div className="today-agenda-header">
          <div className="today-agenda-title-wrap">
            <button
              type="button"
              className={\`today-agenda-icon-btn \${datePickerPopoverOpen ? 'is-active' : ''}\`}
              onClick={() => setDatePickerPopoverOpen(!datePickerPopoverOpen)}
              title="تغيير يوم الجدول (مثلاً يوم 15 أو 20)"
              aria-label="تغيير يوم الجدول واختيار تاريخ محدد"
            >
              <CalendarDays size={22} />
              {agendaDate !== todayStr && <span className="agenda-btn-badge">•</span>}
            </button>
            <div className="today-title-date-container">
              <div className="today-title-row">
                <h2 className="today-agenda-title">
                  {agendaDate === todayStr ? 'جدول مواعيد اليوم • المطلوب منك اليوم' : \`جدول مواعيد: \${dateLabel(agendaDate)}\`}
                </h2>
                {agendaDate !== todayStr && (
                  <button
                    type="button"
                    className="today-back-to-now-btn"
                    onClick={() => setAgendaDate(todayStr)}
                    title="العودة لمواعيد اليوم"
                  >
                    <RotateCcw size={12} />
                    <span>العودة لليوم</span>
                  </button>
                )}
              </div>
              <div className="today-subtitle-row">
                <div className="today-date-badge">
                  <CalendarDays size={16} />
                  <span>
                    {dateLabel(agendaDate, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </div>

                {/* Prominent Day Navigation Cluster with larger text and clear buttons */}
                <div className="agenda-day-nav">
                  <button
                    type="button"
                    className="agenda-day-nav-btn is-prev"
                    onClick={() => setAgendaDate(addDays(agendaDate, -1))}
                    title="اليوم السابق"
                  >
                    <ChevronRight size={16} />
                    <span>السابق</span>
                  </button>

                  <button
                    type="button"
                    className={\`agenda-day-nav-btn is-calendar-toggle \${datePickerPopoverOpen ? 'is-active' : ''}\`}
                    onClick={() => setDatePickerPopoverOpen(!datePickerPopoverOpen)}
                    title="اختيار يوم محدد من التقويم أو كتابة رقم اليوم"
                  >
                    <CalendarDays size={16} />
                    <span className="hide-on-mobile">اختيار يوم (مثلاً 15 أو 20)</span>
                    <span className="show-on-mobile">اختيار يوم</span>
                  </button>

                  <button
                    type="button"
                    className="agenda-day-nav-btn is-next"
                    onClick={() => setAgendaDate(addDays(agendaDate, 1))}
                    title="اليوم التالي"
                  >
                    <span>التالي</span>
                    <ChevronLeft size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="today-header-badges-row">
            <span className="today-count-badge">
              {agendaQuery.data?.appointments.length ?? 0} موعد مسجل {agendaDate === todayStr ? 'اليوم' : \`(\${dateLabel(agendaDate, { day: 'numeric', month: 'short' })})\`}
            </span>
            <div className="today-capacity-quick-pill">
              <span className="tcq-icon"><Gauge size={14} /></span>
              <span className="tcq-text">
                سعة {agendaDate === todayStr ? 'اليوم' : dateLabel(agendaDate, { weekday: 'short', day: 'numeric' })}: <strong>{effectiveAgendaLimit} حالة</strong>
                {isCustomAgendaDate && <span className="tcq-custom-badge" title="سعة مخصصة لهذا التاريخ تحديداً"> (مخصص)</span>}
              </span>
              <span className="tcq-sep">•</span>
              <span className="tcq-rem">
                المتبقي: <strong className={agendaRemainingSeats <= 3 ? 'text-urgent' : 'text-emerald'}>
                  {agendaRemainingSeats} مقعد
                </strong>
              </span>
              <button
                type="button"
                className="tcq-edit-btn"
                onClick={() => setCapacityModalOpen(true)}
                title="تعديل السعة الأسبوعية أو اليومية"
              >
                <Pencil size={12} />
                <span>تعديل السعة</span>
              </button>
            </div>

            {/* Collapse/Expand Toggle Button with Arrow */}
            <button
              type="button"
              className={\`agenda-toggle-collapse-btn \${agendaCollapsed ? 'is-collapsed' : ''}\`}
              onClick={() => setAgendaCollapsed(!agendaCollapsed)}
              aria-expanded={!agendaCollapsed}
              title={agendaCollapsed ? 'فتح وعرض جدول مرضى اليوم' : 'إخفاء وطي جدول مرضى اليوم'}
            >
              <span className="agenda-toggle-label">{agendaCollapsed ? 'عرض المرضى' : 'إخفاء المرضى'}</span>
              <span className="agenda-toggle-arrow-circle">
                <ChevronDown size={17} className={\`agenda-toggle-icon \${agendaCollapsed ? 'is-flipped' : ''}\`} />
              </span>
            </button>
          </div>
        </div>`;

const newHeaderBlock = `      {/* جدول مواعيد اليوم · المطلوب منكِ اليوم */}
      <section className="today-agenda-section">
        <div className="today-agenda-header-v2">
          {/* Tier 1: Centered Title at the Top */}
          <div className="today-agenda-top-centered">
            <div className="today-agenda-header-pill">
              <span className="today-agenda-header-icon" aria-hidden="true">
                <CalendarDays size={20} />
              </span>
              <h2 className="today-agenda-title">
                {agendaDate === todayStr ? 'جدول مواعيد اليوم • المطلوب منك اليوم' : \`جدول مواعيد: \${dateLabel(agendaDate)}\`}
              </h2>
              {agendaDate !== todayStr && (
                <button
                  type="button"
                  className="today-back-to-now-btn"
                  onClick={() => setAgendaDate(todayStr)}
                  title="العودة لمواعيد اليوم"
                >
                  <RotateCcw size={12} />
                  <span>العودة لليوم</span>
                </button>
              )}
            </div>
          </div>

          {/* Tier 2: Date at Start (Right), Navigation Buttons at End (Left) */}
          <div className="today-agenda-nav-bar">
            <div className="today-date-badge">
              <CalendarDays size={16} />
              <span>
                {dateLabel(agendaDate, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>

            <div className="agenda-day-nav">
              <button
                type="button"
                className="agenda-day-nav-btn is-prev"
                onClick={() => setAgendaDate(addDays(agendaDate, -1))}
                title="اليوم السابق"
              >
                <ChevronRight size={16} />
                <span>السابق</span>
              </button>

              <button
                type="button"
                className={\`agenda-day-nav-btn is-calendar-toggle \${datePickerPopoverOpen ? 'is-active' : ''}\`}
                onClick={() => setDatePickerPopoverOpen(!datePickerPopoverOpen)}
                title="اختيار يوم محدد من التقويم أو كتابة رقم اليوم"
              >
                <CalendarDays size={16} />
                <span className="hide-on-mobile">اختيار يوم (مثلاً 15 أو 20)</span>
                <span className="show-on-mobile">اختيار يوم</span>
              </button>

              <button
                type="button"
                className="agenda-day-nav-btn is-next"
                onClick={() => setAgendaDate(addDays(agendaDate, 1))}
                title="اليوم التالي"
              >
                <span>التالي</span>
                <ChevronLeft size={16} />
              </button>
            </div>
          </div>

          {/* Tier 3: Registered Count at Start (Right), Capacity in Center, Collapse Toggle at End (Left) */}
          <div className="today-agenda-metrics-bar">
            <span className="today-count-badge">
              {agendaQuery.data?.appointments.length ?? 0} موعد مسجل {agendaDate === todayStr ? 'اليوم' : \`(\${dateLabel(agendaDate, { day: 'numeric', month: 'short' })})\`}
            </span>

            <div className="today-capacity-quick-pill">
              <span className="tcq-icon"><Gauge size={14} /></span>
              <span className="tcq-text">
                سعة {agendaDate === todayStr ? 'اليوم' : dateLabel(agendaDate, { weekday: 'short', day: 'numeric' })}: <strong>{effectiveAgendaLimit} حالة</strong>
                {isCustomAgendaDate && <span className="tcq-custom-badge" title="سعة مخصصة لهذا التاريخ تحديداً"> (مخصص)</span>}
              </span>
              <span className="tcq-sep">•</span>
              <span className="tcq-rem">
                المتبقي: <strong className={agendaRemainingSeats <= 3 ? 'text-urgent' : 'text-emerald'}>
                  {agendaRemainingSeats} مقعد
                </strong>
              </span>
              <button
                type="button"
                className="tcq-edit-btn"
                onClick={() => setCapacityModalOpen(true)}
                title="تعديل السعة الأسبوعية أو اليومية"
              >
                <Pencil size={12} />
                <span>تعديل السعة</span>
              </button>
            </div>

            <button
              type="button"
              className={\`agenda-toggle-collapse-btn \${agendaCollapsed ? 'is-collapsed' : ''}\`}
              onClick={() => setAgendaCollapsed(!agendaCollapsed)}
              aria-expanded={!agendaCollapsed}
              title={agendaCollapsed ? 'فتح وعرض جدول مرضى اليوم' : 'إخفاء وطي جدول مرضى اليوم'}
            >
              <span className="agenda-toggle-label">{agendaCollapsed ? 'عرض المرضى' : 'إخفاء المرضى'}</span>
              <span className="agenda-toggle-arrow-circle">
                <ChevronDown size={17} className={\`agenda-toggle-icon \${agendaCollapsed ? 'is-flipped' : ''}\`} />
              </span>
            </button>
          </div>
        </div>`;

if (appCode.includes(oldHeaderBlock)) {
  appCode = appCode.replace(oldHeaderBlock, newHeaderBlock);
  fs.writeFileSync(appointmentsPath, appCode, 'utf8');
  console.log('Successfully reorganized today-agenda-header in AdminAppointments.tsx');
} else {
  console.error('Could NOT find oldHeaderBlock in AdminAppointments.tsx');
}

// ========================================================
// 2. Add styles to admin.css
// ========================================================
const adminCssPath = path.resolve('client/src/styles/portal/admin.css');
let adminCss = fs.readFileSync(adminCssPath, 'utf8').replace(/\r\n/g, '\n');

const newHeaderStyles = `
/* ==========================================================================
   TODAY AGENDA HEADER 3-TIER LUXURY RESTRUCTURING (UI/UX PRO MAX)
   ========================================================================== */
.today-agenda-header-v2 {
  display: flex !important;
  flex-direction: column !important;
  gap: 16px !important;
  margin-bottom: 20px !important;
  padding-bottom: 16px !important;
  border-bottom: 1.5px solid #edf4ea !important;
}

/* Tier 1: Centered Title */
.today-agenda-top-centered {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  width: 100% !important;
  text-align: center !important;
  padding-bottom: 2px !important;
}

.today-agenda-header-pill {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 12px !important;
  padding: 8px 24px !important;
  background: #f4f9f2 !important;
  border: 1.5px solid #d2e4ce !important;
  border-radius: 999px !important;
  box-shadow: 0 2px 8px rgba(18, 52, 28, 0.05) !important;
}

.today-agenda-header-icon {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  width: 34px !important;
  height: 34px !important;
  border-radius: 50% !important;
  background: #174d2b !important;
  color: #ffffff !important;
  box-shadow: 0 2px 6px rgba(23, 77, 43, 0.2) !important;
}

.today-agenda-header-pill .today-agenda-title {
  margin: 0 !important;
  font-size: 20px !important;
  font-weight: 850 !important;
  color: #0c2918 !important;
  font-family: Alex, 'Alexandria', sans-serif !important;
  letter-spacing: -0.015em !important;
}

/* Tier 2: Date on Start (Right), Nav on End (Left) */
.today-agenda-nav-bar {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  width: 100% !important;
  gap: 16px !important;
  flex-wrap: wrap !important;
}

/* Date Badge Luxury Refresh */
.today-agenda-nav-bar .today-date-badge {
  display: inline-flex !important;
  align-items: center !important;
  gap: 9px !important;
  padding: 8px 18px !important;
  background: #ffffff !important;
  border: 1.5px solid #cee0cb !important;
  border-radius: 999px !important;
  font-size: 14.5px !important;
  font-weight: 800 !important;
  color: #0c2819 !important;
  font-family: Alex, 'Alexandria', sans-serif !important;
  box-shadow: 0 1px 4px rgba(20, 55, 30, 0.04) !important;
}

.today-agenda-nav-bar .today-date-badge svg {
  color: #174d2b !important;
}

/* Navigation Cluster Luxury Styling */
.today-agenda-nav-bar .agenda-day-nav {
  display: inline-flex !important;
  align-items: center !important;
  background: rgba(244, 249, 242, 0.95) !important;
  border: 1.5px solid #d0e2cb !important;
  border-radius: 999px !important;
  padding: 4px 6px !important;
  gap: 4px !important;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.02) !important;
}

.today-agenda-nav-bar .agenda-day-nav-btn {
  display: inline-flex !important;
  align-items: center !important;
  gap: 6px !important;
  padding: 7px 15px !important;
  background: transparent !important;
  border: none !important;
  border-radius: 999px !important;
  font-size: 13.5px !important;
  font-weight: 750 !important;
  color: #1e452e !important;
  cursor: pointer !important;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
  white-space: nowrap !important;
}

.today-agenda-nav-bar .agenda-day-nav-btn:hover {
  background: #ffffff !important;
  color: #0c2617 !important;
  box-shadow: 0 2px 8px rgba(18, 52, 28, 0.08) !important;
}

.today-agenda-nav-bar .agenda-day-nav-btn.is-calendar-toggle {
  background: #ffffff !important;
  color: #174d2b !important;
  border: 1px solid #c8dbc5 !important;
}

.today-agenda-nav-bar .agenda-day-nav-btn.is-calendar-toggle:hover,
.today-agenda-nav-bar .agenda-day-nav-btn.is-calendar-toggle.is-active {
  background: #174d2b !important;
  color: #ffffff !important;
  border-color: #174d2b !important;
  box-shadow: 0 3px 10px rgba(23, 77, 43, 0.2) !important;
}

.today-agenda-nav-bar .agenda-day-nav-btn.is-calendar-toggle.is-active svg {
  color: #ffffff !important;
}

/* Tier 3: Metrics & Collapse Bar */
.today-agenda-metrics-bar {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  width: 100% !important;
  gap: 14px !important;
  flex-wrap: wrap !important;
}

.today-agenda-metrics-bar .today-count-badge {
  background: #174d2b !important;
  color: #ffffff !important;
  padding: 8px 18px !important;
  border-radius: 999px !important;
  font-size: 13.5px !important;
  font-weight: 800 !important;
  font-family: Alex, 'Alexandria', sans-serif !important;
  box-shadow: 0 2px 8px rgba(23, 77, 43, 0.18) !important;
}

.today-agenda-metrics-bar .today-capacity-quick-pill {
  margin: 0 !important;
}

@media (max-width: 900px) {
  .today-agenda-nav-bar,
  .today-agenda-metrics-bar {
    justify-content: center !important;
  }
}

@media (max-width: 640px) {
  .today-agenda-header-pill {
    width: 100% !important;
    border-radius: 16px !important;
    padding: 8px 12px !important;
  }

  .today-agenda-nav-bar,
  .today-agenda-metrics-bar {
    flex-direction: column !important;
    align-items: stretch !important;
  }

  .today-agenda-nav-bar .today-date-badge,
  .today-agenda-nav-bar .agenda-day-nav,
  .today-agenda-metrics-bar .today-count-badge,
  .today-agenda-metrics-bar .today-capacity-quick-pill,
  .today-agenda-metrics-bar .agenda-toggle-collapse-btn {
    width: 100% !important;
    justify-content: center !important;
  }
}
`;

if (!adminCss.includes('today-agenda-header-v2')) {
  adminCss += newHeaderStyles;
  fs.writeFileSync(adminCssPath, adminCss, 'utf8');
  console.log('Added today-agenda-header-v2 styles to admin.css');
}

console.log('Finished restructuring.');
