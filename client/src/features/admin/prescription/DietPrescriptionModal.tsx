import {
  AlertCircle,
  CheckCircle2,
  Droplets,
  Pill,
  Printer,
  Send,
  Activity,
  Utensils,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { DatePicker } from '../../../components/forms/DatePicker';
import { WhatsAppIcon } from '../../../components/icons/WhatsAppIcon';
import { useCatalog } from '../../../hooks/useCatalog';
import { dateLabel, today, whatsappUrl } from '../../../lib/api';
import { adminApi } from '../../../lib/portal-api';
import { refreshAdmin } from '../lib/cache';

export interface PrescriptionData {
  id?: string;
  userId?: string | null;
  fileNumber?: number;
  patientName: string;
  patientPhone: string;
  age?: string;
  height?: string;
  date: string;
  nextDate: string;
  goal: string;
  // Metrics
  weight: string;
  targetWeight: string;
  bodyFatPercent: string;
  muscleMass: string;
  waterPercent: string;
  // Diet Meals
  breakfast: string;
  snack1: string;
  lunch: string;
  snack2: string;
  dinner: string;
  waterIntake: string;
  supplements: string;
  instructions: string;
}

// Quick Clinic Diet Presets
const dietPresets: {
  id: string;
  title: string;
  badge: string;
  goal: string;
  data: Partial<PrescriptionData>;
}[] = [
  {
    id: 'balanced',
    title: 'نظام متوازن مرن (Balanced Diet)',
    badge: 'الأكثر شيوعاً',
    goal: 'إنقاص وزن صحي مع تحسين معدل الحرق والنشاط اليومي',
    data: {
      breakfast: 'بيضتان مسلوقتان + نصف رغيف بلدي + شريحة جبن قريش أو فيتا لايت + خيار وخس وطماطم.',
      snack1: 'ثمرة تفاح أو برتقال + 5 حبات لوز نِيء.',
      lunch: 'صدر دجاج مشوي أو شريحة سمك فيليه (150-200 جم) + 4 ملاعق أرز بسمتي أو مكرونة بني + طبق سلطة خضراء كبير بزيت الزيتون.',
      snack2: 'كوب شاي أخضر أو قهوة بدون سكر + حفنة ترمس أو ثمرة فاكهة.',
      dinner: 'علبة زبادي لايت كبيرة مع عصرة ليمون وبذور الشيا + طبق سلطة خضراء مع بيضة مسلوقة.',
      waterIntake: '3 لتر ماء موزعة على مدار اليوم (كوب كل ساعة ونصف).',
      supplements: 'فيتامين D3 (قرص أسبوعياً) + أوميجا 3 بعد الغداء.',
      instructions: 'الابتعاد عن السكر الأبيض والمقليات والمشروبات الغازية. المشي 30 دقيقة يومياً.',
    },
  },
  {
    id: 'lowcarb',
    title: 'نظام قليل النشويات (Low Carb)',
    badge: 'نزول سريع',
    goal: 'حرق دهون متراكمة وعلاج مقاومة الإنسولين',
    data: {
      breakfast: 'أومليت بالخضار (بيضتان + فلفل ألوان + مشروم) بزيت الزيتون + 3 ملاعق فول بزيت زيتون وليمون + خضروات ورقية (جرجير وخيار).',
      snack1: 'حفنة مكسرات مشكلة نِيئة (عين جمل ولوز) + مشروب عشبي بدون سكر.',
      lunch: 'قطعة لحم بتلو أو علبة تونة مصفاة بزيت الزيتون + طبق خضار سوتيه كبير (كوسة وبروكلي وفاصوليا) + طبق سلطة خضراء غني بزيت الزيتون والليمون.',
      snack2: 'شريحة جبن شيدر طبيعي أو خيار مع لبنة لايت.',
      dinner: 'سلطة تونة خفيفة أو طبق جبن قريش بالطماطم وزيت الزيتون + خضروات ورقية بدون خبز.',
      waterIntake: '3.5 لتر ماء يومياً لتعزيز الحرق وتنقية الجسم.',
      supplements: 'ماغنسيوم سترات قبل النوم + مالتي فيتامين صباحاً.',
      instructions: 'منع الخبز والحلويات والمعجنات تماماً. الالتزام ببروتين كافي وسلطة وفيرة.',
    },
  },
  {
    id: 'intermittent',
    title: 'صيام متقطع (16/8 Intermittent)',
    badge: 'تنظيم الشهية',
    goal: 'إعادة ضبط هرمونات الجوع والتخلص من دهون البطن والكرش',
    data: {
      breakfast: 'فترة صيام صباحية (يُسمح بالماء والشاي الأخضر والقهوة السادة). كسر الصيام الساعة 1:00 ظهراً بوجبة متكاملة: 2 بيضة مسلوقة + جبن قريش + ربع رغيف + سلطة خضراء.',
      snack1: 'كوب زبادي يوناني أو عادي مع ملعقة بذور كتان + ثمرة فاكهة.',
      lunch: 'وجبة رئيسية (الساعة 5:00 عصراً): ربع فرخة مشوية أو لحم مسلوق + خضار مطبوخ بقليل من الزيت + سلطة خضراء + 3 ملاعق أرز.',
      snack2: 'مشروب دافئ بدون سكر (قرفة أو يانسون).',
      dinner: 'الوجبة الأخيرة (الساعة 8:30 مساءً): سلطة جبن فيتا لايت مع بيضة مسلوقة وخيار + علبة زبادي صغيرة. بعدها يبدأ الصيام حتى ظهر اليوم التالي.',
      waterIntake: '3 لتر ماء متواصلة طوال فترة الصيام وساعات الإفطار.',
      supplements: 'فيتامين C وزنك بعد الوجبة الرئيسية.',
      instructions: 'نافذة الأكل 8 ساعات فقط (مثلاً من 1:00 م حتى 9:00 م)، والـ 16 ساعة الباقية صيام عن السعرات.',
    },
  },
  {
    id: 'pcos_insulin',
    title: 'مقاومة الإنسولين وتكيس المبايض',
    badge: 'علاجي متخصص',
    goal: 'تحسين حساسية الإنسولين وضبط الهرمونات ومحيط الخصر',
    data: {
      breakfast: 'شريحة توست بني كامل الحبة أو نصف رغيف ردة + 4 ملاعق فول أو بيضتان مسلوقتان + سلطة خضراء مع ملعقة زيت زيتون وبذور شيا.',
      snack1: 'حفنة لوز نِيء + ثمرة فاكهة ذات مؤشر جلايسيمي منخفض (فراولة أو تفاح أخضر أو جوافة).',
      lunch: 'بروتين مشوي صافي (سمك مشوي أو فراخ أو تونة) + طبق سلطة كبير (يبدأ به الأكل) + طبق خضروات مطهية على البخار + 3 ملاعق كينوا أو برغل أو أرز بني.',
      snack2: 'كوب شاي أخضر بالنعناع مع رشة قرفة طبيعية.',
      dinner: 'سلطة جبن قريش بالطماطم وزيت الزيتون + بيضة مسلوقة + خيار وخس.',
      waterIntake: '3 لتر ماء موزعة، كوب قبل كل وجبة بربع ساعة.',
      supplements: 'إينوزيتول (Inositol) أو كروميوم حسب إرشادات الطبيبة + فيتامين D3.',
      instructions: 'البدء بتناول السلطة أولاً ثم البروتين ثم النشويات في كل وجبة لمنع ارتفاع سكر الدم المفاجئ.',
    },
  },
];

interface DietPrescriptionModalProps {
  open: boolean;
  onClose: () => void;
  defaultData?: Partial<PrescriptionData>;
  onSaved?: (data: unknown) => void;
}

export function DietPrescriptionModal({
  open,
  onClose,
  defaultData,
  onSaved,
}: DietPrescriptionModalProps) {
  const { data: catalog } = useCatalog();
  const clinic = catalog?.clinic;

  const buildInitialForm = (d?: Partial<PrescriptionData>): PrescriptionData => ({
    id: d?.id,
    userId: d?.userId || null,
    fileNumber: d?.fileNumber,
    patientName: d?.patientName || '',
    patientPhone: d?.patientPhone || '',
    age: d?.age || '28',
    height: d?.height || '165',
    date: d?.date || today(),
    nextDate: d?.nextDate || '',
    goal: d?.goal || 'إنقاص وزن وتنسيق قوام مع تعزيز معدل الحرق',
    weight: d?.weight || '78.5',
    targetWeight: d?.targetWeight || '65.0',
    bodyFatPercent: d?.bodyFatPercent || '32.4',
    muscleMass: d?.muscleMass || '24.8',
    waterPercent: d?.waterPercent || '48.2',
    breakfast:
      d?.breakfast ||
      dietPresets[0].data.breakfast ||
      'بيضتان مسلوقتان + نصف رغيف بلدي + جبن قريش + طبق خضروات ورقية.',
    snack1: d?.snack1 || dietPresets[0].data.snack1 || 'ثمرة تفاح + 5 حبات لوز نِيء.',
    lunch:
      d?.lunch ||
      dietPresets[0].data.lunch ||
      'صدر دجاج مشوي + 4 ملاعق أرز بسمتي + طبق سلطة خضراء كبير بزيت الزيتون.',
    snack2:
      d?.snack2 || dietPresets[0].data.snack2 || 'كوب شاي أخضر بدون سكر + ثمرة فاكهة.',
    dinner:
      d?.dinner ||
      dietPresets[0].data.dinner ||
      'علبة زبادي لايت مع عصرة ليمون وبذور شيا + طبق سلطة خفيف مع بيضة مسلوقة.',
    waterIntake: d?.waterIntake || '3 لتر ماء موزعة بانتظام على مدار اليوم.',
    supplements: d?.supplements || 'فيتامين D3 أسبوعياً + أوميجا 3 يومياً بعد الغداء.',
    instructions:
      d?.instructions ||
      'الالتزام بمواعيد الوجبات وتجنب المقليات والمياه الغازية. المشي 30 دقيقة يومياً.',
  });

  const queryClient = useQueryClient();
  const isSavingRef = useRef(false);
  const [form, setForm] = useState<PrescriptionData>(() => buildInitialForm(defaultData));
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{
    type: 'success' | 'error';
    message: string;
    subMessage?: string;
  } | null>(null);

  // Reset and update form whenever modal opens or defaultData changes
  useEffect(() => {
    if (open) {
      setForm(buildInitialForm(defaultData));
      setToast(null);
      isSavingRef.current = false;
    }
  }, [open, defaultData]);

  // Auto-dismiss toast after 5 seconds
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(timer);
  }, [toast]);

  const handleSaveToPatient = async () => {
    if (isSavingRef.current || saving) return;

    if (!form.patientName.trim()) {
      setToast({
        type: 'error',
        message: 'يرجى كتابة اسم المريض في الروشتة أولاً.',
      });
      return;
    }

    isSavingRef.current = true;
    setSaving(true);
    setToast(null);

    try {
      const saved = await adminApi.savePrescription({
        ...form,
        id: form.id || defaultData?.id || undefined,
        userId: form.userId || defaultData?.userId || null,
      });

      if (saved?.id) {
        setForm((prev) => ({ ...prev, id: saved.id }));
      }

      // Invalidate queries so admin lists and patient accounts reflect changes immediately
      refreshAdmin(queryClient);
      onSaved?.(saved);

      const hasLinkedAccount = Boolean(form.userId || defaultData?.userId || saved?.userId);
      setToast({
        type: 'success',
        message: hasLinkedAccount
          ? 'تم حفظ ونشر الروشتة لحساب المريض بنجاح!'
          : 'تم حفظ الروشتة في سجلات المركز وربطها بهاتف المريض بنجاح!',
        subMessage: hasLinkedAccount
          ? 'الروشتة متاحة الآن في بوابة المريض ويمكنه الاطلاع عليها ومتابعتها فوراً.'
          : 'ستظهر الروشتة للمريض في لوحة حسابه فور تسجيل دخوله برقم الهاتف.',
      });
    } catch (e) {
      setToast({
        type: 'error',
        message: 'تعذر حفظ الروشتة.',
        subMessage: (e as Error).message || 'يرجى مراجعة البيانات والمحاولة مرة أخرى.',
      });
    } finally {
      setSaving(false);
      setTimeout(() => {
        isSavingRef.current = false;
      }, 1000);
    }
  };

  const applyPreset = (presetId: string) => {
    const found = dietPresets.find((p) => p.id === presetId);
    if (!found) return;
    setForm((prev) => ({
      ...prev,
      goal: found.goal,
      ...found.data,
    }));
  };

  // Generate WhatsApp formatted text
  const whatsappText = useMemo(() => {
    const d = form;
    return `🌸 *روشتة وبرنامج التغذية - مركز المستقبل* 🌸
دكتورة د. رنا ياسر الشوري - أخصائية التغذية العلاجية وتنسيق القوام

👤 *المريض:* ${d.patientName}
📅 *التاريخ:* ${dateLabel(d.date)}
🎯 *الهدف:* ${d.goal}

📊 *قياسات الـ InBody:*
• الوزن الحالي: ${d.weight} كجم
• الوزن المستهدف: ${d.targetWeight} كجم
• نسبة الدهون: ${d.bodyFatPercent}%
• الكتلة العضلية: ${d.muscleMass} كجم

📋 *البرنامج الغذائي اليومي:*
🌅 *الإفطار:* ${d.breakfast}
🍎 *سناك 1:* ${d.snack1}
🥗 *الغداء:* ${d.lunch}
🍵 *سناك 2:* ${d.snack2}
🌙 *العشاء:* ${d.dinner}

💧 *شرب الماء:* ${d.waterIntake}
💊 *المكملات:* ${d.supplements}
⚠️ *تعليمات هامة:* ${d.instructions}
${d.nextDate ? `\n🗓️ *موعد المتابعة القادم:* ${dateLabel(d.nextDate)}` : ''}

مركز المستقبل يتمنى لكِ دوام الصحة والعافية ✨`;
  }, [form]);

  // Bulletproof A4 Print Handler via dedicated print frame
  const handlePrint = () => {
    const printContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="utf-8">
        <title>روشتة مركز المستقبل - ${form.patientName || 'مريض'}</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Alexandria:wght@400;600;700;800&family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap" rel="stylesheet">
        <style>
          @page {
            size: A4 portrait;
            margin: 8mm 12mm;
          }
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }
          body {
            font-family: 'IBM Plex Sans Arabic', 'Alexandria', system-ui, -apple-system, sans-serif;
            color: #193826;
            background: #ffffff;
            direction: rtl;
            font-size: 13px;
            line-height: 1.5;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .rx-sheet {
            width: 100%;
            max-width: 820px;
            margin: 0 auto;
            padding: 6px 0;
          }
          .rx-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            padding-bottom: 8px;
          }
          .rx-brand h2 {
            font-family: 'Alexandria', sans-serif;
            font-size: 24px;
            font-weight: 800;
            color: #143321;
            white-space: nowrap;
          }
          .rx-brand p {
            font-size: 13.5px;
            font-weight: 600;
            color: #3b6845;
            margin-top: 2px;
          }
          .rx-brand small {
            font-size: 11px;
            color: #728c6e;
          }
          .rx-doctor {
            text-align: left;
            direction: ltr;
          }
          .rx-doctor h3 {
            font-family: 'Alexandria', sans-serif;
            font-size: 19px;
            font-weight: 800;
            color: #143321;
            text-align: right;
            direction: rtl;
          }
          .rx-doctor p {
            font-size: 12.5px;
            font-weight: 600;
            color: #3b6845;
            margin: 2px 0 4px;
            text-align: right;
            direction: rtl;
          }
          .rx-doctor ul {
            list-style: none;
            padding: 0;
            margin: 0;
            text-align: right;
            direction: rtl;
          }
          .rx-doctor li {
            font-size: 10.5px;
            color: #617c5d;
            line-height: 1.4;
          }
          .rx-divider {
            height: 3px;
            background: linear-gradient(to left, #23432d, #8bb87f, #d7e8cf);
            margin: 8px 0 12px;
            border-radius: 3px;
          }
          .rx-patient-info {
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: #f7faf3;
            border: 1px solid #dce8d3;
            border-radius: 8px;
            padding: 8px 14px;
            margin-bottom: 8px;
          }
          .info-cell strong {
            color: #193826;
            font-size: 12.5px;
          }
          .info-cell span {
            color: #275635;
            font-weight: 700;
            font-size: 13.5px;
            margin-right: 4px;
          }
          .rx-goal {
            background: #eef6ec;
            border: 1px solid #c9e0c3;
            border-radius: 7px;
            padding: 6px 12px;
            font-size: 12.5px;
            font-weight: 700;
            color: #1c4929;
            margin-bottom: 10px;
          }
          .rx-inbody-grid {
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: 8px;
            margin-bottom: 12px;
          }
          .inbody-box {
            background: #fafcf8;
            border: 1px solid #dce6d4;
            border-radius: 8px;
            padding: 8px 6px;
            text-align: center;
          }
          .inbody-box.highlight {
            background: #eef6ec;
            border-color: #8bb579;
          }
          .inbody-box .lbl {
            font-size: 11px;
            color: #557252;
            display: block;
            margin-bottom: 2px;
            font-weight: 600;
          }
          .inbody-box .val {
            font-size: 15px;
            font-weight: 800;
            color: #193826;
            white-space: nowrap;
          }
          .inbody-box .val small {
            font-size: 10.5px;
            font-weight: 500;
            color: #698363;
            white-space: nowrap;
          }
          .rx-table {
            width: 100%;
            border-collapse: collapse;
            border: 1.5px solid #23432d;
            border-radius: 8px;
            overflow: hidden;
            margin-bottom: 10px;
          }
          .rx-table th {
            background: #23432d;
            color: #ffffff;
            font-size: 12.5px;
            font-weight: 700;
            padding: 7px 12px;
            text-align: right;
          }
          .rx-table td {
            padding: 8px 12px;
            border-bottom: 1px solid #e1ecda;
            vertical-align: top;
            font-size: 12.5px;
            line-height: 1.5;
          }
          .rx-table tr:nth-child(even) td {
            background: #fafcf8;
          }
          .meal-lbl {
            font-weight: 700;
            color: #1d4b2b;
            white-space: nowrap;
            width: 110px;
          }
          .rx-grid-2 {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            margin-bottom: 10px;
          }
          .rx-box {
            background: #f9fbf7;
            border: 1px solid #dce6d4;
            border-radius: 8px;
            padding: 8px 12px;
            font-size: 12px;
          }
          .rx-box h4 {
            font-size: 12px;
            font-weight: 700;
            color: #234e30;
            margin-bottom: 3px;
          }
          .rx-instructions {
            background: #fffdf5;
            border: 1px solid #e8dbad;
            border-radius: 8px;
            padding: 8px 12px;
            font-size: 12px;
            color: #193826;
            margin-bottom: 12px;
          }
          .rx-instructions h4 {
            font-size: 12px;
            font-weight: 700;
            color: #8c6812;
            margin-bottom: 3px;
          }
          .rx-footer {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            padding-top: 8px;
            border-top: 1.5px dashed #c8dac2;
          }
          .rx-footer-info strong {
            display: block;
            font-size: 12px;
            color: #193826;
          }
          .rx-footer-info small {
            font-size: 10px;
            color: #688263;
          }
          .rx-sig {
            text-align: center;
          }
          .rx-sig .sig-name {
            font-family: 'Alexandria', sans-serif;
            font-size: 14.5px;
            font-weight: 800;
            color: #193826;
            margin: 2px 0 1px;
          }
          .rx-sig small {
            font-size: 10px;
            color: #799473;
          }
        </style>
      </head>
      <body>
        <div class="rx-sheet">
          <!-- Header -->
          <div class="rx-header">
            <div class="rx-brand">
              <h2>مركز المستقبل</h2>
              <p>للتغذية العلاجية وتنسيق القوام</p>
              <small>رعاية تبدأ بفهمك · نتائج تستمر</small>
            </div>
            <div class="rx-doctor">
              <h3>دكتورة د. رنا ياسر الشوري</h3>
              <p>أخصائية التغذية العلاجية وتنسيق القوام</p>
              <ul>
                <li>عضو الجمعية المصرية لدراسة السمنة (EMASO)</li>
                <li>ماجستير ودبلومة التغذية الإكلينيكية وعلاج السمنة والنحافة</li>
                <li>مقاومة الإنسولين، تكيس المبايض، وتغذية الأطفال</li>
              </ul>
            </div>
          </div>

          <div class="rx-divider"></div>

          <!-- Patient Info -->
          <div class="rx-patient-info">
            <div class="info-cell"><strong>اسم الحالة:</strong> <span>${form.patientName || '—'}</span></div>
            ${form.fileNumber ? `<div class="info-cell"><strong>رقم الملف:</strong> <bdi dir="ltr">#${form.fileNumber}</bdi></div>` : ''}
            ${form.patientPhone ? `<div class="info-cell"><strong>الهاتف:</strong> <bdi dir="ltr">${form.patientPhone}</bdi></div>` : ''}
            <div class="info-cell"><strong>السن:</strong> <span>${form.age || '—'} سنة</span></div>
            <div class="info-cell"><strong>الطول:</strong> <span>${form.height || '—'} سم</span></div>
            <div class="info-cell"><strong>التاريخ:</strong> <span>${dateLabel(form.date)}</span></div>
          </div>

          ${form.goal ? `<div class="rx-goal">🎯 الهدف العلاجي: ${form.goal}</div>` : ''}

          <!-- InBody Metrics -->
          <div class="rx-inbody-grid">
            <div class="inbody-box"><span class="lbl">⚖️ الوزن الحالي</span><div class="val">${form.weight || '—'} <small>كجم</small></div></div>
            <div class="inbody-box highlight"><span class="lbl">🎯 الوزن المستهدف</span><div class="val">${form.targetWeight || '—'} <small>كجم</small></div></div>
            <div class="inbody-box"><span class="lbl">🔥 نسبة الدهون</span><div class="val">${form.bodyFatPercent || '—'} <small>%</small></div></div>
            <div class="inbody-box"><span class="lbl">💪 الكتلة العضلية</span><div class="val">${form.muscleMass || '—'} <small>كجم</small></div></div>
            <div class="inbody-box"><span class="lbl">💧 نسبة الماء</span><div class="val">${form.waterPercent || '—'} <small>%</small></div></div>
          </div>

          <!-- Meals Table -->
          <table class="rx-table">
            <thead>
              <tr>
                <th style="width: 110px;">الوجبة</th>
                <th>المكونات والخيارات الغذائية</th>
              </tr>
            </thead>
            <tbody>
              <tr><td class="meal-lbl">🌅 الإفطار</td><td>${form.breakfast || '—'}</td></tr>
              <tr><td class="meal-lbl">🍎 سناك 1</td><td>${form.snack1 || '—'}</td></tr>
              <tr><td class="meal-lbl">🥗 الغداء</td><td>${form.lunch || '—'}</td></tr>
              <tr><td class="meal-lbl">🍵 سناك 2</td><td>${form.snack2 || '—'}</td></tr>
              <tr><td class="meal-lbl">🌙 العشاء</td><td>${form.dinner || '—'}</td></tr>
            </tbody>
          </table>

          <!-- Guidelines -->
          <div class="rx-grid-2">
            <div class="rx-box"><h4>💧 شرب الماء:</h4><p>${form.waterIntake || '—'}</p></div>
            <div class="rx-box"><h4>💊 المكملات والفيتامينات:</h4><p>${form.supplements || '—'}</p></div>
          </div>

          <!-- Instructions -->
          ${form.instructions ? `
          <div class="rx-instructions">
            <h4>⚠️ ملاحظات وتعليمات هامة:</h4>
            <p>${form.instructions}</p>
            ${form.nextDate ? `<p style="margin-top: 4px; font-weight: bold; color: #234e30;">🗓️ موعد المتابعة القادم: ${dateLabel(form.nextDate)}</p>` : ''}
          </div>` : ''}

          <!-- Footer -->
          <div class="rx-footer">
            <div class="rx-footer-info">
              <strong>مركز المستقبل للتغذية العلاجية وتنسيق القوام</strong>
              <small>${clinic?.address || 'كفر الزيات، شارع الجيش عند توكيل أورنج'} · هاتف: ${clinic?.phones?.[0] || '01041504201'} · واتساب: ${clinic?.whatsapp || '01041504201'}</small>
            </div>
            <div class="rx-sig">
              <span style="font-size: 10.5px; color: #6d8667;">توقيع أخصائية التغذية:</span>
              <div class="sig-name">دكتورة د. رنا ياسر الشوري</div>
              <small>نتمنى لكِ دوام الصحة والعافية</small>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const isMobile =
      typeof window !== 'undefined' &&
      (window.innerWidth <= 768 || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent));

    // 1. On desktop: Try invisible print iframe (Zero interference with parent page)
    if (!isMobile) {
      let printFrame = document.getElementById('rx-print-iframe') as HTMLIFrameElement;
      if (!printFrame) {
        printFrame = document.createElement('iframe');
        printFrame.id = 'rx-print-iframe';
        printFrame.style.position = 'fixed';
        printFrame.style.right = '0';
        printFrame.style.bottom = '0';
        printFrame.style.width = '0';
        printFrame.style.height = '0';
        printFrame.style.border = '0';
        document.body.appendChild(printFrame);
      }

      try {
        const frameDoc = printFrame.contentDocument || printFrame.contentWindow?.document;
        if (frameDoc) {
          frameDoc.open();
          frameDoc.write(printContent);
          frameDoc.close();
          setTimeout(() => {
            printFrame.contentWindow?.focus();
            printFrame.contentWindow?.print();
          }, 300);
          return;
        }
      } catch (e) {
        console.warn('Iframe printing blocked, using popup window fallback', e);
      }
    }

    // 2. Mobile or Iframe Fallback: Open clean popup window
    try {
      const printWin = window.open('', '_blank', isMobile ? undefined : 'width=850,height=900');
      if (printWin) {
        printWin.document.open();
        printWin.document.write(printContent);
        printWin.document.close();
        setTimeout(() => {
          printWin.focus();
          printWin.print();
        }, 350);
        return;
      }
    } catch (e) {
      console.warn('Popup print blocked', e);
    }

    // 3. Fallback: native window.print()
    window.print();
  };

  if (!open) return null;

  return (
    <div className="prescription-modal-backdrop" onClick={onClose}>
      {/* Floating Toast Notification */}
      {toast && (
        <div
          className={`rx-floating-toast ${toast.type}`}
          role="status"
          aria-live="polite"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="rx-toast-icon-wrap">
            {toast.type === 'success' ? (
              <CheckCircle2 size={22} className="rx-toast-icon-pulse" />
            ) : (
              <AlertCircle size={22} />
            )}
          </div>
          <div className="rx-toast-content">
            <div className="rx-toast-title">{toast.message}</div>
            {toast.subMessage && <div className="rx-toast-sub">{toast.subMessage}</div>}
          </div>
          <button
            type="button"
            className="rx-toast-close"
            onClick={() => setToast(null)}
            aria-label="إغلاق الإشعار"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div
        className="prescription-modal-container"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Top Control Bar (Hidden in Print) */}
        <div className="prescription-actions-bar no-print">
          <div className="title-wrap">
            <Utensils size={20} className="icon-main" />
            <div>
              <h3>روشتة وبرنامج التغذية العلاجية</h3>
              <small>إعداد وتخصيص وطباعة البرنامج الغذائي للحالة</small>
            </div>
          </div>

          <div className="buttons-group">
            {/* زر حفظ ونشر لحساب المريض */}
            <button
              type="button"
              className={`btn-publish-patient ${saving ? 'is-busy' : ''}`}
              disabled={saving}
              onClick={handleSaveToPatient}
              title="حفظ الروشتة وإرسالها مباشرة لحساب المريض على المنصة"
            >
              {saving ? (
                <>
                  <span className="rx-spinner" />
                  <span>جارٍ الحفظ والنشر...</span>
                </>
              ) : (
                <>
                  <Send size={15} />
                  <span>حفظ ونشر لحساب المريض</span>
                </>
              )}
            </button>

            <button
              type="button"
              className="btn-print-action"
              onClick={handlePrint}
              title="طباعة فورية على مقاس A4 أو حفظ كـ PDF"
            >
              <Printer size={16} />
              <span>طباعة الروشتة الرسمية (PDF)</span>
            </button>

            {form.patientPhone && (
              <a
                href={whatsappUrl(form.patientPhone, whatsappText)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp-action"
                title="إرسال نص الروشتة للمريض على واتساب"
              >
                <WhatsAppIcon size={16} color="#ffffff" />
                <span>إرسال واتساب</span>
              </a>
            )}

            <button
              type="button"
              className="btn-close-modal"
              onClick={onClose}
              aria-label="إغلاق"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Quick Presets Strip (Hidden in Print) */}
        <div className="prescription-presets-strip no-print">
          <span className="presets-label">
            <Activity size={14} />
            نماذج سريعة جاهزة:
          </span>
          <div className="presets-buttons">
            {dietPresets.map((p) => (
              <button
                key={p.id}
                type="button"
                className="preset-btn"
                onClick={() => applyPreset(p.id)}
              >
                <strong>{p.title.split(' (')[0]}</strong>
                <span className="preset-badge">{p.badge}</span>
              </button>
            ))}
          </div>
        </div>

        {/* The Printable A4 Sheet On Screen */}
        <div className="printable-prescription-sheet" id="printable-sheet">
          {/* Official Clinic Header */}
          <header className="rx-header">
            <div className="rx-brand-col">
              <div className="rx-logo-title">
                <span className="rx-logo-leaf">🌿</span>
                <h2>مركز المستقبل</h2>
              </div>
              <p className="rx-brand-sub">للتغذية العلاجية وتنسيق القوام</p>
              <span className="rx-motto">رعاية تبدأ بفهمك · نتائج تستمر</span>
            </div>

            <div className="rx-doctor-col">
              <h3>دكتورة د. رنا ياسر الشوري</h3>
              <p className="rx-doc-title">أخصائية التغذية العلاجية وتنسيق القوام</p>
              <ul className="rx-doc-cred">
                <li>عضو الجمعية المصرية لدراسة السمنة (EMASO)</li>
                <li>ماجستير ودبلومة التغذية الإكلينيكية وعلاج السمنة والنحافة</li>
                <li>برامج متخصصة لمقاومة الإنسولين، تكيس المبايض، وتغذية الأطفال</li>
              </ul>
            </div>
          </header>

          <div className="rx-divider" />

          {/* Patient Details & InBody Grid */}
          <div className="rx-patient-section">
            <div className="rx-patient-info-row">
              <div className="rx-info-item is-name">
                <label>اسم الحالة:</label>
                <input
                  type="text"
                  value={form.patientName}
                  onChange={(e) => setForm({ ...form, patientName: e.target.value })}
                  placeholder="اسم المريض"
                  className="rx-editable-input name"
                />
              </div>

              <div className="rx-info-item is-phone">
                <label>رقم الهاتف:</label>
                <input
                  type="tel"
                  dir="ltr"
                  value={form.patientPhone}
                  onChange={(e) => setForm({ ...form, patientPhone: e.target.value })}
                  placeholder="01xxxxxxxxx"
                  className="rx-editable-input phone"
                />
              </div>

              <div className="rx-info-item is-stat">
                <label>السن:</label>
                <div className="rx-input-unit-wrap">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={form.age === '0' ? '' : form.age}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => {
                      const val = e.target.value.replace(/^0+/, '');
                      setForm({ ...form, age: val });
                    }}
                    placeholder="28"
                    className="rx-editable-input small"
                  />
                  <span>سنة</span>
                </div>
              </div>

              <div className="rx-info-item is-stat">
                <label>الطول:</label>
                <div className="rx-input-unit-wrap">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={form.height === '0' ? '' : form.height}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => {
                      const val = e.target.value.replace(/^0+/, '');
                      setForm({ ...form, height: val });
                    }}
                    placeholder="165"
                    className="rx-editable-input small"
                  />
                  <span>سم</span>
                </div>
              </div>

              <div className="rx-info-item is-date">
                <label>التاريخ:</label>
                <DatePicker
                  value={form.date}
                  onChange={(val) => setForm({ ...form, date: val })}
                />
              </div>
            </div>

            {/* Goal Row */}
            <div className="rx-goal-row">
              <label className="rx-goal-label">
                <span className="rx-goal-icon">🎯</span>
                <span>الهدف من الخطة:</span>
              </label>
              <input
                type="text"
                value={form.goal}
                onChange={(e) => setForm({ ...form, goal: e.target.value })}
                className="rx-goal-input"
                placeholder="الهدف العلاجي أو الرقمي (مثال: إنقاص وزن وتنسيق قوام مع تعزيز معدل الحرق)..."
              />
            </div>

            {/* InBody Metrics Cards */}
            <div className="rx-inbody-cards-row">
              <div className="inbody-metric-box">
                <span className="metric-icon">⚖️</span>
                <span className="metric-name">الوزن الحالي</span>
                <div className="metric-val">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={form.weight === '0' ? '' : form.weight}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => {
                      const val = e.target.value.replace(/^0+/, '');
                      setForm({ ...form, weight: val });
                    }}
                    className="rx-num-input"
                    aria-label="الوزن الحالي"
                    placeholder="75"
                  />
                  <small>كجم</small>
                </div>
              </div>

              <div className="inbody-metric-box highlight">
                <span className="metric-icon">🎯</span>
                <span className="metric-name">الوزن المستهدف</span>
                <div className="metric-val">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={form.targetWeight === '0' ? '' : form.targetWeight}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => {
                      const val = e.target.value.replace(/^0+/, '');
                      setForm({ ...form, targetWeight: val });
                    }}
                    className="rx-num-input"
                    aria-label="الوزن المستهدف"
                    placeholder="65"
                  />
                  <small>كجم</small>
                </div>
              </div>

              <div className="inbody-metric-box">
                <span className="metric-icon">🔥</span>
                <span className="metric-name">نسبة الدهون</span>
                <div className="metric-val">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={form.bodyFatPercent}
                    onChange={(e) => setForm({ ...form, bodyFatPercent: e.target.value })}
                    className="rx-num-input"
                    aria-label="نسبة الدهون"
                    placeholder="25"
                  />
                  <small>%</small>
                </div>
              </div>

              <div className="inbody-metric-box">
                <span className="metric-icon">💪</span>
                <span className="metric-name">الكتلة العضلية</span>
                <div className="metric-val">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={form.muscleMass}
                    onChange={(e) => setForm({ ...form, muscleMass: e.target.value })}
                    className="rx-num-input"
                    aria-label="الكتلة العضلية"
                    placeholder="30"
                  />
                  <small>كجم</small>
                </div>
              </div>

              <div className="inbody-metric-box">
                <span className="metric-icon">💧</span>
                <span className="metric-name">نسبة الماء</span>
                <div className="metric-val">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={form.waterPercent}
                    onChange={(e) => setForm({ ...form, waterPercent: e.target.value })}
                    className="rx-num-input"
                    aria-label="نسبة الماء"
                    placeholder="50"
                  />
                  <small>%</small>
                </div>
              </div>
            </div>
          </div>

          {/* Rx Meal Schedule Table */}
          <div className="rx-meals-quick-nav no-print">
            <span className="rx-quick-nav-label">
              <Utensils size={13} />
              التنقل السريع بين الوجبات:
            </span>
            <div className="rx-quick-nav-pills">
              <button
                type="button"
                className="rx-quick-nav-btn"
                onClick={() => {
                  const el = document.getElementById('rx-meal-breakfast');
                  el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }}
              >
                🌅 الإفطار
              </button>
              <button
                type="button"
                className="rx-quick-nav-btn"
                onClick={() => {
                  const el = document.getElementById('rx-meal-snack1');
                  el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }}
              >
                🍎 سناك 1
              </button>
              <button
                type="button"
                className="rx-quick-nav-btn"
                onClick={() => {
                  const el = document.getElementById('rx-meal-lunch');
                  el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }}
              >
                🥗 الغداء
              </button>
              <button
                type="button"
                className="rx-quick-nav-btn"
                onClick={() => {
                  const el = document.getElementById('rx-meal-snack2');
                  el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }}
              >
                🍵 سناك 2
              </button>
              <button
                type="button"
                className="rx-quick-nav-btn"
                onClick={() => {
                  const el = document.getElementById('rx-meal-dinner');
                  el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }}
              >
                🌙 العشاء
              </button>
              <button
                type="button"
                className="rx-quick-nav-btn"
                onClick={() => {
                  const el = document.getElementById('rx-guidelines-section');
                  el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }}
              >
                💧 التعليمات
              </button>
            </div>
          </div>

          <div className="rx-diet-table-wrap">
            <table className="rx-diet-table">
              <thead>
                <tr>
                  <th style={{ width: '130px' }}>الوجبة</th>
                  <th>المكونات والخيارات الغذائية</th>
                </tr>
              </thead>
              <tbody>
                <tr id="rx-meal-breakfast">
                  <td className="meal-name-cell">
                    <span className="meal-badge breakfast">🌅 الإفطار</span>
                  </td>
                  <td>
                    <textarea
                      rows={2}
                      value={form.breakfast}
                      onChange={(e) => setForm({ ...form, breakfast: e.target.value })}
                      className="rx-meal-textarea"
                    />
                  </td>
                </tr>

                <tr id="rx-meal-snack1">
                  <td className="meal-name-cell">
                    <span className="meal-badge snack">🍎 سناك 1</span>
                  </td>
                  <td>
                    <textarea
                      rows={1}
                      value={form.snack1}
                      onChange={(e) => setForm({ ...form, snack1: e.target.value })}
                      className="rx-meal-textarea"
                    />
                  </td>
                </tr>

                <tr id="rx-meal-lunch">
                  <td className="meal-name-cell">
                    <span className="meal-badge lunch">🥗 الغداء</span>
                  </td>
                  <td>
                    <textarea
                      rows={2}
                      value={form.lunch}
                      onChange={(e) => setForm({ ...form, lunch: e.target.value })}
                      className="rx-meal-textarea"
                    />
                  </td>
                </tr>

                <tr id="rx-meal-snack2">
                  <td className="meal-name-cell">
                    <span className="meal-badge snack">🍵 سناك 2</span>
                  </td>
                  <td>
                    <textarea
                      rows={1}
                      value={form.snack2}
                      onChange={(e) => setForm({ ...form, snack2: e.target.value })}
                      className="rx-meal-textarea"
                    />
                  </td>
                </tr>

                <tr id="rx-meal-dinner">
                  <td className="meal-name-cell">
                    <span className="meal-badge dinner">🌙 العشاء</span>
                  </td>
                  <td>
                    <textarea
                      rows={2}
                      value={form.dinner}
                      onChange={(e) => setForm({ ...form, dinner: e.target.value })}
                      className="rx-meal-textarea"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Guidelines & Supplements Row */}
          <div className="rx-guidelines-grid" id="rx-guidelines-section">
            <div className="rx-box water-box">
              <h4>
                <Droplets size={15} /> شرب الماء
              </h4>
              <textarea
                rows={2}
                value={form.waterIntake}
                onChange={(e) => setForm({ ...form, waterIntake: e.target.value })}
                className="rx-small-textarea"
              />
            </div>

            <div className="rx-box supp-box">
              <h4>
                <Pill size={15} /> الفيتامينات والمكملات
              </h4>
              <textarea
                rows={2}
                value={form.supplements}
                onChange={(e) => setForm({ ...form, supplements: e.target.value })}
                className="rx-small-textarea"
              />
            </div>
          </div>

          {/* Clinical Instructions & Follow-up */}
          <div className="rx-instructions-box">
            <h4>⚠️ ملاحظات وتعليمات هامة:</h4>
            <textarea
              rows={2}
              value={form.instructions}
              onChange={(e) => setForm({ ...form, instructions: e.target.value })}
              className="rx-small-textarea"
            />
          </div>

          {/* Footer with Doctor Signature & Clinic Address */}
          <footer className="rx-footer">
            <div className="rx-footer-contact">
              <strong>مركز المستقبل للتغذية العلاجية وتنسيق القوام</strong>
              <small>
                {clinic?.address || 'كفر الزيات، شارع الجيش عند توكيل أورنج'} · هاتف العيادة:{' '}
                {clinic?.phones?.[0] || '01041504201'} · واتساب: {clinic?.whatsapp || '01041504201'}
              </small>
            </div>

            <div className="rx-signature-col">
              <span className="sig-label">توقيع أخصائية التغذية:</span>
              <div className="sig-space">دكتورة د. رنا ياسر الشوري</div>
              <small className="sig-note">نتمنى لكِ دوام الصحة والعافية</small>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
