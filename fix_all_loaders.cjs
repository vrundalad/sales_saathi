const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.html')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk('d:\\salessaathi');

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    const regex = /<div class="relative w-16 h-16 animate-pulse">[\s\S]*?<\/div>/g;
    const replacement = '<div class="relative w-16 h-16 animate-pulse">\n            <div class="absolute inset-0 bg-brandIndigo/40 blur-2xl rounded-full"></div>\n            <img src="/logo.png" alt="Sales Saathi Loading" class="relative z-10 w-full h-full drop-shadow-2xl object-contain" />\n        </div>';
    
    if (content.match(regex)) {
        content = content.replace(regex, replacement);
        fs.writeFileSync(file, content, 'utf8');
        console.log('Fixed loader in ' + file);
    }
});