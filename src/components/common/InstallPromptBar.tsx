import type React from 'react';
import { Paper, Box, Typography, Button, IconButton } from '@mui/material';
import { InstallMobile as InstallIcon, Close as CloseIcon } from '@mui/icons-material';

interface InstallPromptBarProps {
  onInstall: () => void;
  onDismiss: () => void;
}

export const InstallPromptBar: React.FC<InstallPromptBarProps> = ({ onInstall, onDismiss }) => {
  return (
    <Paper
      elevation={2}
      sx={{
        p: 2,
        mb: 3,
        borderRadius: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 1.5,
        bgcolor: 'primary.50',
        border: '1px solid',
        borderColor: 'primary.100',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <InstallIcon color="primary" />
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }} color="primary.dark">
            Install Eye Drops App
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Install on your phone or computer for instant offline access and reminders.
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 'auto' }}>
        <Button
          size="small"
          variant="contained"
          color="primary"
          startIcon={<InstallIcon />}
          onClick={onInstall}
        >
          Install
        </Button>
        <IconButton size="small" onClick={onDismiss} aria-label="Dismiss install banner">
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
    </Paper>
  );
};
