import React from 'react';

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed)
      return (
        <main className="error-state">
          <h1>تعذر عرض الصفحة الآن.</h1>
          <p>يمكنك إعادة تحميل الصفحة والمحاولة مرة أخرى.</p>
          <button className="btn" onClick={() => window.location.reload()}>
            إعادة التحميل
          </button>
        </main>
      );
    return this.props.children;
  }
}
