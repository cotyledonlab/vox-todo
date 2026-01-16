import React, { useEffect, useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material';
import type { Todo } from '../types/Todo';

interface EditTodoDialogProps {
  todo: Todo | null;
  open: boolean;
  onCancel: () => void;
  onSave: (todo: Todo, text: string) => void;
}

const EditTodoDialog: React.FC<EditTodoDialogProps> = ({
  todo,
  open,
  onCancel,
  onSave,
}) => {
  const [value, setValue] = useState('');

  useEffect(() => {
    setValue(todo?.text ?? '');
  }, [todo]);

  const handleSave = () => {
    if (!todo) {
      return;
    }
    const next = value.trim();
    if (next) {
      onSave(todo, next);
    }
  };

  return (
    <Dialog open={open} onClose={onCancel} fullWidth maxWidth="sm">
      <DialogTitle>Edit task</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          fullWidth
          value={value}
          onChange={event => setValue(event.target.value)}
          label="Task"
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
