import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Starting GitHub Pages deployment...');

// Paths
const distWwwPath = path.join(__dirname, 'dist', 'www');
const docsPath = path.join(__dirname, 'docs');
const distBuildPath = path.join(distWwwPath, 'build');
const docsBuildPath = path.join(docsPath, 'build');

// Clean docs directory first
console.log('🧹 Cleaning docs directory...');
if (fs.existsSync(docsPath)) {
  fs.rmSync(docsPath, { recursive: true, force: true });
}
fs.mkdirSync(docsPath, { recursive: true });
fs.mkdirSync(docsBuildPath, { recursive: true });

// Copy essential files only
console.log('📁 Copying essential files...');

// 1. Copy index.html
const indexSrc = path.join(distWwwPath, 'index.html');
const indexDest = path.join(docsPath, 'index.html');
if (fs.existsSync(indexSrc)) {
  fs.copyFileSync(indexSrc, indexDest);
  console.log('✅ Copied index.html');
}

// 2. Copy assets folder if it exists
const assetsSrc = path.join(distWwwPath, 'assets');
const assetsDest = path.join(docsPath, 'assets');
if (fs.existsSync(assetsSrc)) {
  fs.cpSync(assetsSrc, assetsDest, { recursive: true });
  console.log('✅ Copied assets/');
}

// 3. Copy essential build files only
const buildFiles = fs.readdirSync(distBuildPath);
const essentialFiles = buildFiles.filter(file => {
  // Include core bundles
  if (file === 'euclid.esm.js' || file === 'euclid.js' || file === 'euclid.css') {
    return true;
  }

  // Include lazy-loaded component chunks (p-*.js files) but not source maps
  if (file.startsWith('p-') && file.endsWith('.js') && !file.endsWith('.map')) {
    return true;
  }

  // Exclude everything else (source maps, dev configs, etc.)
  return false;
});

console.log(`📦 Copying ${essentialFiles.length} essential build files:`);
essentialFiles.forEach(file => {
  const src = path.join(distBuildPath, file);
  const dest = path.join(docsBuildPath, file);
  fs.copyFileSync(src, dest);
  console.log(`   ✓ ${file}`);
});

// 4. Fix paths for GitHub Pages (relative URLs)
console.log('🔧 Fixing paths for GitHub Pages...');
let html = fs.readFileSync(indexDest, 'utf8');

// Replace absolute paths with relative paths
html = html.replace(/href="\/build\//g, 'href="./build/');
html = html.replace(/src="\/build\//g, 'src="./build/');
html = html.replace(/data-resources-url="\/build\/"/g, 'data-resources-url="./build/"');

// Write the file back
fs.writeFileSync(indexDest, html);
console.log('✅ Fixed GitHub Pages paths in index.html');

// 5. Fix asset paths in JavaScript files
console.log('🔧 Fixing asset paths in JavaScript files...');
essentialFiles.forEach(file => {
  if (file.endsWith('.js')) {
    const filePath = path.join(docsBuildPath, file);
    let jsContent = fs.readFileSync(filePath, 'utf8');

    // Replace absolute asset paths with relative paths
    const originalContent = jsContent;
    jsContent = jsContent.replace(/["']\/assets\//g, '"./assets/');

    if (jsContent !== originalContent) {
      fs.writeFileSync(filePath, jsContent);
      console.log(`   ✓ Fixed asset paths in ${file}`);
    }
  }
});
console.log('✅ Fixed asset paths in JavaScript files');

// Summary
const totalSize = essentialFiles.reduce((size, file) => {
  const filePath = path.join(distBuildPath, file);
  const stats = fs.statSync(filePath);
  return size + stats.size;
}, 0);

const indexSize = fs.statSync(indexDest).size;
const totalDeploySize = totalSize + indexSize;

console.log('\n📊 Deployment Summary:');
console.log(`   Essential build files: ${essentialFiles.length}`);
console.log(`   Total bundle size: ${(totalDeploySize / 1024).toFixed(1)} KB`);
console.log(`   Excluded: source maps, dev configs, service workers`);
console.log('\n🎉 GitHub Pages content ready for deployment!');
console.log('   Next: git add docs && git commit && git push');
