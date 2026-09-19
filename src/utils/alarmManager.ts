/**
 * Single-Engine Alarm Manager for Maa's Eye Drops
 * Plays ONE loud, clear digital alarm beep pattern continuously until stopped.
 */

class AlarmManager {
  private audioContext: AudioContext | null = null;
  private intervalId: number | null = null;
  private isPlaying: boolean = false;
  private currentMedName: string | null = null;

  private getAudioContext(): AudioContext | null {
    try {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

      if (!AudioCtxClass) return null;

      if (!this.audioContext || this.audioContext.state === 'closed') {
        this.audioContext = new AudioCtxClass();
      }

      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume().catch(() => {});
      }

      return this.audioContext;
    } catch (e) {
      console.warn('AudioContext error', e);
      return null;
    }
  }

  /**
   * Unlock AudioContext on user interaction
   */
  public unlockAudio() {
    const ctx = this.getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
  }

  /**
   * Plays ONE pattern of digital alarm clock beeps: Beep-Beep-Beep-BEEP!
   */
  private playAlarmBeepPattern() {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      const scheduleBeep = (freq: number, startOffset: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'square'; // Crisp digital alarm clock timbre
        osc.frequency.setValueAtTime(freq, now + startOffset);

        gain.gain.setValueAtTime(0.4, now + startOffset);
        gain.gain.setValueAtTime(0, now + startOffset + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + startOffset);
        osc.stop(now + startOffset + duration);
      };

      // 3 fast beeps (950Hz) + 1 punch beep (1200Hz)
      scheduleBeep(950, 0.00, 0.10);
      scheduleBeep(950, 0.16, 0.10);
      scheduleBeep(950, 0.32, 0.10);
      scheduleBeep(1200, 0.48, 0.25);
    } catch (e) {
      console.warn('Alarm beep error', e);
    }
  }

  /**
   * Starts ONE continuous alarm loop until stopAlarm() is called
   */
  public startAlarm(medName?: string) {
    if (this.isPlaying) return;

    this.isPlaying = true;
    this.currentMedName = medName || null;

    // Play immediately
    this.playAlarmBeepPattern();

    // Repeat every 1.5 seconds until stopped
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
    }

    this.intervalId = window.setInterval(() => {
      if (this.isPlaying) {
        this.playAlarmBeepPattern();
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
          navigator.vibrate([150, 70, 150, 70, 250]);
        }
      } else {
        this.stopAlarm();
      }
    }, 1500);

    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([150, 70, 150, 70, 250]);
    }
  }

  /**
   * Stops the ringing alarm immediately
   */
  public stopAlarm() {
    this.isPlaying = false;
    this.currentMedName = null;

    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(0);
    }
  }

  public isAlarmActive(): boolean {
    return this.isPlaying;
  }

  public getActiveMedName(): string | null {
    return this.currentMedName;
  }
}

export const alarmManager = new AlarmManager();

// Automatically unlock audio on first touch/click
if (typeof window !== 'undefined') {
  const handleInteraction = () => {
    alarmManager.unlockAudio();
    window.removeEventListener('click', handleInteraction);
    window.removeEventListener('touchstart', handleInteraction);
    window.removeEventListener('keydown', handleInteraction);
  };

  window.addEventListener('click', handleInteraction, { passive: true });
  window.addEventListener('touchstart', handleInteraction, { passive: true });
  window.addEventListener('keydown', handleInteraction, { passive: true });
}
