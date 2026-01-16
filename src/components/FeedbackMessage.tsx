import React from 'react';
import { Alert, AlertTitle, Collapse } from '@mui/material';
import type { AlertColor } from '@mui/material';

interface FeedbackMessageProps {
  message: string | null;
  severity?: AlertColor;
  title?: string;
}

const FeedbackMessage: React.FC<FeedbackMessageProps> = ({
  message,
  severity = 'info',
  title,
}) => (
  <Collapse in={Boolean(message)}>
    {message ? (
      <Alert severity={severity} variant="outlined">
        {title ? <AlertTitle>{title}</AlertTitle> : null}
        {message}
      </Alert>
    ) : null}
  </Collapse>
);

export default FeedbackMessage;
