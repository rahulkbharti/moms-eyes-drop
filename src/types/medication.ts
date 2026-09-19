import type { AlertColor } from '@mui/material';

export type MedicationColor = 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';

export interface MedicationConfig {
  id: string;
  name: string;
  totalDoses: number;
  gapHours: number;
  color: MedicationColor;
}

export type DoseLogs = Record<string, string[]>;

export interface SnackbarState {
  open: boolean;
  message: string;
  severity: AlertColor;
}
