import { phoneSchema, type Service } from '@future/shared';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { Check } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useCatalog } from '../hooks/useCatalog';
import { api } from '../lib/api';
import { useAuth } from './Auth';
import { Button, Modal, WhatsAppLink } from './ui';
const schema = z.object({
  name: z.string().trim().min(3, 'اكتبي اسمك بالكامل.'),
  phone: phoneSchema,
  consent: z.boolean().refine(Boolean, 'نحتاج موافقتك على التواصل.'),
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
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<z.input<typeof schema>, unknown, z.output<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', phone: '', consent: false },
  });
  useEffect(() => {
    if (user && program) {
      setValue('name', user.name);
      setValue('phone', user.phone);
    }
  }, [user?.id, program?.id, setValue]);
  const close = () => {
    onClose();
    setResult(null);
    setError('');
    reset();
  };
  return (
    <Modal
      open={!!program}
      onClose={close}
      title={result ? 'وصل طلبك للمركز.' : 'طلب ' + (program?.title || 'برنامج')}
    >
      {result ? (
        <div className="interest-success">
          <Check size={37} />
          <p>{result.message}</p>
          <strong className="ltr">{result.reference}</strong>
          <p className="small muted">الطلب لا يفعّل اشتراكًا ولا يتضمن دفعًا إلكترونيًا.</p>
          {data && (
            <WhatsAppLink
              phone={data.clinic.whatsapp}
              message={`أهلًا، أتابع طلب البرنامج رقم ${result.reference}.`}
            >
              متابعة عبر واتساب
            </WhatsAppLink>
          )}
        </div>
      ) : (
        <form
          onSubmit={handleSubmit(async (v) => {
            setError('');
            try {
              setResult(await api.interest({ ...v, programId: program!.id }));
              void client.invalidateQueries({ queryKey: ['account'] });
            } catch (e) {
              setError((e as Error).message);
            }
          })}
          noValidate
        >
          <p className="muted">اتركي بيانات التواصل، وسيوضح المركز التفاصيل معك.</p>
          <label className="field">
            الاسم بالكامل
            <input {...register('name')} autoComplete="name" aria-invalid={!!errors.name} />
            {errors.name && <span className="field-error">{errors.name.message}</span>}
          </label>
          <label className="field">
            رقم الهاتف وواتساب
            <input
              {...register('phone')}
              type="tel"
              dir="ltr"
              autoComplete="off"
              placeholder=""
              aria-invalid={!!errors.phone}
            />
            {errors.phone && <span className="field-error">{errors.phone.message}</span>}
          </label>
          <label className="consent">
            <input {...register('consent')} type="checkbox" />
            أوافق على التواصل بخصوص طلب البرنامج.
          </label>
          {errors.consent && <p className="field-error">{errors.consent.message}</p>}
          {error && (
            <p role="alert" className="form-error">
              {error}
            </p>
          )}
          <Button kind="full" disabled={isSubmitting}>
            {isSubmitting ? 'جاري حفظ الطلب...' : 'إرسال طلب البرنامج'}
          </Button>
          <p className="small muted" style={{ marginTop: 12 }}>
            يُحفظ الطلب قبل فتح واتساب. لا توجد خطوة دفع.
          </p>
        </form>
      )}
    </Modal>
  );
}
