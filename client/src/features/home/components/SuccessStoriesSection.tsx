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
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { SuccessStory } from '@future/shared';
import { WhatsAppIcon } from '../../../components/icons/WhatsAppIcon';
import { useCatalog } from '../../../hooks/useCatalog';
import { whatsappUrl } from '../../../lib/api';
import { publicApi } from '../../../lib/portal-api';

export function SuccessStoriesSection() {
  const { data: catalogData } = useCatalog();
  const clinic = catalogData?.clinic;
  const [activeTab, setActiveTab] = useState<'all' | 'transformations' | 'reviews'>('all');
  const [selectedCase, setSelectedCase] = useState<SuccessStory | null>(null);
  const [selectedReview, setSelectedReview] = useState<SuccessStory | null>(null);
  const [lightboxImage, setLightboxImage] = useState<{ url: string; title: string; subtitle?: string } | null>(null);

  const storiesQuery = useQuery({
    queryKey: ['public', 'stories'],
    queryFn: () => publicApi.stories(),
    staleTime: 5 * 60 * 1000,
  });

  const stories = storiesQuery.data?.stories || [];

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
    <section className="stories-section" id="stories" aria-label="قصص وتجارب النجاح">
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
          aria-label="تكبير رأي العميل وقراءة الرسالة"
        >
          <div className="review-modal-dialog" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="rmd-header">
              <div className="rmd-header-info">
                <div className="rmd-badge-row">
                  <span className="rmd-badge">
                    <MessageCircle size={14} />
                    <span>محادثة موثقة عبر واتساب المركز الرسمي</span>
                  </span>
                  <span className="rmd-verified-pill">
                    <ShieldCheck size={13} />
                    <span>مثبتة بالعيادة 🔒</span>
                  </span>
                </div>
                <h3 className="rmd-title">{selectedReview.title}</h3>
                <div className="rmd-meta-row">
                  <span className="rmd-sender-name">{selectedReview.name || 'عميل ومراجع بالعيادة'}</span>
                  <span className="rmd-meta-divider">•</span>
                  <span className="rmd-program-name">{selectedReview.programTitle || 'برنامج المتابعة الإكلينيكية'}</span>
                  {selectedReview.durationText && (
                    <>
                      <span className="rmd-meta-divider">•</span>
                      <span className="rmd-duration-tag">
                        <Clock size={12} />
                        <span>{selectedReview.durationText}</span>
                      </span>
                    </>
                  )}
                </div>
              </div>
              <button
                type="button"
                className="rmd-close-btn"
                onClick={() => setSelectedReview(null)}
                aria-label="إغلاق التكبير"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className={`rmd-body ${selectedReview.imageUrl ? 'has-media' : 'no-media'}`}>
              {/* Media Column (WhatsApp Screenshot) if available */}
              {selectedReview.imageUrl && (
                <div className="rmd-media-col">
                  <div
                    className="rmd-screenshot-frame"
                    onClick={() =>
                      setLightboxImage({
                        url: selectedReview.imageUrl!,
                        title: selectedReview.title,
                        subtitle: 'محادثة موثقة عبر واتساب المركز الرسمي (خصوصية الحالة محفوظة 🔒)',
                      })
                    }
                    title="انقر لتكبير السكرين شوت بشاشة كاملة"
                  >
                    <img
                      src={selectedReview.imageUrl}
                      alt={selectedReview.title}
                      className="rmd-screenshot-img"
                    />
                    <div className="rmd-screenshot-overlay">
                      <span className="rmd-zoom-pill">
                        <Maximize2 size={13} />
                        <span>تكبير السكرين شوت كاملة</span>
                      </span>
                    </div>
                  </div>
                  <span className="rmd-screenshot-caption">
                    <ShieldCheck size={13} />
                    <span>لقطة شاشة موثقة من المحادثة الأصلية بالعيادة</span>
                  </span>
                </div>
              )}

              {/* Message Details Column */}
              <div className="rmd-content-col">
                {/* Large WhatsApp Styled Chat Bubble for Crystal Clear Reading */}
                <div className="rmd-chat-container">
                  <div className="rmd-chat-head">
                    <div className="rmd-chat-avatar">
                      <MessageCircle size={18} />
                    </div>
                    <div className="rmd-chat-user-info">
                      <span className="rmd-chat-user-name">
                        {selectedReview.name || 'عميل ومراجع بالعيادة'}
                      </span>
                      <span className="rmd-chat-user-status">
                        <span className="wa-online-dot"></span>
                        <span>محادثة واتساب حقيقية موثقة</span>
                      </span>
                    </div>
                    <span className="rmd-chat-privacy-tag">خصوصية الحالة محفوظة 🔒</span>
                  </div>

                  <div className="rmd-chat-bubble">
                    <Quote size={22} className="rmd-chat-quote-icon" />
                    <p className="rmd-chat-text">"{selectedReview.quote}"</p>
                    <div className="rmd-chat-meta">
                      <span className="rmd-chat-time">محادثة معتمدة</span>
                      <span className="rmd-chat-ticks" title="تمت القراءة والتأكيد">✓✓</span>
                    </div>
                  </div>
                </div>

                {/* Metric Summary if weight lost */}
                {selectedReview.weightLostKg ? (
                  <div className="rmd-loss-strip">
                    <div className="rmd-loss-box">
                      <span className="rmd-lb-label">إجمالي النزول المحقق</span>
                      <strong className="rmd-lb-val">-{selectedReview.weightLostKg} كجم</strong>
                    </div>
                    {selectedReview.durationText && (
                      <div className="rmd-loss-box is-duration">
                        <span className="rmd-lb-label">المدة الزمنية</span>
                        <strong className="rmd-lb-val is-text">{selectedReview.durationText}</strong>
                      </div>
                    )}
                    <div className="rmd-loss-box is-program">
                      <span className="rmd-lb-label">البرنامج العلاجي</span>
                      <strong className="rmd-lb-val is-text">{selectedReview.programTitle}</strong>
                    </div>
                  </div>
                ) : null}

                {/* Clinical Notes / Assessment if details exist */}
                {selectedReview.details && (
                  <div className="rmd-details-card">
                    <h5 className="rmd-dc-title">
                      <Activity size={14} />
                      <span>تفاصيل النتيجة والمتابعة الطبية</span>
                    </h5>
                    <p className="rmd-dc-text">{selectedReview.details}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="rmd-footer">
              {/* Pagination / Navigation Controls */}
              <div className="rmd-nav-controls">
                <button
                  type="button"
                  className="rmd-nav-btn"
                  onClick={handlePrevReview}
                  title="الرأي السابق (سهم يمين)"
                  aria-label="الرأي السابق"
                >
                  <ChevronRight size={16} />
                  <span>السابق</span>
                </button>

                <span className="rmd-nav-counter">
                  {selectedReviewIndex >= 0 ? `${selectedReviewIndex + 1} من ${reviews.length}` : ''}
                </span>

                <button
                  type="button"
                  className="rmd-nav-btn"
                  onClick={handleNextReview}
                  title="الرأي التالي (سهم يسار)"
                  aria-label="الرأي التالي"
                >
                  <span>التالي</span>
                  <ChevronLeft size={16} />
                </button>
              </div>

              {/* Action Buttons */}
              <div className="rmd-footer-actions">
                <button
                  type="button"
                  className="rmd-btn-secondary"
                  onClick={() => setSelectedReview(null)}
                >
                  إغلاق
                </button>
                <a
                  href={whatsappUrl(
                    clinic?.whatsapp || '201041504201',
                    `مرحباً د. رنا، كنت أقرأ تجربة (${selectedReview.title}) وأود الاستفسار عن المتابعة وحجز موعد بالمركز.`
                  )}
                  className="rmd-btn-whatsapp"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <WhatsAppIcon size={16} color="#ffffff" />
                  <span>استفسار واتساب</span>
                </a>
                <Link
                  to="/booking"
                  className="rmd-btn-primary"
                  onClick={() => setSelectedReview(null)}
                >
                  <span>احجزي استشارتكِ الآن</span>
                  <ArrowLeft size={15} />
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
