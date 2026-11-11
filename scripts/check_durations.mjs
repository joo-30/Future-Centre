import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const dir = 'Future-Centre/video_production/raw';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.webm'));

let total = 0;
for (const f of files) {
  const full = path.join(dir, f);
  const out = execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${full}"`).toString().trim();
  const d = parseFloat(out);
  total += d;
  console.log(`${f}: ${d.toFixed(1)}s`);
}
console.log(`TOTAL DURATION: ${total.toFixed(1)}s (${(total / 60).toFixed(2)} min)`);
