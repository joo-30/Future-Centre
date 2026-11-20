import { type Service } from '@future/shared';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ProgramInterest } from '../../../components/ProgramInterest';
import { formatPrice } from '../../../lib/api';
import { clinicServiceArtwork, clinicServiceRank, clinicServiceTitle } from '../../../lib/clinic-presentation';

const serviceNumbers = new Intl.NumberFormat('ar-EG-u-nu-latn');

export function ClinicServices({
  services,
  demoPrices,
}: {
  services: Service[];
  demoPrices: boolean;
}) {
  const [interest, setInterest] = useState<Service | null>(null);
  const orderedServices = [...services].sort(
    (a, b) => clinicServiceRank(a.id) - clinicServiceRank(b.id),
  );
  const featuredService = services.find((service) => service.featured);

  return (
    <section
      className="clinic-services"
      id="clinic-services"
      aria-labelledby="clinic-services-title"
    >
      <header className="clinic-section-heading">
        <div>
          <h2 id="clinic-services-title">خدمات العيادة</h2>
          <p>اختاري البداية المناسبة ليكِ.</p>
        </div>
        <Link to="/programs" className="clinic-section-link">
          كل البرامج <ArrowLeft size={19} aria-hidden="true" />
        </Link>
      </header>

      {orderedServices.length ? (
        <ul className="clinic-service-list" role="list">
          {orderedServices.map((service) => {
            const isConsultation = service.id === 'nutrition';
            const isMonthly = service.id === 'monthly';
            const isProgram = (isMonthly || service === featuredService) && !isConsultation;
            const artwork = clinicServiceArtwork.get(service.id);
            const title = clinicServiceTitle(service.title);
            const duration = serviceNumbers.format(service.duration);

            return (
              <li
                key={service.id}
                className={`clinic-service${artwork ? ' has-art' : ''}${isMonthly ? ' is-monthly' : ''}${isConsultation ? ' is-consultation' : ''}`}
              >
                {artwork && (
                  <img
                    className="clinic-service-art"
                    src={artwork}
                    alt=""
                    loading="lazy"
                    decoding="async"
                  />
                )}
                <div className="clinic-service-copy">
                  {isConsultation && <p className="clinic-service-badge">لأول زيارة</p>}
                  <h3>{title}</h3>
                  {!artwork && <p className="clinic-service-description">{service.description}</p>}
                  <p className="clinic-service-duration">
                    {service.sessions > 1 && (
                      <>
                        <span>
                          {serviceNumbers.format(service.sessions)}{' '}
                          {service.sessions > 10 || service.sessions === 2 ? 'جلسة' : 'جلسات'}
                        </span>
                        <span aria-hidden="true">·</span>
                      </>
                    )}
                    <span>
                      {duration} دقيقة{service.sessions > 1 && ' للجلسة'}
                    </span>
                  </p>
                </div>

                <div className="clinic-service-footer">
                  <p
                    className={`clinic-service-price${service.price === null ? ' is-unpriced' : ''}`}
                  >
                    <bdi>
                      {service.price === null
                        ? formatPrice(service.price)
                        : serviceNumbers.format(service.price)}
                    </bdi>
                    {service.price !== null && <span>ج.م</span>}
                  </p>
                  <div className="clinic-service-actions">
                    {isProgram ? (
                      <button
                        type="button"
                        className="clinic-service-action"
                        onClick={() => setInterest(service)}
                      >
                        طلب البرنامج <ArrowLeft size={19} aria-hidden="true" />
                      </button>
                    ) : (
                      <Link className="clinic-service-action" to={'/booking?service=' + service.id}>
                        {isConsultation ? 'احجزي الكشف' : 'طلب موعد'}{' '}
                        <ArrowLeft size={19} aria-hidden="true" />
                      </Link>
                    )}
                    <Link
                      className="clinic-service-details"
                      to={'/programs/' + service.slug}
                      aria-label={`تفاصيل ${title}`}
                    >
                      التفاصيل
                    </Link>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p>
          تواصلي معنا للتعرّف على{' '}
          <Link className="clinic-section-link" to="/contact">
            الخدمات المتاحة
          </Link>
          .
        </p>
      )}

      {demoPrices && services.some((service) => service.price !== null) && (
        <p className="clinic-service-demo">الأسعار توضيحية</p>
      )}
      <ProgramInterest program={interest} onClose={() => setInterest(null)} />
    </section>
  );
}
