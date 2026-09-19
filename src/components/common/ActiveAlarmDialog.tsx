import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Stack,
  Chip,
} from '@mui/material';
import {
  NotificationsActive as AlarmIcon,
  StopCircle as StopIcon,
  CheckCircle as CheckIcon,
  Snooze as SnoozeIcon,
} from '@mui/icons-material';
import type { MedicationConfig } from '../../types/medication';

interface ActiveAlarmDialogProps {
  open: boolean;
  med: MedicationConfig | null;
  onStopAlarm: () => void;
  onLogDose: (med: MedicationConfig) => void;
  onSnooze: (med: MedicationConfig) => void;
}

export const ActiveAlarmDialog: React.FC<ActiveAlarmDialogProps> = ({
  open,
  med,
  onStopAlarm,
  onLogDose,
  onSnooze,
}) => {
  if (!med) return null;

  return (
    <Dialog
      open={open}
      maxWidth="xs"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 4,
            p: { xs: 2, sm: 3 },
            textAlign: 'center',
            border: '3px solid',
            borderColor: 'error.main',
            boxShadow: '0 0 32px rgba(211, 47, 47, 0.45)',
            animation: 'alarmGlow 1.5s infinite alternate',
            '@keyframes alarmGlow': {
              '0%': { boxShadow: '0 0 20px rgba(211, 47, 47, 0.3)' },
              '100%': { boxShadow: '0 0 45px rgba(211, 47, 47, 0.7)' },
            },
          },
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box
          sx={{
            display: 'inline-flex',
            p: 2,
            borderRadius: '50%',
            bgcolor: 'error.light',
            color: 'white',
            mb: 1.5,
            animation: 'shake 0.8s infinite',
            '@keyframes shake': {
              '0%, 100%': { transform: 'rotate(0deg)' },
              '20%': { transform: 'rotate(-15deg)' },
              '40%': { transform: 'rotate(15deg)' },
              '60%': { transform: 'rotate(-10deg)' },
              '80%': { transform: 'rotate(10deg)' },
            },
          }}
        >
          <AlarmIcon sx={{ fontSize: 44 }} />
        </Box>
        <Typography variant="h5" sx={{ fontWeight: 900, color: 'error.main', letterSpacing: 0.5 }}>
          DOSE DUE ALARM!
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ py: 1 }}>
        <Chip
          label={med.name}
          color={med.color}
          sx={{ fontWeight: 700, fontSize: '0.95rem', py: 2, px: 1, mb: 2 }}
        />
        <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.primary', mb: 1 }}>
          It's time to give Maa's eye drops.
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
          The alarm will keep ringing until you stop or log the dose.
        </Typography>
      </DialogContent>

      <DialogActions sx={{ flexDirection: 'column', gap: 1.5, pt: 2 }}>
        <Button
          variant="contained"
          color="error"
          fullWidth
          size="large"
          startIcon={<CheckIcon />}
          onClick={() => {
            onLogDose(med);
          }}
          sx={{
            py: 1.5,
            fontSize: '1.05rem',
            fontWeight: 800,
            borderRadius: 3,
            boxShadow: '0 4px 14px rgba(211, 47, 47, 0.4)',
          }}
        >
          Log Dose & Stop Alarm
        </Button>

        <Stack direction="row" spacing={1.5} sx={{ width: '100%' }}>
          <Button
            variant="outlined"
            color="inherit"
            fullWidth
            size="medium"
            startIcon={<StopIcon />}
            onClick={onStopAlarm}
            sx={{ borderRadius: 2.5, fontWeight: 700 }}
          >
            Stop Alarm
          </Button>
          <Button
            variant="outlined"
            color="warning"
            fullWidth
            size="medium"
            startIcon={<SnoozeIcon />}
            onClick={() => onSnooze(med)}
            sx={{ borderRadius: 2.5, fontWeight: 700 }}
          >
            Snooze 5m
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};
