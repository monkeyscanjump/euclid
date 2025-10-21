/**
 * Build script for the data list worker
 * Compiles the TypeScript worker to JavaScript for production
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const workerSrcPath = path.join(__dirname, '../src/workers/data-list.worker.ts');
const workerDistDir = path.join(__dirname, '../dist/www/build/workers');
const workerDistPath = path.join(workerDistDir, 'data-list.worker.js');

try {
  // Ensure dist directory exists
  if (!fs.existsSync(workerDistDir)) {
    fs.mkdirSync(workerDistDir, { recursive: true });
    console.log('📁 Created directory:', workerDistDir);
  }

  // Check if source file exists
  if (!fs.existsSync(workerSrcPath)) {
    throw new Error(`Source file not found: ${workerSrcPath}`);
  }

  console.log('🔨 Building data list worker...');
  console.log('   Source:', workerSrcPath);
  console.log('   Target:', workerDistPath);

  // Use esbuild instead of tsc for better compatibility
  try {
    execSync(`npx esbuild ${workerSrcPath} --bundle --outfile=${workerDistPath} --format=esm --target=es2017 --minify`, {
      stdio: 'inherit'
    });
  } catch {
    console.log('⚠️ esbuild failed, falling back to tsc...');
    // Fallback to TypeScript compiler
    execSync(`npx tsc ${workerSrcPath} --target ES2017 --module ES2015 --outDir ${workerDistDir} --skipLibCheck --lib ES2017,DOM`, {
      stdio: 'inherit'
    });
  }

  // Check if the output file exists
  if (fs.existsSync(workerDistPath)) {
    console.log('✅ Worker compiled successfully');
    console.log(`   Output: ${workerDistPath}`);
    console.log(`   Size: ${(fs.statSync(workerDistPath).size / 1024).toFixed(2)} KB`);
  } else {
    // List what files were actually created
    console.log('📂 Files in output directory:');
    if (fs.existsSync(workerDistDir)) {
      fs.readdirSync(workerDistDir).forEach(file => {
        console.log(`   - ${file}`);
      });
    }
    throw new Error('Worker compilation failed - output file not found');
  }

} catch (error) {
  console.error('❌ Worker build failed:', error.message);
  process.exit(1);
}
