import { useEffect, useState } from 'react';

export const useSpeechVoices = () => {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return undefined;
    }

    const loadVoices = () => {
      const nextVoices = window.speechSynthesis.getVoices();
      setVoices(nextVoices);
    };

    loadVoices();

    const speech = window.speechSynthesis;
    const speechWithEvent = speech as SpeechSynthesis & {
      onvoiceschanged: ((this: SpeechSynthesis, ev: Event) => void) | null;
    };

    speech.addEventListener('voiceschanged', loadVoices);
    speechWithEvent.onvoiceschanged = loadVoices;

    return () => {
      speech.removeEventListener('voiceschanged', loadVoices);
      speechWithEvent.onvoiceschanged = null;
    };
  }, []);

  return voices;
};
