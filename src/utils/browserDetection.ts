export type BrowserName = 'Chrome' | 'Edge' | 'Safari' | 'Firefox' | 'Unknown';

export interface BrowserInfo {
  name: BrowserName;
  isMobile: boolean;
}

type SpeechRecognitionConstructor = new () => {
  continuous: boolean;
  interimResults: boolean;
  lang?: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: (() => void) | null;
  onresult: ((event: any) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: any) => void) | null;
};

export const getSpeechRecognitionConstructor = (): SpeechRecognitionConstructor | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  const w = window as typeof window & {
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
    SpeechRecognition?: SpeechRecognitionConstructor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
};

export const isSpeechRecognitionSupported = () =>
  Boolean(getSpeechRecognitionConstructor());

export const getBrowserInfo = (): BrowserInfo => {
  if (typeof navigator === 'undefined') {
    return { name: 'Unknown', isMobile: false };
  }

  const ua = navigator.userAgent;
  const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(ua);

  if (/Edg\//i.test(ua)) {
    return { name: 'Edge', isMobile };
  }
  if (/Chrome\//i.test(ua) && !/Edg\//i.test(ua)) {
    return { name: 'Chrome', isMobile };
  }
  if (/Safari\//i.test(ua) && !/Chrome\//i.test(ua)) {
    return { name: 'Safari', isMobile };
  }
  if (/Firefox\//i.test(ua)) {
    return { name: 'Firefox', isMobile };
  }

  return { name: 'Unknown', isMobile };
};
