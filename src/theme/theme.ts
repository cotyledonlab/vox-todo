import { alpha, createTheme } from '@mui/material/styles';

export const createAppTheme = (mode: 'light' | 'dark') =>
  createTheme({
    palette: {
      mode,
      primary: {
        main: mode === 'light' ? '#0d9488' : '#2dd4bf',
        light: mode === 'light' ? '#14b8a6' : '#5eead4',
        dark: mode === 'light' ? '#0f766e' : '#14b8a6',
      },
      secondary: {
        main: mode === 'light' ? '#f97316' : '#fb923c',
        light: mode === 'light' ? '#fb923c' : '#fdba74',
        dark: mode === 'light' ? '#ea580c' : '#f97316',
      },
      success: {
        main: mode === 'light' ? '#10b981' : '#34d399',
        light: mode === 'light' ? '#34d399' : '#6ee7b7',
      },
      error: {
        main: mode === 'light' ? '#ef4444' : '#f87171',
        light: mode === 'light' ? '#f87171' : '#fca5a5',
      },
      warning: {
        main: mode === 'light' ? '#f59e0b' : '#fbbf24',
      },
      info: {
        main: mode === 'light' ? '#0ea5e9' : '#38bdf8',
      },
      background: {
        default: mode === 'light' ? '#f0fdfa' : '#0c1222',
        paper: mode === 'light' ? '#ffffff' : '#131c31',
      },
      text: {
        primary: mode === 'light' ? '#0f172a' : '#f1f5f9',
        secondary: mode === 'light' ? '#64748b' : '#94a3b8',
      },
      divider: mode === 'light' ? alpha('#0d9488', 0.12) : alpha('#2dd4bf', 0.12),
    },
    typography: {
      fontFamily: '"Inter", "SF Pro Display", system-ui, sans-serif',
      h1: {
        fontWeight: 800,
        letterSpacing: '-0.025em',
      },
      h2: {
        fontWeight: 700,
        letterSpacing: '-0.02em',
      },
      h3: {
        fontWeight: 700,
        letterSpacing: '-0.015em',
      },
      h4: {
        fontWeight: 600,
        letterSpacing: '-0.01em',
      },
      h5: {
        fontWeight: 600,
      },
      h6: {
        fontWeight: 600,
        letterSpacing: '-0.005em',
      },
      body1: {
        letterSpacing: '-0.01em',
      },
      body2: {
        letterSpacing: '-0.005em',
      },
      button: {
        textTransform: 'none',
        fontWeight: 600,
        letterSpacing: '-0.01em',
      },
    },
    shape: {
      borderRadius: 16,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            transition: 'background-color 0.3s ease',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 20,
            backgroundImage: 'none',
            boxShadow:
              mode === 'light'
                ? '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 20px 25px -5px rgba(0, 0, 0, 0.05)'
                : '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(45, 212, 191, 0.05)',
            border: mode === 'light'
              ? '1px solid rgba(13, 148, 136, 0.08)'
              : '1px solid rgba(45, 212, 191, 0.08)',
            transition: 'box-shadow 0.2s ease, transform 0.2s ease, border-color 0.2s ease',
            '&:hover': {
              boxShadow:
                mode === 'light'
                  ? '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 25px 50px -12px rgba(0, 0, 0, 0.15)'
                  : '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(45, 212, 191, 0.1)',
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            padding: '0.65rem 1.25rem',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            fontWeight: 600,
          },
          contained: {
            boxShadow: mode === 'light'
              ? '0 4px 14px rgba(13, 148, 136, 0.35)'
              : '0 4px 14px rgba(45, 212, 191, 0.25)',
            '&:hover': {
              transform: 'translateY(-1px)',
              boxShadow: mode === 'light'
                ? '0 6px 20px rgba(13, 148, 136, 0.45)'
                : '0 6px 20px rgba(45, 212, 191, 0.35)',
            },
            '&:active': {
              transform: 'translateY(0)',
            },
          },
          containedPrimary: {
            background: mode === 'light'
              ? 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)'
              : 'linear-gradient(135deg, #2dd4bf 0%, #14b8a6 100%)',
            color: mode === 'light' ? '#ffffff' : '#042f2e',
            '&:hover': {
              background: mode === 'light'
                ? 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)'
                : 'linear-gradient(135deg, #5eead4 0%, #2dd4bf 100%)',
            },
          },
          outlined: {
            borderWidth: '1.5px',
            '&:hover': {
              borderWidth: '1.5px',
              backgroundColor: alpha(mode === 'light' ? '#0d9488' : '#2dd4bf', 0.08),
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            fontWeight: 600,
            transition: 'all 0.2s ease',
          },
          filled: {
            '&:hover': {
              transform: 'scale(1.02)',
            },
          },
        },
      },
      MuiTabs: {
        styleOverrides: {
          root: {
            minHeight: 44,
            backgroundColor: mode === 'light'
              ? alpha('#0d9488', 0.06)
              : alpha('#2dd4bf', 0.08),
            borderRadius: 12,
            padding: '4px',
          },
          indicator: {
            height: '100%',
            borderRadius: 10,
            backgroundColor: mode === 'light' ? '#ffffff' : alpha('#2dd4bf', 0.15),
            boxShadow: mode === 'light'
              ? '0 2px 8px rgba(0, 0, 0, 0.1)'
              : '0 0 0 1px rgba(45, 212, 191, 0.2)',
            zIndex: 0,
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 600,
            minHeight: 36,
            borderRadius: 10,
            zIndex: 1,
            transition: 'color 0.2s ease',
            '&.Mui-selected': {
              color: mode === 'light' ? '#0d9488' : '#2dd4bf',
            },
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              transition: 'all 0.2s ease',
              '&:hover': {
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: mode === 'light' ? '#0d9488' : '#2dd4bf',
                },
              },
              '&.Mui-focused': {
                '& .MuiOutlinedInput-notchedOutline': {
                  borderWidth: '2px',
                },
              },
            },
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
            borderRadius: 14,
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 14,
            transition: 'all 0.15s ease',
            '&:hover': {
              backgroundColor: alpha(mode === 'light' ? '#0d9488' : '#2dd4bf', 0.08),
            },
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            transition: 'all 0.2s ease',
            '&:hover': {
              transform: 'scale(1.1)',
              backgroundColor: alpha(mode === 'light' ? '#0d9488' : '#2dd4bf', 0.12),
            },
          },
        },
      },
      MuiCheckbox: {
        styleOverrides: {
          root: {
            borderRadius: 6,
            transition: 'all 0.2s ease',
            '&.Mui-checked': {
              color: mode === 'light' ? '#10b981' : '#34d399',
            },
            '&:hover': {
              backgroundColor: alpha(mode === 'light' ? '#10b981' : '#34d399', 0.12),
            },
          },
        },
      },
      MuiLinearProgress: {
        styleOverrides: {
          root: {
            borderRadius: 999,
            backgroundColor: alpha(mode === 'light' ? '#0d9488' : '#2dd4bf', 0.15),
          },
          bar: {
            borderRadius: 999,
            background: mode === 'light'
              ? 'linear-gradient(90deg, #0d9488 0%, #10b981 100%)'
              : 'linear-gradient(90deg, #2dd4bf 0%, #34d399 100%)',
          },
        },
      },
      MuiSwitch: {
        styleOverrides: {
          root: {
            '& .MuiSwitch-switchBase.Mui-checked': {
              color: mode === 'light' ? '#0d9488' : '#2dd4bf',
              '& + .MuiSwitch-track': {
                backgroundColor: mode === 'light' ? '#0d9488' : '#2dd4bf',
              },
            },
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            '& fieldset': {
              borderColor: alpha(
                mode === 'light' ? '#94a3b8' : '#475569',
                0.4
              ),
              borderWidth: '1.5px',
              transition: 'border-color 0.2s ease',
            },
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: mode === 'light' ? '#0f172a' : '#f1f5f9',
            color: mode === 'light' ? '#f1f5f9' : '#0f172a',
            fontWeight: 500,
            borderRadius: 8,
            padding: '6px 12px',
          },
        },
      },
      MuiDivider: {
        styleOverrides: {
          root: {
            borderColor: mode === 'light'
              ? alpha('#0d9488', 0.1)
              : alpha('#2dd4bf', 0.1),
          },
        },
      },
    },
  });
