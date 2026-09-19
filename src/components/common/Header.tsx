import type React from 'react';
import { AppBar, Toolbar, Typography, IconButton, Tooltip, Box, Button } from '@mui/material';
import {
  Restore as ResetIcon,
  InstallMobile as InstallIcon,
  Notifications as NotifyIcon,
  NotificationsActive as NotifyActiveIcon,
  WaterDrop as WaterDropIcon,
} from '@mui/icons-material';

interface HeaderProps {
  onOpenResetDialog: () => void;
  canInstall?: boolean;
  onInstall?: () => void;
  notificationPermission?: NotificationPermission;
  onRequestNotification?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenResetDialog,
  canInstall,
  onInstall,
  notificationPermission,
  onRequestNotification,
}) => {
  return (
    <AppBar position="sticky" color="primary" elevation={1}>
      <Toolbar sx={{ px: { xs: 2, sm: 3 } }}>
        <WaterDropIcon sx={{ mr: 1.5, display: { xs: 'none', sm: 'block' } }} />
        <Typography
          variant="h6"
          component="h1"
          sx={{
            flexGrow: 1,
            fontWeight: 700,
            letterSpacing: 0.2,
            fontSize: { xs: '1.1rem', sm: '1.25rem' },
          }}
        >
          Maa's Eye Drops Reminder
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {onRequestNotification && (
            <Tooltip
              title={
                notificationPermission === 'granted'
                  ? 'Notifications active'
                  : 'Enable dose reminder notifications'
              }
            >
              <IconButton
                color="inherit"
                onClick={onRequestNotification}
                size="medium"
                aria-label="Toggle notifications"
              >
                {notificationPermission === 'granted' ? (
                  <NotifyActiveIcon sx={{ color: '#ffeb3b' }} />
                ) : (
                  <NotifyIcon />
                )}
              </IconButton>
            </Tooltip>
          )}

          {canInstall && onInstall && (
            <Button
              variant="outlined"
              color="inherit"
              size="small"
              startIcon={<InstallIcon />}
              onClick={onInstall}
              sx={{
                borderColor: 'rgba(255,255,255,0.7)',
                '&:hover': { borderColor: '#ffffff', bgcolor: 'rgba(255,255,255,0.1)' },
                display: { xs: 'none', sm: 'inline-flex' },
              }}
            >
              Install App
            </Button>
          )}

          {canInstall && onInstall && (
            <Tooltip title="Install App to Home Screen">
              <IconButton
                color="inherit"
                onClick={onInstall}
                sx={{ display: { xs: 'inline-flex', sm: 'none' } }}
                aria-label="Install App"
              >
                <InstallIcon />
              </IconButton>
            </Tooltip>
          )}

          <Tooltip title="Reset for new day">
            <IconButton
              color="inherit"
              onClick={onOpenResetDialog}
              aria-label="Reset for new day"
            >
              <ResetIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
};
