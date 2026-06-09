const fs = require('fs');
const path = require('path');

function replaceDemoLinks(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Match <a> tags containing "Demo" and having href to auth.html
    // The regex matches: <a ... href="...auth.html..." ...>...Demo...</a>
    const regex = /<a\s+[^>]*href=["'][^"']*auth\.html[^"']*["'][^>]*>(?:(?!<\/a>).)*Demo(?:(?!<\/a>).)*<\/a>/gis;

    content = content.replace(regex, (match) => {
        // Replace the href
        let newMatch = match.replace(/href=["'][^"']*auth\.html[^"']*["']/g, 'href="#" @click.prevent="$store.demoModal.open()"');
        return newMatch;
    });

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated demo links in ${filePath}`);
    }
}

const files = [
    'd:/salessaathi/index.html',
    'd:/salessaathi/components/header.html',
    'd:/salessaathi/solutions.html',
    'd:/salessaathi/solutions/account-executives.html',
    'd:/salessaathi/solutions/revenue-operations.html',
    'd:/salessaathi/solutions/sales-leaders.html',
    'd:/salessaathi/features.html'
];

files.forEach(f => {
    if(fs.existsSync(f)) {
        replaceDemoLinks(f);
    }
});

console.log('Finished updating all demo links.');
