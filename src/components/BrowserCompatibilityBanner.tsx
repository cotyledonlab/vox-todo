import React from 'react';
import { Alert, AlertTitle, Box, Link, Stack, Typography } from '@mui/material';
import type { BrowserInfo } from '../utils/browserDetection';

interface BrowserCompatibilityBannerProps {
  browser: BrowserInfo;
  supported: boolean;
}

const BrowserCompatibilityBanner: React.FC<BrowserCompatibilityBannerProps> = ({
  browser,
  supported,
}) => {
  if (supported) {
    return null;
  }

  return (
    <Alert severity="warning" sx={{ borderRadius: 3 }}>
      <AlertTitle>Voice input is limited in {browser.name}</AlertTitle>
      <Stack spacing={1}>
        <Typography variant="body2">
          Voice recognition is only fully supported in Chrome or Edge. You can
          still use the text input below.
        </Typography>
        <Box>
          <Link href="https://www.google.com/chrome/" target="_blank" rel="noreferrer">
            Download Chrome
          </Link>
          {' · '}
          <Link href="https://www.microsoft.com/edge" target="_blank" rel="noreferrer">
            Download Edge
          </Link>
        </Box>
      </Stack>
    </Alert>
  );
};

export default BrowserCompatibilityBanner;
