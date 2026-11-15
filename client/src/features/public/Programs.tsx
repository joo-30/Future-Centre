import type { Service } from '@future/shared';
import { ArrowLeft, Calendar, Check, MapPin } from 'lucide-react';
import { useRef, useState } from 'react';
import { gsap, isReducedMotion, useGSAP } from '../../lib/motion';
import { ProgramInterest } from '../../components/ProgramInterest';
import { PublicIntro } from '../../components/PublicIntro';
import { ErrorState, icons, Loading, TextLink } from '../../components/ui';
import { useCatalog } from '../../hooks/useCatalog';
import { formatPrice } from '../../lib/api';

export function Programs() {
  const mainRef = useRef<HTMLElement>(null);


  const { data, isPending, error, refetch } = useCatalog();
  const [interest, setInterest] = useState<Service | null>(null);

  useGSAP(
    () => {
      if (isReducedMotion() || !mainRef.current || !data) return;
      const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
      tl.fromTo('.public-intro', { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.65 })
        .fromTo('.program-detail-card', { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.7, stagger: 0.1 }, '-=0.35');
    },
    { scope: mainRef, dependencies: [data] }
  );
  if (isPending) return <Loading />;
  if (!data)
    return (
      <ErrorState
        message={error?.message || 'تعذر تحميل البرامج.'}
        onRetry={() => void refetch()}
      />
    );
  return (
    <main ref={mainRef} className="public-page">
      <PublicIntro kicker="رعاية مصممة حولك" title="اختاري البداية المناسبة لك.">
        كل برنامج يبدأ بفهم احتياجاتك. أرسلي طلبك وسيوضح المركز التفاصيل معك.
      </PublicIntro>
      {data.clinic.demoPrices && (
        <p className="demo-notice">الأسعار الحالية توضيحية لحين اعتماد المركز.</p>
      )}
      <div className="program-list-grid">
        {data.services.map((s) => {
          const Icon = icons[s.icon];
          return (
            <article className={'program-detail-card ' + (s.featured ? 'featured' : '')} key={s.id}>
              <span className="service-symbol">
                <Icon size={29} />
              </span>
              <div className="program-venue-pill">
                <MapPin size={13} />
                <span>حضور شخصي بالعيادة · {data.clinic.address || 'كفر الزيات، شارع الجيش عند توكيل أورنج'}</span>
              </div>
              <h2>{s.title}</h2>
              <p>{s.description}</p>
              <ul>
                {s.includes.map((x) => (
                  <li key={x}>
                    <Check size={18} />
                    {x}
                  </li>
                ))}
              </ul>
              <div className="between">
                <span className="row small">
                  <Calendar size={17} />
                  {s.period}
                </span>
                <span className="price">
                  {formatPrice(s.price)}
                  {s.price !== null && <small> ج.م{data.clinic.demoPrices && ' · سعر توضيحي'}</small>}
                </span>
              </div>
              <div className="col mt-6">
                <button
                  className={'btn ' + (s.featured ? 'lime' : '')}
                  onClick={() => setInterest(s)}
                >
                  طلب البرنامج
                  <ArrowLeft size={20} />
                </button>
                <TextLink to={'/programs/' + s.slug}>التفاصيل كاملة</TextLink>
              </div>
            </article>
          );
        })}
      </div>
      <ProgramInterest program={interest} onClose={() => setInterest(null)} />
    </main>
  );
}
