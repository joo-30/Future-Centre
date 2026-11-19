import fs from 'fs';

const homePath = 'client/src/features/home/Home.tsx';
let homeCode = fs.readFileSync(homePath, 'utf8');

const oldIndexRegex = /<div className="clinic-intro-index" aria-label="ركائز الرعاية بالمركز">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/section>/;

const newIndexAndClosing = `<div className="clinic-intro-index" aria-label="ركائز الرعاية بالمركز">
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
          </div>
        </div>
      </section>`;

homeCode = homeCode.replace(oldIndexRegex, newIndexAndClosing);
fs.writeFileSync(homePath, homeCode, 'utf8');
console.log('Regex replace complete. Has Sparkles in body:', homeCode.includes('<Sparkles size={17}'));
