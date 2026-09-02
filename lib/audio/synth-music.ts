import { audioManager } from './audio-context';

export interface SynthSongDefinition {
  id: string;
  title: string;
  bpm: number;
  scale: number[]; // Frequencies for notes
  chords: number[][]; // Frequencies for chord progression
  bassline: number[];
  style: 'lofi' | 'ambient' | 'cyber' | 'piano';
}

const SONG_DEFINITIONS: Record<string, SynthSongDefinition> = {
  'song-midnight-rain': {
    id: 'song-midnight-rain',
    title: 'Midnight Reverie',
    bpm: 72,
    scale: [261.63, 293.66, 329.63, 392.0, 440.0, 523.25], // C Major pentatonic
    chords: [
      [174.61, 220.0, 261.63, 329.63], // Fmaj7
      [196.0, 246.94, 293.66, 392.0], // G7
      [220.0, 261.63, 329.63, 440.0], // Am7
      [174.61, 220.0, 261.63, 329.63], // Fmaj7
    ],
    bassline: [87.31, 98.0, 110.0, 87.31],
    style: 'lofi',
  },
  'song-golden-hour': {
    id: 'song-golden-hour',
    title: 'Amber Horizon',
    bpm: 64,
    scale: [293.66, 369.99, 440.0, 554.37, 587.33], // D major warm
    chords: [
      [146.83, 220.0, 293.66, 369.99], // D
      [164.81, 246.94, 329.63, 392.0], // Em
      [196.0, 293.66, 392.0, 493.88], // G
      [220.0, 277.18, 329.63, 440.0], // A
    ],
    bassline: [73.42, 82.41, 98.0, 110.0],
    style: 'ambient',
  },
  'song-cyber-drift': {
    id: 'song-cyber-drift',
    title: 'Neon Veins',
    bpm: 90,
    scale: [220.0, 246.94, 261.63, 293.66, 329.63, 392.0], // A minor synth
    chords: [
      [110.0, 164.81, 220.0, 261.63], // Am
      [130.81, 196.0, 261.63, 329.63], // C
      [146.83, 220.0, 293.66, 349.23], // Dm
      [123.47, 185.0, 246.94, 311.13], // Bdim
    ],
    bassline: [55.0, 65.41, 73.42, 61.74],
    style: 'cyber',
  },
  'song-astral-whisper': {
    id: 'song-astral-whisper',
    title: 'Cosmic Lullaby',
    bpm: 50,
    scale: [216.0, 270.0, 324.0, 432.0, 540.0], // 432Hz tuning
    chords: [
      [108.0, 216.0, 324.0, 432.0],
      [144.0, 216.0, 288.0, 432.0],
      [162.0, 243.0, 324.0, 486.0],
      [108.0, 216.0, 324.0, 432.0],
    ],
    bassline: [54.0, 72.0, 81.0, 54.0],
    style: 'ambient',
  },
  'song-misty-dawn': {
    id: 'song-misty-dawn',
    title: 'Sylvan Awakening',
    bpm: 58,
    scale: [261.63, 329.63, 392.0, 493.88, 523.25, 659.25], // Cmaj7 piano
    chords: [
      [130.81, 196.0, 261.63, 329.63],
      [174.61, 261.63, 329.63, 392.0],
      [146.83, 220.0, 293.66, 349.23],
      [196.0, 293.66, 392.0, 493.88],
    ],
    bassline: [65.41, 87.31, 73.42, 98.0],
    style: 'piano',
  },
  'song-thunder-pulse': {
    id: 'song-thunder-pulse',
    title: 'Stormborn Drift',
    bpm: 80,
    scale: [174.61, 207.65, 233.08, 261.63, 311.13, 349.23], // F minor
    chords: [
      [87.31, 130.81, 174.61, 207.65],
      [103.83, 155.56, 207.65, 246.94],
      [116.54, 174.61, 233.08, 277.18],
      [87.31, 130.81, 174.61, 207.65],
    ],
    bassline: [43.65, 51.91, 58.27, 43.65],
    style: 'cyber',
  },
  'song-snowfall-calm': {
    id: 'song-snowfall-calm',
    title: 'Winter Solitude',
    bpm: 54,
    scale: [329.63, 392.0, 493.88, 587.33, 659.25, 783.99], // E minor pentatonic celesta
    chords: [
      [164.81, 246.94, 329.63, 392.0],
      [130.81, 196.0, 261.63, 329.63],
      [146.83, 220.0, 293.66, 369.99],
      [164.81, 246.94, 329.63, 392.0],
    ],
    bassline: [82.41, 65.41, 73.42, 82.41],
    style: 'ambient',
  },
};

class ProceduralMusicSynthesizer {
  private isPlaying = false;
  private currentSongId = '';
  private timer: NodeJS.Timeout | null = null;
  private step = 0;
  private masterGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private startTime = 0;
  private pausedTime = 0;

  public play(songId: string, offset = 0) {
    if (typeof window === 'undefined') return;
    this.stop();

    const song = SONG_DEFINITIONS[songId] || SONG_DEFINITIONS['song-midnight-rain'];
    this.currentSongId = song.id;
    this.isPlaying = true;
    this.startTime = Date.now() - offset * 1000;
    this.pausedTime = 0;

    const ctx = audioManager.getContext();
    this.analyser = audioManager.getAnalyser();

    this.masterGain = ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.55, ctx.currentTime);
    this.masterGain.connect(this.analyser);

    const beatInterval = (60 / song.bpm) * 1000; // 1 beat
    this.step = Math.floor((offset * 1000) / (beatInterval / 2));

    const tick = () => {
      if (!this.isPlaying) return;
      this.playStep(song);
      this.step++;
      this.timer = setTimeout(tick, beatInterval / 2); // 8th note resolution
    };

    tick();
  }

  private playStep(song: SynthSongDefinition) {
    if (!this.masterGain || typeof window === 'undefined') return;
    const ctx = audioManager.getContext();
    const chordIndex = Math.floor(this.step / 8) % song.chords.length;
    const currentChord = song.chords[chordIndex];
    const currentBass = song.bassline[chordIndex];

    // Play pad / chord on bar start (every 8 steps)
    if (this.step % 8 === 0) {
      currentChord.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const chordGain = ctx.createGain();
        osc.type = song.style === 'cyber' ? 'sawtooth' : 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(song.style === 'lofi' ? 800 : 1200, ctx.currentTime);

        const noteTime = ctx.currentTime;
        const dur = (60 / song.bpm) * 4; // 1 bar duration
        chordGain.gain.setValueAtTime(0.001, noteTime);
        chordGain.gain.linearRampToValueAtTime(0.08 / (i + 1), noteTime + 0.3);
        chordGain.gain.exponentialRampToValueAtTime(0.001, noteTime + dur);

        osc.connect(filter);
        filter.connect(chordGain);
        chordGain.connect(this.masterGain!);

        osc.start(noteTime);
        osc.stop(noteTime + dur);
      });

      // Play bass
      const bassOsc = ctx.createOscillator();
      const bassGain = ctx.createGain();
      bassOsc.type = 'triangle';
      bassOsc.frequency.setValueAtTime(currentBass, ctx.currentTime);

      const bassFilter = ctx.createBiquadFilter();
      bassFilter.type = 'lowpass';
      bassFilter.frequency.setValueAtTime(160, ctx.currentTime);

      const noteTime = ctx.currentTime;
      bassGain.gain.setValueAtTime(0.001, noteTime);
      bassGain.gain.linearRampToValueAtTime(0.2, noteTime + 0.1);
      bassGain.gain.exponentialRampToValueAtTime(0.001, noteTime + (60 / song.bpm) * 3);

      bassOsc.connect(bassFilter);
      bassFilter.connect(bassGain);
      bassGain.connect(this.masterGain);

      bassOsc.start(noteTime);
      bassOsc.stop(noteTime + (60 / song.bpm) * 3.5);
    }

    // Play melody note occasionally (steps 0, 2, 3, 5, 6 with chance)
    if (this.step % 2 === 0 && Math.random() > 0.3) {
      const melodyFreq = song.scale[Math.floor(Math.random() * song.scale.length)];
      const melOsc = ctx.createOscillator();
      const melGain = ctx.createGain();
      melOsc.type = song.style === 'piano' ? 'triangle' : 'sine';
      melOsc.frequency.setValueAtTime(melodyFreq, ctx.currentTime);

      const melFilter = ctx.createBiquadFilter();
      melFilter.type = 'lowpass';
      melFilter.frequency.setValueAtTime(1800, ctx.currentTime);

      const noteTime = ctx.currentTime;
      melGain.gain.setValueAtTime(0.001, noteTime);
      melGain.gain.linearRampToValueAtTime(0.09, noteTime + 0.04);
      melGain.gain.exponentialRampToValueAtTime(0.001, noteTime + 1.2);

      melOsc.connect(melFilter);
      melFilter.connect(melGain);
      melGain.connect(this.masterGain);

      melOsc.start(noteTime);
      melOsc.stop(noteTime + 1.3);
    }

    // Lofi rim / soft kick pulse
    if (song.style === 'lofi' && (this.step % 4 === 0 || this.step % 8 === 6)) {
      const kickOsc = ctx.createOscillator();
      const kickGain = ctx.createGain();
      kickOsc.frequency.setValueAtTime(90, ctx.currentTime);
      kickOsc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.12);

      kickGain.gain.setValueAtTime(0.15, ctx.currentTime);
      kickGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

      kickOsc.connect(kickGain);
      kickGain.connect(this.masterGain);

      kickOsc.start(ctx.currentTime);
      kickOsc.stop(ctx.currentTime + 0.15);
    }
  }

  public pause() {
    if (this.isPlaying) {
      this.isPlaying = false;
      if (this.timer) clearTimeout(this.timer);
      this.pausedTime = (Date.now() - this.startTime) / 1000;
    }
  }

  public resume() {
    if (!this.isPlaying && this.currentSongId) {
      this.play(this.currentSongId, this.pausedTime);
    }
  }

  public stop() {
    this.isPlaying = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    if (this.masterGain) {
      try {
        this.masterGain.disconnect();
      } catch {}
      this.masterGain = null;
    }
    this.step = 0;
    this.pausedTime = 0;
  }

  public setVolume(vol: number) {
    if (this.masterGain && typeof window !== 'undefined') {
      const ctx = audioManager.getContext();
      this.masterGain.gain.setTargetAtTime(Math.max(0, Math.min(1, vol)), ctx.currentTime, 0.05);
    }
  }

  public getCurrentTime(): number {
    if (!this.isPlaying) return this.pausedTime;
    return (Date.now() - this.startTime) / 1000;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }
}

export const synthMusicPlayer = new ProceduralMusicSynthesizer();
