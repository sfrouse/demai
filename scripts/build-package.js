const { execSync } = require('child_process');
const path = require('path');

const packageDir = process.argv[2];
if (!packageDir) {
    console.error('Please specify a package directory.');
    process.exit(1);
}

const fullPath = path.resolve(packageDir);

console.log(`📦 Installing dependencies for ${fullPath}...`);
execSync('npm install', { cwd: fullPath, stdio: 'inherit' });

console.log(`🔧 Building ${fullPath}...`);
execSync('npm run build', { cwd: fullPath, stdio: 'inherit' });
