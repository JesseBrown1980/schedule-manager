/**
 * Format time string for conflict display (HH:MM)
 */
export function formatConflictTime(time: string): string {
  return time.slice(0, 5);
}

/**
 * Format date string for conflict display
 */
export function formatConflictDate(date: string): string {
  return date;
}
