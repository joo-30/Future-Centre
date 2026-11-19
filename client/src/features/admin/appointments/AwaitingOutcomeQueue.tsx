import type { AdminAppointment } from '@future/shared';
import { useQueryClient } from '@tanstack/react-query';
import { Check, ClipboardCheck, UserX } from 'lucide-react';
import { useState } from 'react';
import { dateLabel, relativeDateLabel, timeLabel } from '../../../lib/api';
import { adminApi } from '../../../lib/portal-api';
import { refreshAdmin } from '../lib/cache';

type Outcome = 'complete' | 'no_show';

const PREVIEW_COUNT = 3;

const outcomeCopy: Record<Outcome, { action: string; confirm: string }> = {
  complete: { action: 'تم الحضور', confirm: 'تأكيد تسجيل الحضور؟' },
  no_show: { action: 'لم يحضر', confirm: 'تأكيد تسجيل عدم الحضور؟' },
};

/**
 * Confirmed visits whose time has passed without a recorded outcome. Until the clinic
 * records "attended" or "no-show", they stay open: the patient sees them as awaiting an
 * update and analytics cannot count them as completed visits.
 */
export function AwaitingOutcomeQueue({
  appointments,
  total,
  onOpen,
}: {
  appointments: AdminAppointment[];
  total: number;
  onOpen: (reference: string) => void;
}) {
  const client = useQueryClient();
  const [expanded, setExpanded] = useState(false);
  const [confirming, setConfirming] = useState<{ reference: string; outcome: Outcome } | null>(
    null,
  );
  const [busy, setBusy] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (total === 0) return null;

  const visible = expanded ? appointments : appointments.slice(0, PREVIEW_COUNT);

  async function record(reference: string, outcome: Outcome) {
    setBusy(reference);
    setErrors((e) => ({ ...e, [reference]: '' }));
    try {
      await adminApi.decision(reference, { action: outcome });
      setConfirming(null);
      refreshAdmin(client);
    } catch (e) {
      setErrors((prev) => ({ ...prev, [reference]: (e as Error).message }));
    } finally {
      setBusy('');
    }
  }

  return (
    <section className="awaiting-outcome" aria-labelledby="awaiting-outcome-title">
      <header className="awaiting-outcome-head">
        <span className="awaiting-outcome-icon" aria-hidden="true">
          <ClipboardCheck size={18} />
        </span>
        <div>
          <h2 id="awaiting-outcome-title">
            مواعيد محتاجة تقفيل <bdi className="awaiting-outcome-count">{total}</bdi>
          </h2>
          <p>
            مواعيد مؤكدة عدّى وقتها ولسه ما اتسجلش فيها حضور. سجّلي النتيجة عشان سجل المريض
            والتحليلات يبقوا صح.
          </p>
        </div>
      </header>

      <ul className="awaiting-outcome-list" role="list">
        {visible.map((a) => {
          const pending = confirming?.reference === a.reference ? confirming.outcome : null;
          const isBusy = busy === a.reference;
          return (
            <li key={a.reference} className="awaiting-outcome-row">
              <div className="awaiting-outcome-who">
                <strong>{a.name}</strong>
                <span>
                  {a.serviceTitle}
                  {a.fileNumber ? (
                    <>
                      {' '}
                      · ملف <bdi dir="ltr">#{a.fileNumber}</bdi>
                    </>
                  ) : null}
                </span>
              </div>
              <div className="awaiting-outcome-when">
                <span>
                  {dateLabel(a.date)} · {timeLabel(a.time)}
                </span>
                <small>{relativeDateLabel(a.date)}</small>
              </div>

              <div className="awaiting-outcome-actions">
                {pending ? (
                  <>
                    <span className="awaiting-outcome-confirm">{outcomeCopy[pending].confirm}</span>
                    <button
                      type="button"
                      className={`awaiting-btn ${pending === 'complete' ? 'is-primary' : 'is-warn'}`}
                      disabled={isBusy}
                      onClick={() => void record(a.reference, pending)}
                    >
                      {isBusy ? 'جارٍ الحفظ…' : 'تأكيد'}
                    </button>
                    <button
                      type="button"
                      className="awaiting-btn is-quiet"
                      disabled={isBusy}
                      onClick={() => setConfirming(null)}
                    >
                      رجوع
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      className="awaiting-btn is-primary"
                      onClick={() => setConfirming({ reference: a.reference, outcome: 'complete' })}
                    >
                      <Check size={15} aria-hidden="true" /> {outcomeCopy.complete.action}
                    </button>
                    <button
                      type="button"
                      className="awaiting-btn"
                      onClick={() => setConfirming({ reference: a.reference, outcome: 'no_show' })}
                    >
                      <UserX size={15} aria-hidden="true" /> {outcomeCopy.no_show.action}
                    </button>
                    <button
                      type="button"
                      className="awaiting-btn is-quiet"
                      onClick={() => onOpen(a.reference)}
                    >
                      التفاصيل
                    </button>
                  </>
                )}
              </div>
              {errors[a.reference] && (
                <p className="awaiting-outcome-error" role="alert">
                  {errors[a.reference]}
                </p>
              )}
            </li>
          );
        })}
      </ul>

      {appointments.length > PREVIEW_COUNT && (
        <button
          type="button"
          className="awaiting-outcome-more"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
        >
          {expanded ? 'عرض أقل' : `عرض الكل (${appointments.length})`}
        </button>
      )}
      {total > appointments.length && expanded && (
        <p className="awaiting-outcome-note">
          ظاهر أقدم {appointments.length} موعد من {total}. هيظهر الباقي بعد تقفيل دول.
        </p>
      )}
    </section>
  );
}
