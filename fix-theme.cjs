const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        if (isDirectory && !dirPath.includes('node_modules') && !dirPath.includes('.git') && !dirPath.includes('components')) {
            walkDir(dirPath, callback);
        } else if (dirPath.endsWith('.html') && !dirPath.includes('components')) {
            callback(dirPath);
        }
    });
}

walkDir('d:/salessaathi', (filePath) => {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Inject theme-manager.js
    if (!content.includes('/js/theme-manager.js')) {
        content = content.replace(/<head>/i, '<head>\n    <!-- Global Theme Manager -->\n    <script src="/js/theme-manager.js"></script>');
    }

    // Replace @click="darkMode = !darkMode" with @click="$store.theme.toggle()"
    content = content.replace(/@click="darkMode\s*=\s*!darkMode"/g, '@click="$store.theme.toggle()"');
    
    // Replace x-show="!darkMode" and x-show="darkMode"
    content = content.replace(/x-show="!darkMode"/g, 'x-show="!$store.theme?.isDark"');
    content = content.replace(/x-show="darkMode"/g, 'x-show="$store.theme?.isDark"');

    // Remove darkMode from x-data (handles persist and true/false)
    content = content.replace(/darkMode:\s*\$??persist\([^)]+\)\s*,?\s*/g, '');
    content = content.replace(/darkMode:\s*(true|false)\s*,?\s*/g, '');
    // Handle dangling commas if any (e.g. { foo: 'bar', } -> { foo: 'bar' })
    content = content.replace(/,\s*}/g, ' }');

    // Remove simple :class="{ 'dark': darkMode }"
    content = content.replace(/:class="\{\s*'dark':\s*darkMode\s*\}"/g, '');

    // Convert complex :class into static class combinations for solutions pages
    // e.g. :class="{ 'dark bg-[#0A0A0A] text-white': darkMode, 'bg-gray-50 text-gray-900': !darkMode }"
    content = content.replace(/:class="\{\s*'dark\s+([^']+)':\s*darkMode,\s*'([^']+)':\s*!darkMode\s*\}"/g, (match, darkClasses, lightClasses) => {
        const darkArray = darkClasses.split(' ').map(c => 'dark:' + c).join(' ');
        return `class="${lightClasses} ${darkArray}"`;
    });

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Processed:', filePath);
    }
});
console.log('Done processing HTML files.');
