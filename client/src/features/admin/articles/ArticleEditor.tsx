import { resolveArticleImage, type Article } from '@future/shared';
import {
  Check,
  CheckCircle2,
  ExternalLink,
  EyeOff,
  Globe,
  Image as ImageIcon,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '../../../components/ui';
import { adminApi } from '../../../lib/portal-api';
import { Notice } from '../components/Notice';
import { readFormLines, readFormNumber, readFormText } from '../lib/form-data';

const PRESET_IMAGES = [
  {
    id: 'food-editorial.png',
    title: 'تغذية علاجية وأطباق',
    subtitle: 'أطباق طعام صحية ومدروسة',
    preview: '/assets/food-editorial.png',
  },
  {
    id: 'consultation.png',
    title: 'استشارة سريرية ومتابعة',
    subtitle: 'جلسة كشف ومتابعة المريض بالمركز',
    preview: '/assets/consultation.png',
  },
  {
    id: 'hero-sculpture.png',
    title: 'هوية المركز الرمزية',
    subtitle: 'طبيعة وتوازن ونمط حياة مستدام',
    preview: '/assets/hero-sculpture.png',
  },
  {
    id: 'dr-rana.jpg',
    title: 'إشراف د. رنا ياسر',
    subtitle: 'صورة المدير الطبي والفريق المتخصص',
    preview: '/assets/dr-rana.jpg',
  },
];

export function ArticleEditor({ article: a, onSaved }: { article: Article; onSaved: () => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const isInitialCustom = Boolean(a.image && !PRESET_IMAGES.some((p) => p.id === a.image));
  const [imageTab, setImageTab] = useState<'preset' | 'custom'>(isInitialCustom ? 'custom' : 'preset');
  const [selectedPreset, setSelectedPreset] = useState(
    PRESET_IMAGES.some((p) => p.id === a.image) ? a.image : 'food-editorial.png',
  );
  const [customUrl, setCustomUrl] = useState(isInitialCustom ? a.image : '');
  const [published, setPublished] = useState(a.published !== false);
  const [slug, setSlug] = useState(a.slug || '');
  const [title, setTitle] = useState(a.title || '');

  const currentImage = imageTab === 'preset' ? selectedPreset : customUrl.trim() || 'food-editorial.png';

  function onTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setTitle(val);
    if (!a.slug && (!slug || slug.startsWith('article-'))) {
      const latin = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      if (latin) {
        setSlug(latin);
      }
    }
  }

  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true);
    setError('');

    try {
      const finalSlug = (
        a.slug ||
        slug.trim() ||
        title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '') ||
        `article-${Date.now().toString().slice(-6)}`
      ).toLowerCase();

      const finalImage = currentImage;

      await adminApi.saveArticle({
        slug: finalSlug,
        title: readFormText(f, 'title') || title,
        category: readFormText(f, 'category'),
        minutes: readFormNumber(f, 'minutes'),
        image: finalImage,
        intro: readFormText(f, 'intro'),
        body: readFormLines(f, 'body'),
        published,
      });

      onSaved();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="art-editor-form" onSubmit={(e) => void save(e)}>
      <fieldset disabled={busy}>
        {/* Publication Status Selector */}
        <div className="art-form-field">
          <span className="art-field-label">حالة النشر على الموقع</span>
          <div className="art-pub-toggle-grid">
            <button
              type="button"
              className={`art-pub-card ${published ? 'active-pub' : ''}`}
              onClick={() => setPublished(true)}
            >
              <div className="pub-card-top">
                <div className="pub-card-indicator pub">
                  <Globe size={18} />
                  <span>منشور على الموقع (Public)</span>
                </div>
                {published && <CheckCircle2 size={18} className="pub-check pub" />}
              </div>
              <p>يظهر فوراً لجميع الزوار والمراجعين في صفحة المقالات والصفحة الرئيسية.</p>
            </button>
            <button
              type="button"
              className={`art-pub-card ${!published ? 'active-draft' : ''}`}
              onClick={() => setPublished(false)}
            >
              <div className="pub-card-top">
                <div className="pub-card-indicator draft">
                  <EyeOff size={18} />
                  <span>مسودة خاصة (Draft)</span>
                </div>
                {!published && <CheckCircle2 size={18} className="pub-check draft" />}
              </div>
              <p>محفوظ في لوحة التحكم فقط. لن يتمكن أي زائر من رؤيته حتى تقوم بنشره.</p>
            </button>
          </div>
        </div>

        {/* Slug input for new articles */}
        {!a.slug && (
          <label className="art-form-field">
            <span className="art-field-label">
              رابط المقال بالإنجليزية (Slug)
              <span className="art-field-optional"> — يتولد تلقائياً إن تركته فارغاً</span>
            </span>
            <input
              name="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
              placeholder="مثال: healthy-habits أو nutrition-guide"
              dir="ltr"
              className="art-input"
            />
            <span className="art-field-hint">
              رابط الوصول: <code>/articles/{slug || 'healthy-habits'}</code>
            </span>
          </label>
        )}

        {/* Title */}
        <label className="art-form-field">
          <span className="art-field-label">عنوان المقال</span>
          <input
            name="title"
            value={title}
            onChange={onTitleChange}
            required
            minLength={3}
            maxLength={160}
            placeholder="اكتبي عنواناً جذاباً ومفيداً للمراجعين..."
            className="art-input font-medium"
          />
        </label>

        {/* Category & Minutes */}
        <div className="art-two-cols">
          <label className="art-form-field">
            <span className="art-field-label">التصنيف</span>
            <input
              name="category"
              defaultValue={a.category}
              required
              maxLength={80}
              placeholder="مثال: نصائح التغذية، رحلتك معنا، تنظيم اليوم"
              className="art-input"
            />
          </label>
          <label className="art-form-field">
            <span className="art-field-label">دقائق القراءة التقديرية</span>
            <input
              name="minutes"
              type="number"
              min={1}
              max={90}
              defaultValue={a.minutes}
              required
              className="art-input"
            />
          </label>
        </div>

        {/* Visual Image Selector */}
        <div className="art-form-field">
          <div className="art-img-header">
            <span className="art-field-label">صورة غلاف المقال</span>
            <div className="art-img-tabs">
              <button
                type="button"
                className={`art-tab-btn ${imageTab === 'preset' ? 'active' : ''}`}
                onClick={() => setImageTab('preset')}
              >
                <ImageIcon size={15} />
                مكتبة المركز
              </button>
              <button
                type="button"
                className={`art-tab-btn ${imageTab === 'custom' ? 'active' : ''}`}
                onClick={() => setImageTab('custom')}
              >
                <ExternalLink size={15} />
                رابط أو ملف مخصص
              </button>
            </div>
          </div>

          {imageTab === 'preset' ? (
            <div className="art-preset-grid">
              {PRESET_IMAGES.map((preset) => {
                const isSelected = selectedPreset === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    className={`art-preset-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => setSelectedPreset(preset.id)}
                  >
                    <div className="art-preset-thumb-wrap">
                      <img src={preset.preview} alt={preset.title} className="art-preset-thumb" />
                      {isSelected && (
                        <span className="art-preset-badge">
                          <Check size={13} />
                          مختارة
                        </span>
                      )}
                    </div>
                    <div className="art-preset-info">
                      <span className="art-preset-title">{preset.title}</span>
                      <span className="art-preset-desc">{preset.subtitle}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="art-custom-input-wrap">
              <p className="art-custom-hint">
                أدخلي رابط صورة خارجي موثوق (PNG, JPG, WEBP) أو اسم ملف داخل مجلد أصول المركز:
              </p>
              <input
                type="text"
                dir="ltr"
                className="art-input art-custom-input"
                placeholder="https://example.com/image.jpg أو dr-rana.jpg"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
              />
            </div>
          )}

          {/* Active Image Live Preview */}
          <div className="art-live-preview-box">
            <div className="art-live-preview-thumb">
              <img
                src={resolveArticleImage(currentImage)}
                alt="معاينة غلاف المقال"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/assets/food-editorial.png';
                }}
              />
            </div>
            <div className="art-live-preview-details">
              <div className="art-live-preview-status">
                <CheckCircle2 size={14} />
                <span>المعاينة الحية للغلاف المعتمد</span>
              </div>
              <span className="art-live-preview-val" dir="ltr">
                {currentImage}
              </span>
              <span className="art-live-preview-note">
                تظهر هذه الصورة كواجهة للمقال في صفحة المقالات والصفحة الرئيسية وبداية القراءة.
              </span>
            </div>
          </div>
        </div>

        {/* Intro */}
        <label className="art-form-field">
          <span className="art-field-label">مقدمة المقال (الموجز)</span>
          <textarea
            name="intro"
            defaultValue={a.intro}
            minLength={5}
            maxLength={1000}
            required
            rows={3}
            placeholder="موجز سريع يلخص فكرة المقال ويشجع على قراءته..."
            className="art-input art-textarea"
          />
        </label>

        {/* Content */}
        <label className="art-form-field">
          <span className="art-field-label">
            محتوى المقال
            <span className="art-field-optional"> — كل فقرة في سطر مستقل</span>
          </span>
          <textarea
            name="body"
            defaultValue={a.body.join('\n\n')}
            rows={8}
            required
            placeholder="اكتبي نص المقال هنا. كل فقرة في سطر مستقل..."
            className="art-input art-textarea"
          />
        </label>

        <Notice message={error} error />

        {/* Footer Actions */}
        <div className="art-modal-actions">
          <Button disabled={busy} icon={false}>
            {busy ? 'جاري الحفظ...' : a.slug ? 'حفظ التعديلات' : 'نشر وإضافة المقال'}
          </Button>
        </div>
      </fieldset>
    </form>
  );
}
