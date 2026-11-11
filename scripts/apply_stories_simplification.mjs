import fs from 'node:fs';

const filePath = 'Future-Centre/client/src/features/home/components/SuccessStoriesSection.tsx';
let code = fs.readFileSync(filePath, 'utf8');

// 1. Update imports: replace Sparkles with Activity, Layers
code = code.replace(/Sparkles,/g, 'Activity,\n  Layers,');

// 2. Section header subtitle
code = code.replace(
  'نفتخر بكل بطل بدأ رحلته معنا؛ صور وتحولات سريرية موثقة بالـ InBody وآراء حقيقية من داخل مركز المستقبل تحت إشراف د. رنا ياسر الشوري.',
  'قصص ونتائج حقيقية لمرضى بدأوا رحلتهم مع دكتورة رنا، ووصلوا لوزنهم المثالي وصحتهم الأفضل بدون حرمان.'
);

// 3. Tabs: Tab 1 Sparkles -> Layers & simpler text
code = code.replace(
  /<Sparkles size={16} \/>\s*<span>كافة النتائج والمراجعات<\/span>/,
  '<Layers size={16} />\n          <span>كل التجارب والنتائج</span>'
);

// Tab 2 text
code = code.replace(
  '<span>حالات وتحولات سريرية موثقة</span>',
  '<span>صور قبل وبعد</span>'
);

// Tab 3 text
code = code.replace(
  '<span>رسائل وآراء مراجعي المركز (WhatsApp)</span>',
  '<span>رسائل واتساب</span>'
);

// 4. Block 1 (Transformations) Head
code = code.replace(
  '<h3 className="block-title">دراسات حالات التحول السريرية (Before & After)</h3>',
  '<h3 className="block-title">تجارب وصور قبل وبعد</h3>'
);

code = code.replace(
  'حالات واقعية موثقة بفحوصات الـ InBody والملفات الطبية بالمركز — انقر على أي حالة لمعاينة صور التحول والتقرير السريري الكامل.',
  'حالات حقيقية وثقت نتائجها بالمركز — اضغطي على أي كارت لمشاهدة الصور والنتيجة كاملة.'
);

// 5. Card text
code = code.replace(
  '<span>معاينة صور التحول والتقرير</span>',
  '<span>معاينة الصور والنتيجة</span>'
);

code = code.replace(
  '<span>عرض التقرير السريري</span>',
  '<span>عرض التجربة كاملة</span>'
);

// 6. Block 2 (WhatsApp) Head
code = code.replace(
  '<h3 className="block-title">نبض ورسائل مراجعي دكتورة رنا (WhatsApp)</h3>',
  '<h3 className="block-title">رسائل المرضى على واتساب</h3>'
);

code = code.replace(
  'مقتطفات ومحادثات واتساب حقيقية لمرضى يشاركون فرحتهم بالنتائج والامتنان لاهتمام دكتورة رنا وفريق العمل بالمركز.',
  'رسائل ومحادثات حقيقية من مراجعي المركز وفرحتهم بالنتيجة ومتابعة دكتورة رنا.'
);

// 7. Bottom CTA banner
code = code.replace(
  /<Sparkles size={14} \/>\s*<span>قصة نجاحكِ تبدأ اليوم<\/span>/,
  '<CheckCircle2 size={14} />\n            <span>قصة نجاحكِ تبدأ اليوم</span>'
);

code = code.replace(
  '<h3 className="scb-title">مستعدة لتكوني قصة التحول القادمة؟</h3>',
  '<h3 className="scb-title">جاهزة تبدأي رحلتك وتكوني قصة النجاح الجاية؟</h3>'
);

code = code.replace(
  'جلسة تقييم شاملة تتضمن فحص InBody وتحديد أهدافكِ الصحية مع د. رنا ياسر الشوري بمقر المركز.',
  'خطوة واحدة تبدأ بزيارة واستشارة في العيادة وفحص InBody دقيق وخطة تغذية تناسب جسمك مع د. رنا.'
);

// 8. Modal details
code = code.replace(
  '<span>تقرير دراسة حالة سريرية معتمد</span>',
  '<span>قصة نجاح موثقة بالمركز</span>'
);

code = code.replace(
  '<span>تكبير الصورة السريرية</span>',
  '<span>تكبير الصورة</span>'
);

code = code.replace(
  'الصورة من التوثيق السريري المعتمد بالمركز تحت إشراف د. رنا ياسر',
  'صورة حقيقية موثقة من داخل العيادة بموافقة الحالة'
);

code = code.replace(
  'فحوصات وصور سريرية إضافية',
  'صور وفحوصات إضافية'
);

code = code.replace(
  /<Sparkles size={14} \/>\s*<span>البرنامج والخطة العلاجية<\/span>/,
  '<Activity size={14} />\n                    <span>البرنامج وخطة التغذية</span>'
);

code = code.replace(
  '<span>تفاصيل التطور السريري والحالة الصحية</span>',
  '<span>تفاصيل المتابعة والحالة الصحية</span>'
);

code = code.replace(
  'إغلاق التقرير',
  'إغلاق'
);

fs.writeFileSync(filePath, code, 'utf8');
console.log('SuccessStoriesSection.tsx updated successfully!');
