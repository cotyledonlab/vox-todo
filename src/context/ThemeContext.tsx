import React, { createContext, useMemo } from 'react';
import { CssBaseline, GlobalStyles, ThemeProvider, useMediaQuery } from '@mui/material';
import { createAppTheme } from '../theme/theme';
import { useLocalStorageState } from '../hooks/useLocalStorage';

export type ThemePreference = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  mode: ThemePreference;
  resolvedMode: 'light' | 'dark';
  setMode: (mode: ThemePreference) => void;
  toggleMode: () => void;
}

export const ThemeModeContext = createContext<ThemeContextValue>({
  mode: 'system',
  resolvedMode: 'light',
  setMode: () => undefined,
  toggleMode: () => undefined,
});

const STORAGE_KEY = 'vox-todo:theme';

export const AppThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');
  const { value: storedMode, setValue: setStoredMode } = useLocalStorageState<ThemePreference>({
    key: STORAGE_KEY,
    initialValue: 'system',
    version: 1,
  });

  const resolvedMode = storedMode === 'system' ? (prefersDark ? 'dark' : 'light') : storedMode;
  const theme = useMemo(() => createAppTheme(resolvedMode), [resolvedMode]);

  const value = useMemo(
    () => ({
      mode: storedMode,
      resolvedMode,
      setMode: setStoredMode,
      toggleMode: () =>
        setStoredMode(prev => (prev === 'dark' ? 'light' : 'dark')),
    }),
    [resolvedMode, setStoredMode, storedMode]
  );

  return (
    <ThemeModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <GlobalStyles
          styles={theme => ({
            body: {
              background:
                theme.palette.mode === 'light'
                  ? 'radial-gradient(circle at top, rgba(14, 116, 144, 0.12), transparent 55%), radial-gradient(circle at 20% 20%, rgba(249, 115, 22, 0.15), transparent 45%), #f8fafc'
                  : 'radial-gradient(circle at top, rgba(45, 212, 191, 0.15), transparent 60%), radial-gradient(circle at 20% 20%, rgba(251, 146, 60, 0.2), transparent 50%), #0b1120',
            },
            '#sr-announcer': {
              position: 'absolute',
              width: 1,
              height: 1,
              padding: 0,
              margin: -1,
              overflow: 'hidden',
              clip: 'rect(0, 0, 0, 0)',
              whiteSpace: 'nowrap',
              border: 0,
            },
          })}
        />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
};
