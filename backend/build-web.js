const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Current working directory:', process.cwd());

// Determine target mobile directory from any location
let mobileDir = process.cwd();
if (fs.existsSync(path.join(process.cwd(), 'apps', 'mobile'))) {
  mobileDir = path.join(process.cwd(), 'apps', 'mobile');
  console.log('Found mobile app at:', mobileDir);
} else if (fs.existsSync(path.join(process.cwd(), '..', 'apps', 'mobile'))) {
  mobileDir = path.resolve(path.join(process.cwd(), '..', 'apps', 'mobile'));
  console.log('Found mobile app relative to parent at:', mobileDir);
} else if (fs.existsSync(path.join(process.cwd(), 'app.json'))) {
  console.log('Already inside mobile app directory.');
} else {
  console.error('Could not locate apps/mobile from:', process.cwd());
  process.exit(1);
}

// Install dependencies with legacy-peer-deps
console.log('Installing mobile dependencies in:', mobileDir);
execSync('npm install --legacy-peer-deps', {
  cwd: mobileDir,
  stdio: 'inherit',
  env: { ...process.env, CI: 'false' },
});

// Export web bundle using Expo
console.log('Exporting Expo web bundle...');
execSync('npx expo export -p web', {
  cwd: mobileDir,
  stdio: 'inherit',
  env: { ...process.env, CI: 'false' },
});

// Copy dist to current working directory so Vercel can find it wherever it is
const sourceDist = path.join(mobileDir, 'dist');
const targetDist = path.join(process.cwd(), 'dist');

if (fs.existsSync(sourceDist) && sourceDist !== targetDist) {
  console.log('Copying dist to current directory:', targetDist);
  fs.cpSync(sourceDist, targetDist, { recursive: true });
}

console.log('✓ Web build completed successfully!');

