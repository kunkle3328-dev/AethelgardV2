
import { audioManager } from './audioManager';

type VADCallbacks = {
  onSpeechStart: () => void;
  onSpeechEnd: () => void;
  onAudioFrame: (pcm: Float32Array, rms: number) => void;
};

class VADManager {
  private ctx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private micSource: MediaStreamAudioSourceNode | null = null;
  private processor: ScriptProcessorNode | null = null;
  private stream: MediaStream | null = null;

  private speaking = false;
  private silenceFrames = 0;
  private speechFrames = 0;

  // --- VAD CALIBRATION PARAMETERS ---
  private noiseFloor = 0.003;
  private NOISE_FLOOR_SMOOTHING = 0.995;
  private SPEECH_BOOST = 3.5;       // Threshold multiplier above noise floor
  private SPEECH_CONFIRM_FRAMES = 6; // ~120ms of sustained energy to trigger "speech"
  private ECHO_IMMUNITY_FACTOR = 1.8; // Desensitize VAD while AI is speaking
  private SILENCE_FRAMES_END = 25;    // ~500ms of silence to trigger turn end
  private FRAME_SIZE = 2048;

  async start(callbacks: VADCallbacks) {
    // Ensure the main audio context is unlocked via gesture
    await audioManager.unlock();
    
    this.ctx = audioManager.context!;

    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      }
    });

    this.micSource = this.ctx.createMediaStreamSource(this.stream);
    this.analyser = this.ctx.createAnalyser();
    this.processor = this.ctx.createScriptProcessor(this.FRAME_SIZE, 1, 1);

    this.analyser.fftSize = 2048;

    this.micSource.connect(this.analyser);
    this.analyser.connect(this.processor);
    this.processor.connect(this.ctx.destination);

    const buffer = new Float32Array(this.FRAME_SIZE);

    this.processor.onaudioprocess = () => {
      if (!this.analyser) return;
      this.analyser.getFloatTimeDomainData(buffer);

      // RMS volume calculation
      let sum = 0;
      for (let i = 0; i < buffer.length; i++) {
        sum += buffer[i] * buffer[i];
      }
      const rms = Math.sqrt(sum / buffer.length);

      // 1. Dynamic Noise Floor Calibration
      if (!this.speaking) {
        this.noiseFloor = (this.noiseFloor * this.NOISE_FLOOR_SMOOTHING) + (rms * (1 - this.NOISE_FLOOR_SMOOTHING));
      }

      // 2. AI Playback Echo Immunity Gate
      const baseThreshold = this.noiseFloor * this.SPEECH_BOOST;
      const dynamicThreshold = audioManager.isPlaying 
        ? baseThreshold * this.ECHO_IMMUNITY_FACTOR 
        : baseThreshold;

      if (rms > dynamicThreshold) {
        this.speechFrames++;
        
        // 3. Speech Confirmation Window (Filters noise clicks)
        if (!this.speaking && this.speechFrames >= this.SPEECH_CONFIRM_FRAMES) {
          this.speaking = true;
          callbacks.onSpeechStart();
        }

        if (this.speaking) {
          callbacks.onAudioFrame(new Float32Array(buffer), rms);
        }
        this.silenceFrames = 0;
      } else {
        this.speechFrames = 0;
        
        if (this.speaking) {
          this.silenceFrames++;
          if (this.silenceFrames > this.SILENCE_FRAMES_END) {
            this.speaking = false;
            this.silenceFrames = 0;
            callbacks.onSpeechEnd();
          }
        }
      }
    };
  }

  stop() {
    this.processor?.disconnect();
    this.analyser?.disconnect();
    this.micSource?.disconnect();
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    this.speaking = false;
    this.silenceFrames = 0;
    this.speechFrames = 0;
  }
}

export const vadManager = new VADManager();
