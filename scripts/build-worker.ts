/**
 * Build script for the data list worker
 * Compiles the TypeScript worker to JavaScript for production
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

const workerSrcPath = path.join(__dirname, '../src/workers/data-list.worker.ts');
const workerDistPath = path.join(__dirname, '../dist/www/build/workers/data-list.worker.js');

// Ensure dist directory exists
const distDir = path.dirname(workerDistPath);
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

try {
  // Compile TypeScript to JavaScript
  console.log('🔨 Building data list worker...');

  // Use TypeScript compiler to build the worker
  execSync(`npx tsc ${workerSrcPath} --target ES2017 --module ES2015 --outDir ${distDir} --skipLibCheck`, {
    stdio: 'inherit'
  });

  // Rename the output file to match expected path
  const compiledPath = path.join(distDir, 'data-list.worker.js');

  if (fs.existsSync(compiledPath)) {
    console.log('✅ Worker compiled successfully');
    console.log(`   Output: ${workerDistPath}`);
  } else {
    throw new Error('Worker compilation failed - output file not found');
  }

} catch (error) {
  console.error('❌ Worker build failed:', error);
  process.exit(1);
}
