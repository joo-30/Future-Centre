import { resolveArticleImage, type Article } from '@future/shared';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertTriangle,
  CheckCircle2,
  EyeOff,
  Globe,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { Button, ErrorState, Loading, Modal } from '../../../components/ui';
import { adminApi } from '../../../lib/portal-api';
import { ConsoleTitle } from '../components/ConsoleTitle';
import { Notice } from '../components/Notice';
import { refreshAdmin } from '../lib/cache';
import { ArticleEditor } from './ArticleEditor';

export function AdminArticles() {
  const client = useQueryClient();
  const articlesQuery = useQuery({ queryKey: ['admin', 'articles'], queryFn: adminApi.articles });
  const [edit, setEdit] = useState<Article | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Article | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const blank: Article = {
    slug: '',
    title: '',
    category: 'نصائح التغذية',
    minutes: 3,
    image: 'food-editorial.png',
    intro: '',
    body: [],
    published: true, // Defaults to published so new articles appear immediately on the public site!
  };

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleteBusy(true);
    setErrorMessage('');
    try {
      await adminApi.deleteArticle(deleteTarget.slug);
      setDeleteTarget(null);
      setMessage(`تم حذف مقال "${deleteTarget.title}" بنجاح.`);
      refreshAdmin(client);
      void client.invalidateQueries({ queryKey: ['admin', 'articles'] });
      void client.invalidateQueries({ queryKey: ['catalog'] });
    } catch (e) {
      setErrorMessage((e as Error).message);
    } finally {
      setDeleteBusy(false);
    }
  }

  async function toggleStatus(article: Article) {
    const nextPublished = article.published === false;
    try {
      await adminApi.saveArticle({
        ...article,
        published: nextPublished,
      });
      setMessage(
        nextPublished
          ? `تم نشر مقال "${article.title}" على الموقع بنجاح.`
          : `تم تحويل مقال "${article.title}" إلى مسودة خاصة.`,
      );
      refreshAdmin(client);
      void client.invalidateQueries({ queryKey: ['admin', 'articles'] });
      void client.invalidateQueries({ queryKey: ['catalog'] });
    } catch (e) {
      setErrorMessage((e as Error).message);
    }
  }

  return (
    <>
      <ConsoleTitle
        title="المقالات والمحتوى الطبي"
        description="إدارة مقالات التغذية والتوعية السريرية المنشورة على الموقع وتحت إشراف المركز."
      >
        <Button icon={false} onClick={() => setEdit(blank)}>
          <Plus size={18} />
          إضافة مقال جديد
        </Button>
      </ConsoleTitle>

      <Notice message={message} />
      {errorMessage && <Notice message={errorMessage} error />}

      {articlesQuery.isPending ? (
        <Loading />
      ) : articlesQuery.error ? (
        <ErrorState message={articlesQuery.error.message} />
      ) : articlesQuery.data?.articles.length === 0 ? (
        <div className="admin-empty-card">
          <p>لا توجد مقالات مضافة حالياً. يمكنك البدء بإضافة مقالك الأول.</p>
          <Button icon={false} onClick={() => setEdit(blank)}>
            <Plus size={18} />
            إضافة أول مقال
          </Button>
        </div>
      ) : (
        <div className="admin-article-list">
          {articlesQuery.data?.articles.map((a) => {
            const isPub = a.published !== false;
            return (
              <article key={a.slug} className={`art-card ${isPub ? 'is-published' : 'is-draft'}`}>
                <div className="art-card-img-wrap">
                  <img
                    src={resolveArticleImage(a.image)}
                    alt={a.title}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = '/assets/food-editorial.png';
                    }}
                  />
                  <span className={`art-card-badge ${isPub ? 'pub' : 'draft'}`}>
                    {isPub ? (
                      <>
                        <CheckCircle2 size={13} />
                        منشور على الموقع
                      </>
                    ) : (
                      <>
                        <EyeOff size={13} />
                        مسودة خاصة
                      </>
                    )}
                  </span>
                </div>

                <div className="art-card-body">
                  <span className="kicker">
                    {a.category} · {a.minutes} دقائق قراءة
                  </span>
                  <h2>{a.title}</h2>
                  <p>{a.intro}</p>
                  <span className="art-slug-tag" dir="ltr">
                    /articles/{a.slug}
                  </span>
                </div>

                <div className="art-card-actions">
                  <button
                    type="button"
                    className={`art-btn-status ${isPub ? 'unpublish' : 'publish'}`}
                    onClick={() => toggleStatus(a)}
                    title={isPub ? 'إخفاء من الموقع وتحويله لمسودة' : 'نشر المقال فوراً على الموقع'}
                  >
                    {isPub ? (
                      <>
                        <EyeOff size={15} />
                        إخفاء لمسودة
                      </>
                    ) : (
                      <>
                        <Globe size={15} />
                        نشر على الموقع
                      </>
                    )}
                  </button>

                  <Button icon={false} kind="outline" onClick={() => setEdit(a)}>
                    <Pencil size={16} />
                    تعديل
                  </Button>

                  <button
                    type="button"
                    className="art-btn-delete"
                    onClick={() => setDeleteTarget(a)}
                    title="حذف المقال نهائياً"
                  >
                    <Trash2 size={16} />
                    حذف
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Edit / Add Modal */}
      <Modal
        open={!!edit}
        onClose={() => setEdit(null)}
        title={edit?.slug ? `تعديل مقال: ${edit.title || ''}` : 'إضافة مقال جديد للموقع'}
      >
        {edit && (
          <ArticleEditor
            article={edit}
            onSaved={() => {
              setEdit(null);
              setMessage('تم حفظ المقال وحالة نشره بنجاح.');
              refreshAdmin(client);
              void client.invalidateQueries({ queryKey: ['admin', 'articles'] });
              void client.invalidateQueries({ queryKey: ['catalog'] });
            }}
          />
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={!!deleteTarget}
        onClose={() => !deleteBusy && setDeleteTarget(null)}
        title="تأكيد حذف المقال"
      >
        {deleteTarget && (
          <div className="art-delete-dialog">
            <div className="art-delete-icon-box">
              <AlertTriangle size={32} />
            </div>
            <h3>هل أنتِ متأكدة من رغبتك في حذف هذا المقال؟</h3>
            <p className="art-delete-target-title">«{deleteTarget.title}»</p>
            <p className="art-delete-warning">
              سيتم إزالة المقال نهائياً من الموقع وصفحات المراجعين وقاعدة البيانات، ولا يمكن
              التراجع عن هذا الإجراء.
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
