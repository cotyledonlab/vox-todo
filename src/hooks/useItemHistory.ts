import { useCallback, useMemo } from 'react';
import { useLocalStorageState } from './useLocalStorage';
import type { Category } from '../types/Todo';

export type ItemHistoryEntry = {
  name: string;
  quantity?: number;
  unit?: string;
  category?: Category;
  lastAddedAt: number;
  count: number;
};

export type ItemHistoryInput = {
  name: string;
  quantity?: number;
  unit?: string;
  category?: Category;
};

interface UseItemHistoryOptions {
  maxItems?: number;
}

const HISTORY_STORAGE_KEY = 'vox-todo:item-history';
const HISTORY_STORAGE_VERSION = 1;

const normalizeName = (name: string) => name.trim().toLowerCase();

export const useItemHistory = (options?: UseItemHistoryOptions) => {
  const maxItems = options?.maxItems ?? 20;
  const { value: history, setValue: setHistory, clear, error } = useLocalStorageState<
    ItemHistoryEntry[]
  >({
    key: HISTORY_STORAGE_KEY,
    initialValue: [],
    version: HISTORY_STORAGE_VERSION,
  });

  const recordItem = useCallback(
    (item: ItemHistoryInput) => {
      const trimmed = item.name.trim();
      if (!trimmed) {
        return;
      }
      const normalized = normalizeName(trimmed);
      const now = Date.now();

      setHistory(prev => {
        const next = [...prev];
        const index = next.findIndex(entry => normalizeName(entry.name) === normalized);
        if (index >= 0) {
          const existing = next[index];
          next[index] = {
            ...existing,
            name: trimmed,
            quantity: item.quantity ?? existing.quantity,
            unit: item.unit ?? existing.unit,
            category: item.category ?? existing.category,
            lastAddedAt: now,
            count: existing.count + 1,
          };
        } else {
          next.push({
            name: trimmed,
            quantity: item.quantity,
            unit: item.unit,
            category: item.category,
            lastAddedAt: now,
            count: 1,
          });
        }

        return [...next]
          .sort((a, b) => b.lastAddedAt - a.lastAddedAt)
          .slice(0, maxItems);
      });
    },
    [maxItems, setHistory]
  );

  const recentItems = useMemo(
    () => [...history].sort((a, b) => b.lastAddedAt - a.lastAddedAt),
    [history]
  );

  const frequentItems = useMemo(
    () =>
      [...history].sort(
        (a, b) => b.count - a.count || b.lastAddedAt - a.lastAddedAt
      ),
    [history]
  );

  return {
    history,
    recentItems,
    frequentItems,
    recordItem,
    clearHistory: clear,
    error,
  };
};
