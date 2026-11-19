import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, CalendarDays, Clock3, Users } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ErrorState, Loading } from '../../../components/ui';
import { adminApi } from '../../../lib/portal-api';

const number = new Intl.NumberFormat('ar-EG');
const dayName = new Intl.DateTimeFormat('ar-EG', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  timeZone: 'UTC',
});
const dateLabel = (date: string) => dayName.format(new Date(date + 'T12:00:00Z'));

function hours(minutes: number) {
  const whole = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return [
    whole ? number.format(whole) + ' س' : '',
    remainder || !whole ? number.format(remainder) + ' د' : '',
  ]
    .filter(Boolean)
    .join(' ');
}

export function AdminAnalytics() {
  const [date, setDate] = useState('');
  const query = useQuery({
    queryKey: ['admin', 'analytics', date],
    queryFn: () => adminApi.analytics(date),
    refetchInterval: 30_000,
  });
  const data = query.data;
  const scheduled = data?.week.days.reduce((sum, day) => sum + day.scheduledMinutes, 0) ?? 0;
  const visitMinutes = data?.week.days.reduce((sum, day) => sum + day.visitMinutes, 0) ?? 0;
  const scheduledDays = data?.week.days.filter((day) => day.scheduledMinutes > 0).length ?? 0;
  const visitDays = data?.week.days.filter((day) => day.completed > 0).length ?? 0;
  const chartMax = Math.max(
    1,
    ...(data?.week.days.map((day) => Math.max(day.scheduledMinutes, day.visitMinutes)) ?? []),
  );

  return (
    <section className="admin-analytics" aria-labelledby="analytics-title">
      <header className="analytics-heading">
        <div>
          <h1 id="analytics-title">تحليلات العيادة</h1>
          <p>تابعي الحضور والحجوزات، وراجعي أوقات العمل والاشتراكات.</p>
        </div>
        <div className="analytics-filter">
          <label>
            يوم التقرير
            <input
              type="date"
              value={date || data?.date || ''}
              onChange={(event) => setDate(event.target.value)}
            />
          </label>
          {date && (
            <button type="button" onClick={() => setDate('')}>
              اليوم
            </button>
          )}
        </div>
      </header>

      {query.isPending ? (
        <Loading />
      ) : query.isError || !data ? (
        <ErrorState
          message={query.error?.message || 'تعذّر تحميل التحليلات.'}
          onRetry={() => void query.refetch()}
        />
      ) : (
        <>
          <h2 className="analytics-period">{dateLabel(data.date)}</h2>
          <div className="analytics-metrics">
            {[
              { label: 'زيارات مكتملة', value: data.day.completed, icon: Users },
              { label: 'طلبات وصلت في اليوم', value: data.day.received, icon: CalendarDays },
              { label: 'مواعيد مسجّلة لليوم', value: data.day.booked, icon: CalendarDays },
              { label: 'لم يحضروا', value: data.day.noShow, icon: Clock3 },
            ].map(({ label, value, icon: Icon }) => (
              <div className="analytics-metric" key={label}>
                <Icon size={19} aria-hidden="true" />
                <strong>{number.format(value)}</strong>
                <span>{label}</span>
              </div>
            ))}
          </div>

          <div className="analytics-columns">
            <section className="analytics-panel analytics-services">
              <header>
                <h2>الزيارات حسب الخدمة</h2>
              </header>
              {data.day.services.length ? (
                <table>
                  <thead>
                    <tr>
                      <th scope="col">الخدمة</th>
                      <th scope="col">مواعيد</th>
                      <th scope="col">مكتمل</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.day.services.map((service) => (
                      <tr key={service.id}>
                        <th scope="row">{service.title}</th>
                        <td>{number.format(service.booked)}</td>
                        <td>{number.format(service.completed)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>مفيش مواعيد مسجّلة في اليوم ده.</p>
              )}
              <p className="analytics-detail">
                {number.format(data.day.confirmed)} مؤكد · {number.format(data.day.pending)} قيد
                المراجعة
              </p>
              <Link to="/admin">
                المواعيد والحجوزات <ArrowLeft size={16} aria-hidden="true" />
              </Link>
            </section>

            <section className="analytics-panel analytics-workweek">
              <header>
                <h2>أوقات العمل خلال الأسبوع</h2>
                <p>
                  {dateLabel(data.weekStart)} – {dateLabel(data.weekEnd)}
                </p>
              </header>
              <dl className="analytics-week-totals">
                <div>
                  <dt>وقت العمل المجدول</dt>
                  <dd>
                    {hours(scheduled)} · {number.format(scheduledDays)} أيام
                  </dd>
                </div>
                <div>
                  <dt>مدة الزيارات المكتملة</dt>
                  <dd>
                    {hours(visitMinutes)} · {number.format(visitDays)} أيام فيها حضور
                  </dd>
                </div>
              </dl>
              <div className="analytics-chart" aria-label="أوقات العمل والزيارات حسب اليوم">
                {data.week.days.map((day) => (
                  <div className="analytics-chart-day" key={day.date}>
                    <span>{dateLabel(day.date)}</span>
                    <div className="analytics-bars" aria-hidden="true">
                      <i style={{ inlineSize: (day.scheduledMinutes / chartMax) * 100 + '%' }} />
                      <i style={{ inlineSize: (day.visitMinutes / chartMax) * 100 + '%' }} />
                    </div>
                    <span>
                      {hours(day.scheduledMinutes)} مجدول · {hours(day.visitMinutes)} زيارات
                    </span>
                  </div>
                ))}
              </div>
              <p className="analytics-detail">
                الساعات المجدولة من جدول المركز الحالي بعد خصم الاستراحات والإغلاقات.
                {data.demoSchedule && ' الجدول الحالي تجريبي.'}
                {' مدة الزيارات محسوبة من مدة الموعد المسجّلة.'}
              </p>
              <Link to="/admin/schedule">
                أوقات العمل <ArrowLeft size={16} aria-hidden="true" />
              </Link>
            </section>

            <section className="analytics-panel analytics-subscriptions">
              <header>
                <h2>الحجوزات والاشتراكات</h2>
              </header>
              <dl className="analytics-week-totals">
                <div>
                  <dt>طلبات حجز وصلت خلال الأسبوع</dt>
                  <dd>{number.format(data.week.received)}</dd>
                </div>
                <div>
                  <dt>اشتراكات بدأت خلال الأسبوع</dt>
                  <dd>{number.format(data.week.subscriptionsStarted)}</dd>
                </div>
                <div>
                  <dt>اشتراكات سارية اليوم</dt>
                  <dd>{number.format(data.week.subscriptionsActive)}</dd>
                </div>
              </dl>
              <Link to="/admin/patients">
                العملاء والاشتراكات <ArrowLeft size={16} aria-hidden="true" />
              </Link>
            </section>
          </div>
        </>
      )}
    </section>
  );
}
