import React from 'react';
import { Box, Chip, Stack, Typography } from '@mui/material';

const highlightKeywords = (text: string) => {
  const keywords = [
    'add',
    'create',
    'delete',
    'remove',
    'complete',
    'got',
    'picked',
    'finish',
    'edit',
    'update',
    'clear',
    'show',
    'all',
    'active',
    'completed',
    'move',
  ];

  const regex = new RegExp(`\\b(${keywords.join('|')})\\b`, 'gi');
  const parts = text.split(regex);

  return parts.map((part, index) => {
    if (keywords.includes(part.toLowerCase())) {
      return (
        <Box
          key={`${part}-${index}`}
          component="span"
          sx={{
            color: 'secondary.main',
            fontWeight: 700,
          }}
        >
          {part}
        </Box>
      );
    }

    return <span key={`${part}-${index}`}>{part}</span>;
  });
};

interface TranscriptDisplayProps {
  interimTranscript: string;
  finalTranscript: string;
  isListening: boolean;
}

const TranscriptDisplay: React.FC<TranscriptDisplayProps> = ({
  interimTranscript,
  finalTranscript,
  isListening,
}) => {
  if (!interimTranscript && !finalTranscript && !isListening) {
    return null;
  }

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        background: 'rgba(15, 23, 42, 0.02)',
      }}
      aria-live="polite"
    >
      <Stack spacing={1}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="subtitle2" color="text.secondary">
            Live transcript
          </Typography>
          {isListening ? (
            <Chip
              label="Listening"
              size="small"
              color="secondary"
              sx={{ fontWeight: 600 }}
            />
          ) : null}
        </Stack>
        {interimTranscript ? (
          <Typography variant="body2" color="text.secondary">
            {highlightKeywords(interimTranscript)}
          </Typography>
        ) : null}
        {finalTranscript ? (
          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            {highlightKeywords(finalTranscript)}
          </Typography>
        ) : null}
      </Stack>
    </Box>
  );
};

export default TranscriptDisplay;
