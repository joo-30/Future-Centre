import type { DayHours, ScheduleData } from '@future/shared';
import { useQueryClient } from '@tanstack/react-query';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Coffee,
  Moon,
  Plus,
  Trash2,
  Zap,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '../../../components/ui';
import { DatePicker } from '../../../components/forms/DatePicker';
import { TimePicker } from '../../../components/forms/TimePicker';
import { timeLabel, today } from '../../../lib/api';
import { adminApi } from '../../../lib/portal-api';
import { Notice } from '../components/Notice';
import { refreshAdmin } from '../lib/cache';

const weekdays = ['الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت', 'الأحد'];

export function ScheduleEditor({ initial }: { initial: ScheduleData }) {
  const client = useQueryClient();
  const [hours, setHours] = useState(initial.hours);
  const [blocks, setBlocks] = useState(initial.blocks);
  const [demo, setDemo] = useState(initial.demoSchedule);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  function change(index: number, values: Partial<DayHours>) {
    setHours(hours.map((h, i) => (i === index ? { ...h, ...values } : h)));
  }

  // Calculate statistics
  const stats = useMemo(() => {
    let openCount = 0;
    let totalMinutes = 0;

    for (const h of hours) {
      if (h.open) {
        openCount++;
        const [sh, sm] = h.start.split(':').map(Number);
        const [eh, em] = h.end.split(':').map(Number);
        const dayMins = eh * 60 + em - (sh * 60 + sm);

        let breakMins = 0;
        for (const b of h.breaks) {
          const [bsh, bsm] = b.start.split(':').map(Number);
          const [beh, bem] = b.end.split(':').map(Number);
          breakMins += beh * 60 + bem - (bsh * 60 + bsm);
        }
        totalMinutes += Math.max(0, dayMins - breakMins);
      }
    }

    const totalHours = Math.round((totalMinutes / 60) * 10) / 10;
    const estimatedSlots = Math.floor(totalMinutes / 30);
    return { openCount, totalHours, estimatedSlots };
  }, [hours]);

  // Quick preset: Monday - Thursday 1:00 PM - 8:00 PM, No breaks
  const applyDoctorPreset = () => {
    setHours([
      { weekday: 1, open: true, start: '13:00', end: '20:00', breaks: [] },
      { weekday: 2, open: true, start: '13:00', end: '20:00', breaks: [] },
      { weekday: 3, open: true, start: '13:00', end: '20:00', breaks: [] },
      { weekday: 4, open: true, start: '13:00', end: '20:00', breaks: [] },
      { weekday: 5, open: false, start: '13:00', end: '20:00', breaks: [] },
      { weekday: 6, open: false, start: '13:00', end: '20:00', breaks: [] },
      { weekday: 7, open: false, start: '13:00', end: '20:00', breaks: [] },
    ]);
    setMessage('تم تطبيق جدول الدكتورة المعتمد (الاثنين إلى الخميس من 01:00 م إلى 08:00 م بدون استراحة). اضغطي حفظ لتأكيد التغيير.');
  };

  const clearAllBreaks = () => {
    setHours(hours.map((h) => ({ ...h, breaks: [] })));
    setMessage('تمت إزالة جميع الاستراحات من كافة الأيام.');
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    setMessage('');
    try {
      await adminApi.saveSchedule({ hours, blocks, demoSchedule: demo });
      refreshAdmin(client);
      setMessage('تم حفظ أوقات العمل وتحديث شبكة التوافر فوراً.');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={(e) => void submit(e)} className="schedule-form-modern">
      <fieldset disabled={busy}>
        {/* شريط الإحصائيات الأسبوعية */}
        <div className="schedule-metrics-grid">
          <div className="metric-box">
            <span className="metric-icon"><Calendar size={20} /></span>
            <div>
              <div className="metric-num">{stats.openCount} أيام</div>
              <div className="metric-label">أيام العمل الأسبوعية</div>
            </div>
          </div>
          <div className="metric-box">
            <span className="metric-icon"><Clock size={20} /></span>
            <div>
              <div className="metric-num">{stats.totalHours} ساعة</div>
              <div className="metric-label">ساعات العمل أسبوعياً</div>
            </div>
          </div>
          <div className="metric-box">
            <span className="metric-icon"><Clock size={20} /></span>
            <div>
              <div className="metric-num">~{stats.estimatedSlots} موعد</div>
              <div className="metric-label">السعة الاستيعابية أسبوعياً</div>
            </div>
          </div>
          <div className="metric-box status-box">
            <span className="metric-icon"><CheckCircle2 size={20} /></span>
            <div>
              <div className="metric-num">تكرار أسبوعي آلي</div>
              <div className="metric-label">تتجدد المواعيد تلقائياً كل أسبوع</div>
            </div>
          </div>
        </div>

        {/* عرض تقويم الأسبوع التفاعلي المودرن */}
        <section className="console-panel schedule-calendar-card">
          <div className="panel-heading between">
            <div>
              <h2>عرض تقويم الأسبوع التفاعلي</h2>
              <p>نظرة بانورامية سريعة على أيام العمل والعطلات. انقري على أي يوم لتبديل حالته.</p>
            </div>
            <span className="live-badge"><span className="live-dot" /> جدول مباشر</span>
          </div>

          <div className="weekly-calendar-strip">
            {hours.map((h, index) => {
              const name = weekdays[h.weekday - 1];
              return (
                <div
                  key={h.weekday}
                  className={`calendar-day-pill ${h.open ? 'is-open' : 'is-closed'}`}
                  onClick={() => change(index, { open: !h.open })}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      change(index, { open: !h.open });
                    }
                  }}
                  title={`انقري لتبديل حالة ${name} (${h.open ? 'مفتوح' : 'عطلة'})`}
                >
                  <div className="day-pill-top">
                    <span className="day-pill-name">{name}</span>
                    <span className={`day-status-dot ${h.open ? 'active' : ''}`} />
                  </div>
                  <div className="day-pill-badge">
                    {h.open ? 'يوم عمل' : 'عطلة أسبوعية'}
                  </div>
                  <div className="day-pill-time">
                    {h.open ? (
                      <>
                        <span>{timeLabel(h.start)}</span>
                        <span className="sep">-</span>
                        <span>{timeLabel(h.end)}</span>
                      </>
                    ) : (
                      <span className="closed-label"><Moon size={13} /> عطلة</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* أزرار الإعدادات السريعة */}
          <div className="schedule-presets-bar">
            <span className="preset-title"><Zap size={15} /> ضبط سريع:</span>
            <button
              type="button"
              className="preset-btn primary"
              onClick={applyDoctorPreset}
            >
              جدول الدكتورة المعتمد (الاثنين - الخميس · 01:00 م - 08:00 م)
            </button>
            <button
              type="button"
              className="preset-btn"
              onClick={clearAllBreaks}
            >
              <Coffee size={14} /> إزالة جميع الاستراحات
            </button>
          </div>
        </section>

        {/* إعدادات أيام الأسبوع بالتفصيل */}
        <section className="console-panel schedule-panel">
          <div className="panel-heading">
            <h2>إعدادات أيام العمل بالتفصيل</h2>
            <p>حددي أوقات البدء والانتهاء وفترات الاستراحة لكل يوم عمل.</p>
          </div>

          <div className="schedule-days-list">
            {hours.map((h, index) => (
              <div
                className={`schedule-day-item ${h.open ? 'is-active' : 'is-inactive'}`}
                key={h.weekday}
              >
                <div className="day-header-col">
                  <div className="day-title-wrap">
                    <h3>{weekdays[h.weekday - 1]}</h3>
                    <span className={`day-state-tag ${h.open ? 'open' : 'closed'}`}>
                      {h.open ? 'مفتوح للعمل' : 'عطلة أسبوعية'}
                    </span>
                  </div>
                  {/* Modern Toggle Switch */}
                  <label className="switch-toggle" title={h.open ? 'إغلاق هذا اليوم' : 'فتح هذا اليوم'}>
                    <input
                      type="checkbox"
                      checked={h.open}
                      onChange={(e) => change(index, { open: e.target.checked })}
                    />
                    <span className="switch-slider" />
                  </label>
                </div>

                {h.open ? (
                  <div className="day-controls-col">
                    <div className="time-range-row">
                      <div className="time-box">
                        <span className="time-box-label">
                          <Clock size={13} /> من (بداية اليوم)
                        </span>
                        <TimePicker
                          value={h.start}
                          onChange={(newTime) => change(index, { start: newTime })}
                        />
                      </div>

                      <span className="time-divider">إلى</span>

                      <div className="time-box">
                        <span className="time-box-label">
                          <Clock size={13} /> إلى (نهاية اليوم)
                        </span>
                        <TimePicker
                          value={h.end}
                          onChange={(newTime) => change(index, { end: newTime })}
                        />
                      </div>
                    </div>

                    {/* الاستراحات */}
                    <div className="day-breaks-row">
                      {h.breaks.length === 0 ? (
                        <span className="no-breaks-hint">
                          لا توجد استراحة (ساعات عمل متواصلة بدون توقف)
                        </span>
                      ) : (
                        h.breaks.map((b, bi) => (
                          <div className="break-chip" key={bi}>
                            <Coffee size={14} />
                            <span>استراحة:</span>
                            <TimePicker
                              value={b.start}
                              onChange={(newTime) =>
                                change(index, {
                                  breaks: h.breaks.map((v, i) =>
                                    i === bi ? { ...v, start: newTime } : v,
                                  ),
                                })
                              }
                            />
                            <span>إلى</span>
                            <TimePicker
                              value={b.end}
                              onChange={(newTime) =>
                                change(index, {
                                  breaks: h.breaks.map((v, i) =>
                                    i === bi ? { ...v, end: newTime } : v,
                                  ),
                                })
                              }
                            />
                            <button
                              type="button"
                              className="break-del-btn"
                              title="حذف الاستراحة"
                              onClick={() =>
                                change(index, {
                                  breaks: h.breaks.filter((_, i) => i !== bi),
                                })
                              }
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        ))
                      )}
                      <button
                        type="button"
                        className="add-break-btn"
                        onClick={() =>
                          change(index, {
                            breaks: [...h.breaks, { start: '15:00', end: '15:30' }],
                          })
                        }
                      >
                        <Plus size={13} /> إضافة استراحة
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="closed-day-message">
                    <Moon size={16} />
                    <span>هذا اليوم محدد كعطلة للمركز · لا تظهر فيه أي مواعيد للمرضى على الموقع</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* فترات محظورة بتاريخ محدد */}
        <section className="console-panel blocks-panel">
          <div className="panel-heading between">
            <div>
              <h2>فترات محظورة وتواريخ استثنائية (إجازات ومؤتمرات)</h2>
              <p>
                حجب يوم أو ساعات معينة بتاريخ محدد دون تغيير جدول الأسبوع الثابت.
              </p>
            </div>
            <Button
              type="button"
              icon={false}
              kind="outline"
              onClick={() =>
                setBlocks([
                  ...blocks,
                  { date: today(), start: '13:00', end: '15:00', reason: 'غير متاح' },
                ])
              }
            >
              <Plus size={16} />
              إضافة تاريخ إجازة
            </Button>
          </div>
          {blocks.length === 0 && (
            <p className="field-hint">لا توجد فترات محظورة أو إجازات استثنائية حالياً.</p>
          )}
          {blocks.map((b, i) => (
            <div className="blocked-period" key={i}>
              <div className="blocked-field">
                <span className="blocked-field-label">التاريخ</span>
                <DatePicker
                  value={b.date}
                  onChange={(newDate) =>
                    setBlocks(blocks.map((v, n) => (n === i ? { ...v, date: newDate } : v)))
                  }
                />
              </div>
              <div className="blocked-field">
                <span className="blocked-field-label">من</span>
                <TimePicker
                  value={b.start}
                  onChange={(newTime) =>
                    setBlocks(blocks.map((v, n) => (n === i ? { ...v, start: newTime } : v)))
                  }
                />
              </div>
              <div className="blocked-field">
                <span className="blocked-field-label">إلى</span>
                <TimePicker
                  value={b.end}
                  onChange={(newTime) =>
                    setBlocks(blocks.map((v, n) => (n === i ? { ...v, end: newTime } : v)))
                  }
                />
              </div>
              <div className="blocked-field">
                <span className="blocked-field-label">سبب الحظر (اختياري)</span>
                <input
                  value={b.reason}
                  maxLength={100}
                  placeholder="مثال: إجازة عيد، عطلة رسمية..."
                  onChange={(e) =>
                    setBlocks(
                      blocks.map((v, n) => (n === i ? { ...v, reason: e.target.value } : v)),
                    )
                  }
                />
              </div>
              <button
                type="button"
                className="link cancel-link"
                onClick={() => setBlocks(blocks.filter((_, n) => n !== i))}
              >
                حذف
              </button>
            </div>
          ))}
        </section>

        <label className="consent">
          <input type="checkbox" checked={demo} onChange={(e) => setDemo(e.target.checked)} />
          إظهار تنبيه في صفحة الحجز أن ساعات العمل تجريبية
        </label>
        <Notice message={error} error />
        <Notice message={message} />
        <div className="schedule-submit-bar">
          <Button disabled={busy}>{busy ? 'جاري الحفظ...' : 'حفظ جدول العمل والتوافر'}</Button>
        </div>
      </fieldset>
    </form>
  );
}
