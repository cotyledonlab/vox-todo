export const styles = {
  container: {
    maxWidth: 600,
    margin: '0 auto',
    padding: '2rem',
  },
  todoList: {
    width: '100%',
    bgcolor: 'background.paper',
    borderRadius: 1,
  },
  todoItem: {
    transition: 'all 0.3s ease',
    '&:hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.04)',
      transform: 'translateX(6px)',
    },
  },
  voiceButton: {
    marginBottom: 2,
    position: 'relative',
    overflow: 'hidden',
    '&::after': {
      content: '""',
      position: 'absolute',
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(255, 0, 0, 0.2)',
      borderRadius: '50%',
      transform: 'scale(0)',
      transition: 'transform 0.3s ease',
    },
    '&.listening::after': {
      transform: 'scale(1)',
      animation: 'pulse 1.5s infinite',
    },
  },
  commandList: {
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    borderRadius: 1,
    padding: 2,
    marginBottom: 2,
  },
  '@keyframes pulse': {
    '0%': {
      transform: 'scale(1)',
      opacity: 1,
    },
    '50%': {
      transform: 'scale(1.1)',
      opacity: 0.8,
    },
    '100%': {
      transform: 'scale(1)',
      opacity: 1,
    },
  },
};
