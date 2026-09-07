const fs = require('fs');
const path = require('path');

console.log("=== BUILDING LOCAL PREVIEW HTML ===");

const indexPath = path.join(__dirname, 'index.html');
let indexContent = fs.readFileSync(indexPath, 'utf8');

// GASの <?!= HtmlService.createHtmlOutputFromFile('xxx').getContent(); ?> を実際のファイル内容に置換
const includeRegex = /<\?!=\s*HtmlService\.createHtmlOutputFromFile\(['"]([^'"]+)['"]\)\.getContent\(\);\s*\?>/g;

indexContent = indexContent.replace(includeRegex, (match, fileName) => {
  const targetFile = path.join(__dirname, fileName + '.html');
  if (fs.existsSync(targetFile)) {
    console.log(`- Inlined: ${fileName}.html`);
    return fs.readFileSync(targetFile, 'utf8');
  } else {
    console.warn(`! File not found: ${targetFile}`);
    return `<!-- Missing: ${fileName}.html -->`;
  }
});

const previewPath = path.join(__dirname, 'local_preview.html');
fs.writeFileSync(previewPath, indexContent, 'utf8');

console.log(`✓ Generated ${previewPath} successfully!`);
