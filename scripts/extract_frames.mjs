import path from 'node:path';
import { execSync } from 'node:child_process';

const video = 'E:/Project Work/videos media🔥❤️/Future Center/Future_Center_Showcase_9x16_FullHD.mp4';
const outDir = 'C:/Users/asus1/.gemini/antigravity/brain/737eb81e-624f-4504-b938-d04ece747f9b';

const timestamps = [5, 25, 45, 90, 115, 134];

timestamps.forEach((t, i) => {
  const outImg = path.join(outDir, `video_frame_preview_${i + 1}.png`);
  execSync(`ffmpeg -y -ss ${t} -i "${video}" -vframes 1 "${outImg}"`);
  console.log(`Saved frame at ${t}s: ${outImg}`);
});
