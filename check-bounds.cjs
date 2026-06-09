const fs = require('fs');
const html = fs.readFileSync('dashboard.html', 'utf8');
const lines = html.split('\n');

const findViewBounds = (viewName) => {
    let depth = 0;
    let started = false;
    let startLine = -1;
    for(let i=0; i<lines.length; i++) {
        const l = lines[i];
        if(!started && (l.includes(`activeView === '${viewName}'`) || l.includes(`activeView === "${viewName}"`))) {
            started = true;
            startLine = i + 1;
        }
        if(!started) continue;
        
        const opens = (l.match(/<div\b/gi) || []).length;
        const closes = (l.match(/<\/div>/gi) || []).length;
        depth += (opens - closes);
        if(depth <= 0) {
            return { start: startLine, end: i + 1 };
        }
    }
    return { start: startLine, end: -1 };
};

console.log('Dashboard:', findViewBounds('dashboard'));
console.log('Meetings:', findViewBounds('meetings'));
console.log('Briefs:', findViewBounds('briefs'));
console.log('Outreach:', findViewBounds('outreach'));
console.log('Deal Risk:', findViewBounds('deal-risk-tracking'));

// Also check overall depth
let totalDepth = 0;
for(let i=0; i<lines.length; i++) {
    const l = lines[i];
    const opens = (l.match(/<div\b/gi) || []).length;
    const closes = (l.match(/<\/div>/gi) || []).length;
    totalDepth += (opens - closes);
}
console.log('Total depth:', totalDepth);
