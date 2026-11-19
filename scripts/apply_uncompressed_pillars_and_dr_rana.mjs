import fs from 'fs';

// 1. Update Home.tsx
const homePath = 'client/src/features/home/Home.tsx';
let homeCode = fs.readFileSync(homePath, 'utf8');

// Ensure Sparkles is imported
if (!homeCode.includes('Sparkles,')) {
  homeCode = homeCode.replace('MapPin,', 'MapPin,\n  Sparkles,');
}

// Replace clinic-intro-index in Home.tsx
const oldIndex = `<div className="clinic-intro-index" aria-label="ركائز الرعاية بالمركز">
            <div className="clinic-index-item">
              <span className="clinic-index-num">01</span>
              <strong className="clinic-index-title">تحليل InBody</strong>
              <span className="clinic-index-desc">تتبع دقيق لكتلة الدهون والعضلات وتوزيع السوائل</span>
            </div>
            <div className="clinic-index-item">
              <span className="clinic-index-num">02</span>
              <strong className="clinic-index-title">أنظمة غذائية مخصصة</strong>
              <span className="clinic-index-desc">خطط علمية مرنة تلائم وتيرة يومكِ دون حرمان</span>
            </div>
            <div className="clinic-index-item">
              <span className="clinic-index-num">03</span>
              <strong className="clinic-index-title">نحت وتنسيق القوام</strong>
              <span className="clinic-index-desc">أحدث تقنيات تفتيت الدهون الموضعية غير الجراحية</span>
            </div>
            <div className="clinic-index-item">
              <span className="clinic-index-num">04</span>
              <strong className="clinic-index-title">متابعة إكلينيكية مباشرة</strong>
              <span className="clinic-index-desc">إشراف مستمر من د. رنا في كل جلسة لتقييم النتائج</span>
            </div>
          </div>`;

const newIndex = `<div className="clinic-intro-index" aria-label="ركائز الرعاية بالمركز">
            <div className="clinic-index-item">
              <div className="clinic-index-top">
                <span className="clinic-index-num">01</span>
                <span className="clinic-index-icon"><Activity size={17} aria-hidden="true" /></span>
              </div>
              <strong className="clinic-index-title">تحليل InBody الشامل</strong>
              <p className="clinic-index-desc">تتبع سريري دقيق لكتلة الدهون، العضلات، ومعدل الحرق وتوزيع السوائل لتحديد البداية الصحيحة علمياً.</p>
            </div>
            <div className="clinic-index-item">
              <div className="clinic-index-top">
                <span className="clinic-index-num">02</span>
                <span className="clinic-index-icon"><Leaf size={17} aria-hidden="true" /></span>
              </div>
              <strong className="clinic-index-title">أنظمة غذائية مخصصة</strong>
              <p className="clinic-index-desc">خطط علمية مرنة مصممة خصيصاً لتلائم وتيرة يومكِ، أكلاتكِ المفضلة، وظروف عملكِ لتحقيق نتائج دائمة دون حرمان.</p>
            </div>
            <div className="clinic-index-item">
              <div className="clinic-index-top">
                <span className="clinic-index-num">03</span>
                <span className="clinic-index-icon"><Sparkles size={17} aria-hidden="true" /></span>
              </div>
              <strong className="clinic-index-title">نحت وتنسيق القوام</strong>
              <p className="clinic-index-desc">أحدث تقنيات تفتيت الدهون الموضعية وشد الترهلات غير الجراحية للوصول لأفضل تناسق قوام ممكن بأمان تام.</p>
            </div>
            <div className="clinic-index-item">
              <div className="clinic-index-top">
                <span className="clinic-index-num">04</span>
                <span className="clinic-index-icon"><HeartHandshake size={17} aria-hidden="true" /></span>
              </div>
              <strong className="clinic-index-title">متابعة إكلينيكية مباشرة</strong>
              <p className="clinic-index-desc">إشراف طبي مباشر ومستمر من د. رنا في كل جلسة لمراجعة التطورات وتعديل الخطة وفق استجابة جسمكِ الحيوية.</p>
            </div>
          </div>`;

homeCode = homeCode.replace(oldIndex, newIndex);

// Replace doctor section in Home.tsx
const oldDocSection = `<section id="doctor-profile" className="clinic-doctor-profile" aria-labelledby="doctor-profile-title">
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

const newDocSection = `<section id="doctor-profile" className="clinic-doctor-profile" aria-labelledby="doctor-profile-title">
        <div className="clinic-doctor-info">
          <span className="clinic-doctor-kicker">
            <Award size={14} aria-hidden="true" /> الإشراف الطبي والخبرة الإكلينيكية · مركز المستقبل
          </span>
          <h2 id="doctor-profile-title">د. رنا ياسر الشورى</h2>
          <p className="clinic-doctor-specialty">
            أخصائية التغذية العلاجية وعلاج السمنة وتنسيق القوام · عضو الجمعية المصرية لدراسة السمنة <bdi>(EMASO)</bdi>
          </p>

          <div className="clinic-doctor-quote-box">
            <p>
              <span className="quote-mark" aria-hidden="true">“</span>
              العلاج الغذائي الناجح لا يعتمد على الحرمان أو الجداول القاسية، بل على فهم كيمياء جسمكِ وتوازن هرموناتكِ، وبناء خطة علمية تناسب إيقاع حياتكِ اليومي لتحقيق نتائج تدوم مدى الحياة.
            </p>
          </div>

          <div className="clinic-doctor-credentials-grid">
            <div className="clinic-cred-card">
              <div className="clinic-cred-icon">
                <Award size={18} aria-hidden="true" />
              </div>
              <div className="clinic-cred-body">
                <strong>ماجستير ودبلومة التغذية الإكلينيكية</strong>
                <span>تخصص علمي معتمد في إدارة السمنة وصحة الأيض</span>
              </div>
            </div>

            <div className="clinic-cred-card">
              <div className="clinic-cred-icon">
                <Activity size={18} aria-hidden="true" />
              </div>
              <div className="clinic-cred-body">
                <strong>عضو الجمعية المصرية لدراسة السمنة</strong>
                <span>تطبيق أحدث البروتوكولات الإكلينيكية (EMASO)</span>
              </div>
            </div>

            <div className="clinic-cred-card">
              <div className="clinic-cred-icon">
                <Compass size={18} aria-hidden="true" />
              </div>
              <div className="clinic-cred-body">
                <strong>فحص تكوين الجسم المتقدم InBody</strong>
                <span>تتبع أسبوعي دقيق لكتلة الدهون وتطور العضلات</span>
              </div>
            </div>

            <div className="clinic-cred-card">
              <div className="clinic-cred-icon">
                <HeartHandshake size={18} aria-hidden="true" />
              </div>
              <div className="clinic-cred-body">
                <strong>إشراف طبي ومتابعة فردية مباشرة</strong>
                <span>تقييم شخصي وتعديل دوري مستمر في كل زيارة</span>
              </div>
            </div>
          </div>

          <div className="clinic-doctor-actions">
            <Link to="/booking" className="clinic-doctor-book">
              <span>احجزي استشارتكِ مع د. رنا</span>
              <ArrowLeft size={16} aria-hidden="true" />
            </Link>
            <span className="clinic-doctor-reassurance">المواعيد بالحضور الشخصي في عيادة كفر الزيات</span>
          </div>
        </div>

        <figure className="clinic-doctor-figure">
          <div className="clinic-doctor-top-pill">
            <span className="star" aria-hidden="true">★</span>
            <span>خبرة إكلينيكية معتمدة · كفر الزيات</span>
          </div>

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
              <span>
                <span className="live-dot" aria-hidden="true" />
                استشارات حضورية ومتابعة دورية
              </span>
            </div>
          </figcaption>
        </figure>
      </section>`;

homeCode = homeCode.replace(oldDocSection, newDocSection);
fs.writeFileSync(homePath, homeCode, 'utf8');
console.log('Successfully updated Home.tsx with spacious pillars & doctor showcase');

// 2. Update clinic-intro.css
const introCssPath = 'client/src/styles/site/clinic-intro.css';
let introCss = fs.readFileSync(introCssPath, 'utf8');

// Replace .clinic-intro-index & .clinic-index-item styles
const oldIndexCssPattern = /\/\* Signature Clinical Index Ribbon[\s\S]*?\.clinic-index-desc\s*\{[\s\S]*?margin-top:\s*2px;\s*\}/;
const newIndexCss = `/* Spacious, Breathable Clinical Methodology Pillars (Zero Cramp, Full Luxury) */
.clinic-intro-index {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: clamp(16px, 2vw, 24px);
  padding-block-start: clamp(32px, 4vw, 44px);
  border-block-start: 1px solid var(--clinic-rule);
}

.clinic-index-item {
  background: #FFFFFF;
  border: 1px solid rgba(6, 63, 50, 0.08);
  border-radius: 20px;
  padding: clamp(24px, 2.2vw, 28px) clamp(20px, 2vw, 24px);
  box-shadow: 0 4px 18px -4px rgba(6, 63, 50, 0.04);
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
}

.clinic-index-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 28px -6px rgba(6, 63, 50, 0.1);
  border-color: rgba(6, 63, 50, 0.2);
}

.clinic-index-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-block-end: 14px;
}

.clinic-index-num {
  font-size: 13px;
  font-weight: 800;
  color: var(--clinic-evergreen);
  background: rgba(113, 131, 74, 0.14);
  padding: 4px 10px;
  border-radius: 8px;
  letter-spacing: 0.5px;
}

.clinic-index-icon {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: #F4F7EC;
  color: var(--clinic-sage);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.clinic-index-title {
  font-size: 17.5px;
  font-weight: 850;
  color: var(--clinic-evergreen);
  line-height: 1.35;
  margin-block-end: 8px;
  display: block;
}

.clinic-index-desc {
  font-size: 13.5px;
  color: var(--clinic-lead);
  line-height: 1.7;
  margin: 0;
  display: block;
}`;

introCss = introCss.replace(oldIndexCssPattern, newIndexCss);

// Replace Doctor Profile CSS with top-tier master showcase
const oldDocPattern = /\/\* ─────────────────────────────────────────────────────────────\s*Doctor Showcase: Luxury Clinical Authority[\s\S]*?\.clinic-doctor-caption span\s*\{[\s\S]*?margin-top:\s*2px;\s*\}/;
const newDocCss = `/* ─────────────────────────────────────────────────────────────
   Doctor Showcase: Master Clinical Authority (Swiss / Harley St. Aesthetic)
   ───────────────────────────────────────────────────────────── */
.clinic-doctor-profile {
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) minmax(0, 0.85fr);
  gap: clamp(40px, 5vw, 72px);
  align-items: center;
  max-width: 1296px;
  margin: clamp(48px, 6vw, 88px) auto;
  padding: clamp(38px, 4.8vw, 68px);
  background: #FFFFFF;
  border: 1px solid rgba(6, 63, 50, 0.1);
  border-radius: 32px;
  box-shadow: 
    0 24px 60px -15px rgba(6, 63, 50, 0.08),
    0 4px 20px rgba(6, 63, 50, 0.03);
  color: var(--clinic-evergreen);
  position: relative;
  overflow: hidden;
  scroll-margin-block-start: 100px;
}

.clinic-doctor-profile::before {
  content: '';
  position: absolute;
  top: -150px;
  left: -150px;
  width: 420px;
  height: 420px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(201, 223, 131, 0.25) 0%, transparent 70%);
  pointer-events: none;
}

.clinic-doctor-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
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
  padding: 6px 16px;
  border-radius: 9999px;
  margin-block-end: 14px;
}

.clinic-doctor-kicker svg {
  color: var(--clinic-sage);
}

.clinic-doctor-profile h2 {
  font-size: clamp(32px, 3.8vw, 46px);
  font-weight: 900;
  color: var(--clinic-evergreen);
  line-height: 1.2;
  margin: 0 0 8px 0;
  letter-spacing: -0.5px;
}

.clinic-doctor-specialty {
  font-size: clamp(15.5px, 1.3vw, 18px);
  font-weight: 750;
  color: var(--clinic-sage);
  line-height: 1.5;
  margin: 0 0 20px 0;
}

.clinic-doctor-quote-box {
  background: #F8F6EF;
  border-right: 4px solid var(--clinic-sage);
  border-radius: 14px;
  padding: 16px 20px;
  margin-block-end: 24px;
  width: 100%;
}

.clinic-doctor-quote-box p {
  font-size: 14.5px;
  font-weight: 500;
  color: var(--clinic-evergreen);
  line-height: 1.8;
  margin: 0;
  font-style: italic;
}

.quote-mark {
  font-size: 26px;
  font-weight: 900;
  color: var(--clinic-sage);
  line-height: 1;
  display: inline-block;
  margin-inline-end: 6px;
}

.clinic-doctor-credentials-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px 16px;
  width: 100%;
  margin-block-end: 26px;
}

.clinic-cred-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #FAFAF8;
  border: 1px solid rgba(6, 63, 50, 0.07);
  border-radius: 14px;
  padding: 14px 16px;
  transition: transform 0.2s ease, background-color 0.2s ease, border-color 0.2s ease;
}

.clinic-cred-card:hover {
  background: #F4F7EC;
  border-color: rgba(6, 63, 50, 0.18);
  transform: translateY(-2px);
}

.clinic-cred-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(113, 131, 74, 0.14);
  color: var(--clinic-evergreen);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.clinic-cred-body strong {
  display: block;
  font-size: 13.5px;
  font-weight: 800;
  color: var(--clinic-evergreen);
  line-height: 1.35;
}

.clinic-cred-body span {
  display: block;
  font-size: 11.5px;
  color: var(--clinic-lead);
  margin-block-start: 2px;
}

.clinic-doctor-actions {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.clinic-doctor-book {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 14px 34px;
  border-radius: 9999px;
  background: var(--clinic-evergreen);
  color: #FFFFFF;
  font-size: 15px;
  font-weight: 750;
  text-decoration: none;
  box-shadow: 0 4px 18px rgba(6, 63, 50, 0.16);
  transition: transform 0.22s ease, background-color 0.22s ease, box-shadow 0.22s ease;
}

.clinic-doctor-book:hover {
  background: #094d3e;
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(6, 63, 50, 0.22);
}

.clinic-doctor-book svg {
  color: var(--clinic-moss);
}

.clinic-doctor-reassurance {
  font-size: 13px;
  color: var(--clinic-muted);
  font-weight: 500;
}

/* Master Doctor Portrait Visual */
.clinic-doctor-figure {
  position: relative;
  width: 100%;
  max-width: 420px;
  margin: 0 auto;
}

.clinic-doctor-top-pill {
  position: absolute;
  top: 18px;
  right: -14px;
  background: #FFFFFF;
  border: 1px solid rgba(6, 63, 50, 0.1);
  border-radius: 9999px;
  padding: 8px 16px;
  box-shadow: 0 8px 24px rgba(6, 63, 50, 0.14);
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12.5px;
  font-weight: 800;
  color: var(--clinic-evergreen);
  z-index: 3;
}

.clinic-doctor-top-pill .star {
  color: #eab308;
}

.clinic-doctor-frame {
  border-radius: 32px;
  overflow: hidden;
  aspect-ratio: 4 / 5.1;
  background: #EBF0E4;
  box-shadow: 
    0 24px 54px -14px rgba(6, 63, 50, 0.22),
    0 4px 18px rgba(6, 63, 50, 0.06);
  border: 2px solid rgba(201, 223, 131, 0.4);
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
  bottom: -18px;
  left: 20px;
  background: var(--clinic-evergreen);
  color: #FFFFFF;
  border-radius: 16px;
  padding: 12px 20px;
  box-shadow: 0 8px 26px rgba(6, 63, 50, 0.28);
  display: flex;
  flex-direction: column;
  gap: 2px;
  z-index: 3;
  border: 1px solid rgba(201, 223, 131, 0.3);
}

.clinic-doctor-caption strong {
  display: block;
  font-size: 13.5px;
  font-weight: 800;
}

.clinic-doctor-caption span {
  font-size: 11.5px;
  color: var(--clinic-moss);
  display: flex;
  align-items: center;
  gap: 6px;
}

.live-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #22c55e;
  display: inline-block;
}`;

introCss = introCss.replace(oldDocPattern, newDocCss);

fs.writeFileSync(introCssPath, introCss, 'utf8');
console.log('Successfully updated clinic-intro.css with master doctor showcase & spacious pillars');
