
// AudioManager.ts
// One global audio engine for the entire app

class AudioManager {
  private ctx: AudioContext | null = null;
  private currentSource: AudioBufferSourceNode | null = null;
  private unlocked = false;

  // Comfort Noise Layer (Room Ambience)
  private comfortNode: AudioBufferSourceNode | null = null;
  private comfortGain: GainNode | null = null;

  /**
   * MUST be called from a user gesture (mic tap, screen tap)
   * This initializes the singleton AudioContext and resumes it.
   */
  async unlock() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 48000 });
      this.createComfortNoise();
    }

    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }

    this.unlocked = true;
    console.debug('[AudioManager] unlocked', this.ctx.state);
  }

  /**
   * Generates a subtle pink-ish noise floor to mask digital silence.
   */
  private createComfortNoise() {
    if (!this.ctx) return;
    
    // Generate 2 seconds of noise
    const bufferSize = 2 * this.ctx.sampleRate;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    // Simple low-pass filtered white noise for "air" feeling
    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      // Filter coefficient for subtle room hiss
      lastOut = (white + (0.95 * lastOut)) / 1.95;
      data[i] = lastOut * 0.0015; // Extremely subtle (-56dB range)
    }

    this.comfortNode = this.ctx.createBufferSource();
    this.comfortNode.buffer = buffer;
    this.comfortNode.loop = true;
    
    this.comfortGain = this.ctx.createGain();
    this.comfortGain.gain.value = 0.5; // Final volume control
    
    this.comfortNode.connect(this.comfortGain);
    this.comfortGain.connect(this.ctx.destination);
    
    this.comfortNode.start();
  }

  get isUnlocked() {
    return this.unlocked && this.ctx?.state === 'running';
  }

  get context() {
    return this.ctx;
  }

  /**
   * Returns true if AI speech is currently playing.
   */
  get isPlaying() {
    return !!this.currentSource;
  }

  /**
   * Immediately stop AI speech (barge-in trigger)
   */
  stop() {
    if (this.currentSource) {
      try {
        this.currentSource.stop();
      } catch (e) {
        // Source might have already ended
      }
      this.currentSource.disconnect();
      this.currentSource = null;
    }
  }

  /**
   * Plays raw PCM data (Base64 encoded) returned by Gemini TTS.
   * This bypasses the need for <audio> elements and allows for sample-accurate interruption.
   */
  async playPCM(base64: string, sampleRate: number = 24000) {
    if (!this.ctx) throw new Error('AudioContext not initialized');
    if (!this.unlocked) await this.unlock();

    // Kill existing speech for new turn or barge-in
    this.stop();

    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    
    // Gemini returns 16-bit PCM
    const pcmData = new Int16Array(bytes.buffer);
    const buffer = this.ctx.createBuffer(1, pcmData.length, sampleRate);
    const channelData = buffer.getChannelData(0);
    
    // Normalize PCM to [-1.0, 1.0]
    for (let i = 0; i < pcmData.length; i++) {
      channelData[i] = pcmData[i] / 32768.0;
    }

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(this.ctx.destination);
    this.currentSource = source;

    return new Promise((resolve) => {
      source.onended = () => {
        if (this.currentSource === source) {
          this.currentSource.disconnect();
          this.currentSource = null;
        }
        resolve(true);
      };
      source.start(0);
    });
  }
}

export const audioManager = new AudioManager();
