import { lazy } from 'react';

export const AuthPage = lazy(() =>
  import('../features/auth/AuthPage').then((m) => ({ default: m.AuthPage })),
);

export const Account = lazy(() =>
  import('../features/account/Account').then((m) => ({ default: m.Account })),
);

export const AdminLayout = lazy(() =>
  import('../features/admin/layout/AdminLayout').then((m) => ({ default: m.AdminLayout })),
);

export const AdminAppointments = lazy(() =>
  import('../features/admin/appointments/AdminAppointments').then((m) => ({
    default: m.AdminAppointments,
  })),
);

export const AdminPrograms = lazy(() =>
  import('../features/admin/programs/AdminPrograms').then((m) => ({ default: m.AdminPrograms })),
);

export const AdminPatients = lazy(() =>
  import('../features/admin/patients/AdminPatients').then((m) => ({ default: m.AdminPatients })),
);

export const AdminArticles = lazy(() =>
  import('../features/admin/articles/AdminArticles').then((m) => ({ default: m.AdminArticles })),
);

export const AdminSchedule = lazy(() =>
  import('../features/admin/schedule/AdminSchedule').then((m) => ({ default: m.AdminSchedule })),
);
export const AdminCapacity = lazy(() =>
  import('../features/admin/capacity/AdminCapacity').then((m) => ({ default: m.AdminCapacity })),
);

export const AdminSettings = lazy(() =>
  import('../features/admin/settings/AdminSettings').then((m) => ({ default: m.AdminSettings })),
);

export const AdminBmi = lazy(() =>
  import('../features/admin/bmi/AdminBmi').then((m) => ({ default: m.AdminBmi })),
);

export const AdminPatientProfile = lazy(() =>
  import('../features/admin/patients/AdminPatientProfile').then((m) => ({
    default: m.AdminPatientProfile,
  })),
);

export const Booking = lazy(() =>
  import('../features/booking/Booking').then((m) => ({ default: m.Booking })),
);

export const Tracking = lazy(() =>
  import('../features/booking/Tracking').then((m) => ({ default: m.Tracking })),
);

export const AdminStories = lazy(() =>
  import('../features/admin/stories/AdminStories').then((m) => ({ default: m.AdminStories })),
);
