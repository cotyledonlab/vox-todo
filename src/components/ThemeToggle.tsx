import React, { useContext } from 'react';
import { ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import SettingsBrightnessIcon from '@mui/icons-material/SettingsBrightness';
import { ThemeModeContext } from '../context/ThemeContext';

const ThemeToggle: React.FC = () => {
  const { mode, setMode } = useContext(ThemeModeContext);

  return (
    <div>
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
        Theme
      </Typography>
      <ToggleButtonGroup
        value={mode}
        exclusive
        onChange={(_, value) => {
          if (value) {
            setMode(value);
          }
        }}
        size="small"
        fullWidth
        aria-label="Theme mode"
      >
        <ToggleButton value="light" aria-label="Light mode">
          <LightModeIcon fontSize="small" />
        </ToggleButton>
        <ToggleButton value="system" aria-label="System mode">
          <SettingsBrightnessIcon fontSize="small" />
        </ToggleButton>
        <ToggleButton value="dark" aria-label="Dark mode">
          <DarkModeIcon fontSize="small" />
        </ToggleButton>
      </ToggleButtonGroup>
    </div>
  );
};

export default ThemeToggle;
