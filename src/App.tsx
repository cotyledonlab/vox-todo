import React from 'react';
import { Box } from '@mui/material';
import VoiceTodoList from './components/VoiceTodoList';
import { getAnnouncerId } from './utils/announceToScreenReader';

function App() {
  return (
    <Box component="main">
      <div id={getAnnouncerId()} role="status" aria-live="polite" />
      <VoiceTodoList />
    </Box>
  );
}

export default App;
