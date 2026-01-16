import React, { useMemo, useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Stack,
  Switch,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import type { Todo } from '../types/Todo';
import { exportList, type ExportFormat } from '../utils/listExporter';

interface ShareDialogProps {
  open: boolean;
  items: Todo[];
  canShare: boolean;
  onClose: () => void;
  onCopy: (text: string) => void;
  onShare: (text: string) => void;
}

const ShareDialog: React.FC<ShareDialogProps> = ({
  open,
  items,
  canShare,
  onClose,
  onCopy,
  onShare,
}) => {
  const [format, setFormat] = useState<ExportFormat>('plain');
  const [includeChecked, setIncludeChecked] = useState(true);

  const exportText = useMemo(
    () => exportList(items, { format, includeChecked }),
    [format, includeChecked, items]
  );

  const count = useMemo(() => {
    if (includeChecked) {
      return items.length;
    }
    return items.filter(item => !item.completed).length;
  }, [includeChecked, items]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Share & export</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <ToggleButtonGroup
            value={format}
            exclusive
            onChange={(_, value) => {
              if (value) {
                setFormat(value);
              }
            }}
            aria-label="Export format"
          >
            <ToggleButton value="plain" aria-label="Plain text" sx={{ minHeight: 44, px: 2 }}>
              Plain text
            </ToggleButton>
            <ToggleButton value="markdown" aria-label="Markdown checklist" sx={{ minHeight: 44, px: 2 }}>
              Markdown
            </ToggleButton>
            <ToggleButton value="json" aria-label="JSON" sx={{ minHeight: 44, px: 2 }}>
              JSON
            </ToggleButton>
          </ToggleButtonGroup>
          <FormControlLabel
            control={
              <Switch
                checked={includeChecked}
                onChange={event => setIncludeChecked(event.target.checked)}
              />
            }
            label="Include checked items"
          />
          <Typography variant="caption" color="text.secondary">
            Exporting {count} item{count === 1 ? '' : 's'}.
          </Typography>
          <TextField
            value={exportText}
            multiline
            minRows={6}
            fullWidth
            InputProps={{ readOnly: true }}
            aria-label="Export preview"
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onCopy(exportText)} variant="outlined">
          Copy list
        </Button>
        <Button
          onClick={() => onShare(exportText)}
          variant="contained"
          disabled={!canShare}
        >
          Share
        </Button>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ShareDialog;
