
import { useAudioStore } from '../stores/audioStore';

class AudioController {
  private audio: HTMLAudioElement | null = null;
  private currentBriefingId: string | null = null;
  private currentHash: string | null = null;
  private isClearing: boolean = false;
  private mediaSource: MediaElementAudioSourceNode | null = null;
  private gainNode: GainNode | null = null;

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
        this.applyFadeIn();
      });
      this.audio.addEventListener('pause', () => {
        if (!this.isClearing && useAudioStore.getState().status === 'playing') {
          useAudioStore.getState().setStatus('paused');
        }
      });
      this.audio.addEventListener('error', () => {
        if (this.isClearing) return;
        this.stop();
      });

      // Route through global mastering chain if possible
      try {
        const { ctx, nodes } = (window as any).getMasterChain?.() || {};
        if (ctx && nodes) {
          this.mediaSource = ctx.createMediaElementSource(this.audio);
          this.gainNode = ctx.createGain();
          this.mediaSource.connect(this.gainNode);
          this.gainNode.connect(nodes.gain);
        }
      } catch (e) {
        // Fallback to direct output
      }
    }
    return this.audio;
  }

  private applyFadeIn() {
    try {
      const { ctx } = (window as any).getMasterChain?.() || {};
      if (ctx && this.gainNode) {
        const now = ctx.currentTime;
        this.gainNode.gain.setValueAtTime(0, now);
        this.gainNode.gain.linearRampToValueAtTime(1.0, now + 0.040);
      }
    } catch (e) {}
  }

  loadAndPlay(url: string, briefingId: string, contentHash: string) {
    if (!url) {
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
      if (err.name !== 'AbortError') this.stop();
    });
    useAudioStore.getState().setAudio(url, briefingId);
  }

  play(url?: string, briefingId?: string, contentHash?: string) {
    if (url && briefingId) {
      this.loadAndPlay(url, briefingId, contentHash || '');
      return;
    }
    this.audio?.play().catch(() => useAudioStore.getState().reset());
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
      this.audio.removeAttribute('src');
      this.audio.load();
    }
    this.currentBriefingId = null;
    this.currentHash = null;
    useAudioStore.getState().reset();
  }

  seek(time: number) {
    if (this.audio) this.audio.currentTime = time;
  }
}

export const audioController = new AudioController();
