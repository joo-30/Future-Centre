import type { Service } from '@future/shared';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Clock,
  EyeOff,
  Globe,
  Heart,
  Leaf,
  Pencil,
  Plus,
  Shield,
  Star,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { Button, ErrorState, Loading, Modal } from '../../../components/ui';
import { formatPrice } from '../../../lib/api';
import { adminApi } from '../../../lib/portal-api';
import { ConsoleTitle } from '../components/ConsoleTitle';
import { Notice } from '../components/Notice';
import { refreshAdmin } from '../lib/cache';
import { ServiceEditor } from './ServiceEditor';

const ICON_MAP = {
  leaf: Leaf,
  heart: Heart,
  shield: Shield,
};

const blankService: Service = {
  id: '',
  slug: '',
  title: '',
  description: '',
  price: 500,
  duration: 30,
  sessions: 1,
  period: 'جلسة فردية بالعيادة',
  icon: 'leaf',
  featured: false,
  includes: [
    'جلسة كشف وتقييم سريري شامل بمقر المركز',
    'قياس دقيق لمكونات الجسم ونسبة الدهون (InBody)',
    'تصميم خطة تغذية مخصصة تناسب روتينك اليومي',
  ],
  body: [
    'جلسات المتابعة تعقد أسبوعياً بمقر العيادة لمراجعة التطور وتعديل الخطة الغذائية.',
    'أرسلي طلب البرنامج وسيتواصل المركز معكِ لتأكيد الموعد المناسب لزيارتك.',
  ],
  active: true,
};

export function AdminPrograms() {
  const client = useQueryClient();
  const servicesQuery = useQuery({ queryKey: ['admin', 'services'], queryFn: adminApi.services });
  const [editing, setEditing] = useState<Service | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Service | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const services = servicesQuery.data?.services || [];

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleteBusy(true);
    setErrorMessage('');
    try {
      await adminApi.deleteService(deleteTarget.id);
      setDeleteTarget(null);
      setMessage(`تم حذف برنامج "${deleteTarget.title}" بنجاح.`);
      refreshAdmin(client);
      void client.invalidateQueries({ queryKey: ['admin', 'services'] });
      void client.invalidateQueries({ queryKey: ['catalog'] });
    } catch (e) {
      setErrorMessage((e as Error).message);
    } finally {
      setDeleteBusy(false);
    }
  }

  async function toggleActive(service: Service) {
    const nextActive = service.active === false;
    try {
      await adminApi.saveService({
        ...service,
        active: nextActive,
      });
      setMessage(
        nextActive
          ? `تم إظهار برنامج "${service.title}" على الموقع بنجاح.`
          : `تم إخفاء برنامج "${service.title}" من الموقع.`,
      );
      refreshAdmin(client);
      void client.invalidateQueries({ queryKey: ['admin', 'services'] });
      void client.invalidateQueries({ queryKey: ['catalog'] });
    } catch (e) {
      setErrorMessage((e as Error).message);
    }
  }

  async function toggleFeatured(service: Service) {
    const nextFeatured = !service.featured;
    try {
      await adminApi.saveService({
        ...service,
        featured: nextFeatured,
      });
      setMessage(
        nextFeatured
          ? `تم تمييز برنامج "${service.title}" ليظهر في أعلى الصفحة الرئيسية.`
          : `تم إلغاء تمييز برنامج "${service.title}".`,
      );
      refreshAdmin(client);
      void client.invalidateQueries({ queryKey: ['admin', 'services'] });
      void client.invalidateQueries({ queryKey: ['catalog'] });
    } catch (e) {
      setErrorMessage((e as Error).message);
    }
  }

  return (
    <>
      <ConsoleTitle
        title="البرامج والخدمات العلاجية"
        description="إدارة باقات التغذية وجلسات الاستشارة وأسعارها الظاهرة للمراجعين بالموقع."
      >
        <Button icon={false} onClick={() => setEditing({ ...blankService })}>
          <Plus size={19} />
          إضافة برنامج جديد
        </Button>
      </ConsoleTitle>

      <Notice message={message} />
      {errorMessage && <Notice message={errorMessage} error />}

      <div className="prog-notice-strip">
        <Leaf size={18} />
        <span>
          تعديل أسعار وباقات الخدمات ينعكس فورياً على صفحة الحجز والباقات بالموقع العام، مع الاحتفاظ
          بالأسعار المسجلة في الحجوزات السابقة.
        </span>
      </div>

      {servicesQuery.isPending ? (
        <Loading />
      ) : servicesQuery.error ? (
        <ErrorState
          message={servicesQuery.error.message}
          onRetry={() => void servicesQuery.refetch()}
        />
      ) : services.length === 0 ? (
        <div className="admin-empty-card">
          <p>لا توجد برامج مضافة حالياً. يمكنك البدء بإضافة باقتك الأولى.</p>
          <Button icon={false} onClick={() => setEditing({ ...blankService })}>
            <Plus size={19} />
            إضافة أول برنامج
          </Button>
        </div>
      ) : (
        <div className="prog-cards-grid">
          {services.map((s) => {
            const IconComp = ICON_MAP[s.icon] || Leaf;
            const isActive = s.active !== false;

            return (
              <article
                key={s.id}
                className={`prog-luxury-card ${s.featured ? 'is-featured' : ''} ${
                  isActive ? 'is-active' : 'is-inactive'
                }`}
              >
                {/* Top Badge & Icon Bar */}
                <div className="prog-card-top-bar">
                  <div className={`prog-icon-badge ${s.icon}`}>
                    <IconComp size={22} />
                  </div>

                  <div className="prog-badges-cluster">
                    {s.featured && (
                      <span className="prog-badge featured">
                        <Star size={12} fill="currentColor" />
                        باقة مميزة
                      </span>
                    )}
                    <span className={`prog-badge ${isActive ? 'active' : 'inactive'}`}>
                      {isActive ? (
                        <>
                          <CheckCircle2 size={12} />
                          ظاهر بالموقع
                        </>
                      ) : (
                        <>
                          <EyeOff size={12} />
                          مخفي
                        </>
                      )}
                    </span>
                  </div>
                </div>

                {/* Title & Description */}
                <div className="prog-card-info">
                  <h2>{s.title}</h2>
                  <p>{s.description}</p>
                </div>

                {/* Specs Pill Strip */}
                <div className="prog-specs-strip">
                  <span className="spec-item">
                    <Clock size={13} />
                    {s.duration} دقيقة / جلسة
                  </span>
                  <span className="spec-item">
                    {s.sessions} جلسات · {s.period}
                  </span>
                </div>

                {/* Price Display */}
                <div className="prog-price-display">
                  {s.price !== null ? (
                    <>
                      <span className="price-num">{formatPrice(s.price)}</span>
                      <span className="price-curr">ج.م</span>
                    </>
                  ) : (
                    <span className="price-custom">يُحدد بعد الاستشارة</span>
                  )}
                </div>

                {/* Features List */}
                <ul className="prog-features-list">
                  {s.includes.map((feat) => (
                    <li key={feat}>
                      <span className="check-bullet">
                        <Check size={13} />
                      </span>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>

                {/* Action Buttons Row */}
                <div className="prog-actions-row">
                  <button
                    type="button"
                    className={`prog-action-btn ${isActive ? 'deactivate' : 'activate'}`}
                    onClick={() => toggleActive(s)}
                    title={isActive ? 'إخفاء من الموقع' : 'إظهار بالموقع'}
                  >
                    {isActive ? (
                      <>
                        <EyeOff size={14} />
                        إخفاء
                      </>
                    ) : (
                      <>
                        <Globe size={14} />
                        إظهار
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    className={`prog-action-btn ${s.featured ? 'unstar' : 'star'}`}
                    onClick={() => toggleFeatured(s)}
                    title={s.featured ? 'إلغاء التمييز' : 'تمييز كباقة مفضلة'}
                  >
                    <Star size={14} fill={s.featured ? 'currentColor' : 'none'} />
                    {s.featured ? 'مميز' : 'تمييز'}
                  </button>

                  <Button
                    kind="outline"
                    icon={false}
                    className="prog-btn-edit"
                    onClick={() => setEditing(s)}
                  >
                    <Pencil size={15} />
                    تعديل
                  </Button>

                  <button
                    type="button"
                    className="prog-btn-delete"
                    onClick={() => setDeleteTarget(s)}
                    title="حذف البرنامج نهائياً"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Edit / Add Modal */}
      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing?.id ? `تعديل باقة: ${editing.title || ''}` : 'إضافة برنامج علاجي جديد'}
      >
        {editing && (
          <ServiceEditor
            key={editing.id || 'new'}
            service={editing}
            onSaved={() => {
              setEditing(null);
              setMessage('تم حفظ ومزامنة البرنامج مع الموقع العام بنجاح.');
              refreshAdmin(client);
              void client.invalidateQueries({ queryKey: ['admin', 'services'] });
              void client.invalidateQueries({ queryKey: ['catalog'] });
            }}
          />
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={!!deleteTarget}
        onClose={() => !deleteBusy && setDeleteTarget(null)}
        title="تأكيد حذف البرنامج العلاجي"
      >
        {deleteTarget && (
          <div className="art-delete-dialog">
            <div className="art-delete-icon-box">
              <AlertTriangle size={32} />
            </div>
            <h3>هل أنتِ متأكدة من حذف هذا البرنامج؟</h3>
            <p className="art-delete-target-title">«{deleteTarget.title}»</p>
            <p className="art-delete-warning">
              سيتم إزالة هذا البرنامج من الموقع العام وباقات الحجز. الحجوزات السابقة المسجلة على
              هذا البرنامج لن تتأثر.
            </p>

            <div className="art-delete-actions">
              <Button
                icon={false}
                kind="outline"
                disabled={deleteBusy}
                onClick={() => setDeleteTarget(null)}
              >
                إلغاء الأمر
              </Button>
              <button
                type="button"
                className="art-confirm-delete-btn"
                disabled={deleteBusy}
                onClick={handleDelete}
              >
                <Trash2 size={16} />
                {deleteBusy ? 'جاري الحذف...' : 'تأكيد الحذف النهائي'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
