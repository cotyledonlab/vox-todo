import { parseVoiceCommand } from '../voiceCommandParser';

describe('parseVoiceCommand', () => {
  it('parses add commands', () => {
    expect(parseVoiceCommand('Add buy milk')).toEqual({
      type: 'add',
      text: 'buy milk',
    });
  });

  it('parses complete commands', () => {
    expect(parseVoiceCommand('Complete buy milk')).toEqual({
      type: 'complete',
      text: 'buy milk',
    });
  });

  it('parses edit commands', () => {
    expect(parseVoiceCommand('Edit buy milk to buy oat milk')).toEqual({
      type: 'edit',
      target: 'buy milk',
      text: 'buy oat milk',
    });
  });

  it('parses filter commands', () => {
    expect(parseVoiceCommand('Show completed')).toEqual({
      type: 'filter',
      filter: 'completed',
    });
  });

  it('returns unknown for unsupported command', () => {
    expect(parseVoiceCommand('Do the thing')).toEqual({
      type: 'unknown',
      raw: 'Do the thing',
    });
  });
});
