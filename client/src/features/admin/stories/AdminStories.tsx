import type { SuccessStory } from '@future/shared';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Activity,
  Award,
  Check,
  Eye,
  EyeOff,
  Flame,
  Heart,
  ImageIcon,
  Layers,
  Pencil,
  Plus,
  Search,
  Trash2,
  Trophy,
  Upload,
  Utensils,
  X,
} from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { Button, ErrorState, Loading, Modal } from '../../../components/ui';
import { adminApi } from '../../../lib/portal-api';
import { ConsoleTitle } from '../components/ConsoleTitle';
import { Notice } from '../components/Notice';

// 4 Modern Core Clinical Categories requested by user
const CLINICAL_CATEGORIES = [
  {
    id: 'إنقاص وزن',
    title: 'إنقاص وزن',
    desc: 'نزول دهون ونحت القوام',
    icon: Flame,
    color: '#059669',
    bg: '#ecfdf5',
    border: '#a7f3d0',
  },
  {
    id: 'مقاومة الأنسولين',
    title: 'مقاومة الأنسولين',
    desc: 'تنظيم الأيض والسكر التراكمي',
    icon: Activity,
    color: '#0284c7',
    bg: '#f0f9ff',
    border: '#bae6fd',
  },
  {
    id: 'تغذية',
    title: 'تغذية',
    desc: 'تغذية علاجية وصحية متكاملة',
    icon: Utensils,
    color: '#d97706',
    bg: '#fffbeb',
    border: '#fde68a',
  },
  {
    id: 'صحة المرأة',
    title: 'صحة المرأة',
    desc: 'تنظيم الهرمونات والحمل والرضاعة',
    icon: Heart,
    color: '#e11d48',
    bg: '#fff1f2',
    border: '#fecdd3',
  },
] as const;

export function AdminStories() {
  const client = useQueryClient();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [editing, setEditing] = useState<Partial<SuccessStory> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Interactive UI/UX Pro Max State for Modal
  const [category, setCategory] = useState<string>('إنقاص وزن');
  const [storyType, setStoryType] = useState<'transformation' | 'review'>('transformation');
  const [coverImageUrl, setCoverImageUrl] = useState<string>('');
  const [detailsImageUrl, setDetailsImageUrl] = useState<string>('');
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [customGalleryUrl, setCustomGalleryUrl] = useState<string>('');
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingDetails, setUploadingDetails] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [showAdvancedUrls, setShowAdvancedUrls] = useState(false);

  const coverInputRef = useRef<HTMLInputElement>(null);
  const detailsInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const storiesQuery = useQuery({
    queryKey: ['admin', 'stories'],
    queryFn: adminApi.stories,
  });

  const stories = storiesQuery.data?.stories || [];

  const categories = useMemo(() => {
    const set = new Set<string>();
    stories.forEach((s) => {
      if (s.category) set.add(s.category);
    });
    return Array.from(set);
  }, [stories]);

  const filteredStories = useMemo(() => {
    return stories.filter((s) => {
      const matchSearch =
        !search ||
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.title.toLowerCase().includes(search.toLowerCase()) ||
        s.quote.toLowerCase().includes(search.toLowerCase());
      const matchCat = categoryFilter === 'all' || s.category === categoryFilter;
      return matchSearch && matchCat;
    });
  }, [stories, search, categoryFilter]);

  const handleOpenEdit = (story: Partial<SuccessStory>, isCreating = false) => {
    setIsNew(isCreating);
    setEditing(story);
    setCategory(story.category || 'إنقاص وزن');
    setStoryType(story.storyType || 'transformation');
    setCoverImageUrl(story.imageUrl || '');
    setDetailsImageUrl(story.detailsImageUrl || '');
    setGalleryImages(Array.isArray(story.additionalImages) ? [...story.additionalImages] : []);
    setCustomGalleryUrl('');
    setShowAdvancedUrls(false);
    setError('');
    setMessage('');
  };

  const handleTogglePublish = async (s: SuccessStory) => {
    try {
      await adminApi.saveStory({ id: s.id, published: !s.published });
      await client.invalidateQueries({ queryKey: ['admin', 'stories'] });
      await client.invalidateQueries({ queryKey: ['public', 'stories'] });
      setMessage(s.published ? 'تم تحويل القصة إلى مسودة.' : 'تم نشر القصة على الموقع العام بنجاح.');
    } catch (err) {
      setError((err as Error).message || 'تعذر تعديل حالة النشر.');
    }
  };

  const handleToggleFeatured = async (s: SuccessStory) => {
    try {
      await adminApi.saveStory({ id: s.id, featured: !s.featured });
      await client.invalidateQueries({ queryKey: ['admin', 'stories'] });
      await client.invalidateQueries({ queryKey: ['public', 'stories'] });
      setMessage(s.featured ? 'تمت إزالة القصة من صدارة المعرض وإعادتها للترتيب العادي.' : 'تم تثبيت القصة في صدارة المعرض لتظهر أولاً بالواجهة.');
    } catch (err) {
      setError((err as Error).message || 'تعذر تعديل حالة تثبيت القصة.');
    }
  };

  const handleDelete = async (s: SuccessStory) => {
    if (!window.confirm(`هل أنتِ متأكدة من حذف قصة "${s.name}" نهائياً؟`)) return;
    try {
      await adminApi.deleteStory(s.id);
      await client.invalidateQueries({ queryKey: ['admin', 'stories'] });
      await client.invalidateQueries({ queryKey: ['public', 'stories'] });
      setMessage('تم حذف قصة النجاح.');
    } catch (err) {
      setError((err as Error).message || 'تعذر حذف القصة.');
    }
  };

  // Upload helper using modern File API
  const uploadFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        reject(new Error('يرجى اختيار ملف صورة صالح (JPG, PNG, WebP).'));
        return;
      }
      if (file.size > 20 * 1024 * 1024) {
        reject(new Error('حجم الصورة كبير جداً، يرجى اختيار صورة أقل من 20 ميجابايت.'));
        return;
      }

      const reader = new FileReader();
      reader.onload = async (e) => {
        const dataUrl = e.target?.result as string;
        if (!dataUrl) {
          reject(new Error('تعذر قراءة بيانات ملف الصورة.'));
          return;
        }
        try {
          const res = await adminApi.uploadStoryImage(dataUrl, file.name);
          resolve(res.url);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error('حدث خطأ أثناء قراءة الصورة من جهازك.'));
      reader.readAsDataURL(file);
    });
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    setError('');
    try {
      const url = await uploadFile(file);
      setCoverImageUrl(url);
      setMessage('تم رفع صورة الغلاف بنجاح ✓');
    } catch (err) {
      setError((err as Error).message || 'تعذر رفع صورة الغلاف.');
    } finally {
      setUploadingCover(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleDetailsUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingDetails(true);
    setError('');
    try {
      const url = await uploadFile(file);
      setDetailsImageUrl(url);
      setMessage('تم رفع الصورة السريرية بنجاح ✓');
    } catch (err) {
      setError((err as Error).message || 'تعذر رفع الصورة السريرية.');
    } finally {
      setUploadingDetails(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploadingGallery(true);
    setError('');
    try {
      const uploadedUrls: string[] = [];
      for (const file of files) {
        const url = await uploadFile(file);
        uploadedUrls.push(url);
      }
      setGalleryImages((prev) => [...prev, ...uploadedUrls]);
      setMessage(`تم رفع ${uploadedUrls.length} صورة إلى المعرض بنجاح ✓`);
    } catch (err) {
      setError((err as Error).message || 'تعذر رفع بعض صور المعرض.');
    } finally {
      setUploadingGallery(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleAddCustomGalleryUrl = () => {
    const trimmed = customGalleryUrl.trim();
    if (!trimmed) return;
    setGalleryImages((prev) => [...prev, trimmed]);
    setCustomGalleryUrl('');
    setMessage('تمت إضافة رابط الصورة إلى المعرض.');
  };

  const handleRemoveGalleryImage = (index: number) => {
    setGalleryImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editing) return;
    setBusy(true);
    setError('');

    const form = new FormData(e.currentTarget);
    const payload: Partial<SuccessStory> & { id?: string } = {
      id: isNew ? undefined : editing.id,
      name: String(form.get('name') || '').trim(),
      title: String(form.get('title') || '').trim(),
      age: form.get('age') ? Number(form.get('age')) : undefined,
      category,
      weightLostKg: Number(form.get('weightLostKg') || 0),
      durationText: String(form.get('durationText') || '').trim(),
      beforeWeight: form.get('beforeWeight') ? Number(form.get('beforeWeight')) : undefined,
      afterWeight: form.get('afterWeight') ? Number(form.get('afterWeight')) : undefined,
      programTitle: String(form.get('programTitle') || '').trim(),
      quote: String(form.get('quote') || '').trim(),
      details: String(form.get('details') || '').trim(),
      imageUrl: coverImageUrl.trim() || undefined,
      detailsImageUrl: detailsImageUrl.trim() || undefined,
      additionalImages: galleryImages,
      storyType,
      published: form.get('published') === 'on',
      featured: form.get('featured') === 'on',
      order: form.get('order') ? Number(form.get('order')) : 0,
    };

    try {
      await adminApi.saveStory(payload);
      await client.invalidateQueries({ queryKey: ['admin', 'stories'] });
      await client.invalidateQueries({ queryKey: ['public', 'stories'] });
      setMessage(isNew ? 'تمت إضافة قصة النجاح بنجاح 🚀' : 'تم تحديث بيانات قصة النجاح بنجاح ✓');
      setEditing(null);
    } catch (err) {
      setError((err as Error).message || 'تعذر حفظ بيانات القصة.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="admin-stories-page" style={{ direction: 'rtl' }}>
      <ConsoleTitle
        title="قصص وتجارب النجاح (Success Stories)"
        description="إدارة تجارب المرضى الموثقة ونشرها على الواجهة الرئيسية للموقع لتعزيز ثقة الزوار ومعدل الحجز."
      >
        <Button
          onClick={() => {
            handleOpenEdit(
              {
                name: '',
                title: '',
                category: 'إنقاص وزن',
                weightLostKg: 15,
                durationText: '٣ أشهر',
                programTitle: 'برنامج متابعة شهرية بالعيادة',
                quote: '',
                details: '',
                published: true,
                featured: false,
                order: stories.length + 1,
              },
              true
            );
          }}
          icon={false}
        >
          <Plus size={18} />
          إضافة قصة نجاح جديدة
        </Button>
      </ConsoleTitle>

      <Notice message={message} />
      <Notice message={error} error />

      {/* KPI Stats Strip */}
      <div className="console-stats stories-admin-stats">
        <div>
          <span>{stories.length}</span>
          <small>إجمالي القصص المسجلة</small>
        </div>
        <div>
          <span>{stories.filter((s) => s.published).length}</span>
          <small>منشورة على الموقع</small>
        </div>
        <div>
          <span>{stories.filter((s) => s.featured).length}</span>
          <small>قصص مميزة بالصدارة</small>
        </div>
        <div>
          <span>{categories.length}</span>
          <small>أقسام وتخصصات مختلفة</small>
        </div>
      </div>

      {/* Search & Category Pills */}
      <div className="section-search-bar-pro" style={{ marginBottom: '16px' }}>
        <div className="search-input-pill-wrap">
          <Search size={16} className="search-pill-icon" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="البحث في قصص النجاح: اسم المريض، العنوان، أو تفاصيل التجربة..."
            className="search-pill-input"
            aria-label="البحث في قصص النجاح"
          />
          {search && (
            <button
              type="button"
              className="search-pill-clear"
              onClick={() => setSearch('')}
              title="مسح البحث"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="sub-filter-pills-bar" style={{ marginBottom: '18px' }}>
        <button
          type="button"
          className={`sub-filter-pill-btn ${categoryFilter === 'all' ? 'is-active' : ''}`}
          onClick={() => setCategoryFilter('all')}
        >
          <span>كافة القصص</span>
          <span className="sub-filter-count-chip">{stories.length}</span>
        </button>
        {categories.map((cat) => {
          const count = stories.filter((s) => s.category === cat).length;
          return (
            <button
              key={cat}
              type="button"
              className={`sub-filter-pill-btn ${categoryFilter === cat ? 'is-active' : ''}`}
              onClick={() => setCategoryFilter(cat)}
            >
              <span>{cat}</span>
              <span className="sub-filter-count-chip">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Stories Grid */}
      {storiesQuery.isPending ? (
        <Loading />
      ) : storiesQuery.error ? (
        <ErrorState message="تعذر تحميل قصص النجاح." onRetry={() => void storiesQuery.refetch()} />
      ) : !filteredStories.length ? (
        <div
          style={{
            padding: '40px 20px',
            textAlign: 'center',
            background: '#f8fafc',
            borderRadius: '16px',
            border: '1.5px dashed #cbd5e1',
          }}
        >
          <Trophy size={36} color="#94a3b8" style={{ margin: '0 auto 10px' }} />
          <h3 style={{ margin: '0 0 4px', fontSize: '16px', color: '#334155' }}>
            لا توجد قصص نجاح مطابقة
          </h3>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
            {search
              ? `لا توجد نتائج تطابق بحثك: "${search}"`
              : 'ابدئي بإضافة أول قصة نجاح موثقة لعيادة د. رنا.'}
          </p>
        </div>
      ) : (
        <div className="admin-request-list" style={{ width: '100%' }}>
          {filteredStories.map((s) => (
            <article key={s.id} className="subscription-card-pro" style={{ padding: '20px' }}>
              <div className="request-card-header">
                <div className="request-patient-profile">
                  <span
                    className="request-avatar-circle"
                    style={{ background: '#ecfdf5', color: '#047857' }}
                  >
                    {s.name.slice(0, 1)}
                  </span>
                  <div>
                    <div className="request-name-row">
                      <h3 className="request-patient-name">{s.name}</h3>
                      {s.age && <span className="user-type-tag is-user">{s.age} سنة</span>}
                      {s.featured && (
                        <span
                          style={{
                            fontSize: '11px',
                            color: '#b45309',
                            background: '#fef3c7',
                            padding: '2px 8px',
                            borderRadius: '6px',
                            fontWeight: 800,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px',
                          }}
                        >
                          <Award size={12} />
                          مميزة
                        </span>
                      )}
                    </div>
                    <div className="request-patient-subtags">
                      <span className="request-date-tag">
                        <Award size={12} />
                        <span>{s.category}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 10px',
                      borderRadius: '8px',
                      fontSize: '11.5px',
                      fontWeight: 800,
                      background: s.published ? '#ecfdf5' : '#f1f5f9',
                      color: s.published ? '#047857' : '#64748b',
                      border: s.published ? '1px solid #a7f3d0' : '1px solid #cbd5e1',
                    }}
                  >
                    {s.published ? <Eye size={12} /> : <EyeOff size={12} />}
                    <span>{s.published ? 'معروضة بالموقع' : 'مسودة مخفية'}</span>
                  </span>
                </div>
              </div>

              {/* Transformation Highlight Banner */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  background: '#f8fafc',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  margin: '8px 0 12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: '#fef2f2',
                      color: '#dc2626',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Flame size={16} />
                  </span>
                  <div>
                    <strong style={{ fontSize: '15px', color: '#991b1b', display: 'block' }}>
                      خسارة {s.weightLostKg} كجم
                    </strong>
                    <small style={{ fontSize: '11px', color: '#64748b' }}>
                      خلال {s.durationText}
                    </small>
                  </div>
                </div>

                {s.beforeWeight && s.afterWeight && (
                  <span style={{ fontSize: '12px', color: '#334155', fontWeight: 700 }}>
                    {s.beforeWeight} كجم ➔{' '}
                    <strong style={{ color: '#047857' }}>{s.afterWeight} كجم</strong>
                  </span>
                )}
              </div>

              {/* Title & Excerpt */}
              <div style={{ margin: '0 0 12px' }}>
                <h4
                  style={{
                    margin: '0 0 6px',
                    fontSize: '14px',
                    fontWeight: 800,
                    color: '#0f172a',
                  }}
                >
                  {s.title}
                </h4>
                <p
                  style={{
                    margin: 0,
                    fontSize: '13px',
                    lineHeight: '1.6',
                    color: '#475569',
                    fontStyle: 'italic',
                  }}
                >
                  "{s.quote}"
                </p>
                {s.details && (
                  <p
                    style={{
                      margin: '6px 0 0',
                      fontSize: '12px',
                      color: '#64748b',
                      lineHeight: 1.5,
                    }}
                  >
                    📝 <strong>ملاحظات سريرية:</strong> {s.details}
                  </p>
                )}
                {s.additionalImages && s.additionalImages.length > 0 && (
                  <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '11.5px', color: '#065f46', fontWeight: 700, background: '#f0fdf4', padding: '2px 8px', borderRadius: '6px', border: '1px solid #bbf7d0' }}>
                      📸 يتضمن {s.additionalImages.length} صور وفحوصات إضافية
                    </span>
                  </div>
                )}
              </div>

              {/* Actions Footer */}
              <div className="story-card-actions-row">
                <button
                  type="button"
                  className="btn-story-action is-primary"
                  onClick={() => handleOpenEdit(s, false)}
                  title="تعديل بيانات القصة"
                >
                  <Pencil size={14} />
                  <span>تعديل</span>
                </button>

                <button
                  type="button"
                  className="btn-story-action is-outline"
                  onClick={() => void handleTogglePublish(s)}
                  title={s.published ? 'إخفاء من الموقع' : 'نشر على الموقع'}
                >
                  {s.published ? <EyeOff size={14} /> : <Eye size={14} />}
                  <span>{s.published ? 'إخفاء' : 'نشر'}</span>
                </button>

                <button
                  type="button"
                  className={`btn-story-action is-outline ${s.featured ? 'is-featured-active' : ''}`}
                  onClick={() => void handleToggleFeatured(s)}
                  title={
                    s.featured
                      ? 'إلغاء تثبيت القصة في صدارة المعرض وإعادتها للترتيب العادي'
                      : 'تثبيت القصة في صدارة المعرض والصفحة الرئيسية'
                  }
                >
                  <Award size={14} color={s.featured ? '#059669' : '#64748b'} />
                  <span>{s.featured ? 'إلغاء التثبيت' : 'تثبيت بالصدارة'}</span>
                </button>

                <button
                  type="button"
                  className="btn-story-action is-delete"
                  onClick={() => void handleDelete(s)}
                  title="حذف القصة نهائياً"
                  aria-label="حذف قصة النجاح"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Add / Edit Story Modal (UI/UX Pro Max Edition) */}
      <Modal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title={isNew ? 'إضافة قصة تحول ونجاح جديدة' : 'تعديل قصة النجاح'}
        className="story-admin-modal"
      >
        {editing && (
          <form onSubmit={handleSaveForm} className="story-admin-form">
            {/* Hidden inputs to bridge modern interactive state */}
            <input type="hidden" name="category" value={category} />
            <input type="hidden" name="storyType" value={storyType} />
            <input type="hidden" name="imageUrl" value={coverImageUrl} />
            <input type="hidden" name="detailsImageUrl" value={detailsImageUrl} />

            {/* Hidden file inputs for direct uploads */}
            <input
              type="file"
              ref={coverInputRef}
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleCoverUpload}
            />
            <input
              type="file"
              ref={detailsInputRef}
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleDetailsUpload}
            />
            <input
              type="file"
              ref={galleryInputRef}
              accept="image/*"
              multiple
              style={{ display: 'none' }}
              onChange={handleGalleryUpload}
            />

            {/* SECTION 1: Patient Identity & Main Title */}
            <div className="story-form-card-section">
              <div className="story-form-section-head">
                <span className="story-form-section-badge">1</span>
                <div>
                  <h4 className="story-form-section-title">بيانات المريض والتوثيق الأساسي</h4>
                  <p className="story-form-section-sub">الاسم المسجل بالمركز، العمر، وعنوان الإنجاز السريري</p>
                </div>
              </div>

              <div className="story-form-row-2">
                <label className="story-form-field">
                  <span className="story-form-label">اسم المريض *</span>
                  <input
                    name="name"
                    type="text"
                    required
                    defaultValue={editing.name}
                    placeholder="مثال: مدام ندى أو أستاذ سامح"
                    className="story-form-input"
                  />
                </label>

                <label className="story-form-field">
                  <span className="story-form-label">السن (اختياري)</span>
                  <input
                    name="age"
                    type="number"
                    min="10"
                    max="120"
                    defaultValue={editing.age}
                    placeholder="مثال: 32"
                    className="story-form-input"
                  />
                </label>
              </div>

              <label className="story-form-field" style={{ marginTop: '12px' }}>
                <span className="story-form-label">عنوان قصة النجاح *</span>
                <input
                  name="title"
                  type="text"
                  required
                  defaultValue={editing.title}
                  placeholder="مثال: خسارة 27 كجم والتعافي من خمول الغدة وارتجاع المريء"
                  className="story-form-input"
                />
              </label>
            </div>

            {/* SECTION 2: Modern Interactive Category Selector */}
            <div className="story-form-card-section">
              <div className="story-form-section-head">
                <span className="story-form-section-badge">2</span>
                <div>
                  <h4 className="story-form-section-title">التصنيف السريري المعتمد</h4>
                  <p className="story-form-section-sub">اختاري القسم الطبي الدقيق لتصنيف الحالة على الموقع</p>
                </div>
              </div>

              <div className="story-category-grid-pro">
                {CLINICAL_CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      className={`story-category-card-pro ${isSelected ? 'is-selected' : ''}`}
                      onClick={() => setCategory(cat.id)}
                    >
                      <div className="scc-header">
                        <span
                          className="scc-icon-wrap"
                          style={{ background: cat.bg, color: cat.color }}
                        >
                          <Icon size={18} />
                        </span>
                        {isSelected && (
                          <span className="scc-check-badge">
                            <Check size={12} />
                          </span>
                        )}
                      </div>
                      <strong className="scc-title">{cat.title}</strong>
                      <span className="scc-desc">{cat.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SECTION 3: Clinical Metrics & Weight Changes */}
            <div className="story-form-card-section">
              <div className="story-form-section-head">
                <span className="story-form-section-badge">3</span>
                <div>
                  <h4 className="story-form-section-title">المؤشرات السريرية والأوزان</h4>
                  <p className="story-form-section-sub">أرقام نزول الوزن، مدة البرنامج، والوزن قبل وبعد</p>
                </div>
              </div>

              <div className="story-form-row-2">
                <label className="story-form-field">
                  <span className="story-form-label">إجمالي نزول الوزن (كجم) *</span>
                  <input
                    name="weightLostKg"
                    type="number"
                    step="0.5"
                    required
                    defaultValue={editing.weightLostKg}
                    placeholder="مثال: 27"
                    className="story-form-input"
                  />
                </label>

                <label className="story-form-field">
                  <span className="story-form-label">المدة الزمنية *</span>
                  <input
                    name="durationText"
                    type="text"
                    required
                    defaultValue={editing.durationText}
                    placeholder="مثال: ٥ أشهر أو شهرين"
                    className="story-form-input"
                  />
                </label>
              </div>

              <div className="story-form-row-weights" style={{ marginTop: '12px' }}>
                <label className="story-form-field">
                  <span className="story-form-label">الوزن قبل (كجم)</span>
                  <input
                    name="beforeWeight"
                    type="number"
                    step="0.5"
                    defaultValue={editing.beforeWeight}
                    placeholder="مثال: 107"
                    className="story-form-input"
                  />
                </label>

                <label className="story-form-field">
                  <span className="story-form-label">الوزن بعد (كجم)</span>
                  <input
                    name="afterWeight"
                    type="number"
                    step="0.5"
                    defaultValue={editing.afterWeight}
                    placeholder="مثال: 80"
                    className="story-form-input"
                  />
                </label>

                <label className="story-form-field">
                  <span className="story-form-label">البرنامج المتبع *</span>
                  <input
                    name="programTitle"
                    type="text"
                    required
                    defaultValue={editing.programTitle || 'كورس التغذية العلاجية وتنظيم الأيض'}
                    placeholder="اسم الكورس أو الباقة"
                    className="story-form-input"
                  />
                </label>
              </div>
            </div>

            {/* SECTION 4: Patient Quote & Clinical Findings */}
            <div className="story-form-card-section">
              <div className="story-form-section-head">
                <span className="story-form-section-badge">4</span>
                <div>
                  <h4 className="story-form-section-title">شهادة وتجربة المريض</h4>
                  <p className="story-form-section-sub">رأي المراجع وتفاصيل الحالة الطبية المصاحبة</p>
                </div>
              </div>

              <label className="story-form-field">
                <span className="story-form-label">شهادة وتجربة المريض (Quote) *</span>
                <textarea
                  name="quote"
                  required
                  rows={3}
                  defaultValue={editing.quote}
                  placeholder="كلمات المريض عن تجربته مع د. رنا والفرق الحقيقي الذي شعر به في صحته..."
                  className="story-form-textarea"
                  style={{ minHeight: '80px', resize: 'vertical' }}
                />
              </label>

              <label className="story-form-field" style={{ marginTop: '12px' }}>
                <span className="story-form-label">ملاحظات وتفاصيل سريرية إضافية (اختياري)</span>
                <textarea
                  name="details"
                  rows={2}
                  defaultValue={editing.details}
                  placeholder="مثال: تراجع محيط الخصر 18 سم، تحسن مستويات الغدة الدرقية، انتظام السكر التراكمي..."
                  className="story-form-textarea"
                  style={{ minHeight: '65px', resize: 'vertical' }}
                />
              </label>
            </div>

            {/* SECTION 5: Media Studio & Visual Multi-Image Manager */}
            <div className="story-form-card-section">
              <div className="story-form-section-head">
                <span className="story-form-section-badge">5</span>
                <div>
                  <h4 className="story-form-section-title">استوديو الوسائط والصور المرفقة</h4>
                  <p className="story-form-section-sub">
                    إدارة غلاف الكارت، الصورة السريرية، ومعرض الفحوصات والصور الإضافية
                  </p>
                </div>
              </div>

              {/* Story Type Segmented Control */}
              <div className="story-type-segmented-box" style={{ marginBottom: '18px' }}>
                <span className="story-form-label" style={{ marginBottom: '8px' }}>نوع التوثيق والعرض *</span>
                <div className="story-type-pills">
                  <button
                    type="button"
                    className={`story-type-pill ${storyType === 'transformation' ? 'is-active' : ''}`}
                    onClick={() => setStoryType('transformation')}
                  >
                    <span className="stp-icon">📸</span>
                    <div>
                      <strong>دراسة حالة وتحول سريري (Before & After)</strong>
                      <small>كارت غلاف أخضر فاخر + تقرير فحص تفصيلي</small>
                    </div>
                  </button>

                  <button
                    type="button"
                    className={`story-type-pill ${storyType === 'review' ? 'is-active' : ''}`}
                    onClick={() => setStoryType('review')}
                  >
                    <span className="stp-icon">💬</span>
                    <div>
                      <strong>محادثة ورأي مراجع (WhatsApp Review)</strong>
                      <small>كارت محادثة مراجعي العيادة ولقطة شاشة موثقة</small>
                    </div>
                  </button>
                </div>
              </div>

              {/* Two Primary Image Slots (Card Cover & Clinical Details) */}
              <div className="story-images-studio-grid">
                {/* Slot 1: Card Cover */}
                <div className="story-image-slot-card">
                  <div className="sis-header">
                    <strong className="sis-title">غلاف الكارت الخارجي</strong>
                    <span className="sis-tag">يظهر على المعرض الرئيسي</span>
                  </div>

                  <div className="sis-preview-box">
                    {coverImageUrl ? (
                      <div className="sis-thumb-wrap">
                        <img src={coverImageUrl} alt="غلاف الكارت" className="sis-thumb-img" />
                        <button
                          type="button"
                          className="sis-thumb-remove"
                          onClick={() => setCoverImageUrl('')}
                          title="إزالة صورة الغلاف"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <div className="sis-empty-placeholder">
                        <ImageIcon size={28} color="#94a3b8" />
                        <span>لم يتم تحديد غلاف بعد</span>
                      </div>
                    )}
                  </div>

                  <div className="sis-actions-row">
                    <button
                      type="button"
                      className="btn-sis-upload"
                      onClick={() => coverInputRef.current?.click()}
                      disabled={uploadingCover}
                    >
                      <Upload size={14} />
                      <span>{uploadingCover ? 'جاري الرفع...' : 'رفع غلاف من جهازك'}</span>
                    </button>
                  </div>

                  {/* Quick Preset Covers */}
                  <div className="sis-presets-row">
                    <span className="sis-presets-label">أغلفة المركز المعتمدة:</span>
                    <div className="sis-presets-chips">
                      <button
                        type="button"
                        className="sis-preset-chip"
                        onClick={() => setCoverImageUrl('/stories/case_cover_nada.png')}
                      >
                        غلاف ندى
                      </button>
                      <button
                        type="button"
                        className="sis-preset-chip"
                        onClick={() => setCoverImageUrl('/stories/case_cover_sameh.png')}
                      >
                        غلاف سامح
                      </button>
                      <button
                        type="button"
                        className="sis-preset-chip"
                        onClick={() => setCoverImageUrl('/stories/case_cover_safia.png')}
                      >
                        غلاف صفية
                      </button>
                    </div>
                  </div>
                </div>

                {/* Slot 2: Detailed Clinical Photo */}
                <div className="story-image-slot-card">
                  <div className="sis-header">
                    <strong className="sis-title">الصورة السريرية التفصيلية</strong>
                    <span className="sis-tag">تظهر داخل نافذة التقرير</span>
                  </div>

                  <div className="sis-preview-box">
                    {detailsImageUrl ? (
                      <div className="sis-thumb-wrap">
                        <img src={detailsImageUrl} alt="الصورة السريرية" className="sis-thumb-img" />
                        <button
                          type="button"
                          className="sis-thumb-remove"
                          onClick={() => setDetailsImageUrl('')}
                          title="إزالة الصورة السريرية"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <div className="sis-empty-placeholder">
                        <ImageIcon size={28} color="#94a3b8" />
                        <span>لم يتم تحديد صورة سريرية</span>
                      </div>
                    )}
                  </div>

                  <div className="sis-actions-row">
                    <button
                      type="button"
                      className="btn-sis-upload"
                      onClick={() => detailsInputRef.current?.click()}
                      disabled={uploadingDetails}
                    >
                      <Upload size={14} />
                      <span>{uploadingDetails ? 'جاري الرفع...' : 'رفع صورة سريرية (قبل وبعد)'}</span>
                    </button>
                  </div>

                  {/* Quick Preset Studies */}
                  <div className="sis-presets-row">
                    <span className="sis-presets-label">دراسات موثقة جاهزة:</span>
                    <div className="sis-presets-chips">
                      <button
                        type="button"
                        className="sis-preset-chip"
                        onClick={() => setDetailsImageUrl('/stories/transformation_107kg.jpg')}
                      >
                        تحول 107 كجم
                      </button>
                      <button
                        type="button"
                        className="sis-preset-chip"
                        onClick={() => setDetailsImageUrl('/stories/transformation_sameh.jpg')}
                      >
                        تحول سامح
                      </button>
                      <button
                        type="button"
                        className="sis-preset-chip"
                        onClick={() => setDetailsImageUrl('/stories/transformation_safia.jpg')}
                      >
                        تحول صفية
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Slot 3: Visual Multi-Image Gallery Manager ("أضف لي القدرة على إضافة صور أيضًا") */}
              <div className="story-gallery-manager-box" style={{ marginTop: '20px' }}>
                <div className="sgm-header">
                  <div>
                    <div className="sgm-title-row">
                      <Layers size={16} color="#059669" />
                      <strong className="sgm-title">معرض الصور والفحوصات الإضافية</strong>
                      <span className="sgm-count-badge">{galleryImages.length} صور</span>
                    </div>
                    <p className="sgm-sub">
                      أضيفي صوراً إضافية للحالة: تقرير InBody، تحاليل، لقطات شاشة، أو زوايا متعددة قبل وبعد
                    </p>
                  </div>

                  <button
                    type="button"
                    className="btn-gallery-add-main"
                    onClick={() => galleryInputRef.current?.click()}
                    disabled={uploadingGallery}
                  >
                    <Plus size={15} />
                    <span>{uploadingGallery ? 'جاري رفع الصور...' : 'إضافة صور من جهازك'}</span>
                  </button>
                </div>

                {/* Gallery Thumbs Grid */}
                {galleryImages.length > 0 ? (
                  <div className="sgm-grid">
                    {galleryImages.map((imgUrl, idx) => (
                      <div key={idx} className="sgm-thumb-card">
                        <img src={imgUrl} alt={`صورة إضافية ${idx + 1}`} className="sgm-thumb-img" />
                        <span className="sgm-thumb-order">{idx + 1}</span>
                        <div className="sgm-thumb-actions">
                          <button
                            type="button"
                            className="sgm-btn-delete"
                            onClick={() => handleRemoveGalleryImage(idx)}
                            title="حذف الصورة"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Extra Add Dropzone Card */}
                    <button
                      type="button"
                      className="sgm-add-dropzone"
                      onClick={() => galleryInputRef.current?.click()}
                      disabled={uploadingGallery}
                    >
                      <Plus size={22} color="#059669" />
                      <span>{uploadingGallery ? 'جاري الرفع...' : 'إضافة صورة أخرى'}</span>
                    </button>
                  </div>
                ) : (
                  <div className="sgm-empty-state" onClick={() => galleryInputRef.current?.click()}>
                    <Upload size={32} color="#94a3b8" />
                    <strong>لا توجد صور إضافية بعد</strong>
                    <span>انقري هنا لرفع فحوصات الـ InBody، التحاليل، أو زوايا إضافية من هاتفك أو جهازك</span>
                  </div>
                )}

                {/* Optional Manual URL Input Toggle */}
                <div style={{ marginTop: '14px' }}>
                  <button
                    type="button"
                    className="btn-toggle-advanced-urls"
                    onClick={() => setShowAdvancedUrls((v) => !v)}
                  >
                    <span>{showAdvancedUrls ? '− إخفاء خيارات الروابط المباشرة' : '+ إضافة صورة برابط مباشر / مسار URL'}</span>
                  </button>

                  {showAdvancedUrls && (
                    <div className="sgm-url-input-bar">
                      <input
                        type="text"
                        dir="ltr"
                        value={customGalleryUrl}
                        onChange={(e) => setCustomGalleryUrl(e.target.value)}
                        placeholder="https://... أو /stories/uploads/photo.jpg"
                        className="story-form-input"
                      />
                      <button
                        type="button"
                        className="btn-sis-upload"
                        onClick={handleAddCustomGalleryUrl}
                        style={{ flexShrink: 0 }}
                      >
                        <Plus size={14} />
                        <span>إضافة للمعرض</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* SECTION 6: Visibility & Publishing Settings */}
            <div className="story-form-card-section">
              <div className="story-form-section-head">
                <span className="story-form-section-badge">6</span>
                <div>
                  <h4 className="story-form-section-title">خيارات النشر والظهور</h4>
                  <p className="story-form-section-sub">التحكم في ظهور القصة للجمهور وترتيبها بالصدارة</p>
                </div>
              </div>

              <div className="story-form-checkboxes">
                <label className="story-checkbox-label">
                  <input
                    type="checkbox"
                    name="published"
                    defaultChecked={editing.published ?? true}
                  />
                  <span>نشر القصة على الموقع العام فوراً</span>
                </label>

                <label className="story-checkbox-label">
                  <input
                    type="checkbox"
                    name="featured"
                    defaultChecked={editing.featured ?? false}
                  />
                  <span>تثبيت القصة في صدارة المعرض (تظهر أولاً بالواجهة)</span>
                </label>
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="story-form-actions">
              <button
                type="button"
                className="btn-inbody-done-close"
                onClick={() => setEditing(null)}
                disabled={busy}
              >
                إلغاء
              </button>
              <Button disabled={busy}>
                {busy ? 'جارِ الحفظ...' : isNew ? 'إضافة القصة للموقع 🚀' : 'حفظ التعديلات ✓'}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
