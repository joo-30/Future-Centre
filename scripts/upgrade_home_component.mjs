import fs from 'fs';

const filePath = 'Future-Centre/client/src/features/home/Home.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Normalize line endings
content = content.replace(/\r\n/g, '\n');

// 1. Replace Hero Scene
const oldScene = `          <div className="hero-scene">
            <img
              src="/assets/hero-sculpture.png"
              alt="تكوين نحتي مستوحى من هوية مركز المستقبل"
              width="1536"
              height="1024"
              fetchPriority="high"
            />
            <div className="scene-caption">كل خطة تبدأ بالإنسان.</div>
            <div className="scene-detail">
              <Leaf />
              <div>
                <strong>على مقاس يومك.</strong>
                <small>تغذية واقعية · عادات تستمر</small>
              </div>
            </div>
          </div>`;

const newShowcase = `          <div className="hero-doctor-showcase" aria-label="بطاقة إشراف د. رنا ياسر الشورة">
            <div className="hds-glow-layer" />
            <div className="hds-card">
              <img
                src="/assets/dr-rana.jpg"
                alt="د. رنا ياسر الشورة - استشاري التغذية العلاجية ونحت القوام"
                className="hds-photo"
                width="1200"
                height="1500"
                fetchPriority="high"
              />
              <div className="hds-overlay" />

              <div className="hds-details">
                <div className="hds-name-row">
                  <h2 className="hds-name">د. رنا ياسر الشورة</h2>
                  <span className="hds-verified">
                    <ShieldCheck size={13} />
                    <span>معتمدة</span>
                  </span>
                </div>
                <p className="hds-title">استشاري التغذية العلاجية ونحت القوام</p>
                <p className="hds-association">عضو الجمعية المصرية لدراسة السمنة (EMASO)</p>
              </div>
            </div>

            {/* Floating Live Metric Pill 1: Cases */}
            <div className="hds-floating-stat stat-cases">
              <div className="hds-stat-icon">
                <Activity size={16} />
              </div>
              <div className="hds-stat-info">
                <div className="hds-stat-row">
                  <span className="hds-stat-num">+5,000</span>
                  <span className="hds-pulse-dot" />
                </div>
                <span className="hds-stat-label">حالة ومتابعة ناجحة</span>
              </div>
            </div>

            {/* Floating Live Metric Pill 2: InBody & Precision */}
            <div className="hds-floating-stat stat-inbody">
              <div className="hds-stat-icon icon-inbody">
                <Award size={16} />
              </div>
              <div className="hds-stat-info">
                <span className="hds-stat-num">InBody 770</span>
                <span className="hds-stat-label">فحص سريري دقيق</span>
              </div>
            </div>
          </div>`;

if (content.includes(oldScene)) {
  content = content.replace(oldScene, newShowcase);
  console.log('Replaced hero-scene with hero-doctor-showcase');
} else {
  console.log('oldScene target not matched directly');
}

// 2. Normalize surname to الشورة across Home.tsx
content = content.replaceAll('د. رنا الشوري', 'د. رنا الشورة');
content = content.replaceAll('د. رنا ياسر الشوري', 'د. رنا ياسر الشورة');

fs.writeFileSync(filePath, content.replace(/\n/g, '\r\n'), 'utf8');
console.log('Successfully updated Home.tsx');
