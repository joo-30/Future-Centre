import { Laptop, Share2, Smartphone, X } from 'lucide-react';
import { useEffect } from 'react';

export function PwaGuideModal({
  isOpen,
  isIOS,
  onClose,
}: {
  isOpen: boolean;
  isIOS: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="pwa-ios-modal-backdrop" onClick={onClose}>
      <div
        className="pwa-ios-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="pwa-modal-title"
      >
        <div className="pwa-ios-header">
          <div className="pwa-ios-title-wrap">
            {isIOS ? (
              <Smartphone size={20} className="text-teal-600" />
            ) : (
              <Laptop size={20} className="text-teal-600" />
            )}
            <h3 id="pwa-modal-title" className="pwa-ios-title">
              {isIOS
                ? 'تثبيت التطبيق على جهاز الآيفون (iOS)'
                : 'تثبيت التطبيق على جهازك'}
            </h3>
          </div>
          <button
            type="button"
            className="pwa-ios-close"
            onClick={onClose}
            aria-label="إغلاق"
          >
            <X size={18} />
          </button>
        </div>

        <div className="pwa-ios-body">
          {isIOS ? (
            <>
              <p className="pwa-ios-intro">
                يمكنك تحويل المنصة لتطبيق رسمي على شاشة الآيفون في ثوانٍ عبر
                متصفح سفاري (Safari):
              </p>

              <ol className="pwa-ios-steps">
                <li className="pwa-ios-step">
                  <span className="step-num">1</span>
                  <div className="step-text">
                    اضغط على زر <strong>المشاركة (Share)</strong>{' '}
                    <Share2 size={16} className="inline-icon" /> في شريط متصفح
                    سفاري بالأسفل.
                  </div>
                </li>
                <li className="pwa-ios-step">
                  <span className="step-num">2</span>
                  <div className="step-text">
                    مرر لأسفل القائمة واختر{' '}
                    <strong>
                      "إضافة إلى الشاشة الرئيسية" (Add to Home Screen) ➕
                    </strong>
                    .
                  </div>
                </li>
                <li className="pwa-ios-step">
                  <span className="step-num">3</span>
                  <div className="step-text">
                    اضغط على <strong>"إضافة" (Add)</strong> في الزاوية العلوية.
                  </div>
                </li>
              </ol>
            </>
          ) : (
            <>
              <p className="pwa-ios-intro">
                يمكنك تثبيت منصة مركز المستقبل كتطبيق مستقل على هاتفك أو
                كمبيوترك:
              </p>

              <ol className="pwa-ios-steps">
                <li className="pwa-ios-step">
                  <span className="step-num">1</span>
                  <div className="step-text">
                    اضغط على أيقونة <strong>التثبيت (Install ⊕)</strong> في شريط
                    العنوان أعلى المتصفح، أو افتح قائمة الخيارات (⋮).
                  </div>
                </li>
                <li className="pwa-ios-step">
                  <span className="step-num">2</span>
                  <div className="step-text">
                    اختر{' '}
                    <strong>
                      "تثبيت تطبيق مركز المستقبل" (Install App)
                    </strong>
                    .
                  </div>
                </li>
                <li className="pwa-ios-step">
                  <span className="step-num">3</span>
                  <div className="step-text">
                    سيفتح التطبيق مباشرة في نافذة مستقلة كاملة الشاشة مع أيقونة
                    على شاشة هاتفك أو سطح المكتب.
                  </div>
                </li>
              </ol>
            </>
          )}

          <div className="pwa-ios-preview-card">
            <img
              src="/icons/pwa-192x192.png"
              alt="أيقونة التطبيق"
              className="preview-icon"
              width={48}
              height={48}
            />
            <div className="preview-info">
              <strong>مركز المستقبل للتغذية العلاجية</strong>
              <span>تطبيق سريع، بدون متصفح، مع حفظ دائم لبياناتك</span>
            </div>
          </div>
        </div>

        <div className="pwa-ios-footer">
          <button type="button" className="pwa-ios-done-btn" onClick={onClose}>
            فهمت الطريقة
          </button>
        </div>
      </div>
    </div>
  );
}
