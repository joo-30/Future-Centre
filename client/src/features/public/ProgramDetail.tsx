import type { Service } from '@future/shared';
import { ArrowLeft, Calendar, Clock, MapPin } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ProgramInterest } from '../../components/ProgramInterest';
import { PublicIntro } from '../../components/PublicIntro';
import { ButtonLink, ErrorState, Loading } from '../../components/ui';
import { useCatalog } from '../../hooks/useCatalog';
import { formatPrice } from '../../lib/api';
import { NotFound } from './NotFound';

export function ProgramDetail() {
  const { slug } = useParams();
  const { data, isPending, error, refetch } = useCatalog();
  const [interest, setInterest] = useState<Service | null>(null);
  if (isPending) return <Loading />;
  if (!data)
    return (
      <ErrorState message={error?.message || 'تعذر التحميل.'} onRetry={() => void refetch()} />
    );
  const s = data.services.find((s) => s.slug === slug);
  if (!s) return <NotFound />;
  return (
    <main className="public-page">
      <div className="crumb">
        <Link to="/programs">البرامج</Link> / {s.title}
      </div>
      <div className="detail-page-grid">
        <article>
          <PublicIntro kicker="برنامج من مركز المستقبل" title={s.title}>
            {s.description}
          </PublicIntro>
          <div className="prose">
            {s.body.map((p) => (
              <p key={p}>{p}</p>
            ))}
            <h2>ماذا يتضمن البرنامج؟</h2>
            <ul>
              {s.includes.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </div>
        </article>
        <aside className="panel service-booking-card">
          <img
            src={'/assets/' + (s.featured ? 'food-editorial.png' : 'consultation.png')}
            alt="صورة تعبيرية للرعاية الغذائية"
          />
          <h3>بداية واضحة.</h3>
          <p className="row small muted">
            <MapPin size={18} />
            حضور بالعيادة · {data.clinic.address || 'كفر الزيات، شارع الجيش عند توكيل أورنج'}
          </p>
          <p className="row small muted">
            <Clock size={18} />
            مدة الجلسة: {s.duration} دقيقة
          </p>
          <p className="row small muted">
            <Calendar size={18} />
            {s.period} · {s.sessions} {s.sessions === 1 ? 'جلسة' : 'جلسات'}
          </p>
          <div className="price">
            {formatPrice(s.price)} <small>ج.م</small>
          </div>
          {data.clinic.demoPrices && <p className="small muted">سعر توضيحي لحين الاعتماد.</p>}
          <ButtonLink to={'/booking?service=' + s.id}>
            {s.id === 'nutrition' ? 'حجز كشف عيادة' : 'حجز موعد بالعيادة'}
          </ButtonLink>
          <button className="link" onClick={() => setInterest(s)}>
            طلب معلومات عن البرنامج
            <ArrowLeft size={19} />
          </button>
          <p className="small muted">تأكيد التفاصيل مع المركز · دون دفع إلكتروني.</p>
        </aside>
      </div>
      <ProgramInterest program={interest} onClose={() => setInterest(null)} />
    </main>
  );
}
