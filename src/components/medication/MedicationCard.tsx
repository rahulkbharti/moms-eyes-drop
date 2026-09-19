import type React from 'react';
import {
  Paper,
  Box,
  Typography,
  Chip,
  LinearProgress,
  Grid,
  Button,
} from '@mui/material';
import {
  Medication as MedicationIcon,
  CheckCircle as CheckCircleIcon,
  NotificationsActive as AlarmIcon,
} from '@mui/icons-material';
import type { MedicationConfig } from '../../types/medication';
import {
  formatTime,
  getNextDoseTime,
  isDoseDue,
  getTimeRemaining,
} from '../../utils/dateUtils';

interface MedicationCardProps {
  med: MedicationConfig;
  logs: string[];
  onLogDose: (med: MedicationConfig) => void;
}

export const MedicationCard: React.FC<MedicationCardProps> = ({
  med,
  logs,
  onLogDose,
}) => {
  const dosesTaken = logs.length;
  const lastDoseStr = dosesTaken > 0 ? logs[dosesTaken - 1] : null;
  const nextDoseTime = getNextDoseTime(lastDoseStr, med.gapHours);
  const isCompleted = dosesTaken >= med.totalDoses;
  const due = isDoseDue(nextDoseTime);
  const progress = Math.min((dosesTaken / med.totalDoses) * 100, 100);

  // Background and text colors for Next Dose box
  const getNextDoseBg = () => {
    if (isCompleted) return 'success.light';
    if (due) return 'warning.light';
    return 'grey.100';
  };

  const getNextDoseColor = () => {
    if (isCompleted || due) return '#ffffff';
    return 'text.primary';
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        '&:hover': {
          boxShadow: '0 8px 24px rgba(0,0,0,0.09)',
        },
      }}
    >
      {/* Title and Badge */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
          gap: 1,
        }}
      >
        <Typography
          variant="h6"
          color={`${med.color}.main`}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            fontWeight: 700,
            fontSize: { xs: '1.05rem', sm: '1.25rem' },
          }}
        >
          <MedicationIcon /> {med.name}
        </Typography>
        <Chip
          label={`${dosesTaken}/${med.totalDoses} Doses`}
          color={isCompleted ? 'success' : med.color}
          size="small"
          sx={{ fontWeight: 'bold' }}
        />
      </Box>

      {/* Progress Bar */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography variant="body2" color="text.secondary">
            Daily Progress
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 'bold' }} color="text.secondary">
            {Math.round(progress)}%
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={progress}
          color={isCompleted ? 'success' : med.color}
          sx={{ height: 10, borderRadius: 5 }}
        />
      </Box>

      {/* Timing Information Grid */}
      <Grid container spacing={2} sx={{ mb: 3, flexGrow: 1 }}>
        <Grid size={{ xs: 6 }}>
          <Box
            sx={{
              p: 1.5,
              bgcolor: 'background.default',
              borderRadius: 2,
              textAlign: 'center',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              Last Dose
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
              {lastDoseStr ? formatTime(lastDoseStr) : '--:--'}
            </Typography>
          </Box>
        </Grid>

        <Grid size={{ xs: 6 }}>
          <Box
            sx={{
              p: 1.5,
              bgcolor: getNextDoseBg(),
              borderRadius: 2,
              textAlign: 'center',
              color: getNextDoseColor(),
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <Typography variant="caption" sx={{ display: 'block', color: 'inherit', opacity: 0.85 }}>
              Next Dose
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
              {isCompleted ? 'Done for today' : nextDoseTime ? formatTime(nextDoseTime) : 'Now'}
            </Typography>
            {!isCompleted && nextDoseTime && !due && (
              <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: 'inherit', opacity: 0.9 }}>
                {getTimeRemaining(nextDoseTime)}
              </Typography>
            )}
          </Box>
        </Grid>
      </Grid>

      {/* Action Button */}
      <Button
        variant="contained"
        color={med.color}
        fullWidth
        size="large"
        startIcon={isCompleted ? <CheckCircleIcon /> : <AlarmIcon />}
        onClick={() => onLogDose(med)}
        disabled={isCompleted || (!due && dosesTaken > 0)}
        sx={{
          mt: 'auto',
          py: 1.5,
          fontSize: '1rem',
          boxShadow: isCompleted || (!due && dosesTaken > 0) ? 'none' : undefined,
        }}
      >
        {isCompleted
          ? 'All Done Today'
          : due || dosesTaken === 0
          ? 'Log Dose Now'
          : `Wait ${med.gapHours} Hours`}
      </Button>
    </Paper>
  );
};
