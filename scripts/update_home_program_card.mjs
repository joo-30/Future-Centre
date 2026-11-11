import fs from 'node:fs';

// 1. Update Home.tsx
const homePath = 'Future-Centre/client/src/features/home/Home.tsx';
let homeCode = fs.readFileSync(homePath, 'utf8');

// Add ChevronDown to imports
if (!homeCode.includes('ChevronDown')) {
  homeCode = homeCode.replace(
    "import {\n  Activity,",
    "import {\n  Activity,\n  ChevronDown,"
  );
}

// Add state
if (!homeCode.includes('showMonthlyDetails')) {
  homeCode = homeCode.replace(
    "const [interest, setInterest] = useState<Service | null>(null);",
    "const [interest, setInterest] = useState<Service | null>(null);\n  const [showMonthlyDetails, setShowMonthlyDetails] = useState(false);"
  );
}

// Remove demoPrices pill
homeCode = homeCode.replace(
  `          {data.clinic.demoPrices && (
            <span className="pill small">أسعار توضيحية لحين الاعتماد</span>
          )}`,
  ''
);

// Replace the pfp-includes section with the expandable version
const targetOldIncludes = `{/* What is included checklist */}
              <div className="pfp-includes">
                <span className="pfp-includes-title">ما يشمله البرنامج شهرياً:</span>
                <div className="pfp-includes-grid">
                  <div className="pfp-inc-item">
                    <Check size={16} className="pfp-check" />
                    <span>{monthly.sessions} جلسات كشف واستشارة دورية خاصة مع د. رنا</span>
                  </div>
                  <div className="pfp-inc-item">
                    <Check size={16} className="pfp-check" />
                    <span>فحص InBody متقدم لتحليل كتلة الدهون والعضلات ومعدل الحرق</span>
                  </div>
                  <div className="pfp-inc-item">
                    <Check size={16} className="pfp-check" />
                    <span>خطة تغذية علاجية مخصصة لأكلات بيتكِ تتجدد أسبوعياً</span>
                  </div>
                  <div className="pfp-inc-item">
                    <Check size={16} className="pfp-check" />
                    <span>متابعة ودعم مستمر عبر واتساب للإجابة عن استفساراتكِ</span>
                  </div>
                </div>
              </div>`;

const newIncludes = `{/* Simplified Preview Highlights & Expandable Details */}
              <div className="pfp-preview-highlights">
                <span className="pfp-highlight-pill">
                  <Check size={14} />
                  <span>{monthly.sessions} جلسات دورية مع د. رنا</span>
                </span>
                <span className="pfp-highlight-pill">
                  <Check size={14} />
                  <span>فحص InBody سريري متقدم</span>
                </span>
                <span className="pfp-highlight-pill">
                  <Check size={14} />
                  <span>خطة أسبوعية لأكلات بيتكِ</span>
                </span>
                <span className="pfp-highlight-pill">
                  <Check size={14} />
                  <span>متابعة ودعم مستمر عبر واتساب</span>
                </span>
              </div>

              <div className="pfp-toggle-wrap">
                <button
                  type="button"
                  className="pfp-toggle-details-btn"
                  onClick={() => setShowMonthlyDetails((prev) => !prev)}
                  aria-expanded={showMonthlyDetails}
                >
                  <span>{showMonthlyDetails ? 'إخفاء التفاصيل الموسعة' : 'عرض ما يشمله البرنامج بالتفصيل'}</span>
                  <ChevronDown size={16} className={\`pfp-toggle-arrow \${showMonthlyDetails ? 'is-open' : ''}\`} />
                </button>
              </div>

              {showMonthlyDetails && (
                <div className="pfp-includes pfp-includes-expandable">
                  <span className="pfp-includes-title">تفاصيل ما يشمله البرنامج شهرياً:</span>
                  <div className="pfp-includes-grid">
                    <div className="pfp-inc-item">
                      <Check size={16} className="pfp-check" />
                      <span>{monthly.sessions} جلسات كشف واستشارة دورية خاصة مع د. رنا</span>
                    </div>
                    <div className="pfp-inc-item">
                      <Check size={16} className="pfp-check" />
                      <span>فحص InBody متقدم لتحليل كتلة الدهون والعضلات ومعدل الحرق</span>
                    </div>
                    <div className="pfp-inc-item">
                      <Check size={16} className="pfp-check" />
                      <span>خطة تغذية علاجية مخصصة لأكلات بيتكِ تتجدد أسبوعياً</span>
                    </div>
                    <div className="pfp-inc-item">
                      <Check size={16} className="pfp-check" />
                      <span>متابعة ودعم مستمر عبر واتساب للإجابة عن استفساراتكِ</span>
                    </div>
                  </div>
                </div>
              )}`;

// Normalize CRLF to LF for comparison then write back
const normalizedHomeCode = homeCode.replace(/\r\n/g, '\n');
const normalizedTarget = targetOldIncludes.replace(/\r\n/g, '\n');

if (normalizedHomeCode.includes(normalizedTarget)) {
  const updated = normalizedHomeCode.replace(normalizedTarget, newIncludes);
  fs.writeFileSync(homePath, updated, 'utf8');
  console.log('Home.tsx updated with expandable program details!');
} else {
  console.log('Target not found in Home.tsx, checking substrings...');
  // Fallback direct regex
  const regex = /\{\/\* What is included checklist \*\/\}[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/;
  if (regex.test(normalizedHomeCode)) {
    const updated = normalizedHomeCode.replace(regex, newIncludes);
    fs.writeFileSync(homePath, updated, 'utf8');
    console.log('Home.tsx updated via regex!');
  } else {
    console.error('Failed to match pfp-includes in Home.tsx');
  }
}

// 2. Add styles to home.css
const cssPath = 'Future-Centre/client/src/styles/reference/home.css';
let cssCode = fs.readFileSync(cssPath, 'utf8');

const newStyles = `
/* PFP Preview Highlights & Interactive Toggle */
.pfp-preview-highlights {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 14px;
}

.pfp-highlight-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(7, 63, 51, 0.12);
  color: #1a4d2e;
  font-size: 13px;
  font-weight: 700;
  padding: 5px 12px;
  border-radius: 999px;
  box-shadow: 0 2px 6px rgba(7, 63, 51, 0.03);
}

.pfp-highlight-pill svg {
  color: #10b981;
}

.pfp-toggle-wrap {
  margin-bottom: 16px;
}

.pfp-toggle-details-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  border: none;
  color: #073f33;
  font-size: 13.5px;
  font-weight: 700;
  cursor: pointer;
  padding: 4px 0;
  transition: all 0.2s ease;
  text-decoration: underline;
  text-underline-offset: 4px;
}

.pfp-toggle-details-btn:hover {
  color: #166534;
}

.pfp-toggle-arrow {
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.pfp-toggle-arrow.is-open {
  transform: rotate(180deg);
}

.pfp-includes-expandable {
  animation: pfpSlideDown 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes pfpSlideDown {
  from {
    opacity: 0;
    transform: translateY(-6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
`;

if (!cssCode.includes('pfp-preview-highlights')) {
  cssCode += newStyles;
  fs.writeFileSync(cssPath, cssCode, 'utf8');
  console.log('home.css updated with interactive styles!');
}
