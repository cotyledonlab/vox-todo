import type { VoiceCommand } from '../types/VoiceCommand';
import type { TodoFilter } from '../types/Todo';

const trimPunctuation = (text: string) =>
  text.replace(/^[\s"']+|[\s"']+$/g, '').trim();

export const parseVoiceCommand = (input: string): VoiceCommand => {
  const raw = input.trim();
  if (!raw) {
    return { type: 'unknown', raw: input };
  }

  const normalized = raw.toLowerCase();

  if (/^(help|what can i say|commands|voice commands)$/i.test(normalized)) {
    return { type: 'help' };
  }

  if (/^(how many|count|number of)\s+(items|list|tasks|todos)?$/i.test(normalized)) {
    return { type: 'count' };
  }

  const clearCompletedMatch = normalized.match(
    /^(clear|remove|delete)\s+(completed|done|checked|picked up|picked)(\s+items|\s+tasks|\s+todos|\s+list)?$/i
  );
  if (clearCompletedMatch) {
    return { type: 'clearCompleted' };
  }

  const filterMatch = normalized.match(
    /^(show|filter)\s+(all|active|completed|picked up|picked|checked|need|needed)$/i
  );
  if (filterMatch) {
    const nextFilter = filterMatch[2];
    const normalizedFilter = ['picked up', 'picked', 'checked'].includes(nextFilter)
      ? 'completed'
      : ['need', 'needed'].includes(nextFilter)
        ? 'active'
        : nextFilter;
    return { type: 'filter', filter: normalizedFilter as TodoFilter };
  }

  const moveMatch = normalized.match(/^move\s+(.*)\s+(up|down)$/i);
  if (moveMatch) {
    return {
      type: 'move',
      text: trimPunctuation(moveMatch[1]),
      direction: moveMatch[2] as 'up' | 'down',
    };
  }

  const editMatch = normalized.match(
    /^(edit|update|change)\s+(.*?)\s+(to|into)\s+(.*)$/i
  );
  if (editMatch) {
    return {
      type: 'edit',
      target: trimPunctuation(editMatch[2]),
      text: trimPunctuation(editMatch[4]),
    };
  }

  const addMatch = normalized.match(/^(add|create|new)\s+(.*)$/i);
  if (addMatch) {
    return { type: 'add', text: trimPunctuation(addMatch[2]) };
  }

  const deleteMatch = normalized.match(/^(delete|remove|discard)\s+(.*)$/i);
  if (deleteMatch) {
    return { type: 'delete', text: trimPunctuation(deleteMatch[2]) };
  }

  const completeMatch = normalized.match(
    /^(complete|finish|mark|got|picked up|pick up)\s+(.*)$/i
  );
  if (completeMatch) {
    const taskText = completeMatch[2].replace(/\s+(done|complete|picked up|picked)$/i, '');
    return { type: 'complete', text: trimPunctuation(taskText) };
  }

  return { type: 'unknown', raw: input };
};
