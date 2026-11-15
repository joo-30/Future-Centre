import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '../../../components/ui';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class AdminPageErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('AdminPageErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="admin-page-error-fallback" role="alert">
          <div className="admin-error-box">
            <div className="admin-error-icon-wrap">
              <AlertTriangle size={36} />
            </div>
            <h2>تعذر عرض بيانات هذا القسم الآن</h2>
            <p>
              حدث خطأ غير متوقع في قراءة البيانات المنقولة أو عرضها. لوحة الإدارة وقوائمها لا تزال تعمل بشكل كامل.
            </p>
            {this.state.error?.message && (
              <pre className="admin-error-message">{this.state.error.message}</pre>
            )}
            <div className="admin-error-btns">
              <Button
                icon={false}
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.reload();
                }}
              >
                <RefreshCw size={16} />
                إعادة المحاولة
              </Button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
