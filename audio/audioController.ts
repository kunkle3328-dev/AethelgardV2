
import { useAudioStore } from './audioStore';

class AudioController {
  private audio: HTMLAudioElement | null = null;
  private currentBriefingId: string | null = null;
  private currentHash: string | null = null;
  private isClearing: boolean = false;

  private initAudio() {
    if (!this.audio) {
      this.audio = new Audio();
      this.audio.addEventListener('timeupdate', () => {
        if (this.audio && !this.isClearing) {
          useAudioStore.getState().setProgress(this.audio.currentTime, this.audio.duration);
        }
      });
      this.audio.addEventListener('ended', () => {
        if (!this.isClearing) useAudioStore.getState().reset();
      });
      this.audio.addEventListener('play', () => {
        if (!this.isClearing) useAudioStore.getState().setStatus('playing');
      });
      this.audio.addEventListener('pause', () => {
        if (!this.isClearing && useAudioStore.getState().status === 'playing') {
          useAudioStore.getState().setStatus('paused');
        }
      });
      this.audio.addEventListener('error', () => {
        if (this.isClearing) return;
        const err = this.audio?.error;
        console.error("Audio element error detected:", err ? `Code ${err.code}: ${err.message}` : "Unknown Error");
        this.stop();
      });
    }
    return this.audio;
  }

  loadAndPlay(url: string, briefingId: string, contentHash: string) {
    if (!url) {
      console.warn("Attempted to play empty audio URL.");
      useAudioStore.getState().reset();
      return;
    }

    const audio = this.initAudio();
    this.isClearing = false;
    
    if (this.currentHash === contentHash && audio.src === url) {
      this.play();
      return;
    }

    this.stop();
    this.isClearing = false;
    this.currentBriefingId = briefingId;
    this.currentHash = contentHash;
    audio.src = url;
    audio.load(); 
    audio.play().catch(err => {
      if (err.name !== 'AbortError') {
        console.error("Playback start failed:", err);
        this.stop();
      }
    });
    useAudioStore.getState().setAudio(url, briefingId);
  }

  play(url?: string, briefingId?: string, contentHash?: string) {
    if (url && briefingId) {
      this.loadAndPlay(url, briefingId, contentHash || '');
      return;
    }
    this.audio?.play().catch(err => {
      if (err.name !== 'AbortError') {
        console.error("Play failed:", err);
        useAudioStore.getState().reset();
      }
    });
  }

  pause() {
    this.audio?.pause();
  }

  resume() {
    this.play();
  }

  stop() {
    this.isClearing = true;
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
      if (this.audio.src.startsWith('blob:')) {
        URL.revokeObjectURL(this.audio.src);
      }
      // Properly clear source without triggering MEDIA_ELEMENT_ERROR by not setting it to null or empty string
      // while listeners are still active. Instead, we remove the attribute.
      this.audio.removeAttribute('src');
      this.audio.load();
    }
    this.currentBriefingId = null;
    this.currentHash = null;
    useAudioStore.getState().reset();
  }

  seek(time: number) {
    if (this.audio) {
      this.audio.currentTime = time;
    }
  }

  getCurrentBriefingId() {
    return this.currentBriefingId;
  }
}

export const audioController = new AudioController();
