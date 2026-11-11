import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const dir = 'E:/Project Work/videos media🔥❤️/sound UI UX';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.mp3'));

for (const f of files) {
  const full = path.join(dir, f);
  try {
    const cmd = `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${full}"`;
    const out = execSync(cmd).toString().trim();
    const sec = parseFloat(out);
    const min = Math.floor(sec / 60);
    const rem = Math.floor(sec % 60);
    console.log(`${f} | ${min}:${rem < 10 ? '0' : ''}${rem} (${sec.toFixed(1)}s)`);
  } catch (e) {
    console.error('Error on', f, e.message);
  }
}
