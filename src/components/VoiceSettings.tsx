import React from 'react';
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import { getSamanthaVoiceName } from '../utils/textToSpeech';

interface VoiceSettingsProps {
  voices: SpeechSynthesisVoice[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const VoiceSettings: React.FC<VoiceSettingsProps> = ({
  voices,
  value,
  onChange,
  disabled,
}) => (
  <Stack spacing={1.2}>
    <Typography variant="subtitle2" color="text.secondary">
      Voice confirmations
    </Typography>
    <FormControl fullWidth size="small" disabled={disabled}>
      <InputLabel id="voice-select-label">Voice</InputLabel>
      <Select
        labelId="voice-select-label"
        value={value}
        label="Voice"
        onChange={event => onChange(event.target.value)}
      >
        <MenuItem value="auto">
          Auto ({getSamanthaVoiceName()} if available)
        </MenuItem>
        {voices.map(voice => (
          <MenuItem key={voice.voiceURI} value={voice.voiceURI}>
            {voice.name} ({voice.lang}){voice.default ? ' · default' : ''}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  </Stack>
);

export default VoiceSettings;
