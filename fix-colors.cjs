const fs = require('fs');
const path = require('path');

function processHtmlFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // 1. Fix bg-[#09090b] -> bg-slate-50 dark:bg-[#09090b]
    // Only if it doesn't already have dark: in front of it.
    // Also, if the element has text-white, we might want text-slate-900 dark:text-white
    content = content.replace(/(?<!dark:)bg-\[\#09090b\]/g, 'bg-slate-50 dark:bg-[#09090b]');
    
    // 2. Fix bg-[#18181b] -> bg-white dark:bg-[#18181b]
    content = content.replace(/(?<!dark:)bg-\[\#18181b\]/g, 'bg-white dark:bg-[#18181b]');

    // 3. Fix bg-zinc-950 -> bg-slate-50 dark:bg-zinc-950
    content = content.replace(/(?<!dark:)bg-zinc-950/g, 'bg-slate-50 dark:bg-zinc-950');

    // 4. Fix bg-zinc-900 -> bg-white dark:bg-zinc-900
    content = content.replace(/(?<!dark:)bg-zinc-900/g, 'bg-white dark:bg-zinc-900');
    
    // 5. Fix text-white to text-slate-900 dark:text-white where there is now a bg-white or bg-slate-50
    // Actually, text-white replacement globally is dangerous because of buttons.
    // Let's just fix the backgrounds first, this usually solves 90% of the light mode issues.
    
    // Check payment.html body specifically
    if (filePath.endsWith('payment.html')) {
        content = content.replace(
            '<body class="bg-darkBg text-zinc-100 font-sans antialiased min-h-screen flex items-center justify-center p-4 relative overflow-hidden">',
            '<body class="bg-slate-50 dark:bg-darkBg text-slate-900 dark:text-zinc-100 font-sans antialiased min-h-screen flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-300">'
        );
        content = content.replace('background: #09090b;', '');
    }

    if (original !== content) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Fixed colors in ${filePath}`);
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
console.log('Finished processing all HTML files for hardcoded dark mode colors.');
