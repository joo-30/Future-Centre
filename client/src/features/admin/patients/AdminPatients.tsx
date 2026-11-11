import type { InterestPublic, Subscription } from '@future/shared';
import { rankByRelevance } from '@future/shared';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Activity,
  Bell,
  Calculator,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  Copy,
  Droplets,
  Flame,
  FolderHeart,
  Gauge,
  KeyRound,
  Leaf,
  Pencil,
  Phone,
  Plus,
  Printer,
  Ruler,
  Scale,
  Search,
  ShieldCheck,
  Trash2,
  UserPlus,
  Users,
  Utensils,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { StatusBadge } from '../../../components/StatusBadge';
import { WhatsAppIcon } from '../../../components/icons/WhatsAppIcon';
import { Button, ErrorState, Loading, Modal } from '../../../components/ui';
import {
  addDays,
  today,
  dateLabel,
  formatPrice,
  fullDateLabel,
  relativeDateLabel,
  shortDateLabel,
  whatsappUrl,
} from '../../../lib/api';
import { adminApi } from '../../../lib/portal-api';
import { ConsoleTitle } from '../components/ConsoleTitle';
import { Notice } from '../components/Notice';
import { refreshAdmin } from '../lib/cache';
import { DietPrescriptionModal, type PrescriptionData } from '../prescription/DietPrescriptionModal';
import { InBodyEditor } from './InBodyEditor';
import { PatientHistoryDrawer } from './PatientHistoryDrawer';
import { SubscriptionEditor } from './SubscriptionEditor';
import { RenewalRadarSection, type SubFilterType } from './RenewalRadarSection';

const INTEREST_STATUS_MAP: Record<
  string,
  { label: string; dotColor: string; bg: string; text: string; border: string; desc: string }
> = {
  new: {
    label: 'طلب جديد',
    dotColor: '#f59e0b',
    bg: '#fef3c7',
    text: '#92400e',
    border: '#fde68a',
    desc: 'طلب جديد بانتظار التواصل مع العميل',
  },
  contacted: {
    label: 'تم التواصل',
    dotColor: '#0284c7',
    bg: '#e0f2fe',
    text: '#0369a1',
    border: '#bae6fd',
    desc: 'تم الاتصال بالعميل هاتفياً أو عبر واتساب',
  },
  converted: {
    label: 'تمت المتابعة',
    dotColor: '#16a34a',
    bg: '#dcfce7',
    text: '#15803d',
    border: '#bbf7d0',
    desc: 'مشترك فعلي أو تم حجز برنامج له بالعيادة',
  },
  closed: {
    label: 'مغلق',
    dotColor: '#64748b',
    bg: '#f1f5f9',
    text: '#475569',
    border: '#e2e8f0',
    desc: 'تم إغلاق الطلب / اعتذر العميل',
  },
};

function InterestStatusDropdown({
  status,
  disabled,
  onChange,
}: {
  status: string;
  disabled?: boolean;
  onChange: (newStatus: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener('mousedown', handleClick);
    }
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const current = INTEREST_STATUS_MAP[status] || INTEREST_STATUS_MAP.new;

  return (
    <div className="interest-status-dropdown-wrap" ref={ref}>
      <button
        type="button"
        className="interest-status-trigger"
        disabled={disabled}
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-label="تغيير حالة طلب البرنامج"
        style={{
          backgroundColor: current.bg,
          color: current.text,
          borderColor: current.border,
        }}
      >
        <span className="status-dot-pulse" style={{ backgroundColor: current.dotColor }} />
        <span className="status-trigger-text">{current.label}</span>
        <ChevronDown size={14} className={`status-chevron ${open ? 'is-rotated' : ''}`} />
      </button>

      {open && (
        <div className="interest-status-menu" role="menu">
          <div className="status-menu-header">تحديث حالة المتابعة</div>
          {Object.entries(INTEREST_STATUS_MAP).map(([key, item]) => {
            const isSelected = key === status;
            return (
              <button
                type="button"
                key={key}
                role="menuitem"
                className={`status-menu-item ${isSelected ? 'is-active' : ''}`}
                onClick={() => {
                  setOpen(false);
                  onChange(key);
                }}
              >
                <span className="status-dot-fixed" style={{ backgroundColor: item.dotColor }} />
                <div className="status-item-texts">
                  <span className="status-item-title">{item.label}</span>
                  <small className="status-item-desc">{item.desc}</small>
                </div>
                {isSelected && <Check size={14} className="status-item-check" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function AdminPatients() {
  const navigate = useNavigate();
  const client = useQueryClient();
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState(searchParams.get('tab') || 'requests');
  const [subFilter, setSubFilter] = useState<SubFilterType>(
    searchParams.get('radar') === 'expiring' ? 'expiring' : 'all'
  );

  useEffect(() => {
    if (searchParams.get('radar') === 'expiring') {
      setTab('subscriptions');
      setSubFilter('expiring');
    }
  }, [searchParams]);

  const handleQuickRenew = (s: Subscription) => {
    const currentEnd = s.endDate || today();
    const nextStart = currentEnd > today() ? currentEnd : today();
    setEditing({
      userId: s.userId || null,
      name: s.name,
      phone: s.phone,
      programId: s.programId,
      price: s.price,
      sessionsTotal: s.sessionsTotal || 4,
      sessionsUsed: 0,
      startDate: nextStart,
      endDate: addDays(nextStart, 30),
      status: 'active',
      notes: `تجديد اشتراك سابق (#${s.reference})`,
    });
  };

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      setTab(tabParam);
    }
  }, [searchParams]);
  const [editing, setEditing] = useState<Partial<Subscription> | null>(null);
  const [inbodyModal, setInbodyModal] = useState(false);
  const [inbodyPatient, setInbodyPatient] = useState<{
    userId?: string;
    name?: string;
    phone?: string;
  } | null>(null);
  const [prescriptionModal, setPrescriptionModal] = useState(false);
  const [prescriptionData, setPrescriptionData] = useState<Partial<PrescriptionData> | undefined>(undefined);
  const [historyPatient, setHistoryPatient] = useState<{ identifier: string; name?: string } | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState('');
  const [resetTarget, setResetTarget] = useState<{ id: string; name: string; phone: string } | null>(null);
  const [tempPassResult, setTempPassResult] = useState<{ temporaryPassword: string; patientName: string; phone: string } | null>(null);
  const [customPassword, setCustomPassword] = useState('');
  const [resetBusy, setResetBusy] = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);

  // New Patient Registration State
  const [createPatientModal, setCreatePatientModal] = useState(false);
  const [newPatientName, setNewPatientName] = useState('');
  const [newPatientPhone, setNewPatientPhone] = useState('');
  const [newPatientCustomPassword, setNewPatientCustomPassword] = useState('');
  const [useCustomPassword, setUseCustomPassword] = useState(false);
  const [createPatientBusy, setCreatePatientBusy] = useState(false);
  const [createPatientError, setCreatePatientError] = useState('');
  const [createPatientSuccess, setCreatePatientSuccess] = useState<{
    user: any;
    initialPassword: string;
  } | null>(null);
  const [copiedCreds, setCopiedCreds] = useState(false);

  const resetCreatePatientModal = () => {
    setNewPatientName('');
    setNewPatientPhone('');
    setNewPatientCustomPassword('');
    setUseCustomPassword(false);
    setCreatePatientBusy(false);
    setCreatePatientError('');
    setCreatePatientSuccess(null);
    setCopiedCreds(false);
  };

  const handleCreatePatientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatePatientError('');
    if (!newPatientName.trim() || newPatientName.trim().length < 2) {
      setCreatePatientError('يرجى إدخال اسم المريض بشكل صحيح (حرفين على الأقل).');
      return;
    }
    if (!newPatientPhone.trim() || newPatientPhone.trim().replace(/\D/g, '').length < 8) {
      setCreatePatientError('يرجى إدخال رقم هاتف صحيح للمريض.');
      return;
    }
    setCreatePatientBusy(true);
    try {
      const res = await adminApi.createPatient({
        name: newPatientName.trim(),
        phone: newPatientPhone.trim(),
        password: useCustomPassword && newPatientCustomPassword.trim() ? newPatientCustomPassword.trim() : undefined,
      });
      setCreatePatientSuccess(res);
      await client.invalidateQueries({ queryKey: ['admin', 'patients'] });
      await client.invalidateQueries({ queryKey: ['admin', 'appointments'] });
    } catch (err) {
      setCreatePatientError((err as Error).message || 'تعذر إنشاء حساب المريض.');
    } finally {
      setCreatePatientBusy(false);
    }
  };
  const interests = useQuery({
    queryKey: ['admin', 'interests'],
    queryFn: adminApi.interests,
    staleTime: 60000,
  });
  const subscriptions = useQuery({
    queryKey: ['admin', 'subscriptions'],
    queryFn: adminApi.subscriptions,
    staleTime: 60000,
  });
  const patients = useQuery({
    queryKey: ['admin', 'patients'],
    queryFn: () => adminApi.patients(),
    staleTime: 60000,
  });
  const [patientSearch, setPatientSearch] = useState('');

  const filteredPatientsList = useMemo(() => {
    const list = patients.data?.patients || [];
    if (!patientSearch || !patientSearch.trim()) return list;
    return rankByRelevance(
      list,
      patientSearch,
      (p) => p.name,
      (p) => p.phone,
      undefined,
      (p) => p.fileNumber,
    );
  }, [patients.data?.patients, patientSearch]);
  const inbodyQuery = useQuery({
    queryKey: ['admin', 'inbody'],
    queryFn: () => adminApi.inbodyList(),
    staleTime: 60000,
  });
  const prescriptionsQuery = useQuery({
    queryKey: ['admin', 'prescriptions'],
    queryFn: () => adminApi.prescriptionsList(),
    staleTime: 60000,
  });

  const [inbodySearch, setInbodySearch] = useState('');
  const [prescriptionSearch, setPrescriptionSearch] = useState('');

  const filteredInbodyList = useMemo(() => {
    const list = inbodyQuery.data?.records || [];
    if (!inbodySearch || !inbodySearch.trim()) return list;
    const q = inbodySearch.trim().toLowerCase();
    const cleanPhoneQuery = q.replace(/\D/g, '');
    return list.filter((r) => {
      const name = (r.patientName || '').toLowerCase();
      const phone = (r.patientPhone || '').replace(/\D/g, '');
      const notes = (r.doctorNotes || '').toLowerCase();
      const date = (r.date || '').toLowerCase();
      const weight = String(r.weight || '');
      return (
        name.includes(q) ||
        (cleanPhoneQuery && phone.includes(cleanPhoneQuery)) ||
        notes.includes(q) ||
        date.includes(q) ||
        weight.includes(q)
      );
    });
  }, [inbodyQuery.data?.records, inbodySearch]);

  const filteredPrescriptionsList = useMemo(() => {
    const list = prescriptionsQuery.data?.prescriptions || [];
    if (!prescriptionSearch || !prescriptionSearch.trim()) return list;
    const q = prescriptionSearch.trim().toLowerCase();
    const cleanPhoneQuery = q.replace(/\D/g, '');
    return list.filter((rx) => {
      const name = (rx.patientName || '').toLowerCase();
      const phone = (rx.patientPhone || '').replace(/\D/g, '');
      const goal = (rx.goal || '').toLowerCase();
      const instructions = (rx.instructions || '').toLowerCase();
      const date = (rx.date || '').toLowerCase();
      const breakfast = (rx.breakfast || '').toLowerCase();
      const lunch = (rx.lunch || '').toLowerCase();
      const dinner = (rx.dinner || '').toLowerCase();
      return (
        name.includes(q) ||
        (cleanPhoneQuery && phone.includes(cleanPhoneQuery)) ||
        goal.includes(q) ||
        instructions.includes(q) ||
        date.includes(q) ||
        breakfast.includes(q) ||
        lunch.includes(q) ||
        dinner.includes(q)
      );
    });
  }, [prescriptionsQuery.data?.prescriptions, prescriptionSearch]);
  async function removePrescription(id: string) {
    if (!window.confirm('هل أنتِ متأكدة من حذف هذه الروشتة من حساب المريض؟')) return;
    setError('');
    try {
      await adminApi.deletePrescription(id);
      refreshAdmin(client);
      setMessage('تم حذف الروشتة من حساب المريض بنجاح.');
    } catch (e) {
      setError((e as Error).message);
    }
  }
  async function removeInbody(id: string) {
    if (!window.confirm('هل أنتِ متأكدة من حذف هذا الفحص؟')) return;
    setError('');
    try {
      await adminApi.deleteInbody(id);
      refreshAdmin(client);
      setMessage('تم حذف فحص الـ InBody.');
    } catch (e) {
      setError((e as Error).message);
    }
  }
  async function updateInterest(r: InterestPublic, status: string) {
    setError('');
    setBusyId(r.id);
    try {
      await adminApi.interest(r.id, status);
      refreshAdmin(client);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusyId('');
    }
  }

  const allInterests = interests.data?.interests || [];
  const newRequests = allInterests.filter((i) => i.status === 'new');
  const newRequestsCount = newRequests.length;
  const latestNewRequest = newRequests[0];

  return (
    <>
      <ConsoleTitle
        title="العملاء والاشتراكات"
        description="طلبات البرامج وحسابات العملاء وتفاصيل المتابعة في مكان واحد."
      >
        <div className="console-title-actions">
          <Link
            to="/admin/bmi"
            className="btn light"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              textDecoration: 'none',
              padding: '8px 14px',
              borderRadius: '8px',
              fontWeight: 700,
            }}
          >
            <Calculator size={16} />
            <span>حاسبة الـ BMI والسعرات</span>
          </Link>
          <Button
            kind="outline"
            icon={false}
            onClick={() => {
              setPrescriptionData(undefined);
              setPrescriptionModal(true);
            }}
          >
            <Printer size={17} />
            <span>روشتة وبرنامج غذائي</span>
          </Button>
          {tab === 'inbody' ? (
            <Button
              icon={false}
              onClick={() => {
                setInbodyPatient(null);
                setInbodyModal(true);
              }}
            >
              <Plus size={19} />
              <span>تسجيل فحص InBody جديد</span>
            </Button>
          ) : tab === 'prescriptions' ? (
            <Button
              icon={false}
              onClick={() => {
                setPrescriptionData(undefined);
                setPrescriptionModal(true);
              }}
            >
              <Plus size={19} />
              <span>كتابة روشتة جديدة</span>
            </Button>
          ) : tab === 'patients' ? (
            <Button
              icon={false}
              onClick={() => {
                resetCreatePatientModal();
                setCreatePatientModal(true);
              }}
              style={{ background: '#183d33', color: '#fff' }}
            >
              <UserPlus size={18} />
              <span>فتح ملف مريض جديد</span>
            </Button>
          ) : (
            <Button icon={false} onClick={() => setEditing({})}>
              <Plus size={19} />
              <span>إضافة اشتراك</span>
            </Button>
          )}
        </div>
      </ConsoleTitle>
      {/* Urgent Notification Banner for New Leads */}
      {newRequestsCount > 0 && latestNewRequest && (
        <div className="new-lead-alert-banner">
          <div className="nlab-body">
            <div className="nlab-icon-circle">
              <Bell size={20} className="nlab-bell-icon" />
              <span className="nlab-pulse-ring" />
            </div>
            <div className="nlab-info">
              <div className="nlab-header-row">
                <span className="nlab-badge">
                  🔔 {newRequestsCount === 1 ? 'طلب اشتراك جديد بانتظار التواصل' : `${newRequestsCount} طلبات اشتراك جديدة`}
                </span>
                {latestNewRequest.createdAt && (
                  <span className="nlab-time">
                    <Clock size={12} />
                    {dateLabel(latestNewRequest.createdAt, { day: 'numeric', month: 'short' })}
                  </span>
                )}
              </div>
              <h4 className="nlab-title">
                {latestNewRequest.name} — <span className="nlab-program-name">{latestNewRequest.programTitle}</span>
              </h4>
              <p className="nlab-phone-row" dir="ltr">
                <Phone size={13} />
                <span>{latestNewRequest.phone}</span>
              </p>
            </div>
          </div>
          <div className="nlab-actions">
            <a
              href={whatsappUrl(
                latestNewRequest.phone || '',
                `أهلاً بكِ أستاذة ${latestNewRequest.name}، معكِ مركز المستقبل للتغذية د. رنا بخصوص رغبتكِ بالاشتراك في ${latestNewRequest.programTitle}.`
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-wa-lead"
            >
              <WhatsAppIcon size={16} />
              <span>تواصل واتساب</span>
            </a>
            <a href={'tel:' + (latestNewRequest.phone || '')} className="btn btn-call-lead">
              <Phone size={14} />
              <span>اتصال هاتف</span>
            </a>
            <button
              type="button"
              className="btn light"
              onClick={() => updateInterest(latestNewRequest, 'contacted')}
              disabled={busyId === latestNewRequest.id}
              title="تحديد الطلب كـ تم التواصل"
            >
              <Check size={14} />
              <span>تم التواصل</span>
            </button>
            {tab !== 'requests' && (
              <button
                type="button"
                className="btn btn-view-requests"
                onClick={() => setTab('requests')}
              >
                عرض كل الطلبات ({newRequestsCount})
              </button>
            )}
          </div>
        </div>
      )}

      {/* Tabs with Clear Notification Badges */}
      <div className="console-tabs standalone patient-console-tabs">
        {[
          {
            id: 'requests',
            label: 'طلبات البرامج',
            icon: Bell,
            badge: newRequestsCount > 0 ? `${newRequestsCount} جديد` : null,
            isAlert: newRequestsCount > 0,
            count: allInterests.length,
          },
          {
            id: 'subscriptions',
            label: 'الاشتراكات',
            icon: Users,
            count: subscriptions.data?.subscriptions?.length,
          },
          {
            id: 'patients',
            label: 'حسابات العملاء',
            icon: FolderHeart,
            count: patients.data?.patients?.length,
          },
          {
            id: 'inbody',
            label: 'سجل InBody',
            icon: Scale,
            count: inbodyQuery.data?.records?.length,
          },
          {
            id: 'prescriptions',
            label: 'الروشتات الغذائية المرفوعة',
            icon: Utensils,
            count: prescriptionsQuery.data?.prescriptions?.length,
          },
        ].map((t) => {
          const IconComp = t.icon;
          return (
            <button
              className={`${tab === t.id ? 'active' : ''} ${t.isAlert ? 'has-alert-badge' : ''}`}
              key={t.id}
              onClick={() => setTab(t.id)}
            >
              <IconComp size={15} className="tab-pill-icon" />
              <span className="tab-label-text">{t.label}</span>
              {t.badge ? (
                <span className="tab-alert-pill-pulse">{t.badge}</span>
              ) : typeof t.count === 'number' && t.count > 0 ? (
                <span className="tab-count-pill">{t.count}</span>
              ) : null}
            </button>
          );
        })}
      </div>
      <Notice message={message} />
      <Notice message={error} error />
      {tab === 'requests' ? (
        interests.isPending ? (
          <Loading />
        ) : interests.error ? (
          <ErrorState message="تعذر تحميل طلبات البرامج." onRetry={() => void interests.refetch()} />
        ) : (
          <div className="admin-request-list">
            {!interests.data?.interests.length && <Empty title="لا توجد طلبات برامج بعد." />}
            {interests.data?.interests.map((r) => (
              <article
                key={r.id}
                className={`request-card-pro ${r.status === 'new' ? 'is-new-lead-unread' : ''}`}
              >
                <div className="request-card-header">
                  <div className="request-patient-profile">
                    <span className="request-avatar-circle">{r.name.slice(0, 1)}</span>
                    <div>
                      <div className="request-name-row">
                        <h3 className="request-patient-name">{r.name}</h3>
                        <span className={`user-type-tag ${r.userId ? 'is-user' : 'is-guest'}`}>
                          {r.userId ? 'حساب مريض' : 'طلب ضيف'}
                        </span>
                        {r.status === 'new' && (
                          <span className="unread-lead-flag">
                            <CheckCircle2 size={11} />
                            جديد
                          </span>
                        )}
                      </div>
                      <div className="request-patient-subtags">
                        <span className="ref-tag-pill" dir="ltr">#{r.reference}</span>
                        {r.createdAt && (
                          <span className="request-date-tag">
                            <Clock size={11} />
                            <span>{dateLabel(r.createdAt, { day: 'numeric', month: 'short' })}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <StatusBadge status={r.status} />
                </div>

                <div className="request-card-body">
                  <div className="request-program-box">
                    <Leaf size={15} className="request-program-icon" />
                    <span className="request-program-title">{r.programTitle}</span>
                  </div>

                  <div className="request-details-grid">
                    <div className="request-detail-block">
                      <span className="detail-label">رقم التواصل</span>
                      <a href={'tel:' + r.phone} className="detail-phone-link" dir="ltr">
                        <Phone size={13} />
                        <span>{r.phone}</span>
                      </a>
                    </div>

                    <div className="request-detail-block">
                      <span className="detail-label">قيمة البرنامج</span>
                      <span className="detail-price-value">
                        {r.priceSnapshot !== null
                          ? `${formatPrice(r.priceSnapshot)} ج.م`
                          : 'يحدد مع المركز'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="request-card-footer">
                  <a
                    className="request-whatsapp-action"
                    href={whatsappUrl(
                      r.phone || '',
                      `أهلاً بحضرتك ${r.name.split(' ')[0]}، معك مركز المستقبل للتغذية بخصوص طلب برنامج ${r.programTitle} (رقم ${r.reference}).`
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="مراسلة العميل عبر واتساب"
                  >
                    <WhatsAppIcon size={16} color="#ffffff" />
                    <span>واتساب</span>
                  </a>

                  <InterestStatusDropdown
                    status={r.status}
                    disabled={busyId === r.id}
                    onChange={(newStatus) => void updateInterest(r, newStatus)}
                  />

                  <button
                    type="button"
                    className="btn light request-register-btn"
                    onClick={() =>
                      setEditing({
                        name: r.name,
                        phone: r.phone,
                        userId: r.userId,
                        programId: r.programId,
                        price: r.priceSnapshot,
                      })
                    }
                  >
                    <Plus size={15} />
                    <span>تسجيل اشتراك</span>
                  </button>
                </div>
              </article>
            ))}
          </div>
        )
      ) : tab === 'subscriptions' ? (
        subscriptions.isPending ? (
          <Loading />
        ) : subscriptions.error ? (
          <ErrorState message="تعذر تحميل الاشتراكات." onRetry={() => void subscriptions.refetch()} />
        ) : (
          <RenewalRadarSection
            subscriptions={subscriptions.data?.subscriptions || []}
            onQuickRenew={handleQuickRenew}
            onEdit={setEditing}
            onHistory={setHistoryPatient}
            onDelete={async (s) => {
              if (window.confirm(`هل أنتِ متأكدة من حذف اشتراك "${s.name}" نهائياً؟`)) {
                try {
                  await adminApi.deleteSubscription(s.id);
                  setMessage('تم حذف الاشتراك بنجاح.');
                  refreshAdmin(client);
                } catch (err) {
                  alert((err as Error).message || 'تعذر حذف الاشتراك.');
                }
              }
            }}
            subFilter={subFilter}
            setSubFilter={setSubFilter}
          />
        )
      ) : tab === 'patients' ? (
        patients.isPending ? (
          <Loading />
        ) : patients.error ? (
          <ErrorState message="تعذر تحميل حسابات العملاء." onRetry={() => void patients.refetch()} />
        ) : (
          <div className="admin-patients-section">
            {/* محرك بحث حسابات المرضى المتطور بنمط كبسولة عائم */}
            <div className="section-search-bar-pro">
              <div className="search-input-pill-wrap">
                <Search size={16} className="search-pill-icon" />
                <input
                  type="text"
                  value={patientSearch}
                  onChange={(e) => setPatientSearch(e.target.value)}
                  placeholder="البحث في حسابات المرضى: اسم المريض، الهاتف، أو رقم الملف..."
                  className="search-pill-input"
                  aria-label="البحث في حسابات المرضى"
                />
                {patientSearch && (
                  <button
                    type="button"
                    className="search-pill-clear"
                    onClick={() => setPatientSearch('')}
                    title="مسح البحث"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
              <div className="search-meta-row">
                <span className="search-counter-badge">
                  <Users size={13} />
                  <span>
                    {patientSearch
                      ? `نتائج البحث: ${filteredPatientsList.length} من أصل ${patients.data?.patients?.length || 0} مريض`
                      : `إجمالي المرضى المسجلين: ${patients.data?.patients?.length || 0} مريض`}
                  </span>
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  {patients.data?.patients && patients.data.patients.length > 0 && (
                    <span className="search-latest-badge">
                      أحدث ملف مسجل: ملف #{patients.data.patients[patients.data.patients.length - 1]?.fileNumber || patients.data.patients.length} ({patients.data.patients[patients.data.patients.length - 1]?.name})
                    </span>
                  )}
                  <Button
                    type="button"
                    kind="primary"
                    icon={false}
                    onClick={() => {
                      resetCreatePatientModal();
                      setCreatePatientModal(true);
                    }}
                    style={{ background: '#183d33', color: '#fff', padding: '6px 14px', borderRadius: '10px', fontSize: '13px' }}
                  >
                    <UserPlus size={15} />
                    <span>+ فتح ملف مريض جديد</span>
                  </Button>
                </div>
              </div>
            </div>

            <div className="console-panel patients-table-panel">
              <div className="patients-list">
              {!filteredPatientsList.length && (
                <Empty
                  title={
                    patientSearch
                      ? `لا يوجد مريض مطابق لـ "${patientSearch}"`
                      : 'لا توجد حسابات مرضى بعد.'
                  }
                />
              )}
              {filteredPatientsList.map((p) => (
                <div key={p.id}>
                  <span className="table-avatar">{p.name.slice(0, 1)}</span>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <strong>{p.name}</strong>
                      {p.fileNumber && (
                        <span className="patient-file-tag" title="رقم الملف الطبي الدائم">
                          ملف #{p.fileNumber}
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                      <bdi dir="ltr">{p.phone}</bdi>
                      <a
                        href={whatsappUrl(
                          p.phone,
                          `أهلاً بك أستاذ/ة ${p.name} في مركز المستقبل دكتور ناصر الشورى 🌿.`
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-quick-wa"
                        title="مراسلة سريعة عبر واتساب"
                      >
                        <WhatsAppIcon size={12} color="#16a34a" />
                        <span>واتساب</span>
                      </a>
                    </div>
                  </div>
                  <div className="patient-role-badge-pill" title="حساب مريض مسجل على المنصة">
                    <span className="role-dot-indicator" />
                    <span>حساب مريض</span>
                  </div>
                  <div className="patient-card-actions-layout">
                    <Button
                      kind="primary"
                      icon={false}
                      onClick={() => navigate(`/admin/patients/${p.id}`)}
                      className="btn-patient-full-file"
                      title="فتح الملف الطبي الشامل للمريض"
                    >
                      <FolderHeart size={16} />
                      <span>عرض الملف الطبي الكامل ↗</span>
                    </Button>
                    <div className="patient-actions-2x2-grid">
                      <Button
                        kind="light"
                        icon={false}
                        className="btn-patient-subaction"
                        onClick={() => {
                          const inb = inbodyQuery.data?.records.find(
                            (rec) => rec.userId === p.id || rec.patientPhone === p.phone
                          );
                          setPrescriptionData({
                            userId: p.id,
                            patientName: p.name,
                            patientPhone: p.phone,
                            weight: inb ? String(inb.weight) : '',
                            bodyFatPercent: inb?.bodyFatPercent !== undefined ? String(inb.bodyFatPercent) : '',
                            muscleMass: inb?.muscleMass !== undefined ? String(inb.muscleMass) : '',
                            waterPercent: inb?.waterPercent !== undefined ? String(inb.waterPercent) : '',
                          });
                          setPrescriptionModal(true);
                        }}
                      >
                        <Utensils size={14} />
                        <span>روشتة دايت</span>
                      </Button>
                      <Button
                        kind="light"
                        icon={false}
                        className="btn-patient-subaction"
                        onClick={() => {
                          setInbodyPatient({ userId: p.id, name: p.name, phone: p.phone });
                          setInbodyModal(true);
                        }}
                      >
                        <Scale size={14} />
                        <span>تسجيل InBody</span>
                      </Button>
                      <Button
                        kind="light"
                        icon={false}
                        className="btn-patient-subaction"
                        onClick={() => setEditing({ userId: p.id, name: p.name, phone: p.phone })}
                      >
                        <Plus size={14} />
                        <span>إضافة اشتراك</span>
                      </Button>
                      <Button
                        kind="light"
                        icon={false}
                        className="btn-patient-subaction"
                        onClick={() => {
                          setResetTarget(p);
                          setCustomPassword('');
                          setTempPassResult(null);
                          setCopiedPass(false);
                        }}
                      >
                        <KeyRound size={14} />
                        <span>تعديل وباسورد</span>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        )
      ) : tab === 'inbody' ? (
        <div className="inbody-records-list">
          {/* محرك بحث سجل InBody كامل العرض في الأعلى */}
          <div className="section-search-bar-pro">
            <div className="search-input-pill-wrap">
              <Search size={16} className="search-pill-icon" />
              <input
                type="text"
                value={inbodySearch}
                onChange={(e) => setInbodySearch(e.target.value)}
                placeholder="البحث في سجل InBody: اسم المريض، الهاتف، رقم الملف، أو الوزن..."
                className="search-pill-input"
                aria-label="البحث في سجل InBody"
              />
              {inbodySearch && (
                <button
                  type="button"
                  className="search-pill-clear"
                  onClick={() => setInbodySearch('')}
                  title="مسح البحث"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <div className="search-meta-row">
              <span className="search-counter-badge">
                <Scale size={13} />
                <span>
                  {inbodySearch
                    ? `نتائج البحث: ${filteredInbodyList.length} من أصل ${inbodyQuery.data?.records?.length || 0} فحص`
                    : `إجمالي الفحوصات: ${inbodyQuery.data?.records?.length || 0} فحص InBody`}
                </span>
              </span>
              {inbodyQuery.data?.records?.[0]?.date && (
                <span className="search-latest-badge">
                  آخر فحص مسجل: {shortDateLabel(inbodyQuery.data.records[0].date)} ({relativeDateLabel(inbodyQuery.data.records[0].date)})
                </span>
              )}
            </div>
          </div>

          {inbodyQuery.isPending ? (
            <Loading />
          ) : inbodyQuery.error ? (
            <ErrorState message="تعذر تحميل سجل الفحوصات والقياسات." onRetry={() => void inbodyQuery.refetch()} />
          ) : !inbodyQuery.data?.records.length ? (
            <Empty title="لا توجد فحوصات InBody مسجلة بعد." />
          ) : inbodySearch && filteredInbodyList.length === 0 ? (
            <div className="search-empty-state">
              <Scale size={42} style={{ color: '#16a34a', margin: '0 auto 12px' }} />
              <h3>لا توجد فحوصات InBody تطابق: "{inbodySearch}"</h3>
              <p>تأكدي من الاسم أو رقم الموبايل، أو اضغطي على الزر لعرض كل الفحوصات.</p>
              <Button kind="outline" onClick={() => setInbodySearch('')} style={{ marginTop: '12px' }}>
                عرض جميع فحوصات InBody
              </Button>
            </div>
          ) : (
            filteredInbodyList.map((r) => (
              <article key={r.id} className="inbody-record-card">
                <div className="inbody-record-header">
                  <div className="inbody-patient-info">
                    <span className="inbody-avatar">{r.patientName.slice(0, 1)}</span>
                    <div>
                      <h3 className="inbody-patient-name">{r.patientName}</h3>
                      <div className="inbody-patient-sub">
                        <span className="inbody-meta-item">
                          <Phone size={12} />
                          <bdi dir="ltr">{r.patientPhone}</bdi>
                        </span>
                        <span className="inbody-meta-sep">·</span>
                        <span className="inbody-meta-item">
                          <Calendar size={12} />
                          <strong>{fullDateLabel(r.date)}</strong>
                          <span className="inbody-rel-date-pill">({relativeDateLabel(r.date)})</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="inbody-card-actions">
                    <button
                      type="button"
                      className="inbody-action-btn edit"
                      onClick={() =>
                        setHistoryPatient({
                          identifier: r.userId || r.patientPhone,
                          name: r.patientName,
                        })
                      }
                      title="عرض سجل وتاريخ المريض"
                    >
                      <FolderHeart size={15} />
                      <span>الملف الطبي</span>
                    </button>
                    <button
                      type="button"
                      className="inbody-action-btn print"
                      title="طباعة روشتة لهذا الفحص"
                      onClick={() => {
                        setPrescriptionData({
                          userId: r.userId,
                          patientName: r.patientName,
                          patientPhone: r.patientPhone,
                          weight: String(r.weight),
                          bodyFatPercent: r.bodyFatPercent !== undefined ? String(r.bodyFatPercent) : '',
                          muscleMass: r.muscleMass !== undefined ? String(r.muscleMass) : '',
                          waterPercent: r.waterPercent !== undefined ? String(r.waterPercent) : '',
                          date: r.date,
                        });
                        setPrescriptionModal(true);
                      }}
                    >
                      <Printer size={15} />
                      <span>طباعة روشتة</span>
                    </button>
                    <button
                      type="button"
                      className="inbody-action-btn delete"
                      title="حذف الفحص"
                      onClick={() => void removeInbody(r.id)}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="inbody-record-grid">
                  <div className="inbody-stat-box is-primary">
                    <div className="stat-header">
                      <Scale size={14} className="stat-icon" />
                      <span className="stat-label">الوزن الكلي</span>
                    </div>
                    <div className="stat-value">
                      <strong>{r.weight}</strong>
                      <small>كجم</small>
                    </div>
                  </div>

                  {r.bodyFatPercent !== undefined && (
                    <div className="inbody-stat-box">
                      <div className="stat-header">
                        <Flame size={14} className="stat-icon" />
                        <span className="stat-label">نسبة الدهون</span>
                      </div>
                      <div className="stat-value">
                        <strong>{r.bodyFatPercent}</strong>
                        <small>%</small>
                      </div>
                    </div>
                  )}

                  {r.muscleMass !== undefined && (
                    <div className="inbody-stat-box">
                      <div className="stat-header">
                        <Activity size={14} className="stat-icon" />
                        <span className="stat-label">الكتلة العضلية</span>
                      </div>
                      <div className="stat-value">
                        <strong>{r.muscleMass}</strong>
                        <small>كجم</small>
                      </div>
                    </div>
                  )}

                  {r.waterPercent !== undefined && (
                    <div className="inbody-stat-box">
                      <div className="stat-header">
                        <Droplets size={14} className="stat-icon" />
                        <span className="stat-label">نسبة الماء</span>
                      </div>
                      <div className="stat-value">
                        <strong>{r.waterPercent}</strong>
                        <small>%</small>
                      </div>
                    </div>
                  )}

                  {r.visceralFat !== undefined && (
                    <div className="inbody-stat-box">
                      <div className="stat-header">
                        <Gauge size={14} className="stat-icon" />
                        <span className="stat-label">دهون حشوية</span>
                      </div>
                      <div className="stat-value">
                        <strong>{r.visceralFat}</strong>
                        <small>مستوى</small>
                      </div>
                    </div>
                  )}

                  {r.waistCm !== undefined && (
                    <div className="inbody-stat-box">
                      <div className="stat-header">
                        <Ruler size={14} className="stat-icon" />
                        <span className="stat-label">محيط الخصر</span>
                      </div>
                      <div className="stat-value">
                        <strong>{r.waistCm}</strong>
                        <small>سم</small>
                      </div>
                    </div>
                  )}
                </div>

                {r.doctorNotes && (
                  <div className="inbody-doc-notes">
                    <div className="doc-notes-title">
                      <CheckCircle2 size={13} />
                      <span>توجيه وملاحظات الطبيب:</span>
                    </div>
                    <p>{r.doctorNotes}</p>
                  </div>
                )}
              </article>
            ))
          )}
        </div>
      ) : tab === 'prescriptions' ? (
        <div className="inbody-records-list">
          {/* كارد تعريفي يوضح أن هذه الروشتات مرفوعة لإدارتها وتعديلها أو حذفها */}
          <div className="rx-uploaded-info-card">
            <div className="rx-info-header">
              <Utensils size={17} className="rx-info-icon" />
              <strong>الروشتات والأنظمة الغذائية المرفوعة للأدمن</strong>
            </div>
            <p>
              هنا تجدين سجل الروشتات الصادرة والمعتمدة للمرضى في المركز؛ تم تصميم هذا السجل لتسهيل التعديل على أي بند في الروشتة، أو إعادة طباعتها على ورق A4، أو إرسالها للمريض عبر الواتساب، أو حذفها عند اللزوم.
            </p>
          </div>

          {/* محرك بحث الروشتات والأنظمة الغذائية */}
          <div className="section-search-bar-pro">
            <div className="search-input-pill-wrap">
              <Search size={16} className="search-pill-icon" />
              <input
                type="text"
                value={prescriptionSearch}
                onChange={(e) => setPrescriptionSearch(e.target.value)}
                placeholder="البحث في الروشتات المرفوعة: اسم المريض، الهاتف، رقم الملف، أو الهدف الغذائي..."
                className="search-pill-input"
                aria-label="البحث في الروشتات الغذائية"
              />
              {prescriptionSearch && (
                <button
                  type="button"
                  className="search-pill-clear"
                  onClick={() => setPrescriptionSearch('')}
                  title="مسح البحث"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <div className="search-meta-row">
              <span className="search-counter-badge rx-badge">
                <Utensils size={13} />
                <span>
                  {prescriptionSearch
                    ? `نتائج البحث: ${filteredPrescriptionsList.length} من أصل ${prescriptionsQuery.data?.prescriptions?.length || 0} روشتة`
                    : `إجمالي الروشتات المرفوعة: ${prescriptionsQuery.data?.prescriptions?.length || 0} روشتة`}
                </span>
              </span>
              {prescriptionsQuery.data?.prescriptions?.[0]?.date && (
                <span className="search-latest-badge rx-latest">
                  آخر روشتة صادرة: {shortDateLabel(prescriptionsQuery.data.prescriptions[0].date)} ({relativeDateLabel(prescriptionsQuery.data.prescriptions[0].date)})
                </span>
              )}
            </div>
          </div>

          {prescriptionsQuery.isPending ? (
            <Loading />
          ) : prescriptionsQuery.error ? (
            <ErrorState message="تعذر تحميل الروشتات المعتمدة." onRetry={() => void prescriptionsQuery.refetch()} />
          ) : !prescriptionsQuery.data?.prescriptions.length ? (
            <Empty title="لا توجد روشتات غذائية محفوظة بعد." />
          ) : prescriptionSearch && filteredPrescriptionsList.length === 0 ? (
            <div className="search-empty-state">
              <Utensils size={42} style={{ color: '#b45309', margin: '0 auto 12px' }} />
              <h3>لا توجد روشتات غذائية تطابق: "{prescriptionSearch}"</h3>
              <p>تأكدي من الاسم أو الهدف أو جربي مسح البحث لعرض جميع الروشتات.</p>
              <Button kind="outline" onClick={() => setPrescriptionSearch('')} style={{ marginTop: '12px' }}>
                عرض جميع الروشتات المعتمدة
              </Button>
            </div>
          ) : (
            filteredPrescriptionsList.map((rx) => (
              <article key={rx.id} className="inbody-record-card">
                <div className="inbody-record-header">
                  <div className="inbody-patient-info">
                    <span
                      className="inbody-avatar"
                      style={{ background: '#eef6ec', color: '#1f6630', fontSize: '16px' }}
                    >
                      <Utensils size={18} />
                    </span>
                    <div>
                      <h3 className="inbody-patient-name">{rx.patientName}</h3>
                      <div className="inbody-patient-sub">
                        <span className="inbody-meta-item">
                          <Calendar size={13} />
                          <strong>{fullDateLabel(rx.date)}</strong>
                          <span className="inbody-rel-date-pill">({relativeDateLabel(rx.date)})</span>
                        </span>
                        {rx.patientPhone && (
                          <>
                            <span className="inbody-meta-sep">•</span>
                            <span className="inbody-meta-item">
                              <Phone size={13} />
                              <bdi dir="ltr">{rx.patientPhone}</bdi>
                            </span>
                          </>
                        )}
                        {rx.nextDate && (
                          <>
                            <span className="inbody-meta-sep">•</span>
                            <span
                              className="inbody-meta-item"
                              style={{ color: '#275635', fontWeight: 700 }}
                            >
                              المتابعة: {fullDateLabel(rx.nextDate)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="inbody-card-actions">
                    <button
                      type="button"
                      className="inbody-action-btn edit"
                      onClick={() =>
                        setHistoryPatient({
                          identifier: rx.userId || rx.patientPhone,
                          name: rx.patientName,
                        })
                      }
                      title="عرض سجل وتاريخ المريض"
                    >
                      <FolderHeart size={15} />
                      <span>الملف الطبي</span>
                    </button>
                    <button
                      type="button"
                      className="inbody-action-btn edit"
                      title="فتح وتعديل الروشتة"
                      onClick={() => {
                        setPrescriptionData(rx);
                        setPrescriptionModal(true);
                      }}
                    >
                      <Pencil size={15} />
                      <span>تعديل</span>
                    </button>
                    <button
                      type="button"
                      className="inbody-action-btn print"
                      title="طباعة الروشتة A4"
                      onClick={() => {
                        setPrescriptionData(rx);
                        setPrescriptionModal(true);
                      }}
                    >
                      <Printer size={15} />
                      <span>طباعة A4</span>
                    </button>

                    {rx.patientPhone && (
                      <a
                        href={whatsappUrl(
                          rx.patientPhone,
                          `🌸 أهلاً بحضرتك ${rx.patientName}، مرفق لحضرتك ملخص برنامج التغذية العلاجية من مركز المستقبل بإشراف دكتورة د. رنا ياسر الشوري.\n🎯 الهدف: ${rx.goal}.\nتمنياتنا لكِ بدوام الصحة والعافية! ✨`,
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inbody-action-btn wa-share"
                        title="إرسال نص الروشتة واتساب"
                      >
                        <WhatsAppIcon size={14} color="#16a34a" />
                        <span>واتساب</span>
                      </a>
                    )}

                    <button
                      type="button"
                      className="inbody-action-btn delete"
                      title="حذف الروشتة من حساب المريض"
                      onClick={() => void removePrescription(rx.id)}
                    >
                      <Trash2 size={15} />
                      <span>حذف</span>
                    </button>
                  </div>
                </div>

                {rx.goal && (
                  <div className="rx-goal-banner" style={{ margin: '10px 0 14px' }}>
                    <strong>🎯 الهدف العلاجي:</strong>
                    <span>{rx.goal}</span>
                  </div>
                )}

                {/* Metrics Grid */}
                <div className="inbody-record-grid">
                  {rx.weight && (
                    <div className="inbody-stat-box is-primary">
                      <div className="stat-header">
                        <Scale size={14} className="stat-icon" />
                        <span className="stat-label">الوزن الحالي</span>
                      </div>
                      <div className="stat-value">
                        <strong>{rx.weight}</strong>
                        <small>كجم</small>
                      </div>
                    </div>
                  )}

                  {rx.targetWeight && (
                    <div className="inbody-stat-box">
                      <div className="stat-header">
                        <Scale size={14} className="stat-icon" />
                        <span className="stat-label">الوزن المستهدف</span>
                      </div>
                      <div className="stat-value">
                        <strong>{rx.targetWeight}</strong>
                        <small>كجم</small>
                      </div>
                    </div>
                  )}

                  {rx.bodyFatPercent && (
                    <div className="inbody-stat-box">
                      <div className="stat-header">
                        <Flame size={14} className="stat-icon" />
                        <span className="stat-label">نسبة الدهون</span>
                      </div>
                      <div className="stat-value">
                        <strong>{rx.bodyFatPercent}</strong>
                        <small>%</small>
                      </div>
                    </div>
                  )}

                  {rx.muscleMass && (
                    <div className="inbody-stat-box">
                      <div className="stat-header">
                        <Activity size={14} className="stat-icon" />
                        <span className="stat-label">الكتلة العضلية</span>
                      </div>
                      <div className="stat-value">
                        <strong>{rx.muscleMass}</strong>
                        <small>كجم</small>
                      </div>
                    </div>
                  )}

                  {rx.waterPercent && (
                    <div className="inbody-stat-box">
                      <div className="stat-header">
                        <Droplets size={14} className="stat-icon" />
                        <span className="stat-label">نسبة الماء</span>
                      </div>
                      <div className="stat-value">
                        <strong>{rx.waterPercent}</strong>
                        <small>%</small>
                      </div>
                    </div>
                  )}
                </div>

                {/* Meal preview */}
                {rx.breakfast && (
                  <div className="inbody-doc-notes" style={{ marginTop: '12px' }}>
                    <div className="doc-notes-title">
                      <Utensils size={13} />
                      <span>ملخص البرنامج الغذائي:</span>
                    </div>
                    <p style={{ fontSize: '13px', color: '#1b4427', margin: '4px 0 0', lineHeight: '1.6' }}>
                      🌅 <strong>الإفطار:</strong> {rx.breakfast}
                      {rx.lunch ? ` · 🥗 الغداء: ${rx.lunch}` : ''}
                      {rx.dinner ? ` · 🌙 العشاء: ${rx.dinner}` : ''}
                    </p>
                  </div>
                )}
              </article>
            ))
          )}
        </div>
      ) : null}
      <div className="admin-portal-footnote">
        <ShieldCheck size={14} className="footnote-icon" />
        <span>تسجيل الاشتراكات وقياسات الـ InBody توثيق للمتابعة السريرية والجلسات داخل المركز.</span>
      </div>
      <Modal
        open={inbodyModal}
        onClose={() => setInbodyModal(false)}
        title="تسجيل فحص InBody جديد"
      >
        <InBodyEditor
          defaultPatient={inbodyPatient}
          onSaved={() => {
            setInbodyModal(false);
            setMessage('تم حفظ فحص الـ InBody بنجاح.');
            refreshAdmin(client);
          }}
        />
      </Modal>
      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing?.id ? 'إدارة الاشتراك' : 'تسجيل اشتراك جديد'}
      >
        {editing && (
          <SubscriptionEditor
            subscription={editing}
            onSaved={() => {
              setEditing(null);
              setMessage('تم حفظ الاشتراك والجلسات.');
              refreshAdmin(client);
            }}
          />
        )}
      </Modal>

      <DietPrescriptionModal
        key={
          (prescriptionData?.userId || '') +
          '-' +
          (prescriptionData?.patientPhone || '') +
          '-' +
          (prescriptionData?.patientName || '') +
          '-' +
          (prescriptionData?.weight || '') +
          '-' +
          String(prescriptionModal)
        }
        open={prescriptionModal}
        onClose={() => {
          setPrescriptionModal(false);
          setPrescriptionData(undefined);
        }}
        onSaved={() => {
          void client.invalidateQueries({ queryKey: ['admin', 'prescriptions'] });
          void client.invalidateQueries({ queryKey: ['admin', 'patients'] });
          void client.invalidateQueries({ queryKey: ['admin', 'inbody'] });
          void client.invalidateQueries({ queryKey: ['account'] });
        }}
        defaultData={prescriptionData}
      />

      <Modal
        open={Boolean(resetTarget)}
        onClose={() => {
          setResetTarget(null);
          setTempPassResult(null);
        }}
        title="تعيين كلمة مرور مؤقتة للمريض"
      >
        {resetTarget && (
          <div className="pwd-modal-content">
            {/* Patient Profile Card */}
            <div className="pwd-patient-badge">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div className="pwd-patient-avatar">
                  {resetTarget.name.slice(0, 1)}
                </div>
                <div>
                  <h4 className="pwd-patient-name">{resetTarget.name}</h4>
                  <span className="pwd-patient-phone">{resetTarget.phone}</span>
                </div>
              </div>
              <span style={{ fontSize: '11px', color: '#047857', background: '#ecfdf5', padding: '3px 8px', borderRadius: '6px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Check size={11} strokeWidth={3} />
                <span>حساب مسجل</span>
              </span>
            </div>

            {tempPassResult ? (
              <div className="pwd-success-card">
                <div style={{ width: '48px', height: '48px', borderRadius: '999px', background: '#ecfdf5', border: '1.5px solid #86efac', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircle2 size={28} strokeWidth={2.5} />
                </div>
                <div>
                  <strong style={{ fontSize: '15px', color: '#064e3b', display: 'block' }}>
                    تم تعيين كلمة المرور بنجاح!
                  </strong>
                  <p style={{ fontSize: '12.5px', color: '#475569', margin: '3px 0 0' }}>
                    يمكن للمريضة <strong>{tempPassResult.patientName}</strong> تسجيل الدخول فوراً بهذا الرمز.
                  </p>
                </div>

                <div className="pwd-credential-box">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', textAlign: 'right' }}>
                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>كلمة المرور المؤقتة:</span>
                    <span className="pwd-code-display">{tempPassResult.temporaryPassword}</span>
                  </div>
                  <button
                    type="button"
                    className="btn-pwd-copy"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(tempPassResult.temporaryPassword);
                        setCopiedPass(true);
                        setTimeout(() => setCopiedPass(false), 2000);
                      } catch {
                        // ignore
                      }
                    }}
                  >
                    {copiedPass ? <Check size={14} /> : <Copy size={14} />}
                    <span>{copiedPass ? 'تم النسخ ✓' : 'نسخ'}</span>
                  </button>
                </div>

                <a
                  href={whatsappUrl(
                    tempPassResult.phone,
                    `أهلًا بكِ ${tempPassResult.patientName.split(' ')[0]} في مركز المستقبل للتغذية العلاجية د. رنا الشوري 🌸\n\nتم إعداد وتفعيل حسابكِ لمتابعة فحوصاتكِ ونظامكِ الغذائي:\n📱 رقم الهاتف: ${tempPassResult.phone}\n🔑 كلمة المرور المؤقتة: ${tempPassResult.temporaryPassword}\n\nيمكنكِ تسجيل الدخول وتغيير كلمة المرور في أي وقت عبر:\n${window.location.origin}/auth\n\nنسعد دائمًا بمتابعتكِ 🌿`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-pwd-wa-share"
                  title="إرسال بيانات الدخول للمريض عبر واتساب مباشرة"
                >
                  <WhatsAppIcon size={18} />
                  <span>إرسال بيانات الدخول عبر واتساب 📲</span>
                </a>

                <button
                  type="button"
                  className="btn-inbody-done-close"
                  style={{ width: '100%', marginTop: '4px' }}
                  onClick={() => {
                    setResetTarget(null);
                    setTempPassResult(null);
                  }}
                >
                  تم / إغلاق النافذة
                </button>
              </div>
            ) : (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setResetBusy(true);
                  try {
                    const res = await adminApi.resetPatientPassword(resetTarget.id, customPassword || undefined);
                    setTempPassResult({
                      temporaryPassword: res.temporaryPassword,
                      patientName: resetTarget.name,
                      phone: resetTarget.phone,
                    });
                    setMessage(`تم تعيين كلمة مرور مؤقتة للمريض ${resetTarget.name}`);
                  } catch (err) {
                    setError((err as Error).message);
                  } finally {
                    setResetBusy(false);
                  }
                }}
                style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <label htmlFor="custom-temp-pwd" style={{ fontSize: '12.5px', fontWeight: 800, color: '#1e293b' }}>
                      كلمة مرور مخصصة (اختياري)
                    </label>
                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
                      أو اتركيها فارغة لتوليد آلي
                    </span>
                  </div>

                  <div className="pwd-input-wrap">
                    <span className="pwd-leading-icon">
                      <KeyRound size={16} />
                    </span>
                    <input
                      id="custom-temp-pwd"
                      type="text"
                      dir="ltr"
                      className="pwd-modern-input"
                      placeholder="Future@2026 أو اتركيها فارغة"
                      value={customPassword}
                      onChange={(e) => setCustomPassword(e.target.value)}
                      minLength={6}
                      maxLength={64}
                    />
                    <button
                      type="button"
                      className="pwd-generate-quick-btn"
                      onClick={() => setCustomPassword(`Future@${new Date().getFullYear()}`)}
                      title="اقتراح كلمة مرور نموذجية"
                    >
                      اقتراح Future@2026
                    </button>
                  </div>

                  <p style={{ fontSize: '11.5px', color: '#64748b', margin: '4px 0 0', lineHeight: 1.4 }}>
                    💡 إذا تركتِ الحقل فارغاً، سيقوم النظام تلقائياً بتوليد كلمة مرور سهلة ومؤقتة ومشاركتها معكِ لنسخها فوراً.
                  </p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                  <button
                    type="button"
                    className="btn-inbody-done-close"
                    onClick={() => setResetTarget(null)}
                    disabled={resetBusy}
                  >
                    إلغاء
                  </button>
                  <Button disabled={resetBusy}>
                    {resetBusy ? 'جاري التعيين...' : 'تأكيد وحفظ كلمة المرور 🔐'}
                  </Button>
                </div>
              </form>
            )}
          </div>
        )}
      </Modal>

      {/* نافذة فتح ملف وحساب مريض جديد للاستقبال */}
      <Modal
        open={createPatientModal}
        onClose={() => setCreatePatientModal(false)}
        title={createPatientSuccess ? 'تم فتح الملف الطبي بنجاح! 🌿' : 'فتح ملف وحساب مريض جديد'}
      >
        {createPatientSuccess ? (
          <div className="new-patient-success-view" style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'center' }}>
            <div style={{ background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: '14px', padding: '18px 16px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', background: '#22c55e', color: '#fff', borderRadius: '50%', margin: '0 auto 10px' }}>
                <Check size={26} />
              </div>
              <h3 style={{ margin: '0 0 6px', color: '#166534', fontSize: '19px' }}>
                تم إنشاء حساب المريض بنجاح
              </h3>
              <p style={{ margin: 0, color: '#15803d', fontSize: '14px' }}>
                تم فتح ملف طبي تسلسلي جديد ومطابقة أي بيانات سابقة.
              </p>
              <div style={{ marginTop: '12px' }}>
                <span style={{ background: '#183d33', color: '#fff', padding: '6px 16px', borderRadius: '20px', fontWeight: 'bold', fontSize: '16px' }}>
                  ملف #{createPatientSuccess.user.fileNumber}
                </span>
              </div>
            </div>

            <div style={{ background: '#fbfdfa', border: '1px solid #dce4d1', borderRadius: '12px', padding: '14px 18px', textAlign: 'right' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed #e2e8f0' }}>
                <span style={{ color: '#64748b', fontSize: '13.5px' }}>اسم المريض:</span>
                <strong style={{ color: '#0f172a' }}>{createPatientSuccess.user.name}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed #e2e8f0' }}>
                <span style={{ color: '#64748b', fontSize: '13.5px' }}>رقم الهاتف (اسم المستخدم):</span>
                <bdi dir="ltr" style={{ fontWeight: '600', color: '#0f172a' }}>{createPatientSuccess.user.phone}</bdi>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                <span style={{ color: '#64748b', fontSize: '13.5px' }}>كلمة المرور الأولية:</span>
                <bdi dir="ltr" style={{ fontWeight: '700', color: '#166534', background: '#e2f5e8', padding: '2px 8px', borderRadius: '6px' }}>
                  {createPatientSuccess.initialPassword}
                </bdi>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <a
                href={whatsappUrl(
                  createPatientSuccess.user.phone,
                  `أهلاً بك أستاذ/ة ${createPatientSuccess.user.name} في مركز المستقبل، دكتور ناصر الشورى 🌿.\nتم فتح ملفك الطبي رقم ${createPatientSuccess.user.fileNumber} بنجاح.\n\nيمكنك الوصول وفحصك عبر الرابط:\n${window.location.origin}/auth/login\n\nبيانات الدخول:\n• رقم الهاتف: ${createPatientSuccess.user.phone}\n• كلمة المرور: ${createPatientSuccess.initialPassword}\n(يمكنك تغيير كلمة المرور بأي وقت من داخل حسابك).`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-wa-lead"
                style={{ justifyContent: 'center', padding: '12px', fontSize: '15px' }}
              >
                <WhatsAppIcon size={18} color="#ffffff" />
                <span>إرسال بيانات الدخول عبر واتساب 📲</span>
              </a>

              <div style={{ display: 'flex', gap: '8px' }}>
                <Button
                  type="button"
                  kind="light"
                  icon={false}
                  style={{ flex: 1, justifyContent: 'center' }}
                  onClick={() => {
                    const text = `أهلاً بك أستاذ/ة ${createPatientSuccess.user.name} في مركز المستقبل، دكتور ناصر الشورى.\nتم فتح ملفك الطبي رقم ${createPatientSuccess.user.fileNumber} بنجاح.\n\nيمكنك الوصول وفحصك عبر الرابط:\n${window.location.origin}/auth/login\n\nبيانات الدخول:\n• رقم الهاتف: ${createPatientSuccess.user.phone}\n• كلمة المرور: ${createPatientSuccess.initialPassword}`;
                    navigator.clipboard.writeText(text);
                    setCopiedCreds(true);
                    setTimeout(() => setCopiedCreds(false), 2500);
                  }}
                >
                  <Copy size={15} />
                  <span>{copiedCreds ? 'تم النسخ بنجاح!' : 'نسخ البيانات'}</span>
                </Button>

                <Button
                  type="button"
                  kind="primary"
                  icon={false}
                  style={{ flex: 1, justifyContent: 'center', background: '#183d33', color: '#fff' }}
                  onClick={() => {
                    setCreatePatientModal(false);
                    navigate(`/admin/patients/${createPatientSuccess.user.id}`);
                  }}
                >
                  <FolderHeart size={15} />
                  <span>الملف الطبي الكامل ↗</span>
                </Button>
              </div>

              <button
                type="button"
                className="btn light"
                style={{ marginTop: '6px' }}
                onClick={() => resetCreatePatientModal()}
              >
                + فتح ملف لمريض آخر
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleCreatePatientSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <p style={{ margin: '0 0 4px', fontSize: '13.5px', color: '#556b5c', lineHeight: 1.6 }}>
              سجّلي بيانات المريضة لفتح ملف طبي تسلسلي جديد لها فوراً ومنحها صلاحية الدخول للمنصة وحجز ومتابعة المواعيد.
            </p>

            <label className="field" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontWeight: '600', fontSize: '13.5px', color: '#1e3a29' }}>اسم المريضة بالكامل *</span>
              <input
                type="text"
                placeholder="مثال: منال السيد أو منال السيد أحمد"
                value={newPatientName}
                onChange={(e) => setNewPatientName(e.target.value)}
                required
                minLength={2}
                maxLength={100}
                style={{ padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #cfdfcc' }}
              />
            </label>

            <label className="field" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontWeight: '600', fontSize: '13.5px', color: '#1e3a29' }}>رقم الهاتف / الواتساب *</span>
              <input
                type="tel"
                dir="ltr"
                placeholder="01012345678"
                value={newPatientPhone}
                onChange={(e) => setNewPatientPhone(e.target.value)}
                required
                style={{ padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #cfdfcc' }}
              />
              <small style={{ color: '#7a8c68', fontSize: '12px' }}>
                يمكن كتابته بالصيغة المحلية (010...) أو الدولية (+20...).
              </small>
            </label>

            <div style={{ background: '#f8faf6', border: '1px solid #e2ebd8', borderRadius: '10px', padding: '10px 12px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: '#2d4d38' }}>
                <input
                  type="checkbox"
                  checked={useCustomPassword}
                  onChange={(e) => setUseCustomPassword(e.target.checked)}
                />
                <span>تحديد كلمة مرور مخصصة (افتراضياً: سيتم استخدام رقم الهاتف نفسه ككلمة مرور لسهولة تذكره)</span>
              </label>

              {useCustomPassword && (
                <div style={{ marginTop: '10px' }}>
                  <input
                    type="text"
                    dir="ltr"
                    placeholder="اكتبي كلمة مرور (6 أحرف على الأقل)"
                    value={newPatientCustomPassword}
                    onChange={(e) => setNewPatientCustomPassword(e.target.value)}
                    minLength={6}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cfdfcc' }}
                  />
                </div>
              )}
            </div>

            {createPatientError && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '10px 14px', borderRadius: '8px', fontSize: '13px' }}>
                ⚠️ {createPatientError}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
              <Button
                type="button"
                kind="light"
                icon={false}
                onClick={() => setCreatePatientModal(false)}
                disabled={createPatientBusy}
              >
                إلغاء
              </Button>
              <Button
                disabled={createPatientBusy}
                icon={false}
                style={{ background: '#183d33', color: '#fff' }}
              >
                {createPatientBusy ? 'جاري فتح الملف...' : 'فتح الملف الطبي وإنشاء الحساب'}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {historyPatient && (
        <PatientHistoryDrawer
          identifier={historyPatient.identifier}
          initialPatientName={historyPatient.name}
          onClose={() => setHistoryPatient(null)}
          onOpenInBody={(p) => {
            setInbodyPatient(p);
            setInbodyModal(true);
          }}
          onOpenPrescription={(data) => {
            setPrescriptionData(data);
            setPrescriptionModal(true);
          }}
        />
      )}
    </>
  );
}

function Empty({ title }: { title: string }) {
  return (
    <div className="portal-empty">
      <Users />
      <h2>{title}</h2>
      <p>تظهر البيانات الحقيقية هنا عند تسجيلها.</p>
    </div>
  );
}
