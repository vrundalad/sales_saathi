const fs = require('fs');
const path = require('path');

const correctLoader = `    <!-- Global Preloader Engine -->
    <div x-data="{ pageLoaded: false }"
         x-init="window.addEventListener('load', () => { setTimeout(() => pageLoaded = true, 300) })"
         x-show="!pageLoaded"
         x-transition:leave="transition ease-in duration-400"
         x-transition:leave-start="opacity-100"
         x-transition:leave-end="opacity-0"
         class="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-50 dark:bg-darkBg"
         x-cloak>
        <div class="relative w-16 h-16 animate-pulse">
            <div class="absolute inset-0 bg-brandIndigo/40 blur-2xl rounded-full"></div>
            <img src="/logo.png" alt="Sales Saathi Loading" class="relative z-10 w-full h-full drop-shadow-2xl object-contain" />
        </div>
    </div>`;

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.html')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            
            // Regex to find the Global Preloader Engine and the bad trailing images/divs
            // This looks for <!-- Global Preloader Engine --> and goes up to the next <!-- SECTION 1... or similar comment
            // or we can just replace the specific bad block.
            
            let newContent = content.replace(
                /<!-- Global Preloader Engine -->[\s\S]*?(?=<!-- SECTION 1|<!-- SECTION 2|<!--  SECTION|<!-- Header|<!-- Navbar|<header|<nav|<div id="global-header-mount">)/i,
                correctLoader + '\n\n    '
            );

            // Special case for dashboard.html which might not have SECTION 1 comment immediately
            newContent = newContent.replace(
                /<!-- Global Preloader Engine -->[\s\S]*?(?=<div class="flex h-screen overflow-hidden bg-slate-50 dark:bg-darkBg">)/i,
                correctLoader + '\n\n    '
            );

            if (content !== newContent) {
                fs.writeFileSync(fullPath, newContent);
                console.log(`Fixed loader in ${fullPath}`);
            }
        }
    }
}

processDir('d:/salessaathi');
