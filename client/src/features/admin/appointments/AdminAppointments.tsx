import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Clock,
  Gauge,
  Pencil,
  Plus,
  Printer,
  QrCode,
  RefreshCw,
  RotateCcw,
  Search,
  Sparkles,
  Stethoscope,
  UserRound,
  X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StatusBadge } from '../../../components/StatusBadge';
import { DatePicker } from '../../../components/forms/DatePicker';
import { WhatsAppIcon } from '../../../components/icons/WhatsAppIcon';
import { Button, ErrorState, Loading, Modal } from '../../../components/ui';
import {
  dateLabel,
  fullDateLabel,
  relativeDateLabel,
  timeLabel,
  today,
  whatsappUrl,
} from '../../../lib/api';
import { adminApi } from '../../../lib/portal-api';
import { ConsoleTitle } from '../components/ConsoleTitle';
import {
  AdminQrScannerModal,
  type QrScanResult,
} from '../components/AdminQrScannerModal';
import { refreshAdmin } from '../lib/cache';
import { DietPrescriptionModal } from '../prescription/DietPrescriptionModal';
import { AppointmentReview } from './AppointmentReview';
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

  // Quick Daily Capacity Controls
  const [capacityModalOpen, setCapacityModalOpen] = useState(false);
  const [customCapacityValue, setCustomCapacityValue] = useState<number>(20);
  const [capacitySaving, setCapacitySaving] = useState(false);

  const capacityQuery = useQuery({
    queryKey: ['admin', 'capacity', 1],
    queryFn: () => adminApi.capacity(1),
  });

  const todayCapacity = capacityQuery.data?.todayStats;
  const clinicDefaultLimit = capacityQuery.data?.dailyLimit?.maxPatients || 20;

  const handleSaveTodayCapacity = async (val?: number) => {
    const targetLimit = val ?? customCapacityValue;
    const todayDateStr = capacityQuery.data?.todayStats.date;
    const limit = capacityQuery.data?.dailyLimit;
    if (!todayDateStr || !limit || targetLimit < 1) return;
    setCapacitySaving(true);
    try {
      const currentOverrides = limit.dateOverrides || {};
      await adminApi.saveCapacity({
        enabled: limit.enabled ?? true,
        showToPatients: limit.showToPatients ?? true,
        maxPatients: limit.maxPatients || 20,
        weekdayLimits: limit.weekdayLimits || {},
        dateOverrides: {
          ...currentOverrides,
          [todayDateStr]: targetLimit,
        },
        closedMessage: limit.closedMessage,
      });
      await client.invalidateQueries({ queryKey: ['admin', 'capacity'] });
      setCapacityModalOpen(false);
    } finally {
      setCapacitySaving(false);
    }
  };

  const handleResetTodayCapacity = async () => {
    const todayDateStr = capacityQuery.data?.todayStats.date;
    const limit = capacityQuery.data?.dailyLimit;
    if (!todayDateStr || !limit) return;
    setCapacitySaving(true);
    try {
      const currentOverrides = { ...(limit.dateOverrides || {}) };
      delete currentOverrides[todayDateStr];
      await adminApi.saveCapacity({
        enabled: limit.enabled ?? true,
        showToPatients: limit.showToPatients ?? true,
        maxPatients: limit.maxPatients || 20,
        weekdayLimits: limit.weekdayLimits || {},
        dateOverrides: currentOverrides,
        closedMessage: limit.closedMessage,
      });
      await client.invalidateQueries({ queryKey: ['admin', 'capacity'] });
      setCapacityModalOpen(false);
    } finally {
      setCapacitySaving(false);
    }
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

  const todayStr = today();
  const todayQuery = useQuery({
    queryKey: ['admin', 'appointments', 'today', todayStr],
    queryFn: () => adminApi.appointments('date=' + todayStr + '&limit=50'),
    refetchInterval: 15000,
  });
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
          <Button onClick={() => setManual(true)} icon={false}>
            <Plus size={19} />
            إضافة موعد يدوي
          </Button>
        </div>
      </ConsoleTitle>
      <div className="console-stats">
        {[
          [counts?.pending, 'طلبات بانتظار الموافقة', CalendarDays],
          [counts?.confirmedToday, 'مواعيد مؤكدة اليوم', Check],
          [counts?.changes, 'طلبات تغيير وقت', RefreshCw],
          [counts?.newInterests, 'طلبات برامج جديدة', ClipboardList],
        ].map(([value, label, Icon], i) => {
          const C = Icon as typeof CalendarDays;
          return (
            <div key={i}>
              <span>
                {String(value ?? '—')}
                <C size={22} />
              </span>
              <small>{String(label)}</small>
            </div>
          );
        })}
      </div>

      {/* جدول مواعيد اليوم · المطلوب منكِ اليوم */}
      <section className="today-agenda-section">
        <div className="today-agenda-header">
          <div className="today-agenda-title-wrap">
            <span className="today-agenda-icon">
              <CalendarDays size={22} />
            </span>
            <div>
              <h2 className="today-agenda-title">جدول مواعيد اليوم · المطلوب منكِ اليوم</h2>
              <p className="today-agenda-subtitle">
                {dateLabel(todayStr, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>
          <div className="today-header-badges-row">
            <span className="today-count-badge">
              {todayQuery.data?.appointments.length ?? 0} موعد مسجل اليوم
            </span>
            {todayCapacity && (
              <div className="today-capacity-quick-pill">
                <span className="tcq-icon"><Gauge size={14} /></span>
                <span className="tcq-text">
                  سعة اليوم: <strong>{todayCapacity.limit} حالة</strong>
                  {todayCapacity.isCustomDate && <span className="tcq-star" title="سعة مخصصة لهذا اليوم بالذات"> ⭐</span>}
                </span>
                <span className="tcq-sep">·</span>
                <span className="tcq-rem">
                  المتبقي: <strong className={todayCapacity.remaining <= 3 ? 'text-urgent' : 'text-emerald'}>
                    {todayCapacity.remaining} مقعد
                  </strong>
                </span>
                <button
                  type="button"
                  className="tcq-edit-btn"
                  onClick={() => {
                    setCustomCapacityValue(todayCapacity.limit);
                    setCapacityModalOpen(true);
                  }}
                  title="تعديل سعة كشوفات اليوم"
                >
                  <Pencil size={12} />
                  <span>تعديل السعة</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {todayQuery.isPending ? (
          <Loading />
        ) : !todayQuery.data?.appointments.length ? (
          <div className="today-empty-state">
            <Sparkles size={24} color="#3c7348" />
            <strong>لا توجد مواعيد متبقية لليوم حتى الآن</strong>
            <small>جدولكِ هادئ ومريح اليوم، تظهر الحجوزات المؤكدة هنا فور تسجيلها.</small>
          </div>
        ) : (
          <div className="today-cards-grid">
            {todayQuery.data.appointments.map((a) => (
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
                      `أهلاً بحضرتك ${a.name}، معك مركز المستقبل للتغذية بخصوص موعد ${a.serviceTitle} اليوم الساعة ${timeLabel(a.time)}.`
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

      <div className={'booking-console-grid ' + (current ? 'has-detail' : '')}>
        <section className="console-panel">
          {/* Modern Segmented Status Tabs */}
          <div className="admin-tabs-segmented" role="tablist" aria-label="تصفية حالة الحجز">
            {[
              { key: '', label: 'كل المواعيد', icon: CalendarDays, count: appointmentsQuery.data?.total },
              {
                key: 'today',
                label: 'مواعيد اليوم',
                icon: Sparkles,
                count: counts?.todayTotal ?? counts?.confirmedToday ?? todayQuery.data?.total,
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

      <Modal
        open={capacityModalOpen}
        onClose={() => setCapacityModalOpen(false)}
        title="تعديل سعة كشوفات اليوم"
      >
        <div className="quick-capacity-modal-body">
          <p className="qcm-desc">
            حددي الحد الأقصى للكشوفات المسموح باستقبالها اليوم ({dateLabel(todayStr)}) فقط دون التأثير على باقي الأيام.
          </p>

          <div className="qcm-pills-row">
            {[10, 15, 20, 25, 30, 35, 40].map((num) => (
              <button
                key={num}
                type="button"
                className={`qcm-pill ${customCapacityValue === num ? 'is-active' : ''}`}
                onClick={() => setCustomCapacityValue(num)}
              >
                {num} حالة
                {num === clinicDefaultLimit && <span className="qcm-def-label"> (العام)</span>}
              </button>
            ))}
          </div>

          <div className="qcm-custom-input-row">
            <label htmlFor="qcm-input">أو حددي رقماً مخصصاً:</label>
            <div className="qcm-input-stepper">
              <button
                type="button"
                className="qcm-step-btn"
                onClick={() => setCustomCapacityValue((prev) => Math.max(1, prev - 1))}
              >
                -
              </button>
              <input
                id="qcm-input"
                type="number"
                min={1}
                max={100}
                value={customCapacityValue}
                onChange={(e) =>
                  setCustomCapacityValue(Math.max(1, Math.min(100, Number(e.target.value) || 1)))
                }
                className="qcm-number-input"
                dir="ltr"
              />
              <button
                type="button"
                className="qcm-step-btn"
                onClick={() => setCustomCapacityValue((prev) => Math.min(100, prev + 1))}
              >
                +
              </button>
            </div>
          </div>

          <div className="qcm-actions-row">
            <Button
              kind="primary"
              disabled={capacitySaving}
              onClick={() => handleSaveTodayCapacity(customCapacityValue)}
            >
              {capacitySaving ? 'جاري الحفظ...' : `اعتماد سعة اليوم (${customCapacityValue} حالة)`}
            </Button>
            {todayCapacity?.isCustomDate && (
              <Button
                kind="outline"
                disabled={capacitySaving}
                onClick={handleResetTodayCapacity}
              >
                العودة للحد العام ({clinicDefaultLimit} حالة)
              </Button>
            )}
          </div>
        </div>
      </Modal>
    </>
  );
}
