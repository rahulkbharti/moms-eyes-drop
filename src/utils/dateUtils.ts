/**
 * Format timestamp to a human-readable 12-hour or 24-hour time string
 */
export const formatTime = (date: string | Date | null): string => {
  if (!date) return 'Not taken yet';
  return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

/**
 * Format timestamp to a human-readable date string
 */
export const formatDate = (date: string | Date | null): string => {
  if (!date) return '';
  return new Date(date).toLocaleDateString();
};

/**
 * Calculate the next scheduled dose timestamp based on the last dose and gap hours
 */
export const getNextDoseTime = (lastDoseTime: string | null, gapHours: number): Date | null => {
  if (!lastDoseTime) return null;
  const next = new Date(lastDoseTime);
  next.setHours(next.getHours() + gapHours);
  return next;
};

/**
 * Check if the next dose is currently due
 */
export const isDoseDue = (nextDoseTime: Date | null): boolean => {
  if (!nextDoseTime) return true; // If never taken today, it is due
  return new Date() >= nextDoseTime;
};

/**
 * Get human-readable remaining time until the next dose
 */
export const getTimeRemaining = (nextDoseTime: Date | null): string => {
  if (!nextDoseTime) return 'Ready now';
  const now = new Date();
  const diffMs = nextDoseTime.getTime() - now.getTime();
  if (diffMs <= 0) return 'Due now';

  const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (diffHrs > 0) {
    return `${diffHrs}h ${diffMins}m remaining`;
  }
  return `${diffMins}m remaining`;
};

/**
 * Convert a Date or ISO string to format required by <input type="datetime-local"> (YYYY-MM-DDTHH:mm)
 */
export const toDateTimeLocalString = (dateInput?: Date | string | null): string => {
  const d = dateInput ? new Date(dateInput) : new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

/**
 * Convert datetime-local value (YYYY-MM-DDTHH:mm) to ISO string
 */
export const fromDateTimeLocalString = (dtString: string): string => {
  return new Date(dtString).toISOString();
};

/**
 * Extract local HH:mm for <input type="time">
 */
export const toTimeInputValue = (dateInput?: Date | string | null): string => {
  const d = dateInput ? new Date(dateInput) : new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  return `${hours}:${minutes}`;
};

/**
 * Combine HH:mm with a base date (keeping the day) and return ISO string
 */
export const applyTimeToDate = (timeStr: string, baseDateInput?: Date | string | null): string => {
  const [h, m] = timeStr.split(':').map(Number);
  const base = baseDateInput ? new Date(baseDateInput) : new Date();
  const result = new Date(base);
  result.setHours(h, m, 0, 0);
  return result.toISOString();
};

