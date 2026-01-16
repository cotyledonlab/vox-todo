import React from 'react';
import {
  Box,
  Button,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

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
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <Paper
      sx={{
        p: { xs: 2, md: 2.5 },
        borderRadius: '20px',
        background: isLight
          ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.04)}, ${alpha(theme.palette.success.main, 0.02)})`
          : `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)}, ${alpha(theme.palette.success.main, 0.04)})`,
      }}
    >
      <Stack spacing={2.5}>
        <Box>
          <Typography
            variant="overline"
            sx={{
              color: 'text.secondary',
              fontWeight: 600,
              letterSpacing: '0.08em',
              fontSize: '0.7rem',
            }}
          >
            Progress
          </Typography>
          <Stack direction="row" alignItems="baseline" spacing={1}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                letterSpacing: '-0.02em',
                background: isLight
                  ? `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.success.main})`
                  : `linear-gradient(135deg, ${theme.palette.primary.light}, ${theme.palette.success.light})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {progress}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              complete
            </Typography>
          </Stack>
        </Box>

        <Box sx={{ position: 'relative' }}>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 12,
              borderRadius: 999,
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              '& .MuiLinearProgress-bar': {
                borderRadius: 999,
                background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.success.main})`,
              },
            }}
          />
        </Box>

        <Stack direction="row" spacing={1.5}>
          <Box
            sx={{
              flex: 1,
              p: 1.5,
              borderRadius: '12px',
              background: alpha(theme.palette.warning.main, isLight ? 0.08 : 0.12),
              border: `1px solid ${alpha(theme.palette.warning.main, 0.15)}`,
              textAlign: 'center',
            }}
          >
            <Stack direction="row" spacing={0.75} alignItems="center" justifyContent="center">
              <PendingIcon sx={{ fontSize: 18, color: 'warning.main' }} />
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'warning.main' }}>
                {active}
              </Typography>
            </Stack>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
              Active
            </Typography>
          </Box>
          <Box
            sx={{
              flex: 1,
              p: 1.5,
              borderRadius: '12px',
              background: alpha(theme.palette.success.main, isLight ? 0.08 : 0.12),
              border: `1px solid ${alpha(theme.palette.success.main, 0.15)}`,
              textAlign: 'center',
            }}
          >
            <Stack direction="row" spacing={0.75} alignItems="center" justifyContent="center">
              <CheckCircleIcon sx={{ fontSize: 18, color: 'success.main' }} />
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'success.main' }}>
                {completed}
              </Typography>
            </Stack>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
              Done
            </Typography>
          </Box>
        </Stack>

        <Stack spacing={1}>
          <Button
            variant="contained"
            onClick={onMarkAllComplete}
            disabled={total === 0 || completed === total}
            startIcon={<DoneAllIcon />}
            fullWidth
            sx={{ py: 1.25 }}
          >
            Mark all complete
          </Button>
          <Button
            variant="outlined"
            onClick={onClearCompleted}
            disabled={completed === 0}
            startIcon={<ClearAllIcon />}
            fullWidth
            sx={{ py: 1 }}
          >
            Clear completed
          </Button>
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              color="error"
              onClick={onDeleteAll}
              disabled={total === 0}
              startIcon={<DeleteSweepIcon />}
              fullWidth
              size="small"
              sx={{
                borderColor: alpha(theme.palette.error.main, 0.3),
                '&:hover': {
                  borderColor: theme.palette.error.main,
                  backgroundColor: alpha(theme.palette.error.main, 0.08),
                },
              }}
            >
              Delete all
            </Button>
            <Button
              variant="text"
              color="inherit"
              onClick={onClearAllData}
              startIcon={<RestartAltIcon />}
              fullWidth
              size="small"
              sx={{
                color: 'text.secondary',
                '&:hover': {
                  backgroundColor: alpha(theme.palette.text.secondary, 0.08),
                },
              }}
            >
              Reset
            </Button>
          </Stack>
        </Stack>
      </Stack>
    </Paper>
  );
};

export default TaskStats;
