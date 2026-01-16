import type { Todo } from '../types/Todo';
import { formatQuantity } from './quantityParser';

export type ExportFormat = 'plain' | 'markdown' | 'json';

interface ExportOptions {
  format: ExportFormat;
  includeChecked: boolean;
}

const buildLabel = (todo: Todo) => {
  const quantityLabel = formatQuantity(todo.quantity, todo.unit);
  return quantityLabel ? `${quantityLabel} ${todo.text}` : todo.text;
};

const filterItems = (items: Todo[], includeChecked: boolean) =>
  includeChecked ? items : items.filter(item => !item.completed);

export const exportList = (items: Todo[], options: ExportOptions) => {
  const filtered = filterItems(items, options.includeChecked);

  if (options.format === 'markdown') {
    return filtered
      .map(item => `- [${item.completed ? 'x' : ' '}] ${buildLabel(item)}`)
      .join('\n');
  }

  if (options.format === 'json') {
    return JSON.stringify(filtered, null, 2);
  }

  return filtered.map(item => buildLabel(item)).join('\n');
};
