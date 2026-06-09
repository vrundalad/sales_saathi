const fs = require('fs');
const path = require('path');

const replacements = [
    { pattern: /(?<!dark:|selection:)text-white/g, replacement: 'text-slate-900 dark:text-white' },
    { pattern: /(?<!dark:|selection:)text-gray-400/g, replacement: 'text-slate-500 dark:text-gray-400' },
    { pattern: /(?<!dark:|selection:)text-gray-300/g, replacement: 'text-slate-600 dark:text-gray-300' },
    { pattern: /(?<!dark:|selection:)text-gray-500/g, replacement: 'text-slate-500 dark:text-gray-500' },
    
    { pattern: /(?<!dark:)bg-white\/5(?![0-9])/g, replacement: 'bg-slate-100 dark:bg-white/5' },
    { pattern: /(?<!dark:)bg-white\/10(?![0-9])/g, replacement: 'bg-slate-200 dark:bg-white/10' },
    { pattern: /(?<!dark:)bg-white\/20(?![0-9])/g, replacement: 'bg-slate-300 dark:bg-white/20' },
    
    { pattern: /(?<!dark:)border-white\/5(?![0-9])/g, replacement: 'border-slate-200 dark:border-white/5' },
    { pattern: /(?<!dark:)border-white\/10(?![0-9])/g, replacement: 'border-slate-200 dark:border-white/10' },
    { pattern: /(?<!dark:)border-white\/20(?![0-9])/g, replacement: 'border-slate-300 dark:border-white/20' },
    
    { pattern: /(?<!dark:)bg-\[\#121212\]/g, replacement: 'bg-white dark:bg-[#121212]' },
    { pattern: /(?<!dark:)bg-\[\#0A0A0A\]/g, replacement: 'bg-slate-50 dark:bg-[#0A0A0A]' },
    { pattern: /(?<!dark:)bg-\[\#0B0914\]/g, replacement: 'bg-slate-50 dark:bg-[#0B0914]' },
    { pattern: /(?<!dark:)bg-\[\#0d0d0d\]\/90/g, replacement: 'bg-white/90 dark:bg-[#0d0d0d]/90' },
    
    { pattern: /(?<!dark:)bg-black\/30/g, replacement: 'bg-slate-100 dark:bg-black/30' },
    { pattern: /(?<!dark:)bg-black\/40/g, replacement: 'bg-slate-100 dark:bg-black/40' },
    { pattern: /(?<!dark:)bg-black\/50/g, replacement: 'bg-slate-100 dark:bg-black/50' },
];

function processHtmlFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    for (const { pattern, replacement } of replacements) {
        content = content.replace(pattern, replacement);
    }
    
    // Clean up any double additions that might have accidentally happened
    content = content.replace(/text-slate-900 dark:text-slate-900 dark:text-white/g, 'text-slate-900 dark:text-white');

    if (original !== content) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Applied advanced color mapping to ${filePath}`);
    }
}

function walkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (!fullPath.includes('node_modules') && !fullPath.includes('.git')) {
                walkDir(fullPath);
            }
        } else if (fullPath.endsWith('.html')) {
            processHtmlFile(fullPath);
        }
    }
}

walkDir('d:/salessaathi');
console.log('Finished processing all HTML files.');
