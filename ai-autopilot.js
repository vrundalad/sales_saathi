const WEBHOOK_URL = "https://hooks.zapier.com/hooks/catch/27813045/4bzf1pt/";

export class SalesSaathiChat {
    constructor(chatContainerId) {
        // The DOM element where messages will be appended
        this.container = chatContainerId ? document.getElementById(chatContainerId) : null;
        
        // Extensibility Blueprint: Middleware hooks registry
        // Supports injection of Supabase logging, Gemini streaming, Meeting Analysis payloads, etc.
        this.hooks = {
            preSend: [],
            postReceive: [],
            onError: []
        };
    }

    /**
     * Extensibility Blueprint: Register middleware
     * Example: chat.registerHook('preSend', async (payload) => { // log to Supabase })
     */
    registerHook(event, callback) {
        if (this.hooks[event]) {
            this.hooks[event].push(callback);
        }
    }

    /**
     * Executes registered middleware sequentially
     */
    async runHooks(event, data) {
        let currentData = data;
        for (const hook of this.hooks[event]) {
            currentData = await hook(currentData) || currentData;
        }
        return currentData;
    }

    /**
     * The primary orchestrator. Validates inputs, triggers UI states, 
     * executes the network request, and handles the asynchronous lifecycle.
     * @param {string} text - The user's input message
     */
    async sendMessage(text) {
        if (!text || text.trim() === '') return;
        
        const sanitizedText = text.trim();
        this.addUserMessage(sanitizedText);
        
        const payload = {
            message: sanitizedText,
            timestamp: new Date().toISOString()
        };

        try {
            this.showLoading();
            
            // Execute pre-send middleware (e.g., Supabase logging)
            const finalPayload = await this.runHooks('preSend', payload);

            // API Communication Protocol
            const response = await fetch(WEBHOOK_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(finalPayload)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            // Execute post-receive middleware (e.g., direct streaming overrides, Meeting Analysis payloads)
            const processedData = await this.runHooks('postReceive', data);

            // Handle the Zapier webhook response. Zapier usually returns { status: "success", attempt: "...", id: "..." }
            // If the zap responds synchronously with a reply, we can parse it here.
            // Otherwise, we output a standard acknowledgment or the parsed reply.
            const aiReply = processedData.reply || processedData.response || "Message processed successfully.";
            
            this.addAIMessage(aiReply);
        } catch (error) {
            console.error('Error in sendMessage lifecycle:', error);
            await this.runHooks('onError', error);
            this.addAIMessage("Connection error. The AI is temporarily unavailable.");
        } finally {
            this.hideLoading();
        }
    }

    /**
     * Sanitizes the input string and appends the user's message payload to the DOM.
     * @param {string} text - User message text
     */
    addUserMessage(text) {
        const safeText = this.escapeHTML(text);
        
        if (this.container) {
            const msgDiv = document.createElement('div');
            // Styling strictly aligned with Sales Saathi dashboard UI
            msgDiv.className = 'bg-brandIndigo text-white rounded-xl rounded-tr-none p-3 max-w-[85%] self-end ml-auto shadow-md';
            msgDiv.innerHTML = `<p class="text-xs font-semibold">${safeText}</p>`;
            this.container.appendChild(msgDiv);
            this.scrollToBottom();
        } else {
            console.log(`[User]: ${safeText}`);
        }
    }

    /**
     * Appends the processed AI response to the DOM.
     * @param {string} text - AI response text
     */
    addAIMessage(text) {
        const safeText = this.escapeHTML(text);
        
        if (this.container) {
            const msgDiv = document.createElement('div');
            // Styling strictly aligned with Sales Saathi dashboard UI
            msgDiv.className = 'bg-slate-100 dark:bg-white/5 rounded-xl rounded-tl-none p-3 max-w-[85%] self-start border border-slate-200 dark:border-transparent';
            msgDiv.innerHTML = `<p class="text-xs font-semibold text-slate-700 dark:text-zinc-300">${safeText}</p>`;
            this.container.appendChild(msgDiv);
            this.scrollToBottom();
        } else {
            console.log(`[AI]: ${safeText}`);
        }
    }

    /**
     * Toggles a highly responsive, non-blocking UI loading indicator.
     */
    showLoading() {
        if (!this.container) return;
        
        const loadingDiv = document.createElement('div');
        loadingDiv.id = 'ai-loading-indicator';
        loadingDiv.className = 'flex gap-1.5 p-3 self-start';
        loadingDiv.innerHTML = `
            <div class="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style="animation-delay: 0ms"></div>
            <div class="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style="animation-delay: 150ms"></div>
            <div class="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style="animation-delay: 300ms"></div>
        `;
        this.container.appendChild(loadingDiv);
        this.scrollToBottom();
    }

    /**
     * Removes the loading indicator from the DOM.
     */
    hideLoading() {
        const loadingDiv = document.getElementById('ai-loading-indicator');
        if (loadingDiv) {
            loadingDiv.remove();
        }
    }

    /**
     * XSS Prevention Helper
     */
    escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    /**
     * Auto-scroll helper for the chat container
     */
    scrollToBottom() {
        if (this.container) {
            this.container.scrollTop = this.container.scrollHeight;
        }
    }
}
