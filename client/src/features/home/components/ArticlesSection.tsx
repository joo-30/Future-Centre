import { resolveArticleImage, type Article } from '@future/shared';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const studioArtwork = new Map([
  [
    'meal-planning',
    { original: '/assets/food-editorial.png', cover: '/assets/journal-meal-ribbon.webp' },
  ],
  [
    'first-consultation',
    { original: '/assets/consultation.png', cover: '/assets/journal-consultation.webp' },
  ],
  [
    'your-personal-plan',
    { original: '/assets/hero-sculpture.png', cover: '/assets/journal-calendar.webp' },
  ],
]);

function coverFor(article: Article) {
  const artwork = studioArtwork.get(article.slug);
  const original = resolveArticleImage(article.image);
  return artwork && (!article.image?.trim() || artwork.original === original)
    ? artwork.cover
    : original;
}

function readingTime(minutes: number) {
  if (minutes === 1) return 'دقيقة قراءة';
  if (minutes === 2) return 'دقيقتان قراءة';
  const number = new Intl.NumberFormat('ar-EG').format(minutes);
  return `${number} ${minutes >= 3 && minutes <= 10 ? 'دقائق' : 'دقيقة'} قراءة`;
}

export function ArticleArtwork({ article, featured = false }: { article: Article; featured?: boolean }) {
  const source = coverFor(article);
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const fallback = resolveArticleImage(article.image);
  return (
    <img
      src={failedSource === source ? '/assets/food-editorial.png' : source}
      alt=""
      width={featured ? 1200 : 640}
      height={featured ? 800 : 640}
      loading="lazy"
      decoding="async"
      onError={(event) => {
        // Try the original catalog image before the local editorial fallback.
        if (event.currentTarget.getAttribute('src') === source && source !== fallback) {
          event.currentTarget.src = fallback;
        } else {
          setFailedSource(source);
        }
      }}
    />
  );
}

function ArticleMeta({ article }: { article: Article }) {
  return (
    <div className="journal-meta">
      <span className="journal-category">{article.category}</span>
      <span className="journal-reading-time">{readingTime(article.minutes)}</span>
    </div>
  );
}

export function ArticlesSection({ articles }: { articles: Article[] }) {
  const published = articles.filter((article) => article.published !== false);
  const featured = published.find((article) => article.slug === 'meal-planning') ?? published[0];
  const others = published.filter((article) => article.slug !== featured?.slug).slice(0, 2);

  return (
    <section className="journal-section" id="journal" aria-labelledby="journal-heading">
      <header className="journal-section-heading">
        <div>
          <p className="journal-eyebrow">مفكرة التغذية والعافية</p>
          <h2 id="journal-heading">
            <span>معرفة بسيطة.</span>
            <span>تفرق في يومكِ.</span>
          </h2>
          <p className="journal-description">قراءة خفيفة تساعدكِ تفهمي جسمكِ وتختاري بوعي.</p>
        </div>
        <Link to="/articles" className="journal-all-link">
          كل المقالات <ArrowLeft size={22} aria-hidden="true" />
        </Link>
      </header>

      {featured ? (
        <div className="journal-section-content">
          <article className="journal-lead">
            <Link
              className="journal-lead-link"
              to={'/articles/' + featured.slug}
              aria-labelledby={'journal-title-' + featured.slug}
            >
              <div className="journal-lead-art" aria-hidden="true">
                <ArticleArtwork article={featured} featured />
              </div>
              <div className="journal-lead-copy">
                <ArticleMeta article={featured} />
                <h3 id={'journal-title-' + featured.slug}>{featured.title}</h3>
                <span className="journal-lead-read">
                  اقرئي المقال <ArrowLeft size={23} aria-hidden="true" />
                </span>
              </div>
            </Link>
          </article>
          {others.length > 0 && (
            <div className="journal-notes-grid">
              {others.map((article) => (
                <article className="journal-note" key={article.slug}>
                  <Link
                    className="journal-note-link"
                    to={'/articles/' + article.slug}
                    aria-labelledby={'journal-title-' + article.slug}
                  >
                    <div className="journal-note-art" aria-hidden="true">
                      <ArticleArtwork article={article} />
                    </div>
                    <div className="journal-note-copy">
                      <ArticleMeta article={article} />
                      <h3 id={'journal-title-' + article.slug}>{article.title}</h3>
                      <span className="journal-note-read">
                        اقرئي المقال <ArrowLeft size={20} aria-hidden="true" />
                      </span>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          )}
        </div>
      ) : (
        <p className="journal-empty">مقالات المركز هتظهر هنا بعد نشرها.</p>
      )}
    </section>
  );
}
