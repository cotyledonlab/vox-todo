import type { Theme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';

export const styles = {
  page: (theme: Theme) => ({
    minHeight: '100vh',
    padding: { xs: '1.5rem 1.1rem 3rem', md: '3rem 2.5rem 4rem' },
  }),
  shell: {
    maxWidth: 1100,
    margin: '0 auto',
  },
  headerCard: (theme: Theme) => ({
    padding: '2.5rem',
    borderRadius: 4,
    background: theme.palette.mode === 'light'
      ? 'linear-gradient(135deg, rgba(15, 118, 110, 0.12), rgba(249, 115, 22, 0.1))'
      : 'linear-gradient(135deg, rgba(45, 212, 191, 0.15), rgba(251, 146, 60, 0.15))',
    border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
  }),
  voiceButton: (theme: Theme) => ({
    position: 'relative',
    overflow: 'hidden',
    '&::after': {
      content: '""',
      position: 'absolute',
      inset: 0,
      background: alpha(theme.palette.secondary.main, 0.2),
      transform: 'scale(0)',
      borderRadius: '50%',
      transition: 'transform 0.3s ease',
    },
    '&.listening::after': {
      transform: 'scale(1.4)',
      animation: 'pulse 1.6s ease-in-out infinite',
    },
  }),
  commandList: (theme: Theme) => ({
    borderRadius: 3,
    border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
    backgroundColor: alpha(theme.palette.primary.main, 0.05),
    padding: 2,
  }),
  floatingBadge: (theme: Theme) => ({
    backgroundColor: alpha(theme.palette.secondary.main, 0.12),
    color: theme.palette.secondary.main,
    fontWeight: 700,
    borderRadius: 999,
    padding: '0.3rem 0.75rem',
    fontSize: '0.75rem',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
  }),
  todoList: {
    width: '100%',
    mt: 2,
  },
  '@keyframes pulse': {
    '0%': { transform: 'scale(1)', opacity: 0.9 },
    '50%': { transform: 'scale(1.08)', opacity: 0.6 },
    '100%': { transform: 'scale(1)', opacity: 0.9 },
  },
};
