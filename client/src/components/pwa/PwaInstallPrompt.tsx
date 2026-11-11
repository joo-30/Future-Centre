import { Download, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  getDeferredPrompt,
  isIOSDevice,
  isStandalone,
  promptPwaInstall,
  subscribePwaState,
} from '../../lib/pwa';
import { PwaGuideModal } from './PwaGuideModal';

export function PwaInstallPrompt() {
  const [standalone, setStandalone] = useState(false);
  const [hasPrompt, setHasPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const isApp = isStandalone();
    setStandalone(isApp);
    if (isApp) return;

    const ios = isIOSDevice();
    setIsIOS(ios);

    // Check dismissal state (7-day silence if dismissed)
    const lastDismissed = localStorage.getItem('fc_pwa_dismissed_at');
    if (lastDismissed) {
      const diffDays =
        (Date.now() - parseInt(lastDismissed, 10)) / (1000 * 60 * 60 * 24);
      if (diffDays < 7) {
        setDismissed(true);
        return;
      }
    }
    setDismissed(false);

    const check = () => {
      setHasPrompt(!!getDeferredPrompt());
    };
    check();
    const unsub = subscribePwaState(check);
    return unsub;
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('fc_pwa_dismissed_at', Date.now().toString());
  };

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowModal(true);
      return;
    }

    if (hasPrompt) {
      const accepted = await promptPwaInstall();
      if (accepted) {
        setDismissed(true);
      }
    } else {
      setShowModal(true);
    }
  };

  if (standalone || dismissed) return null;

  return (
    <>
      {/* Floating PWA Install Bar */}
      <aside
        className="pwa-install-bar"
        role="region"
        aria-label="تثبيت تطبيق مركز المستقبل"
      >
        <div className="pwa-install-content">
          <div className="pwa-app-icon-wrap">
            <img
              src="/icons/pwa-192x192.png"
              alt="تطبيق مركز المستقبل"
              className="pwa-app-icon"
              width={42}
              height={42}
            />
          </div>
          <div className="pwa-text-group">
            <strong className="pwa-title">تطبيق مركز المستقبل</strong>
            <span className="pwa-desc">
              {isIOS
                ? 'ثبّت التطبيق على الآيفون لمتابعة أسرع'
                : 'حمّل التطبيق على هاتفك لوصول أسرع بدون متصفح'}
            </span>
          </div>
        </div>

        <div className="pwa-action-group">
          <button
            type="button"
            className="pwa-install-btn"
            onClick={handleInstallClick}
          >
            <Download size={15} />
            <span>تثبيت التطبيق</span>
          </button>
          <button
            type="button"
            className="pwa-close-btn"
            onClick={handleDismiss}
            aria-label="إغلاق التنبيه"
          >
            <X size={16} />
          </button>
        </div>
      </aside>

      {/* Guide Modal */}
      <PwaGuideModal
        isOpen={showModal}
        isIOS={isIOS}
        onClose={() => setShowModal(false)}
      />
    </>
  );
}
