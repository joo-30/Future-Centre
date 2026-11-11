import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
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
import { useMemo, useState } from 'react';
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
          <span>رسائل واتساب</span>
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
                <h3 className="block-title">رسائل المرضى على واتساب</h3>
                <p className="block-sub">
                  رسائل ومحادثات حقيقية من مراجعي المركز وفرحتهم بالنتيجة ومتابعة دكتورة رنا.
                </p>
              </div>
            </div>
          </div>

          <div className="feedback-micro-grid">
            {reviews.map((r) => {
              const handleOpen = () => {
                if (r.imageUrl) {
                  setLightboxImage({
                    url: r.imageUrl,
                    title: r.name,
                    subtitle: r.title,
                  });
                }
              };
              return (
                <div
                  key={r.id}
                  className={`feedback-micro-card ${r.imageUrl ? 'is-clickable' : ''}`}
                  onClick={handleOpen}
                  role={r.imageUrl ? 'button' : undefined}
                  tabIndex={r.imageUrl ? 0 : undefined}
                  onKeyDown={(e) => {
                    if (r.imageUrl && (e.key === 'Enter' || e.key === ' ')) {
                      e.preventDefault();
                      handleOpen();
                    }
                  }}
                  title={r.imageUrl ? 'انقر في أي مكان لمعاينة سكرين شوت المحادثة الأصلية' : undefined}
                >
                  {/* Top Row: Sender Info & WhatsApp Pill */}
                  <div className="fmc-top">
                    <div className="fmc-sender-wrap">
                      <div className="fmc-avatar">{r.name.slice(0, 1)}</div>
                      <div>
                        <div className="fmc-sender-name-row">
                          <h4 className="fmc-sender-name">{r.name}</h4>
                          <span className="fmc-wa-pill">
                            <span className="wa-dot"></span>
                            <span>واتساب موثق</span>
                          </span>
                        </div>
                        <span className="fmc-program-sub">{r.programTitle}</span>
                      </div>
                    </div>

                    {r.weightLostKg && (
                      <span className="fmc-loss-tag">-{r.weightLostKg} كجم</span>
                    )}
                  </div>

                  {/* Quote Body */}
                  <div className="fmc-quote-wrap">
                    <Quote size={15} className="fmc-quote-icon" />
                    <p className="fmc-quote-text">"{r.quote}"</p>
                  </div>

                  {/* Footer with Thumbnail Preview to Lightbox */}
                  <div className="fmc-footer">
                    <div className="fmc-verified-tag">
                      <ShieldCheck size={13} />
                      <span>مراجعة مثبتة بالعيادة</span>
                    </div>

                    {r.imageUrl && (
                      <span
                        className="fmc-view-screenshot-btn"
                        title="انقر لمعاينة سكرين شوت المحادثة الأصلية"
                      >
                        <Maximize2 size={12} />
                        <span>معاينة المحادثة</span>
                      </span>
                    )}
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

      {/* 8. Lightbox Image Viewer Modal */}
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
