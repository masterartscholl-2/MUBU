/**
 * Robust Audio Engine with HTML5 Audio and Web Audio fallback synth.
 * Guarantees instant stop/pause, accurate seeking, and seamless playback.
 */

class AudioEngine {
  private audio: HTMLAudioElement | null = null;
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private gainNode: GainNode | null = null;

  private isPlaying: boolean = false;
  private isExplicitlyPaused: boolean = false;
  private activeMode: 'html5' | 'synth' = 'html5';

  // Synth state
  private isSynthesizing: boolean = false;
  private synthInterval: number | null = null;
  private synthSecondsElapsed: number = 0;
  private synthTotalDuration: number = 180;
  private synthPreset: string = 'chill';
  private synthBpm: number = 110;
  private activeOscillators: OscillatorNode[] = [];

  // Callbacks
  private onTimeUpdateCallback?: (curr: number, dur: number) => void;
  private onEndedCallback?: () => void;

  private volume: number = 0.8;
  private isMuted: boolean = false;

  constructor() {
    // Initialized on user interaction in browser
  }

  private initAudioContext() {
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
        this.analyser = this.audioCtx.createAnalyser();
        this.analyser.fftSize = 64;
        this.gainNode = this.audioCtx.createGain();
        this.gainNode.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.audioCtx.currentTime);
        this.gainNode.connect(this.audioCtx.destination);
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  public unlock() {
    try {
      this.initAudioContext();
      if (!this.audio) {
        this.audio = new Audio();
      }
    } catch {
      // Ignore unlock failures outside gesture context
    }
  }

  public play(
    url: string,
    preset: string = 'chill',
    bpm: number = 110,
    onTimeUpdate?: (curr: number, dur: number) => void,
    onEnded?: () => void,
    onError?: () => void
  ) {
    this.stop();
    this.isExplicitlyPaused = false;
    this.isPlaying = true;
    this.synthPreset = preset || 'chill';
    this.synthBpm = bpm || 110;
    this.synthSecondsElapsed = 0;
    this.onTimeUpdateCallback = onTimeUpdate;
    this.onEndedCallback = onEnded;

    const isSyntheticOrEmpty = !url || url.startsWith('synth:') || url.length < 5;

    if (!isSyntheticOrEmpty) {
      this.activeMode = 'html5';
      if (!this.audio) {
        this.audio = new Audio();
      }
      // Do NOT set crossOrigin = 'anonymous' to avoid CORS rejections on standard media servers
      this.audio.src = url;
      this.audio.volume = this.isMuted ? 0 : this.volume;

      this.audio.ontimeupdate = () => {
        if (this.audio && this.onTimeUpdateCallback && this.activeMode === 'html5') {
          const dur = (!isNaN(this.audio.duration) && isFinite(this.audio.duration) && this.audio.duration > 0)
            ? this.audio.duration
            : 180;
          this.onTimeUpdateCallback(this.audio.currentTime, dur);
        }
      };

      this.audio.onended = () => {
        if (this.onEndedCallback) {
          this.onEndedCallback();
        }
      };

      this.audio.onerror = () => {
        // If user stopped or paused, do NOT start synth
        if (this.isExplicitlyPaused || !this.isPlaying) return;
        console.warn('Audio URL failed or unplayable, using ambient generator:', url);
        this.startSynth(preset, bpm);
        if (onError) onError();
      };

      const playPromise = this.audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          // If interrupted by pause() or stopped, do NOT trigger synth!
          if (this.isExplicitlyPaused || !this.isPlaying) return;
          console.warn('Playback error or autoplay blocked, using fallback generator:', err);
          this.startSynth(preset, bpm);
        });
      }
    } else {
      this.startSynth(preset, bpm);
    }
  }

  private startSynth(preset: string, bpm: number) {
    if (this.isExplicitlyPaused || !this.isPlaying) return;

    this.activeMode = 'synth';
    this.isSynthesizing = true;
    this.initAudioContext();
    if (!this.audioCtx || !this.gainNode) return;

    // Clear previous interval if any
    if (this.synthInterval) {
      clearInterval(this.synthInterval);
      this.synthInterval = null;
    }

    // Set gain back to current volume
    this.gainNode.gain.cancelScheduledValues(this.audioCtx.currentTime);
    this.gainNode.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.audioCtx.currentTime);

    const chordScales: Record<string, number[][]> = {
      ambient: [
        [220, 277.18, 329.63, 440],
        [196, 246.94, 293.66, 392],
        [174.61, 220, 261.63, 349.23],
        [164.81, 207.65, 246.94, 329.63],
      ],
      chill: [
        [261.63, 329.63, 392.0, 493.88],
        [220.0, 261.63, 329.63, 392.0],
        [174.61, 220.0, 261.63, 329.63],
        [196.0, 246.94, 293.66, 349.23],
      ],
      lofi: [
        [207.65, 261.63, 311.13, 392.0],
        [185.0, 233.08, 277.18, 349.23],
        [164.81, 207.65, 246.94, 311.13],
        [155.56, 196.0, 233.08, 293.66],
      ],
      house: [
        [130.81, 261.63, 329.63, 392.0],
        [146.83, 293.66, 349.23, 440.0],
        [164.81, 329.63, 392.0, 493.88],
        [174.61, 349.23, 440.0, 523.25],
      ],
      bossa: [
        [220.0, 261.63, 329.63, 370.0],
        [196.0, 246.94, 293.66, 349.23],
        [174.61, 220.0, 261.63, 329.63],
        [164.81, 207.65, 246.94, 329.63],
      ],
      jazz: [
        [146.83, 220.0, 261.63, 349.23],
        [196.0, 246.94, 311.13, 349.23],
        [130.81, 246.94, 329.63, 392.0],
        [220.0, 261.63, 329.63, 392.0],
      ],
    };

    const chords = chordScales[preset] || chordScales.chill;
    const intervalMs = Math.max(300, Math.floor((60 / (bpm || 110)) * 1000));
    let chordIndex = Math.floor(this.synthSecondsElapsed / (intervalMs / 1000));

    const playStep = () => {
      if (!this.isPlaying || this.isExplicitlyPaused || !this.audioCtx || !this.gainNode) return;

      const currentChord = chords[chordIndex % chords.length];
      const now = this.audioCtx.currentTime;

      currentChord.forEach((freq, i) => {
        if (!this.audioCtx || !this.gainNode) return;
        const osc = this.audioCtx.createOscillator();
        const noteGain = this.audioCtx.createGain();

        osc.type = preset === 'house' ? 'sawtooth' : i === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq + (i * 0.5 - 1), now);

        const attack = preset === 'house' ? 0.05 : 0.4;
        const release = preset === 'house' ? 0.4 : 1.2;

        noteGain.gain.setValueAtTime(0.0001, now);
        noteGain.gain.linearRampToValueAtTime(0.06 / (i + 1), now + attack);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, now + attack + release);

        osc.connect(noteGain);
        noteGain.connect(this.gainNode);

        osc.start(now);
        osc.stop(now + attack + release + 0.05);

        this.activeOscillators.push(osc);
        osc.onended = () => {
          const idx = this.activeOscillators.indexOf(osc);
          if (idx >= 0) this.activeOscillators.splice(idx, 1);
        };
      });

      if (preset === 'house' || preset === 'lofi') {
        const kickOsc = this.audioCtx.createOscillator();
        const kickGain = this.audioCtx.createGain();
        kickOsc.type = 'sine';
        kickOsc.frequency.setValueAtTime(120, now);
        kickOsc.frequency.exponentialRampToValueAtTime(30, now + 0.2);

        kickGain.gain.setValueAtTime(0.18, now);
        kickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

        kickOsc.connect(kickGain);
        kickGain.connect(this.gainNode);
        kickOsc.start(now);
        kickOsc.stop(now + 0.26);

        this.activeOscillators.push(kickOsc);
        kickOsc.onended = () => {
          const idx = this.activeOscillators.indexOf(kickOsc);
          if (idx >= 0) this.activeOscillators.splice(idx, 1);
        };
      }

      chordIndex++;
    };

    playStep();
    this.synthInterval = window.setInterval(() => {
      if (!this.isPlaying || this.isExplicitlyPaused) return;
      playStep();
      this.synthSecondsElapsed += intervalMs / 1000;
      if (this.synthSecondsElapsed >= this.synthTotalDuration) {
        this.synthSecondsElapsed = 0;
        if (this.onEndedCallback) {
          this.onEndedCallback();
        }
      }
      if (this.onTimeUpdateCallback) {
        this.onTimeUpdateCallback(this.synthSecondsElapsed, this.synthTotalDuration);
      }
    }, intervalMs);
  }

  public pause() {
    this.isPlaying = false;
    this.isExplicitlyPaused = true;

    if (this.audio) {
      try {
        this.audio.pause();
      } catch (e) {
        console.warn('Error pausing audio:', e);
      }
    }

    if (this.synthInterval) {
      clearInterval(this.synthInterval);
      this.synthInterval = null;
    }
    this.isSynthesizing = false;

    // Immediately stop any currently sounding oscillators
    this.activeOscillators.forEach((osc) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch {}
    });
    this.activeOscillators = [];

    // Silence gain immediately
    if (this.gainNode && this.audioCtx) {
      try {
        this.gainNode.gain.cancelScheduledValues(this.audioCtx.currentTime);
        this.gainNode.gain.setValueAtTime(0, this.audioCtx.currentTime);
      } catch {}
    }
  }

  public resume(
    url: string,
    preset: string = 'chill',
    bpm: number = 110,
    onTimeUpdate?: (curr: number, dur: number) => void,
    onEnded?: () => void
  ) {
    this.isPlaying = true;
    this.isExplicitlyPaused = false;
    if (onTimeUpdate) this.onTimeUpdateCallback = onTimeUpdate;
    if (onEnded) this.onEndedCallback = onEnded;

    if (this.activeMode === 'html5' && this.audio && this.audio.src) {
      this.audio.volume = this.isMuted ? 0 : this.volume;
      const playPromise = this.audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          if (this.isExplicitlyPaused || !this.isPlaying) return;
          this.startSynth(preset, bpm);
        });
      }
    } else {
      this.startSynth(preset, bpm);
    }
  }

  public stop() {
    this.isPlaying = false;
    this.isExplicitlyPaused = true;

    if (this.audio) {
      try {
        this.audio.pause();
        this.audio.currentTime = 0;
      } catch (e) {
        console.warn('Error stopping audio:', e);
      }
    }

    if (this.synthInterval) {
      clearInterval(this.synthInterval);
      this.synthInterval = null;
    }
    this.isSynthesizing = false;

    this.activeOscillators.forEach((osc) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch {}
    });
    this.activeOscillators = [];

    this.synthSecondsElapsed = 0;

    if (this.gainNode && this.audioCtx) {
      try {
        this.gainNode.gain.cancelScheduledValues(this.audioCtx.currentTime);
        this.gainNode.gain.setValueAtTime(0, this.audioCtx.currentTime);
      } catch {}
    }
  }

  public seek(seconds: number) {
    if (isNaN(seconds) || seconds < 0) return;
    const target = Math.max(0, seconds);

    if (this.audio && this.activeMode === 'html5') {
      try {
        this.audio.currentTime = target;
      } catch (e) {
        console.warn('Audio seek exception:', e);
      }
    }

    // Always update synth position as well
    this.synthSecondsElapsed = target;

    // Immediately trigger onTimeUpdate so UI updates smoothly
    if (this.onTimeUpdateCallback) {
      const dur = (this.activeMode === 'html5' && this.audio && !isNaN(this.audio.duration) && isFinite(this.audio.duration) && this.audio.duration > 0)
        ? this.audio.duration
        : this.synthTotalDuration;
      this.onTimeUpdateCallback(target, dur);
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    this.isMuted = this.volume === 0;

    if (this.audio) {
      this.audio.volume = this.volume;
    }

    if (this.gainNode && this.audioCtx) {
      try {
        this.gainNode.gain.setValueAtTime(this.volume, this.audioCtx.currentTime);
      } catch {}
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public getFrequencyData(): Uint8Array {
    if (this.analyser) {
      const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
      this.analyser.getByteFrequencyData(dataArray);
      return dataArray;
    }
    return new Uint8Array(16);
  }
}

export const audioEngine = new AudioEngine();
