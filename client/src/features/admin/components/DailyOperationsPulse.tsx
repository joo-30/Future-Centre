import {
  Bell,
  Coins,
  Stethoscope,
  TrendingUp,
  Activity,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Overview } from '../../../lib/portal-api';
import { formatPrice } from '../../../lib/api';

export function DailyOperationsPulse({
  overview,
}: {
  overview?: Overview;
}) {
  const totalRevenue = overview?.totalDailyRevenue || 0;
  const apptRevenue = overview?.todayRevenue || 0;
  const subRevenue = overview?.todaySubscriptionRevenue || 0;

  const todayTotal = overview?.todayTotal || 0;
  const todayCompleted = overview?.todayCompleted || 0;
  const todayConfirmed = overview?.todayConfirmed || 0;

  const activeSubs = overview?.activeSubscriptionsCount || 0;
  const expiringSubs = overview?.expiringSubscriptionsCount || 0;

  const pendingRequests = (overview?.pending || 0) + (overview?.newInterests || 0) + (overview?.changes || 0);

  const completionPercent = todayTotal > 0 ? Math.round((todayCompleted / todayTotal) * 100) : 0;

  return (
    <section className="daily-pulse-container" aria-label="شريط النبض التشغيلي والمالي لليوم">
      <div className="daily-pulse-header">
        <div className="daily-pulse-title-wrap">
          <div className="daily-pulse-icon-box">
            <Activity size={16} />
          </div>
          <div>
            <h3 className="daily-pulse-heading">النبض المالي والتشغيلي لليوم</h3>
            <span className="daily-pulse-subtitle">
              متابعة الإيرادات وحالات العيادة اللحظية بدون حسابات يدوية
            </span>
          </div>
        </div>

        <div className="daily-pulse-live-badge">
          <span className="pulse-dot-indicator" />
          <span>تحديث مباشر للنظام</span>
        </div>
      </div>

      <div className="daily-pulse-grid">
        {/* Card 1: Daily Revenue */}
        <div className="daily-pulse-card">
          <div className="daily-pulse-card-top">
            <span className="daily-card-label">إجمالي إيراد اليوم التقديري</span>
            <span className="daily-card-icon-pill is-revenue">
              <Coins size={17} />
            </span>
          </div>

          <div>
            <div className="daily-card-value-wrap">
              <span className="daily-card-metric">{formatPrice(totalRevenue)}</span>
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#047857' }}>ج.م</span>
            </div>
            <p className="daily-card-subtext" style={{ marginTop: '4px' }}>
              {formatPrice(apptRevenue)} ج.م كشوفات • {formatPrice(subRevenue)} ج.م باقات جديدة
            </p>
          </div>
        </div>

        {/* Card 2: Consultations & Attendance */}
        <div className="daily-pulse-card">
          <div className="daily-pulse-card-top">
            <span className="daily-card-label">حالات وجلسات اليوم بالعيادة</span>
            <span className="daily-card-icon-pill is-appointments">
              <Stethoscope size={17} />
            </span>
          </div>

          <div>
            <div className="daily-card-value-wrap">
              <span className="daily-card-metric">{todayTotal}</span>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#64748b' }}>حالة مجدولة</span>
            </div>
            <p className="daily-card-subtext" style={{ marginTop: '4px' }}>
              {todayCompleted} حضروا بالفعل • {todayConfirmed} بانتظار الحضور
            </p>
            <div className="daily-card-progress-wrap" title={`نسبة الحضور: ${completionPercent}%`}>
              <div
                className="daily-card-progress-bar"
                style={{ width: `${Math.min(100, completionPercent)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 3: Subscriptions & Renewal Radar */}
        <div className="daily-pulse-card">
          <div className="daily-pulse-card-top">
            <span className="daily-card-label">الاشتراكات النشطة ورادار التجديد</span>
            <span className="daily-card-icon-pill is-subs">
              <TrendingUp size={17} />
            </span>
          </div>

          <div>
            <div className="daily-card-value-wrap">
              <span className="daily-card-metric">{activeSubs}</span>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#64748b' }}>باقة سارية</span>
            </div>

            <div style={{ marginTop: '6px' }}>
              {expiringSubs > 0 ? (
                <Link
                  to="/admin/patients?tab=subscriptions&radar=expiring"
                  className="pulse-radar-alert-pill"
                  title="الانتقال إلى قائمة الاشتراكات القاربة على الانتهاء لمراسلتهم على واتساب"
                >
                  <span>⚠️ {expiringSubs} بحاجة لتجديد الباقة</span>
                  <ArrowLeft size={11} />
                </Link>
              ) : (
                <span className="pulse-radar-healthy-pill">
                  <CheckCircle2 size={12} />
                  <span>كل الاشتراكات منتظمة وسارية</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Card 4: Inbound Inquiries & Pending */}
        <div className="daily-pulse-card">
          <div className="daily-pulse-card-top">
            <span className="daily-card-label">طلبات واردة بحاجة لاتخاذ قرار</span>
            <span className="daily-card-icon-pill is-requests">
              <Bell size={17} />
            </span>
          </div>

          <div>
            <div className="daily-card-value-wrap">
              <span className="daily-card-metric">{pendingRequests}</span>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#64748b' }}>طلب جديد</span>
            </div>
            <p className="daily-card-subtext" style={{ marginTop: '4px' }}>
              {overview?.pending || 0} حجز بانتظار الاعتماد • {overview?.changes ? `${overview.changes} تغيير وقت • ` : ''}{overview?.newInterests || 0} استفسار برنامج
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
