// esbuild.sw.js
const esbuild = require('esbuild');
const { injectManifest } = require('workbox-build');

async function buildSW() {
  // 1. Компилируем наш sw.js и стягиваем код всех стратегий Workbox внутрь него локально
  await esbuild.build({
    entryPoints: ['src/custom-sw.js'],
    outfile: 'dist/my-pwa-app/browser/custom-sw.js', // Кладем сразу в готовый билд Angular
    bundle: true,
    minify: true,
    format: 'iife',
    platform: 'browser',
  });

  // 2. Впрыскиваем массив прекеша Angular-файлов в уже собранный воркер
  await injectManifest({
    globDirectory: 'dist/my-pwa-app/browser/',
    globPatterns: ['**/*.{js,css,html,png,svg,ico,woff2}'],
    swSrc: 'dist/my-pwa-app/browser/custom-sw.js',
    swDest: 'dist/my-pwa-app/browser/custom-sw.js',
  });

  console.log('✓ Автономный Custom Service Worker с магий Workbox успешно собран!');
}

buildSW().catch((err) => {
  console.error(err);
  process.exit(1);
});
