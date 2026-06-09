const fs = require('fs');
const html = fs.readFileSync('dashboard.html', 'utf8');
const lines = html.split('\n');
let depth = 0;
let dashboardStarted = false;
for(let i=0; i<lines.length; i++) {
    const l = lines[i];
    if(l.includes('activeView === \\'dashboard\\'') || l.includes('activeView === "dashboard"')) dashboardStarted = true;
    if(!dashboardStarted) continue;
    
    const opens = (l.match(/<div\b/gi) || []).length;
    const closes = (l.match(/<\/div>/gi) || []).length;
    depth += (opens - closes);
    if(depth <= 0) {
        console.log('Dashboard View closed properly at line ' + (i+1));
        console.log(lines.slice(i-2, i+4).join('\n'));
        break;
    }
}
