import { alpha, createTheme } from '@mui/material/styles';

export const createAppTheme = (mode: 'light' | 'dark') =>
  createTheme({
    palette: {
      mode,
      primary: {
        main: mode === 'light' ? '#0f766e' : '#5eead4',
      },
      secondary: {
        main: mode === 'light' ? '#f97316' : '#fb923c',
      },
      success: {
        main: '#16a34a',
      },
      error: {
        main: '#dc2626',
      },
      warning: {
        main: '#f59e0b',
      },
      info: {
        main: '#0ea5e9',
      },
      background: {
        default: mode === 'light' ? '#f8fafc' : '#0b1120',
        paper: mode === 'light' ? '#ffffff' : '#0f172a',
      },
      text: {
        primary: mode === 'light' ? '#0f172a' : '#e2e8f0',
        secondary: mode === 'light' ? '#475569' : '#94a3b8',
      },
    },
    typography: {
      fontFamily: '"Space Grotesk", "Work Sans", system-ui, sans-serif',
      h1: {
        fontWeight: 700,
        letterSpacing: '-0.02em',
      },
      h2: {
        fontWeight: 700,
        letterSpacing: '-0.02em',
      },
      h3: {
        fontWeight: 600,
        letterSpacing: '-0.01em',
      },
      h4: {
        fontWeight: 600,
      },
      h5: {
        fontWeight: 600,
      },
      button: {
        textTransform: 'none',
        fontWeight: 600,
      },
    },
    shape: {
      borderRadius: 16,
    },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 18,
            boxShadow:
              mode === 'light'
                ? '0 20px 60px rgba(15, 23, 42, 0.08)'
                : '0 20px 60px rgba(15, 23, 42, 0.35)',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 14,
            padding: '0.7rem 1.2rem',
          },
          containedPrimary: {
            boxShadow: '0 10px 24px rgba(15, 118, 110, 0.25)',
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 12,
          },
        },
      },
      MuiTabs: {
        styleOverrides: {
          root: {
            minHeight: 42,
          },
          indicator: {
            height: 4,
            borderRadius: 999,
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 600,
            minHeight: 42,
          },
        },
      },
      MuiInputBase: {
        styleOverrides: {
          root: {
            borderRadius: 12,
          },
        },
      },
      MuiListItem: {
        styleOverrides: {
          root: {
            borderRadius: 16,
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            '& fieldset': {
              borderColor: alpha(
                mode === 'light' ? '#94a3b8' : '#334155',
                0.4
              ),
            },
          },
        },
      },
    },
  });
