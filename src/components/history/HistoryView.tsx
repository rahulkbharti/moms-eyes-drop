import React, { useState } from 'react';
import {
  Paper,
  Typography,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  History as HistoryIcon,
  CheckCircle as CheckCircleIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import type { DoseLogs, MedicationConfig } from '../../types/medication';
import { formatDate, formatTime } from '../../utils/dateUtils';
import { EditDoseDialog } from '../medication/EditDoseDialog';

interface HistoryViewProps {
  medications: MedicationConfig[];
  logs: DoseLogs;
  onUpdateDose?: (medId: string, index: number, newTimestamp: string) => void;
  onDeleteDose?: (medId: string, index: number) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  medications,
  logs,
  onUpdateDose,
  onDeleteDose,
}) => {
  const [editingDose, setEditingDose] = useState<{
    med: MedicationConfig;
    index: number;
    timestamp: string;
  } | null>(null);

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
                    <ListItem
                      key={index}
                      sx={{ py: 0.5 }}
                      secondaryAction={
                        onUpdateDose ? (
                          <Tooltip title="Edit this dose">
                            <IconButton
                              edge="end"
                              size="small"
                              onClick={() =>
                                setEditingDose({
                                  med,
                                  index,
                                  timestamp: timeStr,
                                })
                              }
                              sx={{ color: 'text.secondary' }}
                            >
                              <EditIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>
                        ) : undefined
                      }
                    >
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

      {/* Edit Dialog for History items */}
      {editingDose && (
        <EditDoseDialog
          open={Boolean(editingDose)}
          onClose={() => setEditingDose(null)}
          med={editingDose.med}
          currentTimestamp={editingDose.timestamp}
          doseNumber={editingDose.index + 1}
          onSave={(newTimestamp) => {
            if (onUpdateDose) {
              onUpdateDose(editingDose.med.id, editingDose.index, newTimestamp);
            }
          }}
          onDelete={
            onDeleteDose
              ? () => onDeleteDose(editingDose.med.id, editingDose.index)
              : undefined
          }
        />
      )}
    </Paper>
  );
};
