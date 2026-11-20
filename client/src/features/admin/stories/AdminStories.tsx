import type { SuccessStory } from '@future/shared';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Activity,
  AlertTriangle,
  Award,
  Check,
  Eye,
  EyeOff,
  Flame,
  Heart,
  Layers,
  MessageCircle,
  Pencil,
  Quote,
  RefreshCw,
  Search,
  Sparkles,
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

// 4 Modern Core Clinical Categories
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

const getCleanPatientName = (story: { name?: string; age?: number | null } | null | undefined) => {
  if (!story?.name) return '';
  return story.name
    .replace(/\s*(?:\(\s*[0-9٠-٩۰-۹]+\s+سنة\s*\)|[0-9٠-٩۰-۹]+\s+سنة)\s*$/u, '')
    .trim();
};

const parseAgeInput = (val: string | number | undefined | null): number | null => {
  if (val === undefined || val === null || val === '') return null;
  const str = String(val)
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
    .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)));
  const match = str.match(/\d+/);
  if (!match) return null;
  const num = parseInt(match[0], 10);
  return num > 0 && num <= 120 ? num : null;
};

export function AdminStories() {
  const client = useQueryClient();
  const [search, setSearch] = useState('');
  const [activeTypeTab, setActiveTypeTab] = useState<'all' | 'transformations' | 'reviews'>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [editing, setEditing] = useState<Partial<SuccessStory> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast({ message: msg, type });
    toastTimeoutRef.current = setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  // Interactive Form State for Modal
  const [storyType, setStoryType] = useState<'transformation' | 'review'>('transformation');
  const [category, setCategory] = useState<string>('إنقاص وزن');
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [age, setAge] = useState<string | number>('');
  const [beforeWeight, setBeforeWeight] = useState<string | number>('');
  const [afterWeight, setAfterWeight] = useState<string | number>('');
  const [weightLostKg, setWeightLostKg] = useState<string | number>('');
  const [durationText, setDurationText] = useState('شهرين');
  const [programTitle, setProgramTitle] = useState('تحدي كورس النحت والتغذية العلاجية بالعيادة');
  const [quote, setQuote] = useState('');
  const [details, setDetails] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState<string>('');
  const [beforeImageUrl, setBeforeImageUrl] = useState<string>('');
  const [afterImageUrl, setAfterImageUrl] = useState<string>('');
  const [detailsImageUrl, setDetailsImageUrl] = useState<string>('');
  const [published, setPublished] = useState(true);
  const [featured, setFeatured] = useState(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedPreviewCase, setSelectedPreviewCase] = useState<SuccessStory | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentUploadTargetRef = useRef<'cover' | 'before' | 'after' | 'details'>('cover');

  const storiesQuery = useQuery({
    queryKey: ['admin', 'stories'],
    queryFn: adminApi.stories,
  });

  const stories = storiesQuery.data?.stories || [];

  const transformations = useMemo(
    () => stories.filter((s) => s.storyType === 'transformation'),
    [stories],
  );

  const reviews = useMemo(
    () => stories.filter((s) => s.storyType === 'review'),
    [stories],
  );

  const categories = useMemo(() => {
    const set = new Set<string>();
    stories.forEach((s) => {
      if (s.category) set.add(s.category);
    });
    return Array.from(set);
  }, [stories]);

  const filteredStories = useMemo(() => {
    return stories.filter((s) => {
      const matchType =
        activeTypeTab === 'all' ||
        (activeTypeTab === 'transformations' && s.storyType === 'transformation') ||
        (activeTypeTab === 'reviews' && s.storyType === 'review');
      const matchSearch =
        !search ||
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.title.toLowerCase().includes(search.toLowerCase()) ||
        s.quote.toLowerCase().includes(search.toLowerCase());
      const matchCat = categoryFilter === 'all' || s.category === categoryFilter;
      return matchType && matchSearch && matchCat;
    });
  }, [stories, activeTypeTab, search, categoryFilter]);

  // Open modal for editing
  const handleOpenEdit = (story: Partial<SuccessStory>, isCreating = false, defaultType?: 'transformation' | 'review') => {
    const resolvedType = defaultType || story.storyType || 'transformation';
    setIsNew(isCreating);
    setEditing(story);
    setStoryType(resolvedType);
    setName(story.name || '');
    setTitle(story.title || '');
    setAge(story.age != null ? String(story.age) : '');
    setCategory(story.category || (resolvedType === 'transformation' ? 'إنقاص وزن' : 'تغذية'));
    setBeforeWeight(story.beforeWeight ?? '');
    setAfterWeight(story.afterWeight ?? '');
    setWeightLostKg(story.weightLostKg ?? (resolvedType === 'transformation' ? 15 : 0));
    setDurationText(story.durationText || (resolvedType === 'transformation' ? 'شهرين' : 'متابعة دورية'));
    setProgramTitle(
      story.programTitle ||
        (resolvedType === 'transformation'
          ? 'تحدي كورس النحت والتغذية العلاجية بالعيادة'
          : 'برنامج المتابعة الشاملة'),
    );
    setQuote(story.quote || '');
    setDetails(story.details || '');
    setCoverImageUrl(story.imageUrl || (resolvedType === 'transformation' ? '/stories/results-cover.webp' : ''));
    setBeforeImageUrl(story.beforeImageUrl || '');
    setAfterImageUrl(story.afterImageUrl || '');
    setDetailsImageUrl(story.detailsImageUrl || '');
    setPublished(story.published ?? true);
    setFeatured(story.featured ?? false);
    setError('');
    setMessage('');
  };

  const handleOpenAdd = (type: 'transformation' | 'review') => {
    if (type === 'transformation') {
      handleOpenEdit(
        {
          name: '',
          title: '',
          category: 'إنقاص وزن',
          weightLostKg: 15,
          durationText: 'شهرين',
          programTitle: 'تحدي كورس النحت والتغذية العلاجية بالعيادة',
          quote: '',
          details: '',
          storyType: 'transformation',
          imageUrl: '/stories/results-cover.webp',
          published: true,
          featured: false,
          order: stories.length + 1,
        },
        true,
        'transformation',
      );
    } else {
      handleOpenEdit(
        {
          name: '',
          title: '',
          category: 'تغذية',
          weightLostKg: 0,
          durationText: 'متابعة دورية',
          programTitle: 'برنامج المتابعة الشاملة',
          quote: '',
          details: '',
          storyType: 'review',
          imageUrl: '',
          published: true,
          featured: false,
          order: stories.length + 1,
        },
        true,
        'review',
      );
    }
  };

  // Auto calculate weight loss on entering before & after
  const handleBeforeWeightChange = (val: string) => {
    setBeforeWeight(val);
    const b = parseFloat(val);
    const a = parseFloat(String(afterWeight));
    if (!isNaN(b) && !isNaN(a) && b >= a) {
      setWeightLostKg(Number((b - a).toFixed(1)));
    }
  };

  const handleAfterWeightChange = (val: string) => {
    setAfterWeight(val);
    const b = parseFloat(String(beforeWeight));
    const a = parseFloat(val);
    if (!isNaN(b) && !isNaN(a) && b >= a) {
      setWeightLostKg(Number((b - a).toFixed(1)));
    }
  };

  // Toggle Publish & Feature
  const handleTogglePublish = async (s: SuccessStory) => {
    try {
      await adminApi.saveStory({ id: s.id, published: !s.published });
      await client.invalidateQueries({ queryKey: ['admin', 'stories'] });
      await client.invalidateQueries({ queryKey: ['public', 'stories'] });
      const msg = s.published ? 'تم تحويل الحالة إلى مسودة مخفية.' : 'تم نشر الحالة على الموقع العام بنجاح 🚀';
      setMessage(msg);
      showToast(msg, 'success');
    } catch (err) {
      const errMsg = (err as Error).message || 'تعذر تعديل حالة النشر.';
      setError(errMsg);
      showToast(errMsg, 'error');
    }
  };

  const handleToggleFeatured = async (s: SuccessStory) => {
    try {
      await adminApi.saveStory({ id: s.id, featured: !s.featured });
      await client.invalidateQueries({ queryKey: ['admin', 'stories'] });
      await client.invalidateQueries({ queryKey: ['public', 'stories'] });
      const msg = s.featured
        ? 'تمت إزالة الحالة من صدارة العرض وإعادتها للترتيب العادي.'
        : 'تم تثبيت الحالة في صدارة العرض بالواجهة بنجاح ⭐';
      setMessage(msg);
      showToast(msg, 'success');
    } catch (err) {
      const errMsg = (err as Error).message || 'تعذر تعديل حالة التثبيت.';
      setError(errMsg);
      showToast(errMsg, 'error');
    }
  };

  const handleDelete = async (s: SuccessStory) => {
    const isTrans = s.storyType === 'transformation';
    if (!window.confirm(`هل أنتِ متأكدة من حذف ${isTrans ? 'تجربة' : 'رسالة'} "${s.name}" نهائياً؟`)) return;
    try {
      await adminApi.deleteStory(s.id);
      await client.invalidateQueries({ queryKey: ['admin', 'stories'] });
      await client.invalidateQueries({ queryKey: ['public', 'stories'] });
      setMessage('تم الحذف بنجاح.');
    } catch (err) {
      setError((err as Error).message || 'تعذر حذف القصة.');
    }
  };

  // File Upload Helper with Client-side Canvas Optimization
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const rawData = e.target?.result as string;
        if (!rawData) {
          resolve('');
          return;
        }
        const img = new Image();
        img.onload = () => {
          let { width, height } = img;
          const maxDim = 1600;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(rawData);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.88));
        };
        img.onerror = () => resolve(rawData);
        img.src = rawData;
      };
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    });
  };

  const uploadFile = async (file: File): Promise<string> => {
    if (!file.type.startsWith('image/')) {
      throw new Error('يرجى اختيار ملف صورة صالح (JPG, PNG, WebP).');
    }
    if (file.size > 25 * 1024 * 1024) {
      throw new Error('حجم الصورة كبير جداً، يرجى اختيار صورة أقل من 25 ميجابايت.');
    }

    const compressed = await compressImage(file);
    const dataUrl =
      compressed ||
      (await new Promise<string>((resolve, reject) => {
        const r = new FileReader();
        r.onload = (e) => resolve(e.target?.result as string);
        r.onerror = reject;
        r.readAsDataURL(file);
      }));

    if (!dataUrl) {
      throw new Error('تعذر قراءة بيانات الصورة.');
    }

    const res = await adminApi.uploadStoryImage(dataUrl, file.name);
    return res.url;
  };

  const triggerUpload = (target: 'cover' | 'before' | 'after' | 'details') => {
    currentUploadTargetRef.current = target;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const target = currentUploadTargetRef.current;
    setUploadingField(target);
    setError('');
    try {
      const url = await uploadFile(file);
      if (target === 'cover') setCoverImageUrl(url);
      else if (target === 'before') setBeforeImageUrl(url);
      else if (target === 'after') setAfterImageUrl(url);
      else if (target === 'details') setDetailsImageUrl(url);
      setMessage('تم رفع الصورة بنجاح ✓');
    } catch (err) {
      setError((err as Error).message || 'تعذر رفع الصورة.');
    } finally {
      setUploadingField(null);
      if (e.target) e.target.value = '';
    }
  };

  // Save story payload
  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;

    if (!name.trim()) {
      const msg = 'يرجى إدخال اسم الحالة أو العميل أولاً.';
      setError(msg);
      showToast(msg, 'error');
      return;
    }

    if (storyType === 'transformation' && Boolean(beforeImageUrl) !== Boolean(afterImageUrl) && !detailsImageUrl) {
      const msg = 'يرجى اختيار الصورتين (قبل وبعد) معاً أو رفع صورة المقارنة المجمعة.';
      setError(msg);
      showToast(msg, 'error');
      return;
    }

    setBusy(true);
    setError('');

    const resolvedTitle =
      title.trim() ||
      (storyType === 'review'
        ? Number(weightLostKg) > 0
          ? `تجربة ورسالة عميلة: نزول ${weightLostKg} كجم`
          : `رسالة من عملاء المركز: ${name.trim()}`
        : `خسارة ${weightLostKg || 15} كجم بالعيادة`);

    const parsedAge = parseAgeInput(age);

    const payload: any = {
      id: isNew ? undefined : editing.id,
      name: name.trim(),
      title: resolvedTitle,
      age: parsedAge,
      category: category || (storyType === 'transformation' ? 'إنقاص وزن' : 'تغذية'),
      weightLostKg: Number(weightLostKg) || 0,
      durationText: durationText.trim() || (storyType === 'review' ? 'متابعة دورية' : 'شهرين'),
      beforeWeight: beforeWeight !== '' && beforeWeight != null ? Number(beforeWeight) : null,
      afterWeight: afterWeight !== '' && afterWeight != null ? Number(afterWeight) : null,
      programTitle:
        programTitle.trim() ||
        (storyType === 'review'
          ? 'برنامج المتابعة الشاملة'
          : 'تحدي كورس النحت والتغذية العلاجية بالعيادة'),
      quote:
        quote.trim() ||
        (storyType === 'review'
          ? 'رسالة شكر وتقدير من عملاء المركز.'
          : `تجربة سريرية ناجحة ونزول ${weightLostKg || 15} كجم مع دكتورة رنا.`),
      details: details.trim() || null,
      imageUrl: coverImageUrl.trim() || (storyType === 'transformation' ? '/stories/results-cover.webp' : null),
      beforeImageUrl: beforeImageUrl.trim() || null,
      afterImageUrl: afterImageUrl.trim() || null,
      detailsImageUrl: detailsImageUrl.trim() || null,
      storyType,
      published,
      featured,
      order: editing.order || stories.length + 1,
    };

    try {
      await adminApi.saveStory(payload);
      await client.invalidateQueries({ queryKey: ['admin', 'stories'] });
      await client.invalidateQueries({ queryKey: ['public', 'stories'] });
      const successMsg = isNew
        ? storyType === 'transformation'
          ? 'تم حفظ ونشر تجربة التحول بنجاح على الموقع العام! 🚀'
          : 'تم حفظ ونشر رسالة العميل بنجاح على الموقع العام! 🚀'
        : 'تم تحديث بيانات الحالة وحفظ التغييرات على الموقع العام بنجاح! ✓';
      setMessage(successMsg);
      showToast(successMsg, 'success');
      setEditing(null);
    } catch (err) {
      const errMsg = (err as Error).message || 'تعذر حفظ البيانات على الموقع.';
      setError(errMsg);
      showToast(errMsg, 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="admin-stories-page" style={{ direction: 'rtl' }}>
      {/* Floating Animated Toast Notification */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: 'fixed',
            top: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 999999,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 24px',
            borderRadius: '16px',
            background: toast.type === 'success' ? '#064e3b' : '#991b1b',
            color: '#ffffff',
            boxShadow: '0 20px 50px rgba(0,0,0,0.35)',
            border: `1.5px solid ${toast.type === 'success' ? '#34d399' : '#f87171'}`,
            fontSize: '14.5px',
            fontWeight: 800,
            direction: 'rtl',
            minWidth: '320px',
            maxWidth: '90vw',
            justifyContent: 'space-between',
            backdropFilter: 'blur(8px)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span
              style={{
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.22)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {toast.type === 'success' ? <Check size={16} color="#fff" /> : <AlertTriangle size={16} color="#fff" />}
            </span>
            <span>{toast.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setToast(null)}
            style={{
              background: 'transparent',
              border: 0,
              color: '#ffffff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2px',
              opacity: 0.85,
            }}
            aria-label="إغلاق التنبيه"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Hidden file input for single-click upload */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/jpeg,image/png,image/webp"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {/* Top Header matching User Interface */}
      <ConsoleTitle
        title="نتائج وتجارب النجاح (Success Stories)"
        description='إدارة وتوثيق نتائج المركز: تجارب وصور قبل وبعد ورسائل العملاء الموثقة التي تظهر في قسم "نتائج حقيقية صنعت فرقاً في حياة أصحابها".'
      >
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <Button
            onClick={() => handleOpenAdd('transformation')}
            icon={false}
          >
            <Flame size={17} />
            <span>+ إضافة تجربة قبل وبعد</span>
          </Button>
          <Button
            kind="outline"
            onClick={() => handleOpenAdd('review')}
            icon={false}
          >
            <MessageCircle size={17} />
            <span>+ إضافة رسالة عميل</span>
          </Button>
        </div>
      </ConsoleTitle>

      <Notice message={message} />
      {!editing && <Notice message={error} error />}

      {/* Stats Strip */}
      <div className="console-stats stories-admin-stats">
        <div>
          <span>{stories.length}</span>
          <small>إجمالي التجارب والنتائج</small>
        </div>
        <div>
          <span style={{ color: '#047857' }}>{transformations.length}</span>
          <small>تجارب وصور قبل وبعد</small>
        </div>
        <div>
          <span style={{ color: '#0284c7' }}>{reviews.length}</span>
          <small>رسائل وآراء العملاء</small>
        </div>
        <div>
          <span>{stories.filter((s) => s.published).length}</span>
          <small>منشورة بالواجهة للمراجعين</small>
        </div>
      </div>

      {/* 2. Primary Type Tabs (Matching User Interface Rhythm) */}
      <div className="stories-type-tabs-bar" role="tablist">
        <button
          type="button"
          className={`stories-type-tab-btn ${activeTypeTab === 'all' ? 'is-active' : ''}`}
          onClick={() => setActiveTypeTab('all')}
        >
          <Layers size={16} />
          <span>كل التجارب والنتائج</span>
          <span className="stories-type-tab-count">{stories.length}</span>
        </button>

        <button
          type="button"
          className={`stories-type-tab-btn ${activeTypeTab === 'transformations' ? 'is-active' : ''}`}
          onClick={() => setActiveTypeTab('transformations')}
        >
          <Trophy size={16} />
          <span>تجارب وصور قبل وبعد</span>
          <span className="stories-type-tab-count">{transformations.length}</span>
        </button>

        <button
          type="button"
          className={`stories-type-tab-btn ${activeTypeTab === 'reviews' ? 'is-active' : ''}`}
          onClick={() => setActiveTypeTab('reviews')}
        >
          <MessageCircle size={16} />
          <span>رسائل وتجارب العملاء</span>
          <span className="stories-type-tab-count">{reviews.length}</span>
        </button>
      </div>

      {/* Search & Category Pills */}
      <div className="section-search-bar-pro" style={{ marginBottom: '14px' }}>
        <div className="search-input-pill-wrap">
          <Search size={16} className="search-pill-icon" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث: اسم الحالة، العنوان، أو نص الرسالة والشهادة..."
            className="search-pill-input"
            aria-label="البحث في قصص وتجارب النجاح"
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

      {/* Sub-Filter Categories */}
      <div className="sub-filter-pills-bar" style={{ marginBottom: '18px' }}>
        <button
          type="button"
          className={`sub-filter-pill-btn ${categoryFilter === 'all' ? 'is-active' : ''}`}
          onClick={() => setCategoryFilter('all')}
        >
          <span>كافة الأقسام</span>
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
        <ErrorState message="تعذر تحميل البيانات." onRetry={() => void storiesQuery.refetch()} />
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
            لا توجد حالات مطابقة
          </h3>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
            {search
              ? `لا توجد نتائج تطابق بحثك: "${search}"`
              : 'ابدئي بإضافة أول تجربة أو رسالة عميل لتوثيق نتائج المركز.'}
          </p>
        </div>
      ) : (
        <div className="admin-request-list" style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {filteredStories.map((s) => {
            const isTrans = s.storyType === 'transformation';
            return (
              <article
                key={s.id}
                className={`story-card-pro ${isTrans ? 'is-transformation' : 'is-review'}`}
              >
                {/* Header Row */}
                <div className="story-card-header-pro">
                  <div className="story-patient-profile-pro">
                    <span className={`story-avatar-badge ${isTrans ? 'is-trans' : 'is-rev'}`}>
                      {isTrans ? <Flame size={20} /> : <MessageCircle size={20} />}
                    </span>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                          {getCleanPatientName(s)}
                        </h3>
                        {s.age != null && <span className="user-type-tag is-user">{s.age} سنة</span>}
                        <span className={`story-type-tag ${isTrans ? 'is-trans' : 'is-rev'}`}>
                          {isTrans ? 'تجارب وصور قبل وبعد' : 'رسالة عميل موثقة'}
                        </span>
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
                            مميزة بالصدارة
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                        <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
                          🏷️ {s.category}
                        </span>
                        {s.programTitle && (
                          <span style={{ fontSize: '11.5px', color: '#047857', background: '#ecfdf5', padding: '1px 8px', borderRadius: '6px' }}>
                            {s.programTitle}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Status Tag */}
                  <div>
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

                {/* Body Content tailored to Type */}
                {isTrans ? (
                  <>
                    {/* Metrics Strip for Transformation */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        background: '#f8fafc',
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                        flexWrap: 'wrap',
                        gap: '8px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            background: '#ecfdf5',
                            color: '#047857',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Flame size={18} />
                        </span>
                        <div>
                          <strong style={{ fontSize: '15px', color: '#047857', display: 'block' }}>
                            نزول {s.weightLostKg} كجم
                          </strong>
                          <small style={{ fontSize: '11px', color: '#64748b' }}>
                            خلال {s.durationText}
                          </small>
                        </div>
                      </div>

                      {s.beforeWeight && s.afterWeight && (
                        <div style={{ fontSize: '13px', color: '#334155', fontWeight: 700 }}>
                          <span>الوزن السابق: {s.beforeWeight} كجم</span>
                          <span style={{ margin: '0 6px', color: '#047857' }}>➔</span>
                          <span>الوزن الحالي: {s.afterWeight} كجم</span>
                        </div>
                      )}
                    </div>

                    <h4 style={{ margin: '4px 0 2px', fontSize: '14.5px', fontWeight: 800, color: '#0f172a' }}>
                      {s.title}
                    </h4>
                    <p style={{ margin: 0, fontSize: '13px', lineHeight: '1.6', color: '#475569' }}>
                      "{s.quote}"
                    </p>

                    {/* Photos Preview for Transformations */}
                    {(() => {
                      const legacyPhotoSets = new Map([
                        ['/stories/transformation_107kg.jpg', 'nada'],
                        ['/stories/transformation_sameh.jpg', 'sameh'],
                        ['/stories/transformation_safia.jpg', 'safia'],
                      ]);
                      const matchedLegacy = legacyPhotoSets.get(s.detailsImageUrl ?? '');
                      const beforePic = s.beforeImageUrl || (matchedLegacy ? `/stories/compare-${matchedLegacy}-before.webp` : '');
                      const afterPic = s.afterImageUrl || (matchedLegacy ? `/stories/compare-${matchedLegacy}-after.webp` : '');
                      const hasPhotos = Boolean(beforePic || afterPic);

                      if (!hasPhotos) {
                        return (
                          <div
                            style={{
                              marginTop: '10px',
                              padding: '10px 14px',
                              background: '#fffbeb',
                              border: '1.5px dashed #fcd34d',
                              borderRadius: '10px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: '10px',
                              flexWrap: 'wrap',
                            }}
                          >
                            <span style={{ fontSize: '12px', color: '#b45309', fontWeight: 600 }}>
                              ⚠️ لم يتم رفع صور المقارنة (قبل وبعد) بعد — ستظهر نافذة الحالة فارغة بالموقع للمراجعين.
                            </span>
                            <button
                              type="button"
                              className="btn is-outline"
                              style={{
                                fontSize: '11.5px',
                                padding: '4px 12px',
                                height: 'auto',
                                background: '#fff',
                                borderColor: '#f59e0b',
                                color: '#b45309',
                                fontWeight: 700,
                                borderRadius: '8px',
                              }}
                              onClick={() => handleOpenEdit(s, false, 'transformation')}
                            >
                              + رفع صور قبل وبعد الآن
                            </button>
                          </div>
                        );
                      }

                      return (
                        <div className="story-comparison-split-box">
                          {beforePic && (
                            <div
                              className="story-comp-img-wrap"
                              onClick={() => setSelectedPreviewCase(s)}
                              title="اضغطي لمعاينة مقارنة قبل وبعد كاملة"
                              style={{ cursor: 'pointer' }}
                            >
                              <img src={beforePic} alt="قبل" />
                              <span className="story-comp-img-label">قبل</span>
                            </div>
                          )}
                          {afterPic && (
                            <div
                              className="story-comp-img-wrap"
                              onClick={() => setSelectedPreviewCase(s)}
                              title="اضغطي لمعاينة مقارنة قبل وبعد كاملة"
                              style={{ cursor: 'pointer' }}
                            >
                              <img src={afterPic} alt="بعد" />
                              <span className="story-comp-img-label">بعد</span>
                            </div>
                          )}
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginTop: '4px', flexWrap: 'wrap', gap: '8px' }}>
                            <span style={{ fontSize: '11.5px', color: '#64748b' }}>
                              📸 اضغطي على الصور لفتح نافذة مقارنة قبل وبعد المعتمدة بالواجهة
                            </span>
                            <button
                              type="button"
                              className="btn is-outline"
                              style={{ fontSize: '11.5px', padding: '3px 10px', height: 'auto', borderRadius: '6px', color: '#047857', borderColor: '#a7f3d0' }}
                              onClick={() => setSelectedPreviewCase(s)}
                            >
                              🔍 معاينة قبل وبعد
                            </button>
                          </div>
                        </div>
                      );
                    })()}
                  </>
                ) : (
                  <>
                    {/* Review Quote Box */}
                    <div className="story-review-quote-box">
                      <Quote size={16} color="#0284c7" style={{ marginBottom: '4px' }} />
                      <p style={{ margin: 0, fontSize: '13.5px', lineHeight: '1.7', color: '#1e293b' }}>
                        "{s.quote}"
                      </p>
                    </div>

                    {/* Review Screenshot Preview if available */}
                    {s.imageUrl && (
                      <div className="story-review-thumb-row">
                        <img
                          src={s.imageUrl}
                          alt="صورة الرسالة الأصلية"
                          className="story-review-screenshot-thumb"
                          onClick={() => setPreviewImage(s.imageUrl || null)}
                          title="اضغطي للتكبير"
                        />
                        <div>
                          <strong style={{ fontSize: '12.5px', color: '#0f172a', display: 'block' }}>
                            صورة الرسالة الموثقة (WhatsApp / Facebook)
                          </strong>
                          <span style={{ fontSize: '11.5px', color: '#64748b' }}>
                            تظهر للمراجعين عند النقر على كارت الرسالة بالصفحة الرئيسية
                          </span>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Actions Row */}
                <div className="story-card-actions-row">
                  <button
                    type="button"
                    className="btn-story-action is-primary"
                    onClick={() => handleOpenEdit(s, false)}
                    title="تعديل البيانات"
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
                    title={s.featured ? 'إلغاء التثبيت بالصدارة' : 'تثبيت بالصدارة'}
                  >
                    <Award size={14} color={s.featured ? '#059669' : '#64748b'} />
                    <span>{s.featured ? 'إلغاء التثبيت' : 'تثبيت بالصدارة'}</span>
                  </button>

                  <button
                    type="button"
                    className="btn-story-action is-delete"
                    onClick={() => void handleDelete(s)}
                    title="حذف نهائياً"
                    aria-label="حذف"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Add / Edit Story Modal (Adaptive by Story Type) */}
      <Modal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title={
          isNew
            ? storyType === 'transformation'
              ? 'إضافة تجربة قبل وبعد جديدة (Transformation)'
              : 'إضافة رسالة عميل جديدة (Client Review)'
            : storyType === 'transformation'
              ? 'تعديل تجربة قبل وبعد'
              : 'تعديل رسالة العميل'
        }
        className="story-admin-modal"
      >
        {editing && (
          <form noValidate onSubmit={handleSaveForm} className="story-admin-form">
            <Notice message={error} error />

            {/* Type Segmented Control */}
            <div className="story-type-segmented-box" style={{ marginBottom: '14px' }}>
              <span className="story-form-label" style={{ marginBottom: '8px' }}>
                نوع التوثيق والعرض بالواجهة *
              </span>
              <div className="story-type-pills">
                <button
                  type="button"
                  className={`story-type-pill ${storyType === 'transformation' ? 'is-active' : ''}`}
                  onClick={() => {
                    setStoryType('transformation');
                    if (!coverImageUrl) setCoverImageUrl('/stories/results-cover.webp');
                  }}
                >
                  <Trophy size={20} />
                  <div>
                    <strong>تجارب وصور قبل وبعد</strong>
                    <small>غلاف موحد، أرقام النزول، وصور المقارنة</small>
                  </div>
                </button>

                <button
                  type="button"
                  className={`story-type-pill ${storyType === 'review' ? 'is-active' : ''}`}
                  onClick={() => {
                    setStoryType('review');
                    if (coverImageUrl === '/stories/results-cover.webp') setCoverImageUrl('');
                  }}
                >
                  <MessageCircle size={20} />
                  <div>
                    <strong>رسائل وتجارب العملاء</strong>
                    <small>نص الرسالة وسكرين شوت المحادثة الموثقة</small>
                  </div>
                </button>
              </div>
            </div>

            {/* Hint Notice */}
            <div
              style={{
                padding: '10px 14px',
                background: storyType === 'transformation' ? '#ecfdf5' : '#f0f9ff',
                borderRadius: '12px',
                border: `1px solid ${storyType === 'transformation' ? '#a7f3d0' : '#bae6fd'}`,
                color: storyType === 'transformation' ? '#047857' : '#0284c7',
                fontSize: '12.5px',
                lineHeight: '1.5',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Sparkles size={16} style={{ flexShrink: 0 }} />
              <span>
                {storyType === 'transformation'
                  ? 'ستظهر هذه الحالة في سيكشن "تجارب وصور قبل وبعد" مع شريط المقارنة وفتح تفاصيل الحالة عند النقر.'
                  : 'ستظهر هذه الرسالة في قسم "رسائل من عملائنا" كبطاقة شهادة مع إمكانية تكبير سكرين شوت المحادثة الموثقة.'}
              </span>
            </div>

            {/* ADAPTIVE FORM BODY */}
            {storyType === 'transformation' ? (
              <>
                {/* 1. Patient Identity */}
                <div className="story-form-card-section">
                  <div className="story-form-section-head">
                    <span className="story-form-section-badge">1</span>
                    <div>
                      <h4 className="story-form-section-title">بيانات الحالة والعنوان الأساسي</h4>
                      <p className="story-form-section-sub">الاسم والسن وعنوان الإنجاز السريري</p>
                    </div>
                  </div>

                  <div className="story-form-row-2">
                    <label className="story-form-field">
                      <span className="story-form-label">اسم المريض / المراجع *</span>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="مثال: مدام ندى أو أستاذ سامح"
                        className="story-form-input"
                      />
                    </label>

                    <label className="story-form-field">
                      <span className="story-form-label">السن (اختياري تماماً)</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        placeholder="مثال: 32 (اتركيه فارغاً إن لم ترغبي)"
                        className="story-form-input"
                      />
                      <span style={{ fontSize: '11px', color: '#64748b', marginTop: '3px', display: 'block' }}>
                        حقل اختياري — اتركيه فارغاً ولن يظهر سن على الكارت بالواجهة.
                      </span>
                    </label>
                  </div>

                  <label className="story-form-field" style={{ marginTop: '12px' }}>
                    <span className="story-form-label">عنوان قصة النجاح (اختياري - يتم إنشاؤه تلقائياً)</span>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="مثال: خسارة 27 كجم والتعافي من خمول الغدة وارتجاع المريء"
                      className="story-form-input"
                    />
                  </label>
                </div>

                {/* 2. Clinical Category */}
                <div className="story-form-card-section">
                  <div className="story-form-section-head">
                    <span className="story-form-section-badge">2</span>
                    <div>
                      <h4 className="story-form-section-title">التصنيف السريري</h4>
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

                {/* 3. Metrics with Auto-Calculation */}
                <div className="story-form-card-section">
                  <div className="story-form-section-head">
                    <span className="story-form-section-badge">3</span>
                    <div>
                      <h4 className="story-form-section-title">المؤشرات السريرية والأوزان (حساب تلقائي)</h4>
                      <p className="story-form-section-sub">أدخلي الوزن قبل وبعد وسيتم احتساب فارق النزول تلقائياً</p>
                    </div>
                  </div>

                  <div className="story-form-row-weights">
                    <label className="story-form-field">
                      <span className="story-form-label">الوزن قبل (كجم)</span>
                      <input
                        type="number"
                        step="0.5"
                        value={beforeWeight}
                        onChange={(e) => handleBeforeWeightChange(e.target.value)}
                        placeholder="مثال: 107"
                        className="story-form-input"
                      />
                    </label>

                    <label className="story-form-field">
                      <span className="story-form-label">الوزن بعد (كجم)</span>
                      <input
                        type="number"
                        step="0.5"
                        value={afterWeight}
                        onChange={(e) => handleAfterWeightChange(e.target.value)}
                        placeholder="مثال: 80"
                        className="story-form-input"
                      />
                    </label>

                    <label className="story-form-field">
                      <span className="story-form-label">مقدار النزول (كجم) *</span>
                      <input
                        type="number"
                        step="0.5"
                        value={weightLostKg}
                        onChange={(e) => setWeightLostKg(e.target.value)}
                        placeholder="مثال: 27"
                        className="story-form-input"
                        style={{ fontWeight: 800, color: '#047857' }}
                      />
                    </label>
                  </div>

                  <div className="story-form-row-2" style={{ marginTop: '12px' }}>
                    <label className="story-form-field">
                      <span className="story-form-label">المدة الزمنية *</span>
                      <input
                        type="text"
                        value={durationText}
                        onChange={(e) => setDurationText(e.target.value)}
                        placeholder="مثال: شهرين أو ٥ أشهر"
                        className="story-form-input"
                      />
                    </label>

                    <label className="story-form-field">
                      <span className="story-form-label">البرنامج المتبع *</span>
                      <input
                        type="text"
                        value={programTitle}
                        onChange={(e) => setProgramTitle(e.target.value)}
                        placeholder="اسم الكورس أو الباقة"
                        className="story-form-input"
                      />
                    </label>
                  </div>
                </div>

                {/* 4. Comparison Photos (Before & After) */}
                <div className="story-form-card-section">
                  <div className="story-form-section-head">
                    <span className="story-form-section-badge">4</span>
                    <div>
                      <h4 className="story-form-section-title">صور المقارنة (قبل وبعد)</h4>
                      <p className="story-form-section-sub">
                        ارفعي صورة قبل وصورة بعد ليعرضها الموقع جنباً إلى جنب داخل تفاصيل الحالة
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                    {/* Before Image */}
                    <div style={{ padding: '14px', border: '1.5px solid #e2e8f0', borderRadius: '14px', background: '#f8fafc' }}>
                      <span style={{ fontSize: '13px', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '8px' }}>
                        صورة قبل (Before)
                      </span>
                      {beforeImageUrl ? (
                        <div style={{ position: 'relative', height: '140px', borderRadius: '10px', overflow: 'hidden', marginBottom: '8px' }}>
                          <img src={beforeImageUrl} alt="قبل" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <button
                            type="button"
                            onClick={() => setBeforeImageUrl('')}
                            style={{ position: 'absolute', top: '6px', left: '6px', background: 'rgba(220, 38, 38, 0.9)', color: '#fff', border: 0, borderRadius: '6px', padding: '4px', cursor: 'pointer' }}
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <div
                          onClick={() => triggerUpload('before')}
                          style={{ height: '140px', border: '2px dashed #cbd5e1', borderRadius: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: 'pointer', background: '#fff', marginBottom: '8px' }}
                        >
                          <Upload size={22} color="#64748b" />
                          <span style={{ fontSize: '12px', color: '#64748b' }}>
                            {uploadingField === 'before' ? 'جاري الرفع...' : 'اضغطي لرفع صورة قبل'}
                          </span>
                        </div>
                      )}
                      <Button
                        type="button"
                        kind="outline"
                        icon={false}
                        style={{ width: '100%', fontSize: '12px' }}
                        onClick={() => triggerUpload('before')}
                        disabled={uploadingField === 'before'}
                      >
                        <Upload size={13} />
                        <span>{beforeImageUrl ? 'تغيير الصورة' : 'اختيار صورة قبل'}</span>
                      </Button>
                      <div style={{ marginTop: '8px' }}>
                        <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '3px' }}>
                          أو إدخال رابط صورة قبل يدوياً:
                        </span>
                        <input
                          type="text"
                          value={beforeImageUrl}
                          onChange={(e) => setBeforeImageUrl(e.target.value)}
                          placeholder="/stories/compare-safia-before.webp"
                          className="story-form-input"
                          style={{ fontSize: '11.5px', padding: '6px 10px' }}
                        />
                      </div>
                    </div>

                    {/* After Image */}
                    <div style={{ padding: '14px', border: '1.5px solid #e2e8f0', borderRadius: '14px', background: '#f8fafc' }}>
                      <span style={{ fontSize: '13px', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '8px' }}>
                        صورة بعد (After)
                      </span>
                      {afterImageUrl ? (
                        <div style={{ position: 'relative', height: '140px', borderRadius: '10px', overflow: 'hidden', marginBottom: '8px' }}>
                          <img src={afterImageUrl} alt="بعد" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <button
                            type="button"
                            onClick={() => setAfterImageUrl('')}
                            style={{ position: 'absolute', top: '6px', left: '6px', background: 'rgba(220, 38, 38, 0.9)', color: '#fff', border: 0, borderRadius: '6px', padding: '4px', cursor: 'pointer' }}
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <div
                          onClick={() => triggerUpload('after')}
                          style={{ height: '140px', border: '2px dashed #cbd5e1', borderRadius: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: 'pointer', background: '#fff', marginBottom: '8px' }}
                        >
                          <Upload size={22} color="#64748b" />
                          <span style={{ fontSize: '12px', color: '#64748b' }}>
                            {uploadingField === 'after' ? 'جاري الرفع...' : 'اضغطي لرفع صورة بعد'}
                          </span>
                        </div>
                      )}
                      <Button
                        type="button"
                        kind="outline"
                        icon={false}
                        style={{ width: '100%', fontSize: '12px' }}
                        onClick={() => triggerUpload('after')}
                        disabled={uploadingField === 'after'}
                      >
                        <Upload size={13} />
                        <span>{afterImageUrl ? 'تغيير الصورة' : 'اختيار صورة بعد'}</span>
                      </Button>
                      <div style={{ marginTop: '8px' }}>
                        <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '3px' }}>
                          أو إدخال رابط صورة بعد يدوياً:
                        </span>
                        <input
                          type="text"
                          value={afterImageUrl}
                          onChange={(e) => setAfterImageUrl(e.target.value)}
                          placeholder="/stories/compare-safia-after.webp"
                          className="story-form-input"
                          style={{ fontSize: '11.5px', padding: '6px 10px' }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Optional Combined Comparison Image */}
                  <div style={{ marginTop: '16px', padding: '12px 14px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#334155' }}>
                        أو صورة مقارنة سريرية مجمعة (صورة واحدة مدمجة تجمع قبل وبعد):
                      </span>
                      {detailsImageUrl && (
                        <button
                          type="button"
                          onClick={() => setDetailsImageUrl('')}
                          style={{ fontSize: '11.5px', color: '#dc2626', background: 'none', border: 0, cursor: 'pointer', fontWeight: 700 }}
                        >
                          إزالة الصورة المجمعة
                        </button>
                      )}
                    </div>
                    {detailsImageUrl && (
                      <div style={{ position: 'relative', maxHeight: '160px', borderRadius: '8px', overflow: 'hidden', marginBottom: '8px' }}>
                        <img src={detailsImageUrl} alt="المقارنة السريرية المجمعة" style={{ width: '100%', maxHeight: '160px', objectFit: 'cover' }} />
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <Button
                        type="button"
                        kind="outline"
                        icon={false}
                        style={{ fontSize: '12px' }}
                        onClick={() => triggerUpload('details')}
                        disabled={uploadingField === 'details'}
                      >
                        <Upload size={13} />
                        <span>{detailsImageUrl ? 'تغيير الصورة المجمعة' : 'رفع صورة مجمعة من جهازك'}</span>
                      </Button>
                      <input
                        type="text"
                        value={detailsImageUrl}
                        onChange={(e) => setDetailsImageUrl(e.target.value)}
                        placeholder="أو إدخال رابطها: /stories/transformation_107kg.jpg"
                        className="story-form-input"
                        style={{ fontSize: '11.5px', flex: 1, minWidth: '200px', padding: '6px 10px' }}
                      />
                    </div>
                  </div>

                  <div style={{ marginTop: '12px', fontSize: '12px', color: '#64748b' }}>
                    💡 <strong>غلاف الكارت بالواجهة:</strong> يتم استخدام غلاف البراند الموحد تلقائياً ({coverImageUrl || '/stories/results-cover.webp'})، لضمان مظهر متناسق وفاخر.
                  </div>
                </div>

                {/* 5. Patient Quote & Clinical Notes */}
                <div className="story-form-card-section">
                  <div className="story-form-section-head">
                    <span className="story-form-section-badge">5</span>
                    <div>
                      <h4 className="story-form-section-title">شهادة وتجربة المريض</h4>
                      <p className="story-form-section-sub">كلمات المريض وتفاصيل التحول الحقيقي في صحته</p>
                    </div>
                  </div>

                  <label className="story-form-field">
                    <span className="story-form-label">رأي وتجربة المريض (اختياري)</span>
                    <textarea
                      rows={3}
                      value={quote}
                      onChange={(e) => setQuote(e.target.value)}
                      placeholder="كلمات المريض عن تجربته مع د. رنا وفارق المقاسات والخفة في الحركة... (إن تركتها فارغة سيتم توليد نص تلقائي)"
                      className="story-form-textarea"
                      style={{ minHeight: '80px', resize: 'vertical' }}
                    />
                  </label>

                  <label className="story-form-field" style={{ marginTop: '12px' }}>
                    <span className="story-form-label">ملاحظات سريرية إضافية (اختياري)</span>
                    <textarea
                      rows={2}
                      value={details}
                      onChange={(e) => setDetails(e.target.value)}
                      placeholder="مثال: تراجع محيط الخصر 15 سم، تنظيم السكر التراكمي..."
                      className="story-form-textarea"
                      style={{ minHeight: '60px', resize: 'vertical' }}
                    />
                  </label>
                </div>
              </>
            ) : (
              <>
                {/* REVIEW FORM: SIMPLE, FOCUSED & LIGHTWEIGHT */}
                {/* 1. Client Info */}
                <div className="story-form-card-section">
                  <div className="story-form-section-head">
                    <span className="story-form-section-badge">1</span>
                    <div>
                      <h4 className="story-form-section-title">بيانات صاحبة الرسالة</h4>
                      <p className="story-form-section-sub">اسم العميل والتصنيف العام</p>
                    </div>
                  </div>

                  <div className="story-form-row-2">
                    <label className="story-form-field">
                      <span className="story-form-label">اسم العميل / المراجع *</span>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="مثال: أ. نهى حمدي أو مريضة متابعة"
                        className="story-form-input"
                      />
                    </label>

                    <label className="story-form-field">
                      <span className="story-form-label">التصنيف الطبي (اختياري)</span>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="story-form-input"
                      >
                        {CLINICAL_CATEGORIES.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.title}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                </div>

                {/* 2. Message Quote */}
                <div className="story-form-card-section">
                  <div className="story-form-section-head">
                    <span className="story-form-section-badge">2</span>
                    <div>
                      <h4 className="story-form-section-title">نص الرسالة أو الرأي المقتبس *</h4>
                      <p className="story-form-section-sub">اكتبي النص الذي قالته المراجعة ليظهر في بطاقة الشهادة</p>
                    </div>
                  </div>

                  <label className="story-form-field">
                    <textarea
                      rows={4}
                      value={quote}
                      onChange={(e) => setQuote(e.target.value)}
                      placeholder="اكتبي نص الرسالة هنا، مثال: كنت 89 وبقيت 70.. بجد أحسن دكتورة في الدنيا والفرق في صحتي وشكلي لا يوصف!"
                      className="story-form-textarea"
                      style={{ minHeight: '95px', resize: 'vertical', fontSize: '14px' }}
                    />
                  </label>
                </div>

                {/* 3. Original Message Screenshot */}
                <div className="story-form-card-section">
                  <div className="story-form-section-head">
                    <span className="story-form-section-badge">3</span>
                    <div>
                      <h4 className="story-form-section-title">صورة الرسالة الموثقة (WhatsApp / Facebook)</h4>
                      <p className="story-form-section-sub">
                        ارفعي سكرين شوت المحادثة الموثقة لتظهر للمراجعين عند النقر على كارت الرسالة
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                    {coverImageUrl ? (
                      <div style={{ position: 'relative', width: '160px', height: '160px', borderRadius: '12px', overflow: 'hidden', border: '1.5px solid #0284c7' }}>
                        <img src={coverImageUrl} alt="سكرين شوت الرسالة" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button
                          type="button"
                          onClick={() => setCoverImageUrl('')}
                          style={{ position: 'absolute', top: '6px', left: '6px', background: 'rgba(220, 38, 38, 0.9)', color: '#fff', border: 0, borderRadius: '6px', padding: '4px', cursor: 'pointer' }}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => triggerUpload('cover')}
                        style={{ width: '160px', height: '160px', border: '2px dashed #bae6fd', background: '#f0f9ff', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: 'pointer' }}
                      >
                        <Upload size={24} color="#0284c7" />
                        <span style={{ fontSize: '11.5px', color: '#0284c7', fontWeight: 700, textAlign: 'center', padding: '0 8px' }}>
                          {uploadingField === 'cover' ? 'جاري الرفع...' : 'رفع سكرين شوت الرسالة'}
                        </span>
                      </div>
                    )}

                    <div style={{ flex: 1, minWidth: '220px' }}>
                      <Button
                        type="button"
                        kind="outline"
                        icon={false}
                        onClick={() => triggerUpload('cover')}
                        disabled={uploadingField === 'cover'}
                      >
                        <Upload size={14} />
                        <span>{coverImageUrl ? 'تغيير صورة الرسالة' : 'اختيار صورة من جهازك'}</span>
                      </Button>

                      <div style={{ marginTop: '10px' }}>
                        <span style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px' }}>
                          أو إدخال رابط الصورة يدوياً:
                        </span>
                        <input
                          type="text"
                          value={coverImageUrl}
                          onChange={(e) => setCoverImageUrl(e.target.value)}
                          placeholder="/stories/review_noha_19kg.jpg"
                          className="story-form-input"
                          style={{ fontSize: '12px' }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. Optional Extra Details for Review */}
                <div className="story-form-card-section">
                  <div className="story-form-section-head">
                    <span className="story-form-section-badge">4</span>
                    <div>
                      <h4 className="story-form-section-title">تفاصيل إضافية للرسالة (اختياري)</h4>
                      <p className="story-form-section-sub">مقدار النزول المذكور أو عنوان مخصص</p>
                    </div>
                  </div>

                  <div className="story-form-row-2">
                    <label className="story-form-field">
                      <span className="story-form-label">مقدار النزول المذكور بالكيلوجرام (اختياري)</span>
                      <input
                        type="number"
                        step="0.5"
                        value={weightLostKg}
                        onChange={(e) => setWeightLostKg(e.target.value)}
                        placeholder="مثال: 19 (أو اتركيها فارغة)"
                        className="story-form-input"
                      />
                    </label>

                    <label className="story-form-field">
                      <span className="story-form-label">البرنامج المتبع (اختياري)</span>
                      <input
                        type="text"
                        value={programTitle}
                        onChange={(e) => setProgramTitle(e.target.value)}
                        placeholder="مثال: برنامج المتابعة الشاملة"
                        className="story-form-input"
                      />
                    </label>
                  </div>
                </div>
              </>
            )}

            {/* Visibility Settings */}
            <div className="story-form-checkboxes">
              <label className="story-checkbox-label">
                <input
                  type="checkbox"
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                />
                <span>معروضة ومنشورة بالواجهة للمراجعين</span>
              </label>

              <label className="story-checkbox-label">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                />
                <span>تثبيت في صدارة المعرض (مميزة ⭐)</span>
              </label>
            </div>

            {/* Inline Error Notice at Bottom of Form near Action Button */}
            {error && (
              <div
                style={{
                  marginTop: '12px',
                  padding: '10px 14px',
                  background: '#fef2f2',
                  border: '1.5px solid #fecaca',
                  borderRadius: '10px',
                  color: '#b91c1c',
                  fontSize: '13px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <AlertTriangle size={16} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            {/* Modal Actions Footer */}
            <div className="story-form-actions" style={{ marginTop: '16px' }}>
              <Button type="button" kind="outline" icon={false} onClick={() => setEditing(null)}>
                إلغاء
              </Button>
              <Button
                type="submit"
                disabled={busy || Boolean(uploadingField)}
                style={{ minWidth: '200px' }}
                icon={false}
              >
                {busy ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    <RefreshCw size={15} className="spinner" />
                    <span>جاري الحفظ والرفع للموقع...</span>
                  </span>
                ) : isNew ? (
                  <span>حفظ وإرسال للموقع 🚀</span>
                ) : (
                  <span>تأكيد وحفظ التعديلات للموقع ✓</span>
                )}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Before & After Comparison Modal matching Public Website UI */}
      {selectedPreviewCase && (() => {
        const legacyPhotoSets = new Map([
          ['/stories/transformation_107kg.jpg', 'nada'],
          ['/stories/transformation_sameh.jpg', 'sameh'],
          ['/stories/transformation_safia.jpg', 'safia'],
        ]);
        const matchedLegacy = legacyPhotoSets.get(selectedPreviewCase.detailsImageUrl ?? '');
        const beforePic = selectedPreviewCase.beforeImageUrl || (matchedLegacy ? `/stories/compare-${matchedLegacy}-before.webp` : '');
        const afterPic = selectedPreviewCase.afterImageUrl || (matchedLegacy ? `/stories/compare-${matchedLegacy}-after.webp` : '');
        const cleanName = getCleanPatientName(selectedPreviewCase);

        return (
          <div
            className="admin-case-dialog-backdrop"
            onClick={() => setSelectedPreviewCase(null)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(5, 46, 22, 0.78)',
              backdropFilter: 'blur(8px)',
              zIndex: 99999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
              direction: 'rtl',
            }}
          >
            <div
              className="case-modal-dialog"
              onClick={(e) => e.stopPropagation()}
              style={{
                background: '#fff',
                borderRadius: '24px',
                maxWidth: '860px',
                width: '100%',
                maxHeight: '92vh',
                overflowY: 'auto',
                boxShadow: '0 25px 60px rgba(0,0,0,0.35)',
                border: '1px solid #e2e8f0',
                padding: '24px',
              }}
            >
              <header
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingBottom: '16px',
                  borderBottom: '1.5px solid #f1f5f9',
                  marginBottom: '20px',
                }}
              >
                <div>
                  <h3 style={{ margin: 0, fontSize: '21px', fontWeight: 800, color: '#0f172a' }}>
                    {cleanName}
                  </h3>
                  {selectedPreviewCase.age != null && (
                    <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#64748b', fontWeight: 600 }}>
                      {selectedPreviewCase.age} سنة
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedPreviewCase(null)}
                  style={{
                    background: '#f1f5f9',
                    border: 0,
                    borderRadius: '50%',
                    width: '38px',
                    height: '38px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: '#475569',
                    transition: 'all 0.2s',
                  }}
                  aria-label="إغلاق"
                >
                  <X size={20} />
                </button>
              </header>

              <div className="cmd-body">
                {beforePic && afterPic ? (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                      gap: '20px',
                    }}
                  >
                    <figure style={{ margin: 0, position: 'relative' }}>
                      <figcaption
                        style={{
                          position: 'absolute',
                          top: '12px',
                          right: '12px',
                          background: 'rgba(15, 23, 42, 0.88)',
                          color: '#fff',
                          fontSize: '13px',
                          fontWeight: 800,
                          padding: '4px 14px',
                          borderRadius: '8px',
                          zIndex: 2,
                          backdropFilter: 'blur(4px)',
                        }}
                      >
                        قبل
                      </figcaption>
                      <img
                        src={beforePic}
                        alt={'قبل — ' + cleanName}
                        style={{
                          width: '100%',
                          maxHeight: '520px',
                          objectFit: 'contain',
                          borderRadius: '16px',
                          background: '#f8fafc',
                          border: '1.5px solid #e2e8f0',
                        }}
                      />
                    </figure>
                    <figure style={{ margin: 0, position: 'relative' }}>
                      <figcaption
                        style={{
                          position: 'absolute',
                          top: '12px',
                          right: '12px',
                          background: '#047857',
                          color: '#fff',
                          fontSize: '13px',
                          fontWeight: 800,
                          padding: '4px 14px',
                          borderRadius: '8px',
                          zIndex: 2,
                          backdropFilter: 'blur(4px)',
                          boxShadow: '0 2px 8px rgba(4,120,87,0.3)',
                        }}
                      >
                        بعد
                      </figcaption>
                      <img
                        src={afterPic}
                        alt={'بعد — ' + cleanName}
                        style={{
                          width: '100%',
                          maxHeight: '520px',
                          objectFit: 'contain',
                          borderRadius: '16px',
                          background: '#f8fafc',
                          border: '1.5px solid #e2e8f0',
                        }}
                      />
                    </figure>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
                    <p style={{ fontSize: '15px', fontWeight: 600 }}>صور قبل وبعد غير متاحة حالياً لهذه الحالة.</p>
                  </div>
                )}

                {/* Summary bar */}
                <div
                  style={{
                    marginTop: '22px',
                    padding: '14px 18px',
                    background: '#f8fafc',
                    borderRadius: '14px',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '12px',
                  }}
                >
                  <div>
                    <strong style={{ fontSize: '14.5px', color: '#047857', display: 'block' }}>
                      نزول {selectedPreviewCase.weightLostKg} كجم خلال {selectedPreviewCase.durationText}
                    </strong>
                    {selectedPreviewCase.beforeWeight && selectedPreviewCase.afterWeight && (
                      <span style={{ fontSize: '12.5px', color: '#64748b' }}>
                        الوزن السابق: {selectedPreviewCase.beforeWeight} كجم ➔ الوزن الحالي: {selectedPreviewCase.afterWeight} كجم
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    className="btn is-outline"
                    style={{ fontSize: '12px', padding: '6px 14px', borderRadius: '8px', color: '#047857', borderColor: '#a7f3d0' }}
                    onClick={() => {
                      const c = selectedPreviewCase;
                      setSelectedPreviewCase(null);
                      handleOpenEdit(c, false, 'transformation');
                    }}
                  >
                    <Pencil size={13} /> تعديل بيانات وصور الحالة
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Full Resolution Image Lightbox Modal */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            zIndex: 99999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            cursor: 'zoom-out',
          }}
        >
          <div
            style={{ position: 'relative', maxWidth: '90vw', maxHeight: '85vh' }}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={previewImage}
              alt="معاينة كاملة"
              style={{
                maxWidth: '90vw',
                maxHeight: '85vh',
                borderRadius: '12px',
                objectFit: 'contain',
                boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
              }}
            />
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              style={{
                position: 'absolute',
                top: '-12px',
                left: '-12px',
                background: '#fff',
                color: '#0f172a',
                border: '2px solid #cbd5e1',
                borderRadius: '50%',
                width: '34px',
                height: '34px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              }}
            >
              <X size={16} />
            </button>
          </div>
          <span style={{ color: '#e2e8f0', fontSize: '12px', marginTop: '12px' }}>
            اضغطي في أي مكان للإغلاق
          </span>
        </div>
      )}
    </div>
  );
}
