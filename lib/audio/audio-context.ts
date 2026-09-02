class AudioManager {
  private ctx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private musicSource: MediaElementAudioSourceNode | null = null;
  private musicGain: GainNode | null = null;
  private ambientGain: GainNode | null = null;
  private connectedElement: HTMLAudioElement | null = null;

  public getContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public getAnalyser(): AnalyserNode {
    const ctx = this.getContext();
    if (!this.analyser) {
      this.analyser = ctx.createAnalyser();
      this.analyser.fftSize = 128;
      this.analyser.smoothingTimeConstant = 0.8;
    }
    return this.analyser;
  }

  public getAmbientGain(): GainNode {
    const ctx = this.getContext();
    if (!this.ambientGain) {
      this.ambientGain = ctx.createGain();
      this.ambientGain.gain.setValueAtTime(0.7, ctx.currentTime);
      this.ambientGain.connect(ctx.destination);
    }
    return this.ambientGain;
  }

  public connectMediaElement(element: HTMLAudioElement): AnalyserNode {
    const ctx = this.getContext();
    const analyser = this.getAnalyser();

    if (this.connectedElement === element && this.musicSource) {
      return analyser;
    }

    try {
      if (!this.musicGain) {
        this.musicGain = ctx.createGain();
        this.musicGain.gain.setValueAtTime(1.0, ctx.currentTime);
      }

      this.musicSource = ctx.createMediaElementSource(element);
      this.musicSource.connect(this.musicGain);
      this.musicGain.connect(analyser);
      analyser.connect(ctx.destination);
      this.connectedElement = element;
    } catch {
      // Element might already be connected
    }

    return analyser;
  }

  public setMusicGain(val: number) {
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setTargetAtTime(Math.max(0, Math.min(1, val)), this.ctx.currentTime, 0.05);
    }
  }

  public setAmbientMasterGain(val: number) {
    if (this.ambientGain && this.ctx) {
      this.ambientGain.gain.setTargetAtTime(Math.max(0, Math.min(1, val)), this.ctx.currentTime, 0.05);
    }
  }
}

export const audioManager = typeof window !== 'undefined' ? new AudioManager() : (null as unknown as AudioManager);
