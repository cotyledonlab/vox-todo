import { useCallback, useState } from 'react';
import type { AlertColor } from '@mui/material';

export interface NotificationState {
  open: boolean;
  message: string;
  severity: AlertColor;
  title?: string;
}

const buildNotification = (
  message: string,
  severity: AlertColor,
  title?: string
): NotificationState => ({
  open: true,
  message,
  severity,
  title,
});

export const useNotification = () => {
  const [notification, setNotification] = useState<NotificationState | null>(
    null
  );

  const notify = useCallback(
    (message: string, severity: AlertColor, title?: string) => {
      setNotification(buildNotification(message, severity, title));
    },
    []
  );

  const notifySuccess = useCallback(
    (message: string, title?: string) => notify(message, 'success', title),
    [notify]
  );

  const notifyError = useCallback(
    (message: string, title?: string) => notify(message, 'error', title),
    [notify]
  );

  const notifyInfo = useCallback(
    (message: string, title?: string) => notify(message, 'info', title),
    [notify]
  );

  const notifyWarning = useCallback(
    (message: string, title?: string) => notify(message, 'warning', title),
    [notify]
  );

  const closeNotification = useCallback(() => {
    setNotification(prev => (prev ? { ...prev, open: false } : prev));
  }, []);

  return {
    notification,
    notifySuccess,
    notifyError,
    notifyInfo,
    notifyWarning,
    closeNotification,
  };
};
