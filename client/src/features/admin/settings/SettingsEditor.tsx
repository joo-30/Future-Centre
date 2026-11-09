import { useQueryClient } from '@tanstack/react-query';
import {
  AlertCircle,
  Building,
  Building2,
  CheckCircle2,
  Coins,
  ExternalLink,
  Eye,
  MapPin,
  MessageCircle,
  Phone,
  PhoneCall,
  Plus,
  Save,
  ShieldCheck,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '../../../components/ui';
import { adminApi, type ClinicSettings } from '../../../lib/portal-api';
import { Notice } from '../components/Notice';
import { refreshAdmin } from '../lib/cache';

export function SettingsEditor({ settings: s }: { settings: ClinicSettings }) {
  const client = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Controlled states for live preview & smart form UX
  const [name, setName] = useState(s.name || '');
  const [subtitle, setSubtitle] = useState(s.subtitle || '');
  const [phones, setPhones] = useState<string[]>(s.phones && s.phones.length > 0 ? s.phones : ['+201041504201']);
  const [newPhone, setNewPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState(s.whatsapp || '');
  const [address, setAddress] = useState(s.address || '');
  const [city, setCity] = useState(s.city || '');
  const [demoPrices, setDemoPrices] = useState(Boolean(s.demoPrices));

  function addPhone() {
    const trimmed = newPhone.trim();
    if (!trimmed) return;
    if (phones.length >= 4) {
      setError('الحد الأقصى هو 4 أرقام هواتف للتواصل.');
      return;
    }
    if (phones.includes(trimmed)) {
      setError('هذا الرقم مضاف بالفعل في القائمة.');
      return;
    }
    setPhones([...phones, trimmed]);
    setNewPhone('');
    setError('');
  }

  function removePhone(index: number) {
    if (phones.length <= 1) {
      setError('يجب الإبقاء على رقم هاتف واحد على الأقل للتواصل مع المراجعين.');
      return;
    }
    setPhones(phones.filter((_, i) => i !== index));
    setError('');
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (phones.length === 0) {
      setError('يجب إدخال رقم هاتف واحد على الأقل.');
      return;
    }

    setBusy(true);
    setMessage('');
    setError('');

    try {
      await adminApi.saveSettings({
        name: name.trim(),
        subtitle: subtitle.trim(),
        phones: phones.map((p) => p.trim()),
        whatsapp: whatsapp.trim(),
        address: address.trim(),
        city: city.trim(),
        demoPrices,
      });

      refreshAdmin(client);
      void client.invalidateQueries({ queryKey: ['admin', 'settings'] });
      void client.invalidateQueries({ queryKey: ['catalog'] });
      setMessage('تم حفظ ومزامنة إعدادات المركز بنجاح مع كافة صفحات المنصة.');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  // Clean digits for WhatsApp link test
  const cleanWaDigits = whatsapp.replace(/\D/g, '');

  return (
    <form className="settings-pro-layout" onSubmit={(e) => void submit(e)}>
      <fieldset disabled={busy} className="settings-fieldset">
        <div className="settings-bento-grid">
          {/* Card 1: Clinic Identity & Brand */}
          <div className="settings-card identity-card">
            <div className="settings-card-head">
              <div className="settings-card-icon identity">
                <Building2 size={20} />
              </div>
              <div>
                <h3>هوية المركز والاسم التجاري</h3>
                <p>الاسم الرسمي والشعار النصي الظاهر في ترويسة الموقع والروشتات الطبية.</p>
              </div>
            </div>

            <div className="settings-card-body">
              <label className="settings-field">
                <span className="field-title">
                  <Building size={15} />
                  اسم المركز الرسمي
                </span>
                <input
                  name="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  minLength={3}
                  maxLength={120}
                  placeholder="مركز المستقبل للتغذية"
                  className="settings-input"
                />
                <span className="field-caption">يظهر في أعلى صفحات الموقع وفي رسائل الحجز وتأكيد المواعيد.</span>
              </label>

              <label className="settings-field">
                <span className="field-title">
                  <Sparkles size={15} />
                  الوصف الترويجي والمختصر
                </span>
                <input
                  name="subtitle"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  required
                  minLength={3}
                  maxLength={120}
                  placeholder="للتغذية والتخسيس وعلاج السمنة"
                  className="settings-input"
                />
                <span className="field-caption">وصف موجز يوضح التخصص الرئيسي للمركز تحت الاسم مباشرة.</span>
              </label>
            </div>
          </div>

          {/* Card 2: Contact Channels & WhatsApp */}
          <div className="settings-card contact-card">
            <div className="settings-card-head">
              <div className="settings-card-icon contact">
                <PhoneCall size={20} />
              </div>
              <div>
                <h3>قنوات التواصل والواتساب</h3>
                <p>أرقام الهواتف المباشرة للاستقبال وخدمة المراجعين ورقم الواتساب الرسمي.</p>
              </div>
            </div>

            <div className="settings-card-body">
              {/* Phones List Manager */}
              <div className="settings-field">
                <span className="field-title">
                  <Phone size={15} />
                  أرقام هواتف المركز المعتمدة ({phones.length} من 4)
                </span>

                <div className="phones-pills-wrap">
                  {phones.map((p, idx) => (
                    <div key={p + idx} className="phone-pill">
                      <span className="phone-pill-icon">
                        <Phone size={13} />
                      </span>
                      <span className="phone-pill-number" dir="ltr">
                        {p}
                      </span>
                      {phones.length > 1 && (
                        <button
                          type="button"
                          className="phone-pill-del"
                          onClick={() => removePhone(idx)}
                          title="حذف هذا الرقم"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {phones.length < 4 && (
                  <div className="add-phone-row">
                    <input
                      type="tel"
                      dir="ltr"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addPhone();
                        }
                      }}
                      placeholder="+2010... أو 01012345678"
                      className="settings-input phone-add-input"
                    />
                    <button type="button" className="btn-add-phone" onClick={addPhone}>
                      <Plus size={16} />
                      إضافة رقم
                    </button>
                  </div>
                )}
                <span className="field-caption">تظهر هذه الأرقام في ذيل الموقع وصفحة الاتصال بنا لتسهيل وصول المراجعين.</span>
              </div>

              {/* WhatsApp Input */}
              <label className="settings-field">
                <div className="field-title-row">
                  <span className="field-title">
                    <MessageCircle size={15} />
                    رقم الواتساب الرسمي للاستفسارات
                  </span>
                  {cleanWaDigits && (
                    <a
                      href={`https://wa.me/${cleanWaDigits}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="wa-test-link"
                      title="فتح محادثة تجريبية على واتساب"
                    >
                      تجربة المحادثة
                      <ExternalLink size={12} />
                    </a>
                  )}
                </div>
                <input
                  name="whatsapp"
                  type="tel"
                  dir="ltr"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  required
                  placeholder="+201041504201"
                  className="settings-input font-mono"
                />
                <span className="field-caption">يستخدمه الزر العائم في الموقع والرسائل الترحيبية المباشرة.</span>
              </label>
            </div>
          </div>

          {/* Card 3: Location & Address */}
          <div className="settings-card location-card">
            <div className="settings-card-head">
              <div className="settings-card-icon location">
                <MapPin size={20} />
              </div>
              <div>
                <h3>العنوان الجغرافي والفرع</h3>
                <p>مقر المركز الرئيسي لتوجيه المراجعين بدقة في رسائل المواعيد والخرائط.</p>
              </div>
            </div>

            <div className="settings-card-body">
              <label className="settings-field">
                <span className="field-title">
                  <MapPin size={15} />
                  العنوان التفصيلي
                </span>
                <input
                  name="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                  minLength={5}
                  maxLength={300}
                  placeholder="شارع الجيش، برج الأطباء..."
                  className="settings-input"
                />
                <span className="field-caption">اكتبي العنوان بدقة مع أقرب علامة مميزة لتسهيل وصول المرضى.</span>
              </label>

              <label className="settings-field">
                <span className="field-title">
                  <Building size={15} />
                  المدينة أو المركز
                </span>
                <input
                  name="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  maxLength={100}
                  placeholder="كفر الزيات"
                  className="settings-input"
                />
                <span className="field-caption">المدينة التابع لها مقر المركز (تظهر في ترويسة الموقع).</span>
              </label>
            </div>
          </div>

          {/* Card 4: Pricing Mode & Demo Notice */}
          <div className="settings-card pricing-card">
            <div className="settings-card-head">
              <div className="settings-card-icon pricing">
                <Coins size={20} />
              </div>
              <div>
                <h3>سياسة تسعير الخدمات وتنبيه المراجعين</h3>
                <p>التحكم في طريقة ظهور باقات الأسعار للمراجعين في الصفحة العامة.</p>
              </div>
            </div>

            <div className="settings-card-body">
              <div
                className={`pricing-toggle-card ${demoPrices ? 'demo-active' : 'official-active'}`}
                onClick={() => setDemoPrices(!demoPrices)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    setDemoPrices(!demoPrices);
                  }
                }}
              >
                <div className="pricing-toggle-main">
                  <div className="pricing-toggle-text">
                    <span className="pricing-status-pill">
                      {demoPrices ? (
                        <>
                          <AlertCircle size={14} />
                          تنبيه الأسعار الاسترشادية (مفعّل)
                        </>
                      ) : (
                        <>
                          <CheckCircle2 size={14} />
                          الأسعار معتمدة ورسمية (مفعّل)
                        </>
                      )}
                    </span>
                    <h4>إظهار تنبيه أن الأسعار تجريبية أو استرشادية</h4>
                    <p>
                      {demoPrices
                        ? 'يظهر تنبيه للمراجعين بجانب أسعار الخدمات يوضح أن الأسعار استرشادية وقابلة للمراجعة أثناء الكشف.'
                        : 'الأسعار تظهر كقيم نهائية ومعتمدة رسمياً بدون أي شارة تجريبية.'}
                    </p>
                  </div>

                  <div className="toggle-switch-wrapper">
                    <div className={`switch-rail ${demoPrices ? 'checked' : ''}`}>
                      <div className="switch-thumb" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Live Clinic Card Preview Strip */}
        <div className="clinic-live-preview-panel">
          <div className="preview-panel-head">
            <div className="preview-panel-title">
              <Eye size={18} />
              <span>المعاينة الفورية لبيانات المركز كما يراها المراجع في الموقع:</span>
            </div>
            <span className="preview-panel-badge">
              <ShieldCheck size={14} />
              مباشر من المدخلات
            </span>
          </div>

          <div className="clinic-preview-card">
            <div className="clinic-preview-top">
              <div className="clinic-preview-avatar">
                <img src="/assets/brand-mark.png" alt="شعار المركز" />
              </div>
              <div>
                <h4 className="clinic-preview-name">{name || 'مركز المستقبل'}</h4>
                <p className="clinic-preview-sub">{subtitle || 'للتغذية والتخسيس'}</p>
              </div>
              <div className="clinic-preview-status-tag">
                <span className="dot" />
                <span>المركز يستقبل المراجعين</span>
              </div>
            </div>

            <div className="clinic-preview-meta">
              <div className="meta-item">
                <MapPin size={15} />
                <span>
                  {address || 'العنوان غير محدد'} {city ? `(${city})` : ''}
                </span>
              </div>
              <div className="meta-item">
                <Phone size={15} />
                <span dir="ltr">{phones.join(' · ')}</span>
              </div>
              {whatsapp && (
                <div className="meta-item wa">
                  <MessageCircle size={15} />
                  <span dir="ltr">واتساب: {whatsapp}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Notices */}
        {error && <Notice message={error} error />}
        {message && <Notice message={message} />}

        {/* Action Submit Bar */}
        <div className="settings-actions-bar">
          <div className="actions-info">
            <p>يتم تطبيق التعديلات فوراً على الموقع العام وذيل الصفحات وبوابة المراجعين.</p>
          </div>
          <Button disabled={busy} icon={false}>
            {busy ? (
              'جاري الحفظ والتحديث...'
            ) : (
              <>
                <Save size={18} />
                حفظ إعدادات المركز
              </>
            )}
          </Button>
        </div>
      </fieldset>
    </form>
  );
}
