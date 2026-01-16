import type { Theme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';

export const styles = {
  page: (theme: Theme) => ({
    minHeight: '100vh',
    padding: { xs: '1.5rem 1rem 4rem', md: '2.5rem 3rem 5rem' },
    background: theme.palette.mode === 'light'
      ? `linear-gradient(180deg, ${alpha('#0d9488', 0.04)} 0%, ${alpha('#f0fdfa', 0.5)} 50%, ${theme.palette.background.default} 100%)`
      : `linear-gradient(180deg, ${alpha('#2dd4bf', 0.06)} 0%, ${alpha('#0c1222', 0.8)} 50%, ${theme.palette.background.default} 100%)`,
  }),
  shell: {
    maxWidth: 1140,
    margin: '0 auto',
  },
  headerCard: (theme: Theme) => ({
    padding: { xs: '1.75rem', md: '2.5rem 3rem' },
    borderRadius: '24px',
    background: theme.palette.mode === 'light'
      ? `linear-gradient(135deg, ${alpha('#0d9488', 0.08)} 0%, ${alpha('#f97316', 0.06)} 50%, ${alpha('#0ea5e9', 0.04)} 100%)`
      : `linear-gradient(135deg, ${alpha('#2dd4bf', 0.12)} 0%, ${alpha('#fb923c', 0.08)} 50%, ${alpha('#38bdf8', 0.06)} 100%)`,
    border: `1px solid ${alpha(theme.palette.primary.main, theme.palette.mode === 'light' ? 0.15 : 0.2)}`,
    backdropFilter: 'blur(20px)',
    position: 'relative',
    overflow: 'hidden',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '1px',
      background: theme.palette.mode === 'light'
        ? 'linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)'
        : 'linear-gradient(90deg, transparent, rgba(45, 212, 191, 0.3), transparent)',
    },
  }),
  voiceButton: (theme: Theme) => ({
    position: 'relative',
    overflow: 'hidden',
    minHeight: 52,
    fontSize: '1rem',
    background: theme.palette.mode === 'light'
      ? 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)'
      : 'linear-gradient(135deg, #2dd4bf 0%, #14b8a6 100%)',
    boxShadow: theme.palette.mode === 'light'
      ? '0 4px 20px rgba(13, 148, 136, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)'
      : '0 4px 20px rgba(45, 212, 191, 0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: theme.palette.mode === 'light'
        ? '0 8px 30px rgba(13, 148, 136, 0.5), inset 0 1px 0 rgba(255,255,255,0.2)'
        : '0 8px 30px rgba(45, 212, 191, 0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
    },
    '&::after': {
      content: '""',
      position: 'absolute',
      inset: 0,
      background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.3)} 0%, transparent 70%)`,
      transform: 'scale(0)',
      borderRadius: '50%',
      transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    },
    '&.listening': {
      animation: 'buttonPulse 2s ease-in-out infinite',
    },
    '&.listening::after': {
      transform: 'scale(2)',
      animation: 'ripple 1.5s ease-out infinite',
    },
    '@keyframes buttonPulse': {
      '0%, 100%': {
        boxShadow: theme.palette.mode === 'light'
          ? '0 4px 20px rgba(13, 148, 136, 0.4)'
          : '0 4px 20px rgba(45, 212, 191, 0.3)',
      },
      '50%': {
        boxShadow: theme.palette.mode === 'light'
          ? '0 4px 30px rgba(13, 148, 136, 0.6), 0 0 60px rgba(13, 148, 136, 0.3)'
          : '0 4px 30px rgba(45, 212, 191, 0.5), 0 0 60px rgba(45, 212, 191, 0.2)',
      },
    },
    '@keyframes ripple': {
      '0%': { transform: 'scale(0)', opacity: 1 },
      '100%': { transform: 'scale(2.5)', opacity: 0 },
    },
  }),
  floatingMic: (theme: Theme) => ({
    position: 'fixed',
    right: { xs: 'calc(16px + env(safe-area-inset-right, 0px))', md: 32 },
    bottom: { xs: 'calc(16px + env(safe-area-inset-bottom, 0px))', md: 32 },
    display: { xs: 'flex', md: 'none' },
    zIndex: (theme.zIndex.fab ?? theme.zIndex.modal) + 1,
    minHeight: 56,
    minWidth: 56,
    background: theme.palette.mode === 'light'
      ? 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)'
      : 'linear-gradient(135deg, #2dd4bf 0%, #14b8a6 100%)',
    boxShadow: theme.palette.mode === 'light'
      ? '0 8px 28px rgba(13, 148, 136, 0.4)'
      : '0 8px 28px rgba(45, 212, 191, 0.3)',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: theme.palette.mode === 'light'
        ? '0 12px 32px rgba(13, 148, 136, 0.45)'
        : '0 12px 32px rgba(45, 212, 191, 0.35)',
    },
    '&.listening': {
      animation: 'floatingPulse 2s ease-in-out infinite',
    },
    '@keyframes floatingPulse': {
      '0%, 100%': {
        boxShadow: theme.palette.mode === 'light'
          ? '0 8px 28px rgba(13, 148, 136, 0.35)'
          : '0 8px 28px rgba(45, 212, 191, 0.3)',
      },
      '50%': {
        boxShadow: theme.palette.mode === 'light'
          ? '0 12px 36px rgba(13, 148, 136, 0.55)'
          : '0 12px 36px rgba(45, 212, 191, 0.45)',
      },
    },
  }),
  commandList: (theme: Theme) => ({
    borderRadius: '16px',
    border: `1px solid ${alpha(theme.palette.primary.main, theme.palette.mode === 'light' ? 0.12 : 0.15)}`,
    backgroundColor: alpha(theme.palette.primary.main, theme.palette.mode === 'light' ? 0.03 : 0.06),
    padding: { xs: 2, md: 2.5 },
    transition: 'all 0.2s ease',
    '&:hover': {
      borderColor: alpha(theme.palette.primary.main, 0.25),
      backgroundColor: alpha(theme.palette.primary.main, theme.palette.mode === 'light' ? 0.05 : 0.08),
    },
  }),
  floatingBadge: (theme: Theme) => ({
    background: theme.palette.mode === 'light'
      ? `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.15)}, ${alpha(theme.palette.secondary.main, 0.08)})`
      : `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.2)}, ${alpha(theme.palette.secondary.main, 0.12)})`,
    color: theme.palette.mode === 'light' ? theme.palette.secondary.dark : theme.palette.secondary.light,
    fontWeight: 700,
    borderRadius: 999,
    padding: '0.4rem 0.9rem',
    fontSize: '0.7rem',
    letterSpacing: '0.02em',
    textTransform: 'uppercase' as const,
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    border: `1px solid ${alpha(theme.palette.secondary.main, 0.2)}`,
    boxShadow: `0 2px 8px ${alpha(theme.palette.secondary.main, 0.15)}`,
  }),
  todoList: {
    width: '100%',
    mt: 1,
    '& > li': {
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
  sectionTitle: (theme: Theme) => ({
    fontWeight: 700,
    fontSize: '0.95rem',
    letterSpacing: '-0.01em',
    color: theme.palette.text.primary,
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    '&::before': {
      content: '""',
      width: 4,
      height: 20,
      borderRadius: 2,
      background: theme.palette.mode === 'light'
        ? 'linear-gradient(180deg, #0d9488, #10b981)'
        : 'linear-gradient(180deg, #2dd4bf, #34d399)',
    },
  }),
  glassPanel: (theme: Theme) => ({
    background: theme.palette.mode === 'light'
      ? alpha('#ffffff', 0.7)
      : alpha('#131c31', 0.6),
    backdropFilter: 'blur(12px)',
    border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  }),
};
