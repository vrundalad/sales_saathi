const fs = require('fs');
const path = require('path');

function replaceDemoLinks(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // We look for <a href="auth.html"...>...Demo...</a> and <a href="auth.html#..."...>...Demo...</a>
    // and also <a href="/auth.html"...>...Demo...</a>
    
    // Regular expression to match <a> tags containing "Demo" inside their text/children
    const regex = /<a\s+[^>]*href=["']\/?auth\.html[^"']*["'][^>]*>(?:(?!<\/a>).)*Demo(?:(?!<\/a>).)*<\/a>/gis;

    content = content.replace(regex, (match) => {
        // Change href to #
        let newMatch = match.replace(/href=["']\/?auth\.html[^"']*["']/g, 'href="#" @click.prevent="$store.demoModal.open()"');
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

console.log('Finished updating demo links.');
