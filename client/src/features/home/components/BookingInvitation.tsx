import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { WhatsAppIcon } from '../../../components/icons/WhatsAppIcon';
import { whatsappUrl } from '../../../lib/api';

export function BookingInvitation({ whatsappNumber }: { whatsappNumber: string }) {
  return (
    <section
      className="booking-invitation"
      id="start-your-journey"
      aria-labelledby="booking-invitation-title"
    >
      <div className="booking-invitation-inner">
        <div className="booking-invitation-content">
          <h2 className="booking-invitation-title" id="booking-invitation-title">
            جاهزة تبدأي رحلتكِ؟
          </h2>
          <p>ابدئي بكشف مع د. رنا، وحددوا سوا الخطوة اللي تناسب يومكِ.</p>
        </div>
        <div className="booking-invitation-actions">
          <Link to="/booking" className="booking-invitation-primary">
            احجزي كشفكِ <ArrowLeft size={19} aria-hidden="true" />
          </Link>
          <a
            href={whatsappUrl(
              whatsappNumber,
              'مرحبًا، أود الاستفسار عن أول كشف مع د. رنا في مركز المستقبل.',
            )}
            className="booking-invitation-whatsapp"
            target="_blank"
            rel="noopener noreferrer"
          >
            <WhatsAppIcon size={19} /> اسألي على واتساب
          </a>
        </div>
        <img
          className="booking-invitation-art"
          src="/assets/booking-invitation-sculpture.webp"
          alt=""
          width="960"
          height="1200"
          loading="lazy"
          decoding="async"
        />
      </div>
    </section>
  );
}
