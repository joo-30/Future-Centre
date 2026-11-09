import { useQuery } from '@tanstack/react-query';
import {
  Activity,
  BarChart3,
  BookOpen,
  Calendar,
  CreditCard,
  FileText,
  HeartPulse,
  History,
  Settings,
  Trash2,
  UserCheck,
} from 'lucide-react';
import { useState } from 'react';
import { ErrorState, Loading } from '../../../components/ui';
import { adminApi } from '../../../lib/portal-api';
import { ConsoleTitle } from '../components/ConsoleTitle';
import { SettingsEditor } from './SettingsEditor';

function getActionMeta(action: string) {
  if (action === 'article.save') {
    return { label: 'نشر / تعديل مقال', icon: BookOpen, tagClass: 'audit-tag-emerald' };
  }
  if (action === 'article.delete') {
    return { label: 'حذف مقال', icon: Trash2, tagClass: 'audit-tag-rose' };
  }
  if (action === 'service.save') {
    return { label: 'تحديث برنامج علاجي', icon: HeartPulse, tagClass: 'audit-tag-blue' };
  }
  if (action === 'settings.save') {
    return { label: 'تحديث إعدادات المركز', icon: Settings, tagClass: 'audit-tag-amber' };
  }
  if (action.includes('appointment.approve')) {
    return { label: 'اعتماد موعد مراجع', icon: Calendar, tagClass: 'audit-tag-teal' };
  }
  if (action.includes('appointment.cancel')) {
    return { label: 'إلغاء حجز موعد', icon: Calendar, tagClass: 'audit-tag-rose' };
  }
  if (action.includes('appointment.reschedule')) {
    return { label: 'تغيير موعد حجز', icon: Calendar, tagClass: 'audit-tag-cyan' };
  }
  if (action.includes('prescription')) {
    return { label: 'إنشاء روشتة طبية', icon: FileText, tagClass: 'audit-tag-indigo' };
  }
  if (action.includes('interest')) {
    return { label: 'متابعة طلب برنامج', icon: UserCheck, tagClass: 'audit-tag-cyan' };
  }
  if (action.includes('capacity')) {
    return { label: 'تحديث سعة الحجوزات', icon: BarChart3, tagClass: 'audit-tag-purple' };
  }
  if (action.includes('subscription')) {
    return { label: 'إدارة اشتراك مريض', icon: CreditCard, tagClass: 'audit-tag-teal' };
  }
  return { label: action, icon: Activity, tagClass: 'audit-tag-slate' };
}

function formatRelativeTime(dateStr: string) {
  try {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'الآن';
    if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    if (diffDays === 1) return 'أمس';
    if (diffDays < 7) return `منذ ${diffDays} أيام`;
  } catch {
    // fallback
  }

  return new Intl.DateTimeFormat('ar-EG', {
    timeZone: 'Africa/Cairo',
    month: 'short',
    day: 'numeric',
  }).format(new Date(dateStr));
}

export function AdminSettings() {
  const settingsQuery = useQuery({ queryKey: ['admin', 'settings'], queryFn: adminApi.settings });
  const audit = useQuery({ queryKey: ['admin', 'audit'], queryFn: adminApi.audit });

  const [filter, setFilter] = useState<'all' | 'article' | 'service' | 'settings' | 'clinical'>('all');

  const allEvents = audit.data?.events || [];
  const filteredEvents = allEvents.filter((e) => {
    if (filter === 'all') return true;
    if (filter === 'article') return e.action.startsWith('article');
    if (filter === 'service') return e.action.startsWith('service');
    if (filter === 'settings') return e.action.startsWith('settings');
    if (filter === 'clinical')
      return (
        e.action.startsWith('appointment') ||
        e.action.startsWith('prescription') ||
        e.action.startsWith('interest') ||
        e.action.startsWith('capacity') ||
        e.action.startsWith('subscription')
      );
    return true;
  });

  return (
    <>
      <ConsoleTitle
        title="إعدادات المركز والهوية"
        description="إدارة بيانات التواصل الرسمية، الموقع الجغرافي، وسياسة تسعير الخدمات عبر المنصة."
      />

      {settingsQuery.isPending ? (
        <Loading />
      ) : settingsQuery.error || !settingsQuery.data ? (
        <ErrorState message={settingsQuery.error?.message || 'تعذر تحميل الإعدادات.'} />
      ) : (
        <SettingsEditor settings={settingsQuery.data} />
      )}

      {/* Upgraded Audit Log Section */}
      <section className="audit-pro-section">
        <div className="audit-head-wrap">
          <div className="audit-title-block">
            <div className="audit-icon-ring">
              <History size={22} />
            </div>
            <div>
              <h2>سجل العمليات والتعديلات الإدارية (Audit Trail)</h2>
              <p>سجل زمني آمن يوثق كافة التعديلات والتغييرات التي تمت على محتوى وإعدادات المنصة.</p>
            </div>
          </div>

          <div className="audit-filter-pills">
            <button
              type="button"
              className={`audit-filter-pill ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              الكل ({allEvents.length})
            </button>
            <button
              type="button"
              className={`audit-filter-pill ${filter === 'article' ? 'active' : ''}`}
              onClick={() => setFilter('article')}
            >
              المقالات
            </button>
            <button
              type="button"
              className={`audit-filter-pill ${filter === 'service' ? 'active' : ''}`}
              onClick={() => setFilter('service')}
            >
              البرامج
            </button>
            <button
              type="button"
              className={`audit-filter-pill ${filter === 'settings' ? 'active' : ''}`}
              onClick={() => setFilter('settings')}
            >
              الإعدادات
            </button>
            <button
              type="button"
              className={`audit-filter-pill ${filter === 'clinical' ? 'active' : ''}`}
              onClick={() => setFilter('clinical')}
            >
              الحجوزات والسريري
            </button>
          </div>
        </div>

        {filteredEvents.length === 0 ? (
          <div className="audit-empty-card">
            <History size={32} />
            <p>لا توجد تعديلات مسجلة مطابقة لهذا التصنيف.</p>
          </div>
        ) : (
          <div className="audit-timeline-list">
            {filteredEvents.map((e) => {
              const meta = getActionMeta(e.action);
              const Icon = meta.icon;
              return (
                <div key={e._id} className="audit-timeline-item">
                  <div className={`audit-item-icon ${meta.tagClass}`}>
                    <Icon size={17} />
                  </div>

                  <div className="audit-item-details">
                    <div className="audit-item-top">
                      <span className={`audit-badge ${meta.tagClass}`}>{meta.label}</span>
                      <span className="audit-target-code" dir="ltr">
                        {e.target}
                      </span>
                    </div>
                    <span className="audit-action-raw" dir="ltr">
                      action: {e.action}
                    </span>
                  </div>

                  <div className="audit-item-time">
                    <span className="audit-relative-time">{formatRelativeTime(e.at)}</span>
                    <time className="audit-exact-time" dir="ltr">
                      {new Intl.DateTimeFormat('ar-EG', {
                        timeZone: 'Africa/Cairo',
                        dateStyle: 'short',
                        timeStyle: 'short',
                      }).format(new Date(e.at))}
                    </time>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}
