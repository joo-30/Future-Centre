import mongoose, { Schema } from 'mongoose';
import { schemaOptions } from './options.js';

export interface StoryDocument {
  _id: mongoose.Types.ObjectId;
  name: string;
  title: string;
  age?: number;
  category: string;
  weightLostKg: number;
  durationMonths?: number;
  durationText: string;
  beforeWeight?: number;
  afterWeight?: number;
  programTitle: string;
  quote: string;
  details?: string;
  imageUrl?: string;
  detailsImageUrl?: string;
  additionalImages?: string[];
  storyType?: 'transformation' | 'review';
  verified?: boolean;
  featured: boolean;
  published: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const storySchema = new Schema<StoryDocument>(
  {
    name: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    age: { type: Number },
    category: { type: String, required: true, trim: true },
    weightLostKg: { type: Number, required: true },
    durationMonths: { type: Number },
    durationText: { type: String, required: true, trim: true },
    beforeWeight: { type: Number },
    afterWeight: { type: Number },
    programTitle: { type: String, required: true, trim: true },
    quote: { type: String, required: true, trim: true },
    details: { type: String, trim: true },
    imageUrl: { type: String, trim: true },
    detailsImageUrl: { type: String, trim: true },
    additionalImages: { type: [String], default: [] },
    storyType: { type: String, enum: ['transformation', 'review'], default: 'transformation' },
    verified: { type: Boolean, default: true },
    featured: { type: Boolean, default: false },
    published: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  schemaOptions,
);

export const StoryModel = mongoose.model<StoryDocument>('Story', storySchema);

export const DEFAULT_STORIES = [
  {
    name: 'مدام ندى 32 سنة',
    age: 32,
    title: 'خسارة 27 كجم والتعافي من خمول الغدة وارتجاع المريء',
    category: 'إنقاص وزن',
    weightLostKg: 27,
    durationMonths: 5,
    durationText: '٥ أشهر',
    beforeWeight: 107,
    afterWeight: 80,
    programTitle: 'كورس التغذية العلاجية وتنظيم الأيض',
    quote: 'بدأت بوزن 107 كجم مع خمول شديد بالغدة وارتجاع مريء.. وبفضل الله وخطة دكتورة رنا وصلت لـ 80 كجم وصحتي اتحولت تماماً!',
    details: 'خطة علاجية راعت خمول الغدة الدرقية، علاج ارتجاع المريء، ونقص فيتامين D و B12 مع تنظيم الشهية وتنسيق القوام قبل وبعد.',
    imageUrl: '/stories/case_cover_nada.png',
    detailsImageUrl: '/stories/transformation_107kg.jpg',
    storyType: 'transformation' as const,
    verified: true,
    featured: true,
    published: true,
    order: 1,
  },
  {
    name: 'أستاذ سامح (42 سنة)',
    age: 42,
    title: 'نزول 14 كجم وانتظام السكر والصحة العامة',
    category: 'مقاومة الأنسولين',
    weightLostKg: 14,
    durationMonths: 3,
    durationText: '٣ أشهر',
    beforeWeight: 98.5,
    afterWeight: 86,
    programTitle: 'برنامج التغذية الإكلينيكية وضبط السكر',
    quote: 'كان وزني 98.5 كجم ومع دكتورة رنا نزلت لـ 86 كجم.. الأجمل من نزول الوزن هو انتظام السكر ونشاطي اليومي اللي رجع أحسن من الأول!',
    details: 'انخفاض الوزن بمقدار 14 كجم مع تحسن استجابة الإنسولين واستقرار قياسات السكر التراكمي دون أي هبوط بالطاقة.',
    imageUrl: '/stories/case_cover_sameh.png',
    detailsImageUrl: '/stories/transformation_sameh.jpg',
    storyType: 'transformation' as const,
    verified: true,
    featured: true,
    published: true,
    order: 2,
  },
  {
    name: 'مدام صفية (38 سنة)',
    age: 38,
    title: 'تحدي الرشاقة: نزول 15 كجم من 92 إلى 77 كجم',
    category: 'إنقاص وزن',
    weightLostKg: 15,
    durationMonths: 2,
    durationText: 'شهرين',
    beforeWeight: 92,
    afterWeight: 77,
    programTitle: 'تحدي كورس النحت والتغذية العلاجية بالعيادة',
    quote: 'كنت 92 كجم ومع دكتورة رنا وخطة المتابعة نزلت لـ 77 كجم.. الفرق في المقاسات والشكل واللبس كبير جداً بدون أي إجهاد!',
    details: 'برنامج مكثف لتنسيق القوام وتنشيط الأيض الطبيعي، نتج عنه انخفاض 15 كجم ونحت محيط الخصر وتحسن كبير في الحيوية والنشاط اليومي.',
    imageUrl: '/stories/case_cover_safia.png',
    detailsImageUrl: '/stories/transformation_safia.jpg',
    storyType: 'transformation' as const,
    verified: true,
    featured: true,
    published: true,
    order: 3,
  },
  {
    name: 'أ. نهى حمدي',
    age: 30,
    title: 'خسارة 19 كجم دهون صافي مع الحفاظ على العضلات',
    category: 'إنقاص وزن',
    weightLostKg: 19,
    durationMonths: 4,
    durationText: '٤ أشهر',
    beforeWeight: 89,
    afterWeight: 70,
    programTitle: 'برنامج التغذية العلاجية ونحت القوام',
    quote: 'عن تجربة شخصية 19 كيلو نزول بفضل الله وبدون أي انتقاص للعضلات.. دكتورة رنا كفاية ذوقها وصبرها ونصايحها اللي بتجيب من الآخر!',
    details: 'حفاظ كامل على الكتلة العضلية بنسبة 100% مع خسارة دهون صافية على جهاز الـ InBody ومقاسات مشدودة.',
    imageUrl: '/stories/review_noha_19kg.jpg',
    storyType: 'review' as const,
    verified: true,
    featured: true,
    published: true,
    order: 4,
  },
  {
    name: 'إيمان',
    age: 26,
    title: 'نزول 15 كجم بدون أي أدوية وبدون حرمان',
    category: 'تغذية',
    weightLostKg: 15,
    durationMonths: 3,
    durationText: '٣ أشهر',
    beforeWeight: 82,
    afterWeight: 67,
    programTitle: 'برنامج التغذية الطبيعية والمتابعة الدورية',
    quote: 'دكتورة رنا أكتر حد ذوق ولطيف في الدنيا.. خسيت معاها 15 كيلو بدون علاج وبدون أي حرمان، نظام مريح ومستمر.',
    details: 'تعديل السلوك الغذائي ونمط الحياة اليومي بدون أدوية أو قواطع شهية كيميائية، مع استقرار تام بالوزن.',
    imageUrl: '/stories/review_eman_15kg.jpg',
    storyType: 'review' as const,
    verified: true,
    featured: true,
    published: true,
    order: 5,
  },
  {
    name: 'متابعة أسبوعية بالعيادة',
    title: 'تحكم كامل بالشهية والتزام بالسوائل',
    category: 'تغذية',
    weightLostKg: 8,
    durationText: 'شهر ونصف',
    programTitle: 'كورس التحكم في الشهية وتنشيط الأيض',
    quote: 'شكراً جداً لاهتمامك وتقديرك يا دكتور.. أحسن وأشطر وأجمل دكتورة في الدنيا، الحمد لله الشهية مقفولة وبشرب سوائل بانتظام.',
    details: 'استجابة سريعة للبرنامج العلاجي مع راحة هضمية وتثبيط الشهية الزائدة بشكل طبيعي.',
    imageUrl: '/stories/fb_photo_5.jpg',
    storyType: 'review' as const,
    verified: true,
    featured: false,
    published: true,
    order: 6,
  },
  {
    name: 'مريضة بالمركز',
    title: 'فرق كبير في القياسات وراحة نفسية تامة',
    category: 'إنقاص وزن',
    weightLostKg: 11,
    durationText: 'شهرين',
    programTitle: 'برنامج المتابعة الإكلينيكية',
    quote: 'أنا مش متابعة بقالي كتير بس الحمد لله فرق معايا كتير والله ونزلت ما شاء الله معاها ولسه مكملة.. وهي دكتورة ما شاء الله ذوق والبنات محترمين جداً.',
    details: 'تغير ملحوظ في مقاسات الملابس وتحسن الحالة النفسية والنشاط اليومي العام.',
    imageUrl: '/stories/fb_photo_6.jpg',
    storyType: 'review' as const,
    verified: true,
    featured: false,
    published: true,
    order: 7,
  },
  {
    name: 'مريضة متابعة',
    title: 'نتيجة ممتازة وشهية متوازنة من أول أسبوعين',
    category: 'تغذية',
    weightLostKg: 6,
    durationText: 'أسبوعين',
    programTitle: 'كورس التغذية والمتابعة السريرية',
    quote: 'النهارده كانت تاني متابعة ليا بسم الله ما شاء الله والله نتيجة كويسة جداً.. ربنا يبارك في دكتورة رنا يارب!',
    details: 'استجابة سريعة لبرنامج تنظيم الشهية الطبيعي وتنشيط الأيض من أول أسبوعين.',
    imageUrl: '/stories/fb_photo_7.jpg',
    storyType: 'review' as const,
    verified: true,
    featured: false,
    published: true,
    order: 8,
  },
  {
    name: 'توصيات وإشادات المراجعين',
    title: 'إشادة جماعية بتعامل المركز والنتائج الملموسة',
    category: 'صحة المرأة',
    weightLostKg: 12,
    durationText: 'توصية موثقة',
    programTitle: 'خدمات المتابعة بالعيادة',
    quote: 'ممتازة وعن تجربة أشطر دكتورة بجد وربنا يباركلها.. دكتورة شاطرة جداً وذوق وبتشرح كل خطوة بالتفصيل، فرق واضح في المقاسات والنشاط العام.',
    details: 'توصيات وإشادات موثقة من مراجعي العيادة عن تجربة المتابعة والالتزام بالخطة العلاجية.',
    imageUrl: '/stories/review_group_recommendation.jpg',
    storyType: 'review' as const,
    verified: true,
    featured: false,
    published: true,
    order: 9,
  },
];

export async function ensureDefaultStories(): Promise<void> {
  const count = await StoryModel.countDocuments();
  if (count === 0) {
    await StoryModel.insertMany(DEFAULT_STORIES);
  } else {
    // If stories exist but don't have the new brand covers or have old duplicates, re-seed
    const first = await StoryModel.findOne();
    if (first && (!first.imageUrl || !first.imageUrl.includes('case_cover_') || count < 9)) {
      await StoryModel.deleteMany({});
      await StoryModel.insertMany(DEFAULT_STORIES);
    }
  }
}
