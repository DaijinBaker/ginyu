/**
 * Formats a duration in seconds into M:SS display string.
 * e.g. 185 → "3:05", 60 → "1:00", 9 → "0:09"
 */
export function formatTime(totalSeconds: number): string {
  const clamped = Math.max(0, totalSeconds);
  const minutes = Math.floor(clamped / 60);
  const seconds = clamped % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
