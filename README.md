# Cheatoss
A real-time AI assistant that provides contextual help during video calls, interviews, presentations, and meetings using screen capture and audio analysis.

## Features

- **Live AI Assistance**: Real-time help powered by Google Gemini 2.0 Flash Live
- **Screen & Audio Capture**: Analyzes what you see and hear for contextual responses
- **OCR Screenshot Capture**: Select any screen area for real-time text extraction and AI analysis
- **Multiple Session Types**: Audio session for live conversation, OCR session for screenshot-based analysis
- **Multiple Profiles**: Interview, Sales Call, Business Meeting, Presentation, Negotiation
- **Transparent Overlay**: Always-on-top window that can be positioned anywhere
- **Click-through Mode**: Make window transparent to clicks when needed
- **Cross-platform**: Works on macOS, Windows, and Linux (experimental)

## Setup

1. **Get a Gemini API Key**: Visit [Google AI Studio](https://aistudio.google.com/apikey)
2. **Install Dependencies**: `npm install`
3. **Run the App**: `npm start`

## Usage

### Audio Sessions
1. Enter your Gemini API key in the main window
2. Choose your profile and language in settings
3. Select "🎤 Audio Session" and click "Start Session"
4. The AI will provide real-time assistance based on your screen and audio

### OCR Screenshot Sessions
1. Enter your Gemini API key in the main window
2. Select "📸 Screenshot OCR" and click "Start Session"
3. Click "📸 CAPTURE SCREENSHOT" to open the selection tool
4. Click and drag to select any area on your screen
5. The OCR extracts text and sends it to Gemini for analysis
6. Get contextual AI responses based on the captured content

### Window Controls
- Position the window using keyboard shortcuts
- Use click-through mode when needed

## Keyboard Shortcuts

- **Window Movement**: `Ctrl/Cmd + Arrow Keys` - Move window
- **Click-through**: `Ctrl/Cmd + M` - Toggle mouse events
- **Close/Back**: `Ctrl/Cmd + \` - Close window or go back
- **Send Message**: `Enter` - Send text to AI

## OCR Features

- **Region Selection**: Capture specific areas instead of full screen
- **Real-time Text Extraction**: Uses Tesseract.js for accurate OCR
- **Contextual AI Analysis**: Extracted text is sent to Gemini for relevant responses
- **Visual Feedback**: Red selection border shows capture area
- **Cancel Option**: Press ESC to cancel selection

## Audio Capture

- **macOS**: SystemAudioDump for system audio capture
- **Windows**: Loopback audio capture
- **Linux**: Microphone input

## Requirements

- Electron-compatible OS (macOS, Windows, Linux)
- Gemini API key
- Screen recording permissions
- Microphone/audio permissions
- Tesseract.js (automatically installed for OCR)

## Technical Stack

- **Framework**: Electron
- **AI Engine**: Google Gemini 2.0 Flash Live API
- **OCR**: Tesseract.js for text extraction
- **Image Processing**: Jimp for screenshot optimization
- **UI**: LitElement components with shadcn/ui styling
