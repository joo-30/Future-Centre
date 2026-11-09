import {
  ArrowUpLeft,
  BarChart3,
  CalendarCheck2,
  CheckCircle2,
  Flame,
  SlidersHorizontal,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useState } from 'react';
import { dateLabel } from '../../../lib/api';
import type { DayCapacityStat } from '../../../lib/portal-api';

const WEEKDAY_NAMES: Record<number, string> = {
  1: 'الاثنين',
  2: 'الثلاثاء',
  3: 'الأربعاء',
  4: 'الخميس',
  5: 'الجمعة',
  6: 'السبت',
  7: 'الأحد',
};

export const RANGE_OPTIONS = [
  { label: 'آخر يوم (اليوم)', days: 1 },
  { label: 'آخر أسبوع', days: 7 },
  { label: 'آخر 10 أيام', days: 10 },
  { label: '14 يوماً', days: 14 },
  { label: 'شهر (30 يوماً)', days: 30 },
  { label: 'آخر 100 يوم', days: 100 },
];

interface CapacityAnalyticsChartsProps {
  upcomingDays: DayCapacityStat[];
  activeDate: string;
  onSelectDate: (date: string) => void;
  maxPatientsDefault: number;
  onEditDate?: (date: string) => void;
  forecastDays: number;
  onRangeChange: (days: number) => void;
}

interface Point {
  x: number;
  y: number;
  day: DayCapacityStat;
}

/**
 * Monotone Cubic Spline (Fritsch-Carlson) for ultra-smooth organic curves
 * with ZERO overshoot below baseline or above ceiling.
 */
function getMonotoneSplinePath(points: { x: number; y: number }[]): string {
  const n = points.length;
  if (n === 0) return '';
  if (n === 1) return `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  if (n === 2) {
    return `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)} L ${points[1].x.toFixed(1)} ${points[1].y.toFixed(1)}`;
  }

  const dxs: number[] = [];
  const dys: number[] = [];
  const ms: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    const dx = points[i + 1].x - points[i].x;
    const dy = points[i + 1].y - points[i].y;
    dxs.push(dx);
    dys.push(dy);
    ms.push(dx === 0 ? 0 : dy / dx);
  }

  const tangents: number[] = [ms[0]];
  for (let i = 1; i < n - 1; i++) {
    const m0 = ms[i - 1];
    const m1 = ms[i];
    if (m0 * m1 <= 0) {
      tangents.push(0);
    } else {
      const dx0 = dxs[i - 1];
      const dx1 = dxs[i];
      const common = dx0 + dx1;
      tangents.push((3 * common) / ((common + dx1) / m0 + (common + dx0) / m1));
    }
  }
  tangents.push(ms[ms.length - 1]);

  let path = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  for (let i = 0; i < n - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const dx = dxs[i];
    const t0 = tangents[i];
    const t1 = tangents[i + 1];

    const cp1x = p0.x + dx / 3;
    const cp1y = p0.y + (t0 * dx) / 3;
    const cp2x = p1.x - dx / 3;
    const cp2y = p1.y - (t1 * dx) / 3;

    path += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p1.x.toFixed(1)} ${p1.y.toFixed(1)}`;
  }

  return path;
}

export function CapacityAnalyticsCharts({
  upcomingDays,
  activeDate,
  onSelectDate,
  maxPatientsDefault,
  onEditDate,
  forecastDays,
  onRangeChange,
}: CapacityAnalyticsChartsProps) {
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);

  const openDays = upcomingDays.filter((d) => d.isOpen);
  const totalBooked = openDays.reduce((acc, d) => acc + d.bookedCount, 0);
  const totalLimit = openDays.reduce((acc, d) => acc + d.limit, 0);
  const totalRemaining = openDays.reduce((acc, d) => acc + d.remaining, 0);
  const avgOccupancy = totalLimit > 0 ? Math.round((totalBooked / totalLimit) * 100) : 0;
  const fullDays = openDays.filter((d) => d.isFull).length;
  const busyDays = openDays.filter((d) => d.percent >= 70 && !d.isFull).length;
  const lightDays = openDays.filter((d) => d.percent < 70).length;

  // Chart coordinate geometry (UI/UX Pro Max)
  const chartWidth = 840;
  const chartHeight = 185;
  const paddingLeft = 85;
  const paddingRight = 35;
  const paddingTop = 32;
  const paddingBottom = 48;
  const baseY = chartHeight - paddingBottom;
  const usableHeight = baseY - paddingTop;

  const maxVal = Math.max(
    maxPatientsDefault,
    ...upcomingDays.map((d) => Math.max(d.limit || 0, d.bookedCount || 0)),
    1
  );

  const isSingleDay = upcomingDays.length === 1;
  const availableWidth = chartWidth - paddingLeft - paddingRight;
  const stepX = isSingleDay ? 0 : availableWidth / (upcomingDays.length - 1);

  // Compute curve points for each day
  const bookedPoints: Point[] = upcomingDays.map((d, i) => {
    const x = isSingleDay ? paddingLeft + availableWidth / 2 : paddingLeft + i * stepX;
    const y = !d.isOpen ? baseY : baseY - (d.bookedCount / maxVal) * usableHeight;
    return { x, y, day: d };
  });

  const limitPoints: Point[] = upcomingDays.map((d, i) => {
    const x = isSingleDay ? paddingLeft + availableWidth / 2 : paddingLeft + i * stepX;
    const y = baseY - (d.limit / maxVal) * usableHeight;
    return { x, y, day: d };
  });

  // Smooth spline paths
  const bookedCurvePath = isSingleDay
    ? `M ${paddingLeft} ${bookedPoints[0].y.toFixed(1)} L ${chartWidth - paddingRight} ${bookedPoints[0].y.toFixed(1)}`
    : getMonotoneSplinePath(bookedPoints);

  const limitCurvePath = isSingleDay
    ? `M ${paddingLeft} ${limitPoints[0].y.toFixed(1)} L ${chartWidth - paddingRight} ${limitPoints[0].y.toFixed(1)}`
    : getMonotoneSplinePath(limitPoints);

  const bookedAreaPath =
    bookedPoints.length > 0
      ? isSingleDay
        ? `M ${paddingLeft} ${bookedPoints[0].y.toFixed(1)} L ${chartWidth - paddingRight} ${bookedPoints[0].y.toFixed(1)} L ${chartWidth - paddingRight} ${baseY} L ${paddingLeft} ${baseY} Z`
        : `${bookedCurvePath} L ${bookedPoints[bookedPoints.length - 1].x.toFixed(1)} ${baseY} L ${bookedPoints[0].x.toFixed(1)} ${baseY} Z`
      : '';

  const hoveredDay = hoveredDate ? upcomingDays.find((d) => d.date === hoveredDate) : null;
  const selectedPoint = bookedPoints.find((p) => p.day.date === activeDate);
  const hoveredPoint = hoveredDate ? bookedPoints.find((p) => p.day.date === hoveredDate) : null;

  // Responsive tick & node filtering for dense ranges (e.g. 100 days)
  const shouldShowLabel = (idx: number) => {
    const total = upcomingDays.length;
    if (total <= 14) return true;
    if (total <= 30) {
      if (idx === total - 1) return true;
      if (idx % 4 === 0 && total - 1 - idx >= 2) return true;
      return false;
    }
    // Dense ranges (e.g. 100 days)
    if (idx === total - 1) return true;
    if (idx % 14 === 0 && total - 1 - idx >= 6) return true;
    return false;
  };

  const shouldShowNode = (idx: number, isSelected: boolean, isHovered: boolean) => {
    if (isSelected || isHovered) return true;
    if (upcomingDays.length <= 14) return true;
    if (upcomingDays.length <= 30) return idx % 2 === 0;
    return false;
  };

  return (
    <div className="capacity-analytics-container">
      {/* Section Header */}
      <div className="cac-header">
        <div className="cac-title-group">
          <span className="cac-kicker">
            <BarChart3 size={15} />
            لوحة المنحنيات البيانية والتحليل الذكي (UI/UX Pro Max)
          </span>
          <h3 className="cac-title">الرؤية التحليلية وتوزيع حركة إقبال العيادة</h3>
          <p className="cac-subtitle">
            منحنى انسيابي ذكي يوضح صعود وهبوط الحالات المحجوزة وسقف السعة اليومية لمنع التكدس وضمان جودة الكشف
          </p>
        </div>

        {/* Global Occupancy Ring Badge */}
        <div className="cac-global-badge">
          <div className="cac-ring-wrap">
            <svg viewBox="0 0 36 36" className="cac-circular-chart">
              <path
                className="cac-circle-bg"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="cac-circle"
                strokeDasharray={`${avgOccupancy}, 100`}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="cac-ring-number">{avgOccupancy}%</span>
          </div>
          <div className="cac-ring-meta">
            <strong>معدل الإشغال العام</strong>
            <small>
              {totalBooked} مريض من {totalLimit} مقعد متاح
            </small>
          </div>
        </div>
      </div>

      {/* 4 KPI Metric Cards */}
      <div className="cac-kpi-grid">
        <div className="cac-kpi-card">
          <div className="kpi-top">
            <span className="kpi-lbl">إجمالي الحجوزات المؤكدة</span>
            <span className="kpi-icon bg-forest-light text-forest">
              <Users size={16} />
            </span>
          </div>
          <strong className="kpi-val text-forest">
            {totalBooked} <small>مريض مؤكد</small>
          </strong>
          <span className="kpi-subtext">في {openDays.length} يوم عمل مسجل</span>
        </div>

        <div className="cac-kpi-card">
          <div className="kpi-top">
            <span className="kpi-lbl">المقاعد الشاغرة المتاحة</span>
            <span className="kpi-icon bg-emerald-light text-emerald">
              <CheckCircle2 size={16} />
            </span>
          </div>
          <strong className="kpi-val text-emerald">
            {totalRemaining} <small>مقعد شاغر</small>
          </strong>
          <span className="kpi-subtext">سعة كافية لاستقبال مرضى جدد</span>
        </div>

        <div className="cac-kpi-card">
          <div className="kpi-top">
            <span className="kpi-lbl">أيام الذروة المكتملة</span>
            <span className="kpi-icon bg-amber-light text-amber">
              <Flame size={16} />
            </span>
          </div>
          <strong className="kpi-val text-gold">
            {fullDays} <small>أيام مكتملة</small>
          </strong>
          <span className="kpi-subtext">{busyDays} أيام قاربت على الاكتمال</span>
        </div>

        <div className="cac-kpi-card">
          <div className="kpi-top">
            <span className="kpi-lbl">متوسط الكشوفات اليومية</span>
            <span className="kpi-icon bg-blue-light text-blue">
              <TrendingUp size={16} />
            </span>
          </div>
          <strong className="kpi-val text-forest">
            {openDays.length > 0 ? (totalBooked / openDays.length).toFixed(1) : 0} <small>حالة/يوم</small>
          </strong>
          <span className="kpi-subtext">معدل صحي ومريح للعيادة</span>
        </div>
      </div>

      {/* Main Interactive Smooth Curve Chart Card */}
      <div className="cac-chart-card">
        {/* Toolbar with Timeline Filter Tabs */}
        <div className="cac-chart-toolbar">
          <div className="cac-toolbar-top">
            <div className="cac-range-filter-pills" role="tablist">
              <span className="crf-label">المدى الزمني للمنحنى:</span>
              {RANGE_OPTIONS.map((opt) => (
                <button
                  key={opt.days}
                  type="button"
                  className={`cac-range-pill ${forecastDays === opt.days ? 'is-active' : ''}`}
                  onClick={() => onRangeChange(opt.days)}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <small className="chart-tip">
              💡 اضغطي على أي نقطة على المنحنى لمعاينة وتعديل سعة ذلك اليوم بالأعلى
            </small>
          </div>

          <div className="chart-legend">
            <span className="legend-item">
              <span className="legend-curve-indicator is-booked" />
              <span>منحنى الحالات المحجوزة</span>
            </span>
            <span className="legend-item">
              <span className="legend-curve-indicator is-area" />
              <span>مساحة الإقبال والامتلاء</span>
            </span>
            <span className="legend-item">
              <span className="legend-curve-indicator is-ceiling" />
              <span>سقف السعة اليومية للعيادة</span>
            </span>
            <span className="legend-item">
              <span className="legend-curve-indicator is-weekend" />
              <span>عطلة أسبوعية</span>
            </span>
          </div>
        </div>

        {/* Responsive Interactive SVG Smooth Curve Canvas */}
        <div className="cac-svg-wrapper">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="cac-svg curve-canvas"
            preserveAspectRatio="none"
          >
            <defs>
              {/* Lush emerald area gradient */}
              <linearGradient id="curveAreaEmerald" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2e7d32" stopOpacity="0.32" />
                <stop offset="50%" stopColor="#388e3c" stopOpacity="0.14" />
                <stop offset="95%" stopColor="#4caf50" stopOpacity="0.01" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0.00" />
              </linearGradient>

              {/* Stroke line gradient */}
              <linearGradient id="curveStrokeEmerald" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#1b5e20" />
                <stop offset="50%" stopColor="#2e7d32" />
                <stop offset="100%" stopColor="#1e6b27" />
              </linearGradient>

              {/* Soft Drop Shadow for the curve line */}
              <filter id="curveShadow" x="-10%" y="-10%" width="120%" height="130%">
                <feDropShadow dx="0" dy="3" stdDeviation="3.5" floodColor="#1b5e20" floodOpacity="0.18" />
              </filter>
            </defs>

            {/* Weekend Shaded Backdrop Columns */}
            {!isSingleDay &&
              upcomingDays.map((d, i) => {
                if (d.isOpen) return null;
                const x = paddingLeft + i * stepX;
                const colW = Math.max(16, Math.min(26, stepX * 0.72));
                return (
                  <g key={`weekend-bg-${d.date}`}>
                    <rect
                      x={x - colW / 2}
                      y={paddingTop - 6}
                      width={colW}
                      height={usableHeight + 12}
                      rx={6}
                      fill="#f4f7f2"
                      stroke="#e2ebe0"
                      strokeWidth={1}
                      strokeDasharray="3 3"
                      className="weekend-backdrop"
                    />
                    {upcomingDays.length <= 14 && (
                      <text x={x} y={baseY - 8} textAnchor="middle" className="weekend-marker-text">
                        عطلة
                      </text>
                    )}
                  </g>
                );
              })}

            {/* Reference Grid Lines & Y-Axis Scale (Positioned on the Left) */}
            {/* Ceiling 100% */}
            <text x={paddingLeft - 10} y={paddingTop + 4} textAnchor="end" className="chart-y-axis-label">
              {maxVal} حالة
            </text>
            <line
              x1={paddingLeft}
              y1={paddingTop}
              x2={chartWidth - paddingRight}
              y2={paddingTop}
              className="chart-grid-line dashed"
            />

            {/* Mid 50% */}
            <text
              x={paddingLeft - 10}
              y={paddingTop + usableHeight / 2 + 4}
              textAnchor="end"
              className="chart-y-axis-label"
            >
              {Math.round(maxVal / 2)}
            </text>
            <line
              x1={paddingLeft}
              y1={paddingTop + usableHeight / 2}
              x2={chartWidth - paddingRight}
              y2={paddingTop + usableHeight / 2}
              className="chart-grid-line dashed light"
            />

            {/* Baseline 0 */}
            <text x={paddingLeft - 10} y={baseY + 4} textAnchor="end" className="chart-y-axis-label">
              0
            </text>
            <line
              x1={paddingLeft}
              y1={baseY}
              x2={chartWidth - paddingRight}
              y2={baseY}
              className="chart-grid-line baseline"
            />

            {/* Safe Capacity Ceiling Curve (سقف الطاقة الاستيعابية اليومية) */}
            <path
              d={limitCurvePath}
              fill="none"
              stroke="#1b5e20"
              strokeWidth={1.8}
              strokeDasharray="4 4"
              opacity={0.45}
              className="curve-ceiling-path"
            />

            {/* Booked Appointments Gradient Area Fill */}
            {bookedAreaPath && (
              <path d={bookedAreaPath} fill="url(#curveAreaEmerald)" className="curve-area-path" />
            )}

            {/* Main Smooth Bezier Line for Booked Appointments */}
            {bookedCurvePath && (
              <path
                d={bookedCurvePath}
                fill="none"
                stroke="url(#curveStrokeEmerald)"
                strokeWidth={3.4}
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#curveShadow)"
                className="curve-stroke-path"
              />
            )}

            {/* Active / Hover Crosshair Guide Line */}
            {(hoveredPoint || selectedPoint) && (
              <line
                x1={(hoveredPoint || selectedPoint)!.x}
                y1={paddingTop - 6}
                x2={(hoveredPoint || selectedPoint)!.x}
                y2={baseY + 4}
                className="curve-crosshair-line"
              />
            )}

            {/* Interactive Data Points on the Curve */}
            {bookedPoints.map((pt, idx) => {
              const { day, x, y } = pt;
              const isSelected = day.date === activeDate;
              const isHovered = day.date === hoveredDate;
              const isVisibleNode = shouldShowNode(idx, isSelected, isHovered);
              const isVisibleLabel = shouldShowLabel(idx);

              return (
                <g
                  key={day.date}
                  className={`curve-node-group ${isSelected ? 'is-selected' : ''} ${
                    isHovered ? 'is-hovered' : ''
                  } ${!day.isOpen ? 'is-closed' : ''}`}
                  onClick={() => {
                    onSelectDate(day.date);
                    onEditDate?.(day.date);
                  }}
                  onMouseEnter={() => setHoveredDate(day.date)}
                  onMouseLeave={() => setHoveredDate(null)}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Invisible broad hit target for effortless touch & clicks */}
                  <rect
                    x={x - (isSingleDay ? 40 : Math.max(10, stepX / 2))}
                    y={paddingTop - 10}
                    width={isSingleDay ? 80 : Math.max(20, stepX)}
                    height={usableHeight + paddingBottom + 10}
                    fill="transparent"
                  />

                  {/* Selected Outer Aura Pulse */}
                  {isSelected && <circle cx={x} cy={y} r={13} className="curve-node-aura selected" />}

                  {/* Hover Outer Ring */}
                  {isHovered && !isSelected && <circle cx={x} cy={y} r={10} className="curve-node-aura hover" />}

                  {/* Node Circle Marker */}
                  {isVisibleNode &&
                    (day.isOpen ? (
                      <circle
                        cx={x}
                        cy={y}
                        r={isSelected ? 6 : isHovered ? 5.2 : 4.2}
                        className={`curve-node-dot ${
                          day.isFull ? 'is-full' : day.percent >= 70 ? 'is-busy' : 'is-normal'
                        } ${isSelected ? 'is-active-dot' : ''}`}
                      />
                    ) : (
                      <circle cx={x} cy={y} r={2.8} className="curve-node-dot-closed" />
                    ))}

                  {/* Value / Percentage badge floating on active node */}
                  {day.isOpen && (isSelected || isHovered) && (
                    <g transform={`translate(${x}, ${y - 18})`} className="curve-floating-badge">
                      <rect x={-28} y={-14} width={56} height={20} rx={6} className="cfb-bg" />
                      <text x={0} y={0} textAnchor="middle" className="cfb-text">
                        {day.bookedCount} مريض
                      </text>
                    </g>
                  )}

                  {/* X-Axis Day & Date Labels */}
                  {isVisibleLabel && (
                    <>
                      <text
                        x={x}
                        y={baseY + 18}
                        textAnchor="middle"
                        className={`curve-day-lbl ${isSelected ? 'is-active-day' : ''}`}
                      >
                        {WEEKDAY_NAMES[day.weekday] || ''}
                      </text>
                      <text
                        x={x}
                        y={baseY + 32}
                        textAnchor="middle"
                        className={`curve-date-sub ${isSelected ? 'is-active-date' : ''}`}
                      >
                        {day.date.slice(5)}
                      </text>
                    </>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Hover / Active Day Live Inspector Strip */}
        {(hoveredDay || activeDate) && (
          <div className="cac-detail-strip">
            {(() => {
              const d = hoveredDay || upcomingDays.find((x) => x.date === activeDate);
              if (!d) return null;
              return (
                <div className="cds-content">
                  <div className="cds-date">
                    <Sparkles size={14} className="text-forest" />
                    <strong>{dateLabel(d.date, { weekday: 'long', day: 'numeric', month: 'long' })}</strong>
                    <span className="cds-code">({d.date})</span>
                    {!d.isOpen && <span className="cds-closed-tag">عطلة أسبوعية</span>}
                  </div>

                  {d.isOpen ? (
                    <div className="cds-stats">
                      <span className="cds-stat">
                        الحالات المؤكدة: <strong className="text-forest">{d.bookedCount} مريض</strong>
                      </span>
                      <span className="cds-sep">·</span>
                      <span className="cds-stat">
                        سعة اليوم: <strong>{d.limit} حالة</strong>
                      </span>
                      <span className="cds-sep">·</span>
                      <span className="cds-stat">
                        المقاعد المتبقية: <strong className="text-emerald">{d.remaining} مقعد</strong>
                      </span>
                      <span className="cds-sep">·</span>
                      <span className="cds-stat">
                        معدل الإشغال: <strong className="text-gold">{d.percent}%</strong>
                      </span>
                    </div>
                  ) : (
                    <div className="cds-stats">
                      <span className="cds-stat text-muted">
                        العيادة مغلقة في هذا اليوم، ولا يتم احتساب كشوفات أو استقبال حجوزات.
                      </span>
                    </div>
                  )}

                  <div className="cds-actions">
                    <button
                      type="button"
                      className="cds-action-btn"
                      onClick={() => {
                        onSelectDate(d.date);
                        onEditDate?.(d.date);
                      }}
                      title="اضغطي لضبط وتعديل سعة هذا اليوم في كارت التحكم"
                    >
                      <SlidersHorizontal size={13} />
                      <span>تخصيص وضبط سعة هذا اليوم ({d.limit} حالة) ✏️</span>
                      <ArrowUpLeft size={13} />
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* Bottom Insights Bar */}
      <div className="cac-insights-row">
        <div className="insight-chip">
          <span className="ic-dot is-light" />
          <span>
            أيام هادئة ومتاحة بالكامل: <strong>{lightDays} يوم</strong>
          </span>
        </div>
        <div className="insight-chip">
          <span className="ic-dot is-busy" />
          <span>
            أيام إقبال نشط (&gt; 70%): <strong>{busyDays} يوم</strong>
          </span>
        </div>
        <div className="insight-chip">
          <span className="ic-dot is-full" />
          <span>
            أيام بلغت الذروة (مكتملة): <strong>{fullDays} يوم</strong>
          </span>
        </div>
        <div className="insight-chip" style={{ marginLeft: 'auto' }}>
          <CalendarCheck2 size={13} className="text-forest" />
          <span>
            المدى المعروض: {upcomingDays.length} يوم · منحنى Monotone Spline
          </span>
        </div>
      </div>
    </div>
  );
}
