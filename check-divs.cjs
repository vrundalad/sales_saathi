const fs = require('fs');
const html = fs.readFileSync('dashboard.html', 'utf8');
const lines = html.split('\n');
let depth = 0;
let dashboardViewStarted = false;
for(let i=0; i<lines.length; i++) {
    const l = lines[i];
    if(l.includes('x-show="activeView === \\\'dashboard\\\'"')) dashboardViewStarted = true;
    if(dashboardViewStarted) {
        const opens = (l.match(/<div\b/gi) || []).length;
        const closes = (l.match(/<\/div>/gi) || []).length;
        depth += (opens - closes);
        if(depth <= 0) {
            console.log('Dashboard view closed at line ' + (i+1));
            break;
        }
    }
}
