// generate-index.js
const fs = require('fs');
const path = require('path');

function generateFileList(dir, baseUrl = '', depth = 0) {
  let html = '<ul>';

  const items = fs.readdirSync(dir).sort();

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const relPath = path.posix.join(baseUrl, item);
    const stats = fs.statSync(fullPath);

    if (stats.isDirectory()) {
      html += `
        <li class="folder">
          <button class="toggle" aria-expanded="false"> 📁 ${item}</button>
          <div class="nested" style="display:none; margin-left: 1em;">
            ${generateFileList(fullPath, relPath, depth + 1)}
          </div>
        </li>
      `;
    } else if (item !== 'index.html') {
      html += `<li class="file">📄 <a href="${relPath}" target="_blank">${item}</a></li>`;
    }
  }

  html += '</ul>';
  return html;
}

const rootDir = path.join(__dirname, 'docs'); // change to 'docs' if needed
const output = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>📁 File Index</title>
  <style>
    body {
      font-family: system-ui, sans-serif;
      background: #f9f9f9;
      color: #222;
      padding: 2em;
      line-height: 1.6;
    }
    h1 {
      font-size: 1.8em;
      margin-bottom: 1em;
    }
    a {
      color: #0366d6;
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }
    ul {
      list-style: none;
      padding-left: 1em;
    }
    .toggle {
      background: none;
      border: none;
      cursor: pointer;
      font: inherit;
      color: #444;
      outline-offset: 2px;
      user-select: none;
    }
    .toggle:focus {
      outline: 2px solid #0366d6;
    }
    .toggle[aria-expanded="true"]::before {
      content: "▼ ";
      color: #0366d6;
    }
    .toggle[aria-expanded="false"]::before {
      content: "▶ ";
      color: #888;
    }
    @media (prefers-color-scheme: dark) {
      body {
        background: #1e1e1e;
        color: #ddd;
      }
      a {
        color: #58a6ff;
      }
      .toggle {
        color: #aaa;
      }
      .toggle[aria-expanded="true"]::before {
        color: #58a6ff;
      }
      .toggle[aria-expanded="false"]::before {
        color: #666;
      }
    }
  </style>
</head>
<body>
  <h1>📦 Index of Files</h1>
  ${generateFileList(rootDir)}

  <script>
    document.querySelectorAll('.toggle').forEach(button => {
      button.addEventListener('click', () => {
        const expanded = button.getAttribute('aria-expanded') === 'true';
        button.setAttribute('aria-expanded', expanded ? 'false' : 'true');
        button.nextElementSibling.style.display = expanded ? 'none' : 'block';
      });
    });
  </script>
</body>
</html>
`;

fs.writeFileSync(path.join(rootDir, 'index.html'), output);
console.log('✅ Collapsible index.html generated.');
