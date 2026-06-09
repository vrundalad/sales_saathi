/**
 * SalesSaathi AI Autopilot Engine
 * Decoupled JavaScript handler for asynchronous integration pipelines.
 */

const WEBHOOK_URL = "https://hooks.zapier.com/hooks/catch/27813045/4bzf1pt/";

// Extensibility Blueprint: Middleware registry
const hooks = {
    preSend: [],
    postReceive: [],
    onError: []
};

export function registerHook(event, callback) {
    if (hooks[event]) {
        hooks[event].push(callback);
    }
}

async function runHooks(event, data) {
    let currentData = data;
    for (const hook of hooks[event]) {
        currentData = await hook(currentData) || currentData;
    }
    return currentData;
}

/**
 * Primary Integration Hook
 * 1. Captures payload from #aiMessageInput
 * 2. Toggles UI loading states via #aiLoadingIndicator
 * 3. Dispatches payload to the integration middleware (Zapier/Supabase/Gemini)
 */
export async function sendMessage() {
    const inputElement = document.getElementById('aiMessageInput');
    const loadingIndicator = document.getElementById('aiLoadingIndicator');
    
    if (!inputElement) {
        console.error("Critical Error: #aiMessageInput not found in DOM.");
        return;
    }

    const text = inputElement.value;
    if (!text || text.trim() === '') return;
    
    const sanitizedText = text.trim();
    
    // Clear input immediately for snappy UX
    inputElement.value = '';
    
    // Surface user message to DOM immediately
    appendUserMessage(sanitizedText);

    const payload = {
        message: sanitizedText,
        timestamp: new Date().toISOString()
    };

    try {
        if (loadingIndicator) {
            loadingIndicator.style.display = 'flex';
        }
        
        // Execute pre-send middleware (e.g., Supabase session injection)
        const finalPayload = await runHooks('preSend', payload);

        // Dispatch via Fetch API Protocol
        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(finalPayload)
        });

        if (!response.ok) {
            throw new Error(`Integration Error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // Execute post-receive middleware (e.g., Meeting Analysis extraction)
        const processedData = await runHooks('postReceive', data);

        // Handle webhook response data (Fallback to standard acknowledgment if no specific reply field)
        const aiReply = processedData.reply || processedData.response || "Data ingested successfully by AI Autopilot pipeline.";
        
        appendAIMessage(aiReply);
    } catch (error) {
        console.error('AI Autopilot pipeline exception:', error);
        await runHooks('onError', error);
        appendAIMessage("Connection disruption: Unable to reach AI core.");
    } finally {
        if (loadingIndicator) {
            loadingIndicator.style.display = 'none';
        }
    }
}

/**
 * Internal DOM Renderers (Decoupled from core pipeline logic)
 */
function appendUserMessage(text) {
    const container = document.getElementById('aiChatContainer');
    if (!container) return;
    
    const safeText = escapeHTML(text);
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const msgDiv = document.createElement('div');
    // Accent background, right aligned (Strict adherence to SalesSaathi dark-theme)
    msgDiv.className = 'bg-brandIndigo text-white rounded-2xl rounded-tr-sm p-4 max-w-[85%] self-end ml-auto shadow-md relative flex flex-col gap-1';
    msgDiv.innerHTML = `
        <p class="text-sm font-semibold leading-relaxed">${safeText}</p>
        <span class="text-[10px] font-bold text-indigo-200 self-end mt-1">${timestamp}</span>
    `;
    container.appendChild(msgDiv);
    container.scrollTop = container.scrollHeight;
}

export function appendAIMessage(text) {
    const container = document.getElementById('aiChatContainer');
    if (!container) return;
    
    const safeText = escapeHTML(text);
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const msgDiv = document.createElement('div');
    // Surface contrast background, left aligned
    msgDiv.className = 'bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl rounded-tl-sm p-4 max-w-[85%] self-start shadow-sm relative flex flex-col gap-1';
    msgDiv.innerHTML = `
        <p class="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">${safeText}</p>
        <span class="text-[10px] font-bold text-slate-400 dark:text-slate-500 self-start mt-1">${timestamp}</span>
    `;
    container.appendChild(msgDiv);
    container.scrollTop = container.scrollHeight;
}

function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// Global scope initialization for inline HTML action hooking (if loaded as standard script instead of module)
if (typeof window !== 'undefined') {
    window.sendMessage = sendMessage;
    window.appendAIMessage = appendAIMessage;
}
