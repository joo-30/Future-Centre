import type {
  AppointmentPublic,
  Availability,
  BookingData,
  BookingResult,
  Catalog,
} from '@future/shared';
export class ApiError extends Error {
  constructor(
    message: string,
    public code: string,
    public status: number,
  ) {
    super(message);
  }
}
export async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch('/api' + url, {
      ...options,
      credentials: 'same-origin',
      headers: { 'X-FC-Request': '1', ...options.headers },
    });
  } catch {
    throw new ApiError(
      'تعذر الاتصال بالمركز. تحققي من الاتصال وحاولي مرة أخرى.',
      'NETWORK_ERROR',
      0,
    );
  }
  const data = await response.json().catch(() => null);
  if (!response.ok)
    throw new ApiError(
      data?.error?.message || 'تعذر إكمال الطلب الآن.',
      data?.error?.code || 'UNKNOWN',
      response.status,
    );
  return data as T;
}
const json = (body: unknown) => ({ 'Content-Type': 'application/json', ...(body as object) });
export const api = {
  catalog: () => request<Catalog>('/catalog'),
  availability: (serviceId: string, date: string) =>
    request<Availability>('/availability?' + new URLSearchParams({ serviceId, date })),
  book: (body: BookingData, key: string) =>
    request<BookingResult>('/appointments', {
      method: 'POST',
      headers: json({ 'Idempotency-Key': key }),
      body: JSON.stringify(body),
    }),
  privateAvailability: (token: string, date: string) =>
    request<Availability>('/appointments/availability?' + new URLSearchParams({ date }), {
      headers: { Authorization: `Bearer ${token}` },
    }),
  track: (token: string) =>
    request<AppointmentPublic>('/appointments/track', {
      headers: { Authorization: `Bearer ${token}` },
    }),
  lookup: (
    params: { reference?: string; phone?: string; query?: string } | string,
    maybePhone?: string,
  ) => {
    let body: { reference?: string; phone?: string; query?: string } = {};
    if (typeof params === 'string') {
      if (maybePhone) {
        body = { reference: params, phone: maybePhone };
      } else {
        body = { query: params };
      }
    } else {
      body = params;
    }
    return request<{ appointment: AppointmentPublic }>('/appointments/lookup', {
      method: 'POST',
      headers: json({}),
      body: JSON.stringify(body),
    });
  },
  cancel: (token: string) =>
    request<AppointmentPublic>('/appointments/cancel', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    }),
  reschedule: (token: string, date: string, time: string) =>
    request<AppointmentPublic>('/appointments/reschedule', {
      method: 'POST',
      headers: { ...json({}), Authorization: `Bearer ${token}` },
      body: JSON.stringify({ date, time }),
    }),
  interest: (body: { programId: string; name: string; phone: string; consent: boolean }) =>
    request<{ reference: string; message: string }>('/interests', {
      method: 'POST',
      headers: json({}),
      body: JSON.stringify(body),
    }),
};
export const formatPrice = (n: number | null) =>
  n === null ? 'يحدد بعد الاستشارة' : new Intl.NumberFormat('en-US').format(n);
export function addDays(date: string, count: number) {
  const d = new Date(date + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() + count);
  return d.toISOString().slice(0, 10);
}
export const today = () =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Africa/Cairo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
export const dateLabel = (
  date: string,
  options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long' },
) => {
  if (!date) return '';
  const d = date.includes('T') ? new Date(date) : new Date(date + 'T12:00:00Z');
  if (isNaN(d.getTime())) return date;
  return new Intl.DateTimeFormat('ar-EG-u-nu-latn', { timeZone: 'Africa/Cairo', ...options }).format(d);
};

export const fullDateLabel = (date: string) =>
  dateLabel(date, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

export const shortDateLabel = (date: string) =>
  dateLabel(date, { day: 'numeric', month: 'short', year: 'numeric' });

export function relativeDateLabel(date: string): string {
  if (!date) return '';
  const d = date.includes('T') ? new Date(date) : new Date(date + 'T12:00:00Z');
  if (isNaN(d.getTime())) return '';
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'اليوم';
  if (diffDays === 1) return 'غداً';
  if (diffDays === -1) return 'أمس';
  if (diffDays === 2) return 'بعد يومين';
  if (diffDays === -2) return 'منذ يومين';
  if (diffDays > 2 && diffDays <= 10) return `بعد ${diffDays} أيام`;
  if (diffDays < -2 && diffDays >= -10) return `منذ ${Math.abs(diffDays)} أيام`;
  if (diffDays > 10 && diffDays <= 30) return `بعد ${Math.round(diffDays / 7)} أسابيع`;
  if (diffDays < -10 && diffDays >= -30) return `منذ ${Math.round(Math.abs(diffDays) / 7)} أسابيع`;
  if (diffDays < -30) return `منذ ${Math.max(1, Math.round(Math.abs(diffDays) / 30))} شهر`;
  return shortDateLabel(date);
}
export function timeLabel(time: string) {
  if (!time) return '';
  const parts = time.split(':');
  const h = Number(parts[0]);
  const m = Number(parts[1]) || 0;
  const formattedH = h % 12 || 12;
  const formattedM = m < 10 ? `0${m}` : `${m}`;
  return `${formattedH}:${formattedM} ${h < 12 ? 'ص' : 'م'}`;
}
export function formatWhatsAppPhone(phone: string): string {
  let p = (phone || '')
    .trim()
    .replace(/[٠-٩]/g, (c) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(c)))
    .replace(/[۰-۹]/g, (c) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(c)))
    .replace(/[\s()\-]/g, '');
  if (p.startsWith('00')) p = p.slice(2);
  if (p.startsWith('+')) p = p.slice(1);
  if (/^01[0125]\d{8}$/.test(p)) p = '20' + p.slice(1);
  return p.replace(/\D/g, '');
}

export const whatsappUrl = (phone: string, message: string) => {
  const normalized = formatWhatsAppPhone(phone);
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
};
