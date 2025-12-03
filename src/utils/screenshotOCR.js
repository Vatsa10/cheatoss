const { desktopCapturer, ipcMain } = require('electron');
const Jimp = require('jimp');
const fs = require('fs');
const path = require('path');
const Tesseract = require('tesseract.js');

let screenshotInterval = null;
let isCapturing = false;
let tempDir = null;
let ocrWorker = null;

async function initializeOCR() {
    try {
        console.log('Initializing OCR with Tesseract.js...');
        
        // Create a temporary directory for screenshots
        tempDir = path.join(require('os').tmpdir(), 'screenshot-ocr');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }
        
        // Initialize Tesseract worker
        console.log('Creating Tesseract worker...');
        ocrWorker = await Tesseract.createWorker('eng', 1, {
            logger: m => console.log(m),
        });
        
        console.log('OCR initialized successfully');
        return true;
    } catch (error) {
        console.error('Failed to initialize OCR:', error);
        return false;
    }
}

async function cleanupOCR() {
    try {
        // Terminate Tesseract worker
        if (ocrWorker) {
            console.log('Terminating Tesseract worker...');
            await ocrWorker.terminate();
            ocrWorker = null;
        }
        
        // Clean up temp directory
        if (tempDir && fs.existsSync(tempDir)) {
            const files = fs.readdirSync(tempDir);
            for (const file of files) {
                fs.unlinkSync(path.join(tempDir, file));
            }
            fs.rmdirSync(tempDir);
            tempDir = null;
        }
        console.log('OCR cleanup completed');
    } catch (error) {
        console.error('Error during OCR cleanup:', error);
    }
}

async function captureScreen() {
    try {
        const sources = await desktopCapturer.getSources({
            types: ['screen'],
            thumbnailSize: { width: 1920, height: 1080 }
        });

        if (sources.length === 0) {
            throw new Error('No screen sources found');
        }

        // Get the first screen (primary display)
        const screenSource = sources[0];
        const image = screenSource.thumbnail;

        // Convert to buffer
        const buffer = image.toPNG();
        
        // Process with Jimp to optimize for OCR
        const processedImage = await Jimp.read(buffer);
        
        // Enhance image for better OCR results
        processedImage
            .greyscale() // Convert to grayscale
            .contrast(0.3) // Increase contrast
            .normalize(); // Normalize colors

        // Get processed image buffer
        const processedBuffer = await processedImage.getBufferAsync(Jimp.MIME_JPEG);
        
        return {
            buffer: processedBuffer,
            base64: processedBuffer.toString('base64')
        };
    } catch (error) {
        console.error('Error capturing screen:', error);
        throw error;
    }
}

// Simple text extraction using basic image analysis
async function performSimpleOCR(imageBuffer) {
    try {
        console.log('Performing text extraction...');
        
        // Save the image to temp file for processing
        if (tempDir) {
            const tempPath = path.join(tempDir, `screenshot-${Date.now()}.jpg`);
            fs.writeFileSync(tempPath, imageBuffer);
            console.log('Screenshot saved to:', tempPath);
            
            // Try to use Windows OCR if available, or fallback to basic text detection
            try {
                const extractedText = await extractTextFromImage(tempPath);
                console.log('OCR extraction completed');
                return extractedText;
            } catch (ocrError) {
                console.log('OCR failed, using fallback:', ocrError.message);
                // Fallback: return a message that no text was detected
                return 'No readable text detected in the screenshot. Please try capturing text content.';
            }
        } else {
            return 'OCR temp directory not available';
        }
    } catch (error) {
        console.error('Error in OCR:', error);
        return 'OCR processing failed';
    }
}

// Real text extraction using Tesseract.js
async function extractTextFromImage(imagePath) {
    try {
        console.log('Performing real OCR with Tesseract.js...');
        
        if (!ocrWorker) {
            throw new Error('OCR worker not initialized');
        }
        
        // Perform OCR on the image
        const { data: { text } } = await ocrWorker.recognize(imagePath);
        
        console.log('OCR completed, extracted text:', text);
        return text.trim();
    } catch (error) {
        console.error('Error in real OCR:', error);
        throw error;
    }
}

function startScreenshotCapture(intervalSeconds, geminiSessionRef, sendToRenderer) {
    if (isCapturing) {
        console.log('Screenshot capture already running');
        return;
    }

    isCapturing = true;
    console.log(`Starting screenshot capture every ${intervalSeconds} seconds`);

    const intervalMs = intervalSeconds * 1000;
    
    // Take first screenshot immediately
    captureAndProcess(geminiSessionRef, sendToRenderer);

    // Set up interval
    screenshotInterval = setInterval(() => {
        captureAndProcess(geminiSessionRef, sendToRenderer);
    }, intervalMs);
}

async function captureAndProcess(geminiSessionRef, sendToRenderer) {
    try {
        sendToRenderer('update-status', 'Capturing screen...');
        
        // Capture screen
        const { buffer, base64 } = await captureScreen();
        sendToRenderer('update-status', 'Processing screenshot...');
        
        // Perform simple OCR
        const extractedText = await performSimpleOCR(buffer);
        
        if (extractedText && extractedText.trim().length > 10) {
            console.log('Sending extracted text to Gemini:', extractedText.substring(0, 100) + '...');
            
            // Send text to Gemini
            if (geminiSessionRef.current) {
                await geminiSessionRef.current.sendRealtimeInput({
                    text: `I can see the following content on screen: "${extractedText}"`
                });
                sendToRenderer('update-status', 'Processing...');
            } else {
                sendToRenderer('update-status', 'No active session');
            }
        } else {
            sendToRenderer('update-status', 'No content detected');
        }
    } catch (error) {
        console.error('Error in capture and process:', error);
        sendToRenderer('update-status', 'Error: ' + error.message);
    }
}

function stopScreenshotCapture() {
    if (screenshotInterval) {
        clearInterval(screenshotInterval);
        screenshotInterval = null;
    }
    isCapturing = false;
    console.log('Screenshot capture stopped');
}

function setupScreenshotIpcHandlers(geminiSessionRef, sendToRenderer) {
    ipcMain.handle('start-screenshot-capture', async (event, intervalSeconds) => {
        try {
            // Initialize OCR if not already done
            if (!ocrWorker) {
                const initialized = await initializeOCR();
                if (!initialized) {
                    return { success: false, error: 'Failed to initialize OCR' };
                }
            }

            startScreenshotCapture(intervalSeconds, geminiSessionRef, sendToRenderer);
            return { success: true };
        } catch (error) {
            console.error('Error starting screenshot capture:', error);
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('stop-screenshot-capture', async (event) => {
        try {
            stopScreenshotCapture();
            return { success: true };
        } catch (error) {
            console.error('Error stopping screenshot capture:', error);
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('capture-single-screenshot', async (event) => {
        try {
            // Initialize OCR if not already done
            if (!tempDir) {
                const initialized = await initializeOCR();
                if (!initialized) {
                    return { success: false, error: 'Failed to initialize OCR' };
                }
            }

            sendToRenderer('update-status', 'Capturing screen...');
            const { buffer, base64 } = await captureScreen();
            sendToRenderer('update-status', 'Processing screenshot...');
            const extractedText = await performSimpleOCR(buffer);
            console.log('Extracted OCR text:', extractedText); // Debug log
            
            // Send extracted text to Gemini for processing
            if (extractedText && extractedText.trim()) {
                sendToRenderer('update-status', 'Sending to Gemini...');
                
                // Use the existing IPC handler to send text to Gemini
                try {
                    // Get the main process to send the text message
                    const { ipcMain } = require('electron');
                    
                    // Send the extracted text as a message to the active Gemini session
                    if (global.geminiSessionRef && global.geminiSessionRef.current) {
                        await global.geminiSessionRef.current.sendRealtimeInput({
                            text: `Screenshot OCR Result: ${extractedText}`
                        });
                        sendToRenderer('update-status', 'Text sent to Gemini successfully');
                    } else {
                        console.error('No active Gemini session found');
                        sendToRenderer('update-status', 'No active session');
                    }
                } catch (error) {
                    console.error('Error sending text to Gemini:', error);
                    sendToRenderer('update-status', 'Failed to send to Gemini');
                }
            } else {
                sendToRenderer('update-status', 'No text found in screenshot');
            }
            
            return { 
                success: true, 
                text: extractedText,
                imageBase64: base64
            };
        } catch (error) {
            console.error('Error capturing single screenshot:', error);
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('cleanup-ocr', async (event) => {
        try {
            await cleanupOCR();
            return { success: true };
        } catch (error) {
            console.error('Error cleaning up OCR:', error);
            return { success: false, error: error.message };
        }
    });
}

module.exports = {
    initializeOCR,
    cleanupOCR,
    captureScreen,
    performSimpleOCR,
    startScreenshotCapture,
    stopScreenshotCapture,
    setupScreenshotIpcHandlers
};
