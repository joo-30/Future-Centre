import { Appointment } from './models/appointment.model.js';
import { ArticleModel } from './models/article.model.js';
import { Clinic } from './models/clinic.model.js';
import { ServiceModel } from './models/service.model.js';
export async function seed() {
  const isTest = process.env.NODE_ENV === 'test';
  const defaultHours = isTest
    ? Array.from({ length: 7 }, (_, i) => ({
        weekday: i + 1,
        open: i !== 4,
        start: '10:00',
        end: '18:00',
        breaks: [{ start: '14:00', end: '14:30' }],
      }))
    : [
        { weekday: 1, open: true, start: '13:00', end: '20:00', breaks: [] },
        { weekday: 2, open: true, start: '13:00', end: '20:00', breaks: [] },
        { weekday: 3, open: true, start: '13:00', end: '20:00', breaks: [] },
        { weekday: 4, open: true, start: '13:00', end: '20:00', breaks: [] },
        { weekday: 5, open: false, start: '13:00', end: '20:00', breaks: [] },
        { weekday: 6, open: false, start: '13:00', end: '20:00', breaks: [] },
        { weekday: 7, open: false, start: '13:00', end: '20:00', breaks: [] },
      ];
  if (isTest) {
    await Clinic.updateOne(
      { key: 'main' },
      {
        $setOnInsert: {
          key: 'main',
          name: 'مركز المستقبل',
          subtitle: 'للتغذية والتخسيس',
          phones: ['01041504201', '01041507409'],
          whatsapp: '201041504201',
          address: 'كفر الزيات، شارع الجيش عند توكيل أورنج',
          city: 'كفر الزيات',
          timezone: 'Africa/Cairo',
          demoSchedule: true,
          demoPrices: true,
          revision: 0,
          blocks: [],
          hours: defaultHours,
        },
      },
      { upsert: true },
    );
  } else {
    await Clinic.updateOne(
      { key: 'main' },
      {
        $setOnInsert: {
          key: 'main',
          name: 'مركز المستقبل',
          subtitle: 'للتغذية والتخسيس',
          phones: ['01041504201', '01041507409'],
          whatsapp: '201041504201',
          address: 'كفر الزيات، شارع الجيش عند توكيل أورنج',
          city: 'كفر الزيات',
          timezone: 'Africa/Cairo',
          demoPrices: true,
          revision: 0,
          blocks: [],
        },
        $set: {
          hours: defaultHours,
          demoSchedule: false,
        },
      },
      { upsert: true },
    );
  }
  const services = [
    {
      id: 'nutrition',
      slug: 'nutrition-consultation',
      title: 'كشف واستشارة بالعيادة (حضور شخصي)',
      description: 'كشف وتقييم سريري شامل مع الدكتورة بمقر العيادة لتحديد خطتك الصحية.',
      price: 450,
      duration: 30,
      sessions: 1,
      period: 'جلسة كشف بالعيادة',
      icon: 'leaf',
      featured: false,
      includes: [
        'كشف وتقييم سريري شامل بمقر المركز',
        'قياس الوزن ومكونات الجسم ومناقشة الأهداف',
        'تحديد الخطة المناسبة والنظام الغذائي الملائم',
      ],
      body: [
        'الزيارة تتم شخصيًا بمقر مركز المستقبل (كفر الزيات، شارع الجيش عند توكيل أورنج).',
        'خلال الكشف توضح الدكتورة طبيعة المتابعة المناسبة لك وتفاصيلها. يمكنك إحضار أي تحاليل أو فحوصات سابقة لمناقشتها في الزيارة.',
      ],
    },
    {
      id: 'monthly',
      slug: 'monthly-follow-up',
      title: 'برنامج متابعة شهرية بالعيادة',
      description: 'خطة شخصية متكاملة و٤ زيارات دورية بمقر المركز لدعمك أسبوعيًا.',
      price: 1200,
      duration: 30,
      sessions: 4,
      period: 'شهر واحد (٤ جلسات)',
      icon: 'heart',
      featured: true,
      includes: [
        'خطة متابعة غذائية مفصلة تناسب تفاصيل يومك',
        '٤ زيارات متابعة وفحص دوري بمقر المركز',
        'مراجعة مستمرة للقياسات والنتائج مع الدكتورة',
      ],
      body: [
        'جلسات المتابعة تعقد أسبوعيًا بمقر العيادة لمراجعة التطور وتعديل النظام حسب استجابتك.',
        'أرسلي طلب البرنامج، وسيتواصل المركز لتوضيح التفاصيل واعتماد الاشتراك. إرسال الطلب لا يفعّل اشتراكًا ولا يتضمن دفعًا إلكترونيًا.',
      ],
    },
    {
      id: 'women',
      slug: 'women-nutrition',
      title: 'تغذية المرأة ورعاية الحمل بالعيادة',
      description: 'رعاية غذائية تخصصية لحالات الحمل، الرضاعة، وتكيسات المبايض بمقر المركز.',
      price: 500,
      duration: 45,
      sessions: 1,
      period: 'جلسة فردية تخصصية',
      icon: 'shield',
      featured: false,
      includes: [
        'جلسة كشف وتقييم للاحتياجات الهرمونية والغذائية',
        'فهم روتينك وتغذيتك في مراحل المرأة المختلفة',
        'وضع خطة متابعة آمنة ومناسبة لصحتك بمقر المركز',
      ],
      body: [
        'تختلف الاحتياجات من شخص لآخر. يحدد المركز طبيعة الرعاية بعد التعرف إليك في الكشف بالعيادة.',
        'إذا كان لديك تقارير طبية أو خطة متابعة حالية، يرجى إحضارها معك خلال الزيارة. لا ترسلي معلومات طبية حساسة في نموذج الحجز العام.',
      ],
    },
  ];
  for (const s of services)
    await ServiceModel.updateOne({ id: s.id }, { $set: s }, { upsert: true });

  await Appointment.updateMany(
    { serviceTitle: 'استشارة تغذية' },
    { $set: { serviceTitle: 'كشف واستشارة بالعيادة (حضور شخصي)' } },
  );
  await Appointment.updateMany(
    { serviceTitle: 'برنامج متابعة شهرية' },
    { $set: { serviceTitle: 'برنامج متابعة شهرية بالعيادة' } },
  );
  await Appointment.updateMany(
    { serviceTitle: 'تغذية المرأة' },
    { $set: { serviceTitle: 'تغذية المرأة ورعاية الحمل بالعيادة' } },
  );
  const articles = [
    {
      slug: 'first-consultation',
      title: 'كيف تستعدين لأول استشارة؟',
      category: 'رحلتك معنا',
      minutes: 3,
      image: 'consultation.png',
      intro: 'بداية هادئة وخطوات تساعدك على الاستفادة من وقت الزيارة.',
      body: [
        'اكتبي الأسئلة التي ترغبين في مناقشتها مع المركز، وحددي ما تتوقعينه من المتابعة.',
        'فكري في شكل يومك: أوقات العمل والراحة والوجبات وما تجدينه سهلًا أو صعبًا. الهدف هو وصف واقعك، وليس تقديم يوم مثالي.',
        'راجعي موعدك وطريقة الوصول. وإذا احتجت إلى تغيير الوقت، استخدمي رابط المتابعة الخاص أو تواصلي مع المركز.',
      ],
    },
    {
      slug: 'meal-planning',
      title: 'خطوات صغيرة لتنظيم وجباتك',
      category: 'تنظيم اليوم',
      minutes: 3,
      image: 'food-editorial.png',
      intro: 'التنظيم يبدأ بمعرفة يومك، ثم اختيار خطوات قابلة للتكرار.',
      body: [
        'اكتبي الأوقات التي يتاح لك فيها تحضير الطعام، والأيام التي يكون جدولك فيها أكثر انشغالًا.',
        'جهزي قائمة بما تحتاجينه قبل التسوق لتقليل القرارات المتكررة خلال الأسبوع.',
        'ناقشي مع المختصة الخيارات التي تناسب احتياجاتك. هذه الأفكار للتنظيم العام، وليست خطة علاجية أو بديلًا للاستشارة.',
      ],
    },
    {
      slug: 'your-personal-plan',
      title: 'لماذا تبدأ الخطة بفهم يومك؟',
      category: 'رعاية شخصية',
      minutes: 3,
      image: 'hero-sculpture.png',
      intro: 'لكل شخص احتياجات مختلفة، لذلك يكون الحوار هو الخطوة الأولى.',
      body: [
        'روتين يومك وأولوياتك وتفضيلاتك جزء من الحوار مع المختصة. من المفيد التحدث عنها بوضوح.',
        'يمكنك مناقشة الخطوات التي جربتها من قبل، وما جعل الاستمرار فيها صعبًا، دون الحكم على نفسك.',
        'تحدَّد تفاصيل البرنامج ومدته ومواعيد المتابعة بالاتفاق مع المركز بعد الاستشارة.',
      ],
    },
  ];
  for (const a of articles)
    await ArticleModel.updateOne({ slug: a.slug }, { $setOnInsert: a }, { upsert: true });
}
