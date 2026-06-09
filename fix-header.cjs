const fs = require('fs');

const headerPath = 'd:/salessaathi/components/header.html';
let content = fs.readFileSync(headerPath, 'utf8');

// 1. Header z-index
content = content.replace(
    '<header class="fixed top-0 w-full z-50 transition-all duration-300"',
    '<header class="fixed top-0 w-full z-[1000] transition-all duration-300"'
);

// 2. Nav z-index
content = content.replace(
    '<nav class="hidden lg:flex items-center gap-1 absolute left-1/2 -translate-x-1/2 h-full" @click.away="activeDropdown = null">',
    '<nav class="hidden lg:flex items-center gap-1 absolute left-1/2 -translate-x-1/2 h-full z-[1100]" @click.away="activeDropdown = null">'
);

// 3. Right Action Cluster z-index
content = content.replace(
    '<div class="hidden lg:flex items-center gap-3 relative z-50">',
    '<div class="hidden lg:flex items-center gap-3 relative z-[1200]">'
);

// 4. Features mega menu hover logic and wrapper
content = content.replace(
    '<div class="relative h-full flex items-center">',
    '<div class="relative h-full flex items-center" @mouseenter="activeDropdown = \'features\'" @mouseleave="activeDropdown = null">'
);
content = content.replace(
    '@mouseenter="activeDropdown = \'features\'"',
    ''
);
// Replace features dropdown wrapper
content = content.replace(
    /<div x-show="activeDropdown === 'features'"[^>]*?class="absolute top-full left-1\/2 -translate-x-1\/2 w-\[800px\] mt-1 p-6[^"]+">/,
    `<div x-show="activeDropdown === 'features'" x-transition.opacity.duration.200ms x-cloak
                             class="absolute top-full left-1/2 -translate-x-1/2 pt-1 z-[1100]">
                            <div class="w-[800px] p-6 bg-[#18181b]/95 border border-white/5 backdrop-blur-xl shadow-2xl rounded-2xl overflow-hidden relative before:absolute before:inset-0 before:bg-gradient-to-b before:from-brandIndigo/5 before:to-transparent before:pointer-events-none">`
);
// We need to close the inner div. The original grid was inside.
// We can find the closing of features dropdown:
//                             </div>
//                         </div>
//                     </div>
//                     <!-- Solutions w/ Mega-Dropdown -->
content = content.replace(
    /(\s*)<\/div>\s*<\/div>\s*<!-- Solutions w\/ Mega-Dropdown -->/,
    '$1    </div>\n$1</div>\n$1</div>\n$1<!-- Solutions w/ Mega-Dropdown -->'
);


// 5. Solutions mega menu hover logic and wrapper
content = content.replace(
    '<div class="relative h-full flex items-center">\n                        <button @click="activeDropdown = activeDropdown === \'solutions\' ? null : \'solutions\'"',
    '<div class="relative h-full flex items-center" @mouseenter="activeDropdown = \'solutions\'" @mouseleave="activeDropdown = null">\n                        <button @click="activeDropdown = activeDropdown === \'solutions\' ? null : \'solutions\'"'
);
content = content.replace(
    '@mouseenter="activeDropdown = \'solutions\'"',
    ''
);

// Replace solutions dropdown wrapper
content = content.replace(
    /<div x-show="activeDropdown === 'solutions'"[^>]*?class="absolute top-full left-1\/2 -translate-x-1\/2 w-\[500px\] mt-1 p-6[^"]+">/,
    `<div x-show="activeDropdown === 'solutions'" x-transition.opacity.duration.200ms x-cloak
                             class="absolute top-full left-1/2 -translate-x-1/2 pt-1 z-[1100]">
                            <div class="w-[500px] p-6 bg-white dark:bg-[#121215] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden relative">`
);

// Fix inner divs for solutions dropdown closing tag
//                         </div>
//                     </div>
//                     <a href="/pricing.html"
content = content.replace(
    /(\s*)<\/div>\s*<\/div>\s*<a href="\/pricing\.html"/,
    '$1    </div>\n$1</div>\n$1</div>\n$1<a href="/pricing.html"'
);


// 6. Fix Solutions `div onclick` to `a href`
content = content.replace(/<div onclick="window\.location\.href='([^']+)'" class="cursor-pointer (.*?)"([^>]*)>/g, '<a href="$1" class="$2" @click="activeDropdown = null"$3>');
content = content.replace(/(<\/div>\s*<\/div>\s*<\/div>\s*)<\/div>\s*<div onclick/g, '$1</a>\n$1<div onclick'); // Not ideal, let's use regex for closing tag replacement
// Actually, it's easier to just replace `</div>` with `</a>` manually using regex inside the grid
// Wait, the inner structure of the solution cards is:
// <a href="...">
//   <div class="w-10...">...</div>
//   <div><h4>...</h4><p>...</p></div>
// </a>
// So the outer `<div onclick...>` became `<a href...>`
// And the closing `</div>` needs to become `</a>`.
// The closing `</div>` is right before the next `<a href...>` or the end of the grid.
content = content.replace(/<\/p>\s*<\/div>\s*<\/div>/g, '</p>\n                                    </div>\n                                </a>');


fs.writeFileSync(headerPath, content, 'utf8');
console.log('Fixed header.html');
