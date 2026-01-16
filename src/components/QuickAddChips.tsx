import React from 'react';
import { Chip, Stack, Typography } from '@mui/material';
import { formatQuantity } from '../utils/quantityParser';

export type QuickAddItem = {
  id?: string;
  name: string;
  quantity?: number;
  unit?: string;
};

export type QuickAddSection = {
  title: string;
  items: QuickAddItem[];
};

interface QuickAddChipsProps {
  sections: QuickAddSection[];
  onSelect: (item: QuickAddItem) => void;
}

const buildLabel = (item: QuickAddItem) => {
  const quantityLabel = formatQuantity(item.quantity, item.unit);
  return quantityLabel ? `${quantityLabel} ${item.name}` : item.name;
};

const QuickAddChips: React.FC<QuickAddChipsProps> = ({ sections, onSelect }) => {
  const visibleSections = sections.filter(section => section.items.length > 0);
  if (visibleSections.length === 0) {
    return null;
  }

  return (
    <Stack spacing={1.5}>
      {visibleSections.map(section => (
        <Stack spacing={1} key={section.title}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
            {section.title}
          </Typography>
          <Stack
            direction="row"
            spacing={1}
            sx={{
              overflowX: 'auto',
              pb: 0.5,
              '&::-webkit-scrollbar': { display: 'none' },
            }}
          >
            {section.items.map(item => (
              <Chip
                key={item.id ?? item.name}
                label={buildLabel(item)}
                onClick={() => onSelect(item)}
                color="primary"
                variant="outlined"
                sx={{
                  flexShrink: 0,
                  fontWeight: 600,
                  height: 40,
                  fontSize: '0.9rem',
                }}
              />
            ))}
          </Stack>
        </Stack>
      ))}
    </Stack>
  );
};

export default QuickAddChips;
