import { type AppointmentPublic } from '@future/shared';
import { useState } from 'react';
import { Clock, QrCode } from 'lucide-react';
import { BookingQrPass } from '../../../components/appointments/BookingQrPass';
import { SlotPicker } from '../../../components/appointments/SlotPicker';
import { Button, Modal } from '../../../components/ui';
import { addDays, today } from '../../../lib/api';
import { accountApi } from '../../../lib/portal-api';

export function AppointmentActions({
  appointment: a,
  onDone,
}: {
  appointment: AppointmentPublic;
  onDone: () => void;
}) {
  const [mode, setMode] = useState('');
  const [date, setDate] = useState(addDays(today(), 1));
  const [time, setTime] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit() {
    setBusy(true);
    setError('');
    try {
      if (mode === 'cancel') await accountApi.cancel(a.reference);
      else await accountApi.reschedule(a.reference, date, time);
      setMode('');
      onDone();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <div className="account-actions">
        {a.status === 'confirmed' ? (
          <button
            type="button"
            className="btn light small"
            style={{ gap: '6px' }}
            onClick={() => {
              setError('');
              setMode('qr');
            }}
          >
            <QrCode size={15} />
            <span>تذكرة الحجز (QR)</span>
          </button>
        ) : a.status === 'pending' ? (
          <span
            className="pending-qr-disabled-pill"
            title="تذكرة الدخول الذكية تتاح فور تأكيد واعتماد الموعد من العيادة"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 13px',
              borderRadius: '10px',
              background: '#fef3c7',
              border: '1px solid #fde68a',
              color: '#92400e',
              fontSize: '13px',
              fontWeight: 600,
            }}
          >
            <Clock size={14} style={{ color: '#d97706' }} />
            <span>تذكرة الـ QR (تُفعّل بعد التأكيد)</span>
          </span>
        ) : null}
        {a.canReschedule && (
          <Button
            icon={false}
            kind="outline"
            onClick={() => {
              setError('');
              setMode('reschedule');
            }}
          >
            طلب تغيير الوقت
          </Button>
        )}
        {a.canCancel && (
          <button
            className="link cancel-link"
            onClick={() => {
              setError('');
              setMode('cancel');
            }}
          >
            إلغاء الموعد
          </button>
        )}
      </div>
      <Modal
        open={!!mode}
        onClose={() => {
          if (!busy) setMode('');
        }}
        title={
          mode === 'qr'
            ? 'تذكرة الحجز الذكية (QR)'
            : mode === 'cancel'
              ? 'تأكيد إلغاء الموعد'
              : 'اختاري وقتًا بديلًا'
        }
      >
        {mode === 'qr' ? (
          <BookingQrPass
            reference={a.reference}
            name={a.firstName}
            serviceTitle={a.serviceTitle}
            date={a.date}
            time={a.time}
            phoneMasked={a.phoneMasked}
            status={a.status}
            qrToken={a.qrToken}
          />
        ) : mode === 'cancel' ? (
          <p>سيصبح الوقت متاحًا للآخرين بعد الإلغاء.</p>
        ) : (
          <>
            <p>يبقى موعدك الحالي قائمًا حتى اعتماد المركز للبديل.</p>
            <SlotPicker
              reference={a.reference}
              serviceId={a.serviceId}
              date={date}
              time={time}
              onDate={setDate}
              onTime={setTime}
            />
          </>
        )}
        {error && (
          <p role="alert" className="form-error">
            {error}
          </p>
        )}
        {mode !== 'qr' && (
          <div className="modal-actions">
            <Button
              disabled={busy || (mode === 'reschedule' && !time)}
              kind={mode === 'cancel' ? 'red' : ''}
              onClick={() => void submit()}
            >
              {busy ? 'جاري الحفظ...' : mode === 'cancel' ? 'تأكيد الإلغاء' : 'إرسال طلب التغيير'}
            </Button>
          </div>
        )}
      </Modal>
    </>
  );
}
