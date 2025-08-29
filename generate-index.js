const fs = require('fs');
const path = require('path');

let idCounter = 0;
function generateFileList(dir, baseUrl = '') {
  let html = '<ul>';

  const items = fs.readdirSync(dir).sort((a, b) => {
    const aPath = path.join(dir, a);
    const bPath = path.join(dir, b);
    const aIsDir = fs.statSync(aPath).isDirectory();
    const bIsDir = fs.statSync(bPath).isDirectory();
    return aIsDir === bIsDir ? a.localeCompare(b) : aIsDir ? -1 : 1;
  });

  for (const item of items) {
    if (item === 'index.html') continue;

    const fullPath = path.join(dir, item);
    const relPath = path.posix.join(baseUrl, item);
    const stats = fs.statSync(fullPath);

    const modified = stats.mtime.toISOString().split('T')[0];

    if (stats.isDirectory()) {
      const id = `folder-${idCounter++}`;
      html += `
        <li class="folder" data-name="${item.toLowerCase()}">
          <input type="checkbox" id="${id}" class="toggle" />
          <label for="${id}" class="folder-label">📁 ${item}</label>
          <div class="nested">
            ${generateFileList(fullPath, relPath)}
          </div>
        </li>
      `;
    } else {
      const icon = getFileIcon(item);
      html += `
        <li class="file" data-name="${item.toLowerCase()}">
          ${icon} <a href="${relPath}" target="_blank">${item}</a>
          <span class="modified">(${modified})</span>
        </li>
      `;
    }
  }

  html += '</ul>';
  return html;
}

function getFileIcon(filename) {
  const ext = path.extname(filename).toLowerCase();
  if (ext === '.js') return '🟨';
  if (ext === '.html') return '🌐';
  if (ext === '.css') return '🎨';
  if (['.jpg', '.jpeg', '.png', '.gif', '.svg'].includes(ext)) return '🖼️';
  if (['.md'].includes(ext)) return '📝';
  if (['.pdf'].includes(ext)) return '📄';
  return '📄';
}

const rootDir = path.join(__dirname, 'docs'); // Change if needed
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
      font-size: 2em;
      margin-bottom: 1em;
    }
    #controls {
      margin-bottom: 1em;
    }
    #search {
      padding: 0.4em;
      font-size: 1em;
      width: 60%;
      max-width: 400px;
    }
    button {
      margin-left: 0.5em;
      padding: 0.4em 0.8em;
      font-size: 0.9em;
      cursor: pointer;
    }
    ul {
      list-style: none;
      padding-left: 1em;
      margin: 0;
    }
    .file a {
      text-decoration: none;
      color: #0366d6;
    }
    .file a:hover {
      text-decoration: underline;
    }
    .file .modified {
      color: #666;
      font-size: 0.9em;
      margin-left: 0.5em;
    }
    .folder-label {
      cursor: pointer;
      user-select: none;
      display: inline-block;
      margin-left: 0.2em;
    }
    .toggle {
      display: none;
    }
    .toggle + .folder-label::before {
      content: '▶';
      display: inline-block;
      width: 1em;
      margin-right: 0.2em;
      transition: transform 0.2s ease;
    }
    .toggle:checked + .folder-label::before {
      content: '▼';
    }
    .toggle ~ .nested {
      display: none;
      margin-left: 1em;
      border-left: 1px dashed #ccc;
      padding-left: 1em;
    }
    .toggle:checked ~ .nested {
      display: block;
    }
    @media (prefers-color-scheme: dark) {
      body {
        background-color: #1e1e1e;
        color: #ddd;
      }
      .file a {
        color: #58a6ff;
      }
      .file .modified {
        color: #aaa;
      }
      .toggle ~ .nested {
        border-left: 1px dashed #444;
      }
    }
  </style>
</head>
<body>
  <h1>📦 Elegant File Index</h1>
  <div id="controls">
    <input type="text" id="search" placeholder="🔍 Search files or folders..." />
    <button onclick="toggleAll(true)">Expand All</button>
    <button onclick="toggleAll(false)">Collapse All</button>
  </div>
  ${generateFileList(rootDir)}

<script>
  const searchInput = document.getElementById('search');

  searchInput.addEventListener('input', function () {
    const query = this.value.toLowerCase();

    const allFolders = document.querySelectorAll('.folder');
    const allFiles = document.querySelectorAll('.file');

    // Reset everything first
    allFolders.forEach(folder => {
      folder.style.display = '';
      const checkbox = folder.querySelector('.toggle');
      if (checkbox) checkbox.checked = false;
    });

    allFiles.forEach(file => {
      file.style.display = '';
    });

    if (!query) return; // If search is empty, show everything

    // Hide everything initially
    allFolders.forEach(folder => folder.style.display = 'none');
    allFiles.forEach(file => file.style.display = 'none');

    // Show only matches and expand their parents
    [...allFolders, ...allFiles].forEach(item => {
      const name = item.dataset.name || '';
      if (name.includes(query)) {
        item.style.display = '';
        expandParents(item);
      }
    });
  });

  function expandParents(el) {
    let parent = el.parentElement;
    while (parent) {
      if (parent.classList.contains('nested')) {
        const folder = parent.parentElement;
        if (folder && folder.classList.contains('folder')) {
          folder.style.display = ''; // Make sure folder is visible
          const toggle = folder.querySelector('.toggle');
          if (toggle) toggle.checked = true; // Expand it
        }
      }
      parent = parent.parentElement;
    }
  }

  function toggleAll(expand) {
    document.querySelectorAll('.toggle').forEach(input => {
      input.checked = expand;
    });
    document.querySelectorAll('.folder').forEach(folder => {
      folder.style.display = '';
    });
  }
</script>

</body>
</html>
`;

fs.writeFileSync(path.join(rootDir, 'index.html'), output);
console.log('✅ Fully enhanced index.html generated.');
