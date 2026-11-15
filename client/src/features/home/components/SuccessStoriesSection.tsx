import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Flame,
  HeartHandshake,
  Maximize2,
  MessageCircle,
  Quote,
  ShieldCheck,
  Activity,
  Layers,
  Trophy,
  X,
  ZoomIn,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { gsap, isReducedMotion, useGSAP } from '../../../lib/motion';
import { Link } from 'react-router-dom';
import type { SuccessStory } from '@future/shared';
import { WhatsAppIcon } from '../../../components/icons/WhatsAppIcon';
import { useCatalog } from '../../../hooks/useCatalog';
import { whatsappUrl } from '../../../lib/api';
import { publicApi } from '../../../lib/portal-api';

export function SuccessStoriesSection() {
  const sectionRef = useRef<HTMLElement>(null);


  const { data: catalogData } = useCatalog();
  const clinic = catalogData?.clinic;
  const [activeTab, setActiveTab] = useState<'all' | 'transformations' | 'reviews'>('all');
  const [selectedCase, setSelectedCase] = useState<SuccessStory | null>(null);
  const [selectedReview, setSelectedReview] = useState<SuccessStory | null>(null);
  const [customInquiry, setCustomInquiry] = useState("");
  const [lightboxImage, setLightboxImage] = useState<{ url: string; title: string; subtitle?: string } | null>(null);

  const storiesQuery = useQuery({
    queryKey: ['public', 'stories'],
    queryFn: () => publicApi.stories(),
    staleTime: 5 * 60 * 1000,
  });

  const stories = storiesQuery.data?.stories || [];

  useGSAP(
    () => {
      if (isReducedMotion() || !sectionRef.current) return;

      gsap.fromTo(
        '.stories-section-title-wrap, .stories-trust-box',
        { opacity: 0, y: 16 },
        {
          scrollTrigger: {
            trigger: '.stories-section-head',
            start: 'top 85%',
            once: true,
          },
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.1,
          ease: 'power2.out',
        }
      );

      gsap.fromTo(
        '.transform-card-compact',
        { opacity: 0, y: 18 },
        {
          scrollTrigger: {
            trigger: '.transformations-grid',
            start: 'top 85%',
            once: true,
          },
          opacity: 1,
          y: 0,
          duration: 0.75,
          stagger: 0.1,
          ease: 'power2.out',
        }
      );
    },
    { scope: sectionRef, dependencies: [stories.length] }
  );

  const transformations = useMemo(
    () => stories.filter((s) => s.storyType === 'transformation'),
    [stories]
  );

  const reviews = useMemo(
    () => stories.filter((s) => s.storyType === 'review'),
    [stories]
  );

  const selectedReviewIndex = useMemo(() => {
    if (!selectedReview) return -1;
    return reviews.findIndex((rev) => rev.id === selectedReview.id);
  }, [selectedReview, reviews]);

  const handlePrevReview = useCallback(() => {
    if (!reviews.length) return;
    if (selectedReviewIndex > 0) {
      setSelectedReview(reviews[selectedReviewIndex - 1]);
    } else {
      setSelectedReview(reviews[reviews.length - 1]);
    }
  }, [reviews, selectedReviewIndex]);

  const handleNextReview = useCallback(() => {
    if (!reviews.length) return;
    if (selectedReviewIndex >= 0 && selectedReviewIndex < reviews.length - 1) {
      setSelectedReview(reviews[selectedReviewIndex + 1]);
    } else {
      setSelectedReview(reviews[0]);
    }
  }, [reviews, selectedReviewIndex]);

  useEffect(() => {
    if (!selectedReview) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedReview(null);
      } else if (e.key === 'ArrowLeft') {
        handleNextReview();
      } else if (e.key === 'ArrowRight') {
        handlePrevReview();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedReview, handleNextReview, handlePrevReview]);

  if (!stories.length && !storiesQuery.isPending) {
    return null;
  }

  return (
    <section ref={sectionRef} className="stories-section" id="stories" aria-label="قصص وتجارب النجاح">
      {/* 1. Header with Trust Credential */}
      <div className="section-top stories-section-head">
        <div className="stories-section-title-wrap">
          <div className="kicker">
            <Trophy size={15} />
            <span>قصص وتجارب واقعية موثقة</span>
          </div>
          <h2>نتائج حقيقية صنعت فرقاً في حياة أصحابها.</h2>
          <p className="stories-section-sub">
            قصص ونتائج حقيقية لمرضى بدأوا رحلتهم مع دكتورة رنا، ووصلوا لوزنهم المثالي وصحتهم الأفضل بدون حرمان.
          </p>
        </div>

        <div className="stories-trust-box">
          <div className="stb-icon">
            <ShieldCheck size={26} />
          </div>
          <div>
            <div className="stb-number">+5,000 حالة</div>
            <div className="stb-sub">حققت أهدافها الصحية بدون حرمان</div>
          </div>
        </div>
      </div>

      {/* 2. Luxury Tab Switcher */}
      <div className="stories-tabs-pro" role="tablist" aria-label="تصفية نتائج وتجارب المركز">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'all'}
          className={`stories-tab-btn ${activeTab === 'all' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          <Layers size={16} />
          <span>كل التجارب والنتائج</span>
          <span className="stories-tab-count">{stories.length}</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'transformations'}
          className={`stories-tab-btn ${activeTab === 'transformations' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('transformations')}
        >
          <Trophy size={16} />
          <span>صور قبل وبعد</span>
          <span className="stories-tab-count">{transformations.length}</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'reviews'}
          className={`stories-tab-btn ${activeTab === 'reviews' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('reviews')}
        >
          <MessageCircle size={16} />
          <span>آراء العملاء</span>
          <span className="stories-tab-count">{reviews.length}</span>
        </button>
      </div>

      {/* 4. Section A: Major Transformations (Compact, Branded Cover, Deep-Dive on Click) */}
      {(activeTab === 'all' || activeTab === 'transformations') && transformations.length > 0 && (
        <div className="transformations-block">
          <div className="block-head">
            <div className="block-title-row">
              <div className="block-icon-badge">
                <Flame size={18} />
              </div>
              <div>
                <h3 className="block-title">تجارب وصور قبل وبعد</h3>
                <p className="block-sub">
                  حالات حقيقية وثقت نتائجها بالمركز — اضغطي على أي كارت لمشاهدة الصور والنتيجة كاملة.
                </p>
              </div>
            </div>
          </div>

          <div className="transformations-grid">
            {transformations.map((c) => (
              <div
                key={c.id}
                className="transform-card-compact"
                onClick={() => setSelectedCase(c)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedCase(c);
                  }
                }}
              >
                {/* Visual Cover in Unified Brand Identity */}
                <div className="tc-cover-wrap">
                  <img
                    src={c.imageUrl || '/stories/case_cover_nada.png'}
                    alt={c.title}
                    className="tc-cover-img"
                    loading="lazy"
                  />
                  <div className="tc-cover-hover-overlay">
                    <span className="tc-hover-badge">
                      <ZoomIn size={15} />
                      <span>معاينة الصور والنتيجة</span>
                    </span>
                  </div>
                </div>

                {/* Compact Card Body */}
                <div className="tc-body">
                  <div className="tc-meta-row">
                    <span className="tc-patient-name">{c.name}</span>
                    <span className="tc-duration-pill">
                      <Clock size={12} />
                      <span>{c.durationText}</span>
                    </span>
                  </div>

                  <h4 className="tc-title">{c.title}</h4>

                  <div className="tc-metrics-strip">
                    <div className="tc-metric-box">
                      <span className="tc-mb-label">الوزن السابق</span>
                      <strong className="tc-mb-val">{c.beforeWeight} كجم</strong>
                    </div>
                    <span className="tc-metric-arrow">➔</span>
                    <div className="tc-metric-box is-target">
                      <span className="tc-mb-label">الوزن الحالي</span>
                      <strong className="tc-mb-val">{c.afterWeight} كجم</strong>
                    </div>
                    <div className="tc-loss-badge">
                      <span>-{c.weightLostKg} كجم</span>
                    </div>
                  </div>

                  <div className="tc-footer">
                    <span className="tc-program">{c.programTitle}</span>
                    <button type="button" className="tc-cta-btn" tabIndex={-1}>
                      <span>عرض التجربة كاملة</span>
                      <ChevronLeft size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Section B: WhatsApp & Patient Feedback Wall (Compact, High-Density, Verified) */}
      {(activeTab === 'all' || activeTab === 'reviews') && reviews.length > 0 && (
        <div className="feedback-block">
          <div className="block-head">
            <div className="block-title-row">
              <div className="block-icon-badge is-whatsapp">
                <MessageCircle size={18} />
              </div>
              <div>
                <h3 className="block-title">آراء بعض عملائنا</h3>
                <p className="block-sub">
                  رسائل وتجارب حقيقية موثقة من عملاء ومراجعي المركز وفرحتهم بالنتيجة مع دكتورة رنا.
                </p>
              </div>
            </div>
          </div>

          <div className="feedback-micro-grid">
            {reviews.map((r) => {
              const handleOpen = () => {
                setSelectedReview(r);
              };
              return (
                <div
                  key={r.id}
                  className="feedback-micro-card is-clickable"
                  onClick={handleOpen}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleOpen();
                    }
                  }}
                  title="انقر لتكبير الرأي وقراءة الرسالة بوضوح"
                >
                  {/* Top Row: Verified Chat Badge & Loss Tag */}
                  <div className="fmc-top">
                    <div className="fmc-sender-wrap">
                      <div className="fmc-avatar is-wa" aria-hidden="true">
                        <MessageCircle size={18} />
                      </div>
                      <div>
                        <div className="fmc-sender-name-row">
                          <span className="fmc-badge-title">رأي موثّق لعميل</span>
                          <span className="fmc-wa-pill">
                            <span className="wa-dot"></span>
                            <span>واتساب موثق</span>
                          </span>
                        </div>
                        <span className="fmc-program-sub">{r.programTitle || 'برنامج المتابعة الإكلينيكية'}</span>
                      </div>
                    </div>

                    {r.weightLostKg ? (
                      <span className="fmc-loss-tag">-{r.weightLostKg} كجم</span>
                    ) : r.durationText ? (
                      <span className="fmc-loss-tag is-neutral">{r.durationText}</span>
                    ) : null}
                  </div>

                  {/* Headline & Quote Body */}
                  <div className="fmc-quote-wrap">
                    <h4 className="fmc-headline">{r.title}</h4>
                    <p className="fmc-quote-text">"{r.quote}"</p>
                  </div>

                  {/* Footer with Enlarge Action */}
                  <div className="fmc-footer">
                    <div className="fmc-verified-tag">
                      <ShieldCheck size={13} />
                      <span>مراجعة مثبتة بالعيادة</span>
                    </div>

                    <span
                      className="fmc-view-screenshot-btn"
                      title="انقر لتكبير وقراءة الرسالة بوضوح"
                    >
                      <ZoomIn size={13} />
                      <span>تكبير وقراءة الرسالة</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 6. Bottom Conversion Consultation Card */}
      <div className="stories-cta-banner">
        <div className="scb-content">
          <div className="scb-badge">
            <CheckCircle2 size={14} />
            <span>قصة نجاحكِ تبدأ اليوم</span>
          </div>
          <h3 className="scb-title">جاهزة تبدأي رحلتك وتكوني قصة النجاح الجاية؟</h3>
          <p className="scb-desc">
            خطوة واحدة تبدأ بزيارة واستشارة في العيادة وفحص InBody دقيق وخطة تغذية تناسب جسمك مع د. رنا.
          </p>
          <div className="scb-trust-row">
            <span className="scb-trust-item">
              <CheckCircle2 size={14} className="scb-check-icon" />
              <span>فحص InBody سريري معتمد</span>
            </span>
            <span className="scb-trust-item">
              <CheckCircle2 size={14} className="scb-check-icon" />
              <span>خطة مخصصة بدون حرمان</span>
            </span>
            <span className="scb-trust-item">
              <CheckCircle2 size={14} className="scb-check-icon" />
              <span>متابعة إكلينيكية مباشرة</span>
            </span>
          </div>
        </div>
        <div className="scb-actions">
          <Link to="/booking" className="scb-cta-btn">
            <span>احجزي كشف واستشارة بالعيادة</span>
            <ArrowLeft size={17} />
          </Link>
          <a
            href={whatsappUrl(clinic?.whatsapp || '201041504201', 'مرحباً د. رنا، أود الاستفسار عن كشف واستشارة التغذية والتخسيس بالمركز.')}
            className="scb-whatsapp-btn"
            target="_blank"
            rel="noopener noreferrer"
          >
            <WhatsAppIcon size={16} color="#064e3b" />
            <span>استفسار واتساب سريع</span>
          </a>
        </div>
      </div>

      {/* 7. Clinical Case Deep-Dive Modal (When clicking any Transformation Card) */}
      {selectedCase && (
        <div className="case-modal-backdrop" onClick={() => setSelectedCase(null)}>
          <div className="case-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="cmd-header">
              <div className="cmd-header-info">
                <div className="cmd-badge">
                  <ShieldCheck size={14} />
                  <span>قصة نجاح موثقة بالمركز</span>
                </div>
                <h3 className="cmd-patient-title">{selectedCase.name}</h3>
                <p className="cmd-patient-sub">{selectedCase.title}</p>
              </div>
              <button
                type="button"
                className="cmd-close-btn"
                onClick={() => setSelectedCase(null)}
                aria-label="إغلاق"
              >
                <X size={18} />
              </button>
            </div>

            <div className="cmd-body">
              {/* Media Preview (Authentic Clinical Photo) */}
              <div className="cmd-media-col">
                <div
                  className="cmd-image-frame"
                  onClick={() =>
                    setLightboxImage({
                      url: selectedCase.detailsImageUrl || selectedCase.imageUrl || '',
                      title: selectedCase.name,
                      subtitle: selectedCase.title,
                    })
                  }
                  title="انقر للتكبير بشاشة كاملة"
                >
                  <img
                    src={selectedCase.detailsImageUrl || selectedCase.imageUrl}
                    alt={selectedCase.title}
                    className="cmd-image"
                  />
                  <div className="cmd-img-overlay">
                    <span className="cmd-zoom-pill">
                      <Maximize2 size={13} />
                      <span>تكبير الصورة</span>
                    </span>
                  </div>
                </div>
                <span className="cmd-img-note">
                  صورة حقيقية موثقة من داخل العيادة بموافقة الحالة
                </span>

                {/* Additional Clinical Gallery (InBody, Labs, Progress Angles) */}
                {selectedCase.additionalImages && selectedCase.additionalImages.length > 0 && (
                  <div className="cmd-gallery-strip">
                    <span className="cmd-gallery-title">صور وفحوصات إضافية ({selectedCase.additionalImages.length}):</span>
                    <div className="cmd-gallery-thumbs">
                      {selectedCase.additionalImages.map((imgUrl, i) => (
                        <div
                          key={i}
                          className="cmd-gallery-thumb"
                          onClick={() =>
                            setLightboxImage({
                              url: imgUrl,
                              title: `${selectedCase.name} — فحص / صورة ${i + 1}`,
                              subtitle: selectedCase.title,
                            })
                          }
                          title="تكبير الفحص أو الصورة"
                        >
                          <img src={imgUrl} alt={`صورة إضافية ${i + 1}`} />
                          <div className="cmd-gallery-thumb-overlay">
                            <ZoomIn size={12} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Clinical Details */}
              <div className="cmd-details-col">
                {/* Metric Summary Strip */}
                <div className="cmd-stats-box">
                  <div className="cmd-stat-item">
                    <span className="csi-label">إجمالي النزول</span>
                    <strong className="csi-val is-loss">-{selectedCase.weightLostKg} كجم</strong>
                  </div>
                  <div className="cmd-stat-item">
                    <span className="csi-label">الوزن السابق</span>
                    <strong className="csi-val">{selectedCase.beforeWeight} كجم</strong>
                  </div>
                  <div className="cmd-stat-item">
                    <span className="csi-label">الوزن الحالي</span>
                    <strong className="csi-val is-target">{selectedCase.afterWeight} كجم</strong>
                  </div>
                  <div className="cmd-stat-item">
                    <span className="csi-label">مدة البرنامج</span>
                    <strong className="csi-val">{selectedCase.durationText}</strong>
                  </div>
                </div>

                {/* Doctor's Assessment & Clinical Plan */}
                <div className="cmd-section">
                  <h4 className="cmd-section-title">
                    <Activity size={14} />
                    <span>البرنامج وخطة التغذية</span>
                  </h4>
                  <p className="cmd-section-text">{selectedCase.programTitle}</p>
                </div>

                {selectedCase.details && (
                  <div className="cmd-section">
                    <h4 className="cmd-section-title">
                      <HeartHandshake size={14} />
                      <span>تفاصيل المتابعة والحالة الصحية</span>
                    </h4>
                    <p className="cmd-section-text">{selectedCase.details}</p>
                  </div>
                )}

                {/* Patient Quote */}
                <div className="cmd-quote-box">
                  <Quote size={16} className="cmd-quote-icon" />
                  <p className="cmd-quote-text">"{selectedCase.quote}"</p>
                </div>
              </div>
            </div>

            <div className="cmd-footer">
              <span className="cmd-footer-stamp">
                مركز المستقبل للتغذية العلاجية • د. رنا ياسر الشوري
              </span>
              <div className="cmd-footer-actions">
                <button
                  type="button"
                  className="cmd-btn-secondary"
                  onClick={() => setSelectedCase(null)}
                >
                  إغلاق التقرير
                </button>
                <Link
                  to="/booking"
                  className="cmd-btn-primary"
                  onClick={() => setSelectedCase(null)}
                >
                  <span>احجزي استشارتكِ لحالة مماثلة</span>
                  <ArrowLeft size={15} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 8. Customer Review Deep-Dive & Enlarged Message Modal */}
      {selectedReview && (
        <div
          className="review-modal-backdrop"
          onClick={() => setSelectedReview(null)}
          role="dialog"
          aria-modal="true"
          aria-label="معاينة تجربة العميل الأصلية"
        >
          <div className="review-modal-dialog" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header - Ultra clean & minimal */}
            <div className="rmd-header">
              <div className="rmd-header-info">
                <h3 className="rmd-title">
                  {selectedReview.name || 'عميل ومراجع بالعيادة'}
                  {selectedReview.weightLostKg ? ` (نزول ${selectedReview.weightLostKg} كجم)` : ''}
                </h3>
                <span className="rmd-subtitle">
                  {selectedReview.programTitle || 'برنامج المتابعة والتغذية العلاجية'}
                  {selectedReview.durationText ? ` • ${selectedReview.durationText}` : ''}
                </span>
              </div>
              <button
                type="button"
                className="rmd-close-btn"
                onClick={() => setSelectedReview(null)}
                aria-label="إغلاق"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body - Real authentic screenshot first, then custom composer */}
            <div className="rmd-body">
              {/* Real Authentic Screenshot */}
              {selectedReview.imageUrl ? (
                <div className="rmd-real-proof-container">
                  <div
                    className="rmd-real-img-frame"
                    onClick={() =>
                      setLightboxImage({
                        url: selectedReview.imageUrl!,
                        title: `${selectedReview.name || 'عميل'} - ${selectedReview.title}`,
                        subtitle: 'لقطة شاشة أصلية وموثقة من محادثة وتجربة الحالة بالعيادة 🔒',
                      })
                    }
                    title="انقري لتكبير الصورة بشاشة كاملة"
                  >
                    <img
                      src={selectedReview.imageUrl}
                      alt={selectedReview.title}
                      className="rmd-real-screenshot-img"
                    />
                    <div className="rmd-real-img-overlay">
                      <span className="rmd-real-zoom-tag">
                        <Maximize2 size={13} />
                        <span>تكبير الصورة كاملة</span>
                      </span>
                    </div>
                  </div>
                  <span className="rmd-real-proof-caption">
                    <ShieldCheck size={13} />
                    <span>لقطة شاشة أصلية حقيقية موثقة من تجربة ومحادثة الحالة 🔒</span>
                  </span>
                </div>
              ) : (
                <div className="rmd-quote-fallback">
                  <p className="rmd-quote-fallback-text">"{selectedReview.quote}"</p>
                </div>
              )}

              {/* Interactive Message Composer ("وتحتها بكتب أنت الرسالة بنفسك") */}
              <div className="rmd-composer-box">
                <div className="rmd-composer-head">
                  <MessageCircle size={15} />
                  <span>اكتبي استفساركِ لدكتورة رنا بنفسك:</span>
                </div>
                <div className="rmd-composer-input-wrap">
                  <textarea
                    className="rmd-composer-textarea"
                    rows={2}
                    value={customInquiry}
                    onChange={(e) => setCustomInquiry(e.target.value)}
                    placeholder="اكتبي رسالتكِ أو استفساركِ لدكتورة رنا هنا (مثال: أود معرفة تفاصيل المتابعة لحالتي...)..."
                  />
                  <div className="rmd-composer-suggestions">
                    <button
                      type="button"
                      className="rmd-chip-btn"
                      onClick={() => setCustomInquiry(`مرحباً د. رنا، أرغب في حجز كشف واستشارة بخصوص حالتي وتجربة (${selectedReview.title}).`)}
                    >
                      + حجز موعد كشف
                    </button>
                    <button
                      type="button"
                      className="rmd-chip-btn"
                      onClick={() => setCustomInquiry(`مرحباً د. رنا، أود الاستفسار عن تفاصيل وأسعار برنامج (${selectedReview.programTitle || 'المتابعة'}).`)}
                    >
                      + أسعار البرنامج
                    </button>
                    <button
                      type="button"
                      className="rmd-chip-btn"
                      onClick={() => setCustomInquiry('مرحباً د. رنا، هل المتابعة متاحة أونلاين أم حضور بالعيادة فقط؟')}
                    >
                      + متابعة أونلاين
                    </button>
                  </div>
                </div>

                <a
                  href={whatsappUrl(
                    clinic?.whatsapp || '201041504201',
                    customInquiry.trim()
                      ? `${customInquiry.trim()}\n\n(استفسار بخصوص تجربة: ${selectedReview.name || 'العميل'} - ${selectedReview.title})`
                      : `مرحباً د. رنا، كنت أقرأ تجربة (${selectedReview.name || 'العميل'} - ${selectedReview.title}) وأود الاستفسار عن المتابعة لحالتي وحجز موعد بالمركز.`
                  )}
                  className="rmd-composer-submit-btn"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <WhatsAppIcon size={17} color="#ffffff" />
                  <span>إرسال استفساركِ عبر واتساب الآن</span>
                  <ArrowLeft size={16} />
                </a>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="rmd-footer">
              <div className="rmd-nav-controls">
                <button
                  type="button"
                  className="rmd-nav-btn"
                  onClick={() => {
                    setCustomInquiry('');
                    handlePrevReview();
                  }}
                  title="الرأي السابق"
                  aria-label="الرأي السابق"
                >
                  <ChevronRight size={15} />
                  <span>السابق</span>
                </button>

                <span className="rmd-nav-counter">
                  {selectedReviewIndex >= 0 ? `${selectedReviewIndex + 1} من ${reviews.length}` : ''}
                </span>

                <button
                  type="button"
                  className="rmd-nav-btn"
                  onClick={() => {
                    setCustomInquiry('');
                    handleNextReview();
                  }}
                  title="الرأي التالي"
                  aria-label="الرأي التالي"
                >
                  <span>التالي</span>
                  <ChevronLeft size={15} />
                </button>
              </div>

              <div className="rmd-footer-actions">
                <button
                  type="button"
                  className="rmd-btn-secondary"
                  onClick={() => setSelectedReview(null)}
                >
                  إغلاق
                </button>
                <Link
                  to="/booking"
                  className="rmd-btn-primary"
                  onClick={() => setSelectedReview(null)}
                >
                  <span>احجزي استشارتكِ الآن</span>
                  <ArrowLeft size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 9. Lightbox Image Viewer Modal */}
      {lightboxImage && (
        <div className="story-lightbox-backdrop" onClick={() => setLightboxImage(null)}>
          <div className="story-lightbox-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="story-lightbox-header">
              <div>
                <h4 className="story-lightbox-title">{lightboxImage.title}</h4>
                {lightboxImage.subtitle && (
                  <p className="story-lightbox-sub">{lightboxImage.subtitle}</p>
                )}
              </div>
              <button
                type="button"
                className="story-lightbox-close"
                onClick={() => setLightboxImage(null)}
                aria-label="إغلاق المعاينة"
              >
                <X size={18} />
              </button>
            </div>
            <div className="story-lightbox-body">
              <img
                src={lightboxImage.url}
                alt={lightboxImage.title}
                className="story-lightbox-img"
              />
            </div>
            <div className="story-lightbox-footer">
              <span className="slf-note">مركز المستقبل للتغذية العلاجية • د. رنا ياسر الشوري</span>
              <Link to="/booking" className="slf-cta" onClick={() => setLightboxImage(null)}>
                <span>ابدأي رحلتكِ الآن</span>
                <ArrowLeft size={14} />
              </Link>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
