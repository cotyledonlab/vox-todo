import React from 'react';
import {
  Box,
  Button,
  LinearProgress,
  Stack,
  Typography,
} from '@mui/material';

interface TaskStatsProps {
  total: number;
  completed: number;
  active: number;
  onClearCompleted: () => void;
  onMarkAllComplete: () => void;
  onDeleteAll: () => void;
  onClearAllData: () => void;
}

const TaskStats: React.FC<TaskStatsProps> = ({
  total,
  completed,
  active,
  onClearCompleted,
  onMarkAllComplete,
  onDeleteAll,
  onClearAllData,
}) => {
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <Box sx={{ p: 2.5, borderRadius: 3, backgroundColor: 'background.paper' }}>
      <Stack spacing={2}>
        <Box>
          <Typography variant="subtitle2" color="text.secondary">
            Task progress
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {completed}/{total} completed
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{ height: 10, borderRadius: 999 }}
        />
        <Stack direction="row" spacing={2} justifyContent="space-between">
          <Typography variant="body2">Active: {active}</Typography>
          <Typography variant="body2">Done: {completed}</Typography>
        </Stack>
        <Stack spacing={1.5}>
          <Button
            variant="contained"
            onClick={onMarkAllComplete}
            disabled={total === 0 || completed === total}
          >
            Mark all complete
          </Button>
          <Button
            variant="outlined"
            onClick={onClearCompleted}
            disabled={completed === 0}
          >
            Clear completed
          </Button>
          <Button
            variant="outlined"
            color="error"
            onClick={onDeleteAll}
            disabled={total === 0}
          >
            Delete all
          </Button>
          <Button
            variant="text"
            color="secondary"
            onClick={onClearAllData}
          >
            Reset local data
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};

export default TaskStats;
