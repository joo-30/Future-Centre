import { type ReactNode } from 'react';

export function ContentPreview({
  title,
  children,
  artwork,
  dark = false,
}: {
  title: string;
  children?: ReactNode;
  artwork?: ReactNode;
  dark?: boolean;
}) {
  return (
    <details className="admin-content-preview">
      <summary>معاينة على الموقع</summary>
      <article className={'content-preview-card' + (dark ? ' is-dark' : '')}>
        <div>
          <h3>{title}</h3>
          {children}
        </div>
        {artwork && <div className="content-preview-art">{artwork}</div>}
      </article>
    </details>
  );
}
