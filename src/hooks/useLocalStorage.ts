import { useCallback, useEffect, useMemo, useState } from 'react';

export type StorageError = {
  type: 'read' | 'write' | 'quota';
  message: string;
};

interface LocalStorageOptions<T> {
  key: string;
  initialValue: T;
  version: number;
  migrate?: (value: T, version: number) => T;
  onError?: (error: StorageError) => void;
}

const isQuotaError = (error: unknown) => {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const err = error as { name?: string; code?: number };
  return (
    err.name === 'QuotaExceededError' ||
    err.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
    err.code === 22
  );
};

export const useLocalStorageState = <T,>({
  key,
  initialValue,
  version,
  migrate,
  onError,
}: LocalStorageOptions<T>) => {
  const [error, setError] = useState<StorageError | null>(null);

  const handleError = useCallback(
    (nextError: StorageError) => {
      setError(nextError);
      onError?.(nextError);
    },
    [onError]
  );

  const readValue = useCallback((): T => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) {
        return initialValue;
      }

      const parsed = JSON.parse(raw) as { version?: number; value?: T };
      if (typeof parsed !== 'object' || parsed === null || parsed.value === undefined) {
        return initialValue;
      }

      if (parsed.version === version) {
        return parsed.value;
      }

      if (migrate) {
        return migrate(parsed.value, parsed.version ?? 0);
      }

      return initialValue;
    } catch (readError) {
      handleError({
        type: 'read',
        message: 'Unable to read saved data. Starting fresh.',
      });
      return initialValue;
    }
  }, [handleError, initialValue, key, migrate, version]);

  const [value, setValue] = useState<T>(readValue);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      window.localStorage.setItem(key, JSON.stringify({ version, value }));
    } catch (writeError) {
      handleError({
        type: isQuotaError(writeError) ? 'quota' : 'write',
        message: isQuotaError(writeError)
          ? 'Storage is full. Clear space or delete old items.'
          : 'Unable to save changes to storage.',
      });
    }
  }, [handleError, key, value, version]);

  const clear = useCallback(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      window.localStorage.removeItem(key);
    } catch (clearError) {
      handleError({
        type: 'write',
        message: 'Unable to clear saved data.',
      });
    }

    setValue(initialValue);
  }, [handleError, initialValue, key]);

  const helpers = useMemo(
    () => ({
      value,
      setValue,
      clear,
      error,
    }),
    [clear, error, value]
  );

  return helpers;
};
