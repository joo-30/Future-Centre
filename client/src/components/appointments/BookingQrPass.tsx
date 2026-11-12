import {
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  MapPin,
  Printer,
  ShieldCheck,
  Ticket,
  X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { dateLabel, formatPrice, timeLabel } from '../../lib/api';

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
  price?: number;
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
  price,
}: BookingQrPassProps) {
  const [qrUrl, setQrUrl] = useState<string>('');
  const [generating, setGenerating] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  useEffect(() => {
    if (!isZoomOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsZoomOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isZoomOpen]);

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
    if (!qrUrl) return;

    // Create an isolated hidden iframe for printing ONLY the 1-page ticket
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.left = '-9999px';
    iframe.style.top = '0';
    iframe.style.width = '450px';
    iframe.style.height = '850px';
    iframe.style.border = 'none';
    iframe.setAttribute('aria-hidden', 'true');
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      window.print();
      return;
    }

    const priceHtml = price
      ? `<div class="detail-row"><span class="label">قيمة الكشف:</span><strong class="val price-val">${formatPrice(price)} ج.م (شامل فحص InBody)</strong></div>`
      : '';

    const phoneHtml = phoneMasked
      ? `<div class="detail-row"><span class="label">الهاتف:</span><bdi dir="ltr" class="val">${phoneMasked}</bdi></div>`
      : '';

    const statusBadge =
      status === 'confirmed'
        ? '<span class="ticket-badge badge-confirmed">موعد مؤكد بالعيادة ✓</span>'
        : '<span class="ticket-badge badge-pending">طلب قيد المراجعة ⏳</span>';

    const statusHint =
      status === 'confirmed'
        ? 'أظهري هذا الكود لسكرتيرة الاستقبال في العيادة لتأكيد حضورك فوراً'
        : 'سيتواصل معكِ فريق المركز لتأكيد الموعد النهائي قبل الحضور';

    doc.open();
    doc.write(`<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="utf-8" />
  <title>تذكرة حجز رقمية - #${reference}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 15mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Cairo", "Tahoma", sans-serif;
      background: #ffffff;
      color: #123720;
      display: flex;
      justify-content: center;
      align-items: flex-start;
      padding: 20px 0;
      direction: rtl;
    }
    .print-ticket-container {
      width: 400px;
      max-width: 100%;
      background: #ffffff;
      border: 2px solid #1a4d2e;
      border-radius: 20px;
      padding: 24px 22px;
      text-align: center;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .ticket-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1.5px dashed #c9dec2;
      padding-bottom: 12px;
      margin-bottom: 16px;
    }
    .ticket-badge {
      font-size: 11px;
      font-weight: 800;
      padding: 4px 10px;
      border-radius: 999px;
    }
    .badge-confirmed {
      color: #15803d;
      background: #dcfce7;
      border: 1px solid #86efac;
    }
    .badge-pending {
      color: #854d0e;
      background: #fef9c3;
      border: 1px solid #fde047;
    }
    .ticket-clinic {
      font-size: 13.5px;
      font-weight: 800;
      color: #163e25;
    }
    .qr-card-box {
      background: #f8faf6;
      border: 1.5px solid #d8e5d3;
      border-radius: 16px;
      padding: 16px;
      display: inline-block;
      margin-bottom: 14px;
    }
    .qr-img {
      display: block;
      width: 160px;
      height: 160px;
      margin: 0 auto;
    }
    .code-chip {
      background: #eaf3e6;
      border: 1.5px solid #c9dec2;
      color: #163e25;
      font-size: 18px;
      font-weight: 900;
      padding: 6px 18px;
      border-radius: 10px;
      display: inline-block;
      margin-bottom: 16px;
      font-variant-numeric: tabular-nums;
    }
    .details-list {
      text-align: right;
      border-top: 1.5px dashed #c9dec2;
      border-bottom: 1.5px dashed #c9dec2;
      padding: 14px 0;
      margin-bottom: 14px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      font-size: 13.5px;
    }
    .detail-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }
    .label {
      color: #55755e;
      font-weight: 600;
    }
    .val {
      color: #143d22;
      font-weight: 800;
    }
    .price-val {
      color: #15803d;
      font-size: 14.5px;
    }
    .ticket-hint {
      background: #f4faf2;
      border: 1px solid #d0e4cd;
      color: #1a4d2e;
      font-size: 12px;
      font-weight: 700;
      padding: 9px 12px;
      border-radius: 10px;
      margin-bottom: 14px;
      line-height: 1.5;
    }
    .ticket-footer {
      font-size: 11px;
      color: #648463;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="print-ticket-container">
    <div class="ticket-header">
      ${statusBadge}
      <span class="ticket-clinic">مركز المستقبل للتغذية</span>
    </div>

    <div class="qr-card-box">
      <img class="qr-img" src="${qrUrl}" alt="QR #${reference}" />
    </div>

    <div>
      <span class="code-chip">كود الحجز: #${reference}</span>
    </div>

    <div class="details-list">
      <div class="detail-row">
        <span class="label">اسم المريض:</span>
        <strong class="val">${name}</strong>
      </div>
      <div class="detail-row">
        <span class="label">الخدمة الطبية:</span>
        <span class="val">${serviceTitle}</span>
      </div>
      <div class="detail-row">
        <span class="label">الموعد:</span>
        <strong class="val">${dateLabel(date)} · ${timeLabel(time)}</strong>
      </div>
      ${priceHtml}
      ${phoneHtml}
      <div class="detail-row">
        <span class="label">المقر:</span>
        <span class="val">${clinicAddress}</span>
      </div>
    </div>

    <div class="ticket-hint">
      ${statusHint}
    </div>

    <div class="ticket-footer">
      تذكرة كشف رقمية معتمدة · مركز المستقبل للتغذية والعلاج الطبيعي
    </div>
  </div>
</body>
</html>`);
    doc.close();

    // Trigger print
    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => {
        iframe.remove();
      }, 3000);
    }, 300);
  };

  return (
    <div className="booking-qr-pass-wrapper">
      <div className="booking-qr-pass-card" ref={cardRef}>
        {/* Compact Top Ribbon */}
        <div className="bqp-header">
          <div className={`bqp-badge ${status === 'confirmed' ? 'is-confirmed' : 'is-pending'}`}>
            {status === 'confirmed' ? <CheckCircle2 size={13} /> : <Clock size={13} />}
            <span>{status === 'confirmed' ? 'موعد مؤكد بالعيادة' : 'طلب قيد المراجعة'}</span>
          </div>
          <span className="bqp-clinic-name">مركز المستقبل للتغذية</span>
        </div>

        {/* Compact QR Hero */}
        <div
          className="bqp-qr-compact bqp-clickable-zoom"
          onClick={() => setIsZoomOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setIsZoomOpen(true);
            }
          }}
          tabIndex={0}
          role="button"
          aria-label="اضغط لتكبير كود الـ QR ورقم الحجز"
          title="انقر لتكبير كود الـ QR ورقم الحجز"
        >
          <div className="bqp-qr-box">
            {generating ? (
              <div className="bqp-qr-loading">جارٍ إنشاء الكود...</div>
            ) : qrUrl ? (
              <img
                src={qrUrl}
                alt={`QR Code #${reference}`}
                className="bqp-qr-image"
                width={120}
                height={120}
              />
            ) : (
              <div className="bqp-qr-fallback">{reference}</div>
            )}
          </div>

          <div
            className="bqp-code-pill bqp-clickable-code"
            onClick={() => setIsZoomOpen(true)}
            title="انقر لتكبير كود الحجز"
          >
            <Ticket size={13} className="bqp-code-icon" />
            <span className="bqp-code-label">كود الحجز:</span>
            <span className="bqp-code-num" dir="ltr">#{reference}</span>
          </div>
        </div>

        {/* Perforation Divider with Perfectly Aligned Notches */}
        <div className="bqp-divider" aria-hidden="true">
          <span className="bqp-notch bqp-notch-left" />
          <span className="bqp-notch bqp-notch-right" />
        </div>

        {/* Compact Details Box */}
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
              <Calendar size={12} />
              <span>{dateLabel(date)}</span>
              <span className="bqp-dot">·</span>
              <Clock size={12} />
              <span>{timeLabel(time)}</span>
            </span>
          </div>

          {price ? (
            <div className="bqp-detail-row">
              <span className="bqp-label">قيمة الكشف:</span>
              <span className="bqp-val is-price">
                <strong>{formatPrice(price)}</strong>
                <small> ج.م (شامل فحص InBody)</small>
              </span>
            </div>
          ) : null}

          {phoneMasked && (
            <div className="bqp-detail-row">
              <span className="bqp-label">الهاتف:</span>
              <bdi dir="ltr" className="bqp-val">{phoneMasked}</bdi>
            </div>
          )}

          <div className="bqp-detail-row">
            <span className="bqp-label">المكان:</span>
            <span className="bqp-val address-val">
              <MapPin size={11} style={{ display: 'inline', marginInlineEnd: '3px' }} />
              {clinicAddress}
            </span>
          </div>
        </div>

        {/* Slim Arrival / Reassurance Strip */}
        <div className={`bqp-hint-strip ${status === 'pending' ? 'is-pending' : 'is-confirmed'}`}>
          {status === 'pending' ? (
            <>
              <Clock size={13} className="bqp-hint-icon" />
              <span>قيد مراجعة المركز — سيتواصل معكِ الفريق لتأكيد الموعد</span>
            </>
          ) : (
            <>
              <CheckCircle2 size={13} className="bqp-hint-icon" />
              <span>أظهري التذكرة للاستقبال عند الوصول لتأكيد حضوركِ</span>
            </>
          )}
        </div>

        {/* Compact Action Buttons Row */}
        <div className="bqp-actions-row">
          <button
            type="button"
            className={`bqp-btn-download ${downloadSuccess ? 'is-success' : ''}`}
            onClick={() => void handleDownloadFullTicket()}
            disabled={isDownloading || generating}
            title="حفظ تذكرة الحجز كصورة للموبايل"
          >
            {downloadSuccess ? (
              <>
                <CheckCircle2 size={15} />
                <span>تم الحفظ بنجاح ✓</span>
              </>
            ) : isDownloading ? (
              <>
                <span className="bqp-btn-spinner" />
                <span>جارٍ الحفظ...</span>
              </>
            ) : (
              <>
                <Download size={15} />
                <span>حفظ التذكرة كصورة</span>
              </>
            )}
          </button>

          <button
            type="button"
            className="bqp-btn-print"
            onClick={handlePrint}
            title="طباعة التذكرة"
          >
            <Printer size={15} />
            <span>طباعة</span>
          </button>
        </div>

        {/* Minimal Footer Stamp */}
        <div className="bqp-footer-stamp">
          <ShieldCheck size={12} />
          <span>تذكرة كشف معتمدة · مركز المستقبل للتغذية</span>
        </div>
      </div>
      {/* Enlarge QR & Code Lightbox Modal */}
      {isZoomOpen && (
        <div
          className="bqp-zoom-backdrop"
          onClick={() => setIsZoomOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="معاينة كود الحجز الرقمي بحجم مكبر"
        >
          <div className="bqp-zoom-modal" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="bqp-zoom-close-btn"
              onClick={() => setIsZoomOpen(false)}
              aria-label="إغلاق التكبير"
            >
              <X size={18} />
            </button>

            <div className="bqp-zoom-header">
              <span className="bqp-zoom-badge-pill">كود الحجز الرقمي</span>
              <h3 className="bqp-zoom-title">تذكرة العيادة المعتمدة</h3>
              <p className="bqp-zoom-subtitle">
                أظهري هذا الكود لسكرتيرة الاستقبال في العيادة لتأكيد حضورك فوراً
              </p>
            </div>

            <div className="bqp-zoom-qr-card">
              {qrUrl ? (
                <img
                  src={qrUrl}
                  alt={`QR Code #${reference}`}
                  className="bqp-zoom-qr-img"
                  width={240}
                  height={240}
                />
              ) : (
                <div className="bqp-qr-fallback">{reference}</div>
              )}
              <div className="bqp-zoom-code-display">
                <span className="bqp-zoom-code-label">رقم الحجز الرقمي</span>
                <strong className="bqp-zoom-code-value" dir="ltr">#{reference}</strong>
              </div>
            </div>

            <div className="bqp-zoom-summary-grid">
              <div className="bqp-zoom-summary-item">
                <span className="bqp-zoom-item-label">الاسم:</span>
                <strong className="bqp-zoom-item-val">{name}</strong>
              </div>
              <div className="bqp-zoom-summary-item">
                <span className="bqp-zoom-item-label">الموعد:</span>
                <strong className="bqp-zoom-item-val">{dateLabel(date)} · {timeLabel(time)}</strong>
              </div>
              <div className="bqp-zoom-summary-item">
                <span className="bqp-zoom-item-label">الخدمة:</span>
                <span className="bqp-zoom-item-val">{serviceTitle}</span>
              </div>
            </div>

            <div className="bqp-zoom-footer-actions">
              <button
                type="button"
                className="bqp-zoom-action-download"
                onClick={() => void handleDownloadFullTicket()}
                disabled={isDownloading || generating}
              >
                <Download size={15} />
                <span>تحميل كارت التذكرة</span>
              </button>
              <button
                type="button"
                className="bqp-zoom-action-close"
                onClick={() => setIsZoomOpen(false)}
              >
                إغلاق المعاينة
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
