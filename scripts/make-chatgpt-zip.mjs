import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const root = path.resolve('E:/Future Center/Future-Center');
const outZip = path.resolve('E:/Future Center/Future-Center-SourceCode.zip');
const tempDir = path.resolve('E:/Future Center/_temp_bundle');

if (fs.existsSync(outZip)) fs.unlinkSync(outZip);
if (fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true, force: true });
fs.mkdirSync(tempDir, { recursive: true });

function copyFiltered(src, dst) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    const base = path.basename(src);
    if (base === 'node_modules' || base === 'dist' || base === '.git' || base === '.gemini' || base === '.local' || base === '.system_generated') return;
    if (!fs.existsSync(dst)) fs.mkdirSync(dst, { recursive: true });
    for (const file of fs.readdirSync(src)) {
      copyFiltered(path.join(src, file), path.join(dst, file));
    }
  } else {
    fs.copyFileSync(src, dst);
  }
}

console.log('Packaging clean source files (excluding node_modules & dist)...');
copyFiltered(root, path.join(tempDir, 'Future-Center'));

console.log('Compressing to zip...');
execSync(`powershell -command "Compress-Archive -Path '${tempDir}/Future-Center/*' -DestinationPath '${outZip}' -Force"`);

fs.rmSync(tempDir, { recursive: true, force: true });
const stats = fs.statSync(outZip);
console.log(`Success! File created: ${outZip} (${(stats.size / (1024 * 1024)).toFixed(2)} MB)`);
