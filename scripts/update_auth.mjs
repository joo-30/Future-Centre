import fs from 'fs';

const filePath = 'Future-Centre/client/src/features/auth/AuthPage.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const target = `<div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <PwaInstallButton variant="auth" />
            <Link className="access-back-pill" to="/">
            <span>العودة للرئيسية</span>
            <ArrowLeft size={16} />
          </Link>
          </div>`;

const replacement = `<div className="access-top-actions">
            <PwaInstallButton variant="auth" />
            <Link className="access-back-pill" to="/" title="العودة للصفحة الرئيسية">
              <span>العودة للرئيسية</span>
              <ArrowLeft size={16} />
            </Link>
          </div>`;

const normContent = content.replace(/\r\n/g, '\n');
const normTarget = target.replace(/\r\n/g, '\n');
const normReplacement = replacement.replace(/\r\n/g, '\n');

if (normContent.includes(normTarget)) {
  const updated = normContent.replace(normTarget, normReplacement).replace(/\n/g, '\r\n');
  fs.writeFileSync(filePath, updated, 'utf8');
  console.log('Successfully updated AuthPage.tsx');
} else {
  console.log('Target not found in AuthPage.tsx');
}
