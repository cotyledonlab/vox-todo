interface SpeechOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  lang?: string;
  voicePreference?: string;
}

const SAMANTHA_VOICE = 'Samantha';

const findDefaultVoice = (voices: SpeechSynthesisVoice[]) => {
  const samantha = voices.find(
    voice => voice.name.toLowerCase() === SAMANTHA_VOICE.toLowerCase()
  );
  if (samantha) {
    return samantha;
  }

  const englishVoice = voices.find(voice => voice.lang.toLowerCase().startsWith('en'));
  if (englishVoice) {
    return englishVoice;
  }

  return voices[0] ?? null;
};

const resolveVoice = (
  voices: SpeechSynthesisVoice[],
  voicePreference?: string
) => {
  if (!voices.length) {
    return null;
  }

  if (voicePreference && voicePreference !== 'auto') {
    const matched = voices.find(
      voice => voice.voiceURI === voicePreference || voice.name === voicePreference
    );
    if (matched) {
      return matched;
    }
  }

  return findDefaultVoice(voices);
};

export const speakText = (text: string, options: SpeechOptions = {}): boolean => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return false;
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = options.rate ?? 1;
  utterance.pitch = options.pitch ?? 1;
  utterance.volume = options.volume ?? 1;

  const voices = window.speechSynthesis.getVoices();
  const selectedVoice = resolveVoice(voices, options.voicePreference);
  if (selectedVoice) {
    utterance.voice = selectedVoice;
    utterance.lang = selectedVoice.lang;
  } else {
    utterance.lang = options.lang ?? 'en-US';
  }

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);

  return true;
};

export const getSamanthaVoiceName = () => SAMANTHA_VOICE;
