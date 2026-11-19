import fs from 'node:fs';
import path from 'node:path';

// ========================================================
// 1. Update AdminAppointments.tsx
// ========================================================
const appointmentsPath = path.resolve('client/src/features/admin/appointments/AdminAppointments.tsx');
let appCode = fs.readFileSync(appointmentsPath, 'utf8').replace(/\r\n/g, '\n');

// 1.1 Add agendaCollapsed state
const oldStateAnchor = `  const [quickDayInput, setQuickDayInput] = useState('');`;
const newStateAnchor = `  const [quickDayInput, setQuickDayInput] = useState('');
  const [agendaCollapsed, setAgendaCollapsed] = useState(false);`;

if (appCode.includes(oldStateAnchor) && !appCode.includes('agendaCollapsed')) {
  appCode = appCode.replace(oldStateAnchor, newStateAnchor);
  console.log('Added agendaCollapsed state');
}

// 1.2 Add collapse button to today-header-badges-row
const oldBadgesRow = `          <div className="today-header-badges-row">
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
          </div>
        </div>

        {/* Date Picker Popover Panel */}
        {datePickerPopoverOpen && (`;

const newBadgesRow = `          <div className="today-header-badges-row">
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
        </div>

        {agendaCollapsed ? (
          <div
            className="agenda-collapsed-banner"
            role="button"
            tabIndex={0}
            onClick={() => setAgendaCollapsed(false)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') setAgendaCollapsed(false);
            }}
            title="انقري لإعادة فتح وعرض قائمة مرضى اليوم"
          >
            <div className="acb-content">
              <span className="acb-dot" />
              <span className="acb-text">
                تم إخفاء قائمة المرضى مؤقتاً ({agendaBookedCount} حالات مسجلة) • اضغطي هنا أو على السهم لإعادة فتح القائمة
              </span>
            </div>
            <span className="acb-action">
              <span>عرض الآن</span>
              <ChevronDown size={15} />
            </span>
          </div>
        ) : (
          <>
            {/* Date Picker Popover Panel */}
            {datePickerPopoverOpen && (`;

if (appCode.includes(oldBadgesRow)) {
  appCode = appCode.replace(oldBadgesRow, newBadgesRow);
  console.log('Added collapse toggle and wrap start in AdminAppointments.tsx');
} else {
  console.error('Could NOT find oldBadgesRow in AdminAppointments.tsx');
}

// 1.3 Close the conditional block after today-cards-grid
const oldCardsGridEnd = `            <div className="today-cards-grid">
            {agendaQuery.data.appointments.map((a) => (
              <article
                key={a.reference}
                className={\`today-card \${selected === a.reference ? 'is-selected' : ''}\`}
              >
                <div className="today-card-top">
                  <span className="today-time-badge">
                    <Clock size={13} />
                    {timeLabel(a.time)}
                  </span>
                  <StatusBadge status={a.status} />
                </div>
                <div className="today-patient-info">
                  <span className="today-avatar">{a.name.slice(0, 1)}</span>
                  <div>
                    <h3 className="today-name">{a.name}</h3>
                    <p className="today-service">{a.serviceTitle}</p>
                  </div>
                </div>
                <div className="today-card-actions">
                  <div className="today-card-actions-top">
                    <button
                      type="button"
                      className="today-rx-btn"
                      onClick={() => setPrescriptionPatient({ name: a.name, phone: a.whatsapp || a.phone })}
                      title="تحرير روشتة الدايت والنظام الغذائي للمريض"
                    >
                      <span>روشتة دايت</span>
                    </button>
                    <a
                      href={whatsappUrl(
                        a.whatsapp || a.phone,
                        \`أهلاً بحضرتك \${a.name}، معك مركز المستقبل للتغذية بخصوص موعد \${a.serviceTitle} \${agendaDate === todayStr ? 'اليوم' : 'يوم ' + dateLabel(agendaDate)} الساعة \${timeLabel(a.time)}.\`
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="today-whatsapp-btn"
                      title="مراسلة عبر واتساب مباشرة"
                    >
                      <WhatsAppIcon size={14} color="#ffffff" />
                      <span>واتساب</span>
                    </a>
                  </div>
                  <button
                    type="button"
                    className="today-details-full-btn"
                    onClick={() => setSelected(a.reference)}
                    title="عرض كافة تفاصيل الحجز"
                  >
                    <span>تفاصيل الموعد</span>
                    <ChevronLeft size={14} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>`;

const newCardsGridEnd = `            <div className="today-cards-grid">
            {agendaQuery.data.appointments.map((a) => (
              <article
                key={a.reference}
                className={\`today-card \${selected === a.reference ? 'is-selected' : ''}\`}
              >
                <div className="today-card-top">
                  <span className="today-time-badge">
                    <Clock size={13} />
                    {timeLabel(a.time)}
                  </span>
                  <StatusBadge status={a.status} />
                </div>
                <div className="today-patient-info">
                  <span className="today-avatar">{a.name.slice(0, 1)}</span>
                  <div>
                    <h3 className="today-name">{a.name}</h3>
                    <p className="today-service">{a.serviceTitle}</p>
                  </div>
                </div>
                <div className="today-card-actions">
                  <div className="today-card-actions-top">
                    <button
                      type="button"
                      className="today-rx-btn"
                      onClick={() => setPrescriptionPatient({ name: a.name, phone: a.whatsapp || a.phone })}
                      title="تحرير روشتة الدايت والنظام الغذائي للمريض"
                    >
                      <span>روشتة دايت</span>
                    </button>
                    <a
                      href={whatsappUrl(
                        a.whatsapp || a.phone,
                        \`أهلاً بحضرتك \${a.name}، معك مركز المستقبل للتغذية بخصوص موعد \${a.serviceTitle} \${agendaDate === todayStr ? 'اليوم' : 'يوم ' + dateLabel(agendaDate)} الساعة \${timeLabel(a.time)}.\`
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="today-whatsapp-btn"
                      title="مراسلة عبر واتساب مباشرة"
                    >
                      <WhatsAppIcon size={14} color="#ffffff" />
                      <span>واتساب</span>
                    </a>
                  </div>
                  <button
                    type="button"
                    className="today-details-full-btn"
                    onClick={() => setSelected(a.reference)}
                    title="عرض كافة تفاصيل الحجز"
                  >
                    <span>تفاصيل الموعد</span>
                    <ChevronLeft size={14} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
          </>
        )}
      </section>`;

if (appCode.includes(oldCardsGridEnd)) {
  appCode = appCode.replace(oldCardsGridEnd, newCardsGridEnd);
  console.log('Closed conditional block for agenda in AdminAppointments.tsx');
} else {
  console.error('Could NOT find oldCardsGridEnd in AdminAppointments.tsx');
}

// 1.4 Update Modal className for ManualBooking
const oldModalManual = `<Modal open={manual} onClose={() => setManual(false)} title="إضافة موعد يدوي">`;
const newModalManual = `<Modal open={manual} onClose={() => setManual(false)} title="إضافة موعد يدوي في العيادة" className="manual-booking-dialog">`;

if (appCode.includes(oldModalManual)) {
  appCode = appCode.replace(oldModalManual, newModalManual);
  console.log('Updated Modal className for ManualBooking');
}

fs.writeFileSync(appointmentsPath, appCode, 'utf8');
console.log('Saved AdminAppointments.tsx successfully');

// ========================================================
// 2. Add collapse toggle styles to admin.css
// ========================================================
const adminCssPath = path.resolve('client/src/styles/portal/admin.css');
let adminCss = fs.readFileSync(adminCssPath, 'utf8').replace(/\r\n/g, '\n');

const collapseStyles = `
/* ==========================================================================
   TODAY AGENDA COLLAPSE / EXPAND TOGGLE (UI/UX PRO MAX)
   ========================================================================== */
.agenda-toggle-collapse-btn {
  display: inline-flex !important;
  align-items: center !important;
  gap: 8px !important;
  min-height: 38px !important;
  height: 38px !important;
  padding: 0 14px 0 10px !important;
  border-radius: 999px !important;
  border: 1.5px solid #c8dcc6 !important;
  background: #f4f9f2 !important;
  color: #174226 !important;
  font-size: 13px !important;
  font-weight: 750 !important;
  cursor: pointer !important;
  transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1) !important;
  box-shadow: 0 1px 3px rgba(23, 66, 38, 0.05) !important;
  user-select: none !important;
}

.agenda-toggle-collapse-btn:hover {
  background: #eaf4e7 !important;
  border-color: #88a97c !important;
  color: #0c2918 !important;
  transform: translateY(-1px) !important;
  box-shadow: 0 3px 8px rgba(23, 66, 38, 0.1) !important;
}

.agenda-toggle-collapse-btn.is-collapsed {
  background: #174226 !important;
  color: #ffffff !important;
  border-color: #174226 !important;
  box-shadow: 0 3px 10px rgba(23, 66, 38, 0.18) !important;
}

.agenda-toggle-collapse-btn.is-collapsed:hover {
  background: #1f5632 !important;
  border-color: #1f5632 !important;
  color: #ffffff !important;
}

.agenda-toggle-arrow-circle {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  width: 22px !important;
  height: 22px !important;
  border-radius: 50% !important;
  background: rgba(23, 66, 38, 0.08) !important;
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1) !important;
}

.agenda-toggle-collapse-btn.is-collapsed .agenda-toggle-arrow-circle {
  background: rgba(255, 255, 255, 0.2) !important;
}

.agenda-toggle-icon {
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1) !important;
}

.agenda-toggle-icon.is-flipped {
  transform: rotate(180deg) !important;
}

.agenda-collapsed-banner {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  gap: 12px !important;
  padding: 14px 20px !important;
  background: #f7faf5 !important;
  border: 1.5px dashed #c9dcc6 !important;
  border-radius: 14px !important;
  cursor: pointer !important;
  transition: all 0.2s ease !important;
  user-select: none !important;
  margin-top: 6px !important;
}

.agenda-collapsed-banner:hover {
  background: #edf5eb !important;
  border-color: #88a97c !important;
}

.agenda-collapsed-banner .acb-content {
  display: flex !important;
  align-items: center !important;
  gap: 10px !important;
}

.agenda-collapsed-banner .acb-dot {
  width: 8px !important;
  height: 8px !important;
  border-radius: 50% !important;
  background: #256f3f !important;
  animation: pulse-soft 2s infinite !important;
}

.agenda-collapsed-banner .acb-text {
  font-size: 13.5px !important;
  font-weight: 650 !important;
  color: #1f472d !important;
}

.agenda-collapsed-banner .acb-action {
  display: inline-flex !important;
  align-items: center !important;
  gap: 5px !important;
  font-size: 13px !important;
  font-weight: 750 !important;
  color: #174226 !important;
}

@media (max-width: 768px) {
  .agenda-toggle-collapse-btn {
    width: 100% !important;
    justify-content: center !important;
  }
}
`;

if (!adminCss.includes('agenda-toggle-collapse-btn')) {
  adminCss += collapseStyles;
  fs.writeFileSync(adminCssPath, adminCss, 'utf8');
  console.log('Added collapse toggle styles to admin.css');
}

console.log('All updates finished.');
