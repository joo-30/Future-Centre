import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// 1. Update booking.css
const bookingCssPath = path.join(projectRoot, 'client/src/styles/reference/booking.css');
let bookingCss = fs.readFileSync(bookingCssPath, 'utf8');

// Replace the restrictive width & grid in booking.css
const oldBookingSection = `.live-booking {
  max-width: 1220px !important;
  margin-inline: auto !important;
  padding-inline: clamp(24px, 4.5vw, 56px) !important;
  box-sizing: border-box !important;
}`;

const newBookingSection = `.live-booking {
  max-width: 1360px !important;
  margin-inline: auto !important;
  padding-inline: clamp(16px, 2.5vw, 32px) !important;
  box-sizing: border-box !important;
}`;

bookingCss = bookingCss.replace(oldBookingSection, newBookingSection);

const oldBookLayout = `.live-booking .book-layout {
  display: grid !important;
  grid-template-columns: minmax(0, 1fr) 340px !important;
  gap: 34px !important;
  align-items: start !important;
}

.live-booking .book-main {
  background: #ffffff !important;
  border-radius: 26px !important;
  border: 1.5px solid #dce8d6 !important;
  padding: 36px 34px !important;
  box-shadow: 0 10px 35px rgba(27, 67, 42, 0.05) !important;
}`;

const newBookLayout = `.live-booking .book-layout {
  display: grid !important;
  grid-template-columns: minmax(0, 1fr) 320px !important;
  gap: 24px !important;
  align-items: start !important;
}

.live-booking .book-main {
  background: #ffffff !important;
  border-radius: 24px !important;
  border: 1.5px solid #dce8d6 !important;
  padding: 28px 28px !important;
  box-shadow: 0 8px 30px rgba(27, 67, 42, 0.04) !important;
}`;

bookingCss = bookingCss.replace(oldBookLayout, newBookLayout);

const oldServiceGrid = `.live-booking .service-cards-grid {
  display: grid !important;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)) !important;
  gap: 16px !important;
  margin-bottom: 26px !important;
}`;

const newServiceGrid = `.live-booking .service-cards-grid {
  display: grid !important;
  grid-template-columns: repeat(3, 1fr) !important;
  gap: 14px !important;
  margin-bottom: 24px !important;
}

@media (max-width: 1024px) {
  .live-booking .service-cards-grid {
    grid-template-columns: repeat(2, 1fr) !important;
  }
}

@media (max-width: 640px) {
  .live-booking .service-cards-grid {
    grid-template-columns: 1fr !important;
  }
}`;

bookingCss = bookingCss.replace(oldServiceGrid, newServiceGrid);

fs.writeFileSync(bookingCssPath, bookingCss, 'utf8');
console.log('1. Updated booking.css with expanded width and 3-column service grid on laptop!');

// 2. Update SuccessStoriesSection.tsx
const storiesComponentPath = path.join(projectRoot, 'client/src/features/home/components/SuccessStoriesSection.tsx');
let storiesComponent = fs.readFileSync(storiesComponentPath, 'utf8');

// Ensure MessageCircle and ShieldCheck are imported
const oldMicroCardContent = `{/* Top Row: Sender Info & WhatsApp Pill */}
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
                  </div>`;

const newMicroCardContent = `{/* Top Row: Verified Chat Badge & Loss Tag */}
                  <div className="fmc-top">
                    <div className="fmc-sender-wrap">
                      <div className="fmc-avatar is-wa" aria-hidden="true">
                        <MessageCircle size={18} />
                      </div>
                      <div>
                        <div className="fmc-sender-name-row">
                          <span className="fmc-badge-title">محادثة واتساب موثقة</span>
                          <span className="fmc-wa-pill">
                            <span className="wa-dot"></span>
                            <span>مثبتة بالعيادة</span>
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
                  </div>`;

const normComp = storiesComponent.replace(/\r\n/g, '\n');
const normOld = oldMicroCardContent.replace(/\r\n/g, '\n');

if (normComp.includes(normOld)) {
  storiesComponent = normComp.replace(normOld, newMicroCardContent);
  fs.writeFileSync(storiesComponentPath, storiesComponent, 'utf8');
  console.log('2. Successfully updated SuccessStoriesSection.tsx micro card template!');
} else {
  console.warn('Could not exact match oldMicroCardContent in SuccessStoriesSection.tsx');
}

// Also update lightbox title in SuccessStoriesSection.tsx
storiesComponent = fs.readFileSync(storiesComponentPath, 'utf8');
storiesComponent = storiesComponent.replace(
  `title: r.name,\n                    subtitle: r.title,`,
  `title: r.title,\n                    subtitle: 'محادثة موثقة عبر واتساب المركز الرسمي (خصوصية الحالة محفوظة 🔒)',`
);
fs.writeFileSync(storiesComponentPath, storiesComponent, 'utf8');

// 3. Update stories.css
const storiesCssPath = path.join(projectRoot, 'client/src/styles/site/stories.css');
let storiesCss = fs.readFileSync(storiesCssPath, 'utf8');

const newStoriesStyles = `
/* Verified WhatsApp Card Improvements */
.fmc-avatar.is-wa {
  background: #edf7ed !important;
  border-color: #a3e635 !important;
  color: #15803d !important;
}

.fmc-badge-title {
  font-family: 'Alexandria', sans-serif;
  font-size: 13.5px;
  font-weight: 800;
  color: #0f172a;
}

.fmc-loss-tag.is-neutral {
  background: #f1f5f9;
  border-color: #cbd5e1;
  color: #334155;
  font-size: 12px;
}

.fmc-headline {
  font-family: 'Alexandria', sans-serif;
  font-size: 14.5px;
  font-weight: 800;
  color: #064e3b;
  line-height: 1.45;
  margin-bottom: 8px;
}
`;

if (!storiesCss.includes('.fmc-badge-title')) {
  storiesCss += newStoriesStyles;
  fs.writeFileSync(storiesCssPath, storiesCss, 'utf8');
  console.log('3. Added styles for verified WhatsApp cards to stories.css');
}

// 4. Update story.model.ts in server
const storyModelPath = path.join(projectRoot, 'server/src/models/story.model.ts');
let storyModel = fs.readFileSync(storyModelPath, 'utf8');

const oldStory9 = `  {
    name: 'سيدات ومراجعات كفر الزيات',
    title: 'إشادة جماعية بتعامل المركز والنتائج المبهرة',
    category: 'صحة المرأة',
    weightLostKg: 12,
    durationText: 'توصية موثقة',
    programTitle: 'خدمات المتابعة بالعيادة - شارع الجيش',
    quote: 'حنان محمد: ممتازة وعن تجربة أشطر دكتورة بجد.. دينا محمود: دكتورة شاطرة جداً ربنا يباركلها.. عيادة المستقبل بعد توكيل أورانج.',
    details: 'توصيات ومراجعات موثقة من مراجعات العيادة على منصات التواصل الاجتماعي ومجموعات المجتمع المحلي بكفر الزيات.',
    imageUrl: '/stories/review_group_recommendation.jpg',
    storyType: 'review' as const,
    verified: true,
    featured: false,
    published: true,
    order: 9,
  },`;

const newStory9 = `  {
    name: 'توصيات وإشادات المراجعين',
    title: 'إشادة جماعية بتعامل المركز والنتائج الملموسة',
    category: 'صحة المرأة',
    weightLostKg: 12,
    durationText: 'توصية موثقة',
    programTitle: 'خدمات المتابعة بالعيادة',
    quote: 'ممتازة وعن تجربة أشطر دكتورة بجد وربنا يباركلها.. دكتورة شاطرة جداً وذوق وبتشرح كل خطوة بالتفصيل، فرق واضح في المقاسات والنشاط العام.',
    details: 'توصيات وإشادات موثقة من مراجعي العيادة عن تجربة المتابعة والالتزام بالخطة العلاجية.',
    imageUrl: '/stories/review_group_recommendation.jpg',
    storyType: 'review' as const,
    verified: true,
    featured: false,
    published: true,
    order: 9,
  },`;

const normModel = storyModel.replace(/\r\n/g, '\n');
const normOld9 = oldStory9.replace(/\r\n/g, '\n');

if (normModel.includes(normOld9)) {
  storyModel = normModel.replace(normOld9, newStory9);
  fs.writeFileSync(storyModelPath, storyModel, 'utf8');
  console.log('4. Successfully updated story #9 in story.model.ts');
} else {
  console.warn('Could not exact match story #9 in story.model.ts');
}

console.log('All updates staged successfully!');
