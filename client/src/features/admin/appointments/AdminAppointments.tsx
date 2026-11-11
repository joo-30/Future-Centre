import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Activity,
  ArrowLeft,
  Calendar,
  CalendarCheck,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Gauge,
  Pencil,
  Plus,
  Printer,
  QrCode,
  RefreshCw,
  RotateCcw,
  Search,
  Stethoscope,
  UserRound,
  X,
  Zap,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StatusBadge } from '../../../components/StatusBadge';
import { DatePicker } from '../../../components/forms/DatePicker';
import { WhatsAppIcon } from '../../../components/icons/WhatsAppIcon';
import { Button, ErrorState, Loading, Modal } from '../../../components/ui';
import {
  addDays,
  dateLabel,
  fullDateLabel,
  relativeDateLabel,
  timeLabel,
  today,
  whatsappUrl,
} from '../../../lib/api';
import { adminApi } from '../../../lib/portal-api';
import { ConsoleTitle } from '../components/ConsoleTitle';
import { DailyOperationsPulse } from '../components/DailyOperationsPulse';
import {
  AdminQrScannerModal,
  type QrScanResult,
} from '../components/AdminQrScannerModal';
import { refreshAdmin } from '../lib/cache';
import { DietPrescriptionModal } from '../prescription/DietPrescriptionModal';
import { AppointmentReview } from './AppointmentReview';
import { AdvancedCapacityModal } from './AdvancedCapacityModal';
import { DailyRemindersModal } from './DailyRemindersModal';
import { ManualBooking } from './ManualBooking';

export function AdminAppointments() {
  const client = useQueryClient();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [date, setDate] = useState('');
  const [status, setStatus] = useState('');
  const [changes, setChanges] = useState(false);
  const [service, setService] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState('');
  const [manual, setManual] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [prescriptionPatient, setPrescriptionPatient] = useState<{ name: string; phone: string } | null>(null);

  // Agenda Date & Flexible Capacity Controls
  const todayStr = today();
  const [agendaDate, setAgendaDate] = useState<string>(todayStr);
  const [datePickerPopoverOpen, setDatePickerPopoverOpen] = useState(false);
  const [quickDayInput, setQuickDayInput] = useState('');
  const [capacityModalOpen, setCapacityModalOpen] = useState(false);
  const [remindersOpen, setRemindersOpen] = useState(false);

  const capacityQuery = useQuery({
    queryKey: ['admin', 'capacity', 14],
    queryFn: () => adminApi.capacity(14),
  });

  const dailyLimitData = capacityQuery.data?.dailyLimit;
  const agendaDateObj = new Date(agendaDate + 'T00:00:00');
  const jsDay = agendaDateObj.getDay(); // 0 is Sun, 1 is Mon, ... 6 is Sat
  const luxonWeekday = jsDay === 0 ? 7 : jsDay;
  const weekdayLimits = dailyLimitData?.weekdayLimits || {};
  const dateOverrides = dailyLimitData?.dateOverrides || {};
  const agendaOverride = dateOverrides[agendaDate];
  const weekdayLimit = weekdayLimits[String(luxonWeekday)];
  const clinicDefaultLimit = dailyLimitData?.maxPatients || 12;

  const effectiveAgendaLimit =
    typeof agendaOverride === 'number'
      ? agendaOverride
      : typeof weekdayLimit === 'number'
      ? weekdayLimit
      : clinicDefaultLimit;

  const handleJumpDay = (rawDay?: string) => {
    const val = rawDay ?? quickDayInput;
    const num = parseInt(val.trim(), 10);
    if (isNaN(num) || num < 1 || num > 31) return;
    const current = new Date(agendaDate + 'T00:00:00');
    const year = current.getFullYear();
    const month = current.getMonth();
    const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
    const safeDay = Math.min(Math.max(1, num), lastDayOfMonth);
    const target = new Date(year, month, safeDay);
    const yyyy = target.getFullYear();
    const mm = String(target.getMonth() + 1).padStart(2, '0');
    const dd = String(target.getDate()).padStart(2, '0');
    setAgendaDate(`${yyyy}-${mm}-${dd}`);
    setDatePickerPopoverOpen(false);
    setQuickDayInput('');
  };

  const handleQrScan = (result: QrScanResult) => {
    setScannerOpen(false);
    const target = result.reference || result.patientId || result.phone;
    if (target) {
      navigate(`/admin/patients/${encodeURIComponent(target)}`);
    }
  };

  // Custom Dropdown Menus states & click outside handlers
  const [serviceDropdownOpen, setServiceDropdownOpen] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const serviceDropdownRef = useRef<HTMLDivElement>(null);
  const statusDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (serviceDropdownRef.current && !serviceDropdownRef.current.contains(e.target as Node)) {
        setServiceDropdownOpen(false);
      }
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(e.target as Node)) {
        setStatusDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const STATUS_OPTIONS: Array<{
    key: string;
    label: string;
    dotColor: string;
    subLabel?: string;
  }> = [
    { key: '', label: 'جميع الحالات', dotColor: '#94a3b8' },
    { key: 'pending', label: 'بانتظار الموافقة', dotColor: '#f59e0b', subLabel: 'مؤقت / طلب جديد بانتظار الاعتماد' },
    { key: 'confirmed', label: 'مؤكد', dotColor: '#10b981', subLabel: 'موعد مؤكد وتم تثبيته بالعيادة' },
    { key: 'completed', label: 'مكتمل', dotColor: '#3b82f6', subLabel: 'تم الكشف وإنهاء الاستشارة' },
    { key: 'rejected', label: 'مرفوض', dotColor: '#ef4444', subLabel: 'تم رفض الموعد لعدم التوافق' },
    { key: 'cancelled', label: 'ملغي', dotColor: '#64748b', subLabel: 'أُلغي الحجز' },
    { key: 'expired', label: 'انتهت المهلة', dotColor: '#a855f7', subLabel: 'لم يتم الرد في الوقت المحدد' },
    { key: 'no_show', label: 'لم يحضر', dotColor: '#6b7280', subLabel: 'المريض لم يحضر في الموعد' },
  ];
  useEffect(() => {
    const t = setTimeout(() => {
      setDebounced(search);
      setPage(1);
    }, 250);
    return () => clearTimeout(t);
  }, [search]);
  const query = new URLSearchParams({
    page: String(page),
    search: debounced,
    ...(date ? { date } : {}),
    ...(status ? { status } : {}),
    ...(service ? { serviceId: service } : {}),
    ...(changes ? { changes: 'true' } : {}),
  }).toString();
  const appointmentsQuery = useQuery({
    queryKey: ['admin', 'appointments', query],
    queryFn: () => adminApi.appointments(query),
    refetchInterval: 15000,
  });
  const overview = useQuery({
    queryKey: ['admin', 'overview'],
    queryFn: adminApi.overview,
    refetchInterval: 15000,
  });
  const services = useQuery({ queryKey: ['admin', 'services'], queryFn: adminApi.services });
  const current = appointmentsQuery.data?.appointments.find((a) => a.reference === selected);
  const counts = overview.data;

  const agendaQuery = useQuery({
    queryKey: ['admin', 'appointments', 'agenda', agendaDate],
    queryFn: () => adminApi.appointments('date=' + agendaDate + '&limit=100'),
    refetchInterval: 15000,
  });

  const agendaBookedCount = agendaQuery.data?.appointments.length ?? 0;
  const agendaRemainingSeats = Math.max(0, effectiveAgendaLimit - agendaBookedCount);
  const isCustomAgendaDate = Boolean(agendaOverride);
  return (
    <>
      <ConsoleTitle
        title="المواعيد وطلبات الحجز"
        description="يوم المركز واضح، وكل طلب له خطوة تالية."
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <Button kind="outline" onClick={() => setScannerOpen(true)} icon={false}>
            <QrCode size={18} />
            مسح كود الحجز (QR)
          </Button>
          <Button
            kind="outline"
            onClick={() => setRemindersOpen(true)}
            icon={false}
            style={{ borderColor: '#86efac', background: '#f0fdf4', color: '#166534', fontWeight: 800 }}
            title="تجهيز وإرسال تذكيرات مواعيد اليوم عبر واتساب"
          >
            <WhatsAppIcon size={17} color="#16a34a" />
            <span>تذكير الصباح لمواعيد اليوم ({agendaQuery.data?.appointments.length ?? 0})</span>
          </Button>
          <Button onClick={() => setManual(true)} icon={false}>
            <Plus size={19} />
            إضافة موعد يدوي
          </Button>
        </div>
      </ConsoleTitle>
      <DailyOperationsPulse overview={overview.data} />

      {/* جدول مواعيد اليوم · المطلوب منكِ اليوم */}
      <section className="today-agenda-section">
        <div className="today-agenda-header">
          <div className="today-agenda-title-wrap">
            <button
              type="button"
              className={`today-agenda-icon-btn ${datePickerPopoverOpen ? 'is-active' : ''}`}
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
                  {agendaDate === todayStr ? 'جدول مواعيد اليوم • المطلوب منك اليوم' : `جدول مواعيد: ${dateLabel(agendaDate)}`}
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
                    className={`agenda-day-nav-btn is-calendar-toggle ${datePickerPopoverOpen ? 'is-active' : ''}`}
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
              {agendaQuery.data?.appointments.length ?? 0} موعد مسجل {agendaDate === todayStr ? 'اليوم' : `(${dateLabel(agendaDate, { day: 'numeric', month: 'short' })})`}
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
        {datePickerPopoverOpen && (
          <div className="agenda-datepicker-popover">
            <div className="agenda-popover-header">
              <div className="agenda-popover-title">
                <CalendarDays size={18} />
                <span>تحديد اليوم المطلوب عرضه في جدول المواعيد</span>
              </div>
              <button
                type="button"
                className="agenda-popover-close"
                onClick={() => setDatePickerPopoverOpen(false)}
                aria-label="إغلاق"
              >
                <X size={18} />
              </button>
            </div>

            {/* Quick Day Number Input (e.g. Type "20" or "15") & Custom Arabic DatePicker */}
            <div className="agenda-day-jump-row">
              <div className="agenda-jump-subrow">
                <span className="agenda-jump-label">
                  <Zap size={16} />
                  اكتب رقم اليوم (مثال 15 أو 20):
                </span>
                <div className="agenda-jump-input-group">
                  <input
                    type="number"
                    min={1}
                    max={31}
                    placeholder="20"
                    value={quickDayInput}
                    onChange={(e) => setQuickDayInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleJumpDay();
                      }
                    }}
                    className="agenda-jump-input"
                    dir="ltr"
                  />
                  <button
                    type="button"
                    className="agenda-jump-btn"
                    onClick={() => handleJumpDay()}
                  >
                    انتقال سريع ⚡
                  </button>
                </div>
              </div>

              {/* Integrated Custom Luxury Arabic DatePicker */}
              <div className="agenda-custom-picker-section">
                <span className="agenda-jump-label">أو اختاري مباشرة من التقويم:</span>
                <div className="agenda-datepicker-holder">
                  <DatePicker
                    value={agendaDate}
                    onChange={(newDate) => {
                      if (newDate) {
                        setAgendaDate(newDate);
                        setDatePickerPopoverOpen(false);
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Quick 7-Day Shortcuts */}
            <div className="agenda-shortcuts-grid">
              <span style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 600 }}>أيام سريعة:</span>
              {[0, 1, 2, 3, 4, 5, 6].map((offset) => {
                const d = addDays(todayStr, offset);
                const isSelectedDay = d === agendaDate;
                const isTodayD = d === todayStr;
                return (
                  <button
                    key={d}
                    type="button"
                    className={`agenda-day-chip ${isSelectedDay ? 'is-chosen' : ''}`}
                    onClick={() => {
                      setAgendaDate(d);
                      setDatePickerPopoverOpen(false);
                    }}
                  >
                    <span>{isTodayD ? 'اليوم' : offset === 1 ? 'غداً' : dateLabel(d, { weekday: 'short' })}</span>
                    <span className="chip-count" dir="ltr">{d.split('-')[2]}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {agendaQuery.isPending ? (
          <Loading />
        ) : !agendaQuery.data?.appointments.length ? (
          <div className="today-empty-state">
            <Calendar size={24} color="#3c7348" />
            <strong>لا توجد مواعيد مسجلة ليوم {dateLabel(agendaDate)} حتى الآن</strong>
            <small>جدول هذا اليوم مريح وهادئ، تظهر الحجوزات المؤكدة هنا فور تسجيلها أو حجزها.</small>
          </div>
        ) : (
          <div className="today-cards-grid">
            {agendaQuery.data.appointments.map((a) => (
              <article
                key={a.reference}
                className={`today-card ${selected === a.reference ? 'is-selected' : ''}`}
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
                  <button
                    type="button"
                    className="btn light"
                    style={{ fontSize: '13px', padding: '6px 10px', flex: 1 }}
                    onClick={() => setPrescriptionPatient({ name: a.name, phone: a.whatsapp || a.phone })}
                  >
                    روشتة دايت
                  </button>
                  <a
                    href={whatsappUrl(
                      a.whatsapp || a.phone,
                      `أهلاً بحضرتك ${a.name}، معك مركز المستقبل للتغذية بخصوص موعد ${a.serviceTitle} ${agendaDate === todayStr ? 'اليوم' : 'يوم ' + dateLabel(agendaDate)} الساعة ${timeLabel(a.time)}.`
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="table-whatsapp-btn"
                    title="مراسلة عبر واتساب مباشرة"
                  >
                    <WhatsAppIcon size={14} color="#ffffff" />
                    <span>واتساب</span>
                  </a>
                  <button
                    type="button"
                    className="btn outline"
                    style={{ fontSize: '13px', padding: '6px 10px' }}
                    onClick={() => setSelected(a.reference)}
                  >
                    تفاصيل
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <DailyRemindersModal
        open={remindersOpen}
        onClose={() => setRemindersOpen(false)}
        appointments={(agendaQuery.data?.appointments || []) as any}
        todayStr={todayStr}
      />

      <div className={'booking-console-grid ' + (current ? 'has-detail' : '')}>
        <section className="console-panel">
          {/* Modern Segmented Status Tabs */}
          <div className="admin-tabs-segmented" role="tablist" aria-label="تصفية حالة الحجز">
            {[
              { key: '', label: 'كل المواعيد', icon: CalendarDays, count: appointmentsQuery.data?.total },
              {
                key: 'today',
                label: 'مواعيد اليوم',
                icon: Activity,
  CalendarCheck,
                count: counts?.todayTotal ?? counts?.confirmedToday ?? agendaQuery.data?.appointments.length ?? 0,
              },
              {
                key: 'pending',
                label: 'طلبات جديدة',
                icon: Clock,
                count: counts?.pending,
                isAlert: Boolean(counts?.pending && counts.pending > 0),
              },
              {
                key: 'confirmed',
                label: 'مواعيد مؤكدة',
                icon: CheckCircle2,
                count: counts?.confirmedTotal,
              },
              { key: 'completed', label: 'مكتملة', icon: Check },
              {
                key: 'changes',
                label: 'طلبات التغيير',
                icon: RefreshCw,
                count: counts?.changes,
                isAlert: Boolean(counts?.changes && counts.changes > 0),
              },
            ].map((tab) => {
              const isTodayTab = tab.key === 'today';
              const isChangesTab = tab.key === 'changes';
              const isActive = isTodayTab
                ? date === todayStr && !changes
                : isChangesTab
                  ? changes
                  : !isTodayTab && !isChangesTab && status === tab.key && date !== todayStr && !changes;
              const IconComp = tab.icon;

              return (
                <button
                  type="button"
                  key={tab.key}
                  role="tab"
                  aria-selected={isActive}
                  className={`admin-tab-pill ${isActive ? 'is-active' : ''}`}
                  onClick={() => {
                    if (isTodayTab) {
                      setDate(todayStr);
                      setStatus('');
                      setChanges(false);
                      setPage(1);
                    } else if (isChangesTab) {
                      setChanges(true);
                      setStatus('');
                      if (date === todayStr) setDate('');
                      setPage(1);
                    } else {
                      if (date === todayStr) setDate('');
                      setStatus(tab.key);
                      setChanges(false);
                      setPage(1);
                    }
                  }}
                >
                  <IconComp size={15} />
                  <span>{tab.label}</span>
                  {typeof tab.count === 'number' && (
                    <span className={`admin-tab-count ${tab.isAlert ? 'is-alert' : ''}`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Modern Filter & Search Controls */}
          <div className="admin-filters-bar-modern">
            <div className="admin-search-box">
              <Search size={16} className="search-icon-svg" />
              <input
                aria-label="البحث عن موعد"
                placeholder="البحث في المواعيد: اسم المريض، الهاتف، رقم الملف أو كود الحجز..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="admin-search-field"
              />
              {search && (
                <button
                  type="button"
                  className="search-clear-icon"
                  onClick={() => setSearch('')}
                  title="مسح البحث"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="admin-filter-chip-group">
              <div
                className="filter-chip-select"
                onClick={(e) => {
                  if ((e.target as HTMLElement).closest('.custom-datepicker-popup')) return;
                  const btn = e.currentTarget.querySelector<HTMLButtonElement>('.custom-datepicker-trigger');
                  if (btn && e.target !== btn && !btn.contains(e.target as Node)) {
                    btn.click();
                  }
                }}
                style={{ cursor: 'pointer' }}
              >
                <span className="chip-label">التاريخ:</span>
                <DatePicker
                  value={date}
                  onChange={(d) => {
                    setDate(d);
                    setPage(1);
                  }}
                />
              </div>

              {/* Custom High-End Service Filter Dropdown */}
              <div className="admin-custom-dropdown align-end" ref={serviceDropdownRef}>
                <button
                  type="button"
                  className={`admin-dropdown-trigger ${serviceDropdownOpen ? 'is-open' : ''} ${service ? 'has-value' : ''}`}
                  onClick={() => {
                    setServiceDropdownOpen(!serviceDropdownOpen);
                    setStatusDropdownOpen(false);
                  }}
                  aria-expanded={serviceDropdownOpen}
                  title={
                    service
                      ? services.data?.services.find((s) => s.id === service)?.title || 'خدمة محددة'
                      : 'كل الخدمات الطبية'
                  }
                >
                  <Stethoscope size={15} className="dropdown-trigger-icon" />
                  <span className="dropdown-trigger-label">
                    {service
                      ? services.data?.services.find((s) => s.id === service)?.title || 'خدمة محددة'
                      : 'كل الخدمات الطبية'}
                  </span>
                  <ChevronDown
                    size={14}
                    className={`dropdown-chevron ${serviceDropdownOpen ? 'is-rotated' : ''}`}
                  />
                </button>

                {serviceDropdownOpen && (
                  <div className="dropdown-menu-popover" role="menu">
                    <div className="dropdown-popover-header">
                      <span>تصفية حسب الخدمة الطبية</span>
                      {service && (
                        <button
                          type="button"
                          className="popover-clear-btn"
                          onClick={() => {
                            setService('');
                            setPage(1);
                            setServiceDropdownOpen(false);
                          }}
                        >
                          عرض الكل
                        </button>
                      )}
                    </div>
                    <div className="dropdown-options-list">
                      <button
                        type="button"
                        className={`dropdown-option-item ${!service ? 'is-selected' : ''}`}
                        onClick={() => {
                          setService('');
                          setPage(1);
                          setServiceDropdownOpen(false);
                        }}
                      >
                        <span className="option-title-text">كل الخدمات الطبية</span>
                        {!service && <Check size={14} className="option-check-icon" />}
                      </button>

                      {services.data?.services.map((s) => {
                        const isChosen = service === s.id;
                        return (
                          <button
                            type="button"
                            key={s.id}
                            className={`dropdown-option-item ${isChosen ? 'is-selected' : ''}`}
                            onClick={() => {
                              setService(s.id);
                              setPage(1);
                              setServiceDropdownOpen(false);
                            }}
                          >
                            <div className="option-details-wrap">
                              <span className="option-title-text">{s.title}</span>
                              <div className="option-meta-tags">
                                <span className="option-meta-pill">{s.duration} دقيقة</span>
                                <span className="option-price-pill">{s.price} ج.م</span>
                              </div>
                            </div>
                            {isChosen && <Check size={14} className="option-check-icon" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Custom High-End Status Filter Dropdown */}
              <div className="admin-custom-dropdown align-end" ref={statusDropdownRef}>
                <button
                  type="button"
                  className={`admin-dropdown-trigger ${statusDropdownOpen ? 'is-open' : ''} ${status ? 'has-value' : ''}`}
                  onClick={() => {
                    setStatusDropdownOpen(!statusDropdownOpen);
                    setServiceDropdownOpen(false);
                  }}
                  aria-expanded={statusDropdownOpen}
                >
                  <span
                    className="dropdown-status-dot"
                    style={{
                      backgroundColor:
                        STATUS_OPTIONS.find((opt) => opt.key === status)?.dotColor || '#94a3b8',
                    }}
                  />
                  <span className="dropdown-trigger-label">
                    {STATUS_OPTIONS.find((opt) => opt.key === status)?.label || 'كل الحالات'}
                  </span>
                  <ChevronDown
                    size={14}
                    className={`dropdown-chevron ${statusDropdownOpen ? 'is-rotated' : ''}`}
                  />
                </button>

                {statusDropdownOpen && (
                  <div className="dropdown-menu-popover" role="menu">
                    <div className="dropdown-popover-header">
                      <span>تصفية حسب حالة الحجز</span>
                      {status && (
                        <button
                          type="button"
                          className="popover-clear-btn"
                          onClick={() => {
                            setStatus('');
                            setChanges(false);
                            setPage(1);
                            setStatusDropdownOpen(false);
                          }}
                        >
                          عرض الكل
                        </button>
                      )}
                    </div>
                    <div className="dropdown-options-list">
                      {STATUS_OPTIONS.map((opt) => {
                        const isChosen = status === opt.key;
                        return (
                          <button
                            type="button"
                            key={opt.key}
                            className={`dropdown-option-item ${isChosen ? 'is-selected' : ''}`}
                            onClick={() => {
                              setStatus(opt.key);
                              setChanges(false);
                              setPage(1);
                              setStatusDropdownOpen(false);
                            }}
                          >
                            <div className="option-status-row">
                              <span
                                className="option-status-circle"
                                style={{ backgroundColor: opt.dotColor }}
                              />
                              <div>
                                <span className="option-title-text">{opt.label}</span>
                                {opt.subLabel && (
                                  <small className="option-subtext">{opt.subLabel}</small>
                                )}
                              </div>
                            </div>
                            {isChosen && <Check size={14} className="option-check-icon" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {(date || service || status || search || changes) && (
                <button
                  type="button"
                  className="admin-reset-pills-btn"
                  onClick={() => {
                    setDate('');
                    setService('');
                    setStatus('');
                    setSearch('');
                    setChanges(false);
                    setPage(1);
                  }}
                >
                  <RotateCcw size={13} />
                  <span>مسح الفلاتر</span>
                </button>
              )}
            </div>
          </div>

          {appointmentsQuery.isPending ? (
            <Loading />
          ) : appointmentsQuery.error ? (
            <ErrorState
              message={appointmentsQuery.error.message}
              onRetry={() => void appointmentsQuery.refetch()}
            />
          ) : !appointmentsQuery.data?.appointments.length ? (
            <div className="portal-empty">
              <CalendarDays />
              <h2>لا توجد مواعيد بهذا الاختيار.</h2>
              <p>سيظهر هنا كل طلب جديد بعد إرساله من الموقع.</p>
            </div>
          ) : (
            <>
              <div className="console-table-wrap">
                <table className="console-table">
                  <thead>
                    <tr>
                      <th className="th-client">
                        <span className="th-content-pro">
                          <UserRound size={14} />
                          العميل / رقم الطلب
                        </span>
                      </th>
                      <th className="th-service">
                        <span className="th-content-pro">
                          <Clock size={14} />
                          الخدمة والموعد
                        </span>
                      </th>
                      <th className="th-status">
                        <span className="th-content-pro">
                          <CheckCircle2 size={14} />
                          حالة الحجز
                        </span>
                      </th>
                      <th className="th-actions">
                        <span className="sr-only">الإجراءات</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointmentsQuery.data.appointments.map((a) => (
                      <tr key={a.reference} className={selected === a.reference ? 'selected' : ''}>
                        <td className="td-client">
                          <div className="table-person-pro">
                            <span className="table-avatar-pro">{a.name.slice(0, 1)}</span>
                            <div className="person-details-stack">
                              <strong className="person-name-strong">{a.name}</strong>
                              <div className="person-tags-row">
                                  {a.fileNumber ? (
                                    <span className="file-tag-pill" dir="rtl" title="رقم الملف الطبي الدائم للمريض">
                                      ملف #{a.fileNumber}
                                    </span>
                                  ) : null}
                                  <span className="ref-tag-pill" dir="ltr" title="كود حجز هذا الموعد">
                                    #{a.reference}
                                  </span>
                                  <span className={`user-type-tag ${a.userId ? 'is-user' : 'is-guest'}`}>
                                    {a.userId ? 'حساب مريض' : 'حجز ضيف'}
                                  </span>
                                </div>
                            </div>
                          </div>
                        </td>
                        <td className="td-service">
                          <div className="table-service-stack">
                            <strong className="service-title-strong">{a.serviceTitle}</strong>
                            <div className="appointment-timing-pill">
                              <CalendarDays size={13} />
                              <span>{fullDateLabel(a.date)}</span>
                              <span className="timing-bullet">·</span>
                              <Clock size={13} />
                              <span dir="ltr">{timeLabel(a.time)}</span>
                              <span className={`timing-rel-chip ${a.date === todayStr ? 'is-today' : ''}`}>
                                {relativeDateLabel(a.date)}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="td-status">
                          <div className="status-cell-stack">
                            <StatusBadge status={a.status} />
                            {a.reschedule && (
                              <span className="reschedule-alert-chip">
                                <RefreshCw size={11} />
                                طلب تغيير وقت
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="td-actions">
                          <div className="table-actions-cell">
                            <a
                              href={whatsappUrl(
                                a.whatsapp || a.phone,
                                `أهلاً بحضرتك ${a.name}، معك دكتورة د. رنا ياسر الشوري بخصوص موعد ${a.serviceTitle} يوم ${dateLabel(a.date)} الساعة ${timeLabel(a.time)} في مركز المستقبل للتغذية.`
                              )}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="table-whatsapp-btn"
                              title="مراسلة المريض عبر واتساب مباشرة"
                            >
                              <WhatsAppIcon size={15} color="#ffffff" />
                              <span>واتساب</span>
                            </a>
                            <button
                              type="button"
                              className="table-rx-action-btn"
                              title="كتابة روشتة وبرنامج غذائي لهذا العميل"
                              onClick={() =>
                                setPrescriptionPatient({
                                  name: a.name,
                                  phone: a.whatsapp || a.phone,
                                })
                              }
                            >
                              <Printer size={15} />
                              <span>روشتة</span>
                            </button>
                            <button
                              type="button"
                              className={'btn ' + (a.status === 'pending' ? '' : 'light')}
                              onClick={() => setSelected(a.reference)}
                            >
                              {selected === a.reference ? 'مفتوح' : 'التفاصيل'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mobile-bookings">
                {appointmentsQuery.data.appointments.map((a) => (
                  <div className="mobile-booking-card" key={a.reference}>
                    <div className="between">
                      <div className="table-person-pro">
                        <span className="table-avatar-pro">{a.name.slice(0, 1)}</span>
                        <div>
                          <strong className="person-name-strong">{a.name}</strong>
                          {a.fileNumber ? (
                            <span className="file-tag-pill" dir="rtl" title="رقم الملف الطبي للمريض">
                              ملف #{a.fileNumber}
                            </span>
                          ) : (
                            <span className="ref-tag-pill" dir="ltr">
                              #{a.reference}
                            </span>
                          )}
                        </div>
                      </div>
                      <StatusBadge status={a.status} />
                    </div>
                    <div style={{ margin: '12px 0 8px' }}>
                      <strong className="service-title-strong" style={{ display: 'block', marginBottom: '4px' }}>
                        {a.serviceTitle}
                      </strong>
                      <div className="appointment-timing-pill">
                        <CalendarDays size={13} />
                        <span>{dateLabel(a.date, { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                        <span className="timing-bullet">·</span>
                        <Clock size={13} />
                        <span dir="ltr">{timeLabel(a.time)}</span>
                      </div>
                    </div>
                    <div className="between" style={{ marginTop: '12px', gap: '8px' }}>
                      <a
                        href={whatsappUrl(
                          a.whatsapp || a.phone,
                          `أهلاً بحضرتك ${a.name}، معك دكتورة د. رنا ياسر الشوري بخصوص موعد ${a.serviceTitle} يوم ${dateLabel(a.date)} الساعة ${timeLabel(a.time)}.`
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mobile-whatsapp-btn"
                      >
                        <WhatsAppIcon size={15} color="#ffffff" />
                        <span>واتساب</span>
                      </a>
                      <button
                        type="button"
                        className="btn light small"
                        onClick={() => setSelected(a.reference)}
                      >
                        مراجعة الطلب
                        <ArrowLeft size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
          <div className="console-pagination">
            <span>{appointmentsQuery.data?.total ?? 0} موعد</span>
            <div className="row">
              <Button
                icon={false}
                kind="light"
                disabled={page <= 1 || appointmentsQuery.isFetching}
                onClick={() => setPage(page - 1)}
              >
                السابق
              </Button>
              <span>{page}</span>
              <Button
                icon={false}
                kind="light"
                disabled={
                  !appointmentsQuery.data ||
                  page * 20 >= appointmentsQuery.data.total ||
                  appointmentsQuery.isFetching
                }
                onClick={() => setPage(page + 1)}
              >
                التالي
              </Button>
            </div>
          </div>
        </section>
        {current && (
          <>
            <div
              className="appointment-review-scrim"
              aria-label="إغلاق تفاصيل الموعد"
              onClick={() => setSelected('')}
            />
            <AppointmentReview
              key={current.reference}
              a={current}
              onClose={() => setSelected('')}
              onDone={() => refreshAdmin(client)}
            />
          </>
        )}
      </div>
      <Modal open={manual} onClose={() => setManual(false)} title="إضافة موعد يدوي">
        {manual && (
          <ManualBooking
            onDone={() => {
              setManual(false);
              refreshAdmin(client);
            }}
          />
        )}
      </Modal>

      <DietPrescriptionModal
        key={
          (prescriptionPatient?.phone || '') +
          '-' +
          (prescriptionPatient?.name || '') +
          '-' +
          String(!!prescriptionPatient)
        }
        open={!!prescriptionPatient}
        onClose={() => setPrescriptionPatient(null)}
        defaultData={
          prescriptionPatient
            ? {
                patientName: prescriptionPatient.name,
                patientPhone: prescriptionPatient.phone,
              }
            : undefined
        }
      />

      <AdminQrScannerModal
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScanSuccess={handleQrScan}
        title="مسح تذكرة المريض / كود الحجز"
        subtitle="امسحي كود الـ QR من موبايل المريض أو تذكرته الرقمية للوصول لحجزه وفتح ملفه فوراً"
      />

      <AdvancedCapacityModal
        open={capacityModalOpen}
        onClose={() => setCapacityModalOpen(false)}
        selectedAgendaDate={agendaDate}
        onSaved={() => {
          client.invalidateQueries({ queryKey: ['admin', 'capacity'] });
          client.invalidateQueries({ queryKey: ['admin', 'appointments'] });
        }}
      />
    </>
  );
}
