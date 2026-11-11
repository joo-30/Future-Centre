import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  CalendarDays,
  CalendarRange,
  Check,
  CheckCircle2,
  Minus,
  Plus,
  RotateCcw,
  Zap,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { DatePicker } from '../../../components/forms/DatePicker';
import { Button, Loading, Modal } from '../../../components/ui';
import { dateLabel, shortDateLabel, today } from '../../../lib/api';
import { adminApi } from '../../../lib/portal-api';

const WEEKDAYS = [
  { id: 6, name: 'السبت', short: 'سبت' },
  { id: 7, name: 'الأحد', short: 'أحد' },
  { id: 1, name: 'الاثنين', short: 'اثنين' },
  { id: 2, name: 'الثلاثاء', short: 'ثلاثاء' },
  { id: 3, name: 'الأربعاء', short: 'أربعاء' },
  { id: 4, name: 'الخميس', short: 'خميس' },
  { id: 5, name: 'الجمعة', short: 'جمعة' },
] as const;

const COMMON_PRESETS = [5, 10, 15, 20, 25, 30] as const;

export function AdvancedCapacityModal({
  open,
  onClose,
  selectedAgendaDate,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  selectedAgendaDate: string;
  onSaved?: () => void;
}) {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<'weekly' | 'specific'>('weekly');

  const capacityQuery = useQuery({
    queryKey: ['admin', 'capacity', 14],
    queryFn: () => adminApi.capacity(14),
    enabled: open,
  });

  const dailyLimit = capacityQuery.data?.dailyLimit;
  const defaultLimit = dailyLimit?.maxPatients || 12;

  // Local state drafts for weekly limits
  const [weeklyDraft, setWeeklyDraft] = useState<Record<string, number>>({});
  const [targetDate, setTargetDate] = useState<string>(selectedAgendaDate || today());
  const [targetLimit, setTargetLimit] = useState<number>(defaultLimit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (dailyLimit) {
      const wLimits: Record<string, number> = {};
      WEEKDAYS.forEach((w) => {
        wLimits[String(w.id)] =
          dailyLimit.weekdayLimits?.[String(w.id)] ?? defaultLimit;
      });
      setWeeklyDraft(wLimits);

      // Target date draft
      const currentOverride = dailyLimit.dateOverrides?.[targetDate];
      const targetDayJs = new Date(targetDate + 'T12:00:00Z').getUTCDay();
      const targetDayLuxon = targetDayJs === 0 ? 7 : targetDayJs;
      const targetWeekdayVal = dailyLimit.weekdayLimits?.[String(targetDayLuxon)];

      setTargetLimit(currentOverride ?? targetWeekdayVal ?? defaultLimit);
    }
  }, [dailyLimit, defaultLimit, targetDate]);

  useEffect(() => {
    if (selectedAgendaDate) {
      setTargetDate(selectedAgendaDate);
    }
  }, [selectedAgendaDate]);

  const handleWeekdayChange = (weekdayId: number, val: number) => {
    const clamped = Math.max(1, Math.min(100, val));
    setWeeklyDraft((prev) => ({
      ...prev,
      [String(weekdayId)]: clamped,
    }));
  };

  const handleApplyAllWeekdays = (val: number) => {
    const wLimits: Record<string, number> = {};
    WEEKDAYS.forEach((w) => {
      wLimits[String(w.id)] = val;
    });
    setWeeklyDraft(wLimits);
  };

  const handleSaveWeekly = async () => {
    if (!dailyLimit) return;
    setSaving(true);
    try {
      await adminApi.saveCapacity({
        enabled: dailyLimit.enabled ?? true,
        showToPatients: dailyLimit.showToPatients ?? true,
        maxPatients: dailyLimit.maxPatients || 12,
        weekdayLimits: weeklyDraft,
        dateOverrides: dailyLimit.dateOverrides || {},
        closedMessage: dailyLimit.closedMessage,
      });
      await queryClient.invalidateQueries({ queryKey: ['admin', 'capacity'] });
      onSaved?.();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSpecificDate = async () => {
    if (!dailyLimit || !targetDate) return;
    setSaving(true);
    try {
      const currentOverrides = { ...(dailyLimit.dateOverrides || {}) };
      currentOverrides[targetDate] = targetLimit;

      await adminApi.saveCapacity({
        enabled: dailyLimit.enabled ?? true,
        showToPatients: dailyLimit.showToPatients ?? true,
        maxPatients: dailyLimit.maxPatients || 12,
        weekdayLimits: dailyLimit.weekdayLimits || {},
        dateOverrides: currentOverrides,
        closedMessage: dailyLimit.closedMessage,
      });
      await queryClient.invalidateQueries({ queryKey: ['admin', 'capacity'] });
      onSaved?.();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const handleResetSpecificDate = async () => {
    if (!dailyLimit || !targetDate) return;
    setSaving(true);
    try {
      const currentOverrides = { ...(dailyLimit.dateOverrides || {}) };
      delete currentOverrides[targetDate];

      await adminApi.saveCapacity({
        enabled: dailyLimit.enabled ?? true,
        showToPatients: dailyLimit.showToPatients ?? true,
        maxPatients: dailyLimit.maxPatients || 12,
        weekdayLimits: dailyLimit.weekdayLimits || {},
        dateOverrides: currentOverrides,
        closedMessage: dailyLimit.closedMessage,
      });
      await queryClient.invalidateQueries({ queryKey: ['admin', 'capacity'] });
      onSaved?.();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const isTargetDateOverridden = Boolean(dailyLimit?.dateOverrides?.[targetDate]);
  const weeklyTotal = Object.values(weeklyDraft).reduce((sum, v) => sum + v, 0);

  // Baseline limit for target date from weekly draft
  const targetDayJs = new Date(targetDate + 'T12:00:00Z').getUTCDay();
  const targetDayLuxon = targetDayJs === 0 ? 7 : targetDayJs;
  const targetBaseLimit =
    weeklyDraft[String(targetDayLuxon)] ??
    dailyLimit?.weekdayLimits?.[String(targetDayLuxon)] ??
    defaultLimit;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="تخطيط وتعيين سعة الكشوفات (الجدول الأسبوعي واليومي)"
    >
      <div className="advanced-capacity-modal-body">
        {/* Modern Segmented Navigation Tabs */}
        <div className="capacity-modal-tabs" role="tablist">
          <button
            type="button"
            className={`capacity-tab-btn ${tab === 'weekly' ? 'is-active' : ''}`}
            onClick={() => setTab('weekly')}
            role="tab"
            aria-selected={tab === 'weekly'}
          >
            <CalendarRange size={18} />
            <span>الخطة الأسبوعية التلقائية (أيام الأسبوع)</span>
          </button>
          <button
            type="button"
            className={`capacity-tab-btn ${tab === 'specific' ? 'is-active' : ''}`}
            onClick={() => setTab('specific')}
            role="tab"
            aria-selected={tab === 'specific'}
          >
            <CheckCircle2 size={18} />
            <span>سعة تاريخ استثنائي ({shortDateLabel(targetDate)})</span>
          </button>
        </div>

        {capacityQuery.isPending ? (
          <Loading />
        ) : tab === 'weekly' ? (
          <>
            {/* Executive Summary & Bulk Toolbar */}
            <div className="weekly-summary-toolbar">
              <div className="weekly-summary-left">
                <span className="wst-kpi-badge">
                  <CheckCircle2 size={16} />
                  إجمالي السعة الأسبوعية: <strong>{weeklyTotal} حالة</strong>
                </span>
                <p className="wst-desc">
                  حددي سعة كل يوم في الأسبوع مقدماً؛ تُطبّق تلقائياً كل أسبوع دون الحاجة لإعادة ضبطها يوماً بيوم.
                </p>
              </div>

              <div className="weekly-bulk-wrap">
                <span className="weekly-bulk-label">
                  <Zap size={14} />
                  تطبيق موحد للكل:
                </span>
                <div className="weekly-bulk-chips">
                  {[10, 15, 20, 25, 30].map((num) => (
                    <button
                      key={num}
                      type="button"
                      className="weekly-bulk-btn"
                      onClick={() => handleApplyAllWeekdays(num)}
                      title={`تعيين ${num} حالة لكل أيام الأسبوع`}
                    >
                      <span className="bulk-num">{num}</span>
                      <span className="bulk-unit"> حالة</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 7 Weekday Cards Grid */}
            <div className="weekly-capacity-container">
              {WEEKDAYS.map((w) => {
                const currentVal = weeklyDraft[String(w.id)] ?? defaultLimit;
                return (
                  <div key={w.id} className="weekly-day-card">
                    {/* Day Identification & Badge */}
                    <div className="weekly-day-badge-col">
                      <div className="weekly-day-name-row">
                        <span className="weekly-dot" />
                        <strong className="weekly-day-name">{w.name}</strong>
                      </div>
                      <span className="weekly-day-sub">
                        {currentVal} حالة كشف
                      </span>
                    </div>

                    {/* Quick Preset Buttons */}
                    <div className="weekly-quick-chips">
                      <span className="weekly-chips-label">سريعة:</span>
                      {COMMON_PRESETS.map((val) => (
                        <button
                          key={val}
                          type="button"
                          className={`weekly-chip-btn ${currentVal === val ? 'is-active' : ''}`}
                          onClick={() => handleWeekdayChange(w.id, val)}
                        >
                          {val}
                        </button>
                      ))}
                    </div>

                    {/* Tactile Stepper Box */}
                    <div className="weekly-stepper-wrap">
                      <button
                        type="button"
                        className="weekly-step-btn is-minus"
                        onClick={() =>
                          handleWeekdayChange(w.id, currentVal - 1)
                        }
                        aria-label={`إنقاص سعة يوم ${w.name}`}
                        title="إنقاص"
                      >
                        <Minus size={16} />
                      </button>

                      <input
                        type="number"
                        min={1}
                        max={100}
                        value={currentVal}
                        onChange={(e) =>
                          handleWeekdayChange(
                            w.id,
                            Number(e.target.value) || 1,
                          )
                        }
                        className="weekly-step-input"
                        dir="ltr"
                      />

                      <button
                        type="button"
                        className="weekly-step-btn is-plus"
                        onClick={() =>
                          handleWeekdayChange(w.id, currentVal + 1)
                        }
                        aria-label={`زيادة سعة يوم ${w.name}`}
                        title="زيادة"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Actions */}
            <div className="qcm-actions-row">
              <Button
                kind="primary"
                disabled={saving}
                onClick={handleSaveWeekly}
                className="qcm-btn-save"
              >
                <Check size={18} />
                <span>
                  {saving
                    ? 'جاري اعتماد الخطة...'
                    : 'اعتماد الخطة الأسبوعية الكاملة'}
                </span>
              </Button>
              <Button kind="outline" disabled={saving} onClick={onClose}>
                إلغاء
              </Button>
            </div>
          </>
        ) : (
          /* Specific Date Override View */
          <>
            <div className="specific-date-capacity-box">
              {/* Date Selection Row using Project Luxury Arabic DatePicker */}
              <div className="specific-date-header-card">
                <div className="specific-date-col">
                  <span className="specific-date-kicker">تاريخ الكشف الاستثنائي:</span>
                  <strong className="specific-date-display">
                    {dateLabel(targetDate, {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </strong>
                  <span className="specific-date-baseline">
                    السعة المعتمدة في الخطة الأسبوعية لهذا اليوم: <strong>{targetBaseLimit} حالة</strong>
                  </span>
                </div>

                <div className="specific-datepicker-container">
                  <span className="specific-picker-label">تغيير اليوم من التقويم:</span>
                  <DatePicker
                    value={targetDate}
                    onChange={(newDate) => {
                      if (newDate) setTargetDate(newDate);
                    }}
                  />
                </div>
              </div>

              {/* Status Alert Badge */}
              <div
                className={`specific-status-banner ${
                  isTargetDateOverridden ? 'is-custom' : 'is-default'
                }`}
              >
                {isTargetDateOverridden ? (
                  <>
                    <CheckCircle2 size={18} />
                    <span>
                      يوجد سعة استثنائية مخصصة لهذا اليوم: <strong>{targetLimit} حالة</strong> (تتجاوز خطة الأسبوع).
                    </span>
                  </>
                ) : (
                  <>
                    <CalendarDays size={18} />
                    <span>
                      هذا التاريخ يتبع تلقائياً سعة خطة الأسبوع (<strong>{targetBaseLimit} حالة</strong>). يمكنك تحديد سعة استثنائية له بالأسفل.
                    </span>
                  </>
                )}
              </div>

              {/* Capacity Stepper & Presets */}
              <div className="specific-controls-box">
                <span className="specific-controls-label">
                  حددي سعة الكشف المطلوبة لهذا اليوم بالتحديد:
                </span>

                <div className="specific-stepper-cluster">
                  <div className="specific-stepper-row">
                    <button
                      type="button"
                      className="specific-step-btn"
                      onClick={() => setTargetLimit((prev) => Math.max(1, prev - 1))}
                      aria-label="إنقاص"
                    >
                      <Minus size={20} />
                    </button>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={targetLimit}
                      onChange={(e) =>
                        setTargetLimit(
                          Math.max(1, Math.min(100, Number(e.target.value) || 1)),
                        )
                      }
                      className="specific-step-input"
                      dir="ltr"
                    />
                    <button
                      type="button"
                      className="specific-step-btn"
                      onClick={() => setTargetLimit((prev) => Math.min(100, prev + 1))}
                      aria-label="زيادة"
                    >
                      <Plus size={20} />
                    </button>
                    <span className="specific-stepper-unit">حالة كشف</span>
                  </div>

                  {/* Preset Pills */}
                  <div className="specific-preset-pills">
                    {[5, 10, 15, 20, 25, 30, 40].map((num) => (
                      <button
                        key={num}
                        type="button"
                        className={`specific-pill-btn ${targetLimit === num ? 'is-active' : ''}`}
                        onClick={() => setTargetLimit(num)}
                      >
                        <span className="pill-num">{num}</span>
                        <span className="pill-unit"> حالة</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions Row */}
            <div className="qcm-actions-row">
              <Button
                kind="primary"
                disabled={saving}
                onClick={handleSaveSpecificDate}
                className="qcm-btn-save"
              >
                <Check size={18} />
                <span>
                  {saving
                    ? 'جاري الحفظ...'
                    : `اعتماد سعة تاريخ (${dateLabel(targetDate, { day: 'numeric', month: 'short' })})`}
                </span>
              </Button>

              {isTargetDateOverridden && (
                <Button
                  kind="outline"
                  disabled={saving}
                  onClick={handleResetSpecificDate}
                  className="qcm-btn-revert"
                >
                  <RotateCcw size={16} />
                  <span>إلغاء التخصيص والعودة للخطة الأسبوعية ({targetBaseLimit} حالة)</span>
                </Button>
              )}

              <Button kind="outline" disabled={saving} onClick={onClose}>
                إلغاء
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
