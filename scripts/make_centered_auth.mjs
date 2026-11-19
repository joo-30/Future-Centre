import fs from 'fs';
import path from 'path';

const authPagePath = path.resolve('client/src/features/auth/AuthPage.tsx');
let content = fs.readFileSync(authPagePath, 'utf8');

// Update JSX structure
const oldMainRegex = /<main ref=\{pageRef\} className="access-page">[\s\S]*?<\/main>/;

const newMainJsx = `<main ref={pageRef} className="access-page access-page-centered">
      <div className="auth-ambient-orb auth-ambient-orb-1" aria-hidden="true" />
      <div className="auth-ambient-orb auth-ambient-orb-2" aria-hidden="true" />

      <div className="access-centered-container">
        <header className="access-top-centered">
          <Brand />
          <div className="access-top-actions">
            <PwaInstallButton variant="auth" />
            <Link className="access-back-pill" to="/" title="العودة للصفحة الرئيسية">
              <span>العودة للرئيسية</span>
              <ArrowLeft size={16} />
            </Link>
          </div>
        </header>

        <div className="auth-card-elevated">
          <div className="access-form">
            {code ? (
              <div className="recovery-flow">
                <span className="access-symbol">
                  <KeyRound size={26} />
                </span>
                <span className="auth-badge-chip">KEEP IT SAFE · مفتاح الأمان</span>
                <h1>مفتاح رجوعكِ لحسابكِ</h1>
                <p>
                  احفظي رمز الاستعادة في مكان خاص. يمكنكِ استخدامه مرة واحدة فقط إذا نسيتِ كلمة المرور.
                </p>
                <div className="recovery-code">
                  <code>{code}</code>
                  <button
                    type="button"
                    className="icon-button"
                    title="نسخ الرمز"
                    onClick={() => {
                      navigator.clipboard.writeText(code);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                  >
                    {copied ? <Check size={18} /> : <Copy size={18} />}
                  </button>
                </div>
                <label className="checkbox-confirm">
                  <input
                    type="checkbox"
                    checked={saved}
                    onChange={(e) => setSaved(e.target.checked)}
                  />
                  <span>حفظتُ الرمز وسأحتفظ به في مكان آمن</span>
                </label>
                <Button
                  kind="full"
                  disabled={!saved}
                  onClick={() =>
                    navigate(destination(auth.user?.role || 'patient'), { replace: true })
                  }
                >
                  المتابعة إلى حسابي
                </Button>
              </div>
            ) : (
              <>
                <div className="auth-header">
                  <span className="auth-badge-chip">
                    <ShieldCheck size={14} />
                    <span>بوابة مركز المستقبل · وصول آمن ومشفّر</span>
                  </span>
                  <h1>
                    {registering ? 'انضمي لمركز المستقبل' : recovering ? 'استعادة حسابكِ' : 'أهلًا بعودتكِ'}
                  </h1>
                  <p>
                    {registering
                      ? 'أنشئي حسابكِ لمتابعة خطتكِ الغذائية وجلساتكِ وقياسات الـ InBody.'
                      : recovering
                        ? 'اكتبي رقم هاتفكِ المسجل لنرسل لكِ كود الاستعادة.'
                        : 'سجّلي دخولكِ للوصول إلى خطتكِ الغذائية، مواعيدكِ، ونتائج قياساتكِ.'}
                  </p>
                </div>

                {mode === 'login' && availableRoles.length > 0 && (
                  <div className="quick-login-panel">
                    <div className="quick-login-header">
                      <CheckCircle2 size={14} />
                      <span>دخول سريع · بيئة التطوير المحلية</span>
                    </div>
                    <div className="quick-login-grid">
                      {availableRoles.map((role) => (
                        <button
                          key={role}
                          type="button"
                          className={\`quick-login-btn role-\${role}\`}
                          disabled={busy}
                          onClick={() => void quickLogin(role)}
                        >
                          <div className="quick-btn-info">
                            <span className="quick-role-badge">
                              {role === 'admin' ? 'إدارة المركز' : 'حساب المريض'}
                            </span>
                            <span className="quick-role-email">
                              {role === 'admin' ? 'Admin Portal' : 'Patient Account'}
                            </span>
                          </div>
                          <ArrowLeft size={15} className="quick-btn-arrow" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {error && <p className="auth-alert-box">{error}</p>}

                <form className="auth-fields-stack" onSubmit={submit}>
                  {registering && (
                    <div className="field-group">
                      <label htmlFor="reg-name">الاسم بالكامل</label>
                      <div className="input-wrap">
                        <User size={18} className="input-icon" />
                        <input
                          id="reg-name"
                          name="name"
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="مثال: ياسمين محمد"
                          autoComplete="name"
                        />
                      </div>
                    </div>
                  )}

                  <div className="field-group">
                    <label htmlFor="auth-phone">رقم الهاتف المسجل</label>
                    <div className="input-wrap">
                      <Phone size={18} className="input-icon" />
                      <input
                        id="auth-phone"
                        name="phone"
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="01012345678"
                        autoComplete="tel"
                        dir="ltr"
                        className="text-left"
                      />
                    </div>
                  </div>

                  {!recovering && (
                    <div className="field-group">
                      <label htmlFor="auth-password">كلمة المرور</label>
                      <PasswordField
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete={registering ? 'new-password' : 'current-password'}
                      />
                    </div>
                  )}

                  {recovering && (
                    <div className="field-group">
                      <label htmlFor="auth-rec-code">رمز الاستعادة المؤقت</label>
                      <div className="input-wrap">
                        <Lock size={18} className="input-icon" />
                        <input
                          id="auth-rec-code"
                          name="recoveryCode"
                          type="text"
                          required
                          value={recoveryCode}
                          onChange={(e) => setRecoveryCode(e.target.value)}
                          placeholder="اكتبي الرمز"
                          autoComplete="one-time-code"
                        />
                      </div>
                    </div>
                  )}

                  <div className="auth-options-row">
                    {!registering && !recovering && (
                      <label className="checkbox-custom">
                        <input type="checkbox" name="remember" defaultChecked />
                        <span>تذكّر تسجيلي على هذا الجهاز</span>
                      </label>
                    )}
                    {mode === 'login' && (
                      <Link to="/recover" className="forgot-password-link">
                        نسيتِ كلمة المرور؟
                      </Link>
                    )}
                  </div>

                  <Button type="submit" kind="full" disabled={busy} className="auth-submit-btn">
                    <span>
                      {busy
                        ? 'جارٍ التحقق...'
                        : registering
                          ? 'إنشاء حسابي'
                          : recovering
                            ? 'استعادة الحساب'
                            : 'تسجيل الدخول إلى حسابي'}
                    </span>
                    <ArrowLeft size={18} />
                  </Button>
                </form>

                <div className="auth-switch-mode">
                  {registering ? (
                    <p>
                      لديكِ حساب بالفعل؟{' '}
                      <Link to="/login" className="switch-link">
                        تسجيل الدخول
                      </Link>
                    </p>
                  ) : (
                    <p>
                      ليس لديكِ حساب حتى الآن؟{' '}
                      <Link to="/register" className="switch-link">
                        إنشاء حساب جديد
                      </Link>
                    </p>
                  )}
                </div>

                {recovering && catalog && (
                  <p className="field-hint recover-help">
                    فقدتِ الرمز؟{' '}
                    <a
                      href={whatsappUrl(catalog.clinic.whatsapp, 'أحتاج مساعدة في استعادة حسابي في مركز المستقبل.')}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      تواصلي مع الدكتورة والمركز عبر واتساب للتحقق
                    </a>
                  </p>
                )}

                <div className="access-divider">
                  <span>أو يمكنكِ المتابعة مباشرة دون حساب</span>
                </div>

                <ButtonLink to="/booking" kind="outline full" className="guest-booking-btn">
                  <CalendarCheck size={17} />
                  <span>احجزي كشفكِ دون حساب</span>
                </ButtonLink>

                <div className="access-security-note">
                  <ShieldCheck size={15} />
                  <span>بياناتكِ مشفرة ومحمية بخصوصية طبية تامة. لن نطلب كلمة مروركِ عبر أي وسيلة.</span>
                </div>
              </>
            )}
          </div>
        </div>

        <footer className="access-centered-footer">
          <p>© {new Date().getFullYear()} مركز المستقبل للتغذية العلاجية ونحت القوام · إشراف د. رنا الشورى (EMASO)</p>
        </footer>
      </div>
    </main>`;

if (oldMainRegex.test(content)) {
  content = content.replace(oldMainRegex, newMainJsx);
  console.log('Replaced main with centered access portal in AuthPage.tsx');
} else {
  console.error('Could not match oldMainRegex!');
}

fs.writeFileSync(authPagePath, content, 'utf8');
console.log('AuthPage.tsx updated successfully!');
