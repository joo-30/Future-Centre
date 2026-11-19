import fs from 'fs';

const filePath = 'client/src/features/home/Home.tsx';
let code = fs.readFileSync(filePath, 'utf8');

const target = '<p className="clinic-card-desc">{service.description}</p>';
const addition = `<p className="clinic-card-desc">{service.description}</p>
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
                    </ul>`;

code = code.replace(target, addition);
fs.writeFileSync(filePath, code, 'utf8');
console.log('Features list inserted successfully:', code.includes('clinic-card-features-list'));
