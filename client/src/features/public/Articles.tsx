import { resolveArticleImage } from '@future/shared';
import { ArrowLeft } from 'lucide-react';
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap, isReducedMotion, useGSAP } from '../../lib/motion';
import { PublicIntro } from '../../components/PublicIntro';
import { ErrorState, Loading } from '../../components/ui';
import { useCatalog } from '../../hooks/useCatalog';

export function Articles() {
  const mainRef = useRef<HTMLElement>(null);
  const { data, isPending, error, refetch } = useCatalog();

  useGSAP(
    () => {
      if (isPending || !data || !mainRef.current || isReducedMotion()) return;
      const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
      tl.fromTo('.public-intro', { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.65 })
        .fromTo(
          '.article-grid .article-list-card',
          { opacity: 0, y: 18 },
          { opacity: 1, y: 0, duration: 0.7, stagger: 0.08, ease: 'power2.out' },
          '-=0.3'
        );
    },
    { scope: mainRef, dependencies: [isPending, data] }
  );
  if (isPending) return <Loading />;
  if (!data)
    return (
      <ErrorState
        message={error?.message || 'تعذر تحميل المقالات.'}
        onRetry={() => void refetch()}
      />
    );
  return (
    <main ref={mainRef} className="public-page">
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
