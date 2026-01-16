const ANNOUNCER_ID = 'sr-announcer';

export const getAnnouncerId = () => ANNOUNCER_ID;

export const announceToScreenReader = (message: string) => {
  if (typeof document === 'undefined') {
    return;
  }

  const announcer = document.getElementById(ANNOUNCER_ID);
  if (!announcer) {
    return;
  }

  announcer.textContent = '';
  window.setTimeout(() => {
    announcer.textContent = message;
  }, 50);
};
