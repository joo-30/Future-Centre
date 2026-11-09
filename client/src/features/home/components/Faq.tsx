import { Minus, Plus } from 'lucide-react';

export function Faq() {
  return (
    <div className="faqs">
      {[
        [
          'هل أحتاج حسابًا لحجز موعد؟',
          'لا، احجزي باسمك ورقم هاتفك. يتواصل المركز معك لتأكيد الموعد.',
        ],
        [
          'هل طلب الموعد يعني تأكيده؟',
          'إرسال الطلب يعني استلامه فقط. تظهر الحالة «مؤكد» عندما يوافق المركز على الموعد.',
        ],
        [
          'كيف أتابع أو أغيّر موعدي؟',
          'بعد إرسال الطلب يصلك رابط خاص لمتابعته. يمكنك منه طلب تغيير الوقت أو إلغاء الطلب، أو التواصل مع المركز على واتساب.',
        ],
      ].map((x, i) => (
        <details className="faq" key={x[0]} open={i === 0 || undefined}>
          <summary>
            <strong>{x[0]}</strong>
            <Plus className="faq-plus" size={19} />
            <Minus className="faq-minus" size={19} />
          </summary>
          <p>{x[1]}</p>
        </details>
      ))}
    </div>
  );
}
