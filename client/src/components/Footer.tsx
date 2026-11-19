import { PwaInstallButton } from './pwa/PwaInstallButton';
import { normalizePhone } from '@future/shared';
import {
  Award,
  Clock,
  Code2,
  Heart,
  MapPin,
  Phone,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCatalog } from '../hooks/useCatalog';
import { whatsappUrl } from '../lib/api';
import { WhatsAppIcon } from './icons/WhatsAppIcon';
import { Brand } from './ui';

export function Footer() {
  const { data } = useCatalog();
  const clinic = data?.clinic;

  const primaryPhone = clinic?.phones?.[0] || '01041504201';
  const whatsappNumber = clinic?.whatsapp || '201041504201';

  return (
    <footer className="site-footer">
      {/* Main Footer Multi-Column Grid */}
      <div className="footer-main-wrap">
        <div className="footer-grid">
          {/* Column 1: Clinic Brand & Doctor Credentials */}
          <div className="footer-col col-brand">
            <div className="footer-brand-header">
              <Brand />
            </div>
            <p className="footer-bio">
              مركز متكامل للتغذية الإكلينيكية وعلاج السمنة وتنسيق القوام بإشراف{' '}
              <strong>د. رنا ياسر الشوري</strong>. خطط واقعية مرنة بدون حرمان مع أحدث أجهزة الفحص المعتمدة.
            </p>

            <div className="doctor-emaso-badge" title="عضو الجمعية المصرية لدراسة السمنة">
              <Award size={18} className="badge-icon" />
              <div>
                <strong>د. رنا ياسر الشوري</strong>
                <span>عضو الجمعية المصرية لدراسة السمنة (EMASO)</span>
              </div>
            </div>
          </div>

          {/* Column 2: Quick Navigation Links */}
          <div className="footer-col col-links">
            <h3 className="footer-col-title">روابط سريعة</h3>
            <ul className="footer-links-list">
              <li>
                <Link to="/">الرئيسية</Link>
              </li>
              <li>
                <Link to="/booking">احجزي موعدكِ الآن</Link>
              </li>
              <li>
                <Link to="/booking/track">متابعة حالة الحجز والتذكرة</Link>
              </li>
              <li>
                <Link to="/programs">برامج التغذية والمتابعة</Link>
              </li>
              <li>
                <Link to="/articles">نصائح ومقالات التغذية</Link>
              </li>
              <li>
                <Link to="/about">عن دكتورة رنا والمركز</Link>
              </li>
              <li>
                <Link to="/account">بوابة المريض وسجل القياسات</Link>
              </li>
             
            </ul>
          </div>

          {/* Column 3: Medical Specialties & Services */}
          <div className="footer-col col-services">
            <h3 className="footer-col-title">الخدمات العلاجية</h3>
            <ul className="footer-services-list">
              <li>علاج السمنة والنحافة للكبار والأطفال</li>
              <li>برامج مقاومة الإنسولين وتكيس المبايض (PCOS)</li>
              <li>فحص الـ InBody المتقدم وتحليل مكونات الجسم</li>
              <li>جلسات نحت وتنسيق القوام (Cryo / Cavitation)</li>
              <li>تغذية الحوامل والمرضعات والرياضيين</li>
              <li>برامج التثبيت والحفاظ على الوزن المثالي</li>
            </ul>
          </div>

          {/* Column 4: Contact & Working Hours */}
          <div className="footer-col col-contact">
            <h3 className="footer-col-title">مواعيد العمل والعنوان</h3>
            
            <div className="footer-contact-items">
              <div className="contact-item">
                <MapPin size={18} className="item-icon" />
                <span>{clinic?.address || 'كفر الزيات، شارع الجيش — برج الأطباء'}</span>
              </div>

              <div className="contact-item">
                <Clock size={18} className="item-icon" />
                <div>
                  <strong>السبت إلى الخميس:</strong>
                  <span>1:00 ظهراً — 9:00 مساءً (الحجز مسبقاً)</span>
                </div>
              </div>

              <div className="contact-item">
                <Phone size={18} className="item-icon" />
                <div className="phones-row">
                  <a href={`tel:${normalizePhone(primaryPhone)}`} dir="ltr" className="phone-link">
                    {primaryPhone}
                  </a>
                  {clinic?.phones?.[1] && (
                    <>
                      <span className="phone-sep">·</span>
                      <a href={`tel:${normalizePhone(clinic.phones[1])}`} dir="ltr" className="phone-link">
                        {clinic.phones[1]}
                      </a>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Direct Connect Buttons */}
            <div className="footer-social-row p-2 pb-5">
              <a
                href={whatsappUrl(whatsappNumber, 'أهلاً دكتورة رنا، أود الاستفسار عن كشوفات ومواعيد مركز المستقبل.')}
                target="_blank"
                rel="noopener noreferrer"
                className="social-btn whatsapp-btn"
                title="تواصل مباشر عبر واتساب"
                aria-label="واتساب"
              >
                <WhatsAppIcon size={17} color="#ffffff" />
                <span>واتساب العيادة</span>
              </a>

              <Link to="/contact" className="social-btn contact-btn" title="صفحة التواصل">
                <span>تواصل معنا ↗</span>
              </Link>
            </div>
            <PwaInstallButton />
          </div>
        </div>
      </div>

      {/* 3. Bottom Legal & Copyright Bar */}
      <div className="footer-bottom-bar">
        <div className="footer-bottom-container">
          <p className="copyright-text">
            © {new Date().getFullYear()} مركز المستقبل للتغذية العلاجية — د. رنا ياسر الشوري. جميع الحقوق محفوظة.
          </p>

          <nav className="footer-legal-nav" aria-label="الروابط القانونية">
            <Link to="/privacy">سياسة الخصوصية</Link>
            <span className="legal-dot">·</span>
            <Link to="/appointment-policy">سياسة المواعيد</Link>
            <span className="legal-dot">·</span>
            <Link to="/contact">تواصل معنا</Link>
          </nav>

          <div className="footer-motto">
            <Heart size={14} className="motto-heart" />
            <span>رعاية تبدأ بفهمك · نتائج تستمر</span>
          </div>
        </div>

        {/* Developer Credit & Business Contact */}
        <div className="footer-developer-strip">
          <div className="dev-credit-info">
            <Code2 size={13} className="dev-icon" />
            <span>تصميم وتطوير:</span>
            <strong className="dev-name">يوسف إسلام الوكيل</strong>
          </div>

          <span className="dev-sep">·</span>

          <div className="dev-actions">
            <a
              href="tel:01285523418"
              className="dev-phone"
              dir="ltr"
              title="اتصال مباشر بالمهندس يوسف إسلام"
            >
              01285523418
            </a>

            <span className="dev-sep">·</span>

            <a
              href={whatsappUrl(
                '01285523418',
                'السلام عليكم يا باشمهندس يوسف، شفت موقع مركز المستقبل وعاجبني السيستم، وحابب أستفسر عن تصميم وبرمجة موقع / نظام خاص بيا.'
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="dev-whatsapp-btn"
              title="تواصل واتساب لطلب موقعك أو نظامك البرمجي"
            >
              <WhatsAppIcon size={13} color="#25D366" />
              <span>طلب موقعك (واتساب) ↗</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
