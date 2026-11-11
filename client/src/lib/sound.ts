/**
 * Future Center - Luxury Clinic Notification Sound Engine
 * Provides dual-engine playback (HTML5 Audio + Web Audio API synthesizer)
 * to ensure 100% reliable chime delivery across all mobile browsers & PWAs.
 */

const STORAGE_KEY = 'future_center_notification_sound_enabled';
const CHIME_AUDIO_URL = '/sounds/future-chime.mp3';

let sharedAudioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return null;
    if (!sharedAudioContext) {
      sharedAudioContext = new AudioCtx();
    }
    if (sharedAudioContext.state === 'suspended') {
      void sharedAudioContext.resume();
    }
    return sharedAudioContext;
  } catch (e) {
    console.warn('[Sound] AudioContext not available:', e);
    return null;
  }
}

// Unlock audio context on initial user interaction (touch/click/keypress)
if (typeof window !== 'undefined') {
  const unlockAudio = () => {
    const ctx = getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    window.removeEventListener('pointerdown', unlockAudio);
    window.removeEventListener('keydown', unlockAudio);
  };
  window.addEventListener('pointerdown', unlockAudio, { once: true, passive: true });
  window.addEventListener('keydown', unlockAudio, { once: true, passive: true });
}

/**
 * Checks if sound is enabled by user preference (defaults to true)
 */
export function isNotificationSoundEnabled(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === null ? true : stored === 'true';
  } catch {
    return true;
  }
}

/**
 * Set sound enabled / disabled
 */
export function setNotificationSoundEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, String(enabled));
    window.dispatchEvent(new CustomEvent('future_sound_pref_changed', { detail: { enabled } }));
  } catch {
    // Ignore storage errors
  }
}

/**
 * Toggle sound enabled state
 */
export function toggleNotificationSound(): boolean {
  const next = !isNotificationSoundEnabled();
  setNotificationSoundEnabled(next);
  if (next) {
    void playNotificationChime(true);
  }
  return next;
}

/**
 * Synthesizes the signature Future Center crystal chime via Web Audio API.
 * Guarantees instantaneous zero-latency playback even when offline or before audio file is cached.
 */
function synthesizeClinicChime(ctx: AudioContext, gainFactor = 0.55) {
  const now = ctx.currentTime;
  const master = ctx.createGain();
  master.gain.setValueAtTime(gainFactor, now);
  master.connect(ctx.destination);

  // Modern Apple-grade dual-tone crystal chime:
  // Note 1 (t=0.00s): G5 (783.99 Hz)
  // Note 2 (t=0.075s): C6 (1046.50 Hz) + warm C5 (523.25 Hz)
  const notes: Array<[number, number, number, number]> = [
    [0.00, 783.99, 0.38, 0.45], // G5 warm strike
    [0.075, 1046.50, 0.52, 0.65], // C6 pristine crystal resolution
    [0.075, 523.25, 0.45, 0.25], // C5 warm acoustic body
  ];

  for (const [delay, freq, duration, amp] of notes) {
    const startTime = now + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startTime);

    // Natural crystal bell envelope: 3ms rapid attack, smooth exponential decay
    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.exponentialRampToValueAtTime(amp, startTime + 0.003);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(gain);
    gain.connect(master);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.04);

    // Overtone harmonic for natural glass chime acoustic texture
    const overtone = ctx.createOscillator();
    const overtoneGain = ctx.createGain();
    overtone.type = 'sine';
    overtone.frequency.setValueAtTime(freq * 2.0, startTime);
    overtoneGain.gain.setValueAtTime(0.0001, startTime);
    overtoneGain.gain.exponentialRampToValueAtTime(amp * 0.22, startTime + 0.003);
    overtoneGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration * 0.55);

    overtone.connect(overtoneGain);
    overtoneGain.connect(master);

    overtone.start(startTime);
    overtone.stop(startTime + duration * 0.6);
  }
}

/**
 * Plays the signature Future Center notification chime.
 * @param force If true, bypasses user enabled preference check (useful for "Test Sound" buttons).
 */
export async function playNotificationChime(force = false): Promise<void> {
  if (typeof window === 'undefined') return;
  if (!force && !isNotificationSoundEnabled()) return;

  // Try HTML5 Audio element first
  try {
    const audio = new Audio(CHIME_AUDIO_URL);
    audio.volume = 0.85;
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      await playPromise;
      return;
    }
  } catch {
    // Autoplay policy or loading fallback to Web Audio API
  }

  // Fallback to Web Audio API synthesis
  try {
    const ctx = getAudioContext();
    if (ctx) {
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }
      synthesizeClinicChime(ctx, 0.55);
    }
  } catch (err) {
    console.warn('[Sound] Web Audio API playback failed:', err);
  }
}

// Global listener for background service worker push events
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data?.type === 'FUTURE_PUSH_RECEIVED') {
      void playNotificationChime();
    }
  });
}
