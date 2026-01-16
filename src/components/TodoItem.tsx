import React from 'react';
import {
  Box,
  Checkbox,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Tooltip,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import type { Todo } from '../types/Todo';

interface TodoItemProps {
  todo: Todo;
  index: number;
  total: number;
  onToggle: (id: string) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (todo: Todo) => void;
  onMove: (id: string, direction: 'up' | 'down') => void;
}

const TodoItem: React.FC<TodoItemProps> = ({
  todo,
  index,
  total,
  onToggle,
  onEdit,
  onDelete,
  onMove,
}) => (
  <ListItem
    disablePadding
    sx={{
      mb: 1.5,
      borderRadius: 3,
      border: '1px solid',
      borderColor: 'divider',
      backgroundColor: 'background.paper',
    }}
    secondaryAction={
      <Stack direction="row" spacing={0.5} alignItems="center">
        <Tooltip title="Move up">
          <span>
            <IconButton
              size="small"
              onClick={() => onMove(todo.id, 'up')}
              disabled={index === 0}
              aria-label={`Move ${todo.text} up`}
            >
              <ArrowUpwardIcon fontSize="inherit" />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="Move down">
          <span>
            <IconButton
              size="small"
              onClick={() => onMove(todo.id, 'down')}
              disabled={index === total - 1}
              aria-label={`Move ${todo.text} down`}
            >
              <ArrowDownwardIcon fontSize="inherit" />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="Edit">
          <IconButton
            size="small"
            onClick={() => onEdit(todo)}
            aria-label={`Edit ${todo.text}`}
          >
            <EditIcon fontSize="inherit" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete">
          <IconButton
            size="small"
            color="error"
            onClick={() => onDelete(todo)}
            aria-label={`Delete ${todo.text}`}
          >
            <DeleteIcon fontSize="inherit" />
          </IconButton>
        </Tooltip>
      </Stack>
    }
  >
    <ListItemButton
      onClick={() => onToggle(todo.id)}
      sx={{ borderRadius: 3, pr: 12 }}
      aria-label={`Toggle ${todo.text}`}
    >
      <ListItemIcon>
        <Checkbox
          edge="start"
          checked={todo.completed}
          tabIndex={-1}
          disableRipple
          inputProps={{ 'aria-label': `Mark ${todo.text} complete` }}
        />
      </ListItemIcon>
      <ListItemText
        primary={
          <Box
            component="span"
            sx={{
              textDecoration: todo.completed ? 'line-through' : 'none',
              color: todo.completed ? 'text.secondary' : 'text.primary',
              fontWeight: 600,
            }}
          >
            {todo.text}
          </Box>
        }
        secondary={new Date(todo.updatedAt).toLocaleString()}
        secondaryTypographyProps={{
          variant: 'caption',
          color: 'text.secondary',
        }}
      />
    </ListItemButton>
  </ListItem>
);

export default TodoItem;
