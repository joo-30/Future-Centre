import { Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { RequireAuth } from '../components/Auth';
import { Layout } from '../components/Layout';
import { Loading } from '../components/ui';
import { Home } from '../features/home/Home';
import { About } from '../features/public/About';
import { ArticleDetail } from '../features/public/ArticleDetail';
import { Articles } from '../features/public/Articles';
import { Contact } from '../features/public/Contact';
import { NotFound } from '../features/public/NotFound';
import { Policy } from '../features/public/Policy';
import { ProgramDetail } from '../features/public/ProgramDetail';
import { Programs } from '../features/public/Programs';
import { PageMeta } from './PageMeta';
import {
  Account,
  AdminAppointments,
  AdminArticles,
  AdminBmi,
  AdminCapacity,
  AdminLayout,
  AdminPatientProfile,
  AdminPatients,
  AdminPrograms,
  AdminSchedule,
  AdminSettings,
  AdminStories,
  AuthPage,
  Booking,
  Tracking,
} from './route-pages';

export function App() {
  return (
    <>
      <PageMeta />
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="login" element={<AuthPage />} />
          <Route path="register" element={<AuthPage mode="register" />} />
          <Route path="recover" element={<AuthPage mode="recover" />} />
          <Route
            path="admin"
            element={
              <RequireAuth admin>
                <AdminLayout />
              </RequireAuth>
            }
          >
            <Route index element={<AdminAppointments />} />
            <Route path="appointments" element={<AdminAppointments />} />
            <Route path="programs" element={<AdminPrograms />} />
            <Route path="patients" element={<AdminPatients />} />
            <Route path="patients/:identifier" element={<AdminPatientProfile />} />
            <Route path="patient-file" element={<AdminPatientProfile />} />
            <Route path="articles" element={<AdminArticles />} />
            <Route path="bmi" element={<AdminBmi />} />
            <Route path="capacity" element={<AdminCapacity />} />
            <Route path="schedule" element={<AdminSchedule />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="stories" element={<AdminStories />} />
          </Route>
          <Route element={<Layout />}>
            <Route
              path="account"
              element={
                <RequireAuth>
                  <Account />
                </RequireAuth>
              }
            />
            <Route index element={<Home />} />
            <Route path="programs" element={<Programs />} />
            <Route path="programs/:slug" element={<ProgramDetail />} />
            <Route path="articles" element={<Articles />} />
            <Route path="articles/:slug" element={<ArticleDetail />} />
            <Route path="about" element={<About />} />
            <Route path="contact" element={<Contact />} />
            <Route path="booking" element={<Booking />} />
            <Route path="booking/track" element={<Tracking />} />
            <Route path="privacy" element={<Policy privacy />} />
            <Route path="appointment-policy" element={<Policy />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Suspense>
    </>
  );
}
