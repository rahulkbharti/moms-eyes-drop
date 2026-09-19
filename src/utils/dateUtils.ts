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
