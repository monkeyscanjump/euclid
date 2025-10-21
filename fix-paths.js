import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the index.html file
const indexPath = path.join(__dirname, 'docs', 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');

// Replace absolute paths with relative paths
html = html.replace(/href="\/build\//g, 'href="./build/');
html = html.replace(/src="\/build\//g, 'src="./build/');
html = html.replace(/data-resources-url="\/build\/"/g, 'data-resources-url="./build/"');

// Write the file back
fs.writeFileSync(indexPath, html);

console.log('✅ Fixed GitHub Pages paths in index.html');
