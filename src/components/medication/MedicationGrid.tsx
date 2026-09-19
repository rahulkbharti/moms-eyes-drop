import type React from 'react';
import { Grid } from '@mui/material';
import { MedicationCard } from './MedicationCard';
import type { DoseLogs, MedicationConfig } from '../../types/medication';

interface MedicationGridProps {
  medications: MedicationConfig[];
  logs: DoseLogs;
  onLogDose: (med: MedicationConfig) => void;
  onUpdateLastDose: (med: MedicationConfig, newTimestamp: string) => void;
  onDeleteLastDose: (med: MedicationConfig) => void;
  onAddDoseWithTime: (med: MedicationConfig, timestamp: string) => void;
}

export const MedicationGrid: React.FC<MedicationGridProps> = ({
  medications,
  logs,
  onLogDose,
  onUpdateLastDose,
  onDeleteLastDose,
  onAddDoseWithTime,
}) => {
  return (
    <Grid container spacing={3}>
      {medications.map((med) => (
        <Grid size={{ xs: 12, md: 6 }} key={med.id}>
          <MedicationCard
            med={med}
            logs={logs[med.id] || []}
            onLogDose={onLogDose}
            onUpdateLastDose={onUpdateLastDose}
            onDeleteLastDose={onDeleteLastDose}
            onAddDoseWithTime={onAddDoseWithTime}
          />
        </Grid>
      ))}
    </Grid>
  );
};
