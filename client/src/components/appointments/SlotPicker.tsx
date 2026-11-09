import { useQuery } from '@tanstack/react-query';
import { DatePicker } from '../forms/DatePicker';
import { addDays, api, timeLabel, today } from '../../lib/api';
import { accountApi, adminApi } from '../../lib/portal-api';
import { Loading } from '../ui';

export function SlotPicker({
  serviceId,
  date,
  time,
  onDate,
  onTime,
  reference,
  admin = false,
}: {
  serviceId: string;
  date: string;
  time: string;
  onDate: (d: string) => void;
  onTime: (t: string) => void;
  reference?: string;
  admin?: boolean;
}) {
  const availabilityQuery = useQuery({
    queryKey: ['picker', serviceId, date, reference, admin],
    queryFn: () =>
      reference
        ? admin
          ? adminApi.availability(reference, date)
          : accountApi.availability(reference, date)
        : api.availability(serviceId, date),
    enabled: !!serviceId && !!date,
  });
  return (
    <>
      <label className="field">
        اليوم الجديد
        <DatePicker
          value={date}
          minDate={today()}
          maxDate={addDays(today(), 90)}
          onChange={(newDate) => {
            onDate(newDate);
            onTime('');
          }}
        />
      </label>
      {availabilityQuery.isPending ? (
        <Loading />
      ) : availabilityQuery.error ? (
        <p className="form-error" role="alert">
          {availabilityQuery.error.message}
        </p>
      ) : (
        <div className="slot-picker">
          {availabilityQuery.data?.slots
            .filter((s) => s.available)
            .map((s) => (
              <button
                type="button"
                className={time === s.time ? 'selected' : ''}
                key={s.time}
                onClick={() => onTime(s.time)}
                aria-pressed={time === s.time}
              >
                {timeLabel(s.time)}
              </button>
            ))}
          {!availabilityQuery.data?.slots.some((s) => s.available) && (
            <p>لا يوجد وقت متاح. اختاري يومًا آخر.</p>
          )}
        </div>
      )}
    </>
  );
}
