import { ButtonLink } from '../../components/ui';

export function NotFound() {
  return (
    <main className="public-page not-found">
      <span className="latin">404</span>
      <h1>الصفحة غير موجودة.</h1>
      <p>يمكنك الرجوع للرئيسية أو حجز استشارة جديدة.</p>
      <ButtonLink to="/">العودة للرئيسية</ButtonLink>
    </main>
  );
}
