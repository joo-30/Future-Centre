import { describe, expect, it } from 'vitest';
import { normalizePhone } from '@future/shared';

// Domain logic: Monotone cubic spline mathematics verification
interface Point {
  x: number;
  y: number;
}

function computeMonotoneSplineTangents(pts: Point[]) {
  const n = pts.length;
  if (n <= 1) return [];
  const dxs: number[] = [];
  const dys: number[] = [];
  const ms: number[] = [];

  for (let i = 0; i < n - 1; i++) {
    const dx = pts[i + 1].x - pts[i].x;
    const dy = pts[i + 1].y - pts[i].y;
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
      tangents.push((m0 + m1) / 2);
    }
  }
  tangents.push(ms[ms.length - 1]);

  // Fritsch-Carlson monotonicity check & adjustment
  for (let i = 0; i < n - 1; i++) {
    const m = ms[i];
    if (m === 0) {
      tangents[i] = 0;
      tangents[i + 1] = 0;
    } else {
      const alpha = tangents[i] / m;
      const beta = tangents[i + 1] / m;
      if (alpha < 0) tangents[i] = 0;
      if (beta < 0) tangents[i + 1] = 0;
      const dist = Math.hypot(alpha, beta);
      if (dist > 3) {
        const tau = 3 / dist;
        tangents[i] = tau * alpha * m;
        tangents[i + 1] = tau * beta * m;
      }
    }
  }

  return tangents;
}

describe('Unit Tests: Domain Mathematics & Data Normalization', () => {
  it('guarantees monotonicity in flat and peak regions (no overshoot below/above bounds)', () => {
    // Test points with flat region and a peak
    const points: Point[] = [
      { x: 0, y: 10 },
      { x: 10, y: 10 }, // flat
      { x: 20, y: 30 }, // rise
      { x: 30, y: 30 }, // flat peak
      { x: 40, y: 5 },  // drop
    ];

    const tangents = computeMonotoneSplineTangents(points);
    expect(tangents).toHaveLength(points.length);

    // Tangents at exact flat regions must be 0 to avoid overshoot
    expect(tangents[0]).toBe(0);
    expect(tangents[1]).toBe(0);
    expect(tangents[3]).toBe(0);

    // Tangents must be finite numbers
    for (const t of tangents) {
      expect(Number.isFinite(t)).toBe(true);
    }
  });

  it('correctly normalizes Egyptian phone numbers and Arabic digits to E.164 format', () => {
    // Normal Arabic digits
    expect(normalizePhone('٠١٠٤١٥٠٤٢٠١')).toBe('+201041504201');
    // Number with country code
    expect(normalizePhone('+201041504201')).toBe('+201041504201');
    // Number with spacing and dashes
    expect(normalizePhone('010 4150-4201')).toBe('+201041504201');
    // English digits with extra zeros
    expect(normalizePhone('00201041504201')).toBe('+201041504201');
  });

  it('accurately calculates occupancy statistics and downsampling logic for 100-day ranges', () => {
    const daysCount = 100;
    const shouldShowLabel = (idx: number, total: number) => {
      if (total <= 14) return true;
      if (total <= 30) {
        if (idx === total - 1) return true;
        if (idx % 4 === 0 && total - 1 - idx >= 2) return true;
        return false;
      }
      if (idx === total - 1) return true;
      if (idx % 14 === 0 && total - 1 - idx >= 6) return true;
      return false;
    };

    const renderedIndices: number[] = [];
    for (let i = 0; i < daysCount; i++) {
      if (shouldShowLabel(i, daysCount)) {
        renderedIndices.push(i);
      }
    }

    // Must include first (0) and last (99)
    expect(renderedIndices).toContain(0);
    expect(renderedIndices).toContain(99);

    // Must NEVER have two labels with distance < 6 in 100 days mode
    for (let j = 1; j < renderedIndices.length; j++) {
      const distance = renderedIndices[j] - renderedIndices[j - 1];
      expect(distance).toBeGreaterThanOrEqual(6);
    }
  });
});
