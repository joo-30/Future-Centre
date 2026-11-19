import fs from 'fs';
import path from 'path';

const authPagePath = path.resolve('client/src/features/auth/AuthPage.tsx');
let code = fs.readFileSync(authPagePath, 'utf8');

const formRegex = /<form className="auth-fields-stack" onSubmit=\{submit\}>[\s\S]*?<\/form>/;

const newFormJsx = `<form className="auth-actual-form" onSubmit={submit}>
                  {registering && (
                    <div className="field">
                      <label htmlFor="reg-name" className="field-label-text">الاسم بالكامل</label>
                      <div className="input-with-icon">
                        <User size={18} className="input-field-icon" />
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

                  <div className="field">
                    <label htmlFor="auth-phone" className="field-label-text">رقم الهاتف المسجل</label>
                    <div className="input-with-icon">
                      <Phone size={18} className="input-field-icon" />
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
                    <PasswordField
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete={registering ? 'new-password' : 'current-password'}
                    />
                  )}

                  {recovering && (
                    <div className="field">
                      <label htmlFor="auth-rec-code" className="field-label-text">رمز الاستعادة المؤقت</label>
                      <div className="input-with-icon">
                        <Lock size={18} className="input-field-icon" />
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

                  <div className="access-options">
                    {!registering && !recovering && (
                      <label className="consent">
                        <input type="checkbox" name="remember" defaultChecked />
                        <span>تذكّر تسجيلي على هذا الجهاز</span>
                      </label>
                    )}
                    {mode === 'login' && (
                      <Link to="/recover" className="forgot-link">
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
                </form>`;

if (formRegex.test(code)) {
  code = code.replace(formRegex, newFormJsx);
  fs.writeFileSync(authPagePath, code, 'utf8');
  console.log('Successfully updated form classes in AuthPage.tsx');
} else {
  console.error('formRegex did not match!');
}
