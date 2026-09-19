import type React from 'react';
import { Snackbar, Alert } from '@mui/material';
import type { SnackbarState } from '../../types/medication';

interface DoseSnackbarProps {
  state: SnackbarState;
  onClose: () => void;
}

export const DoseSnackbar: React.FC<DoseSnackbarProps> = ({ state, onClose }) => {
  const handleClose = (_event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') return;
    onClose();
  };

  return (
    <Snackbar
      open={state.open}
      autoHideDuration={4000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert
        onClose={handleClose}
        severity={state.severity}
        variant="filled"
        sx={{
          width: '100%',
          borderRadius: 2,
          boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
          fontWeight: 500,
        }}
      >
        {state.message}
      </Alert>
    </Snackbar>
  );
};
