import { injectManifest } from 'workbox-build';

async function buildSW() {
  try {
    const { count, size } = await injectManifest({
      swSrc: 'dist/www/sw-base.js',
      swDest: 'dist/www/sw.js',
      globDirectory: 'dist/www/',
      globPatterns: ['**/*.{js,css,html,png,jpg,json,ico,svg,woff,woff2,ttf}'],
      maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB
    });

    console.log(`✅ Service worker generated successfully!`);
    console.log(`📦 Precached ${count} files, totaling ${(size / 1024 / 1024).toFixed(2)} MB.`);
  } catch (error) {
    console.error('❌ Service worker generation failed:', error);
    process.exit(1);
  }
}

buildSW();
