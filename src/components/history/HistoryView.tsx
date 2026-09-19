import type React from 'react';
import {
  Paper,
  Typography,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  History as HistoryIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import type { DoseLogs, MedicationConfig } from '../../types/medication';
import { formatDate, formatTime } from '../../utils/dateUtils';

interface HistoryViewProps {
  medications: MedicationConfig[];
  logs: DoseLogs;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ medications, logs }) => {
  return (
    <Paper
      elevation={2}
      sx={{
        p: { xs: 2, sm: 3 },
        mt: 4,
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'grey.200',
      }}
    >
      <Typography
        variant="h6"
        gutterBottom
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          fontWeight: 600,
        }}
      >
        <HistoryIcon color="primary" /> Today's Log History
      </Typography>
      <Divider sx={{ mb: 2 }} />

      <Grid container spacing={3}>
        {medications.map((med) => {
          const medLogs = logs[med.id] || [];
          return (
            <Grid size={{ xs: 12, md: 6 }} key={`history-${med.id}`}>
              <Typography
                variant="subtitle1"
                color={`${med.color}.main`}
                sx={{ fontWeight: 'bold' }}
                gutterBottom
              >
                {med.name}
              </Typography>
              {medLogs.length === 0 ? (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontStyle: 'italic', mb: 2 }}
                >
                  No doses logged yet.
                </Typography>
              ) : (
                <List dense sx={{ bgcolor: 'grey.50', borderRadius: 2, p: 1 }}>
                  {medLogs.map((timeStr, index) => (
                    <ListItem key={index} sx={{ py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <CheckCircleIcon color="success" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary={`Dose ${index + 1}`}
                        secondary={`${formatDate(timeStr)} at ${formatTime(timeStr)}`}
                        slotProps={{
                          primary: { sx: { fontWeight: 600, fontSize: '0.9rem' } },
                          secondary: { sx: { fontSize: '0.8rem' } },
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </Grid>
          );
        })}
      </Grid>
    </Paper>
  );
};
