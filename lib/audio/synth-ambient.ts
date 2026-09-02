import { audioManager } from './audio-context';

export interface AmbientTrackState {
  id: string;
  name: string;
  type: 'rain' | 'thunder' | 'wind' | 'night_crickets' | 'ocean' | 'city' | 'astral_drone' | 'vinyl';
  volume: number;
  enabled: boolean;
}

export const DEFAULT_AMBIENT_CHANNELS: AmbientTrackState[] = [
  { id: 'amb-rain', name: 'Rain Patter', type: 'rain', volume: 0.6, enabled: false },
  { id: 'amb-thunder', name: 'Distant Thunder', type: 'thunder', volume: 0.5, enabled: false },
  { id: 'amb-wind', name: 'Atmospheric Wind', type: 'wind', volume: 0.4, enabled: false },
  { id: 'amb-crickets', name: 'Night Crickets', type: 'night_crickets', volume: 0.4, enabled: false },
  { id: 'amb-ocean', name: 'Ocean Swell', type: 'ocean', volume: 0.5, enabled: false },
  { id: 'amb-city', name: 'City Ambience', type: 'city', volume: 0.35, enabled: false },
  { id: 'amb-astral', name: '432Hz Astral Drone', type: 'astral_drone', volume: 0.45, enabled: false },
  { id: 'amb-vinyl', name: 'Vinyl Texture', type: 'vinyl', volume: 0.3, enabled: false },
];

class ProceduralAmbientEngine {
  private activeNodes: Map<
    string,
    {
      gainNode: GainNode;
      sources: (AudioNode | number)[];
      cleanup: () => void;
    }
  > = new Map();

  private isRunning = false;

  private createPinkNoiseBuffer(ctx: AudioContext, seconds = 5): AudioBuffer {
    const bufferSize = ctx.sampleRate * seconds;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.969 * b2 + white * 0.153852;
      b3 = 0.8665 * b3 + white * 0.3104856;
      b4 = 0.55 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.016898;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }
    return buffer;
  }

  private createWhiteNoiseBuffer(ctx: AudioContext, seconds = 5): AudioBuffer {
    const bufferSize = ctx.sampleRate * seconds;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  public startChannel(channel: AmbientTrackState) {
    if (typeof window === 'undefined') return;
    const ctx = audioManager.getContext();
    const masterGain = audioManager.getAmbientGain();

    if (this.activeNodes.has(channel.id)) {
      this.updateVolume(channel.id, channel.volume, channel.enabled);
      return;
    }

    if (!channel.enabled) return;

    const channelGain = ctx.createGain();
    channelGain.gain.setValueAtTime(channel.volume, ctx.currentTime);
    channelGain.connect(masterGain);

    const cleanupFns: (() => void)[] = [];

    switch (channel.type) {
      case 'rain': {
        const noiseBuffer = this.createPinkNoiseBuffer(ctx, 4);
        const noiseSource = ctx.createBufferSource();
        noiseSource.buffer = noiseBuffer;
        noiseSource.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1200, ctx.currentTime);

        const highpass = ctx.createBiquadFilter();
        highpass.type = 'highpass';
        highpass.frequency.setValueAtTime(400, ctx.currentTime);

        noiseSource.connect(filter);
        filter.connect(highpass);
        highpass.connect(channelGain);

        noiseSource.start();
        cleanupFns.push(() => {
          try {
            noiseSource.stop();
            noiseSource.disconnect();
          } catch {}
        });
        break;
      }

      case 'thunder': {
        let timer: NodeJS.Timeout;
        const playThunderBurst = () => {
          if (!this.activeNodes.has(channel.id)) return;
          const thunderTime = ctx.currentTime;
          const noise = ctx.createBufferSource();
          noise.buffer = this.createPinkNoiseBuffer(ctx, 6);

          const filter = ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(150, thunderTime);

          const burstGain = ctx.createGain();
          burstGain.gain.setValueAtTime(0.001, thunderTime);
          burstGain.gain.linearRampToValueAtTime(0.8, thunderTime + 0.4);
          burstGain.gain.exponentialRampToValueAtTime(0.001, thunderTime + 4.5);

          noise.connect(filter);
          filter.connect(burstGain);
          burstGain.connect(channelGain);

          noise.start();
          noise.stop(thunderTime + 5);

          const nextDelay = 8000 + Math.random() * 14000;
          timer = setTimeout(playThunderBurst, nextDelay);
        };

        playThunderBurst();
        cleanupFns.push(() => clearTimeout(timer));
        break;
      }

      case 'wind': {
        const noiseBuffer = this.createWhiteNoiseBuffer(ctx, 6);
        const noiseSource = ctx.createBufferSource();
        noiseSource.buffer = noiseBuffer;
        noiseSource.loop = true;

        const bandpass = ctx.createBiquadFilter();
        bandpass.type = 'bandpass';
        bandpass.frequency.setValueAtTime(450, ctx.currentTime);
        bandpass.Q.setValueAtTime(3.0, ctx.currentTime);

        // LFO for slow gusting wind
        const lfo = ctx.createOscillator();
        lfo.frequency.setValueAtTime(0.12, ctx.currentTime);
        const lfoGain = ctx.createGain();
        lfoGain.gain.setValueAtTime(280, ctx.currentTime);

        lfo.connect(lfoGain);
        lfoGain.connect(bandpass.frequency);

        noiseSource.connect(bandpass);
        bandpass.connect(channelGain);

        noiseSource.start();
        lfo.start();

        cleanupFns.push(() => {
          try {
            noiseSource.stop();
            lfo.stop();
          } catch {}
        });
        break;
      }

      case 'night_crickets': {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(4600, ctx.currentTime);

        const chirpLfo = ctx.createOscillator();
        chirpLfo.type = 'square';
        chirpLfo.frequency.setValueAtTime(14, ctx.currentTime);

        const chirpGain = ctx.createGain();
        chirpGain.gain.setValueAtTime(0.2, ctx.currentTime);

        chirpLfo.connect(chirpGain.gain);
        osc.connect(chirpGain);
        chirpGain.connect(channelGain);

        osc.start();
        chirpLfo.start();

        cleanupFns.push(() => {
          try {
            osc.stop();
            chirpLfo.stop();
          } catch {}
        });
        break;
      }

      case 'ocean': {
        const noiseBuffer = this.createPinkNoiseBuffer(ctx, 6);
        const noiseSource = ctx.createBufferSource();
        noiseSource.buffer = noiseBuffer;
        noiseSource.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(350, ctx.currentTime);

        const lfo = ctx.createOscillator();
        lfo.frequency.setValueAtTime(0.08, ctx.currentTime); // 12-second wave period

        const lfoGain = ctx.createGain();
        lfoGain.gain.setValueAtTime(300, ctx.currentTime);
        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);

        noiseSource.connect(filter);
        filter.connect(channelGain);

        noiseSource.start();
        lfo.start();

        cleanupFns.push(() => {
          try {
            noiseSource.stop();
            lfo.stop();
          } catch {}
        });
        break;
      }

      case 'city': {
        const osc1 = ctx.createOscillator();
        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(60, ctx.currentTime);

        const osc2 = ctx.createOscillator();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(120, ctx.currentTime);

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(180, ctx.currentTime);

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(channelGain);

        osc1.start();
        osc2.start();

        cleanupFns.push(() => {
          try {
            osc1.stop();
            osc2.stop();
          } catch {}
        });
        break;
      }

      case 'astral_drone': {
        // 432Hz harmonic chord (A=432Hz, E=324Hz, C#=540Hz)
        const freqs = [216, 324, 432, 540];
        const oscs: OscillatorNode[] = [];

        freqs.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq + (idx % 2 === 0 ? 0.3 : -0.3), ctx.currentTime);
          osc.connect(channelGain);
          osc.start();
          oscs.push(osc);
        });

        cleanupFns.push(() => {
          oscs.forEach((o) => {
            try {
              o.stop();
            } catch {}
          });
        });
        break;
      }

      case 'vinyl': {
        const noiseBuffer = this.createWhiteNoiseBuffer(ctx, 3);
        const noiseSource = ctx.createBufferSource();
        noiseSource.buffer = noiseBuffer;
        noiseSource.loop = true;

        const hp = ctx.createBiquadFilter();
        hp.type = 'highpass';
        hp.frequency.setValueAtTime(3500, ctx.currentTime);

        noiseSource.connect(hp);
        hp.connect(channelGain);

        noiseSource.start();
        cleanupFns.push(() => {
          try {
            noiseSource.stop();
          } catch {}
        });
        break;
      }
    }

    this.activeNodes.set(channel.id, {
      gainNode: channelGain,
      sources: [],
      cleanup: () => {
        cleanupFns.forEach((fn) => fn());
        try {
          channelGain.disconnect();
        } catch {}
      },
    });
  }

  public stopChannel(channelId: string) {
    const node = this.activeNodes.get(channelId);
    if (node) {
      node.cleanup();
      this.activeNodes.delete(channelId);
    }
  }

  public updateVolume(channelId: string, volume: number, enabled: boolean) {
    if (!enabled) {
      this.stopChannel(channelId);
      return;
    }

    const node = this.activeNodes.get(channelId);
    if (node && audioManager) {
      const ctx = audioManager.getContext();
      node.gainNode.gain.setTargetAtTime(Math.max(0, Math.min(1, volume)), ctx.currentTime, 0.05);
    }
  }

  public syncAllChannels(channels: AmbientTrackState[]) {
    channels.forEach((ch) => {
      if (ch.enabled && !this.activeNodes.has(ch.id)) {
        this.startChannel(ch);
      } else if (!ch.enabled && this.activeNodes.has(ch.id)) {
        this.stopChannel(ch.id);
      } else if (ch.enabled && this.activeNodes.has(ch.id)) {
        this.updateVolume(ch.id, ch.volume, ch.enabled);
      }
    });
  }

  public stopAll() {
    this.activeNodes.forEach((node) => node.cleanup());
    this.activeNodes.clear();
  }
}

export const ambientEngine = new ProceduralAmbientEngine();
