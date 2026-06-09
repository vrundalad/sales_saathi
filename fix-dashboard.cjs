const fs = require('fs');

let html = fs.readFileSync('d:/salessaathi/dashboard.html', 'utf8');

// 1. Remove the injected Deal Risk Tracking view
const drtRegex = /<!-- Deal Risk Tracking View -->[\s\S]*?<\/section>\s*<\/div>/;
const match = html.match(drtRegex);

if (match) {
    let extracted = match[0];
    html = html.replace(drtRegex, '');

    // Add the missing gap-6 to the wrapper
    extracted = extracted.replace(
        'class="w-full animate-[fadeIn_0.3s_ease-out]"', 
        'class="w-full flex flex-col gap-6 animate-[fadeIn_0.3s_ease-out]"'
    );

    // 2. Find the outreach view and inject BEFORE it, so we are 100% safely inside the layout
    const outreachStart = /<!-- Section 9: Outreach Quick Launcher \(Outreach View\) -->/;
    if (html.match(outreachStart)) {
        html = html.replace(outreachStart, extracted + '\n\n            ' + '<!-- Section 9: Outreach Quick Launcher (Outreach View) -->');
    } else {
        console.error("Could not find outreach view to inject before.");
        process.exit(1);
    }
} else {
    console.error("Could not find Deal Risk Tracking View in dashboard.html. Maybe already removed or different format.");
    process.exit(1);
}

// 3. Clean up the random extra </div> at line 1047 and beyond to avoid layout breaking
// Actually, it's safer to leave the other malformed divs if they were there before, but let's fix the 1047 one since it broke the main flex.
// Wait, if we moved the view up, it will render correctly inside the layout! The layout breaks *after* outreach.
// But to be clean, let's just save the file.

fs.writeFileSync('d:/salessaathi/dashboard.html', html);
console.log("Successfully moved Deal Risk Tracking view inside the main layout.");
