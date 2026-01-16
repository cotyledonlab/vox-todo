import React, { useEffect, useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';
import type { Category, Todo } from '../types/Todo';
import { CATEGORY_LABELS, CATEGORY_ORDER } from '../utils/categoryMapper';

interface EditTodoDialogProps {
  todo: Todo | null;
  open: boolean;
  onCancel: () => void;
  onSave: (todo: Todo, text: string, categorySelection: Category | 'auto') => void;
}

const EditTodoDialog: React.FC<EditTodoDialogProps> = ({
  todo,
  open,
  onCancel,
  onSave,
}) => {
  const [value, setValue] = useState('');
  const [category, setCategory] = useState<Category | 'auto'>('auto');

  useEffect(() => {
    setValue(todo?.text ?? '');
    if (!todo?.category || todo.categorySource !== 'manual') {
      setCategory('auto');
      return;
    }
    setCategory(todo.category);
  }, [todo]);

  const handleSave = () => {
    if (!todo) {
      return;
    }
    const next = value.trim();
    if (next) {
      onSave(todo, next, category);
    }
  };

  return (
    <Dialog open={open} onClose={onCancel} fullWidth maxWidth="sm">
      <DialogTitle>Edit item</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          fullWidth
          value={value}
          onChange={event => setValue(event.target.value)}
          label="Item"
          variant="outlined"
          onKeyDown={event => {
            if (event.key === 'Enter') {
              event.preventDefault();
              handleSave();
            }
            if (event.key === 'Escape') {
              onCancel();
            }
          }}
        />
        <FormControl fullWidth margin="dense">
          <InputLabel id="edit-category-label">Category</InputLabel>
          <Select
            labelId="edit-category-label"
            value={category}
            label="Category"
            onChange={event => setCategory(event.target.value as Category | 'auto')}
          >
            <MenuItem value="auto">Auto (from item name)</MenuItem>
            {CATEGORY_ORDER.map(option => (
              <MenuItem key={option} value={option}>
                {CATEGORY_LABELS[option]}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>
            Choose a category or let VoxShop organize items automatically.
          </FormHelperText>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditTodoDialog;
