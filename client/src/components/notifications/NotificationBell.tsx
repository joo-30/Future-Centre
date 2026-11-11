import type { NotificationPublic } from '@future/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Award,
  Bell,
  CalendarDays,
  CheckCheck,
  CheckCircle2,
  FileText,
  Scale,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Auth';
import { accountApi } from '../../lib/portal-api';
import { requestAndSubscribePush, sendTestExternalPush } from '../../lib/push-manager';
import {
  isNotificationSoundEnabled,
  playNotificationChime,
  toggleNotificationSound,
} from '../../lib/sound';

function formatRelativeTime(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 2) return 'الآن';
    if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    if (diffDays === 1) return 'أمس';
    if (diffDays < 7) return `منذ ${diffDays} أيام`;

    return d.toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' });
  } catch {
    return 'مؤخراً';
  }
}

function getNotificationIcon(type: NotificationPublic['type']) {
  switch (type) {
    case 'prescription':
      return <FileText size={18} className="notif-type-icon is-rx" />;
    case 'appointment':
      return <CalendarDays size={18} className="notif-type-icon is-appt" />;
    case 'inbody':
      return <Scale size={18} className="notif-type-icon is-inbody" />;
    case 'subscription':
      return <Award size={18} className="notif-type-icon is-sub" />;
    default:
      return <Bell size={18} className="notif-type-icon is-sys" />;
  }
}

export function NotificationBell({ className = '' }: { className?: string }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [permissionState, setPermissionState] = useState<NotificationPermission>('default');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => isNotificationSoundEnabled());
  const dropdownRef = useRef<HTMLDivElement>(null);
  const prevCountRef = useRef<number>(0);

  // Sync sound preference changes
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

  // Check browser Notification support
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermissionState(Notification.permission);
    }
  }, []);

  // Close dropdown on click outside or escape
  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  // Fetch notifications with automatic periodic polling
  const { data, isSuccess } = useQuery({
    queryKey: ['account', 'notifications'],
    queryFn: accountApi.notifications,
    enabled: Boolean(user),
    refetchInterval: 25000,
    staleTime: 12000,
  });

  const notifications = data?.notifications || [];
  const unreadCount = data?.unreadCount || 0;

  // Trigger sound & browser notification if new notification arrives
  useEffect(() => {
    if (!isSuccess || !notifications.length) return;

    if (unreadCount > prevCountRef.current && prevCountRef.current !== 0) {
      // Play Future Center signature clinic chime
      void playNotificationChime();

      if (
        typeof window !== 'undefined' &&
        'Notification' in window &&
        Notification.permission === 'granted'
      ) {
        const latest = notifications[0];
        if (latest && !latest.read) {
          if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then((reg) => {
              reg.showNotification(latest.title, {
                body: latest.body,
                icon: '/icons/pwa-192x192.png',
                badge: '/icons/pwa-192x192.png',
                tag: latest.id,
                dir: 'rtl',
                lang: 'ar',
                data: { url: latest.link || '/account' },
              });
            }).catch((err) => console.warn('[Notification] SW showNotification error:', err));
          } else {
            try {
              new Notification(latest.title, {
                body: latest.body,
                icon: '/icons/pwa-192x192.png',
                dir: 'rtl',
                lang: 'ar',
              });
            } catch (err) {
              console.warn('[Notification] Native push failed:', err);
            }
          }
        }
      }
    }

    prevCountRef.current = unreadCount;
  }, [unreadCount, isSuccess, notifications, navigate]);

  // Mark single as read mutation
  const markReadMutation = useMutation({
    mutationFn: (id: string) => accountApi.markNotificationRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['account', 'notifications'] });
      queryClient.invalidateQueries({ queryKey: ['account', user?.id] });
    },
  });

  // Mark all as read mutation
  const markAllMutation = useMutation({
    mutationFn: accountApi.markAllNotificationsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['account', 'notifications'] });
      queryClient.invalidateQueries({ queryKey: ['account', user?.id] });
    },
  });

  const handleRequestPermission = async () => {
    try {
      const res = await requestAndSubscribePush();
      setPermissionState(res.permission);
    } catch (err) {
      console.error('[Notification] Permission error:', err);
    }
  };

  const [isTestingPush, setIsTestingPush] = useState(false);
  const [testPushFeedback, setTestPushFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const handleTestExternalPush = async () => {
    setIsTestingPush(true);
    setTestPushFeedback(null);
    try {
      void playNotificationChime(true);
      const res = await sendTestExternalPush();
      if (res.ok) {
        setTestPushFeedback({
          type: 'success',
          text: 'تم إرسال إشعار د. رنا لهاتفك بنجاح! 📲 تفقدي ستارة الإشعارات في الموبايل أو شاشة القفل الآن.',
        });
      } else {
        setTestPushFeedback({
          type: 'error',
          text: res.error || 'تعذر إرسال الإشعار لهاتفك.',
        });
      }
    } catch {
      setTestPushFeedback({
        type: 'error',
        text: 'تعذر الاتصال بالخادم لإرسال الإشعار.',
      });
    } finally {
      setIsTestingPush(false);
    }
  };

  const handleToggleSound = () => {
    const next = toggleNotificationSound();
    setSoundEnabled(next);
  };

  const handleItemClick = (n: NotificationPublic) => {
    if (!n.read) {
      markReadMutation.mutate(n.id);
    }
    setOpen(false);
    if (n.link) {
      navigate(n.link);
    }
  };

  if (!user) return null;

  return (
    <div className={`notif-bell-container ${className}`} ref={dropdownRef}>
      {/* Trigger Button with Badge */}
      <button
        type="button"
        className={`notif-bell-btn ${open ? 'is-active' : ''} ${unreadCount > 0 ? 'has-unread' : ''}`}
        onClick={() => setOpen(!open)}
        title={unreadCount > 0 ? `${unreadCount} إشعارات غير مقروءة` : 'الإشعارات والتنبيهات'}
        aria-label="عرض الإشعارات"
        aria-expanded={open}
      >
        <Bell size={19} strokeWidth={2.2} />
        {unreadCount > 0 && (
          <span className="notif-badge">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Slide-over / Dropdown Notification Center */}
      {open && (
        <div className="notif-popover-panel" role="dialog" aria-label="مركز الإشعارات">
          {/* Header */}
          <div className="notif-popover-header">
            <div className="notif-popover-title-row">
              <span className="notif-title-icon"><Bell size={18} /></span>
              <strong className="notif-popover-title">الإشعارات والتنبيهات</strong>
              {unreadCount > 0 && (
                <span className="notif-unread-count-pill">{unreadCount} جديد</span>
              )}
            </div>

            <div className="notif-header-actions">
              <button
                type="button"
                className={`notif-sound-btn ${soundEnabled ? 'is-enabled' : 'is-muted'}`}
                onClick={handleToggleSound}
                title={soundEnabled ? 'صوت التنبيهات مفعّل (اضغطي للاختبار أو الكتم)' : 'صوت التنبيهات مكتوم (اضغطي للتفعيل)'}
                aria-label="التحكم في صوت التنبيهات"
              >
                {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
              </button>
              {unreadCount > 0 && (
                <button
                  type="button"
                  className="notif-mark-all-btn"
                  onClick={() => markAllMutation.mutate()}
                  disabled={markAllMutation.isPending}
                  title="تحديد الكل كمقروء"
                >
                  <CheckCheck size={14} />
                  <span>قراءة الكل</span>
                </button>
              )}
              <button
                type="button"
                className="notif-popover-close"
                onClick={() => setOpen(false)}
                aria-label="إغلاق"
              >
                <X size={17} />
              </button>
            </div>
          </div>

          {/* Web Push Permission Banner */}
          {permissionState === 'default' && (
            <div className="notif-perm-banner">
              <div className="notif-perm-content">
                <Volume2 size={16} className="notif-perm-icon" />
                <span>فعّلي إشعارات الهاتف لتصلكِ تنبيهات د. رنا في ستارة الموبايل حتى عند قفل الشاشة</span>
              </div>
              <button
                type="button"
                className="notif-perm-btn"
                onClick={handleRequestPermission}
              >
                تفعيل الإشعارات الآن 🔔
              </button>
            </div>
          )}
          {permissionState === 'granted' && (
            <div className="notif-granted-strip">
              <div className="notif-granted-info">
                <span className="notif-live-indicator" />
                <span className="notif-granted-badge">إشعارات د. رنا نشطة على هاتفك 🩺</span>
              </div>
              <button
                type="button"
                className="notif-test-btn"
                onClick={handleTestExternalPush}
                disabled={isTestingPush}
                title="إرسال إشعار تجريبي فوري لهاتفك"
              >
                <CheckCircle2 size={13} />
                <span>{isTestingPush ? 'جارِ الإرسال...' : 'تجربة إشعار لهاتفي 📲'}</span>
              </button>
            </div>
          )}

          {testPushFeedback && (
            <div className={`notif-test-feedback-box is-${testPushFeedback.type}`}>
              <span>{testPushFeedback.text}</span>
            </div>
          )}

          {/* Notification List */}
          <div className="notif-list-container">
            {notifications.length === 0 ? (
              <div className="notif-empty-state">
                <div className="notif-empty-icon-wrap">
                  <Bell size={28} />
                </div>
                <strong className="notif-empty-title">لا توجد إشعارات جديدة حالياً</strong>
                <p className="notif-empty-desc">
                  سنخبرك فور نشر د. رنا لروشتتك الطبية أو أي تحديث لموعدك القادم.
                </p>
              </div>
            ) : (
              notifications.map((n: NotificationPublic) => (
                <div
                  key={n.id}
                  className={`notif-item-card ${!n.read ? 'is-unread' : 'is-read'}`}
                  onClick={() => handleItemClick(n)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="notif-item-icon-col">
                    {getNotificationIcon(n.type)}
                  </div>
                  <div className="notif-item-body">
                    <div className="notif-item-top">
                      <strong className="notif-item-title">{n.title}</strong>
                      <span className="notif-item-time">{formatRelativeTime(n.createdAt)}</span>
                    </div>
                    <p className="notif-item-text">{n.body}</p>
                    <div className="notif-item-meta">
                      {!n.read && <span className="notif-new-dot">جديد</span>}
                      {n.link && <span className="notif-link-hint">اضغطي للاطلاع والمتابعة ←</span>}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
