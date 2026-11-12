import type { PrescriptionPublic } from '@future/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Bell,
  CalendarDays,
  CheckCheck,
  FileText,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Copy,
  Link2,
  LogOut,
  MapPin,
  Menu,
  Plus,
  Printer,
  Scale,
  ShieldCheck,
  Smartphone,
  Award,
  Ticket,
  UserRound,
  Utensils,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../components/Auth';
import { PasswordField } from '../../components/forms/PasswordField';
import { WhatsAppIcon } from '../../components/icons/WhatsAppIcon';
import { StatusBadge } from '../../components/StatusBadge';
import { Button, ButtonLink, ErrorState, Loading, Modal } from '../../components/ui';
import { useCatalog } from '../../hooks/useCatalog';
import { dateLabel, timeLabel, today, whatsappUrl } from '../../lib/api';
import { accountApi, authApi } from '../../lib/portal-api';
import { getPushPermission, requestAndSubscribePush, sendTestExternalPush } from '../../lib/push-manager';
import {
  isNotificationSoundEnabled,
  playNotificationChime,
  toggleNotificationSound,
} from '../../lib/sound';
import { PwaInstallButton } from '../../components/pwa/PwaInstallButton';
import { AppointmentActions } from './components/AppointmentActions';
import { SubscriptionCard } from './components/SubscriptionCard';

const ACCOUNT_TABS = [
  {
    id: 'overview',
    label: 'نظرة عامة',
    shortLabel: 'نظرة عامة',
    desc: 'ملخص الحساب، المواعيد، وأحدث كشف',
    icon: Activity,
    badgeKey: null,
  },
  {
    id: 'prescriptions',
    label: 'الروشتات والبرامج الغذائية',
    shortLabel: 'الروشتات والدايت',
    desc: 'أنظمة الدايت وجداول الوجبات المعتمدة من د. رنا',
    icon: Utensils,
    badgeKey: 'prescriptions',
  },
  {
    id: 'appointments',
    label: 'مواعيدي القادمة',
    shortLabel: 'المواعيد القادمة',
    desc: 'كشفك القادم وتفاصيل الحضور وتعديل التوقيت',
    icon: CalendarDays,
    badgeKey: 'appointments',
  },
  {
    id: 'history',
    label: 'سجل الزيارات',
    shortLabel: 'سجل الزيارات',
    desc: 'أرشيف وتاريخ الكشوفات والاستشارات السابقة',
    icon: Clock,
    badgeKey: 'history',
  },
  {
    id: 'programs',
    label: 'برامجي وطلباتي',
    shortLabel: 'برامجي وطلباتي',
    desc: 'باقات المتابعة واشتراكات البرامج العلاجية',
    icon: Award,
    badgeKey: 'programs',
  },
  {
    id: 'inbody',
    label: 'سجل الـ InBody والقياسات',
    shortLabel: 'فحوصات InBody',
    desc: 'تطور الوزن ونسبة الدهون والعضلات بيانيًا',
    icon: Scale,
    badgeKey: 'inbody',
  },
  {
    id: 'notifications',
    label: 'الإشعارات والتنبيهات',
    shortLabel: 'الإشعارات',
    desc: 'سجل التنبيهات المباشرة بالروشتات والمواعيد والفحوصات',
    icon: Bell,
    badgeKey: 'notifications',
  },
] as const;

export function Account() {
  const { user, logout, refresh } = useAuth();
  const client = useQueryClient();
  const [params, setParams] = useSearchParams();
  const { data: catalog } = useCatalog();
  const accountQuery = useQuery({
    queryKey: ['account', user?.id],
    queryFn: accountApi.get,
    refetchInterval: 20000,
  });
  const [tab, setTab] = useState(params.get('tab') || 'overview');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navScrollRef = useRef<HTMLElement>(null);
  const [claim, setClaim] = useState(false);
  const [profile, setProfile] = useState(false);
  const [password, setPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [copiedRef, setCopiedRef] = useState<string | null>(null);
  const [notifFilter, setNotifFilter] = useState<'all' | 'unread'>('all');
  const [pushPerm, setPushPerm] = useState<NotificationPermission>(() => getPushPermission());
  const [isEnablingPush, setIsEnablingPush] = useState(false);
  const [isTestingPush, setIsTestingPush] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => isNotificationSoundEnabled());

  useEffect(() => {
    const handlePrefChange = (e: Event) => {
      const detail = (e as CustomEvent<{ enabled: boolean }>).detail;
      if (detail && typeof detail.enabled === 'boolean') {
        setSoundEnabled(detail.enabled);
      }
    };
    window.addEventListener('future_sound_pref_changed', handlePrefChange);
    return () => window.removeEventListener('future_sound_pref_changed', handlePrefChange);
  }, []);

  const handleEnablePush = async () => {
    setIsEnablingPush(true);
    try {
      const res = await requestAndSubscribePush();
      setPushPerm(res.permission);
      if (res.ok) {
        setToast({
          type: 'success',
          message: 'تم تفعيل إشعارات الهاتف بنجاح! 🔔',
          subMessage: 'ستصلكِ الآن تنبيهات النظام مباشرة على شاشة هاتفك عند صدور أي روشتة أو موعد جديد.',
        });
      } else if (res.permission === 'denied') {
        setToast({
          type: 'error',
          message: 'الإشعارات محظورة في إعدادات المتصفح',
          subMessage: 'يرجى فتح إعدادات المتصفح أو التطبيق وإلغاء حظر الإشعارات لهذا الموقع.',
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsEnablingPush(false);
    }
  };

  const handleTestPush = async () => {
    setIsTestingPush(true);
    void playNotificationChime(true);
    try {
      const res = await sendTestExternalPush();
      if (res.ok) {
        setToast({
          type: 'success',
          message: 'تم إرسال إشعار تجريبي لهاتفك بنجاح! 📲',
          subMessage: 'تفقدي ستارة الإشعارات في هاتفك الآن لرؤية التنبيه.',
        });
      } else {
        setToast({
          type: 'error',
          message: 'تعذر إرسال الإشعار التجريبي',
          subMessage: res.error || 'يرجى التأكد من اتصال الإنترنت وإعادة المحاولة.',
        });
      }
    } finally {
      setIsTestingPush(false);
    }
  };

  const markNotifReadMutation = useMutation({
    mutationFn: (id: string) => accountApi.markNotificationRead(id),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ['account'] });
      void client.invalidateQueries({ queryKey: ['account', 'notifications'] });
    },
  });

  const markAllNotifsMutation = useMutation({
    mutationFn: accountApi.markAllNotificationsRead,
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ['account'] });
      void client.invalidateQueries({ queryKey: ['account', 'notifications'] });
    },
  });

  const currentIndex = ACCOUNT_TABS.findIndex((t) => t.id === tab);
  const prevTab = currentIndex > 0 ? ACCOUNT_TABS[currentIndex - 1] : null;
  const nextTab =
    currentIndex >= 0 && currentIndex < ACCOUNT_TABS.length - 1
      ? ACCOUNT_TABS[currentIndex + 1]
      : null;

  const selectTab = (id: string) => {
    setParams(id === 'overview' ? {} : { tab: id });
    setDrawerOpen(false);
    if (window.innerWidth <= 760) {
      document.querySelector('.member-layout')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollNav = (direction: 'left' | 'right') => {
    if (!navScrollRef.current) return;
    const offset = direction === 'left' ? -150 : 150;
    navScrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
  };

  const location = useLocation();
  const [toast, setToast] = useState<{
    type: 'success' | 'warning' | 'error';
    message: string;
    subMessage?: string;
  } | null>(() => {
    const st = location.state as {
      bookingSuccess?: boolean;
      trackingToken?: string;
      reference?: string;
      serviceTitle?: string;
      date?: string;
      time?: string;
    } | null;
    if (st?.bookingSuccess) {
      const idLabel = st.reference ? `#${st.reference}` : (st.trackingToken ? `#${st.trackingToken.slice(0, 8)}` : '');
      return {
        type: 'warning',
        message: 'تم استلام طلبك — يرجى انتظار تأكيد الحجز ⏳',
        subMessage: `${idLabel ? `طلبك برقم ${idLabel} ` : 'طلبك '}${st.serviceTitle ? `(${st.serviceTitle}) ` : ''}قيد مراجعة العيادة حالياً. سيتواصل معكِ فريق المركز هاتفياً أو عبر واتساب لتأكيد الموعد النهائي قبل التوجه للعيادة.`,
      };
    }
    return null;
  });

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 8500);
    return () => clearTimeout(timer);
  }, [toast]);
  useEffect(() => {
    setTab(params.get('tab') || 'overview');
  }, [params]);

  useEffect(() => {
    const activeBtn = navScrollRef.current?.querySelector('button.active');
    if (activeBtn) {
      activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [tab]);

  useEffect(() => {
    if (!drawerOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDrawerOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [drawerOpen]);
  const reload = () => void client.invalidateQueries({ queryKey: ['account'] });
  if (accountQuery.isPending) return <Loading />;
  if (accountQuery.error || !accountQuery.data)
    return (
      <ErrorState
        message={accountQuery.error?.message || 'تعذر تحميل الحساب.'}
        onRetry={() => void accountQuery.refetch()}
      />
    );
  const appointments = accountQuery.data.appointments;
  const upcoming = appointments
    .filter((a) => ['pending', 'confirmed'].includes(a.status))
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  const historyList = appointments.filter((a) => !['pending', 'confirmed'].includes(a.status));
  const selected = tab === 'history' ? historyList : upcoming;
  const activeSubs = accountQuery.data.subscriptions.filter(
    (s) => s.status === 'active' && s.endDate >= today(),
  );
  const rxList = accountQuery.data.prescriptions || [];
  const inbodyList = accountQuery.data.inbody || [];
  const latestInBody = inbodyList[0] || null;

  const getTabCount = (badgeKey: string | null) => {
    if (!badgeKey) return null;
    switch (badgeKey) {
      case 'appointments':
        return upcoming.length;
      case 'prescriptions':
        return rxList.length;
      case 'programs':
        return activeSubs.length;
      case 'inbody':
        return inbodyList.length;
      case 'notifications':
        return accountQuery.data?.unreadNotificationsCount || null;
      case 'history':
        return historyList.length;
      default:
        return null;
    }
  };
  async function formAction(e: React.FormEvent<HTMLFormElement>, kind: string) {
    e.preventDefault();
    setBusy(true);
    setMessage('');
    const f = new FormData(e.currentTarget);
    try {
      if (kind === 'claim') {
        const value = String(f.get('token')).trim();
        await accountApi.claim(value.includes('#') ? value.split('#').pop()! : value);
        setClaim(false);
        reload();
      } else if (kind === 'profile') {
        await authApi.profile(String(f.get('name')));
        await refresh();
        setProfile(false);
      } else {
        await authApi.password({
          currentPassword: String(f.get('currentPassword')),
          password: String(f.get('password')),
        });
        setPassword(false);
        await refresh();
      }
      setMessage('تم الحفظ بنجاح.');
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const handleLogout = async () => {
    try {
      await logout(user?.role === 'admin' ? 'admin' : 'patient');
    } catch (err) {
      console.error('Patient logout error:', err);
    } finally {
      window.location.href = '/login';
    }
  };

  const printPatientPrescription = (rx: PrescriptionPublic) => {
    const logoSrc = typeof window !== 'undefined' ? `${window.location.origin}/assets/brand-mark.png` : '/assets/brand-mark.png';
    const isMobile =
      typeof window !== 'undefined' &&
      (window.innerWidth <= 768 || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent));

    const html = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="utf-8">
        <title>روشتة دايت معتمدة - ${rx.patientName}</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Alexandria:wght@400;600;700;800&family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap" rel="stylesheet">
        <style>
          @page { size: A4 portrait; margin: 8mm 12mm; }
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: 'IBM Plex Sans Arabic', 'Alexandria', system-ui, -apple-system, sans-serif;
            background: #fff;
            color: #193826;
            line-height: 1.5;
            direction: rtl;
            font-size: 13px;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .sheet {
            width: 100%;
            max-width: 820px;
            margin: 0 auto;
            border: 2px solid #23432d;
            border-radius: 12px;
            padding: 20px 24px;
          }
          .hdr {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2px solid #23432d;
            padding-bottom: 12px;
            margin-bottom: 12px;
          }
          .brand-wrap {
            display: flex;
            align-items: center;
            gap: 12px;
          }
          .print-logo {
            width: 58px;
            height: 58px;
            object-fit: contain;
            flex-shrink: 0;
            filter: drop-shadow(0 2px 4px rgba(7, 63, 51, 0.08));
          }
          .brand h2 {
            font-family: 'Alexandria', sans-serif;
            font-size: 22px;
            font-weight: 800;
            color: #143321;
            white-space: nowrap;
          }
          .brand p {
            font-size: 13px;
            font-weight: 600;
            color: #3b6845;
            margin-top: 2px;
          }
          .brand small {
            font-size: 11px;
            color: #728c6e;
          }
          .doc {
            text-align: left;
            direction: ltr;
          }
          .doc h3 {
            font-family: 'Alexandria', sans-serif;
            font-size: 18px;
            font-weight: 800;
            color: #143321;
            text-align: right;
            direction: rtl;
          }
          .doc p {
            font-size: 12px;
            font-weight: 600;
            color: #3b6845;
            margin-top: 2px;
            text-align: right;
            direction: rtl;
          }
          .doc ul {
            list-style: none;
            padding: 0;
            margin: 4px 0 0;
            text-align: right;
            direction: rtl;
          }
          .doc li {
            font-size: 10.5px;
            color: #617c5d;
            line-height: 1.4;
          }
          .patient-bar {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            background: #f4f8f1;
            border: 1px solid #dce8d3;
            padding: 8px 14px;
            border-radius: 8px;
            margin-bottom: 10px;
            font-size: 12.5px;
          }
          .patient-bar strong {
            color: #193826;
            margin-left: 4px;
          }
          .patient-bar span {
            color: #275635;
            font-weight: 700;
          }
          .goal {
            background: #eef6ec;
            border-right: 4px solid #23432d;
            border-radius: 6px;
            padding: 8px 14px;
            font-size: 13px;
            font-weight: 700;
            color: #1c4929;
            margin-bottom: 10px;
          }
          .metrics {
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: 8px;
            margin-bottom: 12px;
          }
          .metric-cell {
            background: #fafcf8;
            border: 1px solid #dce6d4;
            border-radius: 8px;
            padding: 8px 6px;
            text-align: center;
          }
          .metric-cell.highlight {
            background: #eef6ec;
            border-color: #8bb579;
          }
          .metric-cell .lbl {
            font-size: 11px;
            color: #557252;
            display: block;
            margin-bottom: 2px;
            font-weight: 600;
          }
          .metric-cell .val {
            font-size: 15px;
            font-weight: 800;
            color: #193826;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            border: 1.5px solid #23432d;
            border-radius: 8px;
            overflow: hidden;
            margin-bottom: 10px;
          }
          th {
            background: #23432d;
            color: #ffffff;
            font-size: 12.5px;
            font-weight: 700;
            padding: 7px 12px;
            text-align: right;
          }
          td {
            border-bottom: 1px solid #e1ecda;
            padding: 8px 12px;
            font-size: 12.5px;
            vertical-align: top;
            line-height: 1.5;
          }
          tr:nth-child(even) td {
            background: #fafcf8;
          }
          .meal-lbl {
            font-weight: 700;
            color: #1d4b2b;
            width: 110px;
            white-space: nowrap;
          }
          .guidelines {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            margin-bottom: 10px;
          }
          .guide-box {
            background: #f9fbf7;
            border: 1px solid #dce6d4;
            border-radius: 8px;
            padding: 8px 12px;
            font-size: 12px;
          }
          .guide-box h4 {
            font-size: 12px;
            font-weight: 700;
            color: #234e30;
            margin-bottom: 3px;
          }
          .instructions {
            background: #fffdf5;
            border: 1px solid #e8dbad;
            border-radius: 8px;
            padding: 8px 12px;
            margin-bottom: 12px;
            font-size: 12px;
            color: #193826;
          }
          .instructions h4 {
            font-size: 12px;
            font-weight: 700;
            color: #8c6812;
            margin-bottom: 3px;
          }
          .ftr {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            border-top: 1.5px dashed #c8dac2;
            padding-top: 10px;
          }
          .ftr-info strong {
            display: block;
            font-size: 12px;
            color: #193826;
          }
          .ftr-info small {
            font-size: 10px;
            color: #688263;
          }
          .ftr-sig {
            text-align: center;
          }
          .sig-name {
            font-family: 'Alexandria', sans-serif;
            font-size: 14.5px;
            font-weight: 800;
            color: #193826;
            margin: 2px 0 1px;
          }
          .ftr-sig small {
            font-size: 10px;
            color: #799473;
          }
        </style>
      </head>
      <body>
        <div class="sheet">
          <div class="hdr">
            <div class="brand">
              <div class="brand-wrap">
                <img src="${logoSrc}" alt="شعار مركز المستقبل" class="print-logo" />
                <div class="brand-text">
                  <h2>مركز المستقبل</h2>
                  <p>للتغذية العلاجية وتنسيق القوام</p>
                  <small>رعاية تبدأ بفهمك · نتائج تستمر</small>
                </div>
              </div>
            </div>
            <div class="doc">
              <h3>دكتورة د. رنا ياسر الشوري</h3>
              <p>أخصائية التغذية العلاجية وتنسيق القوام</p>
              <ul>
                <li>عضو الجمعية المصرية لدراسة السمنة (EMASO)</li>
                <li>ماجستير ودبلومة التغذية الإكلينيكية وعلاج السمنة والنحافة</li>
              </ul>
            </div>
          </div>
          <div class="patient-bar">
            <div><strong>الحالة:</strong> <span>${rx.patientName}</span></div>
            <div><strong>السن:</strong> <span>${rx.age || '—'} سنة</span></div>
            <div><strong>الطول:</strong> <span>${rx.height || '—'} سم</span></div>
            <div><strong>التاريخ:</strong> <span>${dateLabel(rx.date)}</span></div>
          </div>
          ${rx.goal ? `<div class="goal">🎯 الهدف العلاجي: ${rx.goal}</div>` : ''}
          <div class="metrics">
            <div class="metric-cell"><span class="lbl">⚖️ الوزن الحالي</span><span class="val">${rx.weight || '—'} كجم</span></div>
            <div class="metric-cell highlight"><span class="lbl">🎯 الوزن المستهدف</span><span class="val">${rx.targetWeight || '—'} كجم</span></div>
            <div class="metric-cell"><span class="lbl">🔥 نسبة الدهون</span><span class="val">${rx.bodyFatPercent ? rx.bodyFatPercent + '%' : '—'}</span></div>
            <div class="metric-cell"><span class="lbl">💪 الكتلة العضلية</span><span class="val">${rx.muscleMass ? rx.muscleMass + ' كجم' : '—'}</span></div>
            <div class="metric-cell"><span class="lbl">💧 نسبة الماء</span><span class="val">${rx.waterPercent ? rx.waterPercent + '%' : '—'}</span></div>
          </div>
          <table>
            <thead><tr><th style="width: 110px;">الوجبة</th><th>المكونات والخيارات الغذائية</th></tr></thead>
            <tbody>
              <tr><td class="meal-lbl">🌅 الإفطار</td><td>${rx.breakfast || '—'}</td></tr>
              <tr><td class="meal-lbl">🍎 سناك 1</td><td>${rx.snack1 || '—'}</td></tr>
              <tr><td class="meal-lbl">🥗 الغداء</td><td>${rx.lunch || '—'}</td></tr>
              <tr><td class="meal-lbl">🍵 سناك 2</td><td>${rx.snack2 || '—'}</td></tr>
              <tr><td class="meal-lbl">🌙 العشاء</td><td>${rx.dinner || '—'}</td></tr>
            </tbody>
          </table>
          <div class="guidelines">
            <div class="guide-box"><h4>💧 شرب الماء</h4><p>${rx.waterIntake || '3 لتر ماء موزعة على مدار اليوم.'}</p></div>
            <div class="guide-box"><h4>💊 المكملات الغذائية</h4><p>${rx.supplements || 'لا توجد مكملات محددة.'}</p></div>
          </div>
          ${rx.instructions ? `<div class="instructions"><h4>⚠️ تعليمات هامة</h4><p>${rx.instructions}</p></div>` : ''}
          <div class="ftr">
            <div class="ftr-info">
              <strong>مركز المستقبل للتغذية العلاجية وتنسيق القوام</strong>
              <small>${catalog?.clinic.address || 'كفر الزيات، شارع الجيش عند توكيل أورنج'} · هاتف: ${catalog?.clinic.phones?.[0] || '01041504201'} · واتساب: ${catalog?.clinic.whatsapp || '01041504201'}</small>
            </div>
            <div class="ftr-sig">
              <span style="font-size: 10.5px; color: #6d8667;">إشراف وتوقيع:</span>
              <div class="sig-name">دكتورة د. رنا ياسر الشوري</div>
              <small>نتمنى لكِ دوام الصحة والعافية</small>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    if (!isMobile) {
      let iframe = document.getElementById('patient-rx-print-iframe') as HTMLIFrameElement;
      if (!iframe) {
        iframe = document.createElement('iframe');
        iframe.id = 'patient-rx-print-iframe';
        iframe.style.position = 'fixed';
        iframe.style.right = '0';
        iframe.style.bottom = '0';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = '0';
        iframe.style.visibility = 'hidden';
        document.body.appendChild(iframe);
      }
      try {
        const doc = iframe.contentWindow?.document || iframe.contentDocument;
        if (doc) {
          doc.open();
          doc.write(html);
          doc.close();
          setTimeout(() => {
            iframe.contentWindow?.focus();
            iframe.contentWindow?.print();
          }, 300);
          return;
        }
      } catch (err) {
        console.warn('Iframe print error', err);
      }
    }

    // Mobile / Popup fallback
    const win = window.open('', '_blank');
    if (win) {
      win.document.open();
      win.document.write(html);
      win.document.close();
      setTimeout(() => {
        win.focus();
        win.print();
      }, 350);
      return;
    }
    window.print();
  };
  return (
    <main className="member-page">
      {toast && (
        <div className={`app-floating-toast ${toast.type}`} role="status" aria-live="polite">
          <div className="app-toast-left-wrap">
            <span className="app-toast-icon-circle">
              {toast.type === 'warning' ? <Clock size={22} /> : <CheckCircle2 size={22} />}
            </span>
            <div>
              <div className="app-toast-title">{toast.message}</div>
              {toast.subMessage && <div className="app-toast-desc">{toast.subMessage}</div>}
            </div>
          </div>
          <button
            type="button"
            className="app-toast-close-btn"
            onClick={() => setToast(null)}
            aria-label="إغلاق الإشعار"
          >
            <X size={15} />
          </button>
        </div>
      )}
      <div className="member-heading">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span className="kicker">🌿 مساحتك الصحية المتكاملة · مركز المستقبل</span>
            {user?.fileNumber && (
              <span className="kicker-file-badge" title="رقم ملفك الطبي الدائم">
                رقم الملف: #{user.fileNumber}
              </span>
            )}
          </div>
          <h1>أهلًا {user?.name.split(' ')[0]}، رعايتك مستمرة.</h1>
          <p>مواعيدك، خطتك الغذائية، وقياسات الـ InBody، محدثة مباشرة من العيادة.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <PwaInstallButton variant="account" />
          <ButtonLink to="/booking" className="btn-heading-book">
          <Plus size={18} />
          <span>احجزي موعدًا جديدًا</span>
        </ButtonLink>
        </div>
      </div>
      <div className="member-layout">
        <aside className="member-nav">
          <div className="member-person">
            <div className="avatar-wrap">
              <span className="avatar-large">{user?.name ? user.name.trim().slice(0, 1) : 'م'}</span>
              <span className="avatar-status-dot" title="الحساب متصل ونشط" />
            </div>
            <div className="member-person-details">
              <strong>{user?.name || 'مريضة المركز'}</strong>
              <div className="member-phone-pill">
                <bdi dir="ltr">{user?.phone}</bdi>
              </div>
              {user?.fileNumber && (
                <div className="member-file-pill" title="رقم ملفك الطبي الدائم">
                  <span className="file-lbl">الملف الطبي:</span>
                  <strong className="file-val" dir="ltr">#{user.fileNumber}</strong>
                </div>
              )}
            </div>
            <button
              type="button"
              className="btn-open-sidebar"
              onClick={() => setDrawerOpen(true)}
              aria-label="عرض قائمة الأقسام كاملة"
            >
              <Menu size={16} />
              <span>الأقسام (6)</span>
            </button>
            <div className="member-role-badge">
              <ShieldCheck size={13} />
              <span>ملف طبي معتمد</span>
            </div>
          </div>

          <div className="sidebar-divider" />

          <div className="member-tabs-container">
            <div className="sidebar-nav-label">أقسام العيادة</div>
            <button
              type="button"
              className="nav-arrow prev"
              onClick={() => scrollNav('right')}
              aria-label="السابق"
            >
              <ChevronRight size={17} />
            </button>
            <nav ref={navScrollRef} aria-label="حسابي">
              {ACCOUNT_TABS.map(({ id, label, shortLabel, icon: TabIcon, badgeKey }) => {
                const count = getTabCount(badgeKey);
                return (
                  <button
                    key={id}
                    type="button"
                    className={tab === id ? 'active' : ''}
                    onClick={() => selectTab(id)}
                  >
                    <span className="tab-icon-wrap">
                      <TabIcon size={17} />
                    </span>
                    <span className="tab-label desktop-only">{label}</span>
                    <span className="tab-label mobile-only">{shortLabel}</span>
                    {count !== null && count > 0 && (
                      <span className="tab-count-pill">{count}</span>
                    )}
                    <ArrowLeft size={14} className="tab-chevron" />
                  </button>
                );
              })}
            </nav>
            <button
              type="button"
              className="nav-arrow next"
              onClick={() => scrollNav('left')}
              aria-label="التالي"
            >
              <ChevronLeft size={17} />
            </button>
          </div>

          <div className="sidebar-divider" />

          <div className="member-settings">
            <div className="sidebar-nav-label">إعدادات الحساب</div>
            <button
              type="button"
              onClick={() => {
                setMessage('');
                setProfile(true);
              }}
            >
              <UserRound size={16} />
              <span>تعديل الاسم</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMessage('');
                setPassword(true);
              }}
            >
              <ShieldCheck size={16} />
              <span>كلمة المرور</span>
            </button>
            <button type="button" onClick={handleLogout} className="btn-logout">
              <LogOut size={16} />
              <span>تسجيل الخروج</span>
            </button>
          </div>

          {catalog && (
            <div className="sidebar-help-widget">
              <div className="sidebar-help-header">
                <WhatsAppIcon size={15} color="#25D366" />
                <span>مساعدة المريض</span>
              </div>
              <p>استفسار عن خطتك أو كشفك؟ تواصلي مباشرة مع العيادة.</p>
              <a
                href={whatsappUrl(catalog.clinic.whatsapp, 'أهلاً، أحتاج مساعدة بخصوص حسابي.')}
                target="_blank"
                rel="noopener noreferrer"
                className="sidebar-help-link"
              >
                <span>محادثة واتساب</span>
                <ArrowLeft size={12} />
              </a>
            </div>
          )}
        </aside>
        <div className="member-content">
          {message && !claim && !profile && !password && (
            <p className="note" role="status">
              {message}
            </p>
          )}
          {tab === 'overview' && (
            <div className="member-overview-strip">
              {(accountQuery.data.unreadNotificationsCount || 0) > 0 && (
                <div
                  className="account-notif-overview-banner"
                  onClick={() => selectTab('notifications')}
                  role="button"
                  tabIndex={0}
                >
                  <div className="notif-banner-lead">
                    <span className="notif-banner-badge">
                      <Bell size={18} />
                    </span>
                    <div className="notif-banner-text">
                      <strong>لديكِ {accountQuery.data.unreadNotificationsCount} إشعار جديد بحاجة للمتابعة</strong>
                      <p>
                        {accountQuery.data.notifications?.find((n) => !n.read)?.title || 'تنبيه جديد بشأن خطتكِ الغذائية أو موعدك'}
                      </p>
                    </div>
                  </div>
                  <span className="notif-banner-cta">
                    <span>عرض التنبيهات</span>
                    <ArrowLeft size={16} />
                  </span>
                </div>
              )}
              <div className="kpi-cards-grid">
                <div
                  className="kpi-card"
                  onClick={() => selectTab('appointments')}
                  role="button"
                  tabIndex={0}
                >
                  <div className="kpi-card-top">
                    <span className="kpi-icon-wrap cal">
                      <CalendarDays size={18} />
                    </span>
                    <span className="kpi-badge">مواعيدك</span>
                  </div>
                  <div className="kpi-number">{upcoming.length}</div>
                  <div className="kpi-title">مواعيد قادمة</div>
                  <div className="kpi-meta">
                    {upcoming[0] ? `أقرب كشف: ${dateLabel(upcoming[0].date)}` : 'لا توجد مواعيد قادمة'}
                  </div>
                </div>

                <div
                  className="kpi-card"
                  onClick={() => selectTab('prescriptions')}
                  role="button"
                  tabIndex={0}
                >
                  <div className="kpi-card-top">
                    <span className="kpi-icon-wrap rx">
                      <Utensils size={18} />
                    </span>
                    <span className="kpi-badge">الدايت</span>
                  </div>
                  <div className="kpi-number">{rxList.length}</div>
                  <div className="kpi-title">روشتات معتمدة</div>
                  <div className="kpi-meta">
                    {rxList[0]
                      ? `أحدث خطة: ${dateLabel(rxList[0].date)}`
                      : 'بانتظار اعتماد خطتك'}
                  </div>
                </div>

                <div
                  className="kpi-card"
                  onClick={() => selectTab('inbody')}
                  role="button"
                  tabIndex={0}
                >
                  <div className="kpi-card-top">
                    <span className="kpi-icon-wrap inbody">
                      <Scale size={18} />
                    </span>
                    <span className="kpi-badge">InBody</span>
                  </div>
                  <div className="kpi-number">
                    {latestInBody?.weight ? `${latestInBody.weight}` : '—'}
                    {latestInBody?.weight && <small> كجم</small>}
                  </div>
                  <div className="kpi-title">آخر وزن مسجل</div>
                  <div className="kpi-meta">
                    {latestInBody?.date
                      ? `بتاريخ: ${dateLabel(latestInBody.date)}`
                      : 'سجل فحوصاتك الدورية'}
                  </div>
                </div>

                <div
                  className="kpi-card"
                  onClick={() => selectTab('programs')}
                  role="button"
                  tabIndex={0}
                >
                  <div className="kpi-card-top">
                    <span className="kpi-icon-wrap prog">
                      <Award size={18} />
                    </span>
                    <span className="kpi-badge">المتابعة</span>
                  </div>
                  <div className="kpi-number">{activeSubs.length}</div>
                  <div className="kpi-title">باقات نشطة</div>
                  <div className="kpi-meta">
                    {activeSubs.length > 0 ? 'متابعة مستمرة' : 'استكشفي باقات الرعاية'}
                  </div>
                </div>
              </div>

              <div className="member-quick-actions">
                <ButtonLink to="/booking" className="btn-action-primary">
                  <Plus size={18} />
                  <span>حجز موعد كشف جديد بالعيادة</span>
                </ButtonLink>
                <button
                  type="button"
                  className="btn-action-claim"
                  onClick={() => {
                    setMessage('');
                    setClaim(true);
                  }}
                >
                  <Link2 size={17} />
                  <span>ربط حجز سابق برابط المتابعة</span>
                </button>
              </div>
            </div>
          )}
          {(tab === 'appointments' || tab === 'history' || (tab === 'overview' && upcoming.length > 0)) && (
            <section>
              <div className="section-heading" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <h2>{tab === 'history' ? 'سجل زياراتك' : 'مواعيدك القادمة'}</h2>
                  <span>{selected.length} موعد</span>
                </div>
                <ButtonLink to="/booking" kind="outline" style={{ fontSize: '13.5px', padding: '6px 14px', gap: '6px' }}>
                  <Plus size={16} />
                  حجز موعد جديد
                </ButtonLink>
              </div>
              {selected.length === 0 ? (
                <div className="portal-empty">
                  <CalendarDays />
                  <h3>{tab === 'history' ? 'سجلّك يبدأ بأول زيارة.' : 'لا توجد مواعيد قادمة.'}</h3>
                  <p>يمكنك طلب موعد جديد أو إضافة حجز ضيف برابط المتابعة الخاص به.</p>
                  <ButtonLink to="/booking" kind="outline">
                    اختاري موعدًا
                  </ButtonLink>
                </div>
              ) : (
                selected.map((a) => (
                  <article
                    className={`member-appointment ${a.status === 'pending' ? 'is-pending' : ''}`}
                    key={a.reference}
                  >
                    <div className="appointment-date">
                      <b>{dateLabel(a.date, { day: 'numeric' })}</b>
                      <span>{dateLabel(a.date, { month: 'short' })}</span>
                    </div>
                    <div className="appointment-info">
                      <div className="between appointment-header-row">
                        <div className="appointment-title-block">
                          <h3>{a.serviceTitle}</h3>
                          {a.status === 'pending' && (
                            <span className="appointment-pending-chip">
                              <Clock size={12} />
                              <span>بانتظار تأكيد العيادة</span>
                            </span>
                          )}
                        </div>
                        <StatusBadge status={a.status} />
                      </div>
                      <div className="appointment-meta-pills">
                        <span className="meta-pill">
                          <CalendarDays size={14} />
                          {dateLabel(a.date)}
                        </span>
                        <span className="meta-pill">
                          <Clock size={14} />
                          {timeLabel(a.time)}
                        </span>
                        <span className="meta-pill venue">
                          <MapPin size={14} /> {catalog?.clinic.address || 'كفر الزيات، شارع الجيش عند توكيل أورنج'}
                        </span>
                      </div>
                      {/* Prominent Booking Reference Card */}
                      <div className="appointment-reference-card">
                        <div className="ref-card-main">
                          <div className="ref-badge-tag">
                            <Ticket size={14} />
                            <span>كود الحجز المعتمد</span>
                          </div>
                          <div className="ref-number-wrap">
                            <span className="ref-hash">#</span>
                            <strong className="ref-digits" dir="ltr">{a.reference}</strong>
                          </div>
                          <button
                            type="button"
                            className={`ref-copy-btn ${copiedRef === a.reference ? 'is-copied' : ''}`}
                            onClick={async () => {
                              try {
                                await navigator.clipboard.writeText(a.reference);
                                setCopiedRef(a.reference);
                                setTimeout(() => setCopiedRef(null), 2500);
                              } catch {
                                // fallback
                              }
                            }}
                            title="نسخ رقم الحجز للاستفسار"
                            aria-label="نسخ رقم الحجز"
                          >
                            {copiedRef === a.reference ? (
                              <>
                                <Check size={14} />
                                <span>تم النسخ! ✓</span>
                              </>
                            ) : (
                              <>
                                <Copy size={14} />
                                <span>نسخ الرقم</span>
                              </>
                            )}
                          </button>
                        </div>
                        <div className="ref-card-notice">
                          <p>
                            📌 <strong>احتفظي برقم الحجز:</strong> هذا هو كودكِ الخاص للاستفسار والمتابعة مع سكرتارية المركز أو الطبيبة في أي وقت.
                          </p>
                        </div>
                      </div>

                      {/* Prominent Pending Warning Banner right on the card */}
                      {a.status === 'pending' && (
                        <div className="appointment-pending-card-alert">
                          <div className="pending-card-alert-header">
                            <Clock size={16} className="pending-icon-pulse" />
                            <strong>طلب الموعد قيد المراجعة — يرجى انتظار تأكيد الحجز</strong>
                          </div>
                          <p>
                            تم استلام طلبك بنجاح. سيتواصل معكِ فريق المركز هاتفياً أو عبر واتساب لتأكيد الموعد النهائي قبل التوجه للعيادة.
                          </p>
                        </div>
                      )}

                      {a.reschedule && (
                        <p className="field-hint" style={{ color: '#c2410c', background: '#fff7ed', padding: '8px 12px', borderRadius: '8px', border: '1px solid #ffedd5' }}>
                          تغيير مقترح إلى {dateLabel(a.reschedule.date)} ·{' '}
                          {timeLabel(a.reschedule.time)}، بانتظار اعتماد المركز.
                        </p>
                      )}
                      <AppointmentActions appointment={a} onDone={reload} />
                      <details className="member-history">
                        <summary>سجل تحديثات الموعد</summary>
                        {a.history.map((h, i) => (
                          <p key={i}>{h.message}</p>
                        ))}
                      </details>
                    </div>
                  </article>
                ))
              )}
            </section>
          )}

          {/* قسم الروشتات والبرامج الغذائية */}
          {(tab === 'prescriptions' ||
            (tab === 'overview' &&
              accountQuery.data.prescriptions &&
              accountQuery.data.prescriptions.length > 0)) && (
            <section className="member-prescriptions-section">
              <div className="section-heading">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Utensils size={20} color="var(--forest)" />
                  <h2>
                    {tab === 'overview' ? 'أحدث خطة غذائية وروشتة' : 'برامجك الغذائية وروشتات الدايت'}
                  </h2>
                </div>
                {tab === 'overview' &&
                  accountQuery.data.prescriptions &&
                  accountQuery.data.prescriptions.length > 1 && (
                    <button
                      type="button"
                      className="link"
                      style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                      onClick={() => setParams({ tab: 'prescriptions' })}
                    >
                      عرض جميع الروشتات ({accountQuery.data.prescriptions.length})
                      <ArrowLeft size={17} />
                    </button>
                  )}
              </div>

              {accountQuery.data.prescriptions && accountQuery.data.prescriptions.length > 0 ? (
                <div className="member-prescriptions-list">
                  {(tab === 'overview'
                    ? accountQuery.data.prescriptions.slice(0, 1)
                    : accountQuery.data.prescriptions
                  ).map((rx) => (
                    <article key={rx.id} className="patient-prescription-card">
                      {/* Card Header with Clinic Logo */}
                      <div className="rx-card-top">
                        <div className="rx-card-brand-header">
                          <img
                            src="/assets/brand-mark.png"
                            alt="شعار مركز المستقبل"
                            className="rx-card-logo-img"
                          />
                          <div>
                            <div className="rx-card-clinic-title">مركز المستقبل للتغذية العلاجية</div>
                            <div className="rx-doctor-tag">إشراف: دكتورة د. رنا ياسر الشوري</div>
                          </div>
                        </div>
                        <div className="rx-badge-group">
                          <span className="rx-status-badge">
                            <Award size={13} />
                            خطة معتمدة
                          </span>
                          <div className="rx-date-stamp">
                            <CalendarDays size={14} />
                            <span>تاريخ الخطة: {dateLabel(rx.date)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Goal banner */}
                      {rx.goal && (
                        <div className="rx-goal-banner">
                          <strong>🎯 الهدف العلاجي:</strong>
                          <span>{rx.goal}</span>
                        </div>
                      )}

                      {/* Metrics strip */}
                      <div className="rx-card-metrics">
                        {rx.weight && (
                          <div className="rx-mini-stat">
                            <small>الوزن الحالي</small>
                            <strong>{rx.weight} كجم</strong>
                          </div>
                        )}
                        {rx.targetWeight && (
                          <div className="rx-mini-stat highlight">
                            <small>الوزن المستهدف</small>
                            <strong>{rx.targetWeight} كجم</strong>
                          </div>
                        )}
                        {rx.bodyFatPercent && (
                          <div className="rx-mini-stat">
                            <small>نسبة الدهون</small>
                            <strong>{rx.bodyFatPercent}%</strong>
                          </div>
                        )}
                        {rx.muscleMass && (
                          <div className="rx-mini-stat">
                            <small>الكتلة العضلية</small>
                            <strong>{rx.muscleMass} كجم</strong>
                          </div>
                        )}
                        {rx.waterPercent && (
                          <div className="rx-mini-stat">
                            <small>نسبة الماء</small>
                            <strong>{rx.waterPercent}%</strong>
                          </div>
                        )}
                      </div>

                      {/* Meals Schedule */}
                      <div className="rx-meals-accordion">
                        <div className="meal-row">
                          <span className="meal-title">🌅 الإفطار</span>
                          <p className="meal-desc">{rx.breakfast || '—'}</p>
                        </div>
                        {rx.snack1 && (
                          <div className="meal-row snack">
                            <span className="meal-title">🍎 سناك 1</span>
                            <p className="meal-desc">{rx.snack1}</p>
                          </div>
                        )}
                        <div className="meal-row">
                          <span className="meal-title">🥗 الغداء</span>
                          <p className="meal-desc">{rx.lunch || '—'}</p>
                        </div>
                        {rx.snack2 && (
                          <div className="meal-row snack">
                            <span className="meal-title">🍵 سناك 2</span>
                            <p className="meal-desc">{rx.snack2}</p>
                          </div>
                        )}
                        <div className="meal-row">
                          <span className="meal-title">🌙 العشاء</span>
                          <p className="meal-desc">{rx.dinner || '—'}</p>
                        </div>
                      </div>

                      {/* Guidelines */}
                      <div className="rx-guidelines-bar">
                        {rx.waterIntake && (
                          <div className="guide-item">
                            <span>💧 الماء:</span>
                            <small>{rx.waterIntake}</small>
                          </div>
                        )}
                        {rx.supplements && (
                          <div className="guide-item">
                            <span>💊 المكملات:</span>
                            <small>{rx.supplements}</small>
                          </div>
                        )}
                      </div>

                      {rx.instructions && (
                        <div className="rx-instructions-note">
                          <strong>⚠️ توجيهات الطبيب:</strong>
                          <p>{rx.instructions}</p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="rx-card-actions">
                        <button
                          type="button"
                          className="rx-print-btn"
                          onClick={() => printPatientPrescription(rx)}
                          title="طباعة روشتة رسمية A4 أو حفظها كـ PDF"
                        >
                          <Printer size={15} />
                          <span>تحميل / طباعة الروشتة (PDF)</span>
                        </button>
                        {catalog && (
                          <a
                            href={whatsappUrl(
                              catalog.clinic.whatsapp,
                              `أهلاً دكتورة رنا، عندي استفسار بخصوص الروشتة الغذائية بتاريخ ${dateLabel(rx.date)}.`,
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rx-whatsapp-btn"
                          >
                            <WhatsAppIcon size={15} color="#ffffff" />
                            <span>استفسار عن الخطة</span>
                          </a>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="member-no-program">
                  <Utensils size={36} color="var(--forest)" style={{ margin: 'auto' }} />
                  <div>
                    <h3>روشتاتك وبرامجك الغذائية المعتمدة.</h3>
                    <p>
                      عند إعداد دكتورة د. رنا ياسر الشورى لخطتك الغذائية، ستظهر الروشتة هنا تلقائياً بتفاصيل الوجبات اليومية والمقاييس مع إمكانية طباعتها أو تحميلها كـ PDF في أي وقت.
                    </p>
                  </div>
                </div>
              )}
            </section>
          )}
          {(tab === 'overview' || tab === 'programs') && (
            <section>
              <div className="section-heading">
                <h2>برامجك ومتابعتك</h2>
                <Link className="link" to="/programs">
                  استكشفي البرامج
                  <ArrowLeft size={17} />
                </Link>
              </div>
              <div className="subscriptions-grid">
                {accountQuery.data.subscriptions.map((s) => (
                  <SubscriptionCard key={s.id} s={s} />
                ))}
              </div>
              {!accountQuery.data.subscriptions.length && (
                <div className="member-no-program">
                  <img src="/assets/food-editorial.png" alt="وجبة صحية تعبيرية" />
                  <div>
                    <h3>خطة تناسب تفاصيل يومك.</h3>
                    <p>
                      اختاري برنامجًا وأرسلي طلبك. يتواصل المركز معك لتحديد التفاصيل وتفعيل
                      الاشتراك.
                    </p>
                    <Link className="link" to="/programs">
                      عرض البرامج
                      <ArrowLeft size={18} />
                    </Link>
                  </div>
                </div>
              )}
              {accountQuery.data.interests.length > 0 && (
                <div className="request-list">
                  <h3>طلبات البرامج</h3>
                  {accountQuery.data.interests.map((r) => (
                    <div key={r.id}>
                      <span>
                        {r.programTitle}
                        <small>
                          <bdi dir="ltr">{r.reference}</bdi>
                        </small>
                      </span>
                      <StatusBadge status={r.status} />
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {(tab === 'overview' || tab === 'inbody') && (
            <section>
              <div className="section-heading">
                <h2>قياساتك وفحوصات الـ InBody</h2>
                {tab === 'overview' && (
                  <button
                    type="button"
                    className="link"
                    style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                    onClick={() => setParams({ tab: 'inbody' })}
                  >
                    السجل الكامل
                    <ArrowLeft size={17} />
                  </button>
                )}
              </div>
              {accountQuery.data.inbody && accountQuery.data.inbody.length > 0 ? (
                <div>
                  {(() => {
                    const latest = accountQuery.data.inbody[0];
                    const oldest =
                      accountQuery.data.inbody[accountQuery.data.inbody.length - 1];
                    const weightDiff =
                      accountQuery.data.inbody.length > 1
                        ? Math.round((latest.weight - oldest.weight) * 10) / 10
                        : null;
                    return (
                      <div className="member-inbody-hero">
                        <div className="inbody-hero-header">
                          <div>
                            <span className="small muted">أحدث فحص مسجل</span>
                            <div className="inbody-main-weight">
                              {latest.weight} <small>كجم</small>
                            </div>
                          </div>
                          {weightDiff !== null && (
                            <div
                              className="inbody-progress-pill"
                              style={{
                                backgroundColor: weightDiff <= 0 ? '#eef6ea' : '#fdf3e7',
                                color: weightDiff <= 0 ? '#2d6a2f' : '#965a18',
                              }}
                            >
                              <Scale size={16} />
                              <span>
                                {weightDiff < 0
                                  ? `نزول ${Math.abs(weightDiff)} كجم منذ أول زيارة`
                                  : weightDiff === 0
                                    ? 'ثبات في الوزن'
                                    : `زيادة ${weightDiff} كجم`}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="inbody-metrics-grid">
                          {latest.bodyFatPercent !== undefined && (
                            <div className="inbody-metric-box">
                              <small>نسبة الدهون</small>
                              <strong>{latest.bodyFatPercent}%</strong>
                            </div>
                          )}
                          {latest.muscleMass !== undefined && (
                            <div className="inbody-metric-box">
                              <small>الكتلة العضلية</small>
                              <strong>{latest.muscleMass} كجم</strong>
                            </div>
                          )}
                          {latest.waterPercent !== undefined && (
                            <div className="inbody-metric-box">
                              <small>نسبة الماء</small>
                              <strong>{latest.waterPercent}%</strong>
                            </div>
                          )}
                          {latest.visceralFat !== undefined && (
                            <div className="inbody-metric-box">
                              <small>الدهون الحشوية</small>
                              <strong>مستوى {latest.visceralFat}</strong>
                            </div>
                          )}
                          {latest.waistCm !== undefined && (
                            <div className="inbody-metric-box">
                              <small>محيط الخصر</small>
                              <strong>{latest.waistCm} سم</strong>
                            </div>
                          )}
                        </div>

                        {latest.doctorNotes && (
                          <div className="calc-advice-box" style={{ margin: '16px 0 0' }}>
                            <p>
                              <strong>توجيه الطبيب للجلسة:</strong> {latest.doctorNotes}
                            </p>
                          </div>
                        )}
                        <p className="field-hint" style={{ marginTop: '12px' }}>
                          تاريخ آخر فحص: {dateLabel(latest.date)}
                        </p>
                      </div>
                    );
                  })()}

                  {tab === 'inbody' && accountQuery.data.inbody.length > 1 && (
                    <div className="inbody-history-list" style={{ marginTop: '24px' }}>
                      <h3 style={{ fontSize: '18px', marginBottom: '14px', color: 'var(--forest)' }}>
                        سجل الفحوصات السابقة
                      </h3>
                      {accountQuery.data.inbody.slice(1).map((record) => (
                        <article key={record.id} className="inbody-history-item">
                          <div className="between">
                            <strong>{dateLabel(record.date)}</strong>
                            <span className="pill" style={{ fontWeight: 'bold' }}>
                              {record.weight} كجم
                            </span>
                          </div>
                          <div className="subscription-ledger" style={{ marginTop: '8px' }}>
                            {record.bodyFatPercent !== undefined && (
                              <span>الدهون: {record.bodyFatPercent}%</span>
                            )}
                            {record.muscleMass !== undefined && (
                              <span>العضلات: {record.muscleMass} كجم</span>
                            )}
                            {record.waterPercent !== undefined && (
                              <span>الماء: {record.waterPercent}%</span>
                            )}
                            {record.waistCm !== undefined && (
                              <span>الخصر: {record.waistCm} سم</span>
                            )}
                          </div>
                          {record.doctorNotes && (
                            <p className="field-hint" style={{ marginTop: '8px' }}>
                              <em>ملاحظة الطبيب: {record.doctorNotes}</em>
                            </p>
                          )}
                        </article>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="member-no-program">
                  <Activity size={36} color="var(--forest)" style={{ margin: 'auto' }} />
                  <div>
                    <h3>سجل فحوصاتك وقياسات الـ InBody.</h3>
                    <p>
                      عند زيارتك للمركز وإجراء فحص الـ InBody، سيقوم الطبيب بتسجيل قياساتك وستظهر هنا تلقائياً لمتابعة تطور وزنك ونزول الدهون.
                    </p>
                  </div>
                </div>
              )}
            </section>
          )}

          {tab === 'notifications' && (
            <section className="account-notifications-panel">
              <div className="section-heading" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <h2>مركز الإشعارات والتنبيهات</h2>
                  <span>
                    {(accountQuery.data.notifications || []).length} إشعار مسجل
                    {(accountQuery.data.unreadNotificationsCount || 0) > 0 && ` • ${accountQuery.data.unreadNotificationsCount} غير مقروء`}
                  </span>
                </div>
                {(accountQuery.data.unreadNotificationsCount || 0) > 0 && (
                  <button
                    type="button"
                    className="btn-mark-all-read"
                    onClick={() => markAllNotifsMutation.mutate()}
                    disabled={markAllNotifsMutation.isPending}
                  >
                    <CheckCheck size={16} />
                    <span>تحديد الكل كمقروء</span>
                  </button>
                )}
              </div>

              {/* Phone Push Notifications Setup Card */}
              <div className="account-push-setup-card">
                <div className="push-setup-main">
                  <div className="push-setup-icon-box">
                    <Smartphone size={24} />
                  </div>
                  <div>
                    <div className="push-setup-title-row">
                      <strong className="push-setup-title">إشعارات الهاتف الخارجية (Push Notifications)</strong>
                      <span className={`push-setup-pill ${pushPerm === 'granted' ? 'is-granted' : 'is-idle'}`}>
                        {pushPerm === 'granted' ? 'مفعلة ونشطة على هاتفك ✅' : 'غير مفعلة 🔔'}
                      </span>
                    </div>
                    <p className="push-setup-desc">
                      تصلكِ تنبيهات فورية على شاشة القفل وستارة إشعارات هاتفك عند نشر الروشتة أو تأكيد مواعيدك حتى عند إغلاق التطبيق.
                    </p>
                  </div>
                </div>

                <div className="push-setup-actions">
                  <button
                    type="button"
                    className="btn-test-sound"
                    onClick={() => {
                      void playNotificationChime(true);
                      setToast({
                        type: 'success',
                        message: 'تم تشغيل نغمة مركز المستقبل 🎵',
                        subMessage: 'هذه النغمة الطبية الهادئة تصدر تلقائياً عند وصول أي إشعار جديد.',
                      });
                    }}
                    title="استمع إلى نغمة إشعارات مركز المستقبل"
                  >
                    <Volume2 size={16} />
                    <span>سماع النغمة 🎵</span>
                  </button>

                  <button
                    type="button"
                    className={`btn-test-sound ${soundEnabled ? 'is-enabled' : 'is-muted'}`}
                    onClick={() => {
                      const next = toggleNotificationSound();
                      setSoundEnabled(next);
                      setToast({
                        type: next ? 'success' : 'warning',
                        message: next ? 'تم تفعيل صوت التنبيهات 🔔' : 'تم كتم صوت التنبيهات 🔕',
                        subMessage: next ? 'ستصدر نغمة مركز المستقبل عند وصول أي إشعار جديد.' : 'لن يصدر صوت عند وصول الإشعارات داخل التطبيق.',
                      });
                    }}
                    title="تفعيل أو كتم صوت التنبيهات"
                  >
                    {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                    <span>{soundEnabled ? 'صوت الإشعارات: مفعّل' : 'صوت الإشعارات: مكتوم'}</span>
                  </button>
                  {pushPerm !== 'granted' ? (
                    <button
                      type="button"
                      className="btn-enable-push"
                      onClick={handleEnablePush}
                      disabled={isEnablingPush}
                    >
                      <Bell size={16} />
                      <span>{isEnablingPush ? 'جارِ التفعيل...' : 'تفعيل إشعارات الهاتف الآن'}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn-test-push"
                      onClick={handleTestPush}
                      disabled={isTestingPush}
                    >
                      <Award size={16} />
                      <span>{isTestingPush ? 'جارِ الإرسال...' : 'إرسال إشعار تجريبي لهاتفي 📲'}</span>
                    </button>
                  )}
                </div>
              </div>

              {(accountQuery.data.notifications || []).length > 0 && (
                <div className="notif-panel-filter-bar">
                  <button
                    type="button"
                    className={`notif-filter-pill ${notifFilter === 'all' ? 'is-active' : ''}`}
                    onClick={() => setNotifFilter('all')}
                  >
                    الكل ({(accountQuery.data.notifications || []).length})
                  </button>
                  <button
                    type="button"
                    className={`notif-filter-pill ${notifFilter === 'unread' ? 'is-active' : ''}`}
                    onClick={() => setNotifFilter('unread')}
                  >
                    غير مقروءة ({(accountQuery.data.unreadNotificationsCount || 0)})
                  </button>
                </div>
              )}

              {(() => {
                const allList = accountQuery.data.notifications || [];
                const filtered = notifFilter === 'unread' ? allList.filter((n) => !n.read) : allList;

                if (filtered.length === 0) {
                  return (
                    <div className="notif-empty-state">
                      <div className="notif-empty-icon-wrap">
                        <Bell size={28} />
                      </div>
                      <div className="notif-empty-title">
                        {notifFilter === 'unread' ? 'لا توجد إشعارات غير مقروءة' : 'لا توجد أي إشعارات حتى الآن'}
                      </div>
                      <p className="notif-empty-desc">
                        {notifFilter === 'unread'
                          ? 'لقد اطّلعتِ على جميع التنبيهات والروشتات السابقة.'
                          : 'عندما يقوم الفريق باعتماد روشتة جديدة، تأكيد موعدك، أو تسجيل نتائج فحصك، ستصلك تنبيهات فورية هنا.'}
                      </p>
                    </div>
                  );
                }

                return (
                  <div className="account-notifs-list">
                    {filtered.map((item) => (
                      <article
                        key={item.id}
                        className={`account-notif-card ${item.read ? 'is-read' : 'is-unread'}`}
                        onClick={() => {
                          if (!item.read) markNotifReadMutation.mutate(item.id);
                          if (item.link) {
                            if (item.link.startsWith('/account?tab=')) {
                              const targetTab = item.link.split('=')[1];
                              selectTab(targetTab);
                            } else {
                              window.location.href = item.link;
                            }
                          }
                        }}
                        role="button"
                        tabIndex={0}
                      >
                        <div className="account-notif-card-start">
                          <span className={`notif-type-icon is-${item.type}`}>
                            {item.type === 'prescription' ? (
                              <FileText size={18} />
                            ) : item.type === 'appointment' ? (
                              <CalendarDays size={18} />
                            ) : item.type === 'inbody' ? (
                              <Scale size={18} />
                            ) : (
                              <Bell size={18} />
                            )}
                          </span>
                          <div className="account-notif-content">
                            <div className="account-notif-header">
                              <h3 className="account-notif-title">{item.title}</h3>
                              <time className="account-notif-time">{dateLabel(item.createdAt.slice(0, 10))}</time>
                            </div>
                            <p className="account-notif-body">{item.body}</p>
                            {item.link && (
                              <span className="account-notif-link-badge">
                                <span>اضغطي للاطلاع على التفاصيل</span>
                                <ArrowLeft size={13} />
                              </span>
                            )}
                          </div>
                        </div>
                        {!item.read && <span className="account-notif-unread-dot" title="غير مقروء" />}
                      </article>
                    ))}
                  </div>
                );
              })()}
            </section>
          )}

          {/* شريط الانتقال السريع بين الأقسام */}
          <nav className="tab-bottom-nav" aria-label="التنقل بين الأقسام">
            {prevTab ? (
              <button
                type="button"
                className="btn-tab-step prev"
                onClick={() => selectTab(prevTab.id)}
              >
                <ArrowRight size={16} />
                <span>السابق: {prevTab.shortLabel}</span>
              </button>
            ) : <div />}
            {nextTab && (
              <button
                type="button"
                className="btn-tab-step next"
                onClick={() => selectTab(nextTab.id)}
              >
                <span>التالي: {nextTab.shortLabel}</span>
                <ArrowLeft size={16} />
              </button>
            )}
          </nav>

          {catalog && (
            <div className="member-help">
              <WhatsAppIcon size={28} color="#25D366" />
              <div>
                <h3>نتابع معك خطوة بخطوة.</h3>
                <p>استفسارك عن موعد أو برنامج؟ فريق المركز قريب منك.</p>
              </div>
              <a
                className="btn-whatsapp"
                style={{ padding: '8px 16px', borderRadius: '10px' }}
                target="_blank"
                rel="noopener noreferrer"
                href={whatsappUrl(catalog.clinic.whatsapp, 'أحتاج مساعدة بخصوص حسابي بالمركز.')}
              >
                <WhatsAppIcon size={18} color="#ffffff" />
                <span>تواصلي معنا عبر واتساب</span>
              </a>
            </div>
          )}
          <p className="field-hint">
            الحجوزات القديمة لا تُربط برقم الهاتف تلقائيًا، حفاظًا على خصوصيتك.{' '}
            <button
              className="link"
              onClick={() => {
                setMessage('');
                setClaim(true);
              }}
            >
              أضيفي حجزك برابط المتابعة
            </button>
          </p>
        </div>
      </div>
      {[
        { open: claim, kind: 'claim', title: 'أضيفي حجز الضيف إلى حسابك' },
        { open: profile, kind: 'profile', title: 'تعديل بياناتك' },
        { open: password, kind: 'password', title: 'تغيير كلمة المرور' },
      ].map((m) => (
        <Modal
          key={m.kind}
          open={m.open}
          onClose={() => {
            if (!busy) {
              setClaim(false);
              setProfile(false);
              setPassword(false);
            }
          }}
          title={m.title}
        >
          <form onSubmit={(e) => void formAction(e, m.kind)}>
            <fieldset disabled={busy}>
              {m.kind === 'claim' ? (
                <>
                  <p>الصقي رابط المتابعة الخاص بك. لا تستخدمي رابط شخص آخر.</p>
                  <label className="field">
                    رابط المتابعة أو الرمز
                    <input name="token" dir="ltr" required autoComplete="off" />
                  </label>
                </>
              ) : m.kind === 'profile' ? (
                <>
                  <label className="field">
                    الاسم بالكامل
                    <input
                      name="name"
                      defaultValue={user?.name}
                      minLength={3}
                      maxLength={100}
                      required
                    />
                  </label>
                  <p className="field-hint">لتغيير رقم الهاتف، تواصلي مع المركز للتحقق من هويتك.</p>
                </>
              ) : (
                <>
                  <PasswordField name="currentPassword" label="كلمة المرور الحالية" current />
                  <PasswordField label="كلمة المرور الجديدة" />
                </>
              )}
              {message && (
                <p className="form-error" role="alert">
                  {message}
                </p>
              )}
              <div className="modal-actions">
                <Button disabled={busy}>{busy ? 'جاري الحفظ...' : 'حفظ ومتابعة'}</Button>
              </div>
            </fieldset>
          </form>
        </Modal>
      ))}

      {/* السايد بار الجانبية للمريض */}
      <div
        className={`member-drawer-overlay ${drawerOpen ? 'open' : ''}`}
        onClick={() => setDrawerOpen(false)}
        aria-hidden={!drawerOpen}
      >
        <aside
          className="member-drawer"
          onClick={(e) => e.stopPropagation()}
          aria-label="قائمة أقسام الحساب"
        >
          <div className="drawer-header">
            <div className="drawer-title-wrap">
              <span className="drawer-kicker">مركز المستقبل</span>
              <h3>أقسام حسابك</h3>
            </div>
            <button
              type="button"
              className="drawer-close-btn"
              onClick={() => setDrawerOpen(false)}
              aria-label="إغلاق القائمة"
            >
              <X size={20} />
            </button>
          </div>

          <div className="drawer-user-card">
            <span className="avatar-large">{user?.name ? user.name.trim().slice(0, 1) : 'م'}</span>
            <div className="drawer-user-info">
              <strong>{user?.name || 'مريضة المركز'}</strong>
              <bdi dir="ltr">{user?.phone}</bdi>
              {user?.fileNumber && (
                <div className="member-file-pill" style={{ marginTop: '4px' }}>
                  <span className="file-lbl">الملف الطبي:</span>
                  <strong className="file-val" dir="ltr">#{user.fileNumber}</strong>
                </div>
              )}
            </div>
            <span className="member-role-badge">حساب مريض</span>
          </div>

          <div className="drawer-tabs-list">
            <span className="drawer-section-label">تصفح أقسام العيادة ({ACCOUNT_TABS.length})</span>
            {ACCOUNT_TABS.map(({ id, label, desc, icon: TabIcon, badgeKey }) => {
              const isActive = tab === id;
              const count = getTabCount(badgeKey);
              return (
                <button
                  key={id}
                  type="button"
                  className={`drawer-tab-item ${isActive ? 'active' : ''}`}
                  onClick={() => selectTab(id)}
                >
                  <span className="drawer-tab-icon">
                    <TabIcon size={19} />
                  </span>
                  <div className="drawer-tab-text">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="drawer-tab-label">{label}</span>
                      {count !== null && count > 0 && (
                        <span className="drawer-count-badge">{count}</span>
                      )}
                    </div>
                    <small className="drawer-tab-desc">{desc}</small>
                  </div>
                  {isActive ? (
                    <span className="drawer-active-pill">القسم الحالي</span>
                  ) : (
                    <ArrowLeft size={16} className="drawer-tab-arrow" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="drawer-footer">
            <span className="drawer-section-label">إعدادات الحساب</span>
            <div className="drawer-actions-grid">
              <button
                type="button"
                onClick={() => {
                  setDrawerOpen(false);
                  setMessage('');
                  setProfile(true);
                }}
              >
                <UserRound size={15} />
                <span>تعديل الاسم</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setDrawerOpen(false);
                  setMessage('');
                  setPassword(true);
                }}
              >
                <ShieldCheck size={15} />
                <span>كلمة المرور</span>
              </button>
              <button type="button" onClick={handleLogout} className="drawer-logout">
                <LogOut size={15} />
                <span>خروج</span>
              </button>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
