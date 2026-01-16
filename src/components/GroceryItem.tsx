import React, { useRef, useState } from 'react';
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
import { formatQuantity } from '../utils/quantityParser';

interface GroceryItemProps {
  item: Todo;
  index: number;
  total: number;
  onToggle: (id: string) => void;
  onEdit: (item: Todo) => void;
  onDelete: (item: Todo) => void;
  onSwipeDelete?: (item: Todo) => void;
  onMove: (id: string, direction: 'up' | 'down') => void;
}

const GroceryItem: React.FC<GroceryItemProps> = ({
  item,
  index,
  total,
  onToggle,
  onEdit,
  onDelete,
  onSwipeDelete,
  onMove,
}) => {
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);
  const skipClickRef = useRef(false);
  const maxDrag = 120;
  const swipeThreshold = 80;
  const quantityLabel = formatQuantity(item.quantity, item.unit);
  const displayLabel = quantityLabel ? `${quantityLabel} ${item.text}` : item.text;

  const handlePointerDown = (event: React.PointerEvent) => {
    startXRef.current = event.clientX;
    skipClickRef.current = false;
    setIsDragging(true);
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent) => {
    if (!isDragging) {
      return;
    }
    const delta = event.clientX - startXRef.current;
    if (Math.abs(delta) > 10) {
      skipClickRef.current = true;
    }
    setDragX(Math.max(Math.min(delta, maxDrag), -maxDrag));
  };

  const handlePointerEnd = (event: React.PointerEvent) => {
    if (!isDragging) {
      return;
    }
    const delta = event.clientX - startXRef.current;
    setIsDragging(false);
    setDragX(0);
    if (Math.abs(delta) >= swipeThreshold) {
      const deleteAction = onSwipeDelete ?? onDelete;
      deleteAction(item);
    }
  };

  return (
    <ListItem
      disablePadding
      sx={{
        mb: 1.5,
        borderRadius: '16px',
        border: '1px solid',
        borderColor: item.completed
          ? alpha(theme.palette.success.main, 0.2)
          : 'divider',
        backgroundColor: item.completed
          ? alpha(theme.palette.success.main, isLight ? 0.04 : 0.08)
          : 'background.paper',
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: isLight
            ? '0 8px 25px rgba(0, 0, 0, 0.08)'
            : '0 8px 25px rgba(0, 0, 0, 0.3)',
          borderColor: item.completed
            ? alpha(theme.palette.success.main, 0.3)
            : alpha(theme.palette.primary.main, 0.3),
        },
        overflow: 'hidden',
        position: 'relative',
        '&::before': item.completed ? {
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
                onClick={() => onMove(item.id, 'up')}
                disabled={index === 0}
                aria-label={`Move ${displayLabel} up`}
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
                onClick={() => onMove(item.id, 'down')}
                disabled={index === total - 1}
                aria-label={`Move ${displayLabel} down`}
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
              onClick={() => onEdit(item)}
              aria-label={`Edit ${displayLabel}`}
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
              onClick={() => onDelete(item)}
              aria-label={`Delete ${displayLabel}`}
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
        onClick={() => {
          if (skipClickRef.current) {
            skipClickRef.current = false;
            return;
          }
          onToggle(item.id);
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        sx={{
          borderRadius: '16px',
          pr: 14,
          py: 2,
          minHeight: 64,
          transform: `translateX(${dragX}px)`,
          transition: isDragging ? 'none' : 'transform 0.2s ease',
          touchAction: 'pan-y',
          '&:hover': {
            backgroundColor: 'transparent',
          },
        }}
        aria-label={`Toggle picked up for ${displayLabel}`}
      >
        <ListItemIcon sx={{ minWidth: 44 }}>
          <Checkbox
            edge="start"
            checked={item.completed}
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
            inputProps={{ 'aria-label': `Mark ${displayLabel} picked up` }}
            sx={{
              '&:hover': {
                backgroundColor: 'transparent',
              },
            }}
          />
        </ListItemIcon>
        <ListItemText
          primary={
            <Stack direction="row" spacing={1} alignItems="center">
              {quantityLabel ? (
                <Box
                  component="span"
                  sx={{
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: item.completed ? 'text.secondary' : 'primary.main',
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    px: 1,
                    py: 0.25,
                    borderRadius: 999,
                  }}
                >
                  {quantityLabel}
                </Box>
              ) : null}
              <Box
                component="span"
                sx={{
                  textDecoration: item.completed ? 'line-through' : 'none',
                  color: item.completed ? 'text.secondary' : 'text.primary',
                  fontWeight: 600,
                  fontSize: '1rem',
                  letterSpacing: '-0.01em',
                  transition: 'all 0.2s ease',
                  opacity: item.completed ? 0.7 : 1,
                }}
              >
                {item.text}
              </Box>
            </Stack>
          }
        />
      </ListItemButton>
    </ListItem>
  );
};

export default GroceryItem;
