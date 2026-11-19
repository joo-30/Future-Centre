import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { WhatsAppIcon } from '../../../components/icons/WhatsAppIcon';
import { whatsappUrl } from '../../../lib/api';
import { Faq } from './Faq';

export function ClosingSection({ whatsappNumber }: { whatsappNumber: string }) {
  return (
    <section className="closing-section" id="questions" aria-labelledby="closing-title">
      <div className="closing-overview">
        <header className="closing-heading">
          <p className="closing-eyebrow">قبل خطوتكِ الأولى</p>
          <h2 id="closing-title">
            <span>كل شيء أوضح.</span>
            <span>من البداية.</span>
          </h2>
          <p className="closing-description">إجابات بسيطة عن الحجز والمتابعة.</p>
          <div className="closing-ribbon" aria-hidden="true">
            <img
              src="/assets/closing-ivory-ribbon.webp"
              alt=""
              width="900"
              height="600"
              loading="lazy"
              decoding="async"
            />
          </div>
        </header>
        <Faq />
      </div>

      <section className="closing-booking" aria-labelledby="closing-booking-title">
        <div className="closing-booking-copy">
          <h3 id="closing-booking-title">
            <span>خطوة صغيرة.</span>
            <span>تناسب حياتكِ.</span>
          </h3>
          <p>اختاري موعدكِ، ونبدأ معكِ من فهم احتياجكِ.</p>
        </div>
        <div className="closing-booking-actions">
          <Link to="/booking" className="closing-booking-primary">
            احجزي موعدكِ <ArrowLeft size={24} aria-hidden="true" />
          </Link>
          <a
            href={whatsappUrl(
              whatsappNumber,
              'مرحباً د. رنا، أود الاستفسار عن الحجز والمتابعة في مركز المستقبل.',
            )}
            className="closing-booking-whatsapp"
            target="_blank"
            rel="noopener noreferrer"
          >
            <WhatsAppIcon size={26} /> اسألي على واتساب
          </a>
          <p className="closing-booking-note">الموعد بيتأكد بعد مراجعة المركز</p>
        </div>
        <div className="closing-booking-art" aria-hidden="true">
          <img
            src="/assets/closing-calendar-ribbon.webp"
            alt=""
            width="800"
            height="600"
            loading="lazy"
            decoding="async"
          />
        </div>
      </section>
    </section>
  );
}
