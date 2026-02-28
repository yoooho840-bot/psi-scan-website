/**
 * BioScannerService
 * Handles WebRTC (Camera & Microphone) connections and pure client-side
 * processing of video frames and audio frequencies to generate real
 * biometric seed data for the 12-dimensional output.
 * No data is recorded or sent to any server. Everything happens in memory.
 */

export class BioScannerService {
    private videoStream: MediaStream | null = null;
    private audioStream: MediaStream | null = null;
    private audioContext: AudioContext | null = null;
    private analyserNode: AnalyserNode | null = null;
    private sourceNode: MediaStreamAudioSourceNode | null = null;

    private hiddenCanvas: HTMLCanvasElement;
    private canvasCtx: CanvasRenderingContext2D | null;

    // Accumulated data during scan
    private rppgData: number[] = []; // Red channel variance (approximates heart rate variation)
    private pitchData: number[] = []; // Dominant fundamental frequencies
    private volumeData: number[] = []; // Voice amplitude

    constructor() {
        this.hiddenCanvas = document.createElement('canvas');
        this.hiddenCanvas.width = 64; // Downscaled for performance
        this.hiddenCanvas.height = 64;
        this.canvasCtx = this.hiddenCanvas.getContext('2d', { willReadFrequently: true });
    }

    /**
     * Initializes both camera and microphone streams in a single request
     * to prevent double permission prompts.
     */
    public async startSensors(): Promise<MediaStream> {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
                audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: false }
            });

            this.videoStream = stream;
            this.audioStream = stream;

            this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            this.analyserNode = this.audioContext.createAnalyser();
            this.analyserNode.fftSize = 2048; // Higher resolution for vocal pitch detection
            this.analyserNode.smoothingTimeConstant = 0.8;

            this.sourceNode = this.audioContext.createMediaStreamSource(this.audioStream);
            this.sourceNode.connect(this.analyserNode);

            return stream;
        } catch (err) {
            console.error("Sensors access denied or failed:", err);
            throw err;
        }
    }

    /**
     * Extracts red, green, blue intensity from the current video frame.
     * Continuously calling this builds a pseudo-rPPG signal.
     */
    public analyzeVideoFrame(videoElement: HTMLVideoElement) {
        if (!this.canvasCtx || !videoElement.videoWidth) return;

        // Draw current frame to hidden, small canvas
        this.canvasCtx.drawImage(videoElement, 0, 0, this.hiddenCanvas.width, this.hiddenCanvas.height);

        try {
            const imageData = this.canvasCtx.getImageData(0, 0, this.hiddenCanvas.width, this.hiddenCanvas.height);
            const data = imageData.data;

            let rTotal = 0, gTotal = 0, bTotal = 0;
            const pixels = data.length / 4;

            for (let i = 0; i < data.length; i += 4) {
                rTotal += data[i];
                gTotal += data[i + 1];
                bTotal += data[i + 2];
            }

            const rAvg = rTotal / pixels;
            const gAvg = gTotal / pixels;

            // Using G/R ratio is a common crude rPPG approximation for pulse detection
            // In a real medical app, this is heavily filtered. We just need realistic variance.
            const ratio = gAvg === 0 ? 0 : rAvg / gAvg;
            this.rppgData.push(ratio);

            // Keep memory bounded
            if (this.rppgData.length > 500) this.rppgData.shift();

        } catch (e) {
            // Ignore potential cross-origin or canvas read errors in some strict environments
            console.warn("Failed to read video frame data", e);
        }
    }

    /**
     * Extracts volume and dominant frequency from the active microphone analyser
     */
    public analyzeAudioFrame() {
        if (!this.analyserNode || !this.audioContext) return { volume: 0, pitch: 0 };

        const bufferLength = this.analyserNode.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        this.analyserNode.getByteFrequencyData(dataArray);

        let sumVolume = 0;
        let maxVal = -1;
        let maxIndex = -1;

        for (let i = 0; i < bufferLength; i++) {
            sumVolume += dataArray[i];
            if (dataArray[i] > maxVal) {
                maxVal = dataArray[i];
                maxIndex = i;
            }
        }

        const avgVolume = sumVolume / bufferLength;
        // Approximation of frequency (bin * sampleRate / fftSize)
        const dominantFreq = maxIndex * (this.audioContext.sampleRate / this.analyserNode.fftSize);

        // Create 16-bin minimal array for UI
        const step = Math.floor(bufferLength / 16);
        const uiBars: number[] = [];
        for (let i = 0; i < 16; i++) {
            let sum = 0;
            for (let j = 0; j < step; j++) {
                sum += dataArray[i * step + j];
            }
            uiBars.push(sum / step);
        }

        if (avgVolume > 5) { // Only record if there's actual sound, not just silence
            this.volumeData.push(avgVolume);
            this.pitchData.push(dominantFreq);

            if (this.volumeData.length > 500) this.volumeData.shift();
            if (this.pitchData.length > 500) this.pitchData.shift();
        }

        return { volume: avgVolume, pitch: dominantFreq, uiBars };
    }

    /**
     * Computes the final "Bio-Seed" aggregates from collected data buffers
     */
    public extractBioSeeds(): { heartRateVariance: number, vocalTension: number, energyLevel: number } {
        // Compute standard deviation of rPPG (Heart Rate Variance proxy)
        let rppgVariance = 0.5; // Default middle value
        if (this.rppgData.length > 10) {
            const mean = this.rppgData.reduce((a, b) => a + b, 0) / this.rppgData.length;
            const variance = this.rppgData.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / this.rppgData.length;
            // Normalize roughly between 0.1 and 1.0 (Higher variance = more stress usually)
            rppgVariance = Math.min(Math.max(variance * 100, 0.1), 1.0);
        }

        // Compute vocal tension based on pitch jitter (std dev of pitch)
        let vocalTension = 0.5;
        if (this.pitchData.length > 5) {
            const meanPitch = this.pitchData.reduce((a, b) => a + b, 0) / this.pitchData.length;
            const pitchVar = this.pitchData.reduce((a, b) => a + Math.pow(b - meanPitch, 2), 0) / this.pitchData.length;
            // Normalize (higher jitter = higher tension)
            vocalTension = Math.min(Math.max((pitchVar / 10000), 0.1), 1.0);
        }

        // Compute overall energy level based on volume
        let energyLevel = 0.5;
        if (this.volumeData.length > 5) {
            const meanVol = this.volumeData.reduce((a, b) => a + b, 0) / this.volumeData.length;
            energyLevel = Math.min(Math.max(meanVol / 100, 0.1), 1.0);
        }

        return {
            heartRateVariance: rppgVariance || 0.5,
            vocalTension: vocalTension || 0.5,
            energyLevel: energyLevel || 0.5
        };
    }

    /**
     * Fully stops and releases all media tracks and contexts
     */
    public stopAll() {
        if (this.videoStream) {
            this.videoStream.getTracks().forEach(track => { track.stop(); });
            this.videoStream = null;
        }
        if (this.audioStream) {
            this.audioStream.getTracks().forEach(track => { track.stop(); });
            this.audioStream = null;
        }
        if (this.audioContext && this.audioContext.state !== 'closed') {
            this.audioContext.close().catch(console.error);
            this.audioContext = null;
        }

        this.rppgData = [];
        this.pitchData = [];
        this.volumeData = [];
    }
}
