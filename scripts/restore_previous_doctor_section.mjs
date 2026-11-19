import fs from 'fs';

// 1. Restore Home.tsx doctor section
const homePath = 'client/src/features/home/Home.tsx';
let homeCode = fs.readFileSync(homePath, 'utf8');

const currentDocSectionRegex = /<section id="doctor-profile" className="clinic-doctor-profile" aria-labelledby="doctor-profile-title">[\s\S]*?<\/figure>\s*<\/section>/;

const previousDocSection = `<section id="doctor-profile" className="clinic-doctor-profile" aria-labelledby="doctor-profile-title">
        <div className="clinic-doctor-info">
          <span className="clinic-doctor-kicker">الإشراف الطبي المباشر · مركز المستقبل</span>
          <h2 id="doctor-profile-title">د. رنا ياسر الشورى</h2>
          <p className="clinic-doctor-specialty">
            أخصائية التغذية العلاجية والسمنة وتنسيق القوام · عضو الجمعية المصرية لدراسة السمنة <bdi>(EMASO)</bdi>
          </p>
          <p className="clinic-doctor-lead">
            نؤمن في مركز المستقبل بأن العلاج الغذائي الناجح يبدأ من فهم كيمياء جسمكِ وتوازن هرموناتكِ، وبناء خطة علمية تناسب نمط حياتكِ دون حرمان لتحقيق نتائج دائمة.
          </p>
          <ul className="clinic-doctor-credentials">
            <li>
              <Award size={18} aria-hidden="true" />
              <span>ماجستير ودبلومة التغذية الإكلينيكية</span>
            </li>
            <li>
              <Activity size={18} aria-hidden="true" />
              <span>عضو الجمعية المصرية لدراسة السمنة (EMASO)</span>
            </li>
            <li>
              <Compass size={18} aria-hidden="true" />
              <span>متابعة دقيقة لتكوين الجسم بقياسات InBody</span>
            </li>
            <li>
              <HeartHandshake size={18} aria-hidden="true" />
              <span>إشراف طبي شخصي ومستمر في كل جلسة</span>
            </li>
          </ul>
          <div className="clinic-doctor-actions">
            <Link to="/booking" className="clinic-doctor-book">
              <span>احجزي استشارتكِ مع د. رنا</span>
              <ArrowLeft size={16} aria-hidden="true" />
            </Link>
          </div>
        </div>

        <figure className="clinic-doctor-figure">
          <div className="clinic-doctor-frame">
            <img
              src="/assets/dr-rana.jpg"
              alt="د. رنا ياسر الشورى - أخصائية التغذية العلاجية بمركز المستقبل"
              width="1200"
              height="1500"
              loading="lazy"
            />
          </div>
          <figcaption className="clinic-doctor-caption">
            <div>
              <strong>د. رنا الشورى</strong>
              <span>استشارة إكلينيكية متخصصة</span>
            </div>
          </figcaption>
        </figure>
      </section>`;

homeCode = homeCode.replace(currentDocSectionRegex, previousDocSection);
fs.writeFileSync(homePath, homeCode, 'utf8');
console.log('Restored previous doctor section in Home.tsx');

// 2. Restore clinic-intro.css doctor styles
const cssPath = 'client/src/styles/site/clinic-intro.css';
let css = fs.readFileSync(cssPath, 'utf8');

const currentDocCssRegex = /\/\* ─────────────────────────────────────────────────────────────\s*Doctor Showcase: Master Clinical Authority[\s\S]*?\.clinic-doctor-reassurance\s*\{[\s\S]*?\}\s*@media\s*\(max-width:\s*960px\)\s*\{[\s\S]*?\.clinic-doctor-reassurance\s*\{[\s\S]*?\}\s*\}/;

// Also match the whole doctor section and media query
const fullOldDocCssPattern = /\/\* ─────────────────────────────────────────────────────────────\s*Doctor Showcase: Master Clinical Authority[\s\S]*?\.clinic-doctor-reassurance\s*\{[\s\S]*?\}\s*\/\* Master Doctor Portrait Visual \*\/[\s\S]*?\.live-dot\s*\{[\s\S]*?\}\s*@media\s*\(max-width:\s*960px\)\s*\{[\s\S]*?\.clinic-doctor-reassurance\s*\{[\s\S]*?\}\s*\}/;

const previousDocCss = `/* ─────────────────────────────────────────────────────────────
   Doctor Showcase: Luxury Clinical Authority
   ───────────────────────────────────────────────────────────── */
.clinic-doctor-profile {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(0, 0.8fr);
  gap: clamp(36px, 5vw, 68px);
  align-items: center;
  max-width: 1296px;
  margin: clamp(48px, 6vw, 84px) auto;
  padding: clamp(36px, 4.5vw, 64px);
  background: #FFFFFF;
  border: 1px solid rgba(6, 63, 50, 0.09);
  border-radius: 28px;
  box-shadow: 0 6px 30px -6px rgba(6, 63, 50, 0.06);
  color: var(--clinic-evergreen);
  position: relative;
  overflow: hidden;
  scroll-margin-block-start: 100px;
}

.clinic-doctor-profile::before {
  content: '';
  position: absolute;
  top: -120px;
  left: -120px;
  width: 320px;
  height: 320px;
  background: radial-gradient(circle, rgba(201, 223, 131, 0.22) 0%, transparent 70%);
  pointer-events: none;
}

.clinic-doctor-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 14px;
  position: relative;
  z-index: 2;
}

.clinic-doctor-kicker {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 750;
  color: var(--clinic-sage);
  background: rgba(113, 131, 74, 0.1);
  padding: 6px 14px;
  border-radius: 9999px;
  letter-spacing: 0.3px;
}

.clinic-doctor-profile h2 {
  font-size: clamp(30px, 3.6vw, 44px);
  font-weight: 800;
  color: var(--clinic-evergreen);
  line-height: 1.25;
  margin: 0;
}

.clinic-doctor-specialty {
  font-size: clamp(15.5px, 1.4vw, 17.5px);
  font-weight: 700;
  color: var(--clinic-sage);
  line-height: 1.5;
  margin: 0;
}

.clinic-doctor-lead {
  font-size: 15px;
  color: var(--clinic-lead);
  line-height: 1.8;
  max-width: 52ch;
  margin: 4px 0 10px;
}

.clinic-doctor-credentials {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px 16px;
  width: 100%;
  margin: 8px 0 18px;
  padding: 0;
  list-style: none;
}

.clinic-doctor-credentials li {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #F8F6F0;
  border: 1px solid rgba(6, 63, 50, 0.06);
  border-radius: 12px;
  padding: 12px 16px;
  font-size: 13.5px;
  font-weight: 700;
  color: var(--clinic-evergreen);
}

.clinic-doctor-credentials li svg {
  color: var(--clinic-sage);
  flex-shrink: 0;
}

.clinic-doctor-actions {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-top: 6px;
}

.clinic-doctor-book {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 13px 30px;
  border-radius: 9999px;
  background: var(--clinic-evergreen);
  color: #FFFFFF;
  font-size: 14.5px;
  font-weight: 750;
  text-decoration: none;
  box-shadow: 0 4px 18px rgba(6, 63, 50, 0.16);
  transition: transform 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease;
}

.clinic-doctor-book:hover {
  background: #0a4f3f;
  transform: translateY(-2px);
  box-shadow: 0 6px 22px rgba(6, 63, 50, 0.22);
}

.clinic-doctor-book svg {
  color: var(--clinic-moss);
}

/* Doctor Portrait Frame */
.clinic-doctor-figure {
  position: relative;
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
}

.clinic-doctor-frame {
  border-radius: 24px;
  overflow: hidden;
  aspect-ratio: 4 / 5;
  background: #eef2e6;
  box-shadow: 0 20px 48px -12px rgba(6, 63, 50, 0.18), 0 2px 10px rgba(6, 63, 50, 0.04);
  border: 1px solid rgba(6, 63, 50, 0.1);
}

.clinic-doctor-frame img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 18%;
  display: block;
}

.clinic-doctor-caption {
  position: absolute;
  bottom: -16px;
  right: 20px;
  background: var(--clinic-evergreen);
  color: #FFFFFF;
  padding: 10px 18px;
  border-radius: 14px;
  box-shadow: 0 6px 20px rgba(6, 63, 50, 0.25);
  font-size: 13px;
  font-weight: 700;
}

.clinic-doctor-caption strong {
  display: block;
  font-size: 14px;
}

.clinic-doctor-caption span {
  display: block;
  color: var(--clinic-moss);
  font-size: 11.5px;
  margin-top: 2px;
}

@media (max-width: 960px) {
  .clinic-doctor-profile {
    grid-template-columns: minmax(0, 1fr);
    padding: 32px 24px;
    margin: 40px 16px;
  }

  .clinic-doctor-figure {
    order: -1;
  }

  .clinic-doctor-credentials {
    grid-template-columns: minmax(0, 1fr);
  }

  .clinic-doctor-actions {
    width: 100%;
  }

  .clinic-doctor-book {
    width: 100%;
    justify-content: center;
  }
}`;

css = css.replace(fullOldDocCssPattern, previousDocCss);
fs.writeFileSync(cssPath, css, 'utf8');
console.log('Restored previous doctor styles in clinic-intro.css');
