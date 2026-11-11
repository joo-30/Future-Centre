import { resolveArticleImage, type Service } from '@future/shared';
import {
  Activity,
  ArrowLeft,
  Award,
  BookOpen,
  Check,
  ChevronDown,
  Clock,
  Compass,
  Flame,
  Heart,
  HeartHandshake,
  HelpCircle,
  Leaf,
  MapPin,
  MessageCircle,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ProgramInterest } from '../../components/ProgramInterest';
import { ButtonLink, ErrorState, Loading } from '../../components/ui';
import { useCatalog } from '../../hooks/useCatalog';
import { formatPrice } from '../../lib/api';
import { CareGuideQuiz } from './components/CareGuideQuiz';
import { Faq } from './components/Faq';
import { SuccessStoriesSection } from './components/SuccessStoriesSection';

export function Home() {
  const { data, isPending, error, refetch } = useCatalog();
  const [interest, setInterest] = useState<Service | null>(null);
  const [showMonthlyDetails, setShowMonthlyDetails] = useState(false);
  if (isPending) return <Loading />;
  if (error || !data)
    return (
      <ErrorState message={error?.message || 'حاولي لاحقًا.'} onRetry={() => void refetch()} />
    );
  const monthly = data.services.find((s) => s.featured) || data.services[0];
  const others = data.services.filter((s) => s.id !== monthly?.id);
  const journal = data.articles.find((a) => a.slug === 'meal-planning') || data.articles[0];
  return (
    <main className="home-body">
      <section className="hero-section">
        <div className="home-hero">
          <div className="hero-copy">
            <div className="hero-badge-pill">
              <Leaf size={14} className="hero-badge-sparkle" />
              <span>مركز المستقبل للتغذية العلاجية</span>
              <span className="hero-badge-dot" />
              <small>إشراف د. رنا الشوري</small>
            </div>
            <h1 className="hero-main-title">
              صحتكِ تبدأ
              <br />
              <span className="hero-title-accent">بفهمكِ.</span>
            </h1>
            <p className="hero-description">
              خطة غذائية متكاملة مصممة لتناسب تفاصيل يومكِ،
              ورعاية ومتابعة شخصية مستمرة خطوة بخطوة حتى تحققي أهدافكِ بصحة واستدامة.
            </p>
            <div className="hero-cta-grid">
              <ButtonLink to="/booking" className="btn-hero-primary">
                <span>ابدئي رحلتكِ الآن</span>
              </ButtonLink>
              <ButtonLink to="/programs" kind="outline" className="btn-hero-secondary">
                <span>اكتشفي البرامج</span>
              </ButtonLink>
            </div>
            <div className="reassurance-badges">
              <span className="reassurance-pill">
                <Check size={14} />
                حجز فوري دون حساب
              </span>
              <span className="reassurance-pill">
                <Heart size={14} />
                متابعة دورية شخصية
              </span>
              <span className="reassurance-pill">
                <ShieldCheck size={14} />
                استشارة طبية معتمدة
              </span>
            </div>
          </div>
          <div className="hero-scene">
            <img
              src="/assets/hero-sculpture.png"
              alt="تكوين نحتي مستوحى من هوية مركز المستقبل"
              width="1536"
              height="1024"
              fetchPriority="high"
            />
            <div className="scene-caption">كل خطة تبدأ بالإنسان.</div>
            <div className="scene-detail">
              <Leaf />
              <div>
                <strong>على مقاس يومك.</strong>
                <small>تغذية واقعية · عادات تستمر</small>
              </div>
            </div>
          </div>
        </div>

        {/* Hero Bottom: Transformed Signature Specialties Showcase */}
        <div className="hero-bottom-pro">
          <div className="hbp-lead">
            <span className="hbp-tag">
              <span className="hbp-pulse-dot" />
              رعاية مصممة حولكِ
            </span>
            <span className="hbp-title">تخصصات العيادة الرئيسية:</span>
          </div>

          <div className="hbp-topics">
            <Link to="/programs" className="hbp-topic-card">
              <div className="hbp-topic-badge">01</div>
              <div className="hbp-topic-body">
                <div className="hbp-topic-header">
                  <Flame size={16} className="hbp-topic-icon" />
                  <strong>إدارة وتنسيق الوزن</strong>
                </div>
                <small>خسارة دهون صحية ونحت القوام بلا حرمان</small>
              </div>
              <ArrowLeft size={16} className="hbp-topic-arrow" />
            </Link>

            <Link to="/programs" className="hbp-topic-card">
              <div className="hbp-topic-badge">02</div>
              <div className="hbp-topic-body">
                <div className="hbp-topic-header">
                  <Activity size={16} className="hbp-topic-icon" />
                  <strong>التغذية العلاجية</strong>
                </div>
                <small>مقاومة الإنسولين، الضغط، تكيس المبايض</small>
              </div>
              <ArrowLeft size={16} className="hbp-topic-arrow" />
            </Link>

            <Link to="/programs" className="hbp-topic-card">
              <div className="hbp-topic-badge">03</div>
              <div className="hbp-topic-body">
                <div className="hbp-topic-header">
                  <Heart size={16} className="hbp-topic-icon" />
                  <strong>تغذية وصحة المرأة</strong>
                </div>
                <small>برامج الحمل، الرضاعة، وتوازن الهرمونات</small>
              </div>
              <ArrowLeft size={16} className="hbp-topic-arrow" />
            </Link>
          </div>
        </div>
      </section>

      {/* About Section: Elevated Care Philosophy & Patient Journey */}
      <section className="about-section">
        <div className="about-bg-glow" aria-hidden="true" />
        <div className="kicker kicker--on-dark">
          <Heart size={14} />
          <span>فلسفة الرعاية</span>
        </div>
        <div className="about-head">
          <h2>
            نسمع تفاصيلكِ.
            <br />
            <span>ونبني خطتكِ معكِ.</span>
          </h2>
          <div className="about-head-lead">
            <p>
              لأن الاحتياجات لا تتشابه، نبدأ بفهم يومكِ وعاداتكِ وطبيعة حرقكِ أولاً.
              ثم نختار معاً خطوات عملية تناسب حياتكِ، ونتابعها بهدوء حتى تصبح أسلوب حياة مريح ومستمر.
            </p>
            <div className="mt-5">
              <Link to="/about" className="link-on-dark">
                <span>تعرّفي أكثر على فلسفة المركز</span>
                <ArrowLeft size={18} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
        <div className="about-detail">
          <div className="care-method-grid">
            <div className="care-method-card">
              <div className="cmc-top">
                <span className="cmc-step">01</span>
                <span className="cmc-icon-wrap">
                  <HeartHandshake size={20} />
                </span>
              </div>
              <div className="cmc-content">
                <h3>نتعرّف عليكِ ونسمعكِ</h3>
                <p>جلسة تقييم هادئة وغير مستعجلة، نستمع فيها لأهدافكِ، عاداتكِ، وفحص InBody دقيق.</p>
                <span className="cmc-tag">تقييم سريري شامل</span>
              </div>
            </div>

            <div className="care-method-card">
              <div className="cmc-top">
                <span className="cmc-step">02</span>
                <span className="cmc-icon-wrap">
                  <Compass size={20} />
                </span>
              </div>
              <div className="cmc-content">
                <h3>نخطط ليومكِ بمرونة</h3>
                <p>نضع خطوات واقعية على مقاس روتينكِ وأكلات بيتكِ، بعيداً عن الجداول القاسية والحرمان.</p>
                <span className="cmc-tag">خطة مصممة خصيصاً لكِ</span>
              </div>
            </div>

            <div className="care-method-card">
              <div className="cmc-top">
                <span className="cmc-step">03</span>
                <span className="cmc-icon-wrap">
                  <TrendingUp size={20} />
                </span>
              </div>
              <div className="cmc-content">
                <h3>نكمل معكِ خطوة بخطوة</h3>
                <p>متابعة دورية لتطوير الخطة، قياس النتائج بالأرقام، ودعم مستمر حتى تصلي لهدفكِ.</p>
                <span className="cmc-tag">استمرارية ونتائج تدوم</span>
              </div>
            </div>
          </div>

          <div className="about-photo-wrap">
            <div className="about-photo-frame">
              <img
                src="/assets/consultation.png"
                alt="جلسة استماع ومتابعة غذائية خاصة بمركز المستقبل"
                width="1536"
                height="1024"
                loading="lazy"
              />
            </div>
            <div className="about-photo-badge">
              <div className="apb-dot" />
              <div>
                <strong>جلسة استشارة خاصة وسرية تامة</strong>
                <small>حوار طبي إنساني يضع صحتكِ وراحتكِ في المقام الأول</small>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="programs-section">
        <div className="section-top">
          <div>
            <div className="kicker">
              <Compass size={14} />
              <span>اختاري بدايتكِ الصحية</span>
            </div>
            <h2>برامج واضحة. رعاية تناسبكِ.</h2>
            <p className="programs-section-sub">
              اختاري البرنامج الأنسب لأهدافكِ، وسيتواصل معكِ فريق المركز لتأكيد الموعد وكافة التفاصيل هاتفياً دون أي دفع إلكتروني مسبق.
            </p>
          </div>
        </div>

        <div className="program-layout-pro">
          {monthly && (
            <article className="program-feature-pro">
              <div className="pfp-badge-top">
                <Award size={14} />
                <span>البرنامج الأكثر طلباً وتفضيلاً بالمركز</span>
              </div>

              <div className="pfp-header">
                <div className="pfp-title-group">
                  <span className="pfp-tag">
                    <Heart size={14} />
                    متابعة حضورية بمقر العيادة
                  </span>
                  <h3>{monthly.title}</h3>
                  <p>{monthly.description}</p>
                </div>

                <div className="pfp-price-box">
                  <span className="pfp-price-label">قيمة الاشتراك</span>
                  <div className="pfp-price-val">
                    {formatPrice(monthly.price)} {monthly.price !== null && <small>ج.م</small>}
                  </div>
                  <span className="pfp-price-sub">{monthly.period} · {monthly.sessions} جلسات</span>
                </div>
              </div>

              {/* Simplified Preview Highlights & Expandable Details */}
              <div className="pfp-preview-highlights">
                <span className="pfp-highlight-pill">
                  <Check size={14} />
                  <span>{monthly.sessions} جلسات دورية مع د. رنا</span>
                </span>
                <span className="pfp-highlight-pill">
                  <Check size={14} />
                  <span>فحص InBody سريري متقدم</span>
                </span>
                <span className="pfp-highlight-pill">
                  <Check size={14} />
                  <span>خطة أسبوعية لأكلات بيتكِ</span>
                </span>
                <span className="pfp-highlight-pill">
                  <Check size={14} />
                  <span>متابعة ودعم مستمر عبر واتساب</span>
                </span>
              </div>

              <div className="pfp-toggle-wrap">
                <button
                  type="button"
                  className="pfp-toggle-details-btn"
                  onClick={() => setShowMonthlyDetails((prev) => !prev)}
                  aria-expanded={showMonthlyDetails}
                >
                  <span>{showMonthlyDetails ? 'إخفاء التفاصيل الموسعة' : 'عرض ما يشمله البرنامج بالتفصيل'}</span>
                  <ChevronDown size={16} className={`pfp-toggle-arrow ${showMonthlyDetails ? 'is-open' : ''}`} />
                </button>
              </div>

              {showMonthlyDetails && (
                <div className="pfp-includes pfp-includes-expandable">
                  <span className="pfp-includes-title">تفاصيل ما يشمله البرنامج شهرياً:</span>
                  <div className="pfp-includes-grid">
                    <div className="pfp-inc-item">
                      <Check size={16} className="pfp-check" />
                      <span>{monthly.sessions} جلسات كشف واستشارة دورية خاصة مع د. رنا</span>
                    </div>
                    <div className="pfp-inc-item">
                      <Check size={16} className="pfp-check" />
                      <span>فحص InBody متقدم لتحليل كتلة الدهون والعضلات ومعدل الحرق</span>
                    </div>
                    <div className="pfp-inc-item">
                      <Check size={16} className="pfp-check" />
                      <span>خطة تغذية علاجية مخصصة لأكلات بيتكِ تتجدد أسبوعياً</span>
                    </div>
                    <div className="pfp-inc-item">
                      <Check size={16} className="pfp-check" />
                      <span>متابعة ودعم مستمر عبر واتساب للإجابة عن استفساراتكِ</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="pfp-footer">
                <button className="btn-program-primary" onClick={() => setInterest(monthly)}>
                  <span>طلب الاشتراك في البرنامج</span>
                  <ArrowLeft size={18} />
                </button>
                <Link className="program-detail-link" to={'/programs/' + monthly.slug}>
                  <span>تفاصيل ومميزات البرنامج</span>
                  <ArrowLeft size={15} />
                </Link>
              </div>
            </article>
          )}

          {!monthly && (
            <div className="portal-empty">
              <h3>نجهّز برامج المركز.</h3>
              <p>تواصلي معنا للتعرّف إلى الخدمات المتاحة.</p>
              <ButtonLink to="/contact" kind="outline">
                تواصلي معنا
              </ButtonLink>
            </div>
          )}

          <div className="program-minis-pro">
            {others.map((s, i) => (
              <article className="program-mini-card" key={s.id}>
                <div className="pmc-body">
                  <span className="pmc-kicker">
                    {i === 0 ? 'كشف واستشارة فردية' : 'رعاية تخصصية متقدمة'}
                  </span>
                  <h4>{s.title}</h4>
                  <p>{s.description}</p>
                  <span className="mini-venue-tag">
                    <MapPin size={13} /> {data.clinic.address || 'كفر الزيات، شارع الجيش عند توكيل أورنج'}
                  </span>
                </div>
                <div className="pmc-action-col">
                  <div className="pmc-price">
                    {formatPrice(s.price)} {s.price !== null && <small>ج.م</small>}
                  </div>
                  <ButtonLink to={'/booking?service=' + s.id} className="btn-mini-book">
                    <span>{i === 0 ? 'حجز كشف' : 'حجز موعد'}</span>
                  </ButtonLink>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="program-note-pro">
          <MessageCircle size={17} />
          <span>طلبات البرامج للمتابعة والتأكيد مع المركز عبر واتساب، دون أي دفع إلكتروني مسبق.</span>
        </div>
      </section>

      {/* قسم الدكتورة والخبرات والشهادات الطبية */}
      <section className="doctor-profile-section">
        <div className="doctor-profile-container">
          <div className="doctor-profile-image-wrap">
            <div className="doctor-image-frame">
              <img
                src="/assets/dr-rana.jpg"
                alt="د. رنا ياسر الشوري - أخصائية التغذية العلاجية بمركز المستقبل"
                className="doctor-image"
                width="1200"
                height="1500"
                loading="lazy"
              />
              <div className="doctor-verified-badge">
                <ShieldCheck size={16} />
                <span>طبيبة معتمدة</span>
              </div>
            </div>
            <div className="doctor-under-badge">
              <Award size={16} />
              <span>خبرة معتمدة في التغذية الإكلينيكية ونحت القوام</span>
            </div>
          </div>

          <div className="doctor-profile-content">
            <div className="kicker">
              <Award size={14} />
              <span>إشراف طبي متخصص</span>
            </div>
            <h2>د. رنا ياسر الشوري</h2>
            <p className="doctor-title-lead">
              أخصائية التغذية العلاجية والسمنة وتنسيق القوام · عضو الجمعية المصرية لدراسة السمنة (EMASO)
            </p>

            <p className="doctor-bio-text">
              في مركز المستقبل، نؤمن أن التغذية الصحية ليست حرمانًا أو جداول قاسية، بل هي فهم علمي
              لطبيعة حرق جسمكِ، ونمط حياتكِ، والتغيرات الهرمونية. نضع معكِ خطة واقعية ومرنة تمنحكِ صحة أفضل
              ونتائج قياسية تدوم معكِ مدى الحياة.
            </p>

            {/* Clinical Highlights / Trust Stats */}
            <div className="doctor-stats-row">
              <div className="doc-stat-card">
                <strong>+5,000</strong>
                <small>حالة تم علاجها بنجاح</small>
              </div>
              <div className="doc-stat-card doc-stat-inbody">
                <strong>InBody</strong>
                <small>متابعة سريرية معتمدة</small>
              </div>
              <div className="doc-stat-card">
                <strong>98%</strong>
                <small>نسبة التزام ونتائج مستمرة</small>
              </div>
            </div>

            <div className="doctor-credentials-grid">
              <div className="cred-card">
                <span className="cred-icon">🎓</span>
                <div>
                  <strong>ماجستير ودبلومة التغذية الإكلينيكية</strong>
                  <small>تغذية علاجية متقدمة من كبرى الهيئات الطبية</small>
                </div>
              </div>

              <div className="cred-card">
                <span className="cred-icon">🏅</span>
                <div>
                  <strong>عضو الجمعية المصرية لدراسة السمنة</strong>
                  <small>أحدث البروتوكولات المعتمدة عالمياً في علاج السمنة والنحافة</small>
                </div>
              </div>

              <div className="cred-card">
                <span className="cred-icon">🔬</span>
                <div>
                  <strong>برامج متخصصة لمقاومة الإنسولين وتكيس المبايض</strong>
                  <small>تحسين الحرق وضبط الهرمونات بدون أدوية عشوائية</small>
                </div>
              </div>

              <div className="cred-card">
                <span className="cred-icon">📊</span>
                <div>
                  <strong>متابعة بأحدث أجهزة الـ InBody المعتمدة</strong>
                  <small>تحليل دقيق لكتلة الدهون، العضلات، ومعدل الحرق الأساسي</small>
                </div>
              </div>
            </div>

            <div className="doctor-profile-cta">
              <ButtonLink to="/booking">
                <span>احجزي كشف مع الدكتورة</span>
              </ButtonLink>
              <Link to="/about" className="link">
                المزيد عن فلسفة المركز
                <ArrowLeft size={16} />
              </Link>
            </div>
          </div>
        </div>
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
              مقالات وإرشادات علمية موثوقة بإشراف د. رنا الشوري لمساعدتكِ في فهم جسدكِ واختيار غذائكِ بوعي وهدوء.
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
                  <span className="jfc-author">إشراف طبي د. رنا الشوري</span>
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
              على مقاس حياتكِ.
            </h2>
            <p>
              اختاري التوقيت المناسب لجدولكِ، ودعينا نبدأ من فهم أهدافكِ واحتياجكِ الصحي بكل عناية وراحة.
            </p>

            <div className="fip-reassurance-list">
              <div className="fip-r-item">
                <Check size={15} />
                <span>حجز فوري مباشر دون الحاجة لكلمة مرور</span>
              </div>
              <div className="fip-r-item">
                <Check size={15} />
                <span>خصوصية تامة واستماع حقيقي لكل تفاصيلكِ</span>
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
