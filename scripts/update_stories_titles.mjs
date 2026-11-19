import fs from 'fs';

const file = 'client/src/features/home/components/SuccessStoriesSection.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Section aria-label
content = content.replace('aria-label="قصص وتجارب النجاح"', 'aria-label="رحلات التحول والأثر الصحي"');

// 2. Kicker
content = content.replace('<span>قصص وتجارب واقعية موثقة</span>', '<span>رحلات تحول موثقة إكلينيكياً</span>');

// 3. Subtitle
content = content.replace(
  'قصص ونتائج حقيقية لمرضى بدأوا رحلتهم مع دكتورة رنا، ووصلوا لوزنهم المثالي وصحتهم الأفضل بدون حرمان.',
  'توثيق دقيق لنتائج مراجعي مركز المستقبل بإشراف د. رنا الشورى، نحو صحة مستدامة ووزن مثالي بدون حرمان.'
);

// 4. Tabs
content = content.replace('<span>كل التجارب والنتائج</span>', '<span>كل التحولات والنتائج</span>');
content = content.replace('<span>صور قبل وبعد</span>', '<span>دراسات الحالات والنتائج</span>');
content = content.replace('<span>آراء العملاء</span>', '<span>انطباعات المراجِعات</span>');

// 5. Transformations block title
content = content.replace(
  '<h3 className="block-title">تجارب وصور قبل وبعد</h3>',
  '<h3 className="block-title">دراسات التحول والنتائج الإكلينيكية</h3>'
);
content = content.replace(
  'حالات حقيقية وثقت نتائجها بالمركز — اضغطي على أي كارت لمشاهدة الصور والنتيجة كاملة.',
  'حالات واقعية موثقة بالقياسات الإكلينيكية — اضغطي على أي بطاقة لمشاهدة تفاصيل النتيجة كاملة.'
);

// 6. Card footer button
content = content.replace('<span>عرض التجربة كاملة</span>', '<span>استعراض دراسة الحالة</span>');

// 7. Reviews block title
content = content.replace('<h3 className="block-title">آراء بعض عملائنا</h3>', '<h3 className="block-title">انطباعات ورسائل المراجعات</h3>');
content = content.replace(
  'رسائل وتجارب حقيقية موثقة من عملاء ومراجعي المركز وفرحتهم بالنتيجة مع دكتورة رنا.',
  'رسائل وانطباعات حقيقية موثقة من مراجعي المركز بعد الوصول للوزن المثالي وتحسن المؤشرات الحيوية.'
);

fs.writeFileSync(file, content, 'utf8');
console.log('Successfully updated SuccessStoriesSection.tsx');
