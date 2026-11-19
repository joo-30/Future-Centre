import fs from 'fs';

// =========================================================================
// 1. UPDATE SuccessStoriesSection.tsx
// =========================================================================
const storiesPath = 'client/src/features/home/components/SuccessStoriesSection.tsx';
let storiesCode = fs.readFileSync(storiesPath, 'utf8');

// Ensure getCaseImage helper function is added
const getCaseImageHelper = `
function getCaseImage(c: SuccessStory): string {
  if (c.name.includes('سامح')) return '/stories/transformation_sameh.jpg';
  if (c.name.includes('صفية')) return '/stories/safia_with_dr.jpg';
  if (c.name.includes('ندى')) return '/stories/transformation_107kg.jpg';
  if (c.detailsImageUrl && !c.detailsImageUrl.includes('case_cover')) return c.detailsImageUrl;
  if (c.imageUrl && !c.imageUrl.includes('case_cover')) return c.imageUrl;
  return '/stories/transformation_107kg.jpg';
}
`;

if (!storiesCode.includes('function getCaseImage')) {
  storiesCode = storiesCode.replace(
    'export function SuccessStoriesSection() {',
    `${getCaseImageHelper}\nexport function SuccessStoriesSection() {`
  );
}

// Replace image src to use getCaseImage(c)
storiesCode = storiesCode.replace(
  /src=\{c\.imageUrl\s*\|\|\s*'\/stories\/case_cover_nada\.png'\}/g,
  'src={getCaseImage(c)}'
);

// Ensure the section titles and subtitles match user requirements exactly
storiesCode = storiesCode.replace(
  '<h3 className="block-title">دراسات التحول والنتائج الإكلينيكية</h3>',
  '<h3 className="block-title">بعض عملائنا</h3>'
);

storiesCode = storiesCode.replace(
  '<h3 className="block-title">انطباعات ورسائل المراجعات</h3>',
  '<h3 className="block-title">انطباعات ورسائل المراجعين</h3>'
);

fs.writeFileSync(storiesPath, storiesCode, 'utf8');
console.log('Successfully updated SuccessStoriesSection.tsx');


// =========================================================================
// 2. UPDATE Home.tsx (Hero Section & Doctor Section Refinements)
// =========================================================================
const homePath = 'client/src/features/home/Home.tsx';
let homeCode = fs.readFileSync(homePath, 'utf8');

// Update Tagline with live dot
const oldTagline = `<span className="clinic-intro-tagline">
                <MapPin size={14} aria-hidden="true" /> عيادة التغذية العلاجية ونحت القوام · {data.clinic.city || 'كفر الزيات'}
              </span>`;

const newTagline = `<span className="clinic-intro-tagline">
                <span className="clinic-intro-live-dot" aria-hidden="true" />
                عيادة التغذية العلاجية ونحت القوام · {data.clinic.city || 'كفر الزيات'}
              </span>`;

homeCode = homeCode.replace(oldTagline, newTagline);

// Update H1 with clean highlight span
const oldH1 = `<h1 id="clinic-intro-title">
                الرعاية الطبية الحقيقية
                <span>تبدأ من الإصغاء لجسمكِ.</span>
              </h1>`;

const newH1 = `<h1 id="clinic-intro-title">
                صحتكِ تبدأ من
                <span>الإصغاء لجسمكِ.</span>
              </h1>`;

homeCode = homeCode.replace(oldH1, newH1);

// Update Hero Visual Trust Tag
const oldHeroVisual = `<div className="clinic-intro-visual">
              <div className="clinic-intro-frame">
                <img
                  src="/assets/consultation.png"
                  alt="جلسة استشارة طبية متخصصة مع د. رنا ياسر الشورى في مركز المستقبل"
                  width="1200"
                  height="975"
                  fetchPriority="high"
                />
              </div>
            </div>`;

const newHeroVisual = `<div className="clinic-intro-visual">
              <div className="clinic-intro-frame">
                <img
                  src="/assets/consultation.png"
                  alt="جلسة استشارة طبية متخصصة مع د. رنا ياسر الشورى في مركز المستقبل"
                  width="1200"
                  height="975"
                  fetchPriority="high"
                />
              </div>
              <div className="clinic-intro-trust-tag">
                <div className="htt-icon" aria-hidden="true">🩺</div>
                <div className="htt-text">
                  <strong>استشارة إكلينيكية مباشرة</strong>
                  <span>بإشراف د. رنا ياسر الشورى</span>
                </div>
              </div>
            </div>`;

homeCode = homeCode.replace(oldHeroVisual, newHeroVisual);

fs.writeFileSync(homePath, homeCode, 'utf8');
console.log('Successfully updated Home.tsx');


// =========================================================================
// 3. UPDATE clinic-intro.css
// =========================================================================
const introCssPath = 'client/src/styles/site/clinic-intro.css';
let introCss = fs.readFileSync(introCssPath, 'utf8');

// Ensure hero trust tag styles are present
const heroTrustTagCss = `
.clinic-intro-live-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #16a34a;
  box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.2);
  display: inline-block;
}

.clinic-intro-trust-tag {
  position: absolute;
  bottom: -18px;
  right: 24px;
  background: #FFFFFF;
  border: 1px solid rgba(6, 63, 50, 0.12);
  border-radius: 16px;
  padding: 10px 18px;
  box-shadow: 0 10px 30px rgba(6, 63, 50, 0.12);
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 2;
}

.htt-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(113, 131, 74, 0.14);
  color: var(--clinic-evergreen);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 17px;
}

.htt-text strong {
  display: block;
  font-size: 13.5px;
  font-weight: 800;
  color: var(--clinic-evergreen);
}

.htt-text span {
  display: block;
  font-size: 11.5px;
  color: var(--clinic-sage);
  font-weight: 600;
}
`;

if (!introCss.includes('.clinic-intro-trust-tag')) {
  introCss = introCss.replace('.clinic-intro-frame {', `${heroTrustTagCss}\n.clinic-intro-frame {`);
}

// Streamlined Horizon Index (Airy, unified container with vertical hairline dividers)
const oldPillarsGridPattern = /\.clinic-intro-index\s*\{[\s\S]*?\.clinic-index-desc\s*\{[\s\S]*?display:\s*block;\s*\}/;

const unifiedHorizonIndexCss = `/* Unified Horizon Index Row (Clean, Airy & Distinct from Services Cards) */
.clinic-intro-index {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 20px;
  padding: 28px 32px;
  background: #FFFFFF;
  border-radius: 24px;
  border: 1px solid rgba(6, 63, 50, 0.08);
  box-shadow: 0 4px 20px rgba(6, 63, 50, 0.03);
}

.clinic-index-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-left: 16px;
  background: transparent;
  border: none;
  box-shadow: none;
  padding: 0 0 0 16px;
  transition: transform 0.2s ease;
}

.clinic-index-item:not(:last-child) {
  border-left: 1px solid rgba(6, 63, 50, 0.08);
}

.clinic-index-item:hover {
  transform: translateY(-2px);
}

.clinic-index-top {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-block-end: 4px;
}

.clinic-index-num {
  font-size: 12px;
  font-weight: 850;
  color: var(--clinic-evergreen);
  background: rgba(113, 131, 74, 0.12);
  padding: 3px 8px;
  border-radius: 6px;
  letter-spacing: 0.5px;
}

.clinic-index-icon {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: rgba(113, 131, 74, 0.08);
  color: var(--clinic-sage);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.clinic-index-title {
  font-size: 16px;
  font-weight: 850;
  color: var(--clinic-evergreen);
  line-height: 1.35;
  margin-block-end: 4px;
  display: block;
}

.clinic-index-desc {
  font-size: 13px;
  color: var(--clinic-lead);
  line-height: 1.6;
  margin: 0;
  display: block;
}`;

introCss = introCss.replace(oldPillarsGridPattern, unifiedHorizonIndexCss);

fs.writeFileSync(introCssPath, introCss, 'utf8');
console.log('Successfully updated clinic-intro.css');
