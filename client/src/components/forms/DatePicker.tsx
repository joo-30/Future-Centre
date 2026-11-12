import {
  Calendar as CalendarIcon,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { dateLabel, today as getTodayStr } from '../../lib/api';

const arabicMonths = [
  'يناير',
  'فبراير',
  'مارس',
  'أبريل',
  'مايو',
  'يونيو',
  'يوليو',
  'أغسطس',
  'سبتمبر',
  'أكتوبر',
  'نوفمبر',
  'ديسمبر',
];

const arabicWeekdays = ['سبت', 'أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة'];

interface DatePickerProps {
  value: string; // ISO "YYYY-MM-DD"
  onChange: (val: string) => void;
  name?: string;
  minDate?: string;
  maxDate?: string;
  required?: boolean;
  disabled?: boolean;
}

export function DatePicker({
  value,
  onChange,
  name,
  minDate,
  maxDate,
  required,
  disabled = false,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
  const [alignLeft, setAlignLeft] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Detect optimal placement (vertical and horizontal)
  const updatePlacement = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setOpenUpward(spaceBelow < 370 && rect.top > 370);

      // In RTL layout, default popup uses right: 0 (extends 320px to the left of the trigger's right edge).
      // If the space to the left of the trigger's right edge is less than 340px, or trigger is near the left edge,
      // align to left: 0 so the calendar opens towards the center of the viewport without overflowing.
      const spaceOnLeft = rect.right;
      const spaceOnRight = window.innerWidth - rect.left;
      const shouldAlignLeft = spaceOnLeft < 340 || rect.left < 120 || (spaceOnRight > spaceOnLeft && spaceOnLeft < 400);
      setAlignLeft(shouldAlignLeft);
    }
  };

  // Keep placement updated immediately upon opening
  useEffect(() => {
    if (open) {
      updatePlacement();
    }
  }, [open]);

  // Toggle open and detect optimal placement
  const toggleOpen = (e?: React.SyntheticEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (disabled) return;
    if (!open) {
      updatePlacement();
    }
    setOpen((prev) => !prev);
  };

  // Parse initial selected date
  const parsedDate = useMemo(() => {
    if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const t = new Date();
      return { year: t.getFullYear(), month: t.getMonth(), day: t.getDate() };
    }
    const [y, m, d] = value.split('-').map(Number);
    return { year: y, month: m - 1, day: d };
  }, [value]);

  const [viewYear, setViewYear] = useState(parsedDate.year);
  const [viewMonth, setViewMonth] = useState(parsedDate.month);

  // Sync viewing month when value changes externally
  useEffect(() => {
    setViewYear(parsedDate.year);
    setViewMonth(parsedDate.month);
  }, [parsedDate.year, parsedDate.month]);

  // Click outside and escape listener
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
    function handleResize() {
      updatePlacement();
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleResize);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
    };
  }, [open]);

  // Prevent background body scroll when mobile modal is open
  useEffect(() => {
    if (!open) return;
    if (typeof window !== 'undefined' && window.innerWidth <= 768) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  // Navigate months
  const prevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const nextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  // Generate days grid
  const calendarDays = useMemo(() => {
    const daysInCurrentMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();
    // In our week starting Saturday: Saturday (6) -> 0 padding, Sunday (0) -> 1, ..., Friday (5) -> 6
    const startPadding = (firstDayIndex + 1) % 7;

    const days: {
      dateStr: string;
      dayNum: number;
      isCurrentMonth: boolean;
      isSelected: boolean;
      isToday: boolean;
      isDisabled: boolean;
    }[] = [];

    const todayStr = getTodayStr();

    // Padding from previous month
    for (let i = startPadding - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const prevM = viewMonth === 0 ? 11 : viewMonth - 1;
      const prevY = viewMonth === 0 ? viewYear - 1 : viewYear;
      const dateStr = `${prevY}-${String(prevM + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({
        dateStr,
        dayNum: d,
        isCurrentMonth: false,
        isSelected: dateStr === value,
        isToday: dateStr === todayStr,
        isDisabled: Boolean((minDate && dateStr < minDate) || (maxDate && dateStr > maxDate)),
      });
    }

    // Days in current month
    for (let d = 1; d <= daysInCurrentMonth; d++) {
      const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({
        dateStr,
        dayNum: d,
        isCurrentMonth: true,
        isSelected: dateStr === value,
        isToday: dateStr === todayStr,
        isDisabled: Boolean((minDate && dateStr < minDate) || (maxDate && dateStr > maxDate)),
      });
    }

    // Remainder padding from next month to complete 35 or 42 cells
    const totalCells = days.length <= 35 ? 35 : 42;
    const remaining = totalCells - days.length;
    for (let d = 1; d <= remaining; d++) {
      const nextM = viewMonth === 11 ? 0 : viewMonth + 1;
      const nextY = viewMonth === 11 ? viewYear + 1 : viewYear;
      const dateStr = `${nextY}-${String(nextM + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({
        dateStr,
        dayNum: d,
        isCurrentMonth: false,
        isSelected: dateStr === value,
        isToday: dateStr === todayStr,
        isDisabled: Boolean((minDate && dateStr < minDate) || (maxDate && dateStr > maxDate)),
      });
    }

    return days;
  }, [viewYear, viewMonth, value, minDate, maxDate]);

  const selectDate = (dateStr: string) => {
    onChange(dateStr);
    setOpen(false);
  };

  const selectToday = (e: React.MouseEvent) => {
    e.stopPropagation();
    const t = getTodayStr();
    onChange(t);
    const [y, m] = t.split('-').map(Number);
    setViewYear(y);
    setViewMonth(m - 1);
    setOpen(false);
  };

  return (
    <div
      className={`custom-datepicker-wrap ${open ? 'is-open' : ''}`}
      ref={containerRef}
      style={{ position: 'relative', zIndex: open ? 999999 : 1 }}
    >
      {name && <input type="hidden" name={name} value={value} required={required} />}
      {/* Trigger Button */}
      <button
        type="button"
        className={`custom-datepicker-trigger ${open ? 'is-active' : ''}`}
        onClick={toggleOpen}
        disabled={disabled}
      >
        <span className="trigger-icon">
          <CalendarIcon size={16} />
        </span>
        <span className="trigger-label">
          {value ? dateLabel(value, { day: 'numeric', month: 'long', year: 'numeric' }) : 'اختاري التاريخ'}
        </span>
        <span className="trigger-arrow">
          <ChevronDown size={15} />
        </span>
      </button>

      {/* Floating Popover Calendar */}
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
            className={`custom-datepicker-popup ${openUpward ? 'open-upward' : ''} ${alignLeft ? 'align-left' : ''}`}
            style={{
              ...(alignLeft ? { right: 'auto', left: 0 } : {}),
              ...(openUpward ? { top: 'auto', bottom: 'calc(100% + 8px)' } : {}),
            }}
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
          {/* Header */}
          <div className="calendar-header">
            <div className="calendar-month-title">
              <strong>{arabicMonths[viewMonth]}</strong>
              <span>{viewYear}</span>
            </div>
            <div className="calendar-nav-buttons">
              <button
                type="button"
                className="nav-btn"
                onClick={prevMonth}
                aria-label="الشهر السابق"
                title="الشهر السابق"
              >
                <ChevronRight size={17} />
              </button>
              <button
                type="button"
                className="nav-btn"
                onClick={nextMonth}
                aria-label="الشهر التالي"
                title="الشهر التالي"
              >
                <ChevronLeft size={17} />
              </button>
            </div>
          </div>

          {/* Weekdays row */}
          <div className="calendar-weekdays-grid">
            {arabicWeekdays.map((w) => (
              <span key={w} className="weekday-cell">
                {w}
              </span>
            ))}
          </div>

          {/* Days grid */}
          <div className="calendar-days-grid">
            {calendarDays.map((d, idx) => (
              <button
                key={idx}
                type="button"
                disabled={d.isDisabled}
                className={`day-cell ${d.isCurrentMonth ? 'in-month' : 'out-month'} ${
                  d.isSelected ? 'is-selected' : ''
                } ${d.isToday ? 'is-today' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  selectDate(d.dateStr);
                }}
              >
                <span>{d.dayNum}</span>
              </button>
            ))}
          </div>

          {/* Footer Actions */}
          <div className="calendar-footer">
            <button type="button" className="footer-btn today" onClick={selectToday}>
              <RotateCcw size={13} />
              اليوم
            </button>
            {value && (
              <button
                type="button"
                className="footer-btn clear"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange('');
                  setOpen(false);
                }}
                style={{ color: '#b91c1c', fontWeight: 600 }}
                title="إلغاء تصفية التاريخ وعرض كل المواعيد"
              >
                مسح التاريخ
              </button>
            )}
            <button
              type="button"
              className="footer-btn close"
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
              }}
            >
              إغلاق
            </button>
          </div>
        </div>
        </>
      )}
    </div>
  );
}
