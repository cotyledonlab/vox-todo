import React from 'react';
import {
  Box,
  Button,
  Chip,
  Collapse,
  List,
  Stack,
  Typography,
} from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import type { Category, Todo } from '../types/Todo';
import { CATEGORY_LABELS } from '../utils/categoryMapper';

interface CategorySectionProps {
  category: Category;
  items: Todo[];
  collapsed: boolean;
  onToggle: (category: Category) => void;
  children: React.ReactNode;
  listSx?: SxProps<Theme>;
}

const CategorySection: React.FC<CategorySectionProps> = ({
  category,
  items,
  collapsed,
  onToggle,
  children,
  listSx,
}) => {
  const label = CATEGORY_LABELS[category];
  const contentId = `category-section-${category}`;

  return (
    <Stack spacing={1.5} sx={{ mb: 2 }}>
      <Button
        onClick={() => onToggle(category)}
        variant="text"
        aria-expanded={!collapsed}
        aria-controls={contentId}
        sx={{
          justifyContent: 'space-between',
          alignItems: 'center',
          px: 0,
          textTransform: 'none',
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            {label}
          </Typography>
          <Chip
            label={`${items.length}`}
            size="small"
            color={category === 'other' ? 'default' : 'primary'}
            variant={category === 'other' ? 'outlined' : 'filled'}
          />
        </Stack>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {collapsed ? <ExpandMoreIcon /> : <ExpandLessIcon />}
        </Box>
      </Button>
      <Collapse id={contentId} in={!collapsed} timeout="auto" unmountOnExit>
        <List disablePadding sx={listSx}>
          {children}
        </List>
      </Collapse>
    </Stack>
  );
};

export default CategorySection;
