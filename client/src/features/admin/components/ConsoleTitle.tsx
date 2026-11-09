export function ConsoleTitle({
  kicker = 'إدارة المركز',
  title,
  description,
  children,
}: {
  kicker?: string;
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="console-title">
      <div>
        <span className="kicker">{kicker}</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {children}
    </div>
  );
}
