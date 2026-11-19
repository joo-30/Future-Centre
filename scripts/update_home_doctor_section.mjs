import fs from 'fs';
import path from 'path';

const homePath = path.resolve('client/src/features/home/Home.tsx');
let content = fs.readFileSync(homePath, 'utf8');

// 1. Update imports
const oldImports = `import {
  Activity,
  ArrowLeft,
  Award,
  BookOpen,
  Check,
  Clock,
  Compass,
  Heart,
  HeartHandshake,
  HelpCircle,
  Leaf,
  MapPin,
} from 'lucide-react';
import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ProgramInterest } from '../../components/ProgramInterest';
import { ButtonLink, ErrorState, Loading } from '../../components/ui';
import { useCatalog } from '../../hooks/useCatalog';
import { formatPrice } from '../../lib/api';`;

const newImports = `import {
  Activity,
  ArrowLeft,
  Award,
  BookOpen,
  Check,
  Clock,
  Compass,
  Heart,
  HeartHandshake,
  HelpCircle,
  Leaf,
  MapPin,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { WhatsAppIcon } from '../../components/icons/WhatsAppIcon';
import { ProgramInterest } from '../../components/ProgramInterest';
import { ButtonLink, ErrorState, Loading } from '../../components/ui';
import { useCatalog } from '../../hooks/useCatalog';
import { formatPrice, whatsappUrl } from '../../lib/api';`;

content = content.replace(oldImports.replace(/\r?\n/g, '\r\n'), newImports.replace(/\n/g, '\r\n'));

// 2. Update Hero figure
const oldHeroFigure = `          <figure className="clinic-intro-portrait">
            <div className="clinic-intro-image">
              <img
                src="/assets/dr-rana.jpg"
                alt="د. رنا ياسر الشورى"
                width="1200"
                height="1500"
                fetchPriority="high"
              />
            </div>
            <figcaption>
              <div>
                <strong>د. رنا ياسر الشورى</strong>
                <span>أخصائية التغذية العلاجية وتنسيق القوام</span>
              </div>
              <a href="#doctor-profile" aria-label="تعرّفي على د. رنا">
                <ArrowLeft size={19} aria-hidden="true" />
              </a>
            </figcaption>
          </figure>`;

const newHeroFigure = `          <figure className="clinic-intro-portrait">
            <div className="clinic-intro-image">
              <img
                src="/assets/concept_1_consultation_lounge.jpg"
                alt="مركز المستقبل للتغذية العلاجية - استشارات حضورية في كفر الزيات"
                width="1920"
                height="1080"
                fetchPriority="high"
              />
            </div>
            <figcaption>
              <div>
                <strong>مركز المستقبل للتغذية العلاجية</strong>
                <span>بيئة طبية هادئة واستشارات حضورية معتمدة في كفر الزيات</span>
              </div>
              <a href="#doctor-profile" aria-label="تعرّفي على الإشراف الطبي للدكتورة رنا">
                <ArrowLeft size={19} aria-hidden="true" />
              </a>
            </figcaption>
          </figure>`;

content = content.replace(oldHeroFigure.replace(/\r?\n/g, '\r\n'), newHeroFigure.replace(/\n/g, '\r\n'));

// 3. Update Doctor Profile section
const oldDoctorSection = `      <section id="doctor-profile" className="clinic-doctor-profile" aria-labelledby="doctor-profile-title">
        <div>
          <h2 id="doctor-profile-title">د. رنا ياسر الشورى</h2>
          <p>أخصائية التغذية العلاجية والسمنة وتنسيق القوام، وعضو الجمعية المصرية لدراسة السمنة <bdi>(EMASO)</bdi>.</p>
        </div>
        <ul>
          <li><Award size={20} aria-hidden="true" /> ماجستير ودبلومة التغذية الإكلينيكية</li>
          <li><Activity size={20} aria-hidden="true" /> متابعة تكوين الجسم بقياسات <bdi>InBody</bdi></li>
          <li><Heart size={20} aria-hidden="true" /> برامج للوزن والتغذية العلاجية وصحة المرأة</li>
        </ul>
      </section>`;

const newDoctorSection = `      <section id="doctor-profile" className="clinic-doctor-profile" aria-labelledby="doctor-profile-title">
        <div className="doctor-profile-grid">
          <div className="doctor-profile-visual">
            <div className="doctor-photo-card">
              <img
                src="/assets/dr-rana.jpg"
                alt="د. رنا ياسر الشورى - أخصائية التغذية العلاجية وتنسيق القوام"
                width="720"
                height="900"
                loading="lazy"
                className="doctor-main-photo"
              />
              <div className="doctor-badge-floating">
                <div className="badge-emaso-icon">
                  <Award size={18} aria-hidden="true" />
                </div>
                <div>
                  <strong>عضو معتمد (EMASO)</strong>
                  <span>الجمعية المصرية لدراسة السمنة</span>
                </div>
              </div>
            </div>

            <div className="doctor-stats-ribbon">
              <div className="doc-ribbon-item">
                <span className="ribbon-num">+5,000</span>
                <span className="ribbon-lbl">حالة تمت متابعتها</span>
              </div>
              <div className="doc-ribbon-divider" />
              <div className="doc-ribbon-item">
                <span className="ribbon-num">100%</span>
                <span className="ribbon-lbl">أنظمة بدون حرمان</span>
              </div>
              <div className="doc-ribbon-divider" />
              <div className="doc-ribbon-item">
                <span className="ribbon-num">InBody</span>
                <span className="ribbon-lbl">فحص سريري دقيق</span>
              </div>
            </div>
          </div>

          <div className="doctor-profile-details">
            <div className="doctor-kicker">
              <Sparkles size={15} aria-hidden="true" />
              <span>الإشراف الطبي المباشر</span>
            </div>

            <h2 id="doctor-profile-title">د. رنا ياسر الشورى</h2>
            <p className="doctor-subtitle">
              أخصائية التغذية العلاجية، علاج السمنة والنحافة وتنسيق القوام · كفر الزيات
            </p>

            <div className="doctor-philosophy-quote">
              <p>
                «التغذية العلاجية الحقيقية لا تبدأ بالحرمان أو الميزان المجرد، بل بفهم إشارات جسمكِ وأسلوب حياتكِ، لبناء صحة تدوم بهدوء وتوازن.»
              </p>
            </div>

            <ul className="doctor-credentials-list">
              <li>
                <div className="cred-icon-wrap">
                  <Award size={18} aria-hidden="true" />
                </div>
                <div>
                  <strong>ماجستير ودبلومة التغذية الإكلينيكية</strong>
                  <span>خبرة متخصصة في تصميم الأنظمة الغذائية العلاجية وحساب الاحتياجات الأيضية بدقة.</span>
                </div>
              </li>
              <li>
                <div className="cred-icon-wrap">
                  <ShieldCheck size={18} aria-hidden="true" />
                </div>
                <div>
                  <strong>عضو الجمعية المصرية لدراسة السمنة (EMASO)</strong>
                  <span>بروتوكولات علاجية معتمدة وفق الطب المبني على الدليل العلمي بدون أدوية مجهولة أو أنظمة قاسية.</span>
                </div>
              </li>
              <li>
                <div className="cred-icon-wrap">
                  <Activity size={18} aria-hidden="true" />
                </div>
                <div>
                  <strong>فحص تكوين الجسم الطبي المتقدم (InBody)</strong>
                  <span>قياس دقيق لكتلة العضلات، نسب الدهون الحشوية، وسوائل الجسم لضمان خسارة دهون حقيقية.</span>
                </div>
              </li>
              <li>
                <div className="cred-icon-wrap">
                  <Heart size={18} aria-hidden="true" />
                </div>
                <div>
                  <strong>برامج متخصصة لصحة المرأة والتغذية العلاجية</strong>
                  <span>أنظمة مخصصة لتكيس المبايض (PCOS)، مقاومة الإنسولين، الحوامل والمرضعات، وتغذية الأمراض المزمنة.</span>
                </div>
              </li>
            </ul>

            <div className="doctor-cta-actions">
              <Link to="/booking" className="btn-doctor-book">
                <span>احجزي استشارتكِ مع د. رنا</span>
                <ArrowLeft size={18} aria-hidden="true" />
              </Link>
              <a
                href={whatsappUrl(data.clinic.whatsapp, 'مرحبًا د. رنا، أود الاستفسار عن كشف التغذية والمتابعة بالمركز.')}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-doctor-wa"
                aria-label="تواصل مباشر عبر واتساب"
              >
                <WhatsAppIcon size={18} />
                <span>استفسار عبر واتساب</span>
              </a>
            </div>
          </div>
        </div>
      </section>`;

content = content.replace(oldDoctorSection.replace(/\r?\n/g, '\r\n'), newDoctorSection.replace(/\n/g, '\r\n'));

fs.writeFileSync(homePath, content, 'utf8');
console.log('Successfully updated Home.tsx!');
