import { MapPin } from 'lucide-react';
import { useRef } from 'react';
import { gsap, isReducedMotion, useGSAP } from '../../lib/motion';
import { ContactNumbers } from '../../components/Layout';
import { PublicIntro } from '../../components/PublicIntro';
import { ButtonLink, ErrorState, Loading, WhatsAppLink } from '../../components/ui';
import { useCatalog } from '../../hooks/useCatalog';

export function Contact() {
  const mainRef = useRef<HTMLElement>(null);


  const { data, isPending, error, refetch } = useCatalog();

  useGSAP(
    () => {
      if (isReducedMotion() || !mainRef.current || !data) return;
      const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
      tl.fromTo('.public-intro', { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.65 })
        .fromTo('.contact-page-grid .panel', { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.7, stagger: 0.12 }, '-=0.35');
    },
    { scope: mainRef, dependencies: [data] }
  );
  if (isPending) return <Loading />;
  if (!data)
    return (
      <ErrorState message={error?.message || 'تعذر التحميل.'} onRetry={() => void refetch()} />
    );
  return (
    <main ref={mainRef} className="public-page">
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
