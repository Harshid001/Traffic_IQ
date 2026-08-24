/**
 * Shared display formatters.
 *
 * The backend is inconsistent about reliability units: some payloads return a
 * decimal fraction (0.64) while others return an already-scaled percentage (64).
 * Every call site that renders a reliability value MUST normalize through
 * `normalizeReliability` so the UI never prints "0.64%".
 */

/**
 * Normalize a reliability score to an integer percentage in the range 0-100.
 *
 * - `0.64` -> `64`   (decimal fraction)
 * - `64`   -> `64`   (already a percentage)
 * - `0`    -> `0`
 * - `null` / `undefined` / `NaN` -> `0`
 */
export function normalizeReliability(raw: number | null | undefined): number {
  if (raw === null || raw === undefined || Number.isNaN(raw)) return 0;
  const value = raw > 0 && raw <= 1 ? raw * 100 : raw;
  return Math.round(Math.min(Math.max(value, 0), 100));
}

/**
 * Normalize a congestion value to an integer percentage in the range 0-100.
 * Same fraction-vs-percentage ambiguity as reliability.
 */
export function normalizeCongestion(raw: number | null | undefined): number {
  return normalizeReliability(raw);
}

/** Format a numeric percentage for display, e.g. `64` -> `"64%"`. */
export function formatPct(raw: number | null | undefined): string {
  return `${normalizeReliability(raw)}%`;
}

/** Format minutes with a sign, e.g. `-5` -> `"-5m"`, `3` -> `"+3m"`. */
export function formatMinutesDelta(minutes: number | null | undefined): string {
  if (minutes === null || minutes === undefined || Number.isNaN(minutes)) return '0m';
  const rounded = Math.round(minutes);
  return `${rounded > 0 ? '+' : ''}${rounded}m`;
}

/** Format an INR amount without decimals, e.g. `45.6` -> `"₹46"`. */
export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || Number.isNaN(amount)) return '₹0';
  return `₹${Math.round(amount)}`;
}

/** Format a `Date` as a 24-hour `HH:MM` clock string. */
export function formatClock(date: Date = new Date()): string {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

/** Format a `Date` as e.g. `"Friday, August 23"`. */
export function formatLongDate(date: Date = new Date()): string {
  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });
}
