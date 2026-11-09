import { MapPin } from 'lucide-react';
import { ContactNumbers } from '../../components/Layout';
import { PublicIntro } from '../../components/PublicIntro';
import { ButtonLink, ErrorState, Loading, WhatsAppLink } from '../../components/ui';
import { useCatalog } from '../../hooks/useCatalog';

export function Contact() {
  const { data, isPending, error, refetch } = useCatalog();
  if (isPending) return <Loading />;
  if (!data)
    return (
      <ErrorState message={error?.message || 'تعذر التحميل.'} onRetry={() => void refetch()} />
    );
  return (
    <main className="public-page">
      <PublicIntro kicker="تواصلي مع المركز" title="نساعدك في الخطوة الجاية.">
        اسألي عن البرامج أو احجزي موعدًا، وسيتواصل المركز معك لتأكيد التفاصيل.
      </PublicIntro>
      <div className="contact-page-grid">
        <section className="panel dark">
          <span className="kicker">مركز المستقبل</span>
          <h2>يسعدنا تواصلك.</h2>
          <div className="contact-address">
            <MapPin />
            <div>
              <h3>العنوان</h3>
              <p>{data.clinic.address}</p>
            </div>
          </div>
          <ContactNumbers />
          <WhatsAppLink
            phone={data.clinic.whatsapp}
            message="أهلًا، أود الاستفسار عن خدمات مركز المستقبل."
            kind="lime"
          >
            فتح واتساب
          </WhatsAppLink>
        </section>
        <section className="panel">
          <span className="kicker">زيارة المركز</span>
          <h2>اختاري موعدًا مناسبًا.</h2>
          <p className="muted mt-5">
            تظهر الأوقات المتاحة في صفحة الحجز. طلب الموعد يحتاج مراجعة وتأكيد المركز.
          </p>
          {data.clinic.demoSchedule && (
            <div className="note mt-6">
              أوقات الحجز في النسخة الحالية تجريبية لحين اعتماد ساعات العمل.
            </div>
          )}
          <div className="mt-6">
            <ButtonLink to="/booking">عرض الأوقات المتاحة</ButtonLink>
          </div>
          <div className="rule" />
          <p className="small muted">
            للسؤال عن العنوان أو أقرب علامة مميزة، اتصلي بأي من الرقمين.
          </p>
        </section>
      </div>
    </main>
  );
}
