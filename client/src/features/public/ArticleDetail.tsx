import { resolveArticleImage } from '@future/shared';
import { Link, useParams } from 'react-router-dom';
import { PublicIntro } from '../../components/PublicIntro';
import { ButtonLink, Loading } from '../../components/ui';
import { useCatalog } from '../../hooks/useCatalog';
import { NotFound } from './NotFound';

export function ArticleDetail() {
  const { slug } = useParams();
  const { data, isPending } = useCatalog();
  if (isPending) return <Loading />;
  const a = data?.articles.find((a) => a.slug === slug);
  if (!a) return <NotFound />;
  return (
    <main className="public-page reading-page">
      <div className="crumb">
        <Link to="/articles">مقالات ونصائح</Link> / {a.category}
      </div>
      <PublicIntro kicker={a.category + ' · قراءة ' + a.minutes + ' دقائق'} title={a.title}>
        {a.intro}
      </PublicIntro>
      <img className="reading-image" src={resolveArticleImage(a.image)} alt="صورة تعبيرية" />
      <article className="prose">
        {a.body.map((p, i) => (
          <section key={p}>
            <h2>{['بداية هادئة', 'خطوة تناسب يومك', 'ناقشي التفاصيل مع المختصة'][i]}</h2>
            <p>{p}</p>
          </section>
        ))}
      </article>
      <div className="reading-cta">
        <h3>تحتاجين خطة تناسب احتياجك؟</h3>
        <ButtonLink to="/booking">احجزي استشارتك</ButtonLink>
      </div>
    </main>
  );
}
