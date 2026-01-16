import React from 'react';
import { Box, Typography } from '@mui/material';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import type { TodoFilter } from '../types/Todo';

interface EmptyStateProps {
  filter: TodoFilter;
}

const EmptyState: React.FC<EmptyStateProps> = ({ filter }) => {
  const message =
    filter === 'completed'
      ? 'No completed tasks yet. Finish something to celebrate it here.'
      : filter === 'active'
        ? 'All caught up. Add a new task or use your voice.'
        : 'Start by adding a task or speaking one out loud.';

  return (
    <Box
      sx={{
        p: 4,
        textAlign: 'center',
        borderRadius: 3,
        border: '1px dashed',
        borderColor: 'divider',
      }}
    >
      <PlaylistAddIcon sx={{ fontSize: 40, color: 'secondary.main' }} />
      <Typography variant="h6" sx={{ mt: 1, fontWeight: 700 }}>
        Nothing here yet
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        {message}
      </Typography>
    </Box>
  );
};

export default EmptyState;
