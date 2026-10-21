const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Current working directory:', process.cwd());

// 1. Determine target mobile directory
let mobileDir = process.cwd();
if (fs.existsSync(path.join(process.cwd(), 'apps', 'mobile'))) {
  mobileDir = path.join(process.cwd(), 'apps', 'mobile');
  console.log('Detected monorepo root. Switching to:', mobileDir);
} else if (fs.existsSync(path.join(process.cwd(), 'app.json'))) {
  console.log('Already inside mobile app directory.');
}

// 2. Install dependencies with legacy-peer-deps
console.log('Installing mobile dependencies...');
execSync('npm install --legacy-peer-deps', {
  cwd: mobileDir,
  stdio: 'inherit',
  env: { ...process.env, CI: 'false' },
});

// 3. Export web bundle using Expo
console.log('Exporting Expo web bundle...');
execSync('npx expo export -p web', {
  cwd: mobileDir,
  stdio: 'inherit',
  env: { ...process.env, CI: 'false' },
});

// 4. Ensure dist exists at both locations (inside apps/mobile and at repository root)
const sourceDist = path.join(mobileDir, 'dist');
const rootDist = path.join(__dirname, 'dist');

if (fs.existsSync(sourceDist) && sourceDist !== rootDist) {
  console.log('Mirroring dist to root directory for Vercel...');
  fs.cpSync(sourceDist, rootDist, { recursive: true });
}

console.log('✓ Web build completed successfully!');
