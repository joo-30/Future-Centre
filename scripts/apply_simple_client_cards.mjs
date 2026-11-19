import fs from 'fs';

// 1. Update SuccessStoriesSection.tsx
const storiesFilePath = 'client/src/features/home/components/SuccessStoriesSection.tsx';
let storiesCode = fs.readFileSync(storiesFilePath, 'utf8');

// Update GSAP selector if needed
storiesCode = storiesCode.replace(
  "'.transform-card-compact',",
  "'.transform-card-luxury, .transform-card-compact',"
);

// Update Header kicker & tabs
storiesCode = storiesCode.replace(
  '<span>رحلات تحول موثقة إكلينيكياً</span>',
  '<span>نتائج وتجارب حقيقية</span>'
);

storiesCode = storiesCode.replace(
  '<span>كل التحولات والنتائج</span>',
  '<span>كل التجارب</span>'
);

storiesCode = storiesCode.replace(
  '<span>دراسات الحالات والنتائج</span>',
  '<span>بعض عملائنا</span>'
);

storiesCode = storiesCode.replace(
  '<span>انطباعات المراجِعات</span>',
  '<span>انطباعات ورسائل المراجعين</span>'
);

// Update Block A Title & Subtitle ("بعض عملائنا")
storiesCode = storiesCode.replace(
  '<h3 className="block-title">دراسات التحول والنتائج الإكلينيكية</h3>',
  '<h3 className="block-title">بعض عملائنا</h3>'
);

storiesCode = storiesCode.replace(
  'حالات واقعية موثقة بالقياسات الإكلينيكية — اضغطي على أي بطاقة لمشاهدة تفاصيل النتيجة كاملة.',
  'حالات واقعية بدأت رحلتها مع دكتورة رنا، ووصلوا لوزنهم المثالي وصحتهم الأفضل — اضغطي على أي كارت لمشاهدة التفاصيل والصور كاملة.'
);

// Replace transformation cards grid with the new simple luxury card structure
const oldGridRegex = /<div className="transformations-grid">[\s\S]*?<\/div>\s*<\/div>\s*\)\s*\}\s*\{\/\* 5\. Section B/;

const newGridCode = `<div className="transformations-grid">
            {transformations.map((c) => (
              <article
                key={c.id}
                className="transform-card-luxury"
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
                <div className="tcl-top">
                  {/* Visual Photo with Duration Badge */}
                  <div className="tcl-photo-wrap">
                    <img
                      src={c.imageUrl || '/stories/case_cover_nada.png'}
                      alt={c.name}
                      className="tcl-photo-img"
                      loading="lazy"
                    />
                    {c.durationText && (
                      <span className="tcl-duration-pill">
                        <Clock size={12} aria-hidden="true" />
                        <span>المدة: {c.durationText}</span>
                      </span>
                    )}
                  </div>

                  {/* Content: Clean, Grand, Simple */}
                  <div className="tcl-body">
                    <div className="tcl-name-row">
                      <h4 className="tcl-name">{c.name}</h4>
                      {c.category && <span className="tcl-category">{c.category}</span>}
                    </div>

                    {/* Big Result Box (Clear in 1 second) */}
                    <div className="tcl-result-box">
                      <div className="tcl-loss-highlight">
                        -{c.weightLostKg} <span>كجم</span>
                      </div>
                      {c.beforeWeight && c.afterWeight && (
                        <div className="tcl-journey-text">
                          من {c.beforeWeight} كجم ➔ {c.afterWeight} كجم
                        </div>
                      )}
                    </div>

                    <p className="tcl-note">{c.title}</p>
                  </div>
                </div>

                <div className="tcl-cta-btn">
                  <span>مشاهدة الصور والتفاصيل كاملة</span>
                  <ChevronLeft size={16} aria-hidden="true" />
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      {/* 5. Section B`;

storiesCode = storiesCode.replace(oldGridRegex, newGridCode);

// Update Block B Title to "انطباعات ورسائل المراجعين"
storiesCode = storiesCode.replace(
  '<h3 className="block-title">انطباعات ورسائل المراجعات</h3>',
  '<h3 className="block-title">انطباعات ورسائل المراجعين</h3>'
);

storiesCode = storiesCode.replace(
  'رسائل وانطباعات حقيقية موثقة من مراجعي المركز بعد الوصول للوزن المثالي وتحسن المؤشرات الحيوية.',
  'رسائل وانطباعات حقيقية موثقة من مراجعي المركز وفرحتهم بالوصول للوزن المثالي مع دكتورة رنا.'
);

fs.writeFileSync(storiesFilePath, storiesCode, 'utf8');
console.log('Successfully updated SuccessStoriesSection.tsx');

// 2. Update stories.css
const storiesCssPath = 'client/src/styles/site/stories.css';
let storiesCss = fs.readFileSync(storiesCssPath, 'utf8');

const newLuxuryCardCss = `
/* ==========================================================================
   Section A: Elevated Luxury Client Cards (Simple, Grand, Uncluttered)
   ========================================================================== */
.transformations-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: clamp(20px, 2.5vw, 28px);
}

@media (max-width: 960px) {
  .transformations-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .transformations-grid {
    grid-template-columns: 1fr;
  }
}

.transform-card-luxury {
  background: #FFFFFF;
  border: 1px solid rgba(6, 63, 50, 0.09);
  border-radius: 26px;
  padding: clamp(20px, 2vw, 24px);
  box-shadow: 
    0 8px 30px -6px rgba(6, 63, 50, 0.05),
    0 2px 10px rgba(6, 63, 50, 0.02);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.28s ease, border-color 0.28s ease;
  cursor: pointer;
  position: relative;
}

.transform-card-luxury:hover {
  transform: translateY(-6px);
  box-shadow: 
    0 20px 44px -10px rgba(6, 63, 50, 0.14),
    0 4px 16px rgba(6, 63, 50, 0.04);
  border-color: rgba(6, 63, 50, 0.22);
}

.tcl-photo-wrap {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 10;
  border-radius: 18px;
  overflow: hidden;
  background: #E8ECE0;
  margin-block-end: 20px;
}

.tcl-photo-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  display: block;
  transition: transform 0.4s ease;
}

.transform-card-luxury:hover .tcl-photo-img {
  transform: scale(1.03);
}

.tcl-duration-pill {
  position: absolute;
  bottom: 12px;
  right: 12px;
  background: rgba(6, 63, 50, 0.88);
  backdrop-filter: blur(8px);
  color: #FFFFFF;
  font-size: 12px;
  font-weight: 750;
  padding: 5px 12px;
  border-radius: 9999px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.tcl-duration-pill svg {
  color: #C9DF83;
}

.tcl-name-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-block-end: 12px;
}

.tcl-name {
  font-size: 19px;
  font-weight: 850;
  color: #063F32;
  margin: 0;
}

.tcl-category {
  font-size: 12px;
  font-weight: 700;
  color: #71834A;
  background: rgba(113, 131, 74, 0.12);
  padding: 4px 12px;
  border-radius: 9999px;
}

/* Big Impact Result Box */
.tcl-result-box {
  background: #F8F7F2;
  border-radius: 16px;
  padding: 14px 18px;
  margin-block-end: 14px;
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  border: 1px solid rgba(6, 63, 50, 0.05);
}

.tcl-loss-highlight {
  font-size: 26px;
  font-weight: 900;
  color: #063F32;
  line-height: 1;
}

.tcl-loss-highlight span {
  font-size: 15px;
  font-weight: 750;
  color: #71834A;
  margin-inline-start: 4px;
}

.tcl-journey-text {
  font-size: 13px;
  font-weight: 700;
  color: #4A5E52;
}

.tcl-note {
  font-size: 13.5px;
  color: #4A5E52;
  line-height: 1.65;
  margin-block-end: 20px;
  min-height: 44px;
}

/* Prestigious Bottom Action Button */
.tcl-cta-btn {
  width: 100%;
  padding: 12px 16px;
  border-radius: 12px;
  background: #F4F2E9;
  color: #063F32;
  font-size: 14px;
  font-weight: 750;
  border: 1px solid rgba(6, 63, 50, 0.09);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.22s ease;
}

.transform-card-luxury:hover .tcl-cta-btn {
  background: #063F32;
  color: #FFFFFF;
  border-color: #063F32;
  box-shadow: 0 4px 14px rgba(6, 63, 50, 0.16);
}

.tcl-cta-btn svg {
  transition: transform 0.2s ease;
}

.transform-card-luxury:hover .tcl-cta-btn svg {
  transform: translateX(-3px);
}
`;

if (!storiesCss.includes('.transform-card-luxury')) {
  storiesCss += newLuxuryCardCss;
  fs.writeFileSync(storiesCssPath, storiesCss, 'utf8');
  console.log('Appended luxury card styles to stories.css');
}
