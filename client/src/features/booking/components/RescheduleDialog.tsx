import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { DatePicker } from '../../../components/forms/DatePicker';
import { Button, Loading, Modal } from '../../../components/ui';
import { addDays, api, timeLabel, today } from '../../../lib/api';

export function RescheduleDialog({
  open,
  onClose,
  token,
  serviceId,
}: {
  open: boolean;
  onClose: () => void;
  token: string;
  serviceId: string;
}) {
  const [date, setDate] = useState(addDays(today(), 1));
  const [time, setTime] = useState('');
  const [message, setMessage] = useState('');
  const client = useQueryClient();
  const slots = useQuery({
    queryKey: ['reschedule-slots', serviceId, date],
    queryFn: () => api.privateAvailability(token, date),
    enabled: open && !!serviceId,
  });
  useEffect(() => {
    setTime('');
    setMessage('');
  }, [date]);
  const mutation = useMutation({
    mutationFn: () => api.reschedule(token, date, time),
    onSuccess: (a) => {
      client.setQueryData(['tracking', token], a);
      onClose();
      setTime('');
    },
    onError: (e) => {
      setMessage(e.message);
      void slots.refetch();
    },
  });
  return (
    <Modal open={open} onClose={onClose} title="اختاري وقتًا بديلًا">
      <p className="muted">موعدك الحالي قائم حتى يوافق المركز على البديل.</p>
      <label className="field">
        اليوم المقترح
        <DatePicker
          value={date}
          minDate={today()}
          maxDate={addDays(today(), 90)}
          onChange={(newDate) => setDate(newDate)}
        />
      </label>
      {slots.isPending ? (
        <Loading />
      ) : slots.error ? (
        <p role="alert" className="field-error">
          {slots.error.message}
        </p>
      ) : (
        <div className="times reschedule-times">
          {slots.data?.slots
            .filter((s) => s.available)
            .map((s) => (
              <button
                type="button"
                className={'time ' + (time === s.time ? 'chosen' : '')}
                key={s.time}
                onClick={() => setTime(s.time)}
                aria-pressed={time === s.time}
              >
                {timeLabel(s.time)}
              </button>
            ))}
        </div>
      )}
      {slots.data && !slots.data.slots.some((s) => s.available) && (
        <p className="small muted mt-5">لا يوجد وقت متاح في هذا اليوم. اختاري يومًا آخر.</p>
      )}
      {message && (
        <p className="form-error" role="alert">
          {message}
        </p>
      )}
      <div className="mt-6">
        <Button
          kind="full"
          disabled={!time || mutation.isPending}
          onClick={() => mutation.mutate()}
        >
          {mutation.isPending ? 'جاري إرسال الطلب...' : 'إرسال طلب التغيير'}
        </Button>
      </div>
    </Modal>
  );
}
