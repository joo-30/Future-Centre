import { useState, useEffect, useMemo } from 'react';
import {
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Phone,
} from 'lucide-react';
import { WhatsAppIcon } from '../../../components/icons/WhatsAppIcon';
import { Modal } from '../../../components/ui';
import { dateLabel, timeLabel, whatsappUrl } from '../../../lib/api';

export interface DailyReminderAppointment {
  reference: string;
  name: string;
  phone: string;
  whatsapp?: string;
  time: string;
  date: string;
  serviceTitle: string;
  status: string;
}

export function DailyRemindersModal({
  open,
  onClose,
  appointments,
  todayStr,
}: {
  open: boolean;
  onClose: () => void;
  appointments: DailyReminderAppointment[];
  todayStr: string;
}) {
  const storageKey = `future_sent_reminders_${todayStr}`;
  const [sentRefs, setSentRefs] = useState<Record<string, boolean>>(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const [customGreeting, setCustomGreeting] = useState('صباح الخير والرشاقة 🌸');
  const [copiedRef, setCopiedRef] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(sentRefs));
    } catch {
      // storage error
    }
  }, [sentRefs, storageKey]);

  // Filter only relevant active appointments for today
  const todayList = useMemo(() => {
    return appointments
      .filter((a) => a.date === todayStr && a.status !== 'cancelled' && a.status !== 'rejected')
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [appointments, todayStr]);

  const sentCount = useMemo(() => {
    return todayList.filter((a) => sentRefs[a.reference]).length;
  }, [todayList, sentRefs]);

  const progressPercent = todayList.length > 0 ? Math.round((sentCount / todayList.length) * 100) : 0;

  const buildReminderMessage = (a: DailyReminderAppointment) => {
    const firstName = a.name.split(' ')[0] || a.name;
    return `${customGreeting}
أهلاً بحضرتك أستاذة ${firstName}، نذكركِ بموعدكِ اليوم في مركز المستقبل للتغذية العلاجية مع د. رنا ياسر الشوري 🌿

📅 الموعد: اليوم (${dateLabel(todayStr)}) الساعة ${timeLabel(a.time)}
🩺 نوع الجلسة: ${a.serviceTitle}
📍 عنوان العيادة: كفر الزيات - شارع الجيش (بجوار توكيل أورانج)
📞 هاتف العيادة: 01041504201

يسعدنا تأكيد حضوركِ بالرد بكلمة "تم التأكيد" لترتيب جدول الاستقبال لحضرتك 🌸`;
  };

  const handleMarkSent = (ref: string, state: boolean) => {
    setSentRefs((prev) => ({ ...prev, [ref]: state }));
  };

  const handleCopyMessage = async (a: DailyReminderAppointment) => {
    const text = buildReminderMessage(a);
    try {
      await navigator.clipboard.writeText(text);
      setCopiedRef(a.reference);
      setTimeout(() => setCopiedRef(null), 2000);
    } catch {
      // ignore
    }
  };

  const handleOpenWhatsApp = (a: DailyReminderAppointment) => {
    handleMarkSent(a.reference, true);
    const text = buildReminderMessage(a);
    const phone = a.whatsapp || a.phone;
    window.open(whatsappUrl(phone, text), '_blank');
  };

  return (
    <Modal open={open} onClose={onClose} title="تذكير الصباح لمواعيد اليوم (واتساب)">
      <div className="daily-reminders-dialog" style={{ direction: 'rtl' }}>
        {/* Header Progress & KPI */}
        <div className="drd-hero-card">
          <div className="drd-hero-top">
            <div className="drd-hero-info">
              <span className="drd-badge">
                <Clock size={13} />
                <span>إرسال تذكيرات الحضور اليومية</span>
              </span>
              <h3 className="drd-title">جدول مواعيد اليوم • {dateLabel(todayStr, { weekday: 'long', day: 'numeric', month: 'long' })}</h3>
              <p className="drd-sub">
                تذكير المرضى بمواعيدهم صباحاً عبر واتساب يقلل الغياب بنسبة 40%+ ويضمن انتظام جدول العيادة.
              </p>
            </div>

            <div className="drd-metric-box">
              <span className="drd-metric-val">
                {sentCount} <small>/ {todayList.length}</small>
              </span>
              <span className="drd-metric-label">تم إرسال التذكير لهم</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="drd-progress-wrap">
            <div className="drd-progress-bar" style={{ width: `${progressPercent}%` }} />
          </div>
          <div className="drd-progress-labels">
            <span>نسبة إنجاز التذكيرات: {progressPercent}%</span>
            {progressPercent === 100 && (
              <span className="drd-done-badge">
                <CheckCircle2 size={13} />
                <span>اكتملت جميع تذكيرات اليوم بنجاح!</span>
              </span>
            )}
          </div>
        </div>

        {/* Message Template Customizer */}
        <div className="drd-template-box">
          <div className="drd-template-header">
            <span className="drd-template-title">تحية ورسالة البداية:</span>
            <input
              type="text"
              value={customGreeting}
              onChange={(e) => setCustomGreeting(e.target.value)}
              className="drd-greeting-input"
              placeholder="مثال: صباح الخير والرشاقة 🌸"
            />
          </div>
          <small className="drd-template-hint">
            💡 يتم تخصيص اسم المريضة، وقت الموعد بالساعة والدقيقة، والخدمة الطبية تلقائياً في كل رسالة.
          </small>
        </div>

        {/* Appointments List */}
        {!todayList.length ? (
          <div className="drd-empty-state">
            <CheckCircle2 size={32} color="#10b981" />
            <strong>لا توجد مواعيد متبقية بحاجة لتذكير اليوم!</strong>
            <small>جدول اليوم هادئ أو تم الانتهاء من كافة المواعيد.</small>
          </div>
        ) : (
          <div className="drd-patient-list">
            {todayList.map((a, idx) => {
              const isSent = Boolean(sentRefs[a.reference]);
              const targetPhone = a.whatsapp || a.phone;

              return (
                <article
                  key={a.reference}
                  className={`drd-patient-card ${isSent ? 'is-sent-done' : ''}`}
                >
                  <div className="drd-card-main">
                    <div className="drd-card-num-avatar">
                      {idx + 1}
                    </div>

                    <div className="drd-card-patient-info">
                      <div className="drd-name-row">
                        <strong className="drd-patient-name">{a.name}</strong>
                        <span className="drd-time-pill">
                          <Clock size={12} />
                          <span>{timeLabel(a.time)}</span>
                        </span>
                        {isSent && (
                          <span className="drd-sent-tag">
                            <Check size={11} strokeWidth={3} />
                            <span>تم الإرسال</span>
                          </span>
                        )}
                      </div>

                      <div className="drd-patient-sub">
                        <span className="drd-service-tag">{a.serviceTitle}</span>
                        <span className="drd-phone-tag" dir="ltr">
                          <Phone size={12} />
                          <span>{targetPhone}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="drd-card-actions">
                    <button
                      type="button"
                      className="drd-btn-copy"
                      onClick={() => handleCopyMessage(a)}
                      title="نسخ نص التذكير الخاص بهذه المريضة"
                    >
                      {copiedRef === a.reference ? (
                        <>
                          <Check size={14} color="#059669" />
                          <span>تم النسخ ✓</span>
                        </>
                      ) : (
                        <>
                          <Copy size={14} />
                          <span>نسخ النص</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      className={`drd-btn-wa ${isSent ? 'is-done' : ''}`}
                      onClick={() => handleOpenWhatsApp(a)}
                      title="فتح واتساب وإرسال التذكير فوراً"
                    >
                      <WhatsAppIcon size={16} />
                      <span>{isSent ? 'إعادة الإرسال' : 'إرسال تذكير واتساب'}</span>
                    </button>

                    <label className="drd-sent-checkbox-label" title="تحديد كـ تم الإرسال يدويًا">
                      <input
                        type="checkbox"
                        checked={isSent}
                        onChange={(e) => handleMarkSent(a.reference, e.target.checked)}
                      />
                      <span>تم</span>
                    </label>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <div className="drd-dialog-footer">
          <span className="drd-footer-hint">
            يتم فتح تطبيق واتساب مباشرة مع الرسالة المجهزة بالكامل بدون الحاجة لكتابة أي كلمة.
          </span>
          <button type="button" className="drd-btn-close" onClick={onClose}>
            إغلاق النافذة
          </button>
        </div>
      </div>
    </Modal>
  );
}
