const fs = require('fs');
const path = require('path');

const files = [
    'solutions.html',
    'solutions/sales-leaders.html',
    'solutions/revenue-operations.html',
    'solutions/account-executives.html',
    'resources.html',
    'pricing.html',
    'features.html',
    'dashboard.html',
    'contact.html',
    'ai-autopilot.html'
];

const replacement = `    <!-- SECTION 1: Dynamic Global Header Mount -->
    <div id="global-header-mount"></div>
    <script type="module" src="/js/auth-manager.js"></script>
    <script type="module" src="/js/header-manager.js"></script>`;

const basePath = 'd:/salessaathi';

for (const file of files) {
    const fullPath = path.join(basePath, file);
    if (!fs.existsSync(fullPath)) continue;

    let content = fs.readFileSync(fullPath, 'utf8');

    // Simple regex to match <header> ... </header>
    // We assume there's only one <header> block we want to replace
    const regex = /<header[\s\S]*?<\/header>/i;
    
    if (regex.test(content)) {
        content = content.replace(regex, replacement);
        fs.writeFileSync(fullPath, content);
        console.log(`Replaced header in ${file}`);
    } else {
        console.log(`No header found in ${file}`);
    }
}
