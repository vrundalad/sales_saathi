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

    // Merge multiple class attributes on body or any tag
    // Since it's usually on the body, let's look for: class="class1" \s* class="class2"
    content = content.replace(/class="([^"]+)"\s+class="([^"]+)"/g, 'class="$1 $2"');

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Merged classes in:', filePath);
    }
});
