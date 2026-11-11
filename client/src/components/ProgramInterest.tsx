import { phoneSchema, type Service } from '@future/shared';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import {
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Layers,
  Loader2,
  Phone,
  Send,
  ShieldCheck,
  Award,
  User,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useCatalog } from '../hooks/useCatalog';
import { api, formatPrice, whatsappUrl } from '../lib/api';
import { useAuth } from './Auth';
import { WhatsAppIcon } from './icons/WhatsAppIcon';
import { Modal } from './ui';

const schema = z.object({
  name: z.string().trim().min(3, 'اكتبي اسمك بالكامل (ثلاثي أو ثنائي).'),
  phone: phoneSchema,
  consent: z.boolean().refine(Boolean, 'يرجى الموافقة على التواصل لتأكيد حجز البرنامج.'),
});

export function ProgramInterest({
  program,
  onClose,
}: {
  program: Service | null;
  onClose: () => void;
}) {
  const { data } = useCatalog();
  const { user } = useAuth();
  const client = useQueryClient();
  const [result, setResult] = useState<{ reference: string; message: string } | null>(null);
  const [error, setError] = useState('');
  const [copiedRef, setCopiedRef] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<z.input<typeof schema>, unknown, z.output<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', phone: '', consent: true },
  });

  const nameVal = watch('name');
  const phoneVal = watch('phone');
  const consentVal = watch('consent');

  useEffect(() => {
    if (user && program) {
      if (user.name) setValue('name', user.name);
      if (user.phone) setValue('phone', user.phone);
    }
  }, [user?.id, program?.id, setValue]);

  const close = () => {
    onClose();
    setResult(null);
    setError('');
    setCopiedRef(false);
    reset();
  };

  const handleCopyRef = async (refCode: string) => {
    try {
      await navigator.clipboard.writeText(refCode);
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2500);
    } catch {
      // fallback
    }
  };

  const clinicPhone = data?.clinic.whatsapp || data?.clinic.phones?.[0] || '';

  return (
    <Modal
      open={!!program}
      onClose={close}
      title={result ? 'تم إرسال طلبكِ بنجاح' : program?.title ? `طلب ${program.title}` : 'طلب برنامج'}
    >
      <div className="interest-modal-wrap">
        {result ? (
          /* ==========================================================================
             Success State — Deluxe Booking Confirmation
             ========================================================================== */
          <div className="interest-success-pro">
            <div className="interest-success-icon-wrap">
              <CheckCircle2 size={42} strokeWidth={2.2} />
            </div>

            <div className="interest-success-headings">
              <h3 className="interest-success-title">وصلنا طلبكِ بنجاح!</h3>
              <p className="interest-success-desc">
                سعداء بانضمامكِ لمركز المستقبل للتغذية العلاجية د. رنا الشوري. تم تسجيل بياناتكِ وسنتواصل معكِ لتحديد موعد البدء.
              </p>
            </div>

            <div className="interest-ref-box">
              <span className="interest-ref-label">رقم المرجع لتتبع الطلب:</span>
              <span className="interest-ref-code">{result.reference}</span>
              <button
                type="button"
                className="interest-copy-btn"
                onClick={() => void handleCopyRef(result.reference)}
                title="نسخ رقم المرجع"
              >
                {copiedRef ? (
                  <>
                    <Check size={13} color="#059669" />
                    <span>تم النسخ ✓</span>
                  </>
                ) : (
                  <>
                    <Copy size={13} />
                    <span>نسخ</span>
                  </>
                )}
              </button>
            </div>

            {clinicPhone && (
              <a
                href={whatsappUrl(
                  clinicPhone,
                  `أهلاً د. رنا، قمت بتقديم طلب برنامج "${program?.title || 'التغذية'}" برقم مرجع ${result.reference}. أود تأكيد تفاصيل الموعد والبدء.`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="interest-whatsapp-cta"
              >
                <WhatsAppIcon size={18} />
                <span>متابعة فورية وتأكيد الموعد عبر واتساب</span>
              </a>
            )}

            <div className="interest-steps-card">
              <strong className="interest-steps-title">ماذا يحدث الآن؟</strong>
              <div className="interest-step-row">
                <span className="interest-step-num">1</span>
                <span>ستقوم الدكتورة أو منسقة المركز بالاطلاع على طلبكِ وحجز الموعد الأنسب لجدولكِ.</span>
              </div>
              <div className="interest-step-row">
                <span className="interest-step-num">2</span>
                <span>لا توجد أي رسوم إلكترونية مطلوبة الآن، الدفع يكون مباشرة بالعيادة عند الحضور.</span>
              </div>
            </div>
          </div>
        ) : (
          /* ==========================================================================
             Interactive Booking Form with Program Showcase
             ========================================================================== */
          <form
            className="interest-form"
            onSubmit={handleSubmit(async (v) => {
              setError('');
              try {
                const res = await api.interest({ ...v, programId: program!.id });
                setResult(res);
                void client.invalidateQueries({ queryKey: ['account'] });
              } catch (e) {
                setError((e as Error).message || 'تعذر إرسال الطلب، يرجى المحاولة لاحقاً.');
              }
            })}
            noValidate
          >
            {/* 1. Program Showcase Hero Card */}
            {program && (
              <div className="interest-hero-card">
                <div className="interest-hero-top">
                  <div className="interest-hero-title-wrap">
                    <span className="interest-hero-badge">
                      <Award size={12} />
                      <span>{program.period || 'برنامج علاجي متكامل'}</span>
                    </span>
                    <h3 className="interest-hero-title">{program.title}</h3>
                  </div>

                  {program.price !== null && program.price !== undefined && (
                    <div className="interest-hero-price-badge">
                      <span className="interest-price-val">{formatPrice(program.price)} ج.م</span>
                      <span className="interest-price-period">قيمة البرنامج</span>
                    </div>
                  )}
                </div>

                <div className="interest-hero-chips">
                  {program.sessions ? (
                    <span className="interest-chip-item">
                      <Layers size={13} />
                      <span>{program.sessions} جلسات متابعة</span>
                    </span>
                  ) : null}
                  {program.duration ? (
                    <span className="interest-chip-item">
                      <Clock size={13} />
                      <span>صلاحية {program.duration} يوماً</span>
                    </span>
                  ) : null}
                  <span className="interest-chip-item">
                    <CheckCircle2 size={13} />
                    <span>متابعة سريرية مباشرة</span>
                  </span>
                </div>

                {program.includes && program.includes.length > 0 && (
                  <ul className="interest-hero-highlights">
                    {program.includes.slice(0, 2).map((inc, idx) => (
                      <li key={idx}>
                        <Check size={14} />
                        <span>{inc}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* 2. Full Name Input */}
            <div className="interest-field-group">
              <div className="interest-label-row">
                <label htmlFor="interest-name-field" className="interest-label-text">
                  الاسم بالكامل
                </label>
                <span className="interest-label-tag is-accent">مطلوب للحجز</span>
              </div>

              <div className="interest-input-wrap">
                <span className="interest-input-icon">
                  <User size={18} />
                </span>
                <input
                  id="interest-name-field"
                  {...register('name')}
                  type="text"
                  autoComplete="name"
                  placeholder="مثال: سارة أحمد محمود"
                  className={`interest-modern-input ${errors.name ? 'has-error' : ''}`}
                  aria-invalid={!!errors.name}
                />
                {nameVal && (
                  <button
                    type="button"
                    className="interest-field-clear"
                    onClick={() => setValue('name', '')}
                    title="مسح الاسم"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>
              {errors.name && <p className="interest-field-error">{errors.name.message}</p>}
            </div>

            {/* 3. Phone & WhatsApp Input */}
            <div className="interest-field-group">
              <div className="interest-label-row">
                <label htmlFor="interest-phone-field" className="interest-label-text">
                  رقم الهاتف والواتساب
                </label>
                <span className="interest-label-tag">للتواصل وتأكيد الموعد</span>
              </div>

              <div className="interest-input-wrap">
                <span className="interest-input-icon">
                  <Phone size={18} />
                </span>
                <input
                  id="interest-phone-field"
                  {...register('phone')}
                  type="tel"
                  dir="ltr"
                  autoComplete="tel"
                  placeholder="010XXXXXXXX"
                  className={`interest-modern-input is-tel ${errors.phone ? 'has-error' : ''}`}
                  aria-invalid={!!errors.phone}
                />
                {phoneVal && (
                  <button
                    type="button"
                    className="interest-field-clear"
                    onClick={() => setValue('phone', '')}
                    title="مسح الرقم"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>
              {errors.phone && <p className="interest-field-error">{errors.phone.message}</p>}
            </div>

            {/* 4. Interactive Consent Box */}
            <div
              className={`interest-consent-box ${consentVal ? 'is-checked' : ''}`}
              onClick={() => setValue('consent', !consentVal, { shouldValidate: true })}
              role="checkbox"
              aria-checked={Boolean(consentVal)}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === ' ' || e.key === 'Enter') {
                  e.preventDefault();
                  setValue('consent', !consentVal, { shouldValidate: true });
                }
              }}
            >
              <div className="interest-checkbox-indicator">
                <Check size={14} strokeWidth={3} />
              </div>
              <div className="interest-consent-content">
                <span className="interest-consent-title">
                  أوافق على التواصل معي عبر واتساب لتأكيد تفاصيل ومواعيد البرنامج
                </span>
                <span className="interest-consent-sub">
                  لن نرسل أي رسائل دعائية أو إعلانات مزعجة إطلاقاً.
                </span>
              </div>
            </div>
            {errors.consent && <p className="interest-field-error">{errors.consent.message}</p>}

            {/* Form Error Notice */}
            {error && (
              <div className="form-error" role="alert" style={{ margin: 0 }}>
                {error}
              </div>
            )}

            {/* 5. Luxury Submit CTA */}
            <button
              type="submit"
              className="interest-submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>جارِ تسجيل طلبكِ بالمركز...</span>
                </>
              ) : (
                <>
                  <Send size={16} />
                  <span>إرسال طلب البرنامج وتأكيد الموعد</span>
                </>
              )}
            </button>

            {/* 6. Trust & Transparency Footnote */}
            <div className="interest-trust-badge">
              <ShieldCheck size={16} />
              <span>بياناتكِ مشفرة وبأمان تام • لا توجد أي خطوة دفع إلكتروني (الدفع بالعيادة)</span>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
}
