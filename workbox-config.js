module.exports = {
  // The directory Stencil builds your app to.
  globDirectory: 'dist/www/',

  // The files to include in the precache manifest.
  globPatterns: ['**/*.{js,css,html,png,jpg,json,ico,svg,woff,woff2,ttf}'],

  // The source of our custom logic (the file we generate with ESBuild).
  swSrc: 'dist/www/sw-base.js',

  // The name of the final, production-ready Service Worker file.
  swDest: 'dist/www/sw.js',

  // Maximum file size to precache
  maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB

  // Skip waiting to activate new service worker immediately
  skipWaiting: true,
  clientsClaim: true,
};