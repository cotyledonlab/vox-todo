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
import { alpha, useTheme } from '@mui/material/styles';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
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
}) => {
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';

  return (
    <ListItem
      disablePadding
      sx={{
        mb: 1.5,
        borderRadius: '16px',
        border: '1px solid',
        borderColor: todo.completed
          ? alpha(theme.palette.success.main, 0.2)
          : 'divider',
        backgroundColor: todo.completed
          ? alpha(theme.palette.success.main, isLight ? 0.04 : 0.08)
          : 'background.paper',
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: isLight
            ? '0 8px 25px rgba(0, 0, 0, 0.08)'
            : '0 8px 25px rgba(0, 0, 0, 0.3)',
          borderColor: todo.completed
            ? alpha(theme.palette.success.main, 0.3)
            : alpha(theme.palette.primary.main, 0.3),
        },
        overflow: 'hidden',
        position: 'relative',
        '&::before': todo.completed ? {
          content: '""',
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: '4px',
          background: `linear-gradient(180deg, ${theme.palette.success.main}, ${theme.palette.success.light})`,
          borderRadius: '4px 0 0 4px',
        } : {},
      }}
      secondaryAction={
        <Stack
          direction="row"
          spacing={0.5}
          alignItems="center"
          sx={{
            opacity: 0.7,
            transition: 'opacity 0.2s ease',
            '.MuiListItem-root:hover &': {
              opacity: 1,
            },
          }}
        >
          <Tooltip title="Move up" arrow>
            <span>
              <IconButton
                size="small"
                onClick={() => onMove(todo.id, 'up')}
                disabled={index === 0}
                aria-label={`Move ${todo.text} up`}
                sx={{
                  color: 'text.secondary',
                  '&:not(:disabled):hover': {
                    color: 'primary.main',
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  },
                }}
              >
                <ArrowUpwardIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Move down" arrow>
            <span>
              <IconButton
                size="small"
                onClick={() => onMove(todo.id, 'down')}
                disabled={index === total - 1}
                aria-label={`Move ${todo.text} down`}
                sx={{
                  color: 'text.secondary',
                  '&:not(:disabled):hover': {
                    color: 'primary.main',
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  },
                }}
              >
                <ArrowDownwardIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Edit" arrow>
            <IconButton
              size="small"
              onClick={() => onEdit(todo)}
              aria-label={`Edit ${todo.text}`}
              sx={{
                color: 'text.secondary',
                '&:hover': {
                  color: 'info.main',
                  backgroundColor: alpha(theme.palette.info.main, 0.1),
                },
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete" arrow>
            <IconButton
              size="small"
              onClick={() => onDelete(todo)}
              aria-label={`Delete ${todo.text}`}
              sx={{
                color: 'text.secondary',
                '&:hover': {
                  color: 'error.main',
                  backgroundColor: alpha(theme.palette.error.main, 0.1),
                },
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      }
    >
      <ListItemButton
        onClick={() => onToggle(todo.id)}
        sx={{
          borderRadius: '16px',
          pr: 14,
          py: 1.5,
          '&:hover': {
            backgroundColor: 'transparent',
          },
        }}
        aria-label={`Toggle ${todo.text}`}
      >
        <ListItemIcon sx={{ minWidth: 44 }}>
          <Checkbox
            edge="start"
            checked={todo.completed}
            tabIndex={-1}
            disableRipple
            icon={
              <RadioButtonUncheckedIcon
                sx={{
                  color: alpha(theme.palette.text.secondary, 0.4),
                  transition: 'all 0.2s ease',
                }}
              />
            }
            checkedIcon={
              <CheckCircleIcon
                sx={{
                  color: 'success.main',
                  filter: 'drop-shadow(0 2px 4px rgba(16, 185, 129, 0.3))',
                }}
              />
            }
            inputProps={{ 'aria-label': `Mark ${todo.text} complete` }}
            sx={{
              '&:hover': {
                backgroundColor: 'transparent',
              },
            }}
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
                fontSize: '0.95rem',
                letterSpacing: '-0.01em',
                transition: 'all 0.2s ease',
                opacity: todo.completed ? 0.7 : 1,
              }}
            >
              {todo.text}
            </Box>
          }
          secondary={
            <Box
              component="span"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                mt: 0.5,
              }}
            >
              {new Date(todo.updatedAt).toLocaleString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Box>
          }
          secondaryTypographyProps={{
            variant: 'caption',
            sx: {
              color: 'text.secondary',
              fontSize: '0.75rem',
              opacity: 0.8,
            },
          }}
        />
      </ListItemButton>
    </ListItem>
  );
};

export default TodoItem;
