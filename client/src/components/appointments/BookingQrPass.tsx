import {
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  MapPin,
  Printer,
  QrCode,
  ShieldCheck,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { dateLabel, timeLabel } from '../../lib/api';

interface BookingQrPassProps {
  reference: string;
  name: string;
  serviceTitle: string;
  date: string;
  time: string;
  phoneMasked?: string;
  status?: string;
  clinicAddress?: string;
  qrToken?: string;
}

export function BookingQrPass({
  reference,
  name,
  serviceTitle,
  date,
  time,
  phoneMasked,
  status = 'pending',
  clinicAddress = 'كفر الزيات، شارع الجيش عند توكيل أورنج',
  qrToken,
}: BookingQrPassProps) {
  const [qrUrl, setQrUrl] = useState<string>('');
  const [generating, setGenerating] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Generate QR code data URL
  useEffect(() => {
    let active = true;
    const payload = qrToken || `FC-APPT:${reference}`;

    QRCode.toDataURL(payload, {
      width: 320,
      margin: 1,
      color: {
        dark: '#133d23',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'H',
    })
      .then((url) => {
        if (active) {
          setQrUrl(url);
          setGenerating(false);
        }
      })
      .catch((err) => {
        console.error('Error generating QR code:', err);
        if (active) setGenerating(false);
      });

    return () => {
      active = false;
    };
  }, [reference]);

  // Generate and download a high-resolution, full boarding-pass image
  const handleDownloadFullTicket = async () => {
    if (!qrUrl || isDownloading) return;
    setIsDownloading(true);

    try {
      const canvas = document.createElement('canvas');
      const width = 640;
      const height = 980;
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');

      // 1. Background fill
      ctx.fillStyle = '#f6faf3';
      ctx.fillRect(0, 0, width, height);

      // 2. Main ticket card container with subtle shadow & border
      const pad = 24;
      const cardW = width - pad * 2;
      const cardH = height - pad * 2;
      const cardX = pad;
      const cardY = pad;
      const radius = 28;

      ctx.save();
      ctx.beginPath();
      ctx.roundRect(cardX, cardY, cardW, cardH, radius);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#d7e6d0';
      ctx.stroke();
      ctx.restore();

      // 3. Header Gradient Banner
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(cardX, cardY, cardW, 160, [radius, radius, 0, 0]);
      ctx.clip();
      const grad = ctx.createLinearGradient(cardX, cardY, cardX + cardW, cardY + 160);
      grad.addColorStop(0, '#133d23');
      grad.addColorStop(0.5, '#1b5431');
      grad.addColorStop(1, '#11351e');
      ctx.fillStyle = grad;
      ctx.fillRect(cardX, cardY, cardW, 160);

      // Gold accent bar
      ctx.fillStyle = '#eab308';
      ctx.fillRect(cardX, cardY + 155, cardW, 5);

      // Clinic Name in Arabic
      ctx.direction = 'rtl';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 26px "Segoe UI", Tahoma, Arial, sans-serif';
      ctx.fillText('مركز المستقبل للتغذية والتخسيس', width / 2, cardY + 54);

      // Doctor Subtitle
      ctx.fillStyle = '#c8e6c9';
      ctx.font = '600 16px "Segoe UI", Tahoma, Arial, sans-serif';
      ctx.fillText('دكتورة د. رنا ياسر الشوري · أخصائي التغذية العلاجية ونحت القوام', width / 2, cardY + 86);

      // Pass Badge
      ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
      ctx.beginPath();
      ctx.roundRect(width / 2 - 110, cardY + 104, 220, 32, 16);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px "Segoe UI", Tahoma, Arial, sans-serif';
      ctx.fillText('تذكرة الحجز الذكية · SMART PASS', width / 2, cardY + 125);
      ctx.restore();

      // 4. Reference Code Banner
      ctx.textAlign = 'center';
      ctx.fillStyle = '#61806b';
      ctx.font = '600 13px "Segoe UI", Tahoma, Arial, sans-serif';
      ctx.fillText('كود الحجز الرقمي المعتمد', width / 2, cardY + 200);

      ctx.fillStyle = '#143d22';
      ctx.font = 'bold 28px "Courier New", monospace';
      ctx.fillText(`#${reference}`, width / 2, cardY + 234);

      // 5. QR Code Image
      const qrImg = new Image();
      qrImg.crossOrigin = 'anonymous';
      await new Promise<void>((resolve, reject) => {
        qrImg.onload = () => resolve();
        qrImg.onerror = reject;
        qrImg.src = qrUrl;
      });

      const qrSize = 220;
      const qrX = (width - qrSize) / 2;
      const qrY = cardY + 255;

      // QR Frame box
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(qrX - 14, qrY - 14, qrSize + 28, qrSize + 28, 20);
      ctx.fillStyle = '#f8fcf6';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#d2e5cd';
      ctx.stroke();
      ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
      ctx.restore();

      // 6. Dashed Perforation Line
      const perfY = cardY + 540;
      ctx.save();
      ctx.setLineDash([8, 8]);
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#cbdcc7';
      ctx.beginPath();
      ctx.moveTo(cardX + 24, perfY);
      ctx.lineTo(cardX + cardW - 24, perfY);
      ctx.stroke();
      ctx.restore();

      // 7. Patient Details Section (RTL)
      const detailsBoxY = perfY + 25;
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(cardX + 24, detailsBoxY, cardW - 48, 260, 18);
      ctx.fillStyle = '#fafdF8';
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#e3eee0';
      ctx.stroke();

      const labelRight = cardX + cardW - 50;
      const valueLeft = cardX + 50;
      const rowHeight = 48;
      let startRowY = detailsBoxY + 44;

      const drawRow = (label: string, val: string, isHighlight = false) => {
        ctx.textAlign = 'right';
        ctx.fillStyle = '#6d8675';
        ctx.font = '600 15px "Segoe UI", Tahoma, Arial, sans-serif';
        ctx.fillText(label, labelRight, startRowY);

        ctx.textAlign = 'left';
        ctx.fillStyle = isHighlight ? '#18542c' : '#143d22';
        ctx.font = isHighlight
          ? 'bold 16px "Segoe UI", Tahoma, Arial, sans-serif'
          : '700 15px "Segoe UI", Tahoma, Arial, sans-serif';
        ctx.fillText(val, valueLeft, startRowY);

        startRowY += rowHeight;
      };

      drawRow('اسم المريض:', name);
      drawRow('الخدمة الطبية:', serviceTitle);
      drawRow('تاريخ الموعد:', `${dateLabel(date)} · ${timeLabel(time)}`, true);
      if (phoneMasked) drawRow('رقم الهاتف:', phoneMasked);
      drawRow('مكان الكشف:', clinicAddress);
      ctx.restore();

      // 8. Footer Instructions & Security Stamp
      ctx.textAlign = 'center';
      ctx.fillStyle = '#1b5431';
      ctx.font = 'bold 13.5px "Segoe UI", Tahoma, Arial, sans-serif';
      ctx.fillText(
        '✓ أظهري هذه التذكرة لسكرتيرة العيادة عند الوصول لتأكيد حضورك ومطابقة الحجز',
        width / 2,
        cardY + cardH - 55
      );

      ctx.fillStyle = '#7a9683';
      ctx.font = '500 12px "Segoe UI", Tahoma, Arial, sans-serif';
      ctx.fillText('مركز المستقبل للتغذية والتخسيس · كفر الزيات، شارع الجيش', width / 2, cardY + cardH - 30);

      // 9. Export to blob & trigger download
      canvas.toBlob((blob) => {
        if (!blob) throw new Error('Blob creation failed');
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `تذكرة_حجز_مركز_المستقبل_${reference}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setIsDownloading(false);
        setDownloadSuccess(true);
        setTimeout(() => setDownloadSuccess(false), 3500);
      }, 'image/png');
    } catch (err) {
      console.error('Error generating full ticket image:', err);
      // Fallback to QR only if canvas fails
      if (qrUrl) {
        const a = document.createElement('a');
        a.href = qrUrl;
        a.download = `FutureCenter-Pass-${reference}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="booking-qr-pass-wrapper">
      <div className="booking-qr-pass-card" ref={cardRef}>
        {/* Decorative Ticket Perforation Notches */}
        <span className="bqp-notch bqp-notch-left" aria-hidden="true" />
        <span className="bqp-notch bqp-notch-right" aria-hidden="true" />

        {/* Ticket Top Ribbon */}
        <div className="bqp-header">
          <div
            className={`bqp-badge ${status === 'pending' ? 'is-pending' : ''}`}
            title={status ? `حالة الحجز: ${status}` : undefined}
            style={
              status === 'pending'
                ? { background: 'rgba(245, 158, 11, 0.25)', border: '1px solid #f59e0b', color: '#fef3c7' }
                : undefined
            }
          >
            {status === 'pending' ? <Clock size={14} /> : <QrCode size={14} />}
            <span>{status === 'pending' ? 'طلب حجز (بانتظار التأكيد)' : 'تذكرة الحجز الذكية'}</span>
          </div>
          <span className="bqp-clinic-name">مركز المستقبل للتغذية</span>
        </div>

        {/* QR Code Container */}
        <div className="bqp-qr-frame">
          {generating ? (
            <div className="bqp-qr-loading">جارٍ إنشاء كود الـ QR...</div>
          ) : qrUrl ? (
            <img
              src={qrUrl}
              alt={`QR Code للحجز رقم ${reference}`}
              className="bqp-qr-image"
              width={185}
              height={185}
            />
          ) : (
            <div className="bqp-qr-fallback">{reference}</div>
          )}

          <div className="bqp-ref-banner">
            <small>كود الحجز الرقمي</small>
            <strong dir="ltr">#{reference}</strong>
          </div>
        </div>

        {/* Ticket Details Summary */}
        <div className="bqp-details">
          <div className="bqp-detail-row">
            <span className="bqp-label">الاسم:</span>
            <strong className="bqp-val">{name}</strong>
          </div>

          <div className="bqp-detail-row">
            <span className="bqp-label">الخدمة:</span>
            <span className="bqp-val">{serviceTitle}</span>
          </div>

          <div className="bqp-detail-row">
            <span className="bqp-label">الموعد:</span>
            <span className="bqp-val highlight">
              <Calendar size={13} />
              <span>{dateLabel(date)}</span>
              <Clock size={13} style={{ marginInlineStart: '6px' }} />
              <span>{timeLabel(time)}</span>
            </span>
          </div>

          {phoneMasked && (
            <div className="bqp-detail-row">
              <span className="bqp-label">الهاتف:</span>
              <bdi dir="ltr" className="bqp-val">
                {phoneMasked}
              </bdi>
            </div>
          )}

          <div className="bqp-detail-row">
            <span className="bqp-label">العنوان:</span>
            <span className="bqp-val address-val">
              <MapPin size={12} style={{ display: 'inline', marginInlineEnd: '4px' }} />
              {clinicAddress}
            </span>
          </div>
        </div>

        {/* Tip for Clinic Arrival */}
        <div
          className="bqp-instructions"
          style={
            status === 'pending'
              ? { background: '#fffbeb', borderColor: '#fde68a', color: '#92400e' }
              : undefined
          }
        >
          {status === 'pending' ? (
            <>
              <Clock size={16} className="bqp-tip-icon" style={{ color: '#d97706' }} />
              <p>
                <strong>تنبيه:</strong> هذا الطلب قيد مراجعة المركز حالياً. سيقوم فريق العيادة بالتواصل معكِ لتأكيد الموعد النهائي قبل الحضور.
              </p>
            </>
          ) : (
            <>
              <CheckCircle2 size={16} className="bqp-tip-icon" />
              <p>
                أظهري كود الـ QR لسكرتيرة العيادة عند الوصول لمسح بياناتك وتأكيد دورك في الكشف فوراً.
              </p>
            </>
          )}
        </div>

        {/* Action Buttons: High-End UI/UX Pro Max */}
        <div className="bqp-actions-container">
          <button
            type="button"
            className={`bqp-download-ticket-btn ${downloadSuccess ? 'is-success' : ''}`}
            onClick={() => void handleDownloadFullTicket()}
            disabled={isDownloading || generating}
            title="حفظ تذكرة الحجز كاملة كصورة بجودة عالية للاحتفاظ بها على الموبايل"
          >
            {downloadSuccess ? (
              <>
                <CheckCircle2 size={18} className="bqp-btn-icon pulse-check" />
                <div className="bqp-btn-text-stack">
                  <strong>تم حفظ التذكرة بنجاح! ✓</strong>
                  <small>موجودة الآن في مجلد التنزيلات على جهازك</small>
                </div>
              </>
            ) : isDownloading ? (
              <>
                <span className="bqp-btn-spinner" />
                <div className="bqp-btn-text-stack">
                  <strong>جارٍ تجهيز صورة التذكرة...</strong>
                  <small>يتم إنشاء بطاقة عالية الدقة للموبايل</small>
                </div>
              </>
            ) : (
              <>
                <Download size={18} className="bqp-btn-icon" />
                <div className="bqp-btn-text-stack">
                  <strong>حفظ التذكرة كصورة للموبايل</strong>
                  <small>كارت كامل بجودة عالية للواتساب والسكرتارية</small>
                </div>
              </>
            )}
          </button>

          <button
            type="button"
            className="bqp-print-ticket-btn"
            onClick={handlePrint}
            title="طباعة التذكرة على الورق"
          >
            <Printer size={16} />
            <span>طباعة تذكرة ورقية</span>
          </button>
        </div>

        {/* Verification Footer Note */}
        <div className="bqp-footer-stamp">
          <ShieldCheck size={13} />
          <span>تذكرة كشف رقمية معتمدة من مركز المستقبل للتغذية</span>
        </div>
      </div>
    </div>
  );
}
