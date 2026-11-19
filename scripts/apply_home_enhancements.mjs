import fs from 'fs';

const filePath = 'client/src/features/home/Home.tsx';
let code = fs.readFileSync(filePath, 'utf8');

// 1. Add serviceFeaturesMap above Home component or inside it
const mapCode = `
const serviceFeaturesMap: Record<string, string[]> = {
  'monthly-program': [
    'فحص InBody أسبوعي شامل لمتابعة تكوين الجسم',
    'نظام غذائي مرن ومفصل يلائم نمط يومكِ وعملكِ',
    'إشراف ومتابعة مباشرة من د. رنا طوال الشهر',
  ],
  'consultation': [
    'تقييم إكلينيكي كامل وتاريخ صحي مفصل',
    'قراءة تحليلية دقيقة لمعدلات الحرق والدهون',
    'تحديد الخطة العلاجية والهدف الواقعي خطوة بخطوة',
  ],
  'women-health': [
    'برامج مخصصة لتكيسات المبايض وتوازن الهرمونات',
    'تغذية علاجية آمنة لمراحل الحمل والرضاعة',
    'استعادة النشاط والحيوية بدون أدوية قاسية',
  ],
};
`;

if (!code.includes('serviceFeaturesMap')) {
  code = code.replace('export function Home() {', `${mapCode}\nexport function Home() {`);
}

// 2. Add trust badge to clinic-intro-visual
const oldVisual = `<div className="clinic-intro-visual">
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

const newVisual = `<div className="clinic-intro-visual">
              <div className="clinic-intro-frame">
                <img
                  src="/assets/consultation.png"
                  alt="جلسة استشارة طبية متخصصة مع د. رنا ياسر الشورى في مركز المستقبل"
                  width="1200"
                  height="975"
                  fetchPriority="high"
                />
              </div>
              <div className="clinic-intro-trust-badge">
                <span className="clinic-intro-dot" aria-hidden="true" />
                <span>استشارات إكلينيكية مباشرة مع د. رنا</span>
              </div>
            </div>`;

code = code.replace(oldVisual, newVisual);

// 3. Add features list to clinic-card-body
const oldCardBody = `<div className="clinic-card-body">
                    <span className="clinic-card-pill">
                      <Clock size={12} aria-hidden="true" />
                      {service.period} · {service.duration} دقيقة للجلسة
                    </span>
                    <h3 className="clinic-card-title">{service.title}</h3>
                    <p className="clinic-card-desc">{service.description}</p>
                  </div>`;

const newCardBody = `<div className="clinic-card-body">
                    <span className="clinic-card-pill">
                      <Clock size={12} aria-hidden="true" />
                      {service.period} · {service.duration} دقيقة للجلسة
                    </span>
                    <h3 className="clinic-card-title">{service.title}</h3>
                    <p className="clinic-card-desc">{service.description}</p>
                    <ul className="clinic-card-features-list">
                      {(serviceFeaturesMap[service.slug] || [
                        'فحص دقيق لتكوين الجسم وتوزيع الدهون',
                        'خطة علاجية مخصصة بإشراف طبي متكامل',
                        'متابعة دورية مباشرة لضمان استدامة النتائج',
                      ]).map((feat, idx) => (
                        <li key={idx}>
                          <Check size={14} className="clinic-card-check" aria-hidden="true" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>`;

code = code.replace(oldCardBody, newCardBody);

fs.writeFileSync(filePath, code, 'utf8');
console.log('Successfully updated Home.tsx');
