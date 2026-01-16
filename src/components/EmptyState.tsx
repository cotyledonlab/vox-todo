import React from 'react';
import { Box, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CelebrationIcon from '@mui/icons-material/Celebration';
import type { TodoFilter } from '../types/Todo';

interface EmptyStateProps {
  filter: TodoFilter;
}

const EmptyState: React.FC<EmptyStateProps> = ({ filter }) => {
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';

  const config = {
    completed: {
      icon: CelebrationIcon,
      title: 'No picked up items yet',
      message: 'Pick up an item to see it celebrated here.',
      color: theme.palette.success.main,
      gradient: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.12)}, ${alpha(theme.palette.success.light, 0.06)})`,
    },
    active: {
      icon: CheckCircleOutlineIcon,
      title: 'All caught up!',
      message: 'You\'ve picked up everything. Add a new item when ready.',
      color: theme.palette.primary.main,
      gradient: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.12)}, ${alpha(theme.palette.info.main, 0.06)})`,
    },
    all: {
      icon: PlaylistAddIcon,
      title: 'Ready to get started',
      message: 'Add your first item below. Tip: swipe items left to delete them.',
      color: theme.palette.secondary.main,
      gradient: `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.1)}, ${alpha(theme.palette.warning.main, 0.05)})`,
    },
  };

  const { icon: Icon, title, message, color, gradient } = config[filter];

  return (
    <Box
      sx={{
        py: 5,
        px: 4,
        textAlign: 'center',
        borderRadius: '20px',
        background: gradient,
        border: `1px dashed ${alpha(color, 0.3)}`,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '200px',
          height: '200px',
          background: `radial-gradient(circle, ${alpha(color, 0.08)} 0%, transparent 70%)`,
          pointerEvents: 'none',
        },
      }}
    >
      <Box
        sx={{
          display: 'inline-flex',
          p: 2,
          borderRadius: '16px',
          background: alpha(color, isLight ? 0.1 : 0.15),
          mb: 2,
          position: 'relative',
        }}
      >
        <Icon
          sx={{
            fontSize: 40,
            color: color,
            filter: `drop-shadow(0 4px 8px ${alpha(color, 0.3)})`,
          }}
        />
      </Box>
      <Typography
        variant="h6"
        sx={{
          fontWeight: 700,
          letterSpacing: '-0.01em',
          color: 'text.primary',
          mb: 1,
        }}
      >
        {title}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          color: 'text.secondary',
          maxWidth: 280,
          mx: 'auto',
          lineHeight: 1.6,
        }}
      >
        {message}
      </Typography>
    </Box>
  );
};

export default EmptyState;
