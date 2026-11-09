import type { Subscription } from '@future/shared';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { DatePicker } from '../../../components/forms/DatePicker';
import { PatientSearchSelect } from '../../../components/forms/PatientSearchSelect';
import { Button } from '../../../components/ui';
import { addDays, today } from '../../../lib/api';
import { adminApi } from '../../../lib/portal-api';
import { Notice } from '../components/Notice';
import { readFormNumber, readFormPrice, readFormText } from '../lib/form-data';

export function SubscriptionEditor({
  subscription: s,
  onSaved,
}: {
  subscription: Partial<Subscription>;
  onSaved: () => void;
}) {
  const services = useQuery({ queryKey: ['admin', 'services'], queryFn: adminApi.services });
  const patients = useQuery({
    queryKey: ['admin', 'patients'],
    queryFn: () => adminApi.patients(),
  });
  const [userId, setUserId] = useState(s.userId || '');
  const [name, setName] = useState(s.name || '');
  const [phone, setPhone] = useState(s.phone || '');
  const [chosenProgram, setChosenProgram] = useState(s.programId || '');
  const [startDate, setStartDate] = useState(s.startDate || today());
  const [endDate, setEndDate] = useState(s.endDate || addDays(today(), 30));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const onSelectPatient = (id: string) => {
    setUserId(id);
    if (!id) return;
    const p = patients.data?.patients.find((item) => item.id === id);
    if (p) {
      setName(p.name);
      setPhone(p.phone);
    }
  };
  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true);
    setError('');
    try {
      await adminApi.subscription(s.id || 'new', {
        userId: readFormText(f, 'userId') || null,
        name: readFormText(f, 'name'),
        phone: readFormText(f, 'phone'),
        programId: readFormText(f, 'programId'),
        price: readFormPrice(f),
        sessionsTotal: readFormNumber(f, 'sessionsTotal'),
        sessionsUsed: readFormNumber(f, 'sessionsUsed'),
        startDate: readFormText(f, 'startDate'),
        endDate: readFormText(f, 'endDate'),
        status: readFormText(f, 'status'),
        notes: readFormText(f, 'notes'),
      });
      onSaved();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <form onSubmit={(e) => void save(e)}>
      <fieldset disabled={busy}>
        <div style={{ marginBottom: 16 }}>
          <span style={{ display: 'block', marginBottom: 8, fontWeight: 700, fontSize: '13.5px', color: '#163824' }}>
            حساب العميل (اختياري)
          </span>
          <PatientSearchSelect
            patients={patients.data?.patients || []}
            selectedId={userId}
            onSelect={onSelectPatient}
            placeholder="ابحثي بالاسم أو رقم الهاتف لربط الاشتراك بحساب المريض..."
          />
          <input type="hidden" name="userId" value={userId} />
          <p className="field-hint" style={{ marginTop: 6, fontSize: '12px', color: '#55725e' }}>تأكدي من هوية صاحب الحساب قبل ربط الاشتراك به.</p>
        </div>
        <label className="field">
          اسم العميل
          <input
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            minLength={3}
            maxLength={100}
          />
        </label>
        <label className="field">
          رقم الهاتف
          <input
            name="phone"
            type="tel"
            dir="ltr"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </label>
        <label className="field">
          البرنامج
          <select
            aria-label="البرنامج"
            name="programId"
            value={chosenProgram}
            onChange={(e) => setChosenProgram(e.target.value)}
            required
          >
            <option value="">اختاري البرنامج</option>
            {services.data?.services.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </label>
        <div className="editor-two">
          <label className="field">
            القيمة المتفق عليها بالجنيه
            <input name="price" type="number" min={0} max={1000000} defaultValue={s.price ?? ''} />
          </label>
          <label className="field">
            الحالة
            <select aria-label="الحالة" name="status" defaultValue={s.status || 'pending'}>
              <option value="pending">بانتظار التفعيل</option>
              <option value="active">نشط</option>
              <option value="paused">متوقف مؤقتًا</option>
              <option value="completed">مكتمل</option>
              <option value="cancelled">ملغي</option>
            </select>
          </label>
          <label className="field">
            إجمالي الجلسات
            <input
              name="sessionsTotal"
              type="number"
              min={1}
              max={100}
              defaultValue={s.sessionsTotal || 4}
              required
            />
          </label>
          <label className="field">
            الجلسات المستخدمة
            <input
              name="sessionsUsed"
              type="number"
              min={0}
              max={100}
              defaultValue={s.sessionsUsed ?? 0}
              required
            />
          </label>
          <label className="field">
            بداية الاشتراك
            <DatePicker name="startDate" value={startDate} onChange={setStartDate} required />
          </label>
          <label className="field">
            نهاية الاشتراك
            <DatePicker name="endDate" value={endDate} onChange={setEndDate} required />
          </label>
        </div>
        <label className="field">
          ملاحظة إدارية (لا تظهر للعميل)
          <textarea name="notes" defaultValue={s.notes} maxLength={2000} />
        </label>
        <Notice message={error} error />
        <div className="modal-actions">
          <Button disabled={busy}>{busy ? 'جاري الحفظ...' : 'حفظ الاشتراك'}</Button>
        </div>
      </fieldset>
    </form>
  );
}
