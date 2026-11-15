import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Flame,
  Minimize2,
  MessageCircle,
  ShieldCheck,
  Layers,
  Trophy,
  X,
  ZoomIn,
} from 'lucide-react';
import { useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { gsap, isReducedMotion, useGSAP } from '../../../lib/motion';
import { Link } from 'react-router-dom';
import type { SuccessStory } from '@future/shared';
import { WhatsAppIcon } from '../../../components/icons/WhatsAppIcon';
import { useCatalog } from '../../../hooks/useCatalog';
import { whatsappUrl } from '../../../lib/api';
import { publicApi } from '../../../lib/portal-api';

// These reports embed annotations, so display the original photo crops instead.
const casePhotoSets = new Map([
  ['/stories/transformation_107kg.jpg', 'nada'],
  ['/stories/transformation_sameh.jpg', 'sameh'],
  ['/stories/transformation_safia.jpg', 'safia'],
]);

function StoryDialog({
  label,
  className,
  onClose,
  children,
}: {
  label: string;
  className: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const dialog = useRef<HTMLDialogElement>(null);

  useLayoutEffect(() => {
    const trigger = document.activeElement;
    const element = dialog.current;
    if (element && !element.open) element.showModal();
    return () => {
      requestAnimationFrame(() => {
        if (document.activeElement === document.body && trigger instanceof HTMLElement) {
          trigger.focus({ preventScroll: true });
        }
      });
    };
  }, []);

  return (
    <dialog
      ref={dialog}
      className={className}
      aria-label={label}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) event.currentTarget.close();
      }}
    >
      {children}
    </dialog>
  );
}

function ReviewMessage({ review, whatsapp }: { review: SuccessStory; whatsapp: string }) {
  const [expanded, setExpanded] = useState(false);
  const [imageState, setImageState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [inquiry, setInquiry] = useState('');
  const mediaRef = useRef<HTMLDivElement>(null);
  const context = review.name || 'أحد عملاء المركز';
  const inquiryText = inquiry.trim()
    ? inquiry.trim() + '\n\nاستفسار بخصوص تجربة ' + context
    : 'مرحباً د. رنا، قرأت تجربة ' + context + ' وأود الاستفسار عن المتابعة وحجز موعد بالمركز.';

  return (
    <div className="rmd-body">
      {review.imageUrl && imageState !== 'error' ? (
        <>
          <div className="rmd-view-toolbar">
            <button
              type="button"
              className="rmd-control"
              aria-controls="review-message-image"
              aria-pressed={expanded}
              disabled={imageState !== 'ready'}
              onClick={() => {
                setExpanded((current) => !current);
                mediaRef.current?.scrollTo({ top: 0, left: 0 });
              }}
            >
              {expanded ? <Minimize2 size={17} aria-hidden="true" /> : <ZoomIn size={17} aria-hidden="true" />}
              {expanded ? 'عرض الصورة كاملة' : 'تكبير الرسالة'}
            </button>
          </div>
          <div
            ref={mediaRef}
            id="review-message-image"
            className={'rmd-media' + (expanded ? ' is-expanded' : '')}
            role="region"
            aria-label="صورة الرسالة"
            aria-busy={imageState === 'loading'}
            tabIndex={expanded ? 0 : undefined}
          >
            {imageState === 'loading' && <span className="rmd-loading" role="status">جارٍ تحميل الرسالة…</span>}
            <img
              src={review.imageUrl}
              alt="صورة الرسالة الأصلية"
              className="rmd-real-screenshot-img"
              onLoad={() => setImageState('ready')}
              onError={() => setImageState('error')}
            />
          </div>
          {review.quote && <p className="sr-only">مقتطف من الرسالة. {review.quote}</p>}
        </>
      ) : (
        <div className="rmd-text-review">
          {imageState === 'error' && <p className="rmd-status">تعذّر تحميل صورة الرسالة.</p>}
          {review.quote && <blockquote>{review.quote}</blockquote>}
        </div>
      )}

      <details className="rmd-inquiry">
        <summary>استفسري عن التجربة <ChevronDown size={17} aria-hidden="true" /></summary>
        <div className="rmd-inquiry-content">
          <label htmlFor="story-review-inquiry">رسالتكِ لد. رنا</label>
          <textarea
            id="story-review-inquiry"
            rows={3}
            value={inquiry}
            onChange={(event) => setInquiry(event.target.value)}
            placeholder="اكتبي استفساركِ هنا"
          />
          <div className="rmd-inquiry-actions">
            <a href={whatsappUrl(whatsapp, inquiryText)} target="_blank" rel="noopener noreferrer">
              <WhatsAppIcon size={16} color="currentColor" /> إرسال عبر واتساب
            </a>
            <Link to="/booking">حجز كشف</Link>
          </div>
        </div>
      </details>
    </div>
  );
}

export function SuccessStoriesSection() {
  const sectionRef = useRef<HTMLElement>(null);


  const { data: catalogData } = useCatalog();
  const whatsapp = catalogData?.clinic.whatsapp || '201041504201';
  const [activeTab, setActiveTab] = useState<'all' | 'transformations' | 'reviews'>('all');
  const [selectedCase, setSelectedCase] = useState<SuccessStory | null>(null);
  const [selectedReview, setSelectedReview] = useState<SuccessStory | null>(null);

  const storiesQuery = useQuery({
    queryKey: ['public', 'stories'],
    queryFn: () => publicApi.stories(),
    staleTime: 5 * 60 * 1000,
  });

  const stories = storiesQuery.data?.stories || [];
  const selectedComparison = casePhotoSets.get(selectedCase?.detailsImageUrl ?? '');
  const selectedCaseName = selectedCase?.age != null
    ? selectedCase.name.replace(/\s*(?:\(\s*[0-9٠-٩۰-۹]+\s+سنة\s*\)|[0-9٠-٩۰-۹]+\s+سنة)\s*$/u, '').trim()
    : selectedCase?.name;

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

  const selectedReviewIndex = reviews.findIndex((review) => review.id === selectedReview?.id);

  function moveReview(direction: number) {
    if (reviews.length <= 1) return;
    const nextIndex = (selectedReviewIndex + direction + reviews.length) % reviews.length;
    setSelectedReview(reviews[nextIndex]);
  }

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
                    src="/stories/results-cover.webp"
                    alt=""
                    className="tc-cover-img"
                    width="1440"
                    height="758"
                    loading="lazy"
                  />
                  <div className="tc-cover-hover-overlay">
                    <span className="tc-hover-badge">
                      <ZoomIn size={15} />
                      <span>عرض صور قبل وبعد</span>
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

      {(activeTab === 'all' || activeTab === 'reviews') && reviews.length > 0 && (
        <section className="feedback-block" aria-labelledby="feedback-title">
          <header className="feedback-heading">
            <h3 id="feedback-title">رسائل من عملائنا</h3>
            <p>تجارب شاركها عملاء المركز خلال رحلتهم مع د. رنا.</p>
          </header>

          <div className="feedback-micro-grid">
            {reviews.map((review) => (
              <article className="feedback-micro-card" key={review.id}>
                <p className="fmc-source">
                  <MessageCircle size={17} aria-hidden="true" />
                  {review.verified ? 'تجربة موثّقة' : 'تجربة عميل'}
                </p>
                <h4 className="fmc-headline" id={'review-title-' + review.id}>{review.title}</h4>
                {review.quote && <blockquote className="fmc-quote-text">{review.quote}</blockquote>}
                <button
                  type="button"
                  className="fmc-view-screenshot-btn"
                  aria-describedby={'review-title-' + review.id}
                  aria-haspopup="dialog"
                  onClick={() => setSelectedReview(review)}
                >
                  {review.imageUrl ? 'افتحي الرسالة' : 'اقرئي التجربة'} <ArrowLeft size={17} aria-hidden="true" />
                </button>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="stories-cta-banner" aria-labelledby="stories-cta-title">
        <div className="scb-content">
          <h3 className="scb-title" id="stories-cta-title">جاهزة تبدأي رحلتكِ؟</h3>
          <p className="scb-desc">
            ابدئي بكشف في العيادة مع د. رنا. في الزيارة الأولى بتتعرّف على احتياجكِ وبتحدّد معكِ الخطوة المناسبة.
          </p>
        </div>
        <div className="scb-actions">
          <Link to="/booking" className="scb-cta-btn">
            احجزي كشفكِ <ArrowLeft size={18} aria-hidden="true" />
          </Link>
          <a
            href={whatsappUrl(whatsapp, 'مرحباً د. رنا، أود الاستفسار عن كشف واستشارة التغذية والتخسيس بالمركز.')}
            className="scb-whatsapp-btn"
            target="_blank"
            rel="noopener noreferrer"
          >
            <WhatsAppIcon size={17} color="currentColor" />
            استفسري على واتساب
          </a>
        </div>
      </section>

      {selectedCase && (
        <StoryDialog
          className="case-modal-backdrop"
          label="صور قبل وبعد"
          onClose={() => setSelectedCase(null)}
        >
          <div className="case-modal-dialog">
            <header className="cmd-header">
              <div>
                <h3 className="cmd-patient-title">{selectedCaseName}</h3>
                {selectedCase.age != null && (
                  <p className="cmd-patient-age">{selectedCase.age} سنة</p>
                )}
              </div>
              <button
                type="button"
                className="cmd-close-btn"
                onClick={(event) => event.currentTarget.closest('dialog')?.close()}
                aria-label="إغلاق"
              >
                <X size={20} aria-hidden="true" />
              </button>
            </header>
            <div className="cmd-body">
              {selectedComparison ? (
                <div className="cmd-comparison">
                  <figure>
                    <figcaption>قبل</figcaption>
                    <img src={`/stories/compare-${selectedComparison}-before.webp`} alt={'قبل — ' + selectedCaseName} />
                  </figure>
                  <figure>
                    <figcaption>بعد</figcaption>
                    <img src={`/stories/compare-${selectedComparison}-after.webp`} alt={'بعد — ' + selectedCaseName} />
                  </figure>
                </div>
              ) : selectedCase.detailsImageUrl ? (
                <img
                  className="cmd-comparison-image"
                  src={selectedCase.detailsImageUrl}
                  alt={'صورة المقارنة — ' + selectedCaseName}
                />
              ) : (
                <p className="cmd-empty">صور قبل وبعد غير متاحة حاليًا.</p>
              )}
            </div>
          </div>
        </StoryDialog>
      )}

      {selectedReview && (
        <StoryDialog
          className="review-modal-backdrop"
          label="معاينة تجربة العميل الأصلية"
          onClose={() => setSelectedReview(null)}
        >
          <div
            className="review-modal-dialog"
            onKeyDown={(event) => {
              if (
                reviews.length < 2 ||
                (event.target instanceof HTMLElement &&
                  event.target.closest('input, textarea, select, [contenteditable], .rmd-media.is-expanded'))
              ) return;
              if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
                event.preventDefault();
                moveReview(event.key === 'ArrowLeft' ? 1 : -1);
              }
            }}
          >
            <header className="rmd-header">
              <h3 className="rmd-title">{selectedReview.title}</h3>
              <button
                type="button"
                className="rmd-close-btn"
                aria-label="إغلاق"
                onClick={(event) => event.currentTarget.closest('dialog')?.close()}
              >
                <X size={21} aria-hidden="true" />
              </button>
            </header>

            <ReviewMessage key={selectedReview.id} review={selectedReview} whatsapp={whatsapp} />

            {reviews.length > 1 && (
              <footer className="rmd-footer" aria-label="التنقل بين الرسائل">
                <button type="button" className="rmd-control" onClick={() => moveReview(-1)}>
                  <ChevronRight size={18} aria-hidden="true" /> السابقة
                </button>
                <span className="rmd-nav-counter" aria-live="polite">{selectedReviewIndex + 1} من {reviews.length}</span>
                <button type="button" className="rmd-control" onClick={() => moveReview(1)}>
                  التالية <ChevronLeft size={18} aria-hidden="true" />
                </button>
              </footer>
            )}
          </div>
        </StoryDialog>
      )}
    </section>
  );
}
