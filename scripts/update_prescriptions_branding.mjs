import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// 1. Update Account.tsx
const accountPath = path.join(projectRoot, 'client/src/features/account/Account.tsx');
let accountContent = fs.readFileSync(accountPath, 'utf8');

const startTarget = 'const printPatientPrescription = (rx: PrescriptionPublic) => {';
const endTarget = '  return (\n    <main className="member-page">';
const endTargetCRLF = '  return (\r\n    <main className="member-page">';

const startIndex = accountContent.indexOf(startTarget);
let endIndex = accountContent.indexOf(endTarget);
let endLength = endTarget.length;

if (endIndex === -1) {
  endIndex = accountContent.indexOf(endTargetCRLF);
  endLength = endTargetCRLF.length;
}

if (startIndex !== -1 && endIndex !== -1) {
  const newPrintCode = `const printPatientPrescription = (rx: PrescriptionPublic) => {
    const logoSrc = typeof window !== 'undefined' ? \`\${window.location.origin}/assets/brand-mark.png\` : '/assets/brand-mark.png';
    const isMobile =
      typeof window !== 'undefined' &&
      (window.innerWidth <= 768 || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent));

    const html = \`
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="utf-8">
        <title>روشتة دايت معتمدة - \${rx.patientName}</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Alexandria:wght@400;600;700;800&family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap" rel="stylesheet">
        <style>
          @page { size: A4 portrait; margin: 8mm 12mm; }
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: 'IBM Plex Sans Arabic', 'Alexandria', system-ui, -apple-system, sans-serif;
            background: #fff;
            color: #193826;
            line-height: 1.5;
            direction: rtl;
            font-size: 13px;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .sheet {
            width: 100%;
            max-width: 820px;
            margin: 0 auto;
            border: 2px solid #23432d;
            border-radius: 12px;
            padding: 20px 24px;
          }
          .hdr {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2px solid #23432d;
            padding-bottom: 12px;
            margin-bottom: 12px;
          }
          .brand-wrap {
            display: flex;
            align-items: center;
            gap: 12px;
          }
          .print-logo {
            width: 58px;
            height: 58px;
            object-fit: contain;
            flex-shrink: 0;
            filter: drop-shadow(0 2px 4px rgba(7, 63, 51, 0.08));
          }
          .brand h2 {
            font-family: 'Alexandria', sans-serif;
            font-size: 22px;
            font-weight: 800;
            color: #143321;
            white-space: nowrap;
          }
          .brand p {
            font-size: 13px;
            font-weight: 600;
            color: #3b6845;
            margin-top: 2px;
          }
          .brand small {
            font-size: 11px;
            color: #728c6e;
          }
          .doc {
            text-align: left;
            direction: ltr;
          }
          .doc h3 {
            font-family: 'Alexandria', sans-serif;
            font-size: 18px;
            font-weight: 800;
            color: #143321;
            text-align: right;
            direction: rtl;
          }
          .doc p {
            font-size: 12px;
            font-weight: 600;
            color: #3b6845;
            margin-top: 2px;
            text-align: right;
            direction: rtl;
          }
          .doc ul {
            list-style: none;
            padding: 0;
            margin: 4px 0 0;
            text-align: right;
            direction: rtl;
          }
          .doc li {
            font-size: 10.5px;
            color: #617c5d;
            line-height: 1.4;
          }
          .patient-bar {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            background: #f4f8f1;
            border: 1px solid #dce8d3;
            padding: 8px 14px;
            border-radius: 8px;
            margin-bottom: 10px;
            font-size: 12.5px;
          }
          .patient-bar strong {
            color: #193826;
            margin-left: 4px;
          }
          .patient-bar span {
            color: #275635;
            font-weight: 700;
          }
          .goal {
            background: #eef6ec;
            border-right: 4px solid #23432d;
            border-radius: 6px;
            padding: 8px 14px;
            font-size: 13px;
            font-weight: 700;
            color: #1c4929;
            margin-bottom: 10px;
          }
          .metrics {
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: 8px;
            margin-bottom: 12px;
          }
          .metric-cell {
            background: #fafcf8;
            border: 1px solid #dce6d4;
            border-radius: 8px;
            padding: 8px 6px;
            text-align: center;
          }
          .metric-cell.highlight {
            background: #eef6ec;
            border-color: #8bb579;
          }
          .metric-cell .lbl {
            font-size: 11px;
            color: #557252;
            display: block;
            margin-bottom: 2px;
            font-weight: 600;
          }
          .metric-cell .val {
            font-size: 15px;
            font-weight: 800;
            color: #193826;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            border: 1.5px solid #23432d;
            border-radius: 8px;
            overflow: hidden;
            margin-bottom: 10px;
          }
          th {
            background: #23432d;
            color: #ffffff;
            font-size: 12.5px;
            font-weight: 700;
            padding: 7px 12px;
            text-align: right;
          }
          td {
            border-bottom: 1px solid #e1ecda;
            padding: 8px 12px;
            font-size: 12.5px;
            vertical-align: top;
            line-height: 1.5;
          }
          tr:nth-child(even) td {
            background: #fafcf8;
          }
          .meal-lbl {
            font-weight: 700;
            color: #1d4b2b;
            width: 110px;
            white-space: nowrap;
          }
          .guidelines {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            margin-bottom: 10px;
          }
          .guide-box {
            background: #f9fbf7;
            border: 1px solid #dce6d4;
            border-radius: 8px;
            padding: 8px 12px;
            font-size: 12px;
          }
          .guide-box h4 {
            font-size: 12px;
            font-weight: 700;
            color: #234e30;
            margin-bottom: 3px;
          }
          .instructions {
            background: #fffdf5;
            border: 1px solid #e8dbad;
            border-radius: 8px;
            padding: 8px 12px;
            margin-bottom: 12px;
            font-size: 12px;
            color: #193826;
          }
          .instructions h4 {
            font-size: 12px;
            font-weight: 700;
            color: #8c6812;
            margin-bottom: 3px;
          }
          .ftr {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            border-top: 1.5px dashed #c8dac2;
            padding-top: 10px;
          }
          .ftr-info strong {
            display: block;
            font-size: 12px;
            color: #193826;
          }
          .ftr-info small {
            font-size: 10px;
            color: #688263;
          }
          .ftr-sig {
            text-align: center;
          }
          .sig-name {
            font-family: 'Alexandria', sans-serif;
            font-size: 14.5px;
            font-weight: 800;
            color: #193826;
            margin: 2px 0 1px;
          }
          .ftr-sig small {
            font-size: 10px;
            color: #799473;
          }
        </style>
      </head>
      <body>
        <div class="sheet">
          <div class="hdr">
            <div class="brand">
              <div class="brand-wrap">
                <img src="\${logoSrc}" alt="شعار مركز المستقبل" class="print-logo" />
                <div class="brand-text">
                  <h2>مركز المستقبل</h2>
                  <p>للتغذية العلاجية وتنسيق القوام</p>
                  <small>رعاية تبدأ بفهمك · نتائج تستمر</small>
                </div>
              </div>
            </div>
            <div class="doc">
              <h3>دكتورة د. رنا ياسر الشوري</h3>
              <p>أخصائية التغذية العلاجية وتنسيق القوام</p>
              <ul>
                <li>عضو الجمعية المصرية لدراسة السمنة (EMASO)</li>
                <li>ماجستير ودبلومة التغذية الإكلينيكية وعلاج السمنة والنحافة</li>
              </ul>
            </div>
          </div>
          <div class="patient-bar">
            <div><strong>الحالة:</strong> <span>\${rx.patientName}</span></div>
            <div><strong>السن:</strong> <span>\${rx.age || '—'} سنة</span></div>
            <div><strong>الطول:</strong> <span>\${rx.height || '—'} سم</span></div>
            <div><strong>التاريخ:</strong> <span>\${dateLabel(rx.date)}</span></div>
          </div>
          \${rx.goal ? \`<div class="goal">🎯 الهدف العلاجي: \${rx.goal}</div>\` : ''}
          <div class="metrics">
            <div class="metric-cell"><span class="lbl">⚖️ الوزن الحالي</span><span class="val">\${rx.weight || '—'} كجم</span></div>
            <div class="metric-cell highlight"><span class="lbl">🎯 الوزن المستهدف</span><span class="val">\${rx.targetWeight || '—'} كجم</span></div>
            <div class="metric-cell"><span class="lbl">🔥 نسبة الدهون</span><span class="val">\${rx.bodyFatPercent ? rx.bodyFatPercent + '%' : '—'}</span></div>
            <div class="metric-cell"><span class="lbl">💪 الكتلة العضلية</span><span class="val">\${rx.muscleMass ? rx.muscleMass + ' كجم' : '—'}</span></div>
            <div class="metric-cell"><span class="lbl">💧 نسبة الماء</span><span class="val">\${rx.waterPercent ? rx.waterPercent + '%' : '—'}</span></div>
          </div>
          <table>
            <thead><tr><th style="width: 110px;">الوجبة</th><th>المكونات والخيارات الغذائية</th></tr></thead>
            <tbody>
              <tr><td class="meal-lbl">🌅 الإفطار</td><td>\${rx.breakfast || '—'}</td></tr>
              <tr><td class="meal-lbl">🍎 سناك 1</td><td>\${rx.snack1 || '—'}</td></tr>
              <tr><td class="meal-lbl">🥗 الغداء</td><td>\${rx.lunch || '—'}</td></tr>
              <tr><td class="meal-lbl">🍵 سناك 2</td><td>\${rx.snack2 || '—'}</td></tr>
              <tr><td class="meal-lbl">🌙 العشاء</td><td>\${rx.dinner || '—'}</td></tr>
            </tbody>
          </table>
          <div class="guidelines">
            <div class="guide-box"><h4>💧 شرب الماء</h4><p>\${rx.waterIntake || '3 لتر ماء موزعة على مدار اليوم.'}</p></div>
            <div class="guide-box"><h4>💊 المكملات الغذائية</h4><p>\${rx.supplements || 'لا توجد مكملات محددة.'}</p></div>
          </div>
          \${rx.instructions ? \`<div class="instructions"><h4>⚠️ تعليمات هامة</h4><p>\${rx.instructions}</p></div>\` : ''}
          <div class="ftr">
            <div class="ftr-info">
              <strong>مركز المستقبل للتغذية العلاجية وتنسيق القوام</strong>
              <small>\${catalog?.clinic.address || 'كفر الزيات، شارع الجيش عند توكيل أورنج'} · هاتف: \${catalog?.clinic.phones?.[0] || '01041504201'} · واتساب: \${catalog?.clinic.whatsapp || '01041504201'}</small>
            </div>
            <div class="ftr-sig">
              <span style="font-size: 10.5px; color: #6d8667;">إشراف وتوقيع:</span>
              <div class="sig-name">دكتورة د. رنا ياسر الشوري</div>
              <small>نتمنى لكِ دوام الصحة والعافية</small>
            </div>
          </div>
        </div>
      </body>
      </html>
    \`;

    if (!isMobile) {
      let iframe = document.getElementById('patient-rx-print-iframe') as HTMLIFrameElement;
      if (!iframe) {
        iframe = document.createElement('iframe');
        iframe.id = 'patient-rx-print-iframe';
        iframe.style.position = 'fixed';
        iframe.style.right = '0';
        iframe.style.bottom = '0';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = '0';
        iframe.style.visibility = 'hidden';
        document.body.appendChild(iframe);
      }
      try {
        const doc = iframe.contentWindow?.document || iframe.contentDocument;
        if (doc) {
          doc.open();
          doc.write(html);
          doc.close();
          setTimeout(() => {
            iframe.contentWindow?.focus();
            iframe.contentWindow?.print();
          }, 300);
          return;
        }
      } catch (err) {
        console.warn('Iframe print error', err);
      }
    }

    // Mobile / Popup fallback
    const win = window.open('', '_blank');
    if (win) {
      win.document.open();
      win.document.write(html);
      win.document.close();
      setTimeout(() => {
        win.focus();
        win.print();
      }, 350);
      return;
    }
    window.print();
  };
  return (
    <main className="member-page">`;

  accountContent = accountContent.slice(0, startIndex) + newPrintCode + accountContent.slice(endIndex + endLength);
  fs.writeFileSync(accountPath, accountContent, 'utf8');
  console.log('Successfully replaced printPatientPrescription via precise index slice!');
} else {
  console.error('Could not find slice markers:', { startIndex, endIndex });
}
