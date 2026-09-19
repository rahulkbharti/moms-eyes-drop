import type React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';

interface ResetDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const ResetDialog: React.FC<ResetDialogProps> = ({ open, onClose, onConfirm }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="reset-dialog-title"
      aria-describedby="reset-dialog-description"
      slotProps={{
        paper: {
          sx: { borderRadius: 3, p: 1 },
        },
      }}
    >
      <DialogTitle id="reset-dialog-title" sx={{ fontWeight: 600 }}>
        Start a New Day?
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="reset-dialog-description">
          This will clear all logged doses for today. Only do this if it is a new day and you are starting the medication schedule from dose 1 again.
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ pb: 2, px: 3 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button onClick={onConfirm} color="error" variant="contained" autoFocus>
          Reset Logs
        </Button>
      </DialogActions>
    </Dialog>
  );
};
