import fs from 'node:fs';

const filePath = 'Future-Centre/client/src/features/home/components/SuccessStoriesSection.tsx';
let code = fs.readFileSync(filePath, 'utf8');

// 1. Replace Sparkles in imports with Layers
code = code.replace(
  '  ShieldCheck,\n  Sparkles,\n  Trophy,',
  '  ShieldCheck,\n  Layers,\n  Trophy,'
);
code = code.replace(
  '  ShieldCheck,\r\n  Sparkles,\r\n  Trophy,',
  '  ShieldCheck,\r\n  Layers,\r\n  Trophy,'
);

// 2. Tab 1: Replace Sparkles with Layers and simplify title
code = code.replace(
  /<Sparkles size={16} \/>\s*<span>كافة النتائج والمراجعات<\/span>/,
  '<Layers size={16} />\n          <span>كل التجارب والنتائج</span>'
);

// 3. Tab 2: Simplify title
code = code.replace(
  '<span>حالات وتحولات سريرية موثقة</span>',
  '<span>صور قبل وبعد</span>'
);

// 4. Tab 3: Simplify title
code = code.replace(
  '<span>رسائل وآراء مراجعي المركز (WhatsApp)</span>',
  '<span>رسائل واتساب</span>'
);

// 5. Block 1 Title & Subtitle
code = code.replace(
  '<h3 className="block-title">دراسات حالات التحول السريرية (Before & After)</h3>',
  '<h3 className="block-title">تجارب وصور قبل وبعد</h3>'
);

code = code.replace(
  'حالات واقعية موثقة بفحوصات الـ InBody والملفات الطبية بالمركز — انقر على أي حالة لمعاينة صور التحول والتقرير السريري الكامل.',
  'حالات حقيقية موثقة من داخل المركز — اضغطي على أي صورة لمشاهدة نتيجة التحول كاملة.'
);

// 6. Card hover and CTA text
code = code.replace(
  '<span>معاينة صور التحول والتقرير</span>',
  '<span>معاينة الصور والنتيجة</span>'
);

code = code.replace(
  '<span>عرض التقرير السريري</span>',
  '<span>عرض التجربة كاملة</span>'
);

// 7. Block 2 WhatsApp Title & Subtitle
code = code.replace(
  '<h3 className="block-title">نبض ورسائل مراجعي دكتورة رنا (WhatsApp)</h3>',
  '<h3 className="block-title">رسائل المرضى على واتساب</h3>'
);

code = code.replace(
  'مقتطفات ومحادثات واتساب حقيقية لمرضى يشاركون فرحتهم بالنتائج والامتنان لاهتمام دكتورة رنا وفريق العمل بالمركز.',
  'محادثات ورسائل حقيقية من مرضانا بعد ما شافوا النتيجة وفرحتهم بتغيير صحتهم ومتابعة دكتورة رنا.'
);

// 8. Modal badge
code = code.replace(
  '<span>تقرير دراسة حالة سريرية معتمد</span>',
  '<span>قصة نجاح موثقة بالمركز</span>'
);

// 9. Bottom CTA banner
code = code.replace(
  '<Sparkles size={14} />\n            <span>قصة نجاحكِ تبدأ اليوم</span>',
  '<CheckCircle2 size={14} />\n            <span>قصة نجاحكِ تبدأ اليوم</span>'
);
code = code.replace(
  '<Sparkles size={14} />\r\n            <span>قصة نجاحكِ تبدأ اليوم</span>',
  '<CheckCircle2 size={14} />\r\n            <span>قصة نجاحكِ تبدأ اليوم</span>'
);

code = code.replace(
  '<h3 className="scb-title">مستعدة لتكوني قصة التحول القادمة؟</h3>',
  '<h3 className="scb-title">جاهزة تبدأي رحلتك وتكوني قصة النجاح الجاية؟</h3>'
);

code = code.replace(
  'جلسة تقييم شاملة تتضمن فحص InBody وتحديد أهدافكِ الصحية مع د. رنا ياسر الشوري بمقر المركز.',
  'خطوة واحدة تبدأ بزيارة واستشارة في العيادة وفحص InBody دقيق مع د. رنا.'
);

// Modal footer sparkles
code = code.replace(
  '<Sparkles size={14} />',
  '<CheckCircle2 size={14} />'
);

fs.writeFileSync(filePath, code, 'utf8');
console.log('SuccessStoriesSection.tsx simplified successfully!');
