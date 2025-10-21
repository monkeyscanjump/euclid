import { Config } from '@stencil/core';
import { reactOutputTarget } from '@stencil/react-output-target';
import { angularOutputTarget } from '@stencil/angular-output-target';
import { vueOutputTarget } from '@stencil/vue-output-target';
import { execSync } from 'child_process';

export const config: Config = {
  namespace: 'euclid',
  srcDir: 'src',
  globalStyle: 'src/global/app.css',
  outputTargets: [
    {
      type: 'dist-custom-elements',
      customElementsExportBehavior: 'auto-define-custom-elements',
      externalRuntime: false,
      generateTypeDeclarations: true,
    },
    reactOutputTarget({
      outDir: 'dist/react',
      stencilPackageName: '@monkeyscanjump/euclid',
      customElementsDir: 'dist/components',
      excludeComponents: [],
    }),
    angularOutputTarget({
      componentCorePackage: '@monkeyscanjump/euclid',
      directivesProxyFile: './dist/angular/index.ts',
    }),
    vueOutputTarget({
      componentCorePackage: '@monkeyscanjump/euclid',
      proxiesFile: './dist/vue/index.ts',
    }),
    {
      type: 'dist',
      esmLoaderPath: '../loader',
    },
    {
      type: 'www',
      dir: 'dist/www',
      serviceWorker: null,
      buildDir: 'build',
      copy: [
        {
          src: 'assets',
          dest: 'assets'
        },
        {
          src: 'workers',
          dest: 'workers'
        }
      ]
    },
  ],
  testing: {
    browserHeadless: 'shell',
  },
  devServer: {
    reloadStrategy: 'pageReload',
    port: 3333,
  },
  plugins: [
    {
      name: 'worker-builder',
      buildEnd() {
        try {
          // Build the worker after Stencil finishes
          console.log('🔨 Building web worker...');
          execSync('node scripts/build-worker.js', { stdio: 'inherit' });
        } catch (error) {
          console.error('❌ Worker build failed:', error);
        }
      }
    }
  ]
};
