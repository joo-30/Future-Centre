import {
  Activity,
  AlertCircle,
  Armchair,
  ArrowDownRight,
  ArrowUpRight,
  CalendarCheck,
  Check,
  Clock,
  Flame,
  Gauge,
  Info,
  Minus,
  Plus,
  RotateCcw,
  Save,
  ShieldCheck,
  Trash2,
  TrendingUp,
  Users,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, ErrorState, Loading } from '../../../components/ui';
import { DatePicker } from '../../../components/forms/DatePicker';
import { dateLabel } from '../../../lib/api';
import {
  adminApi,
  type DailyLimitData,
  type DayCapacityStat,
} from '../../../lib/portal-api';
import { ConsoleTitle } from '../components/ConsoleTitle';
import { Notice } from '../components/Notice';
import { CapacityAnalyticsCharts, RANGE_OPTIONS } from './CapacityAnalyticsCharts';

const WEEKDAYS = [
  { id: 6, name: 'السبت', short: 'سبت' },
  { id: 7, name: 'الأحد', short: 'أحد' },
  { id: 1, name: 'الاثنين', short: 'اثنين' },
  { id: 2, name: 'الثلاثاء', short: 'ثلاثاء' },
  { id: 3, name: 'الأربعاء', short: 'أربعاء' },
  { id: 4, name: 'الخميس', short: 'خميس' },
  { id: 5, name: 'الجمعة', short: 'جمعة' },
];

export function AdminCapacity() {
  const queryClient = useQueryClient();
  const [forecastDays, setForecastDays] = useState<number>(14);

  // Selected date to view & manage individually (e.g. 2026-11-16, 2026-12-12, etc.)
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedDayLimitDraft, setSelectedDayLimitDraft] = useState<number>(20);
  const [distantTargetDate, setDistantTargetDate] = useState<string | undefined>(undefined);
  const [showAllForecastRows, setShowAllForecastRows] = useState(false);

  const capacityQuery = useQuery({
    queryKey: ['admin', 'capacity', forecastDays, distantTargetDate],
    queryFn: () => adminApi.capacity(forecastDays, distantTargetDate),
    placeholderData: (prev) => prev,
  });

  const handleSelectDate = (date: string) => {
    setSelectedDate(date);
    const inUpcoming =
      capacityQuery.data?.upcomingDays?.some((d) => d.date === date) ||
      capacityQuery.data?.todayStats?.date === date;
    if (!inUpcoming && date) {
      setDistantTargetDate(date);
    } else {
      setDistantTargetDate(undefined);
    }
  };

  const [enabled, setEnabled] = useState(true);
  const [showToPatients, setShowToPatients] = useState(true);
  const [maxPatients, setMaxPatients] = useState(20);
  const [weekdayLimits, setWeekdayLimits] = useState<Record<string, number>>({});
  const [dateOverrides, setDateOverrides] = useState<Record<string, number>>({});
  const [closedMessage, setClosedMessage] = useState('');

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Sync state when capacity query data loads
  useEffect(() => {
    if (capacityQuery.data?.dailyLimit) {
      const dl = capacityQuery.data.dailyLimit;
      setEnabled(dl.enabled);
      setShowToPatients(dl.showToPatients !== false);
      setMaxPatients(dl.maxPatients || 20);
      setWeekdayLimits(dl.weekdayLimits || {});
      setDateOverrides(dl.dateOverrides || {});
      setClosedMessage(
        dl.closedMessage ||
          'عفواً، اكتمل الحد الأقصى للحجوزات لهذا اليوم لضمان أعلى جودة رعاية لكل مريض. يُرجى اختيار موعد في يوم آخر.'
      );
    }
  }, [capacityQuery.data]);

  // Default selected date to today when first loaded
  useEffect(() => {
    if (!selectedDate && capacityQuery.data?.todayStats?.date) {
      setSelectedDate(capacityQuery.data.todayStats.date);
    }
  }, [selectedDate, capacityQuery.data]);

  // Compute active stats for the currently selected date
  const todayStats = capacityQuery.data?.todayStats;
  const upcomingDays = capacityQuery.data?.upcomingDays || [];
  const targetDateStats = capacityQuery.data?.targetDateStats;

  const activeStats: DayCapacityStat = React.useMemo(() => {
    if (!selectedDate || !todayStats) {
      return (
        todayStats || {
          date: '',
          weekday: 1,
          bookedCount: 0,
          limit: maxPatients,
          remaining: maxPatients,
          percent: 0,
          isFull: false,
        }
      );
    }

    if (selectedDate === todayStats.date) {
      return todayStats;
    }

    const inUpcoming = upcomingDays.find((d) => d.date === selectedDate);
    if (inUpcoming) {
      return inUpcoming;
    }

    if (targetDateStats && targetDateStats.date === selectedDate) {
      return targetDateStats;
    }

    // Fallback for an arbitrary future date
    const targetDt = new Date(selectedDate + 'T12:00:00Z');
    const w = targetDt.getUTCDay() === 0 ? 7 : targetDt.getUTCDay();
    const limit = dateOverrides[selectedDate] || weekdayLimits[String(w)] || maxPatients;
    return {
      date: selectedDate,
      weekday: w,
      isOpen: true,
      bookedCount: 0,
      limit,
      remaining: limit,
      percent: 0,
      isFull: false,
      isCustomDate: Boolean(dateOverrides[selectedDate]),
      isCustomWeekday: Boolean(weekdayLimits[String(w)]),
    };
  }, [selectedDate, todayStats, upcomingDays, targetDateStats, dateOverrides, weekdayLimits, maxPatients]);

  // Keep draft in sync when active date changes
  useEffect(() => {
    if (activeStats?.limit) {
      setSelectedDayLimitDraft(activeStats.limit);
    }
  }, [activeStats.date, activeStats.limit]);

  // 1. Instant save of the General Default Limit
  const handleSaveGeneralLimit = async (newMax: number) => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const payload: DailyLimitData = {
        enabled,
        showToPatients,
        maxPatients: Number(newMax),
        weekdayLimits,
        dateOverrides,
        closedMessage: closedMessage.trim(),
      };
      await adminApi.saveCapacity(payload);
      setMaxPatients(newMax);
      setSuccess(`تم اعتماد (${newMax} حالة) كحد عام قياسي لجميع أيام العيادة بنجاح!`);
      await queryClient.invalidateQueries({ queryKey: ['admin', 'capacity'] });
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError((err as Error).message || 'تعذر اعتماد الحد العام.');
    } finally {
      setSaving(false);
    }
  };

  // Toggle patient visibility on /booking
  const handleToggleShowToPatients = async (newVal: boolean) => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const payload: DailyLimitData = {
        enabled,
        showToPatients: newVal,
        maxPatients: Number(maxPatients) || 20,
        weekdayLimits,
        dateOverrides,
        closedMessage: closedMessage.trim(),
      };
      await adminApi.saveCapacity(payload);
      setShowToPatients(newVal);
      setSuccess(
        newVal
          ? 'تم تفعيل إظهار سعة اليوم للمرضى في صفحة الحجز بنجاح!'
          : 'تم إخفاء سعة اليوم عن المرضى في صفحة الحجز بنجاح.'
      );
      await queryClient.invalidateQueries({ queryKey: ['admin', 'capacity'] });
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError((err as Error).message || 'تعذر تعديل إعدادات العرض.');
    } finally {
      setSaving(false);
    }
  };

  // 2. Instant save for a SPECIFIC DATE override
  const handleSaveSpecificDateLimit = async (date: string, newLimit: number) => {
    if (!date) return;
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const updatedOverrides = { ...dateOverrides, [date]: Number(newLimit) };
      const payload: DailyLimitData = {
        enabled,
        showToPatients,
        maxPatients: Number(maxPatients) || 20,
        weekdayLimits,
        dateOverrides: updatedOverrides,
        closedMessage: closedMessage.trim(),
      };
      await adminApi.saveCapacity(payload);
      setDateOverrides(updatedOverrides);
      setSuccess(`تم تخصيص سعة يوم ${dateLabel(date)} بـ (${newLimit} حالة) وحفظها بنجاح!`);
      await queryClient.invalidateQueries({ queryKey: ['admin', 'capacity'] });
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError((err as Error).message || 'تعذر حفظ سعة هذا اليوم.');
    } finally {
      setSaving(false);
    }
  };

  // 3. Instant reset for a SPECIFIC DATE override (restore to general default)
  const handleResetSpecificDateLimit = async (date: string) => {
    if (!date) return;
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const updatedOverrides = { ...dateOverrides };
      delete updatedOverrides[date];
      const payload: DailyLimitData = {
        enabled,
        showToPatients,
        maxPatients: Number(maxPatients) || 20,
        weekdayLimits,
        dateOverrides: updatedOverrides,
        closedMessage: closedMessage.trim(),
      };
      await adminApi.saveCapacity(payload);
      setDateOverrides(updatedOverrides);
      setSuccess(`تم إلغاء التخصيص وإرجاع يوم ${dateLabel(date)} للحد العام الافتراضي (${maxPatients} حالة).`);
      await queryClient.invalidateQueries({ queryKey: ['admin', 'capacity'] });
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError((err as Error).message || 'تعذر إلغاء تخصيص هذا اليوم.');
    } finally {
      setSaving(false);
    }
  };

  // 4. Save entire form (advanced settings & message)
  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const payload: DailyLimitData = {
        enabled,
        showToPatients,
        maxPatients: Number(maxPatients) || 20,
        weekdayLimits,
        dateOverrides,
        closedMessage: closedMessage.trim(),
      };

      await adminApi.saveCapacity(payload);
      setSuccess('تم حفظ جميع إعدادات السعة بنجاح!');
      await queryClient.invalidateQueries({ queryKey: ['admin', 'capacity'] });
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError((err as Error).message || 'تعذر حفظ إعدادات السعة.');
    } finally {
      setSaving(false);
    }
  };

  const handleWeekdayChange = (weekday: number, value: number | null) => {
    setWeekdayLimits((prev) => {
      const next = { ...prev };
      if (value === null || value <= 0) {
        delete next[String(weekday)];
      } else {
        next[String(weekday)] = value;
      }
      return next;
    });
  };

  if (capacityQuery.isPending) {
    return <Loading />;
  }

  if (capacityQuery.error || !capacityQuery.data) {
    return (
      <ErrorState
        message={capacityQuery.error?.message || 'تعذر تحميل بيانات السعة.'}
        onRetry={() => void capacityQuery.refetch()}
      />
    );
  }

  const isViewingToday = Boolean(todayStats && activeStats.date === todayStats.date);
  const activeDayOverride = dateOverrides[activeStats.date];
  const hasActiveOverrides = Object.keys(dateOverrides).length > 0;

  return (
    <div className="admin-capacity-page">
      <ConsoleTitle
        title="الحد اليومي وسعة العيادة"
        description="تحكم ذكي في السعة الاستيعابية اليومية لدكتورة د. رنا ياسر الشوري لمنع التكدس وضمان جودة الرعاية."
      />

      <Notice message={success} />
      <Notice message={error} error />

      {/* Sleek General Capacity Bar (Replaces bulky Image 3 Card) */}
      <div className="clinic-general-capacity-bar">
        <div className="cgc-left">
          <span className="cgc-label">السعة القياسية العامة (الديفولت):</span>
          <strong className="cgc-value">{maxPatients} حالة / يوم</strong>
          <span className="cgc-hint">(تسري تلقائياً على كل أيام عمل العيادة)</span>
        </div>
        <div className="cgc-right">
          {/* Patient Visibility Toggle */}
          <div className="capacity-patient-toggle" title="تفعيل أو تعطيل إظهار سعة الكشف للمرضى في صفحة الحجز">
            <span className="cpt-label">إظهار السعة للمرضى:</span>
            <button
              type="button"
              className={`cpt-toggle-btn ${showToPatients ? 'is-active' : ''}`}
              onClick={() => void handleToggleShowToPatients(!showToPatients)}
              disabled={saving}
            >
              <span className="cpt-slider" />
              <span className="cpt-text">{showToPatients ? 'مفعل للعميل 👁️' : 'مخفي 🔒'}</span>
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="cgc-quick-title">الديفولت:</span>
            <div className="cgc-presets">
              {[10, 15, 20, 25, 30].map((num) => (
                <button
                  key={num}
                  type="button"
                  className={`cgc-preset-btn ${maxPatients === num ? 'is-active' : ''}`}
                  onClick={() => void handleSaveGeneralLimit(num)}
                  disabled={saving}
                  title={`اعتماد ${num} حالة كديفولت قياسي لجميع الأيام`}
                >
                  {num} {num === 20 ? '⭐' : ''}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Date Picker Bar: Custom UI/UX Pro Max Arabic Calendar */}
      <div className="specific-date-picker-bar">
        <div className="picker-field">
          <label>
            <span style={{ fontWeight: 800 }}>اختاري أي تاريخ لمعاينة وتعديل سعته:</span>
          </label>
          <DatePicker
            value={selectedDate || todayStats?.date || ''}
            onChange={(newDate) => {
              if (newDate) handleSelectDate(newDate);
            }}
            minDate={todayStats?.date}
          />
        </div>

        <div className="quick-date-pills">
          <span className="quick-pills-label">اختصارات سريعة:</span>
          {todayStats && (
            <button
              type="button"
              className={`quick-pill-btn ${selectedDate === todayStats.date ? 'is-active' : ''}`}
              onClick={() => handleSelectDate(todayStats.date)}
            >
              اليوم ({todayStats.date.slice(5)})
            </button>
          )}
          {upcomingDays.slice(1, 5).map((d) => (
            <button
              key={d.date}
              type="button"
              className={`quick-pill-btn ${selectedDate === d.date ? 'is-active' : ''}`}
              onClick={() => handleSelectDate(d.date)}
            >
              {WEEKDAYS.find((w) => w.id === d.weekday)?.short || ''} ({d.date.slice(5)})
            </button>
          ))}
        </div>
      </div>

      {/* Hero Card: Dedicated Specific Date Customizer */}
      <section className="specific-date-customizer-card">
        <div className="sdc-header">
          <div className="sdc-title-group">
            <span className="sdc-kicker">
              <Activity size={14} />
              {isViewingToday ? 'معاينة وضبط سعة اليوم الحالي' : 'تخصيص وضبط سعة هذا التاريخ بالذات'}
            </span>
            <h3 className="sdc-title">
              {dateLabel(activeStats.date, {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </h3>
            <span className="sdc-date-code">{activeStats.date}</span>
          </div>

          <div className="sdc-status-group">
            <span
              className={`capacity-status-pill ${
                !activeStats.isOpen
                  ? 'is-closed'
                  : activeStats.isFull
                  ? 'is-full'
                  : 'is-available'
              }`}
            >
              {!activeStats.isOpen
                ? 'العيادة عطلة أسبوعية'
                : activeStats.isFull
                ? 'اكتملت حجوزات اليوم'
                : 'متاح لاستقبال حجوزات'}
            </span>

            {activeDayOverride !== undefined ? (
              <span className="sdc-override-badge">
                ⭐ سعة مخصصة لهذا التاريخ بالذات ({activeDayOverride} حالة)
              </span>
            ) : (
              <span className="sdc-default-badge">
                يتبع السعة الافتراضية العامة للعيادة ({maxPatients} حالة)
              </span>
            )}
          </div>
        </div>

        {/* Live Metrics for the Selected Date ("أفشخانات" & Rich Indicators) */}
        <div className="sdc-metrics-row">
          {/* 1. المحجوز في هذا اليوم */}
          <div className="sdc-metric">
            <div className="metric-top-bar">
              <span className="sdc-metric-lbl">المحجوز في هذا اليوم</span>
              <span className="metric-icon-circle bg-emerald-light">
                <Users size={15} />
              </span>
            </div>
            <strong className="sdc-metric-val text-forest">
              {activeStats.bookedCount} <small>مريض</small>
            </strong>
            <div className="metric-trend-pill-wrap">
              {activeStats.bookedCount === 0 ? (
                <span className="metric-trend-pill is-empty">
                  <span>🌱 لم تبدأ الحجوزات بعد</span>
                </span>
              ) : activeStats.isFull ? (
                <span className="metric-trend-pill is-full">
                  <Flame size={12} />
                  <span>ذروة الحجوزات (اكتمل)</span>
                </span>
              ) : (
                <span className="metric-trend-pill is-active">
                  <TrendingUp size={12} />
                  <span>{activeStats.bookedCount} حجز مسجل</span>
                </span>
              )}
            </div>
          </div>

          {/* 2. المقاعد المتبقية */}
          <div className="sdc-metric">
            <div className="metric-top-bar">
              <span className="sdc-metric-lbl">المقاعد المتبقية</span>
              <span className="metric-icon-circle bg-emerald-light">
                <Armchair size={15} />
              </span>
            </div>
            <strong className="sdc-metric-val text-emerald">
              {activeStats.remaining} <small>مقعد شاغر</small>
            </strong>
            <div className="metric-trend-pill-wrap">
              {activeStats.remaining === 0 ? (
                <span className="metric-trend-pill is-danger">
                  <AlertCircle size={12} />
                  <span>لا توجد مقاعد متاحة</span>
                </span>
              ) : activeStats.remaining <= 3 ? (
                <span className="metric-trend-pill is-warning">
                  <Clock size={12} />
                  <span>المقاعد الأخيرة تنفد (باقي {activeStats.remaining})</span>
                </span>
              ) : (
                <span className="metric-trend-pill is-positive">
                  <ArrowUpRight size={12} />
                  <span>متسع كافي ومتاح للحجز</span>
                </span>
              )}
            </div>
          </div>

          {/* 3. الحد الأقصى الحالي لليوم */}
          <div className="sdc-metric">
            <div className="metric-top-bar">
              <span className="sdc-metric-lbl">الحد الأقصى الحالي لليوم</span>
              <span className="metric-icon-circle bg-gold-light">
                <Gauge size={15} />
              </span>
            </div>
            <strong className="sdc-metric-val">
              {activeStats.limit} <small>حالة/يوم</small>
            </strong>
            <div className="metric-trend-pill-wrap">
              {activeStats.limit > maxPatients ? (
                <span className="metric-trend-pill is-boosted">
                  <ArrowUpRight size={12} />
                  <span>سعة موسعة (+{activeStats.limit - maxPatients} عن الديفولت) 🚀</span>
                </span>
              ) : activeStats.limit < maxPatients ? (
                <span className="metric-trend-pill is-reduced">
                  <ArrowDownRight size={12} />
                  <span>سعة مخفضة (-{maxPatients - activeStats.limit} عن الديفولت) ⚡</span>
                </span>
              ) : (
                <span className="metric-trend-pill is-neutral">
                  <ShieldCheck size={12} />
                  <span>السعة القياسية المنتظمة</span>
                </span>
              )}
            </div>
          </div>

          {/* 4. نسبة الإشغال */}
          <div className="sdc-metric">
            <div className="metric-top-bar">
              <span className="sdc-metric-lbl">نسبة الإشغال</span>
              <span className="metric-icon-circle bg-amber-light">
                <Activity size={15} />
              </span>
            </div>
            <strong className="sdc-metric-val text-gold">
              {activeStats.percent}%
            </strong>
            <div className="metric-mini-progress">
              <div
                className={`mini-progress-fill ${
                  activeStats.isFull
                    ? 'is-danger'
                    : activeStats.percent >= 75
                    ? 'is-warning'
                    : 'is-normal'
                }`}
                style={{ width: `${Math.min(100, activeStats.percent)}%` }}
              />
            </div>
            <div className="metric-trend-pill-wrap">
              {activeStats.percent === 0 ? (
                <span className="metric-trend-pill is-empty">عيادة شاغرة بالكامل (0%)</span>
              ) : activeStats.percent < 50 ? (
                <span className="metric-trend-pill is-positive">استيعاب هادئ ومريح ({activeStats.percent}%)</span>
              ) : activeStats.percent < 85 ? (
                <span className="metric-trend-pill is-warning">إقبال نشط ومستقر ({activeStats.percent}%)</span>
              ) : (
                <span className="metric-trend-pill is-danger">ضغط حجوزات مرتفع ({activeStats.percent}%)</span>
              )}
            </div>
          </div>
        </div>

        {/* Stepper & Action for the Selected Date */}
        <div className="sdc-controls-wrap">
          <span className="sdc-controls-title">
            حددي عدد الحالات المسموح بحجزها في تاريخ{' '}
            <span style={{ color: '#133a21', textDecoration: 'underline' }}>
              {dateLabel(activeStats.date, { day: 'numeric', month: 'long' })}
            </span>
            :
          </span>

          {/* Quick presets for this specific date */}
          <div className="sdc-presets-row">
            {[5, 10, 15, 20, 25, 30, 35, 40].map((num) => (
              <button
                key={num}
                type="button"
                className={`sdc-preset-pill ${selectedDayLimitDraft === num ? 'is-selected' : ''}`}
                onClick={() => setSelectedDayLimitDraft(num)}
              >
                {num} حالة
              </button>
            ))}
          </div>

          {/* Stepper */}
          <div className="sdc-stepper-row">
            <button
              type="button"
              className="stepper-btn minus"
              onClick={() => setSelectedDayLimitDraft((prev) => Math.max(1, prev - 1))}
              disabled={selectedDayLimitDraft <= 1}
              title="تقليل سعة هذا اليوم"
            >
              <Minus size={20} />
            </button>

            <div className="sdc-stepper-display">
              <span className="sdc-stepper-num">{selectedDayLimitDraft}</span>
              <span className="sdc-stepper-lbl">حالة مسموحة لهذا التاريخ بالذات</span>
            </div>

            <button
              type="button"
              className="stepper-btn plus"
              onClick={() => setSelectedDayLimitDraft((prev) => Math.min(100, prev + 1))}
              disabled={selectedDayLimitDraft >= 100}
              title="زيادة سعة هذا اليوم"
            >
              <Plus size={20} />
            </button>
          </div>

          {/* Actions */}
          <div className="sdc-actions-row">
            <button
              type="button"
              className="btn primary sdc-btn-save"
              onClick={() => void handleSaveSpecificDateLimit(activeStats.date, selectedDayLimitDraft)}
              disabled={saving}
            >
              <Save size={16} />
              <span>
                {saving
                  ? 'جاري الحفظ...'
                  : `اعتماد (${selectedDayLimitDraft} حالة) ليوم ${dateLabel(activeStats.date, {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'short',
                    })}`}
              </span>
            </button>

            {activeDayOverride !== undefined && (
              <button
                type="button"
                className="btn light sdc-btn-reset"
                onClick={() => void handleResetSpecificDateLimit(activeStats.date)}
                disabled={saving}
              >
                <RotateCcw size={14} />
                <span>إلغاء التخصيص وإرجاع اليوم للديفولت العام ({maxPatients} حالة)</span>
              </button>
            )}

            {!isViewingToday && todayStats && (
              <button
                type="button"
                className="btn light"
                style={{ borderRadius: '12px', minHeight: '44px', fontSize: '13px', fontWeight: 700 }}
                onClick={() => handleSelectDate(todayStats.date)}
              >
                <RotateCcw size={13} />
                <span>العودة لليوم الحالي</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Active Overrides Badge List (If any dates are customized) */}
      {hasActiveOverrides && (
        <div className="custom-dates-list-card">
          <div className="cdl-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CalendarCheck size={18} style={{ color: '#1a4e2c' }} />
              <strong style={{ fontSize: '14px', color: '#133921' }}>
                سجل الأيام المخصصة استثنائياً ({Object.keys(dateOverrides).length} يوم)
              </strong>
            </div>
            <small style={{ color: '#628061' }}>هذه الأيام لها سعة محددة تختلف عن الديفولت العام</small>
          </div>
          <div className="cdl-items-grid">
            {Object.entries(dateOverrides)
              .sort()
              .map(([dt, limit]) => (
                <div key={dt} className="cdl-item-chip">
                  <div
                    className="cdl-item-info"
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleSelectDate(dt)}
                    title="انقري لمعاينة وتعديل هذا اليوم"
                  >
                    <strong>{dateLabel(dt, { weekday: 'long', day: 'numeric', month: 'short' })}</strong>
                    <small>{dt}</small>
                  </div>
                  <div className="cdl-item-cap">
                    <span className="cdl-badge">{limit} حالة</span>
                    <button
                      type="button"
                      className="cdl-btn-remove"
                      onClick={() => void handleResetSpecificDateLimit(dt)}
                      title="إلغاء التخصيص وإرجاع اليوم للديفولت العام"
                      disabled={saving}
                    >
                      <Trash2 size={12} />
                      <span>إرجاع للديفولت</span>
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Interactive Visual Analytics Charts (UI/UX Pro Max) */}
      <CapacityAnalyticsCharts
        upcomingDays={upcomingDays}
        activeDate={activeStats.date}
        onSelectDate={(d) => handleSelectDate(d)}
        onEditDate={(d) => {
          handleSelectDate(d);
          const heroCard = document.querySelector('.specific-date-customizer-card');
          if (heroCard) {
            heroCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
            heroCard.classList.add('hero-focus-pulse');
            setTimeout(() => heroCard.classList.remove('hero-focus-pulse'), 1600);
          }
        }}
        maxPatientsDefault={maxPatients}
        forecastDays={forecastDays}
        onRangeChange={(days) => setForecastDays(days)}
      />

      {/* Forecast Rolling Calendar Card (Main Visual List) */}
      <div className="capacity-forecast-card">
        <div className="forecast-header">
          <div>
            <h3>توقعات الإشغال للأيام القادمة</h3>
            <p>انقري على أي يوم لمعاينته والتحكم في سعته بالبطاقة العلوية</p>
          </div>
          <div className="forecast-range-pills" role="tablist">
            {RANGE_OPTIONS.map((opt) => (
              <button
                key={opt.days}
                type="button"
                className={`forecast-range-btn ${forecastDays === opt.days ? 'is-active' : ''}`}
                onClick={() => setForecastDays(opt.days)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Rolling Window Explanatory Banner */}
        <div className="forecast-rolling-notice">
          <Activity size={14} className="notice-icon" />
          <span>
            <strong>تفاعل مباشر:</strong> النقر على أي يوم يحدده فوراً في البطاقة العلوية لتعديل سعته بنقرة واحدة (المدى الحالي: {upcomingDays.length} يوماً).
          </span>
        </div>

        <div className="forecast-list">
          {(showAllForecastRows || upcomingDays.length <= 15
            ? upcomingDays
            : upcomingDays.slice(0, 15)
          ).map((day) => {
            const dayName = WEEKDAYS.find((w) => w.id === day.weekday)?.name || '';
            const isSelected = day.date === activeStats.date;
            const hasOverride = dateOverrides[day.date] !== undefined || day.isCustomDate;

            return (
              <div
                key={day.date}
                role="button"
                tabIndex={0}
                onClick={() => handleSelectDate(day.date)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSelectDate(day.date);
                  }
                }}
                className={`forecast-day-row ${
                  !day.isOpen ? 'is-closed' : day.isFull ? 'is-full' : ''
                } ${isSelected ? 'is-selected' : ''}`}
                title={`انقري لمعاينة وتخصيص سعة يوم ${dayName} (${day.date})`}
              >
                <div className="forecast-day-info">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <strong>{dayName}</strong>
                    {isSelected && <Check size={14} style={{ color: '#235c36' }} />}
                  </div>
                  <small>{day.date}</small>
                  {hasOverride && (
                    <span className="forecast-override-pill" style={{ marginTop: '4px', width: 'fit-content' }}>
                      ⭐ مخصص: {day.limit} حالة
                    </span>
                  )}
                </div>

                {!day.isOpen ? (
                  <span className="forecast-closed-pill">العيادة عطلة</span>
                ) : (
                  <div className="forecast-day-metrics">
                    <div className="forecast-numbers">
                      <strong>
                        {day.bookedCount} / {day.limit} <small>مريض</small>
                      </strong>
                      <span
                        className={`forecast-load-badge ${
                          day.isFull
                            ? 'load-full'
                            : day.percent >= 75
                            ? 'load-warning'
                            : 'load-normal'
                        }`}
                      >
                        {day.isFull ? 'اكتمل' : `${day.remaining} متاح`}
                      </span>
                    </div>
                    <div className="forecast-bar-track">
                      <div
                        className={`forecast-bar-fill ${
                          day.isFull
                            ? 'bg-danger'
                            : day.percent >= 75
                            ? 'bg-warning'
                            : 'bg-emerald'
                        }`}
                        style={{ width: `${Math.min(100, day.percent)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {upcomingDays.length > 15 && (
          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <button
              type="button"
              className="btn light"
              style={{
                borderRadius: '12px',
                fontSize: '13px',
                fontWeight: 700,
                padding: '10px 24px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              }}
              onClick={() => setShowAllForecastRows((prev) => !prev)}
            >
              {showAllForecastRows
                ? 'طي القائمة (عرض أول 15 يوماً فقط) ⬆️'
                : `عرض باقي الأيام بالكامل (عرض جميع الـ ${upcomingDays.length} يوماً) ⬇️`}
            </button>
          </div>
        )}
      </div>

      {/* Advanced Settings & Closed Notice Accordion */}
      <form onSubmit={handleSave}>
        <details className="advanced-weekly-accordion">
          <summary>
            ⚙️ إعدادات إضافية: رسالة اكتمال اليوم وقواعد الأسبوع المكررة (اختياري)
          </summary>
          <div className="advanced-weekly-body">
            {/* Client Notice Message */}
            <div className="client-message-block" style={{ borderTop: 'none', paddingTop: 0 }}>
              <label className="message-field-label">
                <strong>رسالة العميل عند اكتمال حجوزات اليوم:</strong>
                <span className="field-subtext">تظهر للمريض عند محاولة الحجز في يوم وصل للحد الأقصى</span>
              </label>
              <textarea
                className="client-message-textarea"
                rows={2}
                value={closedMessage}
                onChange={(e) => setClosedMessage(e.target.value)}
                placeholder="اكتمل الحد الأقصى للحجوزات لهذا اليوم..."
              />
              <div className="client-message-preview">
                <div className="preview-bubble-header">
                  <AlertCircle size={14} />
                  <span>معاينة ما يراه المريض على هاتفه:</span>
                </div>
                <p className="preview-bubble-text">{closedMessage}</p>
              </div>
            </div>

            {/* Weekly Rules */}
            <div
              style={{
                background: '#f8faf6',
                border: '1px solid #dbe6d6',
                borderRadius: '10px',
                padding: '10px 14px',
                margin: '16px 0',
                fontSize: '12px',
                color: '#2a5839',
                lineHeight: 1.5,
              }}
            >
              <Info size={14} style={{ display: 'inline', marginLeft: '6px', verticalAlign: 'text-bottom' }} />
              <strong>تنبيه:</strong> هذا الخيار يحدد قاعدة دائمة مكررة طوال العام (مثلاً جعل كل أيام الاثنين دائماً 15 حالة). لتعديل يوم معين بتاريخه، استخدمي بطاقة <strong>"تخصيص سعة تاريخ محدد"</strong> بالأعلى.
            </div>

            <div className="weekday-cards-grid">
              {WEEKDAYS.map((w) => {
                const customVal = weekdayLimits[String(w.id)];
                const isCustom = customVal !== undefined;
                const currentVal = isCustom ? customVal : maxPatients;

                return (
                  <div
                    key={w.id}
                    className={`weekday-limit-card ${isCustom ? 'is-custom' : ''}`}
                  >
                    <div className="weekday-card-top">
                      <div className="weekday-identity">
                        <span className="weekday-avatar">{w.short}</span>
                        <div className="weekday-names">
                          <strong className="weekday-name">{w.name}</strong>
                          <span className={`weekday-status-pill ${isCustom ? 'is-custom' : 'is-default'}`}>
                            {isCustom ? 'قاعدة مخصصة أسبوعياً' : 'يتبع الحد العام'}
                          </span>
                        </div>
                      </div>

                      {isCustom ? (
                        <button
                          type="button"
                          className="weekday-reset-btn"
                          onClick={() => handleWeekdayChange(w.id, null)}
                          title="إلغاء التخصيص واستخدام الحد العام"
                        >
                          <RotateCcw size={12} />
                          <span>إلغاء القاعدة</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="weekday-customize-btn"
                          onClick={() => handleWeekdayChange(w.id, maxPatients)}
                          title="تخصيص حد لهذا اليوم أسبوعياً"
                        >
                          <span>تخصيص أسبوعي</span>
                        </button>
                      )}
                    </div>

                    <div className="weekday-control-row">
                      <button
                        type="button"
                        className="weekday-stepper-btn minus"
                        onClick={() =>
                          handleWeekdayChange(w.id, Math.max(1, currentVal - 1))
                        }
                        disabled={currentVal <= 1}
                        title="تقليل حد هذا اليوم"
                      >
                        <Minus size={15} />
                      </button>

                      <div className="weekday-val-box">
                        <span className="weekday-val-num">{currentVal}</span>
                        <span className="weekday-val-unit">حالة / أسبوعياً</span>
                      </div>

                      <button
                        type="button"
                        className="weekday-stepper-btn plus"
                        onClick={() =>
                          handleWeekdayChange(w.id, Math.min(50, currentVal + 1))
                        }
                        disabled={currentVal >= 50}
                        title="زيادة حد هذا اليوم"
                      >
                        <Plus size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Save Button for Advanced Settings */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
              <Button
                type="submit"
                icon={false}
                kind="primary"
                disabled={saving}
                className="capacity-save-btn"
              >
                <Save size={16} />
                <span>{saving ? 'جاري الحفظ...' : 'حفظ الإعدادات الإضافية'}</span>
              </Button>
            </div>
          </div>
        </details>
      </form>
    </div>
  );
}
