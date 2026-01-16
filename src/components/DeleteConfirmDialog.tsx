import React from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import type { Todo } from '../types/Todo';

interface DeleteConfirmDialogProps {
  todo: Todo | null;
  open: boolean;
  onCancel: () => void;
  onConfirm: (todo: Todo) => void;
}

const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({
  todo,
  open,
  onCancel,
  onConfirm,
}) => (
  <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>
    <DialogTitle>Delete item?</DialogTitle>
    <DialogContent>
      <DialogContentText>
        {todo
          ? `This will permanently remove "${todo.text}".`
          : 'This will permanently remove the item.'}
      </DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button onClick={onCancel}>Cancel</Button>
      <Button
        onClick={() => (todo ? onConfirm(todo) : onCancel())}
        color="error"
        variant="contained"
      >
        Delete
      </Button>
    </DialogActions>
  </Dialog>
);

export default DeleteConfirmDialog;
