import { resolveArticleImage } from '@future/shared';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PublicIntro } from '../../components/PublicIntro';
import { ErrorState, Loading } from '../../components/ui';
import { useCatalog } from '../../hooks/useCatalog';

export function Articles() {
  const { data, isPending, error, refetch } = useCatalog();
  if (isPending) return <Loading />;
  if (!data)
    return (
      <ErrorState
        message={error?.message || 'تعذر تحميل المقالات.'}
        onRetry={() => void refetch()}
      />
    );
  return (
    <main className="public-page">
      <PublicIntro kicker="مفكرة التغذية" title="معرفة بسيطة، ليوم أفضل.">
        أفكار لتنظيم يومك والاستعداد للاستشارة. المحتوى عام ولا يحدد خطة علاجية.
      </PublicIntro>
      <div className="article-grid">
        {data.articles.map((a) => (
          <article className="article-list-card" key={a.slug}>
            <Link to={'/articles/' + a.slug}>
              <img src={resolveArticleImage(a.image)} alt="" loading="lazy" />
              <span className="kicker">
                {a.category} · {a.minutes} دقائق
              </span>
              <h2>{a.title}</h2>
              <p>{a.intro}</p>
              <span className="link">
                اقرئي المقال
                <ArrowLeft size={20} />
              </span>
            </Link>
          </article>
        ))}
      </div>
    </main>
  );
}
