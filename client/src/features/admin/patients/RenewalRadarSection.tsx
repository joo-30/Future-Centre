import type { Subscription } from '@future/shared';
import {
  Bell,
  Calendar,
  FolderHeart,
  Leaf,
  Pencil,
  RotateCcw,
  Trash2,
} from 'lucide-react';
import { useMemo } from 'react';
import { StatusBadge } from '../../../components/StatusBadge';
import { WhatsAppIcon } from '../../../components/icons/WhatsAppIcon';
import {
  addDays,
  dateLabel,
  formatPrice,
  today,
  whatsappUrl,
} from '../../../lib/api';

export type SubFilterType = 'all' | 'expiring' | 'active' | 'completed';

export function RenewalRadarSection({
  subscriptions,
  onQuickRenew,
  onEdit,
  onHistory,
  onDelete,
  subFilter,
  setSubFilter,
}: {
  subscriptions: Subscription[];
  onQuickRenew: (s: Subscription) => void;
  onEdit: (s: Subscription) => void;
  onHistory: (patient: { identifier: string; name: string }) => void;
  onDelete: (s: Subscription) => void;
  subFilter: SubFilterType;
  setSubFilter: (filter: SubFilterType) => void;
}) {
  const in5Days = useMemo(() => addDays(today(), 5), []);

  const expiringSubscriptions = useMemo(() => {
    return subscriptions.filter((s) => {
      if (s.status !== 'active') return false;
      const isSessionsUrgent = (s.sessionsTotal - s.sessionsUsed) <= 1;
      const isDateUrgent = Boolean(s.endDate && s.endDate <= in5Days);
      return isSessionsUrgent || isDateUrgent;
    });
  }, [subscriptions, in5Days]);

  const filteredSubscriptions = useMemo(() => {
    if (subFilter === 'expiring') return expiringSubscriptions;
    if (subFilter === 'active') return subscriptions.filter((s) => s.status === 'active');
    if (subFilter === 'completed') return subscriptions.filter((s) => s.status === 'completed' || s.status === 'cancelled');
    return subscriptions;
  }, [subscriptions, expiringSubscriptions, subFilter]);

  return (
    <div className="renewal-radar-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' }}>
      {/* 1. Smart Subscription Renewal Radar Alert Banner */}
      {expiringSubscriptions.length > 0 && (
        <div className="renewal-radar-banner">
          <div className="renewal-radar-banner-right">
            <div className="renewal-radar-badge-icon">
              <Bell size={20} />
            </div>
            <div className="renewal-radar-banner-text">
              <strong>رادار تجديد الاشتراكات الذكي ({expiringSubscriptions.length} حالات تقترب من الانتهاء)</strong>
              <p>
                مرضى قارب رصيد جلساتهم على الانتهاء أو ستنتهي باقاتهم خلال 5 أيام. تابعي معهم فوراً عبر واتساب لتجديد الكورس بدون انقطاع.
              </p>
            </div>
          </div>

          <div className="renewal-radar-actions">
            <button
              type="button"
              className={`btn-radar-filter-toggle ${subFilter === 'expiring' ? 'is-active' : ''}`}
              onClick={() => setSubFilter(subFilter === 'expiring' ? 'all' : 'expiring')}
            >
              <Bell size={13} />
              <span>
                {subFilter === 'expiring'
                  ? 'عرض كافة الاشتراكات'
                  : `تصفية رادار التجديد فقط (${expiringSubscriptions.length})`}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* 2. Filter Pills Header — Placed Cleanly Above Cards */}
      <div className="sub-filter-pills-bar" role="tablist" aria-label="تصفية قائمة الاشتراكات">
        {[
          { id: 'all', label: 'كافة الاشتراكات', count: subscriptions.length },
          {
            id: 'expiring',
            label: '🔔 رادار التجديد',
            count: expiringSubscriptions.length,
            isUrgent: expiringSubscriptions.length > 0,
          },
          {
            id: 'active',
            label: 'سارية حالياً',
            count: subscriptions.filter((s) => s.status === 'active').length,
          },
          {
            id: 'completed',
            label: 'منتهية وملغية',
            count: subscriptions.filter((s) => s.status === 'completed' || s.status === 'cancelled').length,
          },
        ].map((pill) => {
          const isActive = subFilter === pill.id;
          return (
            <button
              key={pill.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`sub-filter-pill-btn ${isActive ? 'is-active' : ''} ${pill.isUrgent ? 'is-urgent' : ''}`}
              onClick={() => setSubFilter(pill.id as SubFilterType)}
            >
              <span>{pill.label}</span>
              <span className="sub-filter-count-chip">{pill.count}</span>
            </button>
          );
        })}
      </div>

      {/* Filter Status & Active Count Bar */}
      <div className="sub-filter-meta-bar">
        <span className="sub-filter-meta-text">
          {subFilter === 'all'
            ? `عرض كافة الاشتراكات المسجلة بالمركز (${filteredSubscriptions.length})`
            : subFilter === 'expiring'
            ? `تصفية رادار التجديد الذكي (${filteredSubscriptions.length} بحاجة لمتابعة التجديد)`
            : subFilter === 'active'
            ? `الاشتراكات السارية حالياً والمستمرة (${filteredSubscriptions.length})`
            : `الاشتراكات المنتهية والملغية (${filteredSubscriptions.length})`}
        </span>
        {subFilter !== 'all' && (
          <button
            type="button"
            className="sub-filter-reset-link"
            onClick={() => setSubFilter('all')}
          >
            عرض كافة الاشتراكات
          </button>
        )}
      </div>

      {/* 3. Empty State */}
      {!filteredSubscriptions.length && (
        <div style={{ padding: '36px 16px', textAlign: 'center', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
          <p style={{ margin: 0, fontWeight: 700, color: '#64748b', fontSize: '13.5px' }}>
            {subFilter === 'expiring'
              ? 'ممتاز! لا توجد اشتراكات قاربت على الانتهاء حالياً.'
              : 'لا توجد اشتراكات مسجلة في هذا القسم.'}
          </p>
        </div>
      )}

      {/* 4. Subscriptions Cards Grid */}
      <div className="admin-request-list" style={{ width: '100%' }}>
        {filteredSubscriptions.map((s) => {
          const isExpiring = expiringSubscriptions.some((item) => item.id === s.id);
          const remaining = Math.max(0, s.sessionsTotal - s.sessionsUsed);
          const daysLeft = s.endDate
            ? Math.ceil((new Date(s.endDate + 'T00:00:00').getTime() - new Date(today() + 'T00:00:00').getTime()) / (1000 * 60 * 60 * 24))
            : 99;

          return (
            <article
              key={s.id}
              className={`subscription-card-pro ${isExpiring ? 'sub-radar-highlight-card' : ''}`}
            >
              <div className="request-card-header">
                <div className="request-patient-profile">
                  <span className="request-avatar-circle">{s.name.slice(0, 1)}</span>
                  <div>
                    <div className="request-name-row">
                      <h3 className="request-patient-name">{s.name}</h3>
                      <span className={`user-type-tag ${s.userId ? 'is-user' : 'is-guest'}`}>
                        {s.userId ? 'حساب مريض' : 'اشتراك ضيف'}
                      </span>
                    </div>
                    <div className="request-patient-subtags">
                      <span className="request-date-tag">
                        <Calendar size={11} />
                        <span>{dateLabel(s.startDate)} — {dateLabel(s.endDate)}</span>
                      </span>
                    </div>
                  </div>
                </div>
                <StatusBadge status={s.status} />
              </div>

              {/* Urgency Strip for Expiring Subscriptions */}
              {isExpiring && (
                <div className="radar-urgency-strip">
                  <div className="radar-urgency-pill is-warning">
                    {remaining <= 0 ? (
                      <span className="radar-urgency-pill is-empty">⚠️ استهلك المريض كل الجلسات ({s.sessionsUsed}/{s.sessionsTotal})</span>
                    ) : remaining === 1 ? (
                      <span className="radar-urgency-pill is-warning">⚡ متبقي جلسة أخيرة واحدة فقط</span>
                    ) : (
                      <span>متبقي {remaining} جلسات</span>
                    )}
                    <span style={{ color: '#cbd5e1' }}>•</span>
                    {daysLeft <= 0 ? (
                      <span className="radar-urgency-pill is-expired">⏳ انتهت الصلاحية ({dateLabel(s.endDate)})</span>
                    ) : daysLeft <= 5 ? (
                      <span className="radar-urgency-pill is-days">⏳ تنتهي الصلاحية خلال {daysLeft} أيام</span>
                    ) : null}
                  </div>
                </div>
              )}

              <div className="request-card-body" style={{ margin: 0 }}>
                <div className="request-program-box">
                  <Leaf size={15} className="request-program-icon" />
                  <span className="request-program-title">{s.programTitle}</span>
                </div>

                <div className="subscription-ledger-pro">
                  <div className="ledger-sessions">
                    <span className="detail-label">الجلسات</span>
                    <strong>
                      {s.sessionsUsed} <small>/ {s.sessionsTotal} مستخدمة</small>
                    </strong>
                  </div>
                  <div className="ledger-price">
                    <span className="detail-label">السعر المتفق عليه</span>
                    <span className="detail-price-value">
                      {s.price !== null ? formatPrice(s.price) + ' ج.م' : 'غير محدد'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions Row Pro */}
              <div className="subscription-card-footer-pro">
                {isExpiring && (
                  <div style={{ display: 'flex', gap: '8px', width: '100%', flexWrap: 'wrap' }}>
                    <a
                      href={whatsappUrl(
                        s.phone || '',
                        `أهلاً بكِ أستاذة ${s.name} في مركز المستقبل للتغذية العلاجية د. رنا الشوري 🌿 نود تذكيركِ بأنه ${remaining === 1 ? 'متبقي لكِ جلسة واحدة' : remaining === 0 ? 'اكتملت جلساتكِ' : `متبقي لكِ ${remaining} جلسات`} في اشتراككِ الحالي (${s.programTitle}). هل ترغبين بتجديد الباقة لتثبيت مواعيدكِ القادمة؟ يسعدنا دائماً استمرار رحلتكِ الصحية معنا.`
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-radar-whatsapp-reminder"
                      title="فتح محادثة واتساب جاهزة لمراسلة المريض وتجديد الباقة"
                    >
                      <WhatsAppIcon size={14} />
                      <span>تذكير للتجديد عبر واتساب</span>
                    </a>

                    <button
                      type="button"
                      className="btn-radar-quick-renew"
                      onClick={() => onQuickRenew(s)}
                      title="تسجيل وتجديد باقة جديدة للمريض فوراً"
                    >
                      <RotateCcw size={14} />
                      <span>تجديد الباقة الآن</span>
                    </button>
                  </div>
                )}

                <div className="sub-card-actions-grid">
                  <button
                    type="button"
                    className="btn-sub-card-primary"
                    onClick={() =>
                      onHistory({
                        identifier: s.userId || s.phone || s.name,
                        name: s.name,
                      })
                    }
                  >
                    <FolderHeart size={14} />
                    <span>الملف الطبي</span>
                  </button>

                  <button
                    type="button"
                    className="btn-sub-card-outline"
                    onClick={() => onEdit(s)}
                  >
                    <Pencil size={13} />
                    <span>إدارة وجلسات</span>
                  </button>

                  <button
                    type="button"
                    className="btn-sub-card-delete"
                    onClick={() => onDelete(s)}
                    title="حذف هذا الاشتراك نهائياً"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
