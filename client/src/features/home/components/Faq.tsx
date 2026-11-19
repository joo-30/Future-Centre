import { Minus, Plus } from 'lucide-react';

export function Faq() {
  return (
    <div className="closing-faqs">
      {[
        [
          'هل أحتاج حسابًا لحجز موعد؟',
          'لا، احجزي باسمكِ ورقم هاتفكِ. المركز هيتواصل معكِ لتأكيد الموعد.',
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
        <details
          className="closing-faq"
          name="clinic-booking-questions"
          key={x[0]}
          open={i === 0 || undefined}
        >
          <summary>
            <span>{x[0]}</span>
            <Plus className="closing-faq-plus" size={23} aria-hidden="true" />
            <Minus className="closing-faq-minus" size={23} aria-hidden="true" />
          </summary>
          <p>{x[1]}</p>
        </details>
      ))}
    </div>
  );
}
