// Web Worker for parallel audio processing
const SAMPLE_RATE = 24000;
const BYTES_PER_SAMPLE = 2;

// Convert Float32Array to Int16Array
function convertFloat32ToInt16(float32Array) {
    const int16Array = new Int16Array(float32Array.length);
    for (let i = 0; i < float32Array.length; i++) {
        const sample = Math.max(-1, Math.min(1, float32Array[i]));
        int16Array[i] = sample * 0x7FFF;
    }
    return int16Array;
}

// Convert ArrayBuffer to Base64
function arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

// Simple audio compression (reduce dynamic range)
function compressAudio(int16Array, ratio = 0.8) {
    const compressed = new Int16Array(int16Array.length);
    for (let i = 0; i < int16Array.length; i++) {
        const sample = int16Array[i];
        const sign = sample < 0 ? -1 : 1;
        const absSample = Math.abs(sample);
        const compressedSample = sign * Math.pow(absSample / 32768, ratio) * 32768;
        compressed[i] = Math.max(-32768, Math.min(32767, compressedSample));
    }
    return compressed;
}

// Process audio chunk
self.onmessage = function(e) {
    const { audioChunk, chunkId, enableCompression = true } = e.data;
    
    try {
        // Convert Float32 to Int16
        const pcmData16 = convertFloat32ToInt16(audioChunk);
        
        // Apply compression if enabled
        const processedData = enableCompression ? compressAudio(pcmData16) : pcmData16;
        
        // Convert to Base64
        const base64Data = arrayBufferToBase64(processedData.buffer);
        
        // Send back to main thread
        self.postMessage({
            success: true,
            chunkId,
            base64Data,
            originalSize: audioChunk.length * 4, // Float32 = 4 bytes
            compressedSize: processedData.length * 2, // Int16 = 2 bytes
            compressionRatio: enableCompression ? (processedData.length * 2) / (audioChunk.length * 4) : 1
        });
    } catch (error) {
        self.postMessage({
            success: false,
            chunkId,
            error: error.message
        });
    }
};
