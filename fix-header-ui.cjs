const fs = require('fs');

const headerPath = 'd:/salessaathi/components/header.html';
let content = fs.readFileSync(headerPath, 'utf8');

// Fix "Features" button
content = content.replace(
    `class="px-4 py-2 flex items-center gap-1.5 text-sm font-semibold rounded-md outline-none transition-colors duration-200"\n                                :class="activeDropdown === 'features' ? 'text-slate-900 dark:text-white bg-slate-100/50 dark:bg-white/5' : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-slate-900 dark:text-white hover:bg-slate-100/50 dark:hover:bg-slate-100 dark:bg-white/5'">`,
    `class="px-3 py-2 flex items-center gap-1.5 text-sm font-semibold outline-none transition-colors duration-200"\n                                :class="activeDropdown === 'features' ? 'text-brandIndigo dark:text-brandIndigo' : 'text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white'">`
);

// Fix "Solutions" button
content = content.replace(
    `class="px-4 py-2 flex items-center gap-1.5 text-sm font-semibold rounded-md outline-none transition-colors duration-200"\n                                :class="activeDropdown === 'solutions' ? 'text-slate-900 dark:text-white bg-slate-100/50 dark:bg-white/5' : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-slate-900 dark:text-white hover:bg-slate-100/50 dark:hover:bg-slate-100 dark:bg-white/5'">`,
    `class="px-3 py-2 flex items-center gap-1.5 text-sm font-semibold outline-none transition-colors duration-200"\n                                :class="activeDropdown === 'solutions' ? 'text-brandIndigo dark:text-brandIndigo' : 'text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white'">`
);

// Fix normal links
const oldLinkClassRegex = /class="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-slate-900 dark:text-white hover:bg-slate-100\/50 dark:hover:bg-slate-100 dark:bg-white\/5 rounded-md transition-colors duration-200"/g;
const newLinkClass = `class="px-3 py-2 text-sm font-semibold text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white transition-colors duration-200"`;

content = content.replace(oldLinkClassRegex, newLinkClass);

fs.writeFileSync(headerPath, content, 'utf8');
console.log('Fixed header navigation link UI.');
