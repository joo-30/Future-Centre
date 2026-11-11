import path from 'node:path';
import fs from 'node:fs';
import { execSync } from 'node:child_process';

const RAW_DIR = 'E:/Project Work/videos media🔥❤️/Future Center/Future-Centre/video_production/raw';
const OUT_DIR = 'E:/Project Work/videos media🔥❤️/Future Center/Future-Centre/video_production/output';
const AUDIO_DIR = 'E:/Project Work/videos media🔥❤️/sound UI UX';

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

// Check which font to use for Arabic text in FFmpeg drawtext filter
// On Windows: Arial or Tahoma or Segoe UI
const FONT_FILE = 'C:/Windows/Fonts/tahoma.ttf';

function getVideoDuration(filePath) {
  try {
    const cmd = `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${filePath}"`;
    const out = execSync(cmd).toString().trim();
    return parseFloat(out);
  } catch (e) {
    return 0;
  }
}

async function main() {
  console.log('--- STARTING VIDEO COMPOSITION PIPELINE ---');

  const scenes = [
    {
      file: 'scene1_hero_programs.webm',
      type: 'mobile',
      chapter: 'الفصل 01 • برامج ورعاية مخصصة',
      title: 'مركز المستقبل للتغذية العلاجية',
      sub: 'باقة المتابعة الشهرية 1,200 ج.م — كشف دوري وخطة مخصصة بدون حرمان',
    },
    {
      file: 'scene2_inbody_calculator.webm',
      type: 'mobile',
      chapter: 'الفصل 02 • الفحص التفاعلي الفوري',
      title: 'حاسبة InBody السريرية',
      sub: 'تحليل فوري لمؤشر كتلة الجسم ونسبة الدهون والسعرات المستهدفة بدقة',
    },
    {
      file: 'scene3_stories_lightbox.webm',
      type: 'mobile',
      chapter: 'الفصل 03 • نتائج موثقة قبل وبعد',
      title: 'قصص نجاح ورسائل واتساب موثقة',
      sub: 'حالات واقعية موثقة من داخل العيادة — معاينة التقرير والصور والنتائج',
    },
    {
      file: 'scene4_booking_qr.webm',
      type: 'mobile',
      chapter: 'الفصل 04 • الحجز الذكي وبطاقة QR',
      title: 'بطاقة المريض الرقمية (QR Pass)',
      sub: 'حجز الموعد واستلام كود الدخول الرقمي الفوري لمسحه بالعيادة',
    },
    {
      file: 'scene5_admin_pulse_agenda.webm',
      type: 'desktop',
      chapter: 'الفصل 05 • لوحة تشغيل العيادة',
      title: 'نظام إدارة العيادة (Admin OS)',
      sub: 'النبض المالي والتشغيلي اللحظي، إدارة المواعيد، وسكانر كود المريض',
    },
    {
      file: 'scene6_patient_crm_rx.webm',
      type: 'desktop',
      chapter: 'الفصل 06 • رعاية وملف المريض',
      title: 'ملف المريض والروشتة الغذائية',
      sub: 'سجل تاريخي كامل لقياسات InBody وتصميم الأنظمة الغذائية التخصصية',
    },
  ];

  const processedClips = [];

  for (let i = 0; i < scenes.length; i++) {
    const s = scenes[i];
    const rawPath = path.join(RAW_DIR, s.file);
    if (!fs.existsSync(rawPath)) {
      console.error(`Missing raw file: ${rawPath}`);
      continue;
    }

    const duration = getVideoDuration(rawPath);
    console.log(`Processing Scene ${i + 1}: ${s.file} (Duration: ${duration.toFixed(1)}s)`);

    const outClip = path.join(OUT_DIR, `framed_scene_${i + 1}.mp4`);

    // We build a 1080x1920 (9:16) composition:
    // Dark luxury emerald/slate background: color=#041a12
    // Top Bar: Chapter badge & Brand Title
    // Center: The video scaled cleanly (mobile or desktop)
    // Bottom Bar: Feature summary card

    let filterComplex = '';

    if (s.type === 'mobile') {
      // Mobile frame: scaled to width 720, height 1440, centered at x=(1080-720)/2 = 180, y=240
      filterComplex = `
        color=c=#031a13:s=1080x1920:d=${duration}[bg];
        [0:v]scale=700:1400:force_original_aspect_ratio=decrease,pad=720:1440:(ow-iw)/2:(oh-ih)/2:color=#064e3b[framed];
        [bg][framed]overlay=180:240[v1]
      `.replace(/\s+/g, ' ');
    } else {
      // Desktop frame: scaled to width 960, height 600, centered at x=(1080-960)/2 = 60, y=560
      filterComplex = `
        color=c=#031a13:s=1080x1920:d=${duration}[bg];
        [0:v]scale=960:600:force_original_aspect_ratio=decrease,pad=980:620:(ow-iw)/2:(oh-ih)/2:color=#064e3b[framed];
        [bg][framed]overlay=50:560[v1]
      `.replace(/\s+/g, ' ');
    }

    // Run ffmpeg to generate framed clip
    const ffmpegCmd = `ffmpeg -y -i "${rawPath}" -filter_complex "${filterComplex}" -map "[v1]" -c:v libx264 -pix_fmt yuv420p -r 30 -preset fast "${outClip}"`;
    try {
      execSync(ffmpegCmd, { stdio: 'inherit' });
      processedClips.push(outClip);
    } catch (e) {
      console.error(`Error framing scene ${i + 1}:`, e.message);
    }
  }

  console.log(`Processed ${processedClips.length} clips.`);
}

main().catch(console.error);
