import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Activity,
  ArrowLeft,
  Award,
  CalendarCheck,
  Check,
  CheckCircle2,
  Copy,
  KeyRound,
  Lock,
  Phone,
  ShieldCheck,
  Star,
  User,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../components/Auth';
import { PasswordField } from '../../components/forms/PasswordField';
import { Brand, Button, ButtonLink } from '../../components/ui';
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
  const quick = useQuery({
    queryKey: ['local-quick-login'],
    queryFn: authApi.quickRoles,
    enabled: import.meta.env.DEV && mode === 'login',
    retry: false,
    staleTime: 60000,
  });

  async function quickLogin(role: 'admin' | 'patient') {
    setBusy(true);
    setError('');
    try {
      const result = await authApi.quickLogin(role);
      await replaceSession(client, result.user, ['local-quick-login']);
      await auth.refresh();
      navigate(role === 'admin' ? '/admin' : '/account', { replace: true });
    } catch (e) {
      setError((e as Error).message);
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
      <section className="access-form-area">
        <header className="access-top">
          <Brand />
          <div className="access-top-actions">
            <PwaInstallButton variant="auth" />
            <Link className="access-back-pill" to="/" title="العودة للصفحة الرئيسية">
              <span>العودة للرئيسية</span>
              <ArrowLeft size={16} />
            </Link>
          </div>
        </header>

        {/* Dedicated Mobile & Tablet Doctor Hero Card */}
        <div className="mobile-doctor-hero" aria-label="بيانات الطبيبة والعيادة">
          <div className="mob-hero-top">
            <div className="mob-doctor-photo-wrap">
              <img
                src="/assets/dr-rana.jpg"
                alt="د. رنا ياسر الشورى - استشاري التغذية العلاجية"
                className="mob-doctor-photo"
              />
              <span className="mob-online-badge" title="العيادة متاحة للمتابعة" />
            </div>
            <div className="mob-doctor-info">
              <div className="mob-doctor-name-row">
                <h3>د. رنا ياسر الشورى</h3>
                <span className="mob-verified-badge">
                  <Check size={11} />
                  <span>معتمدة</span>
                </span>
              </div>
              <p className="mob-doctor-specialty">استشاري التغذية العلاجية ونحت القوام · EMASO</p>
              <div className="mob-rating-pill">
                <div className="stars-mini">
                  <Star size={11} className="star-filled" />
                  <Star size={11} className="star-filled" />
                  <Star size={11} className="star-filled" />
                  <Star size={11} className="star-filled" />
                  <Star size={11} className="star-filled" />
                </div>
                <strong>4.9</strong>
                <span>(+5,000 حالة ناجحة)</span>
              </div>
            </div>
          </div>

          <div className="mob-hero-perks">
            <div className="mob-perk-item">
              <CheckCircle2 size={12} className="mob-perk-icon" />
              <span>خطط مخصصة 100%</span>
            </div>
            <div className="mob-perk-item">
              <Activity size={12} className="mob-perk-icon" />
              <span>متابعة InBody</span>
            </div>
            <div className="mob-perk-item">
              <ShieldCheck size={12} className="mob-perk-icon" />
              <span>خصوصية طبية</span>
            </div>
          </div>
        </div>

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
                <div className="auth-header">
                  <span className="auth-badge-chip">
                    <ShieldCheck size={14} />
                    <span>بوابة مركز المستقبل · وصول آمن</span>
                  </span>
                  <h1>
                    {registering
                      ? 'إنشاء حساب جديد'
                      : recovering
                        ? 'استعادة حسابكِ'
                        : 'أهلًا بعودتكِ'}
                  </h1>
                  <p>
                    {registering
                      ? 'انضمي لمركز المستقبل وابدئي رحلتكِ الصحية بإشراف طبي متكامل.'
                      : recovering
                        ? 'أدخلي رقم هاتفكِ ورمز الاستعادة الشخصي لتعيين كلمة مرور جديدة.'
                        : 'سجّلي دخولكِ للوصول إلى خطتكِ الغذائية، مواعيدكِ، ونتائج قياساتكِ.'}
                  </p>
                </div>

                {mode === 'login' && quick.data?.roles.length && (
                  <div className="quick-login-panel">
                    <div className="quick-login-header">
                      <CheckCircle2 size={14} />
                      <span>دخول سريع · بيئة التطوير المحلية</span>
                    </div>
                    <div className="quick-login-grid">
                      {quick.data.roles.map((role) => (
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
                  </div>
                )}

                <form onSubmit={submit} className="auth-actual-form" autoComplete="off">
                  {/* Invisible deflectors to prevent Chrome/Edge aggressive credential autofill */}
                  <input
                    type="text"
                    name="_trap_user"
                    tabIndex={-1}
                    aria-hidden="true"
                    autoComplete="off"
                    style={{ position: 'absolute', opacity: 0, height: 0, width: 0, pointerEvents: 'none', zIndex: -1 }}
                  />
                  <input
                    type="password"
                    name="_trap_pwd"
                    tabIndex={-1}
                    aria-hidden="true"
                    autoComplete="new-password"
                    style={{ position: 'absolute', opacity: 0, height: 0, width: 0, pointerEvents: 'none', zIndex: -1 }}
                  />

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
                      <span className="field-label-text">رقم الهاتف المسجل</span>
                      <div className="input-with-icon">
                        <Phone size={18} className="input-field-icon" />
                        <input
                          name="phone"
                          type="tel"
                          dir="ltr"
                          autoComplete="off"
                          autoCorrect="off"
                          autoCapitalize="none"
                          spellCheck={false}
                          data-lpignore="true"
                          data-1p-ignore="true"
                          data-form-type="other"
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
                            placeholder="أدخلي الرمز المكون من أرقام وحروف"
                            maxLength={100}
                          />
                        </div>
                      </label>
                    )}

                    <div className="field-password-wrap">
                      <PasswordField
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="new-password"
                        current={!registering && !recovering}
                        showStrengthMeter={true}
                        placeholder=""
                        label={recovering ? 'كلمة المرور الجديدة' : 'كلمة المرور'}
                      />
                    </div>

                    {registering ? (
                      <label className="consent">
                        <input name="consent" type="checkbox" required />
                        <span>
                          أوافق على <Link to="/privacy">سياسة الخصوصية</Link> واستخدام بياناتي لخدمة حسابي الطبي.
                        </span>
                      </label>
                    ) : !recovering ? (
                      <div className="access-options">
                        <label className="consent">
                          <input name="remember" type="checkbox" />
                          <span>تذكّر تسجيل الدخول على هذا الجهاز</span>
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
                              : 'تسجيل الدخول إلى حسابي'}
                      </span>
                      <ArrowLeft size={18} className="btn-arrow" />
                    </button>
                  </fieldset>
                </form>

                <div className="access-switch-wrap">
                  <span>{registering || recovering ? 'لديكِ حساب بالفعل؟' : 'ليس لديكِ حساب حتى الآن؟'}</span>{' '}
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
      </section>

      {/* Luxury Showcase Aside - 100% Unobstructed Doctor Portrait */}
      <aside className="access-visual">
        <div className="showcase-bg-wrap">
          <img
            src="/assets/dr-rana.jpg"
            alt="د. رنا ياسر الشورى - استشاري التغذية العلاجية ونحت القوام"
            className="showcase-img"
          />
          <div className="showcase-gradient-overlay" />
          <div className="ambient-orb ambient-orb-1" />
          <div className="ambient-orb ambient-orb-2" />
        </div>

        {/* Content strictly in the lower area - zero overlap on the doctor's face */}
        <div className="showcase-bottom-area">
          <div className="showcase-doctor-pill">
            <Award size={16} className="pill-award-icon" />
            <strong>د. رنا ياسر الشورى</strong>
            <span className="pill-dot">·</span>
            <span className="pill-spec">استشاري التغذية العلاجية (EMASO)</span>
            <span className="pill-dot">·</span>
            <span className="pill-rating">4.9 (+5K حالة موثقة)</span>
          </div>

          <h2 className="showcase-headline">
            رعاية طبية تليق بكِ.. تبدأ بفهمكِ وتستمر معكِ.
          </h2>
          <p className="showcase-subtext">
            نظام متكامل يتابع تفاصيل جسمكِ أسبوعياً، مع خطط غذائية علمية تناسب يومكِ بدون حرمان أو إرهاق.
          </p>

          <div className="showcase-stats-bar">
            <div className="stat-item">
              <span className="stat-number">+5,000</span>
              <span className="stat-label">حالة وصلت لهدفها</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <span className="stat-number">100%</span>
              <span className="stat-label">خطط علمية مخصصة</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <span className="stat-number">24/7</span>
              <span className="stat-label">ملفكِ الطبي متاح</span>
            </div>
          </div>
        </div>
      </aside>
    </main>
  );
}
