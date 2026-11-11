import type {
  AccountData,
  AdminAppointment,
  AppointmentPublic,
  Article,
  Availability,
  InBodyRecordPublic,
  InterestPublic,
  PatientClinicalNote,
  PatientHistoryData,
  PrescriptionPublic,
  NotificationPublic,
  ScheduleData,
  Service,
  Subscription,
  UserPublic,
  SuccessStory,
} from '@future/shared';
import { request } from './api';
export const send = <T>(url: string, body: unknown, method = 'POST') =>
  request<T>(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
export const authApi = {
  quickRoles: () => request<{ roles: ('admin' | 'patient')[] }>('/auth/quick-login'),
  quickLogin: (role: 'admin' | 'patient') =>
    send<{ user: UserPublic }>('/auth/quick-login', { role }),
  me: (context?: 'admin' | 'patient') =>
    request<{ user: UserPublic | null }>(
      '/auth/me' + (context ? `?context=${context}` : ''),
      context ? { headers: { 'X-Auth-Context': context } } : {},
    ),
  login: (body: unknown) => send<{ user: UserPublic }>('/auth/login', body),
  register: (body: unknown) =>
    send<{ user: UserPublic; recoveryCode: string }>('/auth/register', body),
  recover: (body: unknown) =>
    send<{ user: UserPublic; recoveryCode: string }>('/auth/recover', body),
  logout: (context?: 'admin' | 'patient') =>
    send(
      '/auth/logout' + (context ? `?context=${context}` : ''),
      { context },
      'POST',
    ),
  profile: (name: string) => send<{ user: UserPublic }>('/auth/profile', { name }, 'PATCH'),
  password: (body: unknown) => send('/auth/password', body),
};
export const accountApi = {
  availability: (reference: string, date: string) =>
    request<Availability>(
      `/account/appointments/${reference}/availability?` + new URLSearchParams({ date }),
    ),
  get: () => request<AccountData>('/account'),
  claim: (token: string) => send<AppointmentPublic>('/account/claim', { token }),
  cancel: (reference: string) =>
    send<AppointmentPublic>(`/account/appointments/${reference}/cancel`, {}),
  reschedule: (reference: string, date: string, time: string) =>
    send<AppointmentPublic>(`/account/appointments/${reference}/reschedule`, { date, time }),
  notifications: () =>
    request<{ notifications: NotificationPublic[]; unreadCount: number }>('/account/notifications'),
  markNotificationRead: (id: string) =>
    send<{ ok: boolean }>(`/account/notifications/${id}/read`, {}),
  markAllNotificationsRead: () =>
    send<{ ok: boolean }>('/account/notifications/read-all', {}),
  getPushKey: () =>
    request<{ publicKey: string }>('/account/push-key'),
  subscribePush: (subscription: { endpoint: string; keys: { p256dh: string; auth: string } }) =>
    send<{ ok: boolean }>('/account/subscribe-push', { subscription }),
  testPush: () =>
    send<{ ok: boolean }>('/account/test-push', {}),
};
export interface Overview {
  pending: number;
  confirmedToday: number;
  changes: number;
  awaitingOutcome: number;
  newInterests: number;
  patients: number;
  confirmedTotal?: number;
  todayTotal?: number;
  todayRevenue?: number;
  todaySubscriptionRevenue?: number;
  totalDailyRevenue?: number;
  todayCompleted?: number;
  todayConfirmed?: number;
  todayPending?: number;
  activeSubscriptionsCount?: number;
  expiringSubscriptionsCount?: number;
}
export interface ClinicSettings {
  name: string;
  subtitle: string;
  phones: string[];
  whatsapp: string;
  address: string;
  city: string;
  demoPrices: boolean;
}
export interface DailyLimitData {
  enabled: boolean;
  showToPatients?: boolean;
  maxPatients: number;
  weekdayLimits: Record<string, number>;
  dateOverrides?: Record<string, number>;
  closedMessage: string;
}

export interface DayCapacityStat {
  date: string;
  weekday: number;
  isOpen?: boolean;
  bookedCount: number;
  limit: number;
  remaining: number;
  percent: number;
  isFull: boolean;
  isCustomDate?: boolean;
  isCustomWeekday?: boolean;
}

export interface CapacityResponse {
  dailyLimit: DailyLimitData;
  todayStats: DayCapacityStat;
  upcomingDays: DayCapacityStat[];
  targetDateStats?: DayCapacityStat | null;
}

export const adminApi = {
  availability: (reference: string, date: string) =>
    request<Availability>(
      `/admin/appointments/${reference}/availability?` + new URLSearchParams({ date }),
    ),
  overview: () => request<Overview>('/admin/overview'),
  verifyQr: (qrData: string) =>
    send<{
      valid: boolean;
      isLegacy: boolean;
      reference: string;
      appointmentId: string;
      name: string;
      phone: string;
      userId: string | null;
      targetUrl: string;
    }>('/admin/appointments/verify-qr', { qrData }),
  appointments: (query: string) =>
    request<{ appointments: AdminAppointment[]; total: number; page: number }>(
      '/admin/booking-list?' + query,
    ),
  decision: (reference: string, body: unknown) =>
    send<AppointmentPublic>(`/admin/appointments/${reference}/decision`, body),
  services: () => request<{ services: Service[] }>('/admin/services'),
  saveService: (s: Service) => send(`/admin/services/${encodeURIComponent(s.id)}`, s, 'PUT'),
  deleteService: (id: string) =>
    send<{ ok: boolean }>(`/admin/services/${encodeURIComponent(id)}`, {}, 'DELETE'),
  articles: () => request<{ articles: Article[] }>('/admin/articles'),
  saveArticle: (a: Article) => send(`/admin/articles/${encodeURIComponent(a.slug)}`, a, 'PUT'),
  deleteArticle: (slug: string) =>
    send<{ ok: boolean }>(`/admin/articles/${encodeURIComponent(slug)}`, {}, 'DELETE'),
  patients: (search = '') =>
    request<{ patients: UserPublic[] }>('/admin/patients?' + new URLSearchParams({ search })),
  createPatient: (data: { name: string; phone: string; password?: string }) =>
    send<{ user: UserPublic; initialPassword: string; recoveryCode: string }>(
      '/admin/patients',
      data,
      'POST',
    ),
  resetPatientPassword: (id: string, password?: string) =>
    send<{ ok: boolean; temporaryPassword: string; patient: UserPublic }>(
      `/admin/patients/${id}/reset-password`,
      { password },
    ),
  interests: () => request<{ interests: InterestPublic[] }>('/admin/program-requests'),
  interest: (id: string, status: string) =>
    send(`/admin/program-requests/${id}`, { status }, 'PATCH'),
  subscriptions: () => request<{ subscriptions: Subscription[] }>('/admin/subscriptions'),
  subscription: (id: string, body: unknown) => send(`/admin/subscriptions/${id}`, body, 'PUT'),
  deleteSubscription: (id: string) => send<{ ok: boolean }>(`/admin/subscriptions/${id}`, {}, 'DELETE'),
  capacity: (days = 14, targetDate?: string) => {
    const params = new URLSearchParams({ days: String(days) });
    if (targetDate) params.set('targetDate', targetDate);
    return request<CapacityResponse>('/admin/capacity?' + params);
  },
  saveCapacity: (body: DailyLimitData) =>
    send<{ ok: boolean; dailyLimit: DailyLimitData }>('/admin/capacity', body, 'PUT'),
  schedule: () => request<ScheduleData>('/admin/schedule'),
  saveSchedule: (s: ScheduleData) => send('/admin/schedule', s, 'PUT'),
  settings: () => request<ClinicSettings>('/admin/settings'),
  saveSettings: (s: ClinicSettings) => send('/admin/settings', s, 'PUT'),
  inbodyList: (search = '') =>
    request<{ records: InBodyRecordPublic[] }>('/admin/inbody?' + new URLSearchParams({ search })),
  saveInbody: (body: unknown) => send<InBodyRecordPublic>('/admin/inbody', body, 'POST'),
  deleteInbody: (id: string) => send<{ ok: boolean }>(`/admin/inbody/${id}`, {}, 'DELETE'),
  prescriptionsList: (search = '') =>
    request<{ prescriptions: PrescriptionPublic[] }>(
      '/admin/prescriptions?' + new URLSearchParams({ search }),
    ),
  savePrescription: (body: unknown) =>
    send<PrescriptionPublic>('/admin/prescriptions', body, 'POST'),
  deletePrescription: (id: string) =>
    send<{ ok: boolean }>(`/admin/prescriptions/${id}`, {}, 'DELETE'),
  audit: () =>
    request<{ events: { _id: string; action: string; target: string; at: string }[] }>(
      '/admin/audit',
    ),
  patientHistory: (identifier: string) =>
    request<PatientHistoryData>(`/admin/patients/${encodeURIComponent(identifier)}/history`),
  addPatientNote: (identifier: string, text: string, patientName?: string) =>
    send<PatientClinicalNote>(`/admin/patients/${encodeURIComponent(identifier)}/notes`, {
      text,
      patientName,
    }),
  stories: () => request<{ stories: SuccessStory[] }>('/admin/stories'),
  saveStory: (s: Partial<SuccessStory> & { id?: string }) =>
    s.id
      ? send<{ story: SuccessStory }>(`/admin/stories/${s.id}`, s, 'PUT')
      : send<{ story: SuccessStory }>('/admin/stories', s, 'POST'),
  deleteStory: (id: string) => send<{ ok: boolean }>(`/admin/stories/${id}`, {}, 'DELETE'),
  uploadStoryImage: (dataUrl: string, filename?: string) =>
    send<{ url: string; name: string; size: number }>(
      '/admin/stories/upload',
      { dataUrl, filename },
      'POST',
    ),
  manual: (body: unknown, key: string) =>
    request('/admin/manual-booking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Idempotency-Key': key },
      body: JSON.stringify(body),
    }),
};

export const publicApi = {
  stories: () => request<{ stories: SuccessStory[] }>('/stories'),
};
