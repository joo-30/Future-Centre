import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Check, ChevronLeft, Copy, KeyRound, Lock, Phone, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../components/Auth';
import { PasswordField } from '../../components/forms/PasswordField';
import { Brand, Button } from '../../components/ui';
import { useCatalog } from '../../hooks/useCatalog';
import { whatsappUrl } from '../../lib/api';
import { authApi } from '../../lib/portal-api';
import { replaceSession } from '../../lib/session-cache';
import { PwaInstallButton } from '../../components/pwa/PwaInstallButton';

export function AuthPage({ mode = 'login' }: { mode?: 'login' | 'register' | 'recover' }) {
  const auth = useAuth();
  const client = useQueryClient();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { data: catalog } = useCatalog();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [code, setCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  // Controlled credentials for strict data isolation and clean reset on logout/navigation
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');

  // Clear credentials whenever switching modes or mounting the page
  useEffect(() => {
    setPhone('');
    setPassword('');
    setName('');
    setRecoveryCode('');
    setError('');
  }, [mode]);
  const registering = mode === 'register';
  const recovering = mode === 'recover';

  const next = params.get('next');
  const destination = (role: string) =>
    next && next.startsWith('/') && !next.startsWith('//')
      ? next
      : role === 'admin'
        ? '/admin'
        : '/account';

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setBusy(true);
    const f = new FormData(e.currentTarget);
    try {
      const body = {
        phone: (phone || String(f.get('phone') || '')).trim(),
        password: password || String(f.get('password') || ''),
      };
      const result = registering
        ? await authApi.register({
            ...body,
            name: (name || String(f.get('name') || '')).trim(),
            consent: f.get('consent') === 'on',
          })
        : recovering
          ? await authApi.recover({
              ...body,
              recoveryCode: (recoveryCode || String(f.get('recoveryCode') || '')).trim(),
            })
          : await authApi.login({ ...body, remember: f.get('remember') === 'on' });
      await replaceSession(client, result.user);
      await auth.refresh();
      // Wipe internal credential states immediately
      setPhone('');
      setPassword('');
      if ('recoveryCode' in result) {
        setCode(String(result.recoveryCode));
      } else navigate(destination(result.user.role), { replace: true });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="access-page">
      <header className="access-top">
        <Brand />
        <Link className="access-back-link" to="/">
          العودة للرئيسية <ChevronLeft size={19} aria-hidden="true" />
        </Link>
        <PwaInstallButton className="access-install-button" variant="auth" />
      </header>

      <div className="access-shell">
        <section className="access-form-area" aria-labelledby="access-title">
          <div className="access-form">
            {code ? (
              <div className="recovery-flow">
                <span className="access-symbol">
                  <KeyRound size={26} />
                </span>
                <h1 id="access-title">مفتاح رجوعكِ لحسابكِ</h1>
                <p>
                  احفظي رمز الاستعادة في مكان خاص. يمكنكِ استخدامه مرة واحدة فقط إذا نسيتِ كلمة
                  المرور.
                </p>
                <div className="recovery-code">
                  <bdi dir="ltr">{code}</bdi>
                  <button
                    type="button"
                    className="icon-button"
                    aria-label="نسخ رمز الاستعادة"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(code);
                        setCopied(true);
                      } catch {
                        setError('يمكنك تحديد الرمز ونسخه يدويًا.');
                      }
                    }}
                  >
                    {copied ? <Check size={18} /> : <Copy size={18} />}
                  </button>
                </div>
                <label className="consent">
                  <input
                    type="checkbox"
                    checked={saved}
                    onChange={(e) => setSaved(e.target.checked)}
                  />
                  <span>حفظتُ رمز الاستعادة في مكان آمن ولن أشاركه مع أحد.</span>
                </label>
                <Button
                  kind="full"
                  disabled={!saved}
                  onClick={() =>
                    navigate(destination(auth.user?.role || 'patient'), { replace: true })
                  }
                >
                  الانتقال إلى حسابي
                </Button>
              </div>
            ) : (
              <div className="auth-card-inner">
                <header className="auth-header">
                  <h1 id="access-title" className="auth-title">
                    {registering
                      ? 'إنشاء حساب جديد'
                      : recovering
                        ? 'استعادة الحساب'
                        : 'تسجيل الدخول'}
                  </h1>
                  <p className="auth-subtitle">
                    {registering
                      ? 'أنشئي حسابكِ لمتابعة خطتكِ الغذائية ومواعيدكِ المعتمدة.'
                      : recovering
                        ? 'أدخلي رقم هاتفكِ ورمز الاستعادة لتعيين كلمة مرور جديدة.'
                        : 'تابعي خطتكِ ومواعيدكِ من حسابكِ بالمركز.'}
                  </p>
                </header>

                <form onSubmit={submit} className="auth-actual-form">
                  <fieldset disabled={busy}>
                    {registering && (
                      <label className="field">
                        <div className="field-label-row">
                          <span className="field-label-text">الاسم بالكامل</span>
                          <span className="field-label-tag">كما في السجل الطبي</span>
                        </div>
                        <div className="input-with-icon">
                          <User size={18} className="input-field-icon" />
                          <input
                            name="name"
                            autoComplete="off"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            minLength={3}
                            maxLength={100}
                            placeholder="مثال: سارة محمد"
                          />
                        </div>
                      </label>
                    )}

                    <label className="field">
                      <div className="field-label-row">
                        <span className="field-label-text">رقم الهاتف</span>
                        <span className="field-label-tag">المسجّل بالعيادة</span>
                      </div>
                      <div className="input-with-icon">
                        <Phone size={18} className="input-field-icon" />
                        <input
                          name="phone"
                          type="tel"
                          autoComplete={registering ? 'tel' : 'username'}
                          autoCorrect="off"
                          autoCapitalize="none"
                          spellCheck={false}
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="01xxxxxxxxx"
                          maxLength={24}
                        />
                      </div>
                    </label>

                    {recovering && (
                      <label className="field">
                        <div className="field-label-row">
                          <span className="field-label-text">رمز الاستعادة الشخصي</span>
                          <span className="field-label-tag">رمز الأمان</span>
                        </div>
                        <div className="input-with-icon">
                          <KeyRound size={18} className="input-field-icon" />
                          <input
                            name="recoveryCode"
                            dir="ltr"
                            required
                            autoComplete="off"
                            value={recoveryCode}
                            onChange={(e) => setRecoveryCode(e.target.value)}
                            placeholder="أدخلي رمز الاستعادة"
                            maxLength={100}
                          />
                        </div>
                      </label>
                    )}

                    <div className="field-password-wrap">
                      <PasswordField
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete={
                          registering || recovering ? 'new-password' : 'current-password'
                        }
                        current={!registering && !recovering}
                        placeholder="••••••••"
                        label={recovering ? 'كلمة المرور الجديدة' : 'كلمة المرور'}
                        labelTag={registering ? '8 أحرف على الأقل' : 'حسابكِ المحمي'}
                      />
                    </div>

                    {registering ? (
                      <label className="consent">
                        <input name="consent" type="checkbox" required />
                        <span>
                          أوافق على <Link to="/privacy">سياسة الخصوصية</Link> واستخدام بياناتي لخدمة
                          حسابي الطبي.
                        </span>
                      </label>
                    ) : !recovering ? (
                      <div className="access-options">
                        <label className="consent">
                          <input name="remember" type="checkbox" />
                          <span>تذكّر تسجيل الدخول</span>
                        </label>
                        <Link className="forgot-link" to="/recover">
                          نسيتِ كلمة المرور؟
                        </Link>
                      </div>
                    ) : null}

                    {error && (
                      <div className="form-error-alert" role="alert">
                        <Lock size={16} />
                        <span>{error}</span>
                      </div>
                    )}

                    <button type="submit" className="auth-submit-btn" disabled={busy}>
                      <span>
                        {busy
                          ? 'جاري التحقق...'
                          : registering
                            ? 'إنشاء حساب جديد'
                            : recovering
                              ? 'تحديث كلمة المرور'
                              : 'تسجيل الدخول'}
                      </span>
                      <ArrowLeft size={17} aria-hidden="true" />
                    </button>
                  </fieldset>
                </form>

                <div className="auth-switch-section">
                  {!registering && !recovering ? (
                    <>
                      <div className="auth-divider">
                        <span>أو</span>
                      </div>

                      <Link to="/booking" className="guest-booking-btn">
                        <span>احجزي كشفكِ دون حساب</span>
                        <ArrowLeft size={16} aria-hidden="true" />
                      </Link>

                      <div className="auth-footer-prompt">
                        <span>ليس لديكِ حساب بالمركز؟</span>
                        <Link to="/register" className="auth-switch-link">
                          إنشاء حساب جديد
                        </Link>
                      </div>
                    </>
                  ) : (
                    <div className="auth-footer-prompt">
                      <span>{registering ? 'لديكِ حساب بالفعل؟' : 'تذكرتِ كلمة المرور؟'}</span>
                      <Link to="/login" className="auth-switch-link">
                        تسجيل الدخول الآن
                      </Link>
                    </div>
                  )}
                </div>

                {recovering && catalog && (
                  <p className="field-hint recover-help">
                    فقدتِ الرمز؟{' '}
                    <a
                      href={whatsappUrl(
                        catalog.clinic.whatsapp,
                        'أحتاج مساعدة في استعادة حسابي في مركز المستقبل.',
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      تواصلي مع الدكتورة والمركز عبر واتساب للتحقق
                    </a>
                  </p>
                )}
              </div>
            )}
          </div>
        </section>

        <figure className="access-visual">
          <div className="access-portrait-arch" aria-hidden="true" />
          <img
            className="access-portrait"
            src="/assets/doctor-profile-portrait.webp"
            alt=""
            width="1122"
            height="1402"
            loading="lazy"
            decoding="async"
          />
          <img
            className="access-sculpture"
            src="/assets/hero-brand-sculpture-cutout.webp"
            alt=""
            width="1402"
            height="1122"
            loading="lazy"
            decoding="async"
          />
          <figcaption>د. رنا ياسر الشورى</figcaption>
        </figure>
      </div>
    </main>
  );
}
