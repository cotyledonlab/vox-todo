import {
  getBrowserInfo,
  getSpeechRecognitionConstructor,
  isSpeechRecognitionSupported,
} from '../browserDetection';

const setUserAgent = (userAgent: string) => {
  Object.defineProperty(window.navigator, 'userAgent', {
    value: userAgent,
    configurable: true,
  });
};

describe('browserDetection', () => {
  const originalSpeechRecognition = (window as any).SpeechRecognition;
  const originalWebkit = (window as any).webkitSpeechRecognition;

  afterEach(() => {
    setUserAgent('');
    (window as any).SpeechRecognition = originalSpeechRecognition;
    (window as any).webkitSpeechRecognition = originalWebkit;
  });

  it('detects Chrome user agent', () => {
    setUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );
    expect(getBrowserInfo().name).toBe('Chrome');
  });

  it('detects Firefox user agent', () => {
    setUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:120.0) Gecko/20100101 Firefox/120.0'
    );
    expect(getBrowserInfo().name).toBe('Firefox');
  });

  it('reports speech recognition support when constructor exists', () => {
    (window as any).SpeechRecognition = function SpeechRecognition() {};
    expect(isSpeechRecognitionSupported()).toBe(true);
    expect(getSpeechRecognitionConstructor()).toBeTruthy();
  });

  it('reports no speech recognition support without constructor', () => {
    (window as any).SpeechRecognition = undefined;
    (window as any).webkitSpeechRecognition = undefined;
    expect(isSpeechRecognitionSupported()).toBe(false);
  });
});
