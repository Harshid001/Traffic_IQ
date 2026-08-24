import { Platform, Vibration } from 'react-native';

export type AlertLevel = 'TRAFFIC_AHEAD' | 'TRAFFIC_WORSENING' | 'BETTER_ROUTE' | 'MANEUVER';

export interface AlertData {
  level: string;
  type: string;
  title: string;
  distance_km?: number;
  message: string;
  action_label?: string;
  timestamp?: string;
  better_route_id?: string;
  savings_min?: number;
  current_cong?: number;
  fc20_cong?: number;
  expected_delay_min?: number;
}

/**
 * Haptic pattern per alert level, in milliseconds: [wait, vibrate, wait, ...].
 * Used on iOS/Android where the Web Audio API does not exist.
 */
const VIBRATION_PATTERNS: Record<AlertLevel, number[]> = {
  TRAFFIC_WORSENING: [0, 180, 90, 180],
  TRAFFIC_AHEAD: [0, 180, 90, 180],
  BETTER_ROUTE: [0, 90, 70, 90, 70, 90],
  MANEUVER: [0, 70]
};

/**
 * Synthesize a cockpit chime with the Web Audio API.
 * Only reachable on web; `playAlertChime` guards the platform.
 */
function playWebChime(level: AlertLevel): void {
  const AudioContextClass =
    (globalThis as any).AudioContext || (globalThis as any).webkitAudioContext;
  if (!AudioContextClass) return;

  const ctx = new AudioContextClass();
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  if (level === 'TRAFFIC_WORSENING' || level === 'TRAFFIC_AHEAD') {
    // 2-tone urgency warning: D5 -> A5
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(587.33, now);
    osc.frequency.setValueAtTime(880, now + 0.12);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.45);
  } else if (level === 'BETTER_ROUTE') {
    // Pleasant discovery arpeggio: C5 -> E5 -> G5
    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, now);
    osc.frequency.setValueAtTime(659.25, now + 0.1);
    osc.frequency.setValueAtTime(783.99, now + 0.2);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.5);
  } else {
    // Short maneuver tap
    osc.type = 'sine';
    osc.frequency.setValueAtTime(750, now);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.15);
  }
}

/**
 * Emit the alert cue for `level`.
 *
 * Web: synthesized tone via Web Audio.
 * iOS/Android: haptic pattern via the built-in `Vibration` API, because
 * `window.AudioContext` does not exist on native — the previous implementation
 * silently did nothing on a phone, which is exactly where the driver needs it.
 *
 * To emit real audio on native, add `expo-av` and load a bundled sound file;
 * the vibration path is the dependency-free equivalent.
 */
export function playAlertChime(level: AlertLevel): void {
  try {
    if (Platform.OS === 'web') {
      playWebChime(level);
      return;
    }
    Vibration.vibrate(VIBRATION_PATTERNS[level] ?? VIBRATION_PATTERNS.MANEUVER);
  } catch {
    // Web Audio requires a prior user gesture in some browsers, and vibration
    // is unavailable on some devices. Neither is worth interrupting the drive.
  }
}
