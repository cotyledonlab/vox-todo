import type { TodoFilter } from './Todo';

export type VoiceCommand =
  | { type: 'add'; text: string }
  | { type: 'delete'; text: string }
  | { type: 'complete'; text: string }
  | { type: 'edit'; target: string; text: string }
  | { type: 'clearCompleted' }
  | { type: 'filter'; filter: TodoFilter }
  | { type: 'count' }
  | { type: 'move'; text: string; direction: 'up' | 'down' }
  | { type: 'help' }
  | { type: 'unknown'; raw: string };
