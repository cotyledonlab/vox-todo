import React, { useState } from 'react';
import {
  Button,
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import type { Category } from '../types/Todo';
import { formatQuantity } from '../utils/quantityParser';

export type StapleItem = {
  id: string;
  name: string;
  quantity?: number;
  unit?: string;
  category?: Category;
};

interface StaplesManagerProps {
  staples: StapleItem[];
  onAdd: (text: string) => boolean;
  onRemove: (id: string) => void;
  onAddAll: () => void;
}

const buildLabel = (staple: StapleItem) => {
  const quantityLabel = formatQuantity(staple.quantity, staple.unit);
  return quantityLabel ? `${quantityLabel} ${staple.name}` : staple.name;
};

const StaplesManager: React.FC<StaplesManagerProps> = ({
  staples,
  onAdd,
  onRemove,
  onAddAll,
}) => {
  const [value, setValue] = useState('');

  const handleSubmit = (event?: React.FormEvent) => {
    if (event) {
      event.preventDefault();
    }
    const success = onAdd(value);
    if (success) {
      setValue('');
    }
  };

  return (
    <Stack spacing={1.5} component="form" onSubmit={handleSubmit}>
      <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
        <Typography variant="h6">Staples</Typography>
        <Button
          variant="contained"
          size="small"
          onClick={onAddAll}
          disabled={staples.length === 0}
        >
          Add all
        </Button>
      </Stack>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
        <TextField
          fullWidth
          value={value}
          onChange={event => setValue(event.target.value)}
          placeholder="Add staples (e.g. milk, 2 eggs)"
          size="small"
        />
        <Button type="submit" variant="outlined" sx={{ minWidth: 120 }}>
          Add staple
        </Button>
      </Stack>
      {staples.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          Add staples you always need, then tap once to add them to your list.
        </Typography>
      ) : (
        <List dense disablePadding>
          {staples.map(staple => (
            <ListItem key={staple.id} disableGutters>
              <ListItemText primary={buildLabel(staple)} />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  aria-label={`Remove staple ${buildLabel(staple)}`}
                  onClick={() => onRemove(staple.id)}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      )}
    </Stack>
  );
};

export default StaplesManager;
