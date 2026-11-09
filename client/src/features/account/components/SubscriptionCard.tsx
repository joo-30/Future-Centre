import { type Subscription } from '@future/shared';
import { StatusBadge } from '../../../components/StatusBadge';
import { dateLabel, formatPrice, today } from '../../../lib/api';

export function SubscriptionCard({ s }: { s: Subscription }) {
  const remaining = s.sessionsTotal - s.sessionsUsed;
  const expired = s.endDate < today() && ['active', 'paused'].includes(s.status);
  return (
    <article className="subscription-card">
      <div className="between">
        <span className="kicker">برنامجك مع المركز</span>
        {expired ? (
          <span className="state-badge">انتهت المدة</span>
        ) : (
          <StatusBadge status={s.status} />
        )}
      </div>
      <h3>{s.programTitle}</h3>
      <div className="session-count">
        <strong>{remaining}</strong>
        <span>
          جلسات متبقية <small>من أصل {s.sessionsTotal} جلسات</small>
        </span>
      </div>
      <progress value={s.sessionsUsed} max={s.sessionsTotal} aria-label="الجلسات المستخدمة" />
      <div className="subscription-facts">
        <span>
          من {dateLabel(s.startDate, { day: 'numeric', month: 'short' })} إلى{' '}
          {dateLabel(s.endDate, { day: 'numeric', month: 'short', year: 'numeric' })}
        </span>
        <span>
          {s.price !== null
            ? `${formatPrice(s.price)} ج.م · قيمة البرنامج`
            : 'السعر يحدد مع المركز'}
        </span>
      </div>
    </article>
  );
}
