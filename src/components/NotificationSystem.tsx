import React, { useEffect } from 'react';
import { Alert, AlertTitle, Snackbar } from '@mui/material';
import type { NotificationState } from '../hooks/useNotification';
import { announceToScreenReader } from '../utils/announceToScreenReader';

interface NotificationSystemProps {
  notification: NotificationState | null;
  onClose: () => void;
}

const NotificationSystem: React.FC<NotificationSystemProps> = ({
  notification,
  onClose,
}) => {
  useEffect(() => {
    if (notification?.open) {
      announceToScreenReader(notification.message);
    }
  }, [notification]);

  if (!notification) {
    return null;
  }

  return (
    <Snackbar
      open={notification.open}
      autoHideDuration={4000}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert
        onClose={onClose}
        severity={notification.severity}
        variant="filled"
        sx={{ width: '100%' }}
      >
        {notification.title ? (
          <AlertTitle>{notification.title}</AlertTitle>
        ) : null}
        {notification.message}
      </Alert>
    </Snackbar>
  );
};

export default NotificationSystem;
