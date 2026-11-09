export function PublicIntro({
  kicker,
  title,
  children,
}: {
  kicker: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="public-intro">
      <div className="kicker">{kicker}</div>
      <h1>{title}</h1>
      <p>{children}</p>
    </div>
  );
}
