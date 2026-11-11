import { Download, Smartphone } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  getDeferredPrompt,
  isIOSDevice,
  isStandalone,
  promptPwaInstall,
  subscribePwaState,
} from '../../lib/pwa';
import { PwaGuideModal } from './PwaGuideModal';

export function PwaInstallButton({
  className = '',
  variant = 'header',
}: {
  className?: string;
  variant?: 'header' | 'account' | 'auth' | 'mobile';
}) {
  const [standalone, setStandalone] = useState(false);
  const [hasPrompt, setHasPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    setStandalone(isStandalone());
    setIsIOS(isIOSDevice());

    const check = () => {
      setHasPrompt(!!getDeferredPrompt());
    };
    check();
    const unsub = subscribePwaState(check);
    return unsub;
  }, []);

  // If already running inside installed standalone app, do not display
  if (standalone) return null;

  const handleClick = async () => {
    if (isIOS) {
      setModalOpen(true);
      return;
    }

    if (hasPrompt) {
      const accepted = await promptPwaInstall();
      if (accepted) return;
    } else {
      // In case beforeinstallprompt not fired yet or on desktop
      setModalOpen(true);
    }
  };

  if (variant === 'mobile') {
    return (
      <>
        <button
          type="button"
          className={`mobile-pwa-install-btn ${className}`}
          onClick={handleClick}
          title="تثبيت التطبيق على هاتفك"
        >
          <span className="mobile-pwa-icon">
            <Smartphone size={20} strokeWidth={2.2} />
          </span>
          <span className="mobile-pwa-text">
            <strong>تثبيت التطبيق</strong>
            <small>وصول أسرع بدون متصفح</small>
          </span>
          <Download size={18} className="mobile-pwa-arrow" strokeWidth={2.2} />
        </button>

        <PwaGuideModal
          isOpen={modalOpen}
          isIOS={isIOS}
          onClose={() => setModalOpen(false)}
        />
      </>
    );
  }

  if (variant === 'account') {
    return (
      <>
        <button
          type="button"
          className={`account-pwa-install-btn ${className}`}
          onClick={handleClick}
          title="تثبيت تطبيق مركز المستقبل على هاتفك"
        >
          <Download size={17} strokeWidth={2.2} />
          <span>تثبيت التطبيق 📲</span>
        </button>

        <PwaGuideModal
          isOpen={modalOpen}
          isIOS={isIOS}
          onClose={() => setModalOpen(false)}
        />
      </>
    );
  }

  // Header / Navbar & Auth default
  return (
    <>
      <button
        type="button"
        className={`head-pwa-btn ${className}`}
        onClick={handleClick}
        title="تثبيت التطبيق على جهازك"
        aria-label="تثبيت تطبيق مركز المستقبل"
      >
        <Smartphone size={17} strokeWidth={2.2} />
        <span>تثبيت التطبيق</span>
      </button>

      <PwaGuideModal
        isOpen={modalOpen}
        isIOS={isIOS}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}
