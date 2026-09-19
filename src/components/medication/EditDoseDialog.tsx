import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Chip,
  IconButton,
  Alert,
} from '@mui/material';
import {
  Close as CloseIcon,
  AccessTime as AccessTimeIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
  Alarm as AlarmIcon,
} from '@mui/icons-material';
import type { MedicationConfig } from '../../types/medication';
import {
  toTimeInputValue,
  applyTimeToDate,
  getNextDoseTime,
  formatTime,
  getTimeRemaining,
} from '../../utils/dateUtils';

interface EditDoseDialogProps {
  open: boolean;
  onClose: () => void;
  med: MedicationConfig;
  currentTimestamp: string | null;
  doseNumber?: number;
  isNewDose?: boolean;
  onSave: (newTimestamp: string) => void;
  onDelete?: () => void;
}

export const EditDoseDialog: React.FC<EditDoseDialogProps> = ({
  open,
  onClose,
  med,
  currentTimestamp,
  doseNumber,
  isNewDose = false,
  onSave,
  onDelete,
}) => {
  const [timeValue, setTimeValue] = useState<string>('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (open) {
      setConfirmDelete(false);
      if (currentTimestamp) {
        setTimeValue(toTimeInputValue(currentTimestamp));
      } else {
        setTimeValue(toTimeInputValue(new Date()));
      }
    }
  }, [open, currentTimestamp]);

  const handleApplyPreset = (minutesAgo: number) => {
    const target = new Date(Date.now() - minutesAgo * 60 * 1000);
    setTimeValue(toTimeInputValue(target));
  };

  const handleSave = () => {
    if (!timeValue) return;
    try {
      const iso = applyTimeToDate(timeValue, currentTimestamp);
      onSave(iso);
      onClose();
    } catch (e) {
      console.error('Invalid time', e);
    }
  };

  const handleDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    if (onDelete) {
      onDelete();
      onClose();
    }
  };

  // Preview next dose based on input
  let previewNextDose: Date | null = null;
  let isValidTime = false;
  try {
    if (timeValue && /^\d{1,2}:\d{2}$/.test(timeValue)) {
      const computedIso = applyTimeToDate(timeValue, currentTimestamp);
      previewNextDose = getNextDoseTime(computedIso, med.gapHours);
      isValidTime = true;
    }
  } catch {
    isValidTime = false;
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3,
            p: { xs: 1, sm: 1.5 },
          },
        },
      }}
    >
      <DialogTitle sx={{ pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Chip
            label={med.name}
            color={med.color}
            size="small"
            sx={{ mb: 1, fontWeight: 600 }}
          />
          <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
            {isNewDose ? 'Log Dose with Time' : doseNumber ? `Edit Dose #${doseNumber} Time` : 'Edit Last Dose Time'}
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose} sx={{ color: 'text.secondary' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ py: 2.5 }}>
        {currentTimestamp && !isNewDose && (
          <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Currently logged as:
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              {formatTime(currentTimestamp)}
            </Typography>
          </Box>
        )}

        {/* Time Input Only */}
        <TextField
          label="Dose Time"
          type="time"
          value={timeValue}
          onChange={(e) => setTimeValue(e.target.value)}
          fullWidth
          slotProps={{
            inputLabel: { shrink: true },
          }}
          sx={{ mb: 2 }}
        />

        {/* Quick Presets */}
        <Box sx={{ mb: 2.5 }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, fontWeight: 600 }}>
            Quick Adjust:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            <Chip
              label="Now"
              size="small"
              variant="outlined"
              icon={<AccessTimeIcon sx={{ fontSize: 14 }} />}
              onClick={() => handleApplyPreset(0)}
              clickable
            />
            <Chip
              label="15m ago"
              size="small"
              variant="outlined"
              onClick={() => handleApplyPreset(15)}
              clickable
            />
            <Chip
              label="30m ago"
              size="small"
              variant="outlined"
              onClick={() => handleApplyPreset(30)}
              clickable
            />
            <Chip
              label="1 hr ago"
              size="small"
              variant="outlined"
              onClick={() => handleApplyPreset(60)}
              clickable
            />
            <Chip
              label="2 hrs ago"
              size="small"
              variant="outlined"
              onClick={() => handleApplyPreset(120)}
              clickable
            />
          </Box>
        </Box>

        {/* Next Dose Preview */}
        {isValidTime && previewNextDose && (
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              bgcolor: 'background.default',
              border: '1px dashed',
              borderColor: 'primary.light',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}>
              <AlarmIcon color="primary" sx={{ fontSize: 18 }} />
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
                Next Dose Preview
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {formatTime(previewNextDose)} ({getTimeRemaining(previewNextDose)})
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Calculated based on {med.gapHours} hours gap
            </Typography>
          </Box>
        )}

        {/* Delete Confirmation Alert */}
        {confirmDelete && (
          <Alert
            severity="warning"
            sx={{ mt: 2 }}
            action={
              <Button color="inherit" size="small" onClick={() => setConfirmDelete(false)}>
                Cancel
              </Button>
            }
          >
            Click "Confirm Delete" below to remove this dose.
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 2.5, py: 2, justifyContent: 'space-between' }}>
        <Box>
          {!isNewDose && onDelete && (
            <Button
              color="error"
              size="small"
              startIcon={<DeleteIcon />}
              onClick={handleDelete}
              variant={confirmDelete ? 'contained' : 'text'}
            >
              {confirmDelete ? 'Confirm Delete' : 'Delete Dose'}
            </Button>
          )}
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button onClick={onClose} color="inherit" size="medium">
            Cancel
          </Button>
          <Button
            variant="contained"
            color={med.color}
            size="medium"
            startIcon={<CheckIcon />}
            onClick={handleSave}
            disabled={!isValidTime}
          >
            Save Time
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};
