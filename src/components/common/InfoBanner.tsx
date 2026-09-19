import type React from 'react';
import { Alert } from '@mui/material';
import { Info as InfoIcon } from '@mui/icons-material';

export const InfoBanner: React.FC = () => {
  return (
    <Alert
      severity="info"
      sx={{
        mb: 3,
        borderRadius: 2,
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        '& .MuiAlert-icon': {
          alignItems: 'center',
        },
      }}
      icon={<InfoIcon />}
    >
      Ensure drops are administered with clean hands. Wait 5-10 minutes between different types of eye drops if they are due at the same time.
    </Alert>
  );
};
