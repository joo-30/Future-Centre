import {
  Check,
  ChevronDown,
  Clock,
  Moon,
  SlidersHorizontal,
  Sun,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

// Evening slots: 12:00 PM to 11:30 PM (Clinic working hours like 1:00 PM - 8:00 PM are here)
const eveningSlots = [
  '12:00',
  '12:30',
  '13:00',
  '13:30',
  '14:00',
  '14:30',
  '15:00',
  '15:30',
  '16:00',
  '16:30',
  '17:00',
  '17:30',
  '18:00',
  '18:30',
  '19:00',
  '19:30',
  '20:00',
  '20:30',
  '21:00',
  '21:30',
  '22:00',
  '22:30',
  '23:00',
  '23:30',
];

// Morning slots: 08:00 AM to 11:30 AM
const morningSlots = [
  '08:00',
  '08:30',
  '09:00',
  '09:30',
  '10:00',
  '10:30',
  '11:00',
  '11:30',
];

export function formatTimeArabic(t: string): string {
  if (!t || !t.includes(':')) return '--:--';
  const [hStr, mStr] = t.split(':');
  const h = Number(hStr) || 0;
  const m = Number(mStr) || 0;
  const period = h >= 12 ? 'م' : 'ص';
  const h12 = h % 12 || 12;
  const hFormatted = String(h12).padStart(2, '0');
  const mFormatted = String(m).padStart(2, '0');
  return `${hFormatted}:${mFormatted} ${period}`;
}

interface TimePickerProps {
  value: string; // "HH:MM" (24h)
  onChange: (val: string) => void;
  name?: string;
  className?: string;
  disabled?: boolean;
}

export function TimePicker({
  value,
  onChange,
  name,
  className = '',
  disabled = false,
}: TimePickerProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse current value
  const parsed = useMemo(() => {
    const raw = value || '13:00';
    const [hStr, mStr] = raw.split(':');
    const h = Number(hStr) || 0;
    const m = Number(mStr) || 0;
    const isPM = h >= 12;
    const h12 = h % 12 || 12;
    return {
      h24: h,
      minute: m,
      isPM,
      h12,
      period: isPM ? ('PM' as const) : ('AM' as const),
    };
  }, [value]);

  // Active tab: 'evening' (مساءً), 'morning' (صباحاً), 'exact' (تحديد دقيق)
  const [tab, setTab] = useState<'evening' | 'morning' | 'exact'>(
    parsed.isPM ? 'evening' : 'morning',
  );

  // Exact picker local state
  const [exactHour, setExactHour] = useState<number>(parsed.h12);
  const [exactMinute, setExactMinute] = useState<number>(parsed.minute);
  const [exactPeriod, setExactPeriod] = useState<'PM' | 'AM'>(parsed.period);

  // Sync tab and exact state when value changes externally or when opened
  useEffect(() => {
    if (open) {
      setTab(parsed.isPM ? 'evening' : 'morning');
      setExactHour(parsed.h12);
      setExactMinute(parsed.minute);
      setExactPeriod(parsed.period);
    }
  }, [open, parsed.h12, parsed.minute, parsed.period, parsed.isPM]);

  // Click outside listener
  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
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

  // Select slot directly
  const selectSlot = (slot: string) => {
    onChange(slot);
    setOpen(false);
  };

  // Apply exact time
  const applyExact = () => {
    let h24 = exactHour % 12;
    if (exactPeriod === 'PM') h24 += 12;
    const hStr = String(h24).padStart(2, '0');
    const mStr = String(exactMinute).padStart(2, '0');
    onChange(`${hStr}:${mStr}`);
    setOpen(false);
  };

  const formattedLabel = formatTimeArabic(value || '13:00');

  return (
    <div
      className={`custom-timepicker-wrap ${open ? 'is-open' : ''} ${className}`}
      ref={containerRef}
      style={{ position: 'relative', zIndex: open ? 9999 : 1 }}
    >
      {name && <input type="hidden" name={name} value={value} />}
      {/* Trigger Button */}
      <button
        type="button"
        className={`custom-timepicker-trigger ${open ? 'is-active' : ''}`}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (!disabled) setOpen(!open);
        }}
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span className="time-trigger-icon">
          <Clock size={15} />
        </span>
        <span className="time-trigger-text">{formattedLabel}</span>
        <span className="time-trigger-arrow">
          <ChevronDown size={14} />
        </span>
      </button>

      {/* Luxury Floating Time Popover */}
      {open && (
        <>
          <div
            className="custom-datepicker-backdrop"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setOpen(false);
            }}
            aria-hidden="true"
          />
          <div
            className="custom-timepicker-popup"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
          {/* Popover Header */}
          <div className="timepicker-header">
            <div className="current-time-badge">
              <Clock size={14} />
              <span>الوقت المختار:</span>
              <strong>{formattedLabel}</strong>
            </div>
            <button
              type="button"
              className="timepicker-close-btn"
              onClick={() => setOpen(false)}
            >
              إغلاق
            </button>
          </div>

          {/* Period Tabs */}
          <div className="timepicker-tabs">
            <button
              type="button"
              className={`time-tab-btn ${tab === 'evening' ? 'is-active' : ''}`}
              onClick={() => setTab('evening')}
            >
              <Moon size={14} />
              <span>مساءً (م)</span>
            </button>
            <button
              type="button"
              className={`time-tab-btn ${tab === 'morning' ? 'is-active' : ''}`}
              onClick={() => setTab('morning')}
            >
              <Sun size={14} />
              <span>صباحاً (ص)</span>
            </button>
            <button
              type="button"
              className={`time-tab-btn ${tab === 'exact' ? 'is-active' : ''}`}
              onClick={() => setTab('exact')}
              title="تحديد دقيق بالساعة والدقيقة"
            >
              <SlidersHorizontal size={13} />
              <span>دقيق</span>
            </button>
          </div>

          {/* Evening Slots Grid */}
          {tab === 'evening' && (
            <div className="time-slots-container">
              <div className="time-slots-grid">
                {eveningSlots.map((slot) => {
                  const isSelected = slot === value;
                  const label = formatTimeArabic(slot);
                  return (
                    <button
                      key={slot}
                      type="button"
                      className={`time-slot-pill ${isSelected ? 'is-selected' : ''}`}
                      onClick={() => selectSlot(slot)}
                    >
                      <span>{label}</span>
                      {isSelected && <Check size={13} className="check-icon" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Morning Slots Grid */}
          {tab === 'morning' && (
            <div className="time-slots-container">
              <div className="time-slots-grid">
                {morningSlots.map((slot) => {
                  const isSelected = slot === value;
                  const label = formatTimeArabic(slot);
                  return (
                    <button
                      key={slot}
                      type="button"
                      className={`time-slot-pill ${isSelected ? 'is-selected' : ''}`}
                      onClick={() => selectSlot(slot)}
                    >
                      <span>{label}</span>
                      {isSelected && <Check size={13} className="check-icon" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Exact Mode (Hour / Minute / Period Columns) */}
          {tab === 'exact' && (
            <div className="exact-time-panel">
              <div className="exact-columns-row">
                {/* Hours column */}
                <div className="exact-col">
                  <span className="col-label">الساعة</span>
                  <div className="col-chips">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((h) => (
                      <button
                        key={h}
                        type="button"
                        className={`chip-btn ${exactHour === h ? 'is-selected' : ''}`}
                        onClick={() => setExactHour(h)}
                      >
                        {String(h).padStart(2, '0')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Minutes column */}
                <div className="exact-col">
                  <span className="col-label">الدقيقة</span>
                  <div className="col-chips">
                    {[0, 15, 30, 45].map((m) => (
                      <button
                        key={m}
                        type="button"
                        className={`chip-btn ${exactMinute === m ? 'is-selected' : ''}`}
                        onClick={() => setExactMinute(m)}
                      >
                        {String(m).padStart(2, '0')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Period column */}
                <div className="exact-col">
                  <span className="col-label">الفترة</span>
                  <div className="col-chips period-chips">
                    <button
                      type="button"
                      className={`chip-btn ${exactPeriod === 'PM' ? 'is-selected' : ''}`}
                      onClick={() => setExactPeriod('PM')}
                    >
                      مساءً (م)
                    </button>
                    <button
                      type="button"
                      className={`chip-btn ${exactPeriod === 'AM' ? 'is-selected' : ''}`}
                      onClick={() => setExactPeriod('AM')}
                    >
                      صباحاً (ص)
                    </button>
                  </div>
                </div>
              </div>

              {/* Apply Button */}
              <div className="exact-action-row">
                <button
                  type="button"
                  className="exact-apply-btn"
                  onClick={applyExact}
                >
                  <Clock size={14} />
                  تأكيد الوقت ({String(exactHour).padStart(2, '0')}:
                  {String(exactMinute).padStart(2, '0')} {exactPeriod === 'PM' ? 'م' : 'ص'})
                </button>
              </div>
            </div>
          )}
        </div>
        </>
      )}
    </div>
  );
}
