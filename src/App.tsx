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
} from './utils/notificationUtils';
import { getNextDoseTime, isDoseDue } from './utils/dateUtils';

import { Header } from './components/common/Header';
import { InfoBanner } from './components/common/InfoBanner';
import { ResetDialog } from './components/common/ResetDialog';
import { DoseSnackbar } from './components/common/DoseSnackbar';
import { InstallPromptBar } from './components/common/InstallPromptBar';
import { MedicationGrid } from './components/medication/MedicationGrid';
import { HistoryView } from './components/history/HistoryView';

export default function App() {
  const { logs, logDose, resetLogs } = useMedicationLogs();
  const currentTime = useCurrentTime(30000); // Ticks every 30 seconds
  const { canInstall, installApp } = usePwaInstall();

  const [dismissInstallBanner, setDismissInstallBanner] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [viewHistory, setViewHistory] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(
    getNotificationPermission()
  );

  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Keep track of which doses have already triggered a notification today to prevent spam
  const notifiedDosesRef = useRef<Set<string>>(new Set());

  // Check for due doses and trigger notifications if permitted
  useEffect(() => {
    if (notificationPermission !== 'granted') return;

    MEDICATIONS.forEach((med) => {
      const medLogs = logs[med.id] || [];
      const dosesTaken = medLogs.length;

      // Only remind if medication is in progress (taken at least once, but not completed)
      if (dosesTaken > 0 && dosesTaken < med.totalDoses) {
        const lastDoseStr = medLogs[dosesTaken - 1];
        const nextDoseTime = getNextDoseTime(lastDoseStr, med.gapHours);

        if (nextDoseTime && isDoseDue(nextDoseTime)) {
          const doseKey = `${med.id}-dose-${dosesTaken + 1}-${nextDoseTime.toISOString()}`;
          if (!notifiedDosesRef.current.has(doseKey)) {
            notifiedDosesRef.current.add(doseKey);
            sendDoseDueNotification(med.name);
          }
        }
      }
    });
  }, [currentTime, logs, notificationPermission]);

  const handleRequestNotification = async () => {
    const permission = await requestNotificationPermission();
    setNotificationPermission(permission);
    if (permission === 'granted') {
      setSnackbar({
        open: true,
        message: 'Notifications enabled! You will be alerted when doses are due.',
        severity: 'success',
      });
    } else if (permission === 'denied') {
      setSnackbar({
        open: true,
        message: 'Notification permission was denied in browser settings.',
        severity: 'info',
      });
    }
  };

  const handleLogDose = (med: MedicationConfig) => {
    const result = logDose(med);
    setSnackbar({
      open: true,
      message: result.feedback.message,
      severity: result.feedback.severity,
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

        {/* Info Banner with hygiene guidance */}
        <InfoBanner />

        {/* Medication Cards Grid */}
        <MedicationGrid
          medications={MEDICATIONS}
          logs={logs}
          onLogDose={handleLogDose}
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
          <HistoryView medications={MEDICATIONS} logs={logs} />
        )}
      </Container>

      {/* Reset Confirmation Dialog */}
      <ResetDialog
        open={resetDialogOpen}
        onClose={() => setResetDialogOpen(false)}
        onConfirm={handleConfirmReset}
      />

      {/* Toast Feedback Alerts */}
      <DoseSnackbar state={snackbar} onClose={handleCloseSnackbar} />
    </Box>
  );
}
