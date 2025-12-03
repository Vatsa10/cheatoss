import { html, css, LitElement } from '../../assets/lit-core-2.7.4.min.js';
import { resizeLayout } from '../../utils/windowResize.js';

export class MainView extends LitElement {
    static styles = css`
        * {
            font-family: 'Inter', sans-serif;
            cursor: default;
            user-select: none;
        }

        .welcome {
            font-size: 24px;
            margin-bottom: 8px;
            font-weight: 600;
            margin-top: auto;
        }

        .input-group {
            display: flex;
            gap: 12px;
            margin-bottom: 20px;
        }

        .input-group input {
            flex: 1;
        }

        input {
            background: var(--input-background);
            color: var(--text-color);
            border: 1px solid var(--button-border);
            padding: 10px 14px;
            width: 100%;
            border-radius: 8px;
            font-size: 14px;
            transition: border-color 0.2s ease;
        }

        input:focus {
            outline: none;
            border-color: var(--focus-border-color);
            box-shadow: 0 0 0 3px var(--focus-box-shadow);
            background: var(--input-focus-background);
        }

        input::placeholder {
            color: var(--placeholder-color);
        }

        /* Red blink animation for empty API key */
        input.api-key-error {
            animation: blink-red 1s ease-in-out;
            border-color: #ff4444;
        }

        @keyframes blink-red {
            0%,
            100% {
                border-color: var(--button-border);
                background: var(--input-background);
            }
            25%,
            75% {
                border-color: #ff4444;
                background: rgba(255, 68, 68, 0.1);
            }
            50% {
                border-color: #ff6666;
                background: rgba(255, 68, 68, 0.15);
            }
        }

        .start-button {
            background: var(--start-button-background);
            color: var(--start-button-color);
            border: 1px solid var(--start-button-border);
            padding: 8px 16px;
            border-radius: 8px;
            font-size: 13px;
            font-weight: 500;
            white-space: nowrap;
            display: flex;
            align-items: center;
            gap: 6px;
        }

        .start-button:hover {
            background: var(--start-button-hover-background);
            border-color: var(--start-button-hover-border);
        }

        .start-button.initializing {
            opacity: 0.5;
        }

        .start-button.initializing:hover {
            background: var(--start-button-background);
            border-color: var(--start-button-border);
        }

        .session-type-selector {
            display: flex !important;
            gap: 10px;
            margin-bottom: 15px;
            background: #2a2a2a;
            padding: 5px;
            border-radius: 8px;
            border: 1px solid #444;
        }

        .session-type-btn {
            flex: 1;
            padding: 8px;
            border: none;
            background: transparent;
            color: #ffffff;
            border-radius: 6px;
            cursor: pointer;
            font-size: 13px;
            transition: background 0.2s ease;
        }

        .session-type-btn.active {
            background: #007acc;
            color: #ffffff;
        }

        .session-type-btn:hover:not(.active) {
            background: #444444;
        }

        .test-screenshot-btn {
            background: var(--text-input-button-background);
            color: white;
            border: none;
            padding: 6px 12px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 500;
            cursor: pointer;
            margin-top: 10px;
            transition: background 0.2s ease;
        }

        .test-screenshot-btn:hover {
            background: var(--text-input-button-hover);
        }

        .test-result {
            margin-top: 10px;
            padding: 8px;
            background: var(--input-background);
            border-radius: 6px;
            font-size: 12px;
            color: var(--text-color);
            max-height: 100px;
            overflow-y: auto;
            border: 1px solid var(--button-border);
        }

        .shortcut-icons {
            display: flex;
            align-items: center;
            gap: 2px;
            margin-left: 4px;
        }

        .shortcut-icons svg {
            width: 14px;
            height: 14px;
        }

        .shortcut-icons svg path {
            stroke: currentColor;
        }

        .description {
            color: var(--description-color);
            font-size: 14px;
            margin-bottom: 24px;
            line-height: 1.5;
        }

        .link {
            color: var(--link-color);
            text-decoration: underline;
            cursor: pointer;
        }

        .shortcut-hint {
            color: var(--description-color);
            font-size: 11px;
            opacity: 0.8;
        }

        :host {
            height: 100%;
            display: flex;
            flex-direction: column;
            width: 100%;
            max-width: 500px;
        }
    `;

    static properties = {
        onStart: { type: Function },
        onAPIKeyHelp: { type: Function },
        isInitializing: { type: Boolean },
        onLayoutModeChange: { type: Function },
        showApiKeyError: { type: Boolean },
        testResult: { type: String },
        isTestLoading: { type: Boolean },
        sessionType: { type: String },
    };

    constructor() {
        super();
        this.onStart = () => {};
        this.onAPIKeyHelp = () => {};
        this.isInitializing = false;
        this.onLayoutModeChange = () => {};
        this.showApiKeyError = false;
        this.testResult = '';
        this.isTestLoading = false;
        this.sessionType = 'audio'; // Default to audio
        this.boundKeydownHandler = this.handleKeydown.bind(this);
    }

    connectedCallback() {
        super.connectedCallback();
        window.electron?.ipcRenderer?.on('session-initializing', (event, isInitializing) => {
            this.isInitializing = isInitializing;
        });

        // Add keyboard event listener for Ctrl+Enter (or Cmd+Enter on Mac)
        document.addEventListener('keydown', this.boundKeydownHandler);

        // Load and apply layout mode on startup
        this.loadLayoutMode();
        // Resize window for this view
        resizeLayout();
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        window.electron?.ipcRenderer?.removeAllListeners('session-initializing');
        // Remove keyboard event listener
        document.removeEventListener('keydown', this.boundKeydownHandler);
    }

    handleKeydown(e) {
        if (e.key === 'Enter' && (e.ctrlKey || (navigator.platform.toUpperCase().indexOf('MAC') >= 0 && e.metaKey))) {
            this.handleStartClick();
            this.showApiKeyError = false;
        }
    }

    handleStartClick() {
        if (this.isInitializing) {
            return;
        }
        this.onStart(this.sessionType);
    }

    handleSessionTypeChange(type) {
        this.sessionType = type;
        this.requestUpdate();
    }

    handleAPIKeyHelpClick() {
        this.onAPIKeyHelp();
    }

    handleResetOnboarding() {
        localStorage.removeItem('onboardingCompleted');
        // Refresh the page to trigger onboarding
        window.location.reload();
    }

    loadLayoutMode() {
        const savedLayoutMode = localStorage.getItem('layoutMode');
        if (savedLayoutMode && savedLayoutMode !== 'normal') {
            // Notify parent component to apply the saved layout mode
            this.onLayoutModeChange(savedLayoutMode);
        }
    }

    // Method to trigger the red blink animation
    triggerApiKeyError() {
        this.showApiKeyError = true;
        // Remove the error class after 1 second
        setTimeout(() => {
            this.showApiKeyError = false;
        }, 1000);
    }

    async handleTestScreenshot() {
        if (this.isTestLoading) return;
        
        // Check if cheddar is available
        if (!window.cheddar || typeof window.cheddar.captureSingleScreenshot !== 'function') {
            this.testResult = 'Error: Screenshot functionality not available. Please restart the app.';
            this.requestUpdate();
            return;
        }
        
        this.isTestLoading = true;
        this.testResult = 'Capturing screenshot...';
        this.requestUpdate();

        try {
            const result = await window.cheddar.captureSingleScreenshot();
            
            if (result.success) {
                this.testResult = `OCR Result: ${result.text.substring(0, 200)}${result.text.length > 200 ? '...' : ''}`;
            } else {
                this.testResult = `Error: ${result.error}`;
            }
        } catch (error) {
            this.testResult = `Error: ${error.message}`;
        } finally {
            this.isTestLoading = false;
            this.requestUpdate();
        }
    }

    getStartButtonText() {
        const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;

        const cmdIcon = html`<svg width="14px" height="14px" viewBox="0 0 24 24" stroke-width="2" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 6V18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
            <path d="M15 6V18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
            <path
                d="M9 6C9 4.34315 7.65685 3 6 3C4.34315 3 3 4.34315 3 6C3 7.65685 4.34315 9 6 9H18C19.6569 9 21 7.65685 21 6C21 4.34315 19.6569 3 18 3C16.3431 3 15 4.34315 15 6"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
            ></path>
            <path
                d="M9 18C9 19.6569 7.65685 21 6 21C4.34315 21 3 19.6569 3 18C3 16.3431 4.34315 15 6 15H18C19.6569 15 21 16.3431 21 18C21 19.6569 19.6569 21 18 21C16.3431 21 15 19.6569 15 18"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
            ></path>
        </svg>`;

        const enterIcon = html`<svg width="14px" height="14px" stroke-width="2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M10.25 19.25L6.75 15.75L10.25 12.25"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
            ></path>
            <path
                d="M6.75 15.75H12.75C14.9591 15.75 16.75 13.9591 16.75 11.75V4.75"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
            ></path>
        </svg>`;

        if (isMac) {
            return html`Start Session <span class="shortcut-icons">${cmdIcon}${enterIcon}</span>`;
        } else {
            return html`Start Session <span class="shortcut-icons">Ctrl${enterIcon}</span>`;
        }
    }

    render() {
        return html`
            <div class="welcome">Welcome</div>

            <div class="session-type-selector">
                <button 
                    class="session-type-btn ${this.sessionType === 'audio' ? 'active' : ''}"
                    @click=${() => this.handleSessionTypeChange('audio')}
                >
                    🎤 Audio Session
                </button>
                <button 
                    class="session-type-btn ${this.sessionType === 'ocr' ? 'active' : ''}"
                    @click=${() => this.handleSessionTypeChange('ocr')}
                >
                    📸 Screenshot OCR
                </button>
            </div>

            <div class="input-group">
                <input
                    type="password"
                    placeholder="Enter your Gemini API Key"
                    .value=${localStorage.getItem('apiKey') || ''}
                    @input=${this.handleInput}
                    class="${this.showApiKeyError ? 'api-key-error' : ''}"
                />
                <button @click=${this.handleStartClick} class="start-button ${this.isInitializing ? 'initializing' : ''}">
                    ${this.getStartButtonText()}
                </button>
            </div>
            
            ${this.sessionType === 'ocr' ? html`
                <button @click=${this.handleTestScreenshot} class="test-screenshot-btn" ?disabled=${this.isTestLoading}>
                    ${this.isTestLoading ? 'Testing...' : 'Test Screenshot OCR'}
                </button>
                
                ${this.testResult ? html`
                    <div class="test-result">${this.testResult}</div>
                ` : ''}
            ` : ''}
            
            <p class="description">
                ${this.sessionType === 'ocr' 
                    ? 'Screenshot OCR app that captures screen, extracts text and sends to Gemini for AI assistance.'
                    : 'Real-time AI assistant that provides contextual help during video calls, interviews, and meetings.'
                }
                <span @click=${this.handleAPIKeyHelpClick} class="link">Get API key here</span>
            </p>
        `;
    }
}

customElements.define('main-view', MainView);
