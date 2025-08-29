// generate-index.js
const fs = require('fs');
const path = require('path');

function generateFileList(dir, baseUrl = '', depth = 0) {
    let html = '';
    const items = fs.readdirSync(dir);

    items.sort().forEach(item => {
        const fullPath = path.join(dir, item);
        const relPath = path.posix.join(baseUrl, item);
        const indent = '&nbsp;'.repeat(depth * 4);
        const stats = fs.statSync(fullPath);

        if (stats.isDirectory()) {
            html += `${indent}📁 <strong>${item}/</strong><br>\n`;
            html += generateFileList(fullPath, relPath, depth + 1);
        } else if (item !== 'index.html') {
            html += `${indent}📄 <a href="${relPath}">${item}</a><br>\n`;
        }
    });

    return html;
}

const rootDir = path.join(__dirname, 'docs'); // Change to 'docs' if needed
const output = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Index of Files</title>
</head>
<body>
  <h1>📦 Index of Files</h1>
  ${generateFileList(rootDir)}
</body>
</html>
`;

fs.writeFileSync(path.join(rootDir, 'index.html'), output);
console.log('✅ index.html generated.');
