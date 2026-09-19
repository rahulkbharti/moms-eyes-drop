import { useState, useEffect, useCallback } from 'react';
import type { DoseLogs, MedicationConfig, SnackbarState } from '../types/medication';
import { MEDICATIONS, STORAGE_KEY } from '../config/medications';
import { getNextDoseTime } from '../utils/dateUtils';

const getInitialLogs = (): DoseLogs => {
  const defaultState: DoseLogs = {};
  MEDICATIONS.forEach((med) => {
    defaultState[med.id] = [];
  });

  try {
    const savedLogs = localStorage.getItem(STORAGE_KEY);
    if (savedLogs) {
      const parsed = JSON.parse(savedLogs);
      // Ensure all configured meds exist in state
      MEDICATIONS.forEach((med) => {
        if (!Array.isArray(parsed[med.id])) {
          parsed[med.id] = [];
        }
      });
      return parsed;
    }
  } catch (e) {
    console.error('Error loading medication logs from localStorage', e);
  }

  return defaultState;
};

export const useMedicationLogs = () => {
  const [logs, setLogs] = useState<DoseLogs>(getInitialLogs);

  // Sync to local storage whenever logs change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
    } catch (e) {
      console.error('Error saving medication logs to localStorage', e);
    }
  }, [logs]);

  const logDose = useCallback(
    (med: MedicationConfig): { success: boolean; feedback: Omit<SnackbarState, 'open'> } => {
      const currentLogs = logs[med.id] || [];

      if (currentLogs.length >= med.totalDoses) {
        return {
          success: false,
          feedback: {
            message: `All doses completed for ${med.name} today!`,
            severity: 'info',
          },
        };
      }

      const lastDoseTime = currentLogs.length > 0 ? currentLogs[currentLogs.length - 1] : null;
      const nextTime = getNextDoseTime(lastDoseTime, med.gapHours);

      // Warning if taken slightly early
      if (nextTime && new Date() < nextTime) {
        console.log(`Dose for ${med.name} taken slightly early`);
      }

      const timestamp = new Date().toISOString();
      setLogs((prev) => ({
        ...prev,
        [med.id]: [...(prev[med.id] || []), timestamp],
      }));

      return {
        success: true,
        feedback: {
          message: `${med.name} logged successfully!`,
          severity: 'success',
        },
      };
    },
    [logs]
  );

  const updateDose = useCallback(
    (medId: string, doseIndex: number, newTimestamp: string) => {
      setLogs((prev) => {
        const currentLogs = prev[medId] || [];
        if (doseIndex < 0 || doseIndex >= currentLogs.length) {
          return prev;
        }
        const updated = [...currentLogs];
        updated[doseIndex] = newTimestamp;
        updated.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
        return {
          ...prev,
          [medId]: updated,
        };
      });
    },
    []
  );

  const updateLastDose = useCallback(
    (medId: string, newTimestamp: string) => {
      setLogs((prev) => {
        const currentLogs = prev[medId] || [];
        if (currentLogs.length === 0) {
          return {
            ...prev,
            [medId]: [newTimestamp],
          };
        }
        const updated = [...currentLogs];
        updated[updated.length - 1] = newTimestamp;
        updated.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
        return {
          ...prev,
          [medId]: updated,
        };
      });
    },
    []
  );

  const deleteDose = useCallback(
    (medId: string, doseIndex: number) => {
      setLogs((prev) => {
        const currentLogs = prev[medId] || [];
        if (doseIndex < 0 || doseIndex >= currentLogs.length) {
          return prev;
        }
        const updated = currentLogs.filter((_, idx) => idx !== doseIndex);
        return {
          ...prev,
          [medId]: updated,
        };
      });
    },
    []
  );

  const addDoseWithTime = useCallback(
    (medId: string, timestamp: string) => {
      setLogs((prev) => {
        const currentLogs = prev[medId] || [];
        const updated = [...currentLogs, timestamp];
        updated.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
        return {
          ...prev,
          [medId]: updated,
        };
      });
    },
    []
  );

  const resetLogs = useCallback(() => {
    const emptyState: DoseLogs = {};
    MEDICATIONS.forEach((med) => {
      emptyState[med.id] = [];
    });
    setLogs(emptyState);
  }, []);

  return {
    logs,
    logDose,
    updateLastDose,
    updateDose,
    deleteDose,
    addDoseWithTime,
    resetLogs,
  };
};
