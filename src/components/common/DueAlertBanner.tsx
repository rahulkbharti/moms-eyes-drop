import React from 'react';
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Stack,
  Typography,
} from '@mui/material';
import {
  NotificationsActive as AlarmIcon,
  CheckCircle as CheckIcon,
  NotificationsNone as NotifyOffIcon,
} from '@mui/icons-material';
import type { DoseLogs, MedicationConfig } from '../../types/medication';
import { getNextDoseTime, isDoseDue, formatTime } from '../../utils/dateUtils';

interface DueAlertBannerProps {
  medications: MedicationConfig[];
  logs: DoseLogs;
  notificationPermission: NotificationPermission;
  isAlarmActive: boolean;
  onRequestNotification: () => void;
  onLogDose: (med: MedicationConfig) => void;
  onTestAlarm: () => void;
  onStopAlarm: () => void;
}

export const DueAlertBanner: React.FC<DueAlertBannerProps> = ({
  medications,
  logs,
  notificationPermission,
  isAlarmActive,
  onRequestNotification,
  onLogDose,
  onTestAlarm,
  onStopAlarm,
}) => {
  // Find which medicines are due right now (where dose has been started but not finished today)
  const dueMeds = medications.filter((med) => {
    const medLogs = logs[med.id] || [];
    const dosesTaken = medLogs.length;
    if (dosesTaken > 0 && dosesTaken < med.totalDoses) {
      const lastDoseStr = medLogs[dosesTaken - 1];
      const nextDoseTime = getNextDoseTime(lastDoseStr, med.gapHours);
      return nextDoseTime && isDoseDue(nextDoseTime);
    }
    return false;
  });

  return (
    <Stack spacing={2} sx={{ mb: 3 }}>
      {/* 1. Permission Warning Banner if notifications not granted */}
      {notificationPermission !== 'granted' && (
        <Alert
          severity="warning"
          icon={<NotifyOffIcon fontSize="inherit" />}
          sx={{
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'warning.light',
            alignItems: 'center',
          }}
          action={
            <Stack direction="row" spacing={1}>
              <Button
                color="warning"
                variant="contained"
                size="small"
                onClick={onRequestNotification}
                sx={{ fontWeight: 700, textTransform: 'none' }}
              >
                Enable Reminders
              </Button>
              <Button
                color="inherit"
                size="small"
                startIcon={<AlarmIcon />}
                onClick={onTestAlarm}
                sx={{ textTransform: 'none', fontWeight: 600 }}
              >
                {isAlarmActive ? 'Stop Test' : 'Test Alarm 🚨'}
              </Button>
            </Stack>
          }
        >
          <AlertTitle sx={{ fontWeight: 700, mb: 0.2 }}>
            Reminders are currently not enabled
          </AlertTitle>
          <Typography variant="body2">
            Allow notifications and audio so you get alerted when Maa's drops are due!
          </Typography>
        </Alert>
      )}

      {/* 2. Active Due Dose Alerts */}
      {dueMeds.map((med) => {
        const medLogs = logs[med.id] || [];
        const lastDoseStr = medLogs[medLogs.length - 1];
        const nextDoseTime = getNextDoseTime(lastDoseStr, med.gapHours);

        return (
          <Alert
            key={`due-alert-${med.id}`}
            severity="error"
            icon={<AlarmIcon fontSize="large" sx={{ animation: 'pulse 1.2s infinite' }} />}
            sx={{
              borderRadius: 3,
              border: '2px solid',
              borderColor: 'error.main',
              bgcolor: '#fff5f5',
              boxShadow: isAlarmActive
                ? '0 0 24px rgba(211, 47, 47, 0.45)'
                : '0 4px 16px rgba(211, 47, 47, 0.15)',
              alignItems: 'center',
              '@keyframes pulse': {
                '0%': { transform: 'scale(1)' },
                '50%': { transform: 'scale(1.2)' },
                '100%': { transform: 'scale(1)' },
              },
            }}
            action={
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                {isAlarmActive ? (
                  <Button
                    color="error"
                    variant="outlined"
                    size="small"
                    onClick={onStopAlarm}
                    sx={{ textTransform: 'none', fontWeight: 700 }}
                  >
                    Stop Alarm 🛑
                  </Button>
                ) : (
                  <Button
                    color="error"
                    variant="outlined"
                    size="small"
                    startIcon={<AlarmIcon />}
                    onClick={onTestAlarm}
                    sx={{ textTransform: 'none', fontWeight: 600 }}
                  >
                    Ring Alarm 🚨
                  </Button>
                )}
                <Button
                  color="error"
                  variant="contained"
                  size="medium"
                  startIcon={<CheckIcon />}
                  onClick={() => onLogDose(med)}
                  sx={{ fontWeight: 700, textTransform: 'none', px: 2 }}
                >
                  Log Dose Now
                </Button>
              </Stack>
            }
          >
            <AlertTitle sx={{ fontWeight: 800, fontSize: '1.05rem', color: 'error.dark' }}>
              🔔 DOSE DUE NOW: {med.name}
            </AlertTitle>
            <Box>
              <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 500 }}>
                Scheduled for {nextDoseTime ? formatTime(nextDoseTime) : 'Now'}. Please administer Maa's eye drops!
              </Typography>
            </Box>
          </Alert>
        );
      })}
    </Stack>
  );
};
