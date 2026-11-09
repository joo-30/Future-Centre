import { useRef, useState } from 'react';
import { SlotPicker } from '../../../components/appointments/SlotPicker';
import { Button } from '../../../components/ui';
import { useCatalog } from '../../../hooks/useCatalog';
import { addDays, today } from '../../../lib/api';
import { adminApi } from '../../../lib/portal-api';
import { Notice } from '../components/Notice';

export function ManualBooking({ onDone }: { onDone: () => void }) {
  const { data } = useCatalog();
  const [serviceId, setServiceId] = useState('nutrition');
  const [date, setDate] = useState(addDays(today(), 1));
  const [time, setTime] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const key = useRef({ payload: '', id: '' });
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError('');
    const f = new FormData(e.currentTarget);
    const body = {
      serviceId,
      date,
      time,
      name: String(f.get('name')),
      phone: String(f.get('phone')),
      consent: true,
    };
    const payload = JSON.stringify(body);
    if (key.current.payload !== payload) key.current = { payload, id: crypto.randomUUID() };
    try {
      await adminApi.manual(body, key.current.id);
      onDone();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <form onSubmit={(e) => void submit(e)}>
      <fieldset disabled={busy}>
        <p>يُحفظ الطلب بانتظار الموافقة، ثم يمكن تأكيده من قائمة المواعيد.</p>
        <label className="field">
          الاسم بالكامل
          <input name="name" required minLength={3} maxLength={100} />
        </label>
        <label className="field">
          رقم الهاتف
          <input name="phone" type="tel" dir="ltr" required />
        </label>
        <label className="field">
          الخدمة
          <select
            value={serviceId}
            onChange={(e) => {
              setServiceId(e.target.value);
              setTime('');
            }}
          >
            {data?.services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>
        </label>
        <SlotPicker
          serviceId={serviceId}
          date={date}
          time={time}
          onDate={setDate}
          onTime={setTime}
        />
        <label className="consent">
          <input type="checkbox" required />
          تم التأكد من بيانات العميل وموافقته على التواصل.
        </label>
        <Notice message={error} error />
        <div className="modal-actions">
          <Button disabled={busy || !time}>{busy ? 'جاري الإضافة...' : 'إضافة طلب الموعد'}</Button>
        </div>
      </fieldset>
    </form>
  );
}
