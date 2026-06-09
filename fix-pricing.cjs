const fs = require('fs');

function fixPricing(file) {
    let content = fs.readFileSync(file, 'utf8');

    // Fix Pro Plan Text Colors (both files)
    content = content.replace(/text-slate-900 dark:text-white text-xs font-bold uppercase/g, 'text-white text-xs font-bold uppercase');
    content = content.replace(/<h3 class="text-lg font-bold text-slate-900 dark:text-white mb-2 mt-2">Pro Plan<\/h3>/g, '<h3 class="text-lg font-bold text-white mb-2 mt-2">Pro Plan</h3>');
    content = content.replace(/<span class="text-4xl font-extrabold text-slate-900 dark:text-white">₹1,499<\/span>/g, '<span class="text-4xl font-extrabold text-white">₹1,499</span>');
    content = content.replace(/<span class="text-4xl font-extrabold text-slate-900 dark:text-white">₹14,990<\/span>/g, '<span class="text-4xl font-extrabold text-white">₹14,990</span>');
    content = content.replace(/<a href="(.*?)"\s*class="w-full block text-center py-3 px-4 rounded-xl font-bold text-slate-900 dark:text-white bg-brandIndigo/g, '<a href="$1"\n                        class="w-full block text-center py-3 px-4 rounded-xl font-bold text-white bg-brandIndigo');
    content = content.replace(/<p class="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Everything in Free, plus:<\/p>/g, '<p class="text-xs font-bold text-white uppercase tracking-wider">Everything in Free, plus:</p>');

    if (file.includes('pricing.html')) {
        // Fix x-data recommendedPlan default
        content = content.replace(/recommendedPlan: null }"/g, `recommendedPlan: 'pro' }"`);
        content = content.replace(/recommendedPlan = window\.AppPermissions\.Features\[targetFeature\]\.requiredPlan;/g, `recommendedPlan = window.AppPermissions.Features[targetFeature].requiredPlan; else recommendedPlan = 'pro';`);

        // Add interactive card classes and click handlers
        // Free Card
        content = content.replace(
            /class="pricing-card flex flex-col bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder rounded-3xl p-8 shadow-sm"/g,
            `@click="recommendedPlan = 'free'"\n                    :class="recommendedPlan === 'free' ? 'ring-4 ring-brandIndigo shadow-indigo-500/30 scale-105 z-10 shadow-2xl' : 'hover:scale-105 hover:shadow-xl'"\n                    class="cursor-pointer pricing-card flex flex-col bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder rounded-3xl p-8 shadow-sm transition-all duration-300 relative"`
        );

        // Pro Card
        content = content.replace(
            /:class="recommendedPlan === 'pro' \? 'ring-4 ring-brandIndigo shadow-indigo-500\/30' : 'glow-border'"\s+class="pricing-card flex flex-col bg-slate-900 dark:bg-zinc-900\/80 rounded-3xl p-8 shadow-2xl scale-105 z-10 relative transition-all duration-300"/g,
            `@click="recommendedPlan = 'pro'"\n                    :class="recommendedPlan === 'pro' ? 'ring-4 ring-brandIndigo shadow-indigo-500/30 scale-105 z-10 shadow-2xl' : 'glow-border hover:scale-105 hover:shadow-xl scale-100'"\n                    class="cursor-pointer pricing-card flex flex-col bg-slate-900 dark:bg-zinc-900/80 rounded-3xl p-8 relative transition-all duration-300"`
        );

        // Team Card
        content = content.replace(
            /:class="recommendedPlan === 'team' \? 'ring-4 ring-brandIndigo shadow-indigo-500\/30 scale-105 z-10' : ''"\s+class="pricing-card flex flex-col bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder rounded-3xl p-8 shadow-sm transition-all duration-300 relative"/g,
            `@click="recommendedPlan = 'team'"\n                    :class="recommendedPlan === 'team' ? 'ring-4 ring-brandIndigo shadow-indigo-500/30 scale-105 z-10 shadow-2xl' : 'hover:scale-105 hover:shadow-xl'"\n                    class="cursor-pointer pricing-card flex flex-col bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder rounded-3xl p-8 shadow-sm transition-all duration-300 relative"`
        );

        // Enterprise Card
        content = content.replace(
            /:class="recommendedPlan === 'enterprise' \? 'ring-4 ring-brandIndigo shadow-indigo-500\/30 scale-105 z-10' : ''"\s+class="pricing-card flex flex-col bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder rounded-3xl p-8 shadow-sm transition-all duration-300 relative"/g,
            `@click="recommendedPlan = 'enterprise'"\n                    :class="recommendedPlan === 'enterprise' ? 'ring-4 ring-brandIndigo shadow-indigo-500/30 scale-105 z-10 shadow-2xl' : 'hover:scale-105 hover:shadow-xl'"\n                    class="cursor-pointer pricing-card flex flex-col bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder rounded-3xl p-8 shadow-sm transition-all duration-300 relative"`
        );
    } else if (file.includes('index.html')) {
        // Fix hover effects for index.html cards
        
        // Free Card & others
        content = content.replace(
            /class="pricing-card flex flex-col bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder rounded-3xl p-8 shadow-sm"/g,
            `class="pricing-card flex flex-col bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder rounded-3xl p-8 shadow-sm hover:scale-105 hover:shadow-xl transition-all duration-300 cursor-pointer"`
        );
    }

    fs.writeFileSync(file, content);
}

fixPricing('d:/salessaathi/pricing.html');
fixPricing('d:/salessaathi/index.html');
console.log('Fixed pricing files');
