import { useState, useEffect, useRef } from 'react';
import {
  Container,
  Box,
  Button,
} from '@mui/material';
import { History as HistoryIcon } from '@mui/icons-material';

import { MEDICATIONS } from './config/medications';
import type { MedicationConfig, SnackbarState } from './types/medication';

import { useMedicationLogs } from './hooks/useMedicationLogs';
import { useCurrentTime } from './hooks/useCurrentTime';
import { usePwaInstall } from './hooks/usePwaInstall';

import {
  getNotificationPermission,
  requestNotificationPermission,
  sendDoseDueNotification,
  sendTestNotification,
} from './utils/notificationUtils';
import { getNextDoseTime, isDoseDue, formatTime } from './utils/dateUtils';
import { alarmManager } from './utils/alarmManager';

import { Header } from './components/common/Header';
import { InfoBanner } from './components/common/InfoBanner';
import { DueAlertBanner } from './components/common/DueAlertBanner';
import { ActiveAlarmDialog } from './components/common/ActiveAlarmDialog';
import { ResetDialog } from './components/common/ResetDialog';
import { DoseSnackbar } from './components/common/DoseSnackbar';
import { InstallPromptBar } from './components/common/InstallPromptBar';
import { MedicationGrid } from './components/medication/MedicationGrid';
import { HistoryView } from './components/history/HistoryView';

export default function App() {
  const {
    logs,
    logDose,
    updateLastDose,
    updateDose,
    deleteDose,
    addDoseWithTime,
    resetLogs,
  } = useMedicationLogs();
  const currentTime = useCurrentTime(5000); // Check every 5 seconds for timely alerts
  const { canInstall, installApp } = usePwaInstall();

  const [dismissInstallBanner, setDismissInstallBanner] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [viewHistory, setViewHistory] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(
    getNotificationPermission()
  );

  // Active ringing alarm state
  const [alarmActive, setAlarmActive] = useState(false);
  const [alarmMed, setAlarmMed] = useState<MedicationConfig | null>(null);
  const snoozedUntilRef = useRef<Record<string, number>>({});
  const isTestingAlarmRef = useRef(false);

  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Keep track of which doses have already triggered a notification today to prevent spam
  const notifiedDosesRef = useRef<Set<string>>(new Set());

  // Check for due doses and trigger continuous ringing alarm & notifications
  useEffect(() => {
    const nowMs = Date.now();

    const dueList: MedicationConfig[] = [];

    MEDICATIONS.forEach((med) => {
      const medLogs = logs[med.id] || [];
      const dosesTaken = medLogs.length;

      // Remind if medication is in progress (taken at least once, but not completed)
      if (dosesTaken > 0 && dosesTaken < med.totalDoses) {
        const lastDoseStr = medLogs[dosesTaken - 1];
        const nextDoseTime = getNextDoseTime(lastDoseStr, med.gapHours);

        if (nextDoseTime && isDoseDue(nextDoseTime)) {
          const snoozedUntil = snoozedUntilRef.current[med.id] || 0;
          if (nowMs >= snoozedUntil) {
            dueList.push(med);
          }

          const doseKey = `${med.id}-dose-${dosesTaken + 1}-${nextDoseTime.toISOString()}`;
          if (!notifiedDosesRef.current.has(doseKey)) {
            notifiedDosesRef.current.add(doseKey);
            sendDoseDueNotification(med.name);
          }
        }
      }
    });

    const dueMedForAlarm = dueList.length > 0 ? dueList[0] : null;

    // If a medication is due and not yet ringing (and not in test mode), start continuous ringing alarm!
    if (dueMedForAlarm && !alarmActive && !isTestingAlarmRef.current) {
      setAlarmActive(true);
      setAlarmMed(dueMedForAlarm);
      alarmManager.startAlarm(dueMedForAlarm.name);
    } else if (!dueMedForAlarm && alarmActive && !isTestingAlarmRef.current) {
      alarmManager.stopAlarm();
      setAlarmActive(false);
      setAlarmMed(null);
    }
  }, [currentTime, logs, alarmActive]);

  const handleStopAlarm = () => {
    alarmManager.stopAlarm();
    setAlarmActive(false);
    const wasTest = isTestingAlarmRef.current;
    isTestingAlarmRef.current = false;

    if (!wasTest && alarmMed) {
      // Silence only this med for 3 minutes
      snoozedUntilRef.current[alarmMed.id] = Date.now() + 3 * 60 * 1000;
    }
    setAlarmMed(null);

    setSnackbar({
      open: true,
      message: wasTest ? '🛑 Test alarm stopped.' : '🛑 Alarm stopped. (Silenced for 3 min)',
      severity: 'info',
    });
  };

  const handleSnoozeAlarm = (med: MedicationConfig) => {
    alarmManager.stopAlarm();
    setAlarmActive(false);
    isTestingAlarmRef.current = false;
    snoozedUntilRef.current[med.id] = Date.now() + 5 * 60 * 1000;
    setSnackbar({
      open: true,
      message: `⏰ Snoozed alarm for ${med.name} by 5 minutes.`,
      severity: 'info',
    });
  };

  const handleTestAlarm = () => {
    alarmManager.unlockAudio();
    if (alarmActive) {
      handleStopAlarm();
    } else {
      isTestingAlarmRef.current = true;
      setAlarmActive(true);
      setAlarmMed(MEDICATIONS[0]);
      alarmManager.startAlarm('Test Alarm');
      setSnackbar({
        open: true,
        message: '🚨 Testing continuous alarm! Rings until stopped.',
        severity: 'warning',
      });
    }
  };

  const handleRequestNotification = async () => {
    alarmManager.unlockAudio();
    const permission = await requestNotificationPermission();
    setNotificationPermission(permission);
    if (permission === 'granted') {
      await sendTestNotification();
      setSnackbar({
        open: true,
        message: '🔔 Notifications & audio enabled! You will be alerted when doses are due.',
        severity: 'success',
      });
    } else if (permission === 'denied') {
      setSnackbar({
        open: true,
        message: 'Notification permission was denied. Please allow notifications in browser site settings.',
        severity: 'warning',
      });
    }
  };

  const handleLogDoseWithAlarmStop = (med: MedicationConfig) => {
    alarmManager.stopAlarm();
    setAlarmActive(false);
    setAlarmMed(null);
    isTestingAlarmRef.current = false;
    delete snoozedUntilRef.current[med.id];
    handleLogDose(med);
  };

  const handleLogDose = (med: MedicationConfig) => {
    alarmManager.unlockAudio();
    const result = logDose(med);
    notifiedDosesRef.current.clear();
    snoozedUntilRef.current = {};
    setSnackbar({
      open: true,
      message: result.feedback.message,
      severity: result.feedback.severity,
    });
  };

  const handleUpdateLastDose = (med: MedicationConfig, newTimestamp: string) => {
    alarmManager.unlockAudio();
    notifiedDosesRef.current.clear();
    snoozedUntilRef.current = {}; // Reset any previous snooze so newly set time alarms immediately!
    updateLastDose(med.id, newTimestamp);
    setSnackbar({
      open: true,
      message: `Last dose for ${med.name} updated to ${formatTime(newTimestamp)}.`,
      severity: 'success',
    });
  };

  const handleDeleteLastDose = (med: MedicationConfig) => {
    alarmManager.unlockAudio();
    notifiedDosesRef.current.clear();
    snoozedUntilRef.current = {};
    const medLogs = logs[med.id] || [];
    if (medLogs.length > 0) {
      deleteDose(med.id, medLogs.length - 1);
      setSnackbar({
        open: true,
        message: `Last dose for ${med.name} removed.`,
        severity: 'info',
      });
    }
  };

  const handleAddDoseWithTime = (med: MedicationConfig, timestamp: string) => {
    alarmManager.unlockAudio();
    notifiedDosesRef.current.clear();
    snoozedUntilRef.current = {};
    addDoseWithTime(med.id, timestamp);
    setSnackbar({
      open: true,
      message: `Dose for ${med.name} logged for ${formatTime(timestamp)}.`,
      severity: 'success',
    });
  };

  const handleUpdateHistoryDose = (medId: string, index: number, newTimestamp: string) => {
    alarmManager.unlockAudio();
    notifiedDosesRef.current.clear();
    snoozedUntilRef.current = {};
    updateDose(medId, index, newTimestamp);
    setSnackbar({
      open: true,
      message: `Dose #${index + 1} updated to ${formatTime(newTimestamp)}.`,
      severity: 'success',
    });
  };

  const handleDeleteHistoryDose = (medId: string, index: number) => {
    alarmManager.unlockAudio();
    notifiedDosesRef.current.clear();
    snoozedUntilRef.current = {};
    deleteDose(medId, index);
    setSnackbar({
      open: true,
      message: `Dose #${index + 1} removed.`,
      severity: 'info',
    });
  };

  const handleConfirmReset = () => {
    resetLogs();
    notifiedDosesRef.current.clear();
    setResetDialogOpen(false);
    setSnackbar({
      open: true,
      message: 'Logs have been reset for a new day.',
      severity: 'info',
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* App Bar Header */}
      <Header
        onOpenResetDialog={() => setResetDialogOpen(true)}
        canInstall={canInstall}
        onInstall={installApp}
        notificationPermission={notificationPermission}
        onRequestNotification={handleRequestNotification}
      />

      {/* Main Content Area */}
      <Container maxWidth="md" sx={{ mt: { xs: 2.5, sm: 4 }, mb: 4, flexGrow: 1, px: { xs: 2, sm: 3 } }}>
        {/* Install App Promotion Banner (Dismissible) */}
        {canInstall && !dismissInstallBanner && (
          <InstallPromptBar
            onInstall={installApp}
            onDismiss={() => setDismissInstallBanner(true)}
          />
        )}

        {/* Due Alerts and Notification Enablement Prompt */}
        <DueAlertBanner
          medications={MEDICATIONS}
          logs={logs}
          notificationPermission={notificationPermission}
          isAlarmActive={alarmActive}
          onRequestNotification={handleRequestNotification}
          onLogDose={handleLogDoseWithAlarmStop}
          onTestAlarm={handleTestAlarm}
          onStopAlarm={handleStopAlarm}
        />

        {/* Info Banner with hygiene guidance */}
        <InfoBanner />

        {/* Medication Cards Grid */}
        <MedicationGrid
          medications={MEDICATIONS}
          logs={logs}
          onLogDose={handleLogDose}
          onUpdateLastDose={handleUpdateLastDose}
          onDeleteLastDose={handleDeleteLastDose}
          onAddDoseWithTime={handleAddDoseWithTime}
        />

        {/* History Toggle Button */}
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Button
            variant="outlined"
            color="inherit"
            size="medium"
            startIcon={<HistoryIcon />}
            onClick={() => setViewHistory((prev) => !prev)}
            sx={{
              borderRadius: 3,
              borderColor: 'grey.400',
              bgcolor: 'background.paper',
              '&:hover': {
                borderColor: 'primary.main',
                bgcolor: 'background.paper',
              },
            }}
          >
            {viewHistory ? 'Hide History' : "View Today's History"}
          </Button>
        </Box>

        {/* History Log Section */}
        {viewHistory && (
          <HistoryView
            medications={MEDICATIONS}
            logs={logs}
            onUpdateDose={handleUpdateHistoryDose}
            onDeleteDose={handleDeleteHistoryDose}
          />
        )}
      </Container>

      {/* Reset Confirmation Dialog */}
      <ResetDialog
        open={resetDialogOpen}
        onClose={() => setResetDialogOpen(false)}
        onConfirm={handleConfirmReset}
      />

      {/* Continuous Ringing Alarm Dialog */}
      <ActiveAlarmDialog
        open={alarmActive}
        med={alarmMed}
        onStopAlarm={handleStopAlarm}
        onLogDose={handleLogDoseWithAlarmStop}
        onSnooze={handleSnoozeAlarm}
      />

      {/* Toast Feedback Alerts */}
      <DoseSnackbar state={snackbar} onClose={handleCloseSnackbar} />
    </Box>
  );
}
