import {
  AlertCircle,
  Camera,
  CheckCircle2,
  Clock,
  FileImage,
  Keyboard,
  Loader2,
  RefreshCw,
  ScanLine,
  Sparkles,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import { adminApi } from '../../../lib/portal-api';

export interface QrScanResult {
  raw: string;
  reference?: string;
  phone?: string;
  patientId?: string;
}

interface AdminQrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (result: QrScanResult) => void;
  title?: string;
  subtitle?: string;
}

// Simple synthesizer beep for scan confirmation using Web Audio API
function playScanBeep() {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 note
    osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.12); // Zip up to A6
    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.14);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  } catch {
    // Audio might fail if user hasn't interacted yet
  }
}

// Helper to parse scanned content
export function parseQrData(raw: string): QrScanResult {
  const trimmed = raw.trim();
  const result: QrScanResult = { raw: trimmed };

  // 1. Signed QR token: FC:1:<ref>:<expiresAt>:<signature>
  const signedMatch = trimmed.match(/^FC:1:([A-Za-z0-9\-]+):(\d+):([a-f0-9]{64})$/i);
  if (signedMatch) {
    result.reference = signedMatch[1].toUpperCase();
    return result;
  }

  // 2. Check for FC-APPT:ref
  if (trimmed.startsWith('FC-APPT:')) {
    result.reference = trimmed.replace('FC-APPT:', '').trim().toUpperCase();
    return result;
  }

  // 3. Check for URL with reference e.g. /booking/track?ref=... or /admin/appointments?ref=...
  try {
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      const url = new URL(trimmed);
      const ref = url.searchParams.get('ref') || url.searchParams.get('reference');
      if (ref) {
        result.reference = ref.trim().toUpperCase();
        return result;
      }
    }
  } catch {
    // Not a valid URL
  }

  // 4. Check for JSON payload
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    try {
      const parsed = JSON.parse(trimmed) as { reference?: string; ref?: string; phone?: string; id?: string };
      if (parsed.reference || parsed.ref) result.reference = (parsed.reference || parsed.ref)!.trim().toUpperCase();
      if (parsed.phone) result.phone = parsed.phone.trim();
      if (parsed.id) result.patientId = parsed.id.trim();
      return result;
    } catch {
      // Not JSON
    }
  }

  // 5. Explicit reference or phone
  if (/^FC-[A-Za-z0-9]{3,10}$/i.test(trimmed)) {
    result.reference = trimmed.toUpperCase();
  } else if (/^\d{4,8}$/.test(trimmed)) {
    result.reference = trimmed;
  } else if (/^(\+?20|0020)?01[0125]\d{8}$/.test(trimmed.replace(/[\s\-]/g, ''))) {
    result.phone = trimmed.replace(/[\s\-]/g, '');
  }

  return result;
}

export function AdminQrScannerModal({
  isOpen,
  onClose,
  onScanSuccess,
  title = 'ماسح كود الـ QR الذكي',
  subtitle = 'وجّهي الكاميرا نحو كود حجز المريض أو تذكرته الرقمية لقراءة البيانات فوراً',
}: AdminQrScannerModalProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'camera' | 'upload' | 'manual'>('camera');
  const [cameraError, setCameraError] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [scannedFeedback, setScannedFeedback] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const readerElementId = 'admin-qr-reader-container';

  // Comprehensive reset when modal is closed
  const handleClose = () => {
    setScannedFeedback(null);
    setCameraError('');
    setManualCode('');
    setIsVerifying(false);
    onClose();
  };

  useEffect(() => {
    if (!isOpen) {
      setScannedFeedback(null);
      setCameraError('');
      setManualCode('');
      setIsVerifying(false);
    }
  }, [isOpen]);

  // Handle detection & verification
  const handleSuccess = async (decodedText: string) => {
    const trimmed = decodedText.trim();
    if (!trimmed) return;

    // 1. Pre-validation: does it have any valid format?
    const parsed = parseQrData(trimmed);
    if (!parsed.reference && !parsed.phone && !parsed.patientId) {
      setCameraError('رمز QR غير صالح أو غير صادر من مركز المستقبل. يرجى مسح تذكرة الحجز الرسمية.');
      setScannedFeedback(null);
      return;
    }

    // Stop camera while verifying
    if (scannerRef.current && scannerRef.current.isScanning) {
      scannerRef.current.stop().catch(() => {});
    }

    setIsVerifying(true);
    setCameraError('');

    try {
      // 2. Cryptographic and DB verification via backend
      const verified = await adminApi.verifyQr(trimmed);
      if (soundEnabled) playScanBeep();
      setScannedFeedback(
        verified.name ? `تم تأكيد تذكرة: ${verified.name}` : `تم تأكيد الحجز: ${verified.reference}`
      );

      setTimeout(() => {
        onScanSuccess({
          raw: trimmed,
          reference: verified.reference,
          patientId: verified.userId ?? undefined,
          phone: verified.phone,
        });
        handleClose();
      }, 500);
    } catch (err) {
      const errMsg =
        (err as Error).message ||
        'رمز الـ QR غير مسجل في النظام أو تعذر التحقق من صحته.';
      setCameraError(errMsg);
      setScannedFeedback(null);
    } finally {
      setIsVerifying(false);
    }
  };

  // Start / Stop camera scanner when modal opens on 'camera' tab
  useEffect(() => {
    if (!isOpen || activeTab !== 'camera') {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current
          .stop()
          .then(() => {
            scannerRef.current?.clear();
          })
          .catch(() => {});
      }
      return;
    }

    let isMounted = true;
    setCameraError('');

    const initScanner = async () => {
      try {
        const scanner = new Html5Qrcode(readerElementId);
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: 'environment' },
          {
            fps: 12,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
          },
          (decodedText) => {
            if (isMounted) handleSuccess(decodedText);
          },
          () => {
            // Frame scan failure (no QR in view), ignore
          }
        );
      } catch (err) {
        console.warn('QR Camera Start error:', err);
        if (isMounted) {
          setCameraError(
            'تعذر تشغيل الكاميرا. يرجى التأكد من منح الإذن للمتصفح، أو استخدمي رفع الصورة أو الإدخال اليدوي.'
          );
        }
      }
    };

    // Give DOM a frame to mount reader div
    const timer = setTimeout(() => {
      void initScanner();
    }, 150);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current
          .stop()
          .then(() => {
            scannerRef.current?.clear();
          })
          .catch(() => {});
      }
    };
  }, [isOpen, activeTab]);

  // Handle file upload scan
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setCameraError('');
      const scanner = new Html5Qrcode('admin-qr-file-temp-container');
      const result = await scanner.scanFile(file, true);
      e.target.value = '';
      handleSuccess(result);
    } catch (err) {
      console.warn('File QR decode failed:', err);
      e.target.value = '';
      setCameraError('لم يتم العثور على كود QR صالح في الصورة. جربي صورة أخرى أكثر وضوحاً.');
    }
  };

  // Handle manual submit
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    handleSuccess(manualCode.trim());
  };

  if (!isOpen) return null;

  return (
    <div className="admin-qr-modal-overlay" role="dialog" aria-modal="true">
      <div className="admin-qr-modal-scrim" onClick={handleClose} />

      <div className="admin-qr-modal-dialog">
        {/* Header */}
        <div className="admin-qr-modal-header">
          <div className="qr-modal-title-stack">
            <div className="qr-title-row">
              <ScanLine size={20} className="qr-title-icon" />
              <h3>{title}</h3>
            </div>
            <p className="qr-subtitle">{subtitle}</p>
          </div>

          <div className="qr-header-actions">
            <button
              type="button"
              className={`qr-sound-toggle-btn ${soundEnabled ? 'is-active' : ''}`}
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'كتم صوت الإشعار' : 'تفعيل صوت التأكيد'}
            >
              {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
            <button
              type="button"
              className="qr-modal-close-btn"
              onClick={handleClose}
              aria-label="إغلاق النافذة"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="admin-qr-tabs" role="tablist">
          <button
            type="button"
            className={`admin-qr-tab-btn ${activeTab === 'camera' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('camera')}
          >
            <Camera size={16} />
            <span>كاميرا المسح المباشر</span>
          </button>
          <button
            type="button"
            className={`admin-qr-tab-btn ${activeTab === 'upload' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('upload')}
          >
            <FileImage size={16} />
            <span>رفع صورة / سكرين شوت</span>
          </button>
          <button
            type="button"
            className={`admin-qr-tab-btn ${activeTab === 'manual' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('manual')}
          >
            <Keyboard size={16} />
            <span>إدخال الكود يدوياً</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="admin-qr-modal-body">
          {isVerifying ? (
            <div className="qr-scan-success-pane">
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                <Loader2 size={48} className="spin-slow" style={{ color: 'var(--brand-emerald)' }} />
              </div>
              <h4>جارٍ التحقق من التذكرة وسجلاتها...</h4>
              <p className="scanned-raw-code">نتحقق من صلاحية التوقيع المشفر ومطابقة المريض في النظام</p>
            </div>
          ) : scannedFeedback ? (
            <div className="qr-scan-success-pane">
              <div className="success-icon-pulse">
                <CheckCircle2 size={54} />
              </div>
              <h4>تم تأكيد الحجز بنجاح!</h4>
              <p className="scanned-raw-code" dir="ltr">
                {scannedFeedback}
              </p>
              <span className="scanned-redirect-hint">جارٍ فتح ملف المريض والحجز تلقائياً...</span>
              <button
                type="button"
                className="btn light small"
                onClick={handleClose}
                style={{ marginTop: '16px' }}
              >
                إغلاق النافذة
              </button>
            </div>
          ) : activeTab === 'camera' ? (
            <div className="qr-camera-viewport-wrap">
              {cameraError ? (
                <div className="qr-camera-error-box">
                  <AlertCircle size={40} className="error-camera-icon" style={{ color: '#dc2626' }} />
                  <p style={{ fontWeight: 600, color: '#991b1b' }}>{cameraError}</p>
                  <div className="error-actions-row">
                    {cameraError.includes('معلق') && (
                      <button
                        type="button"
                        className="btn primary small"
                        style={{ background: '#d97706', borderColor: '#b45309', color: '#ffffff' }}
                        onClick={() => {
                          handleClose();
                          navigate('/admin');
                        }}
                      >
                        <Clock size={15} />
                        الانتقال للمواعيد المعلقة لاعتماد الطلب
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn primary small"
                      onClick={() => setCameraError('')}
                    >
                      <RefreshCw size={15} />
                      إعادة المحاولة
                    </button>
                    <button
                      type="button"
                      className="btn light small"
                      onClick={() => setActiveTab('upload')}
                    >
                      <FileImage size={15} />
                      رفع صورة
                    </button>
                    <button
                      type="button"
                      className="btn light small"
                      onClick={() => setActiveTab('manual')}
                    >
                      <Keyboard size={15} />
                      كتابة الكود يدوياً
                    </button>
                  </div>
                </div>
              ) : (
                <div className="qr-live-scanner-box">
                  <div id={readerElementId} className="qr-html5-camera-target" />
                  <div className="qr-viewfinder-overlay">
                    <div className="viewfinder-frame">
                      <span className="vf-corner tl" />
                      <span className="vf-corner tr" />
                      <span className="vf-corner bl" />
                      <span className="vf-corner br" />
                      <div className="vf-laser-line" />
                    </div>
                  </div>
                  <p className="qr-camera-tip">
                    ضع الكود داخل المربع، سيتم التعرف عليه تلقائياً بدون الضغط على أي زر.
                  </p>
                </div>
              )}
            </div>
          ) : activeTab === 'upload' ? (
            <div className="qr-upload-pane">
              <label className="qr-dropzone-box">
                <FileImage size={44} className="dropzone-icon" />
                <span className="dropzone-title">اضغطي هنا لاختيار صورة كود الـ QR</span>
                <small className="dropzone-sub">
                  يقبل صور الكاميرا، لقطات الشاشة (Screenshots)، أو ملفات PNG/JPG
                </small>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => void handleFileUpload(e)}
                  className="dropzone-file-input"
                />
              </label>

              {cameraError && <p className="qr-upload-error-text">{cameraError}</p>}
              <div id="admin-qr-file-temp-container" style={{ display: 'none' }} />
            </div>
          ) : (
            <form className="qr-manual-pane" onSubmit={handleManualSubmit}>
              <label className="qr-manual-label">
                رقم حجز المريض أو كود الاستدعاء:
                <input
                  type="text"
                  dir="ltr"
                  className="input qr-manual-input"
                  placeholder="مثال: FC-2A3FC4AF أو رقم الهاتف"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  autoFocus
                />
              </label>
              <button
                type="submit"
                className="btn primary qr-manual-submit-btn"
                disabled={!manualCode.trim()}
              >
                <Sparkles size={16} />
                تأكيد ومطابقة الحجز
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
