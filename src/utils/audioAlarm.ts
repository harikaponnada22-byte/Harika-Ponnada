/**
 * Web Audio API Sound Synthesizer for Desk Sensor Absence Alerts and Biometrics
 */

class SoundAlertController {
  private ctx: AudioContext | null = null;
  private volume: number = 0.6;
  private muted: boolean = false;
  private alarmInterval: number | null = null;
  private isAlarmRunning: boolean = false;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  public getVolume(): number {
    return this.volume;
  }

  public toggleMute(): boolean {
    this.muted = !this.muted;
    if (this.muted && this.isAlarmRunning) {
      this.stopContinuousAlarm();
    }
    return this.muted;
  }

  public isMuted(): boolean {
    return this.muted;
  }

  /**
   * Short audible piezo buzzer beep for vacant desk sensor alert
   */
  public playAbsenceBeep(frequency = 880, durationMs = 280) {
    if (this.muted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(frequency, now);
      // Quick pitch drop creates distinctive alert chirp
      osc.frequency.exponentialRampToValueAtTime(frequency * 0.7, now + durationMs / 1000);

      gain.gain.setValueAtTime(this.volume * 0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + durationMs / 1000);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + durationMs / 1000);
    } catch {
      // Audio playback safety catch
    }
  }

  /**
   * Oscillating urgency siren when student is absent during mandatory active period
   */
  public playBuzzerSiren() {
    if (this.muted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(650, now);
      osc.frequency.linearRampToValueAtTime(950, now + 0.15);
      osc.frequency.linearRampToValueAtTime(650, now + 0.35);

      gain.gain.setValueAtTime(this.volume * 0.3, now);
      gain.gain.linearRampToValueAtTime(this.volume * 0.35, now + 0.2);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.45);
    } catch {
      // Audio playback safety catch
    }
  }

  /**
   * Pleasant harmonic chord when student verifies face / fingerprint
   */
  public playBiometricSuccessChime() {
    if (this.muted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 chord

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);

        const startTime = now + idx * 0.06;
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(this.volume * 0.25, startTime + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.4);
      });
    } catch {
      // Audio playback safety catch
    }
  }

  /**
   * Subtle ding for notification dispatched to parents
   */
  public playNotificationPing() {
    if (this.muted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(987.77, now); // B5
      osc.frequency.exponentialRampToValueAtTime(1318.51, now + 0.08); // E6

      gain.gain.setValueAtTime(this.volume * 0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.25);
    } catch {
      // Audio playback safety catch
    }
  }

  /**
   * Continuous pulsed alarm for active unexcused vacancy
   */
  public startContinuousAlarm(tone: 'beep' | 'siren' = 'beep') {
    if (this.isAlarmRunning) return;
    this.isAlarmRunning = true;

    if (tone === 'beep') {
      this.playAbsenceBeep();
      this.alarmInterval = window.setInterval(() => {
        this.playAbsenceBeep();
      }, 1200);
    } else {
      this.playBuzzerSiren();
      this.alarmInterval = window.setInterval(() => {
        this.playBuzzerSiren();
      }, 1500);
    }
  }

  public stopContinuousAlarm() {
    if (this.alarmInterval !== null) {
      clearInterval(this.alarmInterval);
      this.alarmInterval = null;
    }
    this.isAlarmRunning = false;
  }

  public getAlarmState(): boolean {
    return this.isAlarmRunning;
  }
}

export const soundAlert = new SoundAlertController();
