import { useQuery, useQueryClient } from '@tanstack/react-query';
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
  const [quickError, setQuickError] = useState('');
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
    setQuickError('');
  }, [mode]);
  const registering = mode === 'register';
  const recovering = mode === 'recover';
  const quick = useQuery({
    queryKey: ['local-quick-login'],
    queryFn: authApi.quickRoles,
    enabled: mode === 'login',
    retry: false,
    staleTime: 60000,
  });

  const isLocalHost =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      Boolean(import.meta.env.DEV));

  const availableRoles = quick.data?.roles?.length
    ? quick.data.roles
    : isLocalHost
      ? (['admin', 'patient'] as const)
      : [];

  async function quickLogin(role: 'admin' | 'patient') {
    setBusy(true);
    setQuickError('');
    try {
      const result = await authApi.quickLogin(role);
      await replaceSession(client, result.user, ['local-quick-login']);
      await auth.refresh();
      navigate(destination(role), { replace: true });
    } catch (e) {
      setQuickError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

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
              <>
                <header className="auth-header">
                  <h1 id="access-title">
                    {registering
                      ? 'إنشاء حساب جديد'
                      : recovering
                        ? 'استعادة حسابكِ'
                        : 'تسجيل الدخول'}
                  </h1>
                  <p>
                    {registering
                      ? 'أنشئي حسابكِ لمتابعة خطتكِ ومواعيدكِ.'
                      : recovering
                        ? 'أدخلي رقم هاتفكِ ورمز الاستعادة لتعيين كلمة مرور جديدة.'
                        : 'تابعي خطتكِ ومواعيدكِ من حسابكِ.'}
                  </p>
                </header>

                <form onSubmit={submit} className="auth-actual-form">
                  <fieldset disabled={busy}>
                    {registering && (
                      <label className="field">
                        <span className="field-label-text">الاسم بالكامل</span>
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
                      <span className="field-label-text">رقم الهاتف المسجّل</span>
                      <div className="input-with-icon">
                        <Phone size={18} className="input-field-icon" />
                        <input
                          name="phone"
                          type="tel"
                          dir="ltr"
                          autoComplete={registering ? 'tel' : 'username'}
                          autoCorrect="off"
                          autoCapitalize="none"
                          spellCheck={false}
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder=""
                          maxLength={24}
                        />
                      </div>
                    </label>

                    {recovering && (
                      <label className="field">
                        <span className="field-label-text">رمز الاستعادة الشخصي</span>
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
                        placeholder=""
                        label={recovering ? 'كلمة المرور الجديدة' : 'كلمة المرور'}
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
                          <span>تذكّرني</span>
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
                          ? 'جاري التحقق والمتابعة...'
                          : registering
                            ? 'إنشاء الحساب والبدء'
                            : recovering
                              ? 'تحديث كلمة المرور'
                              : 'تسجيل الدخول'}
                      </span>
                    </button>
                  </fieldset>
                </form>

                <div className="access-switch-wrap">
                  {(registering || recovering) && <span>لديكِ حساب بالفعل؟</span>}
                  <Link
                    to={registering || recovering ? '/login' : '/register'}
                    className="switch-link"
                  >
                    {registering || recovering ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}
                  </Link>
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

                <Link to="/booking" className="guest-booking-btn">
                  احجزي كشفكِ دون حساب
                </Link>
              </>
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

      <div className="access-utilities">
        {mode === 'login' && availableRoles.length > 0 && (
          <details className="access-dev-tools">
            <summary>دخول سريع · بيئة التطوير المحلية</summary>
            <div className="quick-login-panel">
              <div className="quick-login-grid">
                {availableRoles.map((role) => (
                  <button
                    key={role}
                    type="button"
                    className={`quick-login-btn role-${role}`}
                    disabled={busy}
                    onClick={() => void quickLogin(role)}
                  >
                    <div className="quick-btn-info">
                      <span className="quick-role-badge">
                        {role === 'admin' ? 'إدارة المركز' : 'حساب المريض'}
                      </span>
                      <bdi dir="ltr">{role === 'admin' ? 'Admin Portal' : 'Patient Account'}</bdi>
                    </div>
                    <ArrowLeft size={16} className="quick-arrow" />
                  </button>
                ))}
              </div>
              {quickError && (
                <p className="access-dev-error" role="alert">
                  {quickError}
                </p>
              )}
            </div>
          </details>
        )}
      </div>
    </main>
  );
}
