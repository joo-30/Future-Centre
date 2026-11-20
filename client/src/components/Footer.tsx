import { normalizePhone, type DayHours } from '@future/shared';
import { ArrowLeft, Clock, MapPin, Phone, Stethoscope } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCatalog } from '../hooks/useCatalog';
import { whatsappUrl } from '../lib/api';
import { WhatsAppIcon } from './icons/WhatsAppIcon';
import { Brand } from './ui';

const weekdays = ['الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت', 'الأحد'];
const weekOrder = [6, 7, 1, 2, 3, 4, 5];
const arabicNumber = new Intl.NumberFormat('ar-EG-u-nu-latn', { useGrouping: false });
const arabicMinute = new Intl.NumberFormat('ar-EG-u-nu-latn', { minimumIntegerDigits: 2 });

const footerLinks = [
  ['/about', 'عن المركز'],
  ['/programs', 'البرامج العلاجية'],
  ['/articles', 'المقالات والنصائح الطبية'],
  ['/booking/track', 'متابعة وتأكيد الحجز'],
  ['/account', 'حساب المريض'],
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
      <div className="footer-ambient-glow" aria-hidden="true" />
      <div className="footer-inner">
        <div className="footer-grid">
          {/* Column 1: Clinic Identity & Medical Supervision */}
          <div className="footer-identity">
            <Brand />

            <div className="footer-doctor-badge">
              <span className="doctor-badge-icon" aria-hidden="true">
                <Stethoscope size={15} />
              </span>
              <div className="doctor-badge-text">
                <span className="doctor-badge-role">إشراف طبي متكامل ·</span>
                <strong className="doctor-badge-name">د. رنا ياسر الشورى</strong>
              </div>
            </div>

            <p className="footer-bio">
              عيادة متخصصة في التغذية العلاجية، نحت القوام، وتصميم برامج غذائية وصحية متكاملة تحت إشراف طبي متخصص.
            </p>

            <Link to="/booking" className="footer-cta-pill">
              <span>احجز كشفك الآن</span>
              <ArrowLeft size={15} aria-hidden="true" />
            </Link>
          </div>

          {/* Column 2: Site Navigation Guide */}
          <nav className="footer-discover" aria-labelledby="footer-discover-title">
            <div className="footer-section-head">
              <span className="footer-kicker">تصفح سريع</span>
              <h2 className="footer-heading" id="footer-discover-title">
                دليل الموقع
              </h2>
            </div>
            <ul className="footer-links">
              {footerLinks.map(([to, label]) => (
                <li key={to}>
                  <Link to={to} className="footer-link-item">
                    <span className="footer-link-dot" aria-hidden="true" />
                    <span>{label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Column 3: Contact & Hours Concierge Card */}
          <div className="footer-contact">
            <div className="footer-contact-card">
              <div className="contact-card-head">
                <div>
                  <span className="footer-kicker">رعاية مباشرة</span>
                  <h2 className="footer-heading">العنوان والتواصل</h2>
                </div>
                <div className="contact-live-status">
                  <span className="live-dot-pulse" aria-hidden="true" />
                  <span>العيادة ترحب بكم</span>
                </div>
              </div>

              <ul className="footer-contact-list">
                <li>
                  <a
                    className="footer-contact-row"
                    href={'tel:' + normalizePhone(primaryPhone)}
                  >
                    <span className="contact-row-icon" aria-hidden="true">
                      <Phone size={15} />
                    </span>
                    <div className="contact-row-content">
                      <span className="contact-row-label">الاتصال المباشر</span>
                      <strong className="contact-row-value" dir="ltr">{primaryPhone}</strong>
                    </div>
                  </a>
                </li>
                <li>
                  <Link className="footer-contact-row" to="/contact">
                    <span className="contact-row-icon" aria-hidden="true">
                      <MapPin size={15} />
                    </span>
                    <div className="contact-row-content">
                      <span className="contact-row-label">مقر العيادة</span>
                      <span className="contact-row-value">{clinic?.address || 'كفر الزيات، شارع الجيش عند توكيل أورنج'}</span>
                    </div>
                  </Link>
                </li>
                <li>
                  {hours ? (
                    <div className="footer-contact-row">
                      <span className="contact-row-icon" aria-hidden="true">
                        <Clock size={15} />
                      </span>
                      <div className="contact-row-content">
                        <span className="contact-row-label">أوقات العمل</span>
                        <span className="contact-row-value">{hours.days} · {hours.time}</span>
                      </div>
                    </div>
                  ) : (
                    <Link className="footer-contact-row" to="/booking">
                      <span className="contact-row-icon" aria-hidden="true">
                        <Clock size={15} />
                      </span>
                      <div className="contact-row-content">
                        <span className="contact-row-label">أوقات العمل</span>
                        <span className="contact-row-value">عرض المواعيد المتاحة</span>
                      </div>
                    </Link>
                  )}
                </li>
              </ul>

              <a
                className="footer-whatsapp-btn"
                href={whatsappUrl(
                  whatsappNumber,
                  'أهلًا، أود الاستفسار عن مواعيد مركز المستقبل.',
                )}
                target="_blank"
                rel="noopener noreferrer"
              >
                <WhatsAppIcon />
                <span>واتساب العيادة للاستفسارات</span>
                <ArrowLeft size={15} aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Utility Bar */}
        <div className="footer-utility">
          <p className="footer-copyright">
            © {arabicNumber.format(new Date().getFullYear())} {clinic?.name || 'مركز المستقبل للتغذية والتخسيس'} · جميع الحقوق محفوظة
          </p>

          <nav className="footer-policies" aria-label="سياسات المركز">
            <Link to="/privacy">الخصوصية</Link>
            <span className="policy-divider" aria-hidden="true">·</span>
            <Link to="/appointment-policy">سياسة المواعيد</Link>
          </nav>

          <div className="footer-credit">
            <span className="credit-label">تصميم وتطوير:</span>
            <a
              className="footer-credit-name"
              href={whatsappUrl(
                developerPhone,
                'مرحبًا يوسف، أود الاستفسار عن تصميم وتطوير موقع.',
              )}
              target="_blank"
              rel="noopener noreferrer"
            >
              يوسف إسلام الوكيل
            </a>
            <span className="credit-dot" aria-hidden="true">·</span>
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
