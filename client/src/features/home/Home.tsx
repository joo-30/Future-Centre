import { resolveArticleImage, type Service } from '@future/shared';
import {
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
import { formatPrice } from '../../lib/api';
import { gsap, isReducedMotion, useGSAP } from '../../lib/motion';
import { CareGuideQuiz } from './components/CareGuideQuiz';
import { Faq } from './components/Faq';
import { SuccessStoriesSection } from './components/SuccessStoriesSection';

export function Home() {
  const { data, isPending, error, refetch } = useCatalog();
  const [interest, setInterest] = useState<Service | null>(null);
  const mainRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (isPending || !data || !mainRef.current) return;
      if (isReducedMotion()) return;

      // Articles Section
      gsap.fromTo(
        '.articles-section .journal-feature-card, .articles-section .journal-item-card',
        { opacity: 0, y: 18 },
        {
          scrollTrigger: {
            trigger: '.articles-section',
            start: 'top 85%',
            once: true,
          },
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.09,
          ease: 'power2.out',
        }
      );

      // Close Section
      gsap.fromTo(
        '.close-faq-col, .final-invite-pro',
        { opacity: 0, y: 20 },
        {
          scrollTrigger: {
            trigger: '.close-section',
            start: 'top 85%',
            once: true,
          },
          opacity: 1,
          y: 0,
          duration: 0.75,
          stagger: 0.12,
          ease: 'power2.out',
        }
      );
    },
    { scope: mainRef, dependencies: [isPending, data] }
  );

  if (isPending) return <Loading />;
  if (error || !data)
    return (
      <ErrorState message={error?.message || 'حاولي لاحقًا.'} onRetry={() => void refetch()} />
    );
  const featuredService = data.services.find((service) => service.featured) ?? data.services[0];
  const services = featuredService
    ? [featuredService, ...data.services.filter((service) => service.id !== featuredService.id)]
    : [];
  const journal = data.articles.find((a) => a.slug === 'meal-planning') || data.articles[0];
  return (
    <main ref={mainRef} className="home-body">
      <section className="clinic-intro" aria-labelledby="clinic-intro-title">
        <div className="clinic-intro-grid">
          <div className="clinic-intro-copy">
            <p className="clinic-intro-location">
              <MapPin size={17} aria-hidden="true" /> {data.clinic.city || 'كفر الزيات'}
            </p>
            <h1 id="clinic-intro-title">
              تغذية علاجية
              <span>تناسب حياتكِ.</span>
            </h1>
            <p className="clinic-intro-lead">
              نبدأ بفهم جسمكِ وعاداتكِ، ونبني معكِ خطة تغذية نتابعها خطوة بخطوة.
            </p>
            <div className="clinic-intro-actions">
              <Link to="/booking" className="clinic-intro-book">
                احجزي موعدكِ <ArrowLeft size={20} aria-hidden="true" />
              </Link>
              <Link to="/programs" className="clinic-intro-programs">
                استكشفي البرامج
              </Link>
            </div>
            <p className="clinic-intro-confirm">الموعد يتأكد بعد مراجعة المركز.</p>
          </div>

          <figure className="clinic-intro-portrait">
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
          </figure>
        </div>
      </section>

      <section className="clinic-services" aria-labelledby="clinic-services-title">
        <header className="clinic-section-heading">
          <div>
            <h2 id="clinic-services-title">خدمات العيادة</h2>
            <p>الكشف والبرامج بالحضور في مقر المركز. الدفع في العيادة.</p>
          </div>
          <Link to="/programs" className="clinic-section-link">
            كل البرامج <ArrowLeft size={17} aria-hidden="true" />
          </Link>
        </header>
        {services.length ? (
          <ul className="clinic-service-list">
            {services.map((service) => (
              <li key={service.id} className="clinic-service">
                <div className="clinic-service-main">
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
                </div>
                <div className="clinic-service-meta">
                  <span>{service.period} · {service.duration} دقيقة للجلسة</span>
                  <strong>
                    <bdi>{formatPrice(service.price)}</bdi>
                    {service.price !== null && ' ج.م'}
                  </strong>
                  {service.price !== null && data.clinic.demoPrices && <span>سعر توضيحي</span>}
                </div>
                <div className="clinic-service-actions">
                  {service === featuredService ? (
                    <button type="button" className="clinic-service-action" onClick={() => setInterest(service)}>
                      طلب البرنامج
                    </button>
                  ) : (
                    <Link className="clinic-service-action" to={'/booking?service=' + service.id}>
                      طلب موعد
                    </Link>
                  )}
                  <Link className="clinic-section-link" to={'/programs/' + service.slug}>
                    تفاصيل الخدمة <ArrowLeft size={15} aria-hidden="true" />
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>تواصلي معنا للتعرّف على <Link className="clinic-section-link" to="/contact">الخدمات المتاحة</Link>.</p>
        )}
      </section>

      <section className="clinic-visit" aria-labelledby="clinic-visit-title">
        <header className="clinic-section-heading">
          <div>
            <h2 id="clinic-visit-title">من أول كشف للمتابعة</h2>
            <p>كل خطوة بتبدأ من احتياجكِ وظروف يومكِ.</p>
          </div>
          <Link to="/about" className="clinic-section-link">
            عن المركز <ArrowLeft size={17} aria-hidden="true" />
          </Link>
        </header>
        <ol>
          <li>
            <HeartHandshake size={24} aria-hidden="true" />
            <h3>نفهم حالتكِ</h3>
            <p>نسمع أهدافكِ وعاداتكِ ونقيّم احتياجكِ في الزيارة الأولى.</p>
          </li>
          <li>
            <Compass size={24} aria-hidden="true" />
            <h3>نتفق على خطة</h3>
            <p>نختار معكِ خطوات تناسب يومكِ والأكل المتاح لكِ.</p>
          </li>
          <li>
            <Activity size={24} aria-hidden="true" />
            <h3>نتابع التقدّم</h3>
            <p>نراجع القياسات ونعدّل الخطة حسب استجابتكِ.</p>
          </li>
        </ol>
      </section>

      <section id="doctor-profile" className="clinic-doctor-profile" aria-labelledby="doctor-profile-title">
        <div>
          <h2 id="doctor-profile-title">د. رنا ياسر الشورى</h2>
          <p>أخصائية التغذية العلاجية والسمنة وتنسيق القوام، وعضو الجمعية المصرية لدراسة السمنة <bdi>(EMASO)</bdi>.</p>
        </div>
        <ul>
          <li><Award size={20} aria-hidden="true" /> ماجستير ودبلومة التغذية الإكلينيكية</li>
          <li><Activity size={20} aria-hidden="true" /> متابعة تكوين الجسم بقياسات <bdi>InBody</bdi></li>
          <li><Heart size={20} aria-hidden="true" /> برامج للوزن والتغذية العلاجية وصحة المرأة</li>
        </ul>
      </section>

      {/* قصص وتجارب النجاح والتحولات */}
      <SuccessStoriesSection />

      {/* مرشد البداية التفاعلي مع د. رنا */}
      <CareGuideQuiz whatsappNumber={data.clinic.whatsapp} />

      <section className="articles-section">
        <div className="section-top">
          <div>
            <div className="kicker">
              <BookOpen size={14} />
              <span>مفكرة التغذية والعافية</span>
            </div>
            <h2>معرفة طبية مبسّطة تخفّف تعقيد يومكِ.</h2>
            <p className="articles-section-sub">
              مقالات وإرشادات علمية موثوقة بإشراف د. رنا الشورى لمساعدتكِ في فهم جسدكِ واختيار غذائكِ بوعي وهدوء.
            </p>
          </div>
          <ButtonLink to="/articles" kind="outline" className="btn-all-articles">
            <span>كل المقالات</span>
          </ButtonLink>
        </div>

        <div className="journal-layout-pro">
          {journal && (
            <article className="journal-feature-card">
              <div className="jfc-image-wrap">
                <img
                  src={resolveArticleImage(journal.image)}
                  alt={journal.title}
                  width="1536"
                  height="1024"
                  loading="lazy"
                />
                <span className="jfc-category-badge">
                  {journal.category}
                </span>
              </div>
              <div className="jfc-body">
                <div className="jfc-meta">
                  <span className="jfc-read-time">
                    <Clock size={13} />
                    <span>قراءة {journal.minutes} دقائق</span>
                  </span>
                  <span className="jfc-dot" />
                  <span className="jfc-author">إشراف طبي د. رنا الشورى</span>
                </div>
                <h3 className="jfc-title">
                  <Link to={'/articles/' + journal.slug}>{journal.title}</Link>
                </h3>
                {journal.intro && (
                  <p className="jfc-intro">{journal.intro}</p>
                )}
                <div className="jfc-footer">
                  <Link to={'/articles/' + journal.slug} className="jfc-read-btn">
                    <span>اقرئي المقال كاملاً</span>
                    <ArrowLeft size={17} />
                  </Link>
                </div>
              </div>
            </article>
          )}

          {!journal && <p className="portal-empty">مقالات المركز ستظهر هنا بعد نشرها.</p>}

          <div className="journal-list-pro">
            {data.articles
              .filter((a) => a.slug !== journal?.slug)
              .slice(0, 3)
              .map((a) => (
                <Link className="journal-item-card" key={a.slug} to={'/articles/' + a.slug}>
                  <div className="jic-body">
                    <div className="jic-meta">
                      <span className="jic-category">{a.category}</span>
                      <span className="jic-time">
                        <Clock size={12} />
                        <span>{a.minutes} دقائق</span>
                      </span>
                    </div>
                    <h3 className="jic-title">{a.title}</h3>
                    {a.intro && (
                      <p className="jic-snippet">
                        {a.intro.slice(0, 110)}...
                      </p>
                    )}
                  </div>
                  <div className="jic-arrow-wrap" aria-hidden="true">
                    <span className="jic-arrow-circle">
                      <ArrowLeft size={18} />
                    </span>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      </section>
      <section className="close-section">
        <div className="close-content-pro">
          <div className="close-faq-col">
            <div className="kicker">
              <HelpCircle size={14} />
              <span>قبل الخطوة الأولى</span>
            </div>
            <h2 className="close-faq-title">
              كل شيء أوضح
              <br />
              <span>من البداية.</span>
            </h2>
            <p className="close-faq-sub">
              إليكِ إجابات لأكثر الأسئلة شيوعاً حول مواعيد المركز، نظام المتابعة، والخصوصية.
            </p>
            <Faq />
          </div>

          <div className="final-invite-pro">
            <div className="fip-glow" aria-hidden="true" />
            <span className="fip-badge">
              <Leaf size={13} />
              <span>بدايتكِ تبدأ الآن</span>
            </span>
            <span className="fip-latin" lang="en" dir="ltr">
              YOUR NEXT CHAPTER STARTS HERE.
            </span>
            <h2>
              خطوة صغيرة،
              <br />
              تناسب حياتكِ.
            </h2>
            <p>
              اختاري التوقيت المناسب لجدولكِ، ودعينا نبدأ من فهم أهدافكِ واحتياجكِ الصحي بكل عناية وراحة.
            </p>

            <div className="fip-reassurance-list">
              <div className="fip-r-item">
                <Check size={15} />
                <span>ارسلي طلب موعد من غير إنشاء حساب</span>
              </div>
              <div className="fip-r-item">
                <Check size={15} />
                <span>المركز بيراجع الطلب ويتواصل معكِ للتأكيد</span>
              </div>
            </div>

            <div className="fip-actions">
              <ButtonLink to="/booking" kind="lime" className="btn-fip-primary">
                <span>احجزي استشارتكِ الآن</span>
              </ButtonLink>
              <div className="fip-help-wrap">
                تفضّلين السؤال أولاً؟{' '}
                <Link to="/contact" className="fip-contact-link">
                  تواصلي مع العيادة
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      <ProgramInterest program={interest} onClose={() => setInterest(null)} />
    </main>
  );
}
