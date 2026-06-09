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
const regex = /<svg viewBox="0 0 128 128"[\s\S]*?<\/svg>/g;
const replacement = '<img src="/logo.png" alt="Sales Saathi" class="relative z-10 w-12 h-auto object-contain drop-shadow-2xl">';

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    if (content.match(regex)) {
        content = content.replace(regex, replacement);
        fs.writeFileSync(file, content, 'utf8');
        console.log('Updated ' + file);
    }
});