const fs = require('fs');
const path = require('path');

const srcDir = path.resolve(process.env.USERPROFILE, '.gemini', 'antigravity-ide', 'brain', '80bb2e4c-db57-409e-a4bf-db538a50befb');
const outDir = path.resolve(__dirname);

// 3つの画像ファイル
const files = [
  { key: 'CHAR_IMG_REN', srcName: 'ren_freedom_portrait_1788490222613.jpg', outName: 'ren_portrait.jpg' },
  { key: 'CHAR_IMG_ELENA', srcName: 'elena_equality_portrait_1788490241158.jpg', outName: 'elena_portrait.jpg' },
  { key: 'CHAR_IMG_DANIEL', srcName: 'daniel_social_portrait_1788490258039.jpg', outName: 'daniel_portrait.jpg' }
];

const b64Map = {};
let jsContent = '// ==========================================================================\n// CHARACTER PORTRAIT ASSETS (Base64 Data URIs for Clasp / Standalone Web Apps)\n// ==========================================================================\n\n';

for (const f of files) {
  const srcPath = path.join(srcDir, f.srcName);
  const destPath = path.join(outDir, f.outName);

  if (!fs.existsSync(srcPath)) {
    console.error(`Source file not found: ${srcPath}`);
    continue;
  }

  const buf = fs.readFileSync(srcPath);
  fs.writeFileSync(destPath, buf);

  const b64 = 'data:image/jpeg;base64,' + buf.toString('base64');
  b64Map[f.key] = b64;

  jsContent += `const ${f.key} = "${b64}";\n\n`;
  console.log(`Exported ${f.key}: ${(buf.length / 1024).toFixed(1)} KB (Saved as ${f.outName})`);
}

jsContent += 'const CHARACTER_IMAGES = {\n  A: CHAR_IMG_REN,\n  B: CHAR_IMG_ELENA,\n  C: CHAR_IMG_DANIEL\n};\n';

fs.writeFileSync(path.join(outDir, 'character_images_base64.js'), jsContent, 'utf8');
fs.writeFileSync(path.join(outDir, 'character_images_base64.json'), JSON.stringify(b64Map, null, 2), 'utf8');

console.log('All character portrait assets successfully converted to Base64 in workspace!');
