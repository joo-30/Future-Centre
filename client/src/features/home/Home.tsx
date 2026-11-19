import { ArrowLeft, MapPin } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ErrorState, Loading } from '../../components/ui';
import { useCatalog } from '../../hooks/useCatalog';
import { gsap, useGSAP } from '../../lib/motion';
import { CareGuideQuiz } from './components/CareGuideQuiz';
import { ArticlesSection } from './components/ArticlesSection';
import { BookingInvitation } from './components/BookingInvitation';
import { ClinicServices } from './components/ClinicServices';
import { ClosingSection } from './components/ClosingSection';
import { SuccessStoriesSection } from './components/SuccessStoriesSection';

export function Home() {
  const { data, isPending, error, refetch } = useCatalog();
  const mainRef = useRef<HTMLElement>(null);
  const { hash } = useLocation();

  useEffect(() => {
    if (!data || !hash) return;
    const id = hash.slice(1);
    const target = document.getElementById(id);
    if (!target || !mainRef.current?.contains(target)) return;

    let cancelled = false;
    let frame = 0;
    void document.fonts.ready.then(() => {
      if (cancelled) return;
      frame = requestAnimationFrame(() => {
        target.scrollIntoView({ block: 'start', behavior: 'instant' });
      });
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
  }, [data, hash]);

  useGSAP(
    () => {
      const main = mainRef.current;
      if (!data || !main) return;

      const motion = gsap.matchMedia();
      motion.add(
        {
          active: '(prefers-reduced-motion: no-preference)',
          wide: '(min-width: 900px)',
        },
        ({ conditions }) => {
          if (!conditions?.active) return;

          const select = gsap.utils.selector(main);
          if (!hash) {
            gsap.from(select('.clinic-intro-copy > *, .clinic-intro-art'), {
              y: 18,
              opacity: 0.55,
              duration: 0.7,
              stagger: 0.07,
              ease: 'power2.out',
              clearProps: 'opacity,transform',
            });
          }

          const groups = [
            ['.clinic-services', '.clinic-section-heading, .clinic-service'],
            [
              '.clinic-doctor-profile',
              '.clinic-doctor-identity, .clinic-doctor-approach, .clinic-doctor-credentials, .clinic-doctor-visual',
            ],
            [
              '.clinic-visit',
              '.clinic-section-heading, .clinic-visit-ribbon, .clinic-visit-steps li',
            ],
            ['.booking-invitation', '.booking-invitation-inner'],
            ['.care-path-section', '.care-path-intro, .care-path-workspace'],
            ['.journal-section', '.journal-section-heading, .journal-lead, .journal-note'],
            ['.closing-section', '.closing-overview, .closing-booking'],
          ];

          for (const [section, elements] of groups) {
            const trigger = select(section)[0];
            if (!trigger) continue;
            gsap.from(trigger.querySelectorAll(elements), {
              scrollTrigger: { trigger, start: 'top 88%', once: true },
              immediateRender: false,
              y: 20,
              opacity: 0.6,
              duration: 0.65,
              stagger: 0.09,
              ease: 'power2.out',
              clearProps: 'opacity,transform',
            });
          }

          if (conditions.wide) {
            gsap.to(select('.clinic-intro-art'), {
              scrollTrigger: {
                trigger: select('.clinic-intro')[0],
                start: 'top top',
                end: 'bottom top',
                scrub: 0.65,
              },
              yPercent: 4,
              ease: 'none',
            });

            gsap.fromTo(
              select('.journal-lead-art'),
              { y: -6 },
              {
                scrollTrigger: {
                  trigger: select('.journal-section')[0],
                  start: 'top bottom',
                  end: 'bottom top',
                  scrub: 0.65,
                },
                y: 6,
                ease: 'none',
              },
            );
          }
        },
      );
      return () => motion.revert();
    },
    { scope: mainRef, dependencies: [data, hash], revertOnUpdate: true },
  );

  if (isPending) return <Loading />;
  if (error || !data)
    return (
      <ErrorState message={error?.message || 'حاولي لاحقًا.'} onRetry={() => void refetch()} />
    );
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
              <Link to="#clinic-services" className="clinic-intro-programs">
                استكشفي البرامج
              </Link>
            </div>
            <div className="clinic-intro-meta">
              <p>الموعد يتأكد بعد مراجعة المركز.</p>
              <Link to="#doctor-profile">تعرّفي على د. رنا</Link>
            </div>
          </div>

          <img
            className="clinic-intro-art"
            src="/assets/hero-brand-sculpture-cutout.webp"
            alt=""
            width="1402"
            height="1122"
            fetchPriority="high"
          />
        </div>
      </section>

      <ClinicServices services={data.services} demoPrices={data.clinic.demoPrices} />

      <section
        id="doctor-profile"
        className="clinic-doctor-profile"
        aria-labelledby="doctor-profile-title"
      >
        <div className="clinic-doctor-layout">
          <div className="clinic-doctor-copy">
            <header className="clinic-doctor-identity">
              <span className="clinic-doctor-eyebrow">طبيبتكِ في مركز المستقبل</span>
              <h2 id="doctor-profile-title">د. رنا ياسر الشورى</h2>
              <p>أخصائية التغذية العلاجية والسمنة وتنسيق القوام</p>
            </header>
            <div className="clinic-doctor-details">
              <div className="clinic-doctor-approach">
                <h3>نبدأ من يومكِ.</h3>
                <p>
                  د. رنا بتسمع منكِ عن أكلكِ ومواعيدكِ وإيه اللي بيصعّب الالتزام. بعدها بتختاروا سوا
                  تغييرات تقدري تعمليها، وتراجعوها في المتابعة حسب قياساتكِ وتجربتكِ.
                </p>
              </div>
              <dl className="clinic-doctor-credentials">
                <div>
                  <dt>التأهيل العلمي</dt>
                  <dd>ماجستير ودكتوراه في التغذية العلاجية</dd>
                </div>
                <div>
                  <dt>العضوية المهنية</dt>
                  <dd>
                    الجمعية المصرية لدراسة السمنة <bdi dir="ltr">(EMASO)</bdi>
                  </dd>
                </div>
              </dl>
              <Link className="clinic-section-link clinic-doctor-more" to="/about">
                عن د. رنا والمركز <ArrowLeft size={17} aria-hidden="true" />
              </Link>
            </div>
          </div>
          <figure className="clinic-doctor-visual">
            <img
              className="clinic-doctor-porcelain"
              src="/assets/doctor-profile-porcelain.webp"
              alt=""
              width="1254"
              height="1254"
              loading="lazy"
            />
            <img
              className="clinic-doctor-portrait"
              src="/assets/doctor-profile-portrait.webp"
              alt="د. رنا ياسر الشورى"
              width="1122"
              height="1402"
              loading="lazy"
            />
            <img
              className="clinic-doctor-porcelain is-foreground"
              src="/assets/doctor-profile-porcelain.webp"
              alt=""
              width="1254"
              height="1254"
              loading="lazy"
            />
          </figure>
        </div>
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
        <div className="clinic-visit-map">
          <img
            className="clinic-visit-ribbon"
            src="/assets/clinic-visit-ribbon.webp"
            alt=""
            width="2172"
            height="724"
            loading="lazy"
          />
          <ol className="clinic-visit-steps" role="list">
            <li>
              <span className="clinic-visit-number" aria-hidden="true">
                ١
              </span>
              <div>
                <h3>نفهم حالتكِ</h3>
                <p>نسمع أهدافكِ وعاداتكِ ونقيّم احتياجكِ في الزيارة الأولى.</p>
              </div>
            </li>
            <li>
              <span className="clinic-visit-number" aria-hidden="true">
                ٢
              </span>
              <div>
                <h3>نتفق على خطة</h3>
                <p>نختار معكِ خطوات تناسب يومكِ والأكل المتاح لكِ.</p>
              </div>
            </li>
            <li>
              <span className="clinic-visit-number" aria-hidden="true">
                ٣
              </span>
              <div>
                <h3>نتابع التقدّم</h3>
                <p>نراجع القياسات ونعدّل الخطة حسب استجابتكِ.</p>
              </div>
            </li>
          </ol>
        </div>
      </section>

      {/* قصص وتجارب النجاح والتحولات */}
      <SuccessStoriesSection />

      <BookingInvitation whatsappNumber={data.clinic.whatsapp} />

      {/* مرشد البداية التفاعلي مع د. رنا */}
      <CareGuideQuiz whatsappNumber={data.clinic.whatsapp} />

      <ArticlesSection articles={data.articles} />

      <ClosingSection whatsappNumber={data.clinic.whatsapp} />

    </main>
  );
}
