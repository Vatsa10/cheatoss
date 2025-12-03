// Global cheddar object for screenshot OCR functionality
console.log('Loading cheddar script...');

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing cheddar...');
    
    window.cheddar = {
        geminiSession: null,
        isCapturing: false,
        captureInterval: null,

        async initializeGemini(profile, language) {
            try {
                console.log('Initializing Gemini with profile:', profile, 'language:', language);
                
                if (!window.require) {
                    throw new Error('Electron not available');
                }

                const { ipcRenderer } = window.require('electron');
                const apiKey = localStorage.getItem('apiKey')?.trim();
                
                if (!apiKey) {
                    throw new Error('API key required');
                }

                const success = await ipcRenderer.invoke('initialize-gemini', apiKey, '', profile, language);
                
                if (success) {
                    console.log('Gemini initialized successfully');
                    return true;
                } else {
                    throw new Error('Failed to initialize Gemini');
                }
            } catch (error) {
                console.error('Error initializing Gemini:', error);
                throw error;
            }
        },

        async startCapture(interval, quality) {
            try {
                if (this.isCapturing) {
                    console.log('Capture already running');
                    return;
                }

                console.log('Starting screenshot capture with interval:', interval, 'quality:', quality);
                
                if (!window.require) {
                    throw new Error('Electron not available');
                }

                const { ipcRenderer } = window.require('electron');
                
                // Convert interval to seconds if it's not 'manual'
                let intervalSeconds = 5; // default
                if (interval !== 'manual') {
                    intervalSeconds = parseInt(interval);
                }

                const result = await ipcRenderer.invoke('start-screenshot-capture', intervalSeconds);
                
                if (result.success) {
                    this.isCapturing = true;
                    console.log('Screenshot capture started successfully');
                } else {
                    throw new Error(result.error || 'Failed to start capture');
                }
            } catch (error) {
                console.error('Error starting capture:', error);
                throw error;
            }
        },

        async stopCapture() {
            try {
                if (!this.isCapturing) {
                    console.log('No capture running');
                    return;
                }

                console.log('Stopping screenshot capture...');
                
                if (!window.require) {
                    throw new Error('Electron not available');
                }

                const { ipcRenderer } = window.require('electron');
                
                const result = await ipcRenderer.invoke('stop-screenshot-capture');
                
                if (result.success) {
                    this.isCapturing = false;
                    console.log('Screenshot capture stopped successfully');
                } else {
                    throw new Error(result.error || 'Failed to stop capture');
                }
            } catch (error) {
                console.error('Error stopping capture:', error);
                throw error;
            }
        },

        async sendTextMessage(message) {
            try {
                if (!window.require) {
                    throw new Error('Electron not available');
                }

                const { ipcRenderer } = window.require('electron');
                
                const result = await ipcRenderer.invoke('send-text-message', message);
                
                if (result.success) {
                    console.log('Text message sent successfully');
                    return result;
                } else {
                    throw new Error(result.error || 'Failed to send message');
                }
            } catch (error) {
                console.error('Error sending text message:', error);
                return { success: false, error: error.message };
            }
        },

        async captureSingleScreenshot() {
            try {
                console.log('Capturing single screenshot...');
                
                if (!window.require) {
                    throw new Error('Electron not available');
                }

                const { ipcRenderer } = window.require('electron');
                
                const result = await ipcRenderer.invoke('capture-single-screenshot');
                
                if (result.success) {
                    console.log('Screenshot captured successfully');
                    return result;
                } else {
                    throw new Error(result.error || 'Failed to capture screenshot');
                }
            } catch (error) {
                console.error('Error capturing screenshot:', error);
                return { success: false, error: error.message };
            }
        },

        async cleanup() {
            try {
                console.log('Cleaning up OCR resources...');
                
                if (!window.require) {
                    throw new Error('Electron not available');
                }

                const { ipcRenderer } = window.require('electron');
                
                const result = await ipcRenderer.invoke('cleanup-ocr');
                
                if (result.success) {
                    console.log('OCR cleanup completed successfully');
                } else {
                    console.error('OCR cleanup failed:', result.error);
                }
            } catch (error) {
                console.error('Error during cleanup:', error);
            }
        }
    };
    
    console.log('Cheddar initialized successfully');
});

// Also initialize immediately if DOM is already loaded
if (document.readyState === 'loading') {
    // DOM is still loading, event listener will handle it
} else {
    // DOM is already loaded, initialize now
    console.log('DOM already loaded, initializing cheddar immediately...');
    
    window.cheddar = {
        geminiSession: null,
        isCapturing: false,
        captureInterval: null,

        async initializeGemini(profile, language) {
            try {
                console.log('Initializing Gemini with profile:', profile, 'language:', language);
                
                if (!window.require) {
                    throw new Error('Electron not available');
                }

                const { ipcRenderer } = window.require('electron');
                const apiKey = localStorage.getItem('apiKey')?.trim();
                
                if (!apiKey) {
                    throw new Error('API key required');
                }

                const success = await ipcRenderer.invoke('initialize-gemini', apiKey, '', profile, language);
                
                if (success) {
                    console.log('Gemini initialized successfully');
                    return true;
                } else {
                    throw new Error('Failed to initialize Gemini');
                }
            } catch (error) {
                console.error('Error initializing Gemini:', error);
                throw error;
            }
        },

        async startCapture(interval, quality) {
            try {
                if (this.isCapturing) {
                    console.log('Capture already running');
                    return;
                }

                console.log('Starting screenshot capture with interval:', interval, 'quality:', quality);
                
                if (!window.require) {
                    throw new Error('Electron not available');
                }

                const { ipcRenderer } = window.require('electron');
                
                // Convert interval to seconds if it's not 'manual'
                let intervalSeconds = 5; // default
                if (interval !== 'manual') {
                    intervalSeconds = parseInt(interval);
                }

                const result = await ipcRenderer.invoke('start-screenshot-capture', intervalSeconds);
                
                if (result.success) {
                    this.isCapturing = true;
                    console.log('Screenshot capture started successfully');
                } else {
                    throw new Error(result.error || 'Failed to start capture');
                }
            } catch (error) {
                console.error('Error starting capture:', error);
                throw error;
            }
        },

        async stopCapture() {
            try {
                if (!this.isCapturing) {
                    console.log('No capture running');
                    return;
                }

                console.log('Stopping screenshot capture...');
                
                if (!window.require) {
                    throw new Error('Electron not available');
                }

                const { ipcRenderer } = window.require('electron');
                
                const result = await ipcRenderer.invoke('stop-screenshot-capture');
                
                if (result.success) {
                    this.isCapturing = false;
                    console.log('Screenshot capture stopped successfully');
                } else {
                    throw new Error(result.error || 'Failed to stop capture');
                }
            } catch (error) {
                console.error('Error stopping capture:', error);
                throw error;
            }
        },

        async sendTextMessage(message) {
            try {
                if (!window.require) {
                    throw new Error('Electron not available');
                }

                const { ipcRenderer } = window.require('electron');
                
                const result = await ipcRenderer.invoke('send-text-message', message);
                
                if (result.success) {
                    console.log('Text message sent successfully');
                    return result;
                } else {
                    throw new Error(result.error || 'Failed to send message');
                }
            } catch (error) {
                console.error('Error sending text message:', error);
                return { success: false, error: error.message };
            }
        },

        async captureSingleScreenshot() {
            try {
                console.log('Capturing single screenshot...');
                
                if (!window.require) {
                    throw new Error('Electron not available');
                }

                const { ipcRenderer } = window.require('electron');
                
                const result = await ipcRenderer.invoke('capture-single-screenshot');
                
                if (result.success) {
                    console.log('Screenshot captured successfully');
                    return result;
                } else {
                    throw new Error(result.error || 'Failed to capture screenshot');
                }
            } catch (error) {
                console.error('Error capturing screenshot:', error);
                return { success: false, error: error.message };
            }
        },

        async cleanup() {
            try {
                console.log('Cleaning up OCR resources...');
                
                if (!window.require) {
                    throw new Error('Electron not available');
                }

                const { ipcRenderer } = window.require('electron');
                
                const result = await ipcRenderer.invoke('cleanup-ocr');
                
                if (result.success) {
                    console.log('OCR cleanup completed successfully');
                } else {
                    console.error('OCR cleanup failed:', result.error);
                }
            } catch (error) {
                console.error('Error during cleanup:', error);
            }
        }
    };
    
    console.log('Cheddar initialized successfully (immediate)');
}
