import { supabase } from '../src/lib/supabase.js';

const initDealRiskTracker = () => {
    // DOM Elements
    const companyInput = document.getElementById('deal-company');
    const valueInput = document.getElementById('deal-value');
    const stageSelect = document.getElementById('deal-stage');
    const transcriptInput = document.getElementById('deal-transcript');
    const transcriptCounter = document.getElementById('transcript-counter');
    const analyzeBtn = document.getElementById('analyze-btn');
    const analyzeBtnText = document.getElementById('analyze-btn-text');
    const analyzeLoader = document.getElementById('analyze-loader');
    const analyzeStepText = document.getElementById('analyze-step-text');
    
    // Results DOM
    const resultsContainer = document.getElementById('results-container');
    const emptyState = document.getElementById('results-empty-state');
    const resScore = document.getElementById('res-score');
    const riskSvgCircle = document.getElementById('risk-svg-circle');
    const resStatusBadge = document.getElementById('res-status-badge');
    const resSentiment = document.getElementById('res-sentiment');
    const resIntent = document.getElementById('res-intent');
    const resGhosting = document.getElementById('res-ghosting');
    const resBudget = document.getElementById('res-budget');
    const resCompetitor = document.getElementById('res-competitor');
    const resDecision = document.getElementById('res-decision');
    const resPositiveList = document.getElementById('res-positive-list');
    const resRiskList = document.getElementById('res-risk-list');
    const resRecommendationList = document.getElementById('res-recommendation-list');
    
    // Table DOM
    const tableBody = document.getElementById('analyses-table-body');
    const refreshBtn = document.getElementById('refresh-data-btn');

    // Email Modal DOM
    const generateEmailBtn = document.getElementById('generate-email-btn');
    const emailModal = document.getElementById('email-modal');
    const closeEmailModal = document.getElementById('close-email-modal');
    const emailLoading = document.getElementById('email-loading');
    const emailContent = document.getElementById('email-content');
    const emailFooter = document.getElementById('email-footer');
    const emailSubject = document.getElementById('email-subject');
    const emailBody = document.getElementById('email-body');
    const regenerateEmailBtn = document.getElementById('regenerate-email-btn');
    const copyEmailBtn = document.getElementById('copy-email-btn');

    // Tasks DOM
    const createTaskBtn = document.getElementById('create-task-btn');
    const tasksContainer = document.getElementById('tasks-container');
    const tasksList = document.getElementById('tasks-list');

    const kpiValues = document.querySelectorAll('.grid.grid-cols-1.sm\\:grid-cols-2.lg\\:grid-cols-4 > div p.text-3xl');
    
    let isAnalyzing = false;
    let lastAnalysisResult = null;

    // Transcript character counter
    transcriptInput.addEventListener('input', () => {
        const length = transcriptInput.value.length;
        transcriptCounter.textContent = `${length} / 5000`;
        if (length > 5000) {
            transcriptInput.value = transcriptInput.value.substring(0, 5000);
            transcriptCounter.textContent = `5000 / 5000`;
        }
        
        // Disable button if empty
        if (transcriptInput.value.trim() === '' || companyInput.value.trim() === '') {
            analyzeBtn.disabled = true;
        } else {
            analyzeBtn.disabled = false;
        }
    });

    companyInput.addEventListener('input', () => {
        if (transcriptInput.value.trim() === '' || companyInput.value.trim() === '') {
            analyzeBtn.disabled = true;
        } else {
            analyzeBtn.disabled = false;
        }
    });

    // Initial check
    analyzeBtn.disabled = true;

    // Helper: format currency
    const formatCurrency = (value) => {
        return `₹${(value / 100000).toFixed(1)}L`;
    };

    // Helper: get risk styles
    const getRiskStyles = (score) => {
        if (score <= 30) return { 
            colorClass: 'text-emerald-500', 
            bgClass: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20',
            stroke: '#10b981',
            status: 'Healthy'
        };
        if (score <= 60) return { 
            colorClass: 'text-amber-500', 
            bgClass: 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20',
            stroke: '#f59e0b',
            status: 'Warning'
        };
        return { 
            colorClass: 'text-rose-500', 
            bgClass: 'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20',
            stroke: '#f43f5e',
            status: 'High Risk'
        };
    };

    // Fetch Recent Analyses
    const fetchAnalyses = async () => {
        // Show table skeleton
        tableBody.innerHTML = `
            <tr>
                <td class="py-4 px-6"><div class="h-4 bg-slate-200 dark:bg-white/5 rounded w-24 animate-pulse"></div></td>
                <td class="py-4 px-6"><div class="h-4 bg-slate-200 dark:bg-white/5 rounded w-12 animate-pulse"></div></td>
                <td class="py-4 px-6"><div class="h-6 bg-slate-200 dark:bg-white/5 rounded-full w-20 animate-pulse"></div></td>
                <td class="py-4 px-6"><div class="h-4 bg-slate-200 dark:bg-white/5 rounded w-16 animate-pulse"></div></td>
                <td class="py-4 px-6"><div class="h-4 bg-slate-200 dark:bg-white/5 rounded w-20 animate-pulse"></div></td>
            </tr>
            <tr>
                <td class="py-4 px-6"><div class="h-4 bg-slate-200 dark:bg-white/5 rounded w-20 animate-pulse"></div></td>
                <td class="py-4 px-6"><div class="h-4 bg-slate-200 dark:bg-white/5 rounded w-10 animate-pulse"></div></td>
                <td class="py-4 px-6"><div class="h-6 bg-slate-200 dark:bg-white/5 rounded-full w-16 animate-pulse"></div></td>
                <td class="py-4 px-6"><div class="h-4 bg-slate-200 dark:bg-white/5 rounded w-14 animate-pulse"></div></td>
                <td class="py-4 px-6"><div class="h-4 bg-slate-200 dark:bg-white/5 rounded w-16 animate-pulse"></div></td>
            </tr>
        `;

        try {
            const { data, error } = await supabase
                .from('deal_risk_analysis')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (data && data.length > 0) {
                renderTable(data);
                updateKPIs(data);
            } else {
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="5" class="py-8 text-center text-sm font-medium text-slate-500">
                            No analyses found.
                        </td>
                    </tr>
                `;
                // Default KPIs handled in HTML already
            }
        } catch (err) {
            console.error('Error fetching deal risk analyses:', err);
            // Render dummy table data for visual testing if DB fails or doesn't exist
            renderTable([
                { company_name: 'Acme Corp', risk_score: 74, status: 'High Risk', sentiment: 'Negative', created_at: new Date().toISOString() },
                { company_name: 'TechFlow', risk_score: 42, status: 'Warning', sentiment: 'Neutral', created_at: new Date(Date.now() - 86400000).toISOString() },
                { company_name: 'Globex', risk_score: 18, status: 'Healthy', sentiment: 'Positive', created_at: new Date(Date.now() - 172800000).toISOString() }
            ]);
        }
    };

    const renderTable = (data) => {
        tableBody.innerHTML = '';
        data.slice(0, 5).forEach(row => {
            const styles = getRiskStyles(row.risk_score);
            const date = new Date(row.created_at).toLocaleDateString();
            
            const tr = document.createElement('tr');
            tr.className = 'hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group';
            tr.innerHTML = `
                <td class="py-4 px-6 text-sm font-bold text-slate-900 dark:text-white">${row.company_name}</td>
                <td class="py-4 px-6 text-sm font-bold text-slate-600 dark:text-slate-300">${row.risk_score}%</td>
                <td class="py-4 px-6">
                    <span class="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${styles.colorClass} ${styles.bgClass}">
                        ${styles.status}
                    </span>
                </td>
                <td class="py-4 px-6 text-sm font-medium text-slate-500 dark:text-slate-400">${row.sentiment || row.customer_sentiment || 'Neutral'}</td>
                <td class="py-4 px-6 text-sm font-medium text-slate-400 dark:text-slate-500">${date}</td>
            `;
            tableBody.appendChild(tr);
        });
    };

    const updateKPIs = (data) => {
        if (!data || data.length === 0) return;
        
        const total = data.length;
        const highRisk = data.filter(d => d.risk_score > 60).length;
        const avgRisk = Math.round(data.reduce((acc, d) => acc + d.risk_score, 0) / total);
        
        // Assuming KPI elements are in order: Total, High Risk, Avg, Revenue
        if (kpiValues[0]) kpiValues[0].textContent = total;
        if (kpiValues[1]) kpiValues[1].textContent = highRisk;
        if (kpiValues[2]) kpiValues[2].textContent = `${avgRisk}%`;
        // Revenue at risk is a mock calculation based on high risk deals for visual purposes
        if (kpiValues[3]) kpiValues[3].textContent = formatCurrency(highRisk * 500000); 
    };

    const displayResults = (analysis) => {
        lastAnalysisResult = { ...analysis, company_name: companyInput.value };
        emptyState.style.display = 'none';
        resultsContainer.style.display = 'block';

        const styles = getRiskStyles(analysis.risk_score || 0);

        // Score
        resScore.textContent = analysis.risk_score || 0;
        resStatusBadge.textContent = styles.status;
        resStatusBadge.className = `px-4 py-1.5 rounded-full text-xs font-bold border ${styles.colorClass} ${styles.bgClass}`;
        
        // Animate SVG Circle
        setTimeout(() => {
            const offset = 282.7 - (282.7 * (analysis.risk_score || 0)) / 100;
            riskSvgCircle.style.strokeDashoffset = offset;
            riskSvgCircle.setAttribute('stroke', styles.stroke);
        }, 100);

        // Metrics (Map what we have, fallback rest)
        resSentiment.textContent = analysis.sentiment || 'Neutral';
        resIntent.textContent = analysis.buying_intent || 'Medium';
        resGhosting.textContent = 'N/A'; // Not in new API
        resBudget.textContent = 'N/A';   // Not in new API
        resCompetitor.textContent = 'N/A'; // Not in new API
        resDecision.textContent = 'N/A';   // Not in new API

        // Lists
        resPositiveList.innerHTML = `
            <li class="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-start gap-2 text-slate-400 italic">
                Awaiting more data...
            </li>
        `;

        resRiskList.innerHTML = (analysis.objections || []).map(s => `
            <li class="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-start gap-2">
                <svg class="w-4 h-4 text-rose-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                ${s}
            </li>
        `).join('');

        let recs = [];
        if (typeof analysis.recommendation === 'string') {
            recs = [analysis.recommendation];
        } else if (Array.isArray(analysis.recommendation)) {
            recs = analysis.recommendation;
        }

        resRecommendationList.innerHTML = recs.map(r => `<li>${r}</li>`).join('');
    };

    // Handle Analyze Click
    analyzeBtn.addEventListener('click', async () => {
        if (isAnalyzing || !companyInput.value.trim() || !transcriptInput.value.trim()) return;
        
        isAnalyzing = true;
        analyzeBtnText.textContent = '';
        analyzeBtn.classList.add('hidden');
        analyzeLoader.classList.remove('hidden');

        const steps = [
            'Analyzing sentiment...',
            'Checking objections...',
            'Calculating risk score...',
            'Generating recommendations...'
        ];

        // Animate Steps
        for (let i = 0; i < steps.length; i++) {
            analyzeStepText.textContent = steps[i];
            await new Promise(r => setTimeout(r, 800));
        }

        try {
            // Attempt Supabase Edge Function
            const { data, error } = await supabase.functions.invoke('analyze-deal-risk', {
                body: { 
                    company_name: companyInput.value,
                    transcript: transcriptInput.value
                }
            });

            if (error) {
                console.error('API error:', error);
                alert('Analysis failed. Please try again.');
                throw error;
            }

            if (data) {
                // Save to Database History
                const { data: userData } = await supabase.auth.getUser();
                
                const { error: dbError } = await supabase.from('deal_risk_analysis').insert([{
                    user_id: userData?.user?.id,
                    company_name: companyInput.value,
                    risk_score: data.risk_score || 0,
                    sentiment: data.sentiment || 'Neutral'
                }]);

                if (dbError) {
                    console.error('Warning: Failed to save analysis to history:', dbError);
                }

                // Show success notification (basic alert or could use a toast if available)
                const originalText = analyzeBtnText.textContent;
                
                displayResults(data);
                
                // Refresh table automatically
                fetchAnalyses(); 
                
                // Simple success indication
                analyzeBtnText.textContent = 'Success!';
                analyzeBtn.classList.remove('hidden');
                analyzeBtn.classList.add('bg-emerald-500', 'hover:bg-emerald-600');
                setTimeout(() => {
                    analyzeBtn.classList.remove('bg-emerald-500', 'hover:bg-emerald-600');
                    analyzeBtnText.textContent = 'Analyze Risk';
                }, 3000);
            }
        } catch (err) {
            console.error('Network or Execution failure:', err);
            // Revert UI gracefully
            alert('A network or API error occurred. Check the console for details.');
        } finally {
            isAnalyzing = false;
            analyzeBtn.classList.remove('hidden');
            analyzeLoader.classList.add('hidden');
            analyzeBtnText.textContent = 'Analyze Risk';
            transcriptInput.value = '';
            transcriptCounter.textContent = '0 / 5000';
            analyzeBtn.disabled = true;
        }
    });

    if (refreshBtn) {
        refreshBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            refreshBtn.classList.add('animate-spin');
            fetchAnalyses().finally(() => {
                setTimeout(() => refreshBtn.classList.remove('animate-spin'), 500);
            });
        });
    }

    // -------------------------------------------------------------
    // OpenRouter Email Generation
    // -------------------------------------------------------------
    const generateFollowUpEmail = async () => {
        if (!lastAnalysisResult) return;
        
        // Display Modal Loading State
        emailModal.classList.remove('hidden');
        emailLoading.classList.remove('hidden');
        emailContent.classList.add('hidden');
        emailFooter.classList.add('hidden');
        emailSubject.value = '';
        emailBody.value = '';

        try {
            const payload = {
                company_name: lastAnalysisResult.company_name || 'the prospect',
                risk_score: lastAnalysisResult.risk_score || 0,
                sentiment: lastAnalysisResult.sentiment || 'Neutral',
                buying_intent: lastAnalysisResult.buying_intent || 'Medium',
                objections: lastAnalysisResult.objections || [],
                recommendation: lastAnalysisResult.recommendation || 'Follow up'
            };

            const { data, error } = await supabase.functions.invoke('generate-followup-email', {
                body: payload
            });

            if (error) {
                console.error('Edge Function Error:', error);
                throw new Error("Failed to connect to secure email generation service.");
            }

            if (!data || !data.email) {
                throw new Error("Invalid response format received from generation service.");
            }

            emailSubject.value = data.subject || "Following up on our recent discussion";
            emailBody.value = data.email || "";

            // Show Content
            emailLoading.classList.add('hidden');
            emailContent.classList.remove('hidden');
            emailFooter.classList.remove('hidden');

        } catch (err) {
            console.error('Email Generation Error:', err);
            alert(`Failed to generate email: ${err.message}`);
            emailModal.classList.add('hidden');
        }
    };

    if (generateEmailBtn) {
        generateEmailBtn.addEventListener('click', generateFollowUpEmail);
    }
    
    if (regenerateEmailBtn) {
        regenerateEmailBtn.addEventListener('click', generateFollowUpEmail);
    }

    if (closeEmailModal) {
        closeEmailModal.addEventListener('click', () => {
            emailModal.classList.add('hidden');
        });
        // Close on background overlay click
        const overlay = document.getElementById('email-modal-overlay');
        if (overlay) {
            overlay.addEventListener('click', () => {
                emailModal.classList.add('hidden');
            });
        }
    }

    if (copyEmailBtn) {
        copyEmailBtn.addEventListener('click', async () => {
            const textToCopy = `Subject: ${emailSubject.value}\n\n${emailBody.value}`;
            try {
                await navigator.clipboard.writeText(textToCopy);
                const originalHTML = copyEmailBtn.innerHTML;
                copyEmailBtn.innerHTML = '<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg> Copied!';
                setTimeout(() => {
                    copyEmailBtn.innerHTML = originalHTML;
                }, 2000);
            } catch (err) {
                alert('Failed to copy to clipboard.');
            }
        });
    }

    // Task Creation Logic
    if (createTaskBtn) {
        createTaskBtn.addEventListener('click', async () => {
            if (!lastAnalysisResult) {
                alert("Please analyze a deal first.");
                return;
            }

            const recommendationText = lastAnalysisResult.recommendation ? 
                (Array.isArray(lastAnalysisResult.recommendation) ? lastAnalysisResult.recommendation[0] : lastAnalysisResult.recommendation) 
                : "Follow up on the latest discussion.";

            const taskTitle = "Action Required: " + (lastAnalysisResult.company_name || 'Prospect');
            
            // UI Loading state
            const originalText = createTaskBtn.innerHTML;
            createTaskBtn.innerHTML = "Creating Task...";
            createTaskBtn.disabled = true;

            try {
                const { data: userData } = await supabase.auth.getUser();
                if (!userData?.user?.id) throw new Error("You must be logged in to create a task.");

                const { data, error } = await supabase.from('tasks').insert([{
                    user_id: userData.user.id,
                    company_name: lastAnalysisResult.company_name || 'Prospect',
                    task_title: taskTitle,
                    task_description: recommendationText,
                    status: 'pending'
                }]).select();

                if (error) {
                    throw error;
                }

                alert("Task created successfully!");
                
                // Refresh Task List UI immediately
                if (data && data.length > 0) {
                    // Re-fetch all tasks to ensure UI consistency
                    fetchTasks();
                }

            } catch (err) {
                console.error("Task Creation Error:", err);
                alert("Failed to create task: " + err.message);
            } finally {
                createTaskBtn.innerHTML = originalText;
                createTaskBtn.disabled = false;
            }
        });
    }

    // -------------------------------------------------------------
    // Task Fetching & Interactive Logic
    // -------------------------------------------------------------
    const renderTaskHtml = (task) => {
        const isPending = task.status !== 'done';
        return `
            <li class="p-3 bg-white dark:bg-[#09090b] border border-slate-200 dark:border-white/10 rounded-xl shadow-sm text-sm transition-all duration-200 ${!isPending ? 'opacity-60' : ''}">
                <div class="flex items-start justify-between gap-3">
                    <div>
                        <h6 class="font-bold text-slate-900 dark:text-white ${!isPending ? 'line-through' : ''}">${task.task_title}: ${task.company_name}</h6>
                        <p class="text-xs font-medium text-slate-500 mt-1">${task.task_description}</p>
                    </div>
                    <div class="flex items-center gap-1 shrink-0">
                        <button data-task-id="${task.id}" data-action="pending" class="px-2 py-1 text-[9px] font-black uppercase tracking-wider rounded-lg border transition-colors ${isPending ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 border-amber-200 dark:border-amber-500/20' : 'bg-transparent text-slate-400 dark:text-slate-500 border-slate-200 dark:border-white/10 hover:text-amber-600'} outline-none">
                            Pending
                        </button>
                        <button data-task-id="${task.id}" data-action="done" class="px-2 py-1 text-[9px] font-black uppercase tracking-wider rounded-lg border transition-colors ${!isPending ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-500/20' : 'bg-transparent text-slate-400 dark:text-slate-500 border-slate-200 dark:border-white/10 hover:text-emerald-600'} outline-none">
                            Done
                        </button>
                    </div>
                </div>
            </li>
        `;
    };

    const fetchTasks = async () => {
        if (!tasksList || !tasksContainer) return;
        try {
            const { data: userData } = await supabase.auth.getUser();
            if (!userData?.user?.id) return;

            const { data, error } = await supabase.from('tasks')
                .select('*')
                .eq('user_id', userData.user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (data && data.length > 0) {
                tasksContainer.classList.remove('hidden');
                tasksList.innerHTML = data.map(renderTaskHtml).join('');
            } else {
                tasksContainer.classList.add('hidden');
            }
        } catch (err) {
            console.error("Failed to fetch tasks:", err);
        }
    };

    if (tasksList) {
        tasksList.addEventListener('click', async (e) => {
            const btn = e.target.closest('button[data-task-id]');
            if (!btn) return;

            const taskId = btn.getAttribute('data-task-id');
            const newStatus = btn.getAttribute('data-action');

            // Optimistic UI Class Update (for instant feedback)
            const parentLi = btn.closest('li');
            if (parentLi) parentLi.style.opacity = '0.5';

            try {
                const { error } = await supabase.from('tasks').update({ status: newStatus }).eq('id', taskId);
                if (error) throw error;
                // Re-fetch to synchronize state
                fetchTasks();
            } catch (err) {
                console.error("Failed to update task status:", err);
                alert("Failed to update status.");
                if (parentLi) parentLi.style.opacity = '1'; // revert on failure
            }
        });
    }

    // Initial Fetch
    fetchAnalyses();
    fetchTasks();
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDealRiskTracker);
} else {
    initDealRiskTracker();
}
