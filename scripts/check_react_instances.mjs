import fs from 'fs';

const lock = JSON.parse(fs.readFileSync('package-lock.json', 'utf8'));
const pkgs = lock.packages || {};

console.log('React packages in lockfile:');
for (const [k, v] of Object.entries(pkgs)) {
  if (k.endsWith('/react') || k === 'node_modules/react') {
    console.log(k, v.version);
  }
}

console.log('\nChecking physical node_modules paths:');
function checkPath(p) {
  if (fs.existsSync(p)) {
    const pkg = JSON.parse(fs.readFileSync(p + '/package.json', 'utf8'));
    console.log(p, '-> version:', pkg.version);
  } else {
    console.log(p, '-> NOT FOUND');
  }
}

checkPath('node_modules/react');
checkPath('client/node_modules/react');
checkPath('node_modules/@gsap/react/node_modules/react');
checkPath('node_modules/react-router-dom/node_modules/react');
checkPath('node_modules/react-router/node_modules/react');
