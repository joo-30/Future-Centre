import path from 'node:path';
import fs from 'node:fs';
import { execSync } from 'node:child_process';

const RAW_DIR = 'E:/Project Work/videos media🔥❤️/Future Center/Future-Centre/video_production/raw';
const OVERLAYS_DIR = 'E:/Project Work/videos media🔥❤️/Future Center/Future-Centre/video_production/overlays';
const WORK_DIR = 'E:/Project Work/videos media🔥❤️/Future Center/Future-Centre/video_production/work';
const AUDIO_DIR = 'E:/Project Work/videos media🔥❤️/sound UI UX';
const FINAL_OUTPUT = 'E:/Project Work/videos media🔥❤️/Future Center/Future_Center_Showcase_9x16_FullHD.mp4';

if (!fs.existsSync(WORK_DIR)) {
  fs.mkdirSync(WORK_DIR, { recursive: true });
}

function getDuration(filePath) {
  try {
    const cmd = `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${filePath}"`;
    return parseFloat(execSync(cmd).toString().trim());
  } catch (e) {
    return 0;
  }
}

async function main() {
  console.log('========================================================');
  console.log('STARTING FULL-HD 1080x1920 VIDEO COMPOSITING & RENDER');
  console.log('========================================================');

  const scenes = [
    { id: 1, file: 'scene1_hero_programs.webm', type: 'mobile' },
    { id: 2, file: 'scene2_inbody_calculator.webm', type: 'mobile' },
    { id: 3, file: 'scene3_stories_lightbox.webm', type: 'mobile' },
    { id: 4, file: 'scene4_booking_qr.webm', type: 'mobile' },
    { id: 5, file: 'scene5_admin_pulse_agenda.webm', type: 'desktop' },
    { id: 6, file: 'scene6_patient_crm_rx.webm', type: 'desktop' },
  ];

  const renderedScenes = [];

  for (const s of scenes) {
    const rawPath = path.join(RAW_DIR, s.file);
    const overlayPath = path.join(OVERLAYS_DIR, `overlay_${s.id}.png`);
    const outScene = path.join(WORK_DIR, `scene_${s.id}_master.mp4`);

    if (!fs.existsSync(rawPath) || !fs.existsSync(overlayPath)) {
      console.error(`Missing input for scene ${s.id}`);
      continue;
    }

    const duration = getDuration(rawPath);
    console.log(`\nRendering Master Scene ${s.id} (${s.type}) - ${duration.toFixed(1)}s`);

    let filterComplex = '';
    if (s.type === 'mobile') {
      // 1080x1920 background
      // Scale mobile video: 700x1400, pad: 716x1416 with #064e3b border
      // Overlay at x=182, y=240
      // Then overlay PNG overlay on top
      filterComplex = `
        color=c=#021812:s=1080x1920:d=${duration}[bg];
        [0:v]scale=700:1400:force_original_aspect_ratio=decrease,pad=716:1416:(ow-iw)/2:(oh-ih)/2:color=#042f22[device];
        [bg][device]overlay=182:240[v1];
        [v1][1:v]overlay=0:0[vout]
      `.replace(/\s+/g, ' ');
    } else {
      // Desktop: 980x612, pad: 1000x632 with #042f22
      // Overlay at x=40, y=560
      // Then overlay PNG overlay on top
      filterComplex = `
        color=c=#021812:s=1080x1920:d=${duration}[bg];
        [0:v]scale=980:612:force_original_aspect_ratio=decrease,pad=1000:632:(ow-iw)/2:(oh-ih)/2:color=#042f22[device];
        [bg][device]overlay=40:560[v1];
        [v1][1:v]overlay=0:0[vout]
      `.replace(/\s+/g, ' ');
    }

    const cmd = `ffmpeg -y -i "${rawPath}" -i "${overlayPath}" -filter_complex "${filterComplex}" -map "[vout]" -c:v libx264 -pix_fmt yuv420p -r 30 -preset medium -b:v 4500k "${outScene}"`;
    execSync(cmd, { stdio: 'inherit' });
    renderedScenes.push(outScene);
  }

  // Scene 7: Outro Card (6 seconds)
  console.log('\nRendering Outro Scene 7 (6.0s)...');
  const outroOverlay = path.join(OVERLAYS_DIR, 'overlay_outro.png');
  const outroScene = path.join(WORK_DIR, 'scene_7_outro.mp4');
  const outroCmd = `ffmpeg -y -loop 1 -i "${outroOverlay}" -c:v libx264 -t 6 -pix_fmt yuv420p -r 30 -vf "fade=t=out:st=4.5:d=1.5" -b:v 4500k "${outroScene}"`;
  execSync(outroCmd, { stdio: 'inherit' });
  renderedScenes.push(outroScene);

  // Concat all 7 scenes
  console.log('\nConcatenating all scenes...');
  const concatList = path.join(WORK_DIR, 'concat_list.txt');
  const listContent = renderedScenes.map(f => `file '${f.replace(/\\/g, '/')}'`).join('\n');
  fs.writeFileSync(concatList, listContent, 'utf8');

  const mergedVideo = path.join(WORK_DIR, 'merged_visuals.mp4');
  const concatCmd = `ffmpeg -y -f concat -safe 0 -i "${concatList}" -c copy "${mergedVideo}"`;
  execSync(concatCmd, { stdio: 'inherit' });

  const totalVideoDuration = getDuration(mergedVideo);
  console.log(`\nMerged Visuals Duration: ${totalVideoDuration.toFixed(1)}s`);

  // Audio Assembly
  console.log('\nMixing Audio Track & Sound Effects...');
  const bgMusic = path.join(AUDIO_DIR, 'alexrockbeat-minimal-corporate-inspiration-595636.mp3');
  const whoosh = path.join(AUDIO_DIR, 'dragon-studio-whoosh-cinematic-376875.mp3');
  const subDrop = path.join(AUDIO_DIR, 'Deep Sub Bass Boom  Sub Drop.mp3');
  const ding = path.join(AUDIO_DIR, 'dragon-studio-ding-sfx-472366.mp3');

  // Fade out music 3 seconds before video ends
  const fadeOutStart = Math.max(0, totalVideoDuration - 3.5).toFixed(1);

  // We mix background music + subDrop at 0s + whooshes at scene boundaries + ding
  // Scene durations:
  const d1 = getDuration(renderedScenes[0]);
  const d2 = getDuration(renderedScenes[1]);
  const d3 = getDuration(renderedScenes[2]);
  const d4 = getDuration(renderedScenes[3]);
  const d5 = getDuration(renderedScenes[4]);
  const d6 = getDuration(renderedScenes[5]);

  const t1 = d1.toFixed(1);
  const t2 = (d1 + d2).toFixed(1);
  const t3 = (d1 + d2 + d3).toFixed(1);
  const t4 = (d1 + d2 + d3 + d4).toFixed(1);
  const t5 = (d1 + d2 + d3 + d4 + d5).toFixed(1);
  const t6 = (d1 + d2 + d3 + d4 + d5 + d6).toFixed(1);

  console.log(`Scene Transition Timestamps: ${t1}s, ${t2}s, ${t3}s, ${t4}s, ${t5}s, ${t6}s`);

  // Build audio filter with amix
  const audioFilter = `
    [1:a]volume=0.85,afade=t=in:st=0:d=1.5,afade=t=out:st=${fadeOutStart}:d=3.5[bgm];
    [2:a]volume=0.9,adelay=100|100[sfx_intro];
    [3:a]volume=0.6,adelay=${Math.round(parseFloat(t1) * 1000)}|${Math.round(parseFloat(t1) * 1000)}[w1];
    [3:a]volume=0.6,adelay=${Math.round(parseFloat(t2) * 1000)}|${Math.round(parseFloat(t2) * 1000)}[w2];
    [3:a]volume=0.6,adelay=${Math.round(parseFloat(t3) * 1000)}|${Math.round(parseFloat(t3) * 1000)}[w3];
    [3:a]volume=0.6,adelay=${Math.round(parseFloat(t4) * 1000)}|${Math.round(parseFloat(t4) * 1000)}[w4];
    [3:a]volume=0.6,adelay=${Math.round(parseFloat(t5) * 1000)}|${Math.round(parseFloat(t5) * 1000)}[w5];
    [4:a]volume=0.8,adelay=${Math.round((parseFloat(t3) + 10) * 1000)}|${Math.round((parseFloat(t3) + 10) * 1000)}[ding_qr];
    [bgm][sfx_intro][w1][w2][w3][w4][w5][ding_qr]amix=inputs=8:duration=first:dropout_transition=2[aout]
  `.replace(/\s+/g, ' ');

  const finalRenderCmd = `ffmpeg -y -i "${mergedVideo}" -i "${bgMusic}" -i "${subDrop}" -i "${whoosh}" -i "${ding}" -filter_complex "${audioFilter}" -map 0:v -map "[aout]" -c:v copy -c:a aac -b:a 256k -shortest "${FINAL_OUTPUT}"`;

  console.log('\nExporting Final Broadcast-Quality MP4...');
  execSync(finalRenderCmd, { stdio: 'inherit' });

  console.log('\n========================================================');
  console.log('PROMOTIONAL VIDEO EXPORTED SUCCESSFULLY!');
  console.log(`Path: ${FINAL_OUTPUT}`);
  console.log('========================================================');
}

main().catch(console.error);
