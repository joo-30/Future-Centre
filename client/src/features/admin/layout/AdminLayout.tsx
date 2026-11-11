import {
  Trophy,
  ArrowLeft,
  Bell,
  Calculator,
  CalendarDays,
  ExternalLink,
  FileText,
  Leaf,
  LogOut,
  Menu,
  QrCode,
  Settings,
  Users,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../../components/Auth';
import { Brand } from '../../../components/ui';
import { adminApi } from '../../../lib/portal-api';
import {
  AdminQrScannerModal,
  type QrScanResult,
} from '../components/AdminQrScannerModal';

const navSections = [
  {
    title: 'العمليات والتشغيل',
    items: [
      { path: '/admin', label: 'المواعيد والحجوزات', icon: CalendarDays },
      { path: '/admin/patients', label: 'العملاء والاشتراكات', icon: Users },
      { path: '/admin/bmi', label: 'حاسبة الـ BMI والمؤشرات', icon: Calculator },
    ],
  },
  {
    title: 'المركز والمحتوى',
    items: [
      { path: '/admin/programs', label: 'البرامج والأسعار', icon: Leaf },
      { path: '/admin/articles', label: 'المقالات الطبية', icon: FileText },
      { path: '/admin/stories', label: 'قصص وتجارب النجاح', icon: Trophy },
      { path: '/admin/settings', label: 'إعدادات المركز', icon: Settings },
    ],
  },
] as const;

export function AdminLayout() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [globalScannerOpen, setGlobalScannerOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Real-time overview counts for pending bookings and customer inquiries
  const overviewQuery = useQuery({
    queryKey: ['admin', 'overview'],
    queryFn: adminApi.overview,
    refetchInterval: 15000,
  });

  const pendingAppointments =
    (overviewQuery.data?.pending || 0) + (overviewQuery.data?.changes || 0);
  const newInterests = overviewQuery.data?.newInterests || 0;

  const handleGlobalScan = (res: QrScanResult) => {
    setGlobalScannerOpen(false);
    const target = res.reference || res.patientId || res.phone;
    if (target) {
      navigate(`/admin/patients/${encodeURIComponent(target)}`);
    }
  };

  const handleLogout = async () => {
    try {
      await logout('admin');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      window.location.href = '/login';
    }
  };

  useEffect(() => {
    setOpen(false);
    setGlobalScannerOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);
  return (
    <div className="clinic-console">
      <a className="skip-link" href="#admin-main">
        انتقل للمحتوى
      </a>
      {open && (
        <button
          className="console-scrim"
          aria-label="إغلاق القائمة"
          onClick={() => setOpen(false)}
        />
      )}
      <aside className={'console-sidebar ' + (open ? 'is-open' : '')}>
        <div className="console-brand">
          <Brand />
          <button
            className="icon-button console-mobile"
            aria-label="إغلاق القائمة"
            onClick={() => setOpen(false)}
          >
            <X />
          </button>
        </div>
        <nav aria-label="لوحة الإدارة" className="console-nav-sections">
          {navSections.map((section, idx) => (
            <div key={idx} className="nav-section-group">
              <span className="console-nav-section-title">{section.title}</span>
              <div className="nav-group-items">
                {section.items.map(({ path, label, icon: Icon }) => {
                  let badgeCount = 0;
                  let badgeType: 'alert' | 'info' = 'alert';
                  if (path === '/admin') {
                    badgeCount = pendingAppointments;
                    badgeType = 'alert';
                  } else if (path === '/admin/patients') {
                    badgeCount = newInterests;
                    badgeType = 'info';
                  }

                  return (
                    <NavLink key={path} to={path} end={path === '/admin'}>
                      <Icon size={19} className="nav-item-icon" />
                      <span className="nav-item-label">{label}</span>
                      {badgeCount > 0 && (
                        <span
                          className={`sidebar-notification-badge badge-${badgeType}`}
                          title={
                            path === '/admin'
                              ? `${badgeCount} طلب موعد بانتظار المراجعة والاعتماد`
                              : `${badgeCount} استفسار عميل جديد`
                          }
                        >
                          {badgeCount}
                        </span>
                      )}
                      <ArrowLeft size={16} className="nav-item-arrow" />
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="console-sidebar-bottom">
          {/* Doctor / Admin Profile Card */}
          <div className="sidebar-doctor-profile-card">
            <div className="doctor-avatar-circle">
              <span className="avatar-text">ر</span>
              <span className="doctor-online-pulse" title="متصل الآن" />
            </div>
            <div className="doctor-profile-details">
              <strong className="doctor-name">د. رنا ياسر الشوري</strong>
              <span className="doctor-role-tag">المدير الطبي · {user?.name || 'المدير العام'}</span>
            </div>
          </div>

          <div className="sidebar-quick-actions">
            <Link to="/" className="sidebar-action-btn view-site-btn" title="معاينة موقع المركز للجمهور">
              <ExternalLink size={15} />
              <span>عرض الموقع</span>
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="sidebar-action-btn logout-btn"
              title="تسجيل الخروج من لوحة التحكم"
            >
              <LogOut size={15} />
              <span>خروج</span>
            </button>
          </div>
        </div>
      </aside>
      <div className="console-body">
        <header className="console-topbar">
          <div className="row">
            <button
              className="icon-button console-mobile"
              aria-label="فتح قائمة الإدارة"
              onClick={() => setOpen(true)}
              style={{ position: 'relative' }}
            >
              <Menu />
              {pendingAppointments + newInterests > 0 && (
                <span className="mobile-burger-badge" />
              )}
            </button>
            <span>
              مركز المستقبل <small>/ لوحة الإدارة</small>
            </span>
          </div>
          <div className="console-topbar-actions">
            {pendingAppointments > 0 && (
              <Link
                to="/admin"
                className="topbar-pending-alert-chip"
                title="يوجد طلبات مواعيد جديدة بانتظار المراجعة والاعتماد"
              >
                <span className="topbar-ping-dot">
                  <span className="ping-wave" />
                  <span className="ping-center" />
                </span>
                <Bell size={15} className="topbar-bell-icon" />
                <span className="topbar-chip-text">
                  <span className="chip-badge-count">{pendingAppointments}</span>
                  <span className="chip-badge-label">طلب جديد</span>
                </span>
                <ArrowLeft size={13} className="topbar-chip-arrow" />
              </Link>
            )}

            <button
              type="button"
              className="topbar-qr-scan-btn"
              onClick={() => setGlobalScannerOpen(true)}
              title="مسح كود الـ QR لأي مريض وفتح ملفه الطبي فوراً"
            >
              <QrCode size={16} />
              <span>مسح كود المريض (QR)</span>
            </button>

            {/* User role relocated to sidebar profile card */}
            <button
              type="button"
              className="console-topbar-logout"
              onClick={handleLogout}
              title="تسجيل الخروج من لوحة الإدارة"
              aria-label="تسجيل الخروج"
            >
              <LogOut size={16} />
              <span>تسجيل الخروج</span>
            </button>
          </div>
        </header>
        <main id="admin-main" className="console-content">
          <Outlet />
        </main>
      </div>

      <AdminQrScannerModal
        isOpen={globalScannerOpen}
        onClose={() => setGlobalScannerOpen(false)}
        onScanSuccess={handleGlobalScan}
        title="فحص كود المريض الذكي (QR)"
        subtitle="امسحي تذكرة المريض أو كود الحجز بالكاميرا أو ارفعي صورة لفتح ملفه الطبي الشامل فوراً"
      />
    </div>
  );
}
