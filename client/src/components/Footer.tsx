import { normalizePhone, type DayHours } from '@future/shared';
import { ChevronLeft, Clock, MapPin, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCatalog } from '../hooks/useCatalog';
import { whatsappUrl } from '../lib/api';
import { WhatsAppIcon } from './icons/WhatsAppIcon';
import { Brand } from './ui';

const weekdays = ['الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت', 'الأحد'];
const weekOrder = [6, 7, 1, 2, 3, 4, 5];
const arabicNumber = new Intl.NumberFormat('ar-EG', { useGrouping: false });
const arabicMinute = new Intl.NumberFormat('ar-EG', { minimumIntegerDigits: 2 });

const footerLinks = [
  ['/about', 'عن المركز'],
  ['/programs', 'البرامج'],
  ['/articles', 'المقالات'],
  ['/booking/track', 'متابعة الحجز'],
  ['/account', 'حسابي'],
];

const developerPhone = '01285523418';

function formatTime(time: string) {
  const [hour, minute] = time.split(':').map(Number);
  const clock = arabicNumber.format(hour % 12 || 12);
  const minutes = minute ? ':' + arabicMinute.format(minute) : '';
  return clock + minutes + (hour < 12 ? ' ص' : ' م');
}

function summarizeHours(hours: DayHours[]) {
  const open = hours
    .filter((day) => day.open)
    .sort((a, b) => weekOrder.indexOf(a.weekday) - weekOrder.indexOf(b.weekday));
  const first = open[0];
  if (!first) return null;
  const startIndex = weekOrder.indexOf(first.weekday);
  const isRegular = open.every(
    (day, index) =>
      day.weekday === weekOrder[startIndex + index] &&
      day.start === first.start &&
      day.end === first.end &&
      day.breaks.length === 0,
  );
  if (!isRegular) return null;

  return {
    days:
      open.length === 1
        ? weekdays[first.weekday - 1]
        : weekdays[first.weekday - 1] + ' — ' + weekdays[open[open.length - 1].weekday - 1],
    time: formatTime(first.start) + ' — ' + formatTime(first.end),
  };
}

export function Footer() {
  const { data } = useCatalog();
  const clinic = data?.clinic;
  const primaryPhone = clinic?.phones?.[0] || '01041504201';
  const whatsappNumber = clinic?.whatsapp || '201041504201';
  const hours = clinic && !clinic.demoSchedule ? summarizeHours(clinic.hours) : null;

  return (
    <footer className="site-footer" id="site-footer" dir="rtl">
      <div className="footer-inner">
        <div className="footer-grid">
          <div className="footer-identity">
            <Brand />
            <p className="footer-tagline">عيادة تغذية علاجية ومتابعة.</p>
            <p className="footer-supervision">بإشراف د. رنا ياسر الشورى</p>
          </div>

          <nav className="footer-discover" aria-labelledby="footer-discover-title">
            <h2 className="footer-heading" id="footer-discover-title">
              دليل الموقع
            </h2>
            <ul className="footer-links">
              {footerLinks.map(([to, label]) => (
                <li key={to}>
                  <Link to={to}>
                    <ChevronLeft aria-hidden="true" />
                    <span>{label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="footer-contact">
            <h2 className="footer-heading">العنوان والتواصل</h2>
            <ul className="footer-contact-list">
              <li>
                <a
                  className="footer-contact-line footer-clinic-phone"
                  href={'tel:' + normalizePhone(primaryPhone)}
                >
                  <Phone aria-hidden="true" />
                  <bdi dir="ltr">{primaryPhone}</bdi>
                </a>
              </li>
              <li>
                <Link className="footer-contact-line" to="/contact">
                  <MapPin aria-hidden="true" />
                  <span>{clinic?.address || 'كفر الزيات، شارع الجيش عند توكيل أورنج'}</span>
                </Link>
              </li>
              <li>
                {hours ? (
                  <div className="footer-contact-line footer-hours">
                    <Clock aria-hidden="true" />
                    <div>
                      <span>{hours.days}</span>
                      <span>{hours.time}</span>
                    </div>
                  </div>
                ) : (
                  <Link className="footer-contact-line" to="/booking">
                    <Clock aria-hidden="true" />
                    <span>عرض المواعيد المتاحة</span>
                  </Link>
                )}
              </li>
              <li>
                <a
                  className="footer-contact-line footer-whatsapp"
                  href={whatsappUrl(
                    whatsappNumber,
                    'أهلًا، أود الاستفسار عن مواعيد مركز المستقبل.',
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <WhatsAppIcon />
                  <span>واتساب العيادة</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-utility">
          <p className="footer-copyright">
            © {arabicNumber.format(new Date().getFullYear())} {clinic?.name || 'مركز المستقبل'}
          </p>
          <nav className="footer-policies" aria-label="سياسات المركز">
            <Link to="/privacy">الخصوصية</Link>
            <Link to="/appointment-policy">سياسة المواعيد</Link>
          </nav>
          <div className="footer-credit">
            <p>
              <span>تصميم وتطوير</span>
              <a
                className="footer-credit-name"
                href={whatsappUrl(
                  developerPhone,
                  'مرحبًا يوسف، أود الاستفسار عن تصميم وتطوير موقع.',
                )}
                target="_blank"
                rel="noopener noreferrer"
              >
                يوسف إسلام الوكيل<span className="sr-only"> — واتساب</span>
              </a>
            </p>
            <a
              className="footer-credit-phone"
              href={'tel:' + normalizePhone(developerPhone)}
              dir="ltr"
            >
              {developerPhone}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
