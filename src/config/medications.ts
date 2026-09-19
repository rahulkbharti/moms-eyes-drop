import type { MedicationConfig } from '../types/medication';

export const MED_A: MedicationConfig = {
  id: 'medA',
  name: 'Medicine A (6 Times / 2 Hrs)',
  totalDoses: 6,
  gapHours: 2,
  color: 'primary',
};

export const MED_B: MedicationConfig = {
  id: 'medB',
  name: 'Medicine B (4 Times / 3 Hrs)',
  totalDoses: 4,
  gapHours: 3,
  color: 'secondary',
};

export const MEDICATIONS: MedicationConfig[] = [MED_A, MED_B];

export const STORAGE_KEY = 'eyeDropsLogs';
export const LAST_DATE_KEY = 'eyeDropsLastDate';
