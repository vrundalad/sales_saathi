const fs = require('fs');

const headerPath = 'd:/salessaathi/components/header.html';
let content = fs.readFileSync(headerPath, 'utf8');

// Replace `$store.theme.isDark` with `$store.theme?.isDark`
content = content.replace(/\$store\.theme\.isDark/g, '$store.theme?.isDark');

// Replace `$store.theme.toggle()` with `$store.theme?.toggle()`
content = content.replace(/\$store\.theme\.toggle\(\)/g, '$store.theme?.toggle()');

fs.writeFileSync(headerPath, content, 'utf8');
console.log('Fixed header.html optional chaining');
