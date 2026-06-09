const fs = require('fs');

const drt_html = fs.readFileSync('d:/salessaathi/deal-risk-tracking.html', 'utf8');

const match = drt_html.match(/<!-- PAGE HEADER -->([\s\S]*?)<!-- Script connection to logic module -->/);
if (!match) {
    console.error('Could not find content in deal-risk-tracking.html');
    process.exit(1);
}

let content_to_inject = match[1].trim();
// Remove closing tags at the end
content_to_inject = content_to_inject.replace(/<\/div>\s*<\/main>\s*<\/div>\s*$/, '').trim();

const wrapper = `
            <!-- Deal Risk Tracking View -->
            <div x-show="activeView === 'deal-risk-tracking'" x-cloak class="w-full animate-[fadeIn_0.3s_ease-out]">
                ${content_to_inject}
            </div>
`;

let dashboard_html = fs.readFileSync('d:/salessaathi/dashboard.html', 'utf8');

if (dashboard_html.includes('    </main>')) {
    dashboard_html = dashboard_html.replace('    </main>', wrapper + '\n    </main>');
} else {
    console.error('Could not find </main> in dashboard.html');
    process.exit(1);
}

if (!dashboard_html.includes('deal-risk-tracking.js')) {
    const script_tag = '<script type="module" src="/js/deal-risk-tracking.js"></script>';
    dashboard_html = dashboard_html.replace('</body>', '    ' + script_tag + '\n</body>');
}

fs.writeFileSync('d:/salessaathi/dashboard.html', dashboard_html);
console.log('Successfully injected Deal Risk Tracking into dashboard.html');
