import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { DatePicker } from '../../../components/forms/DatePicker';
import { PatientSearchSelect } from '../../../components/forms/PatientSearchSelect';
import { Button } from '../../../components/ui';
import { today } from '../../../lib/api';
import { adminApi } from '../../../lib/portal-api';
import { Notice } from '../components/Notice';
import { readFormNumber, readFormText } from '../lib/form-data';

export function InBodyEditor({
  defaultPatient,
  onSaved,
}: {
  defaultPatient?: { userId?: string; name?: string; phone?: string } | null;
  onSaved: () => void;
}) {
  const patients = useQuery({
    queryKey: ['admin', 'patients'],
    queryFn: () => adminApi.patients(),
  });
  const [patientName, setPatientName] = useState(defaultPatient?.name || '');
  const [patientPhone, setPatientPhone] = useState(defaultPatient?.phone || '');
  const [userId, setUserId] = useState(defaultPatient?.userId || '');
  const [date, setDate] = useState(today());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const onSelectPatient = (id: string) => {
    setUserId(id);
    if (!id) return;
    const found = patients.data?.patients.find((p) => p.id === id);
    if (found) {
      setPatientName(found.name);
      setPatientPhone(found.phone);
    }
  };

  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true);
    setError('');
    try {
      await adminApi.saveInbody({
        userId: userId || null,
        patientName: readFormText(f, 'patientName'),
        patientPhone: readFormText(f, 'patientPhone'),
        date: readFormText(f, 'date') || today(),
        weight: readFormNumber(f, 'weight'),
        bodyFatPercent: readFormText(f, 'bodyFatPercent') ? readFormNumber(f, 'bodyFatPercent') : undefined,
        muscleMass: readFormText(f, 'muscleMass') ? readFormNumber(f, 'muscleMass') : undefined,
        waterPercent: readFormText(f, 'waterPercent') ? readFormNumber(f, 'waterPercent') : undefined,
        visceralFat: readFormText(f, 'visceralFat') ? readFormNumber(f, 'visceralFat') : undefined,
        waistCm: readFormText(f, 'waistCm') ? readFormNumber(f, 'waistCm') : undefined,
        doctorNotes: readFormText(f, 'doctorNotes') || undefined,
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
            اختيار من حسابات المرضى المسجلة (اختياري)
          </span>
          <PatientSearchSelect
            patients={patients.data?.patients || []}
            selectedId={userId}
            onSelect={onSelectPatient}
            placeholder="ابحثي بالاسم أو رقم الهاتف لجلب بيانات المريض تلقائياً..."
          />
        </div>

        <div className="admin-form-grid">
          <label className="field">
            اسم المريض بالكامل
            <input
              name="patientName"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              required
            />
          </label>
          <label className="field">
            رقم الهاتف للتواصل والمتابعة
            <input
              name="patientPhone"
              type="tel"
              dir="ltr"
              value={patientPhone}
              onChange={(e) => setPatientPhone(e.target.value)}
              required
            />
          </label>
        </div>

        <div className="admin-form-grid">
          <label className="field">
            تاريخ الفحص
            <DatePicker name="date" value={date} onChange={setDate} required />
          </label>
          <label className="field">
            الوزن الحالي (كجم) *
            <input
              name="weight"
              type="number"
              step="0.1"
              min="20"
              max="300"
              placeholder="مثال: 74.5"
              onFocus={(e) => e.target.select()}
              required
            />
          </label>
        </div>

        <div className="admin-form-grid">
          <label className="field">
            نسبة الدهون (%)
            <input
              name="bodyFatPercent"
              type="number"
              step="0.1"
              min="1"
              max="70"
              placeholder="مثال: 26.4"
              onFocus={(e) => e.target.select()}
            />
          </label>
          <label className="field">
            الكتلة العضلية (كجم)
            <input
              name="muscleMass"
              type="number"
              step="0.1"
              min="5"
              max="150"
              placeholder="مثال: 32.8"
              onFocus={(e) => e.target.select()}
            />
          </label>
        </div>

        <div className="admin-form-grid">
          <label className="field">
            نسبة الماء بالجسم (%)
            <input
              name="waterPercent"
              type="number"
              step="0.1"
              min="10"
              max="85"
              placeholder="مثال: 53.2"
              onFocus={(e) => e.target.select()}
            />
          </label>
          <label className="field">
            الدهون الحشوية (مستوى 1 - 20)
            <input
              name="visceralFat"
              type="number"
              min="1"
              max="20"
              placeholder="مثال: 6"
              onFocus={(e) => e.target.select()}
            />
          </label>
        </div>

        <label className="field">
          محيط الخصر (سم - اختياري)
          <input
            name="waistCm"
            type="number"
            step="0.5"
            min="30"
            max="250"
            placeholder="مثال: 82"
            onFocus={(e) => e.target.select()}
          />
        </label>

        <label className="field">
          توجيهات وملاحظات الطبيب للمريض
          <textarea
            name="doctorNotes"
            rows={3}
            placeholder="مثال: التزام ممتاز بالدايت، يُرجى الحفاظ على شرب 2.5 لتر ماء وزيادة حصة البروتين."
          />
        </label>

        {error && <Notice message={error} error />}

        <div className="row end mt-6">
          <Button>{busy ? 'جاري الحفظ...' : 'حفظ فحص الـ InBody'}</Button>
        </div>
      </fieldset>
    </form>
  );
}
