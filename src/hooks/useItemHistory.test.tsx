import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useItemHistory } from './useItemHistory';

describe('useItemHistory', () => {
  it('records items and increments counts', () => {
    const nowSpy = vi.spyOn(Date, 'now');
    nowSpy.mockReturnValueOnce(1000).mockReturnValueOnce(2000);

    const { result } = renderHook(() => useItemHistory());

    act(() => {
      result.current.recordItem({ name: 'Milk' });
    });

    act(() => {
      result.current.recordItem({ name: 'Milk' });
    });

    expect(result.current.history).toHaveLength(1);
    expect(result.current.history[0].count).toBe(2);
    expect(result.current.history[0].lastAddedAt).toBe(2000);

    nowSpy.mockRestore();
  });

  it('sorts recent and frequent items', () => {
    const nowSpy = vi.spyOn(Date, 'now');
    nowSpy
      .mockReturnValueOnce(1000)
      .mockReturnValueOnce(2000)
      .mockReturnValueOnce(3000);

    const { result } = renderHook(() => useItemHistory());

    act(() => {
      result.current.recordItem({ name: 'Milk' });
    });
    act(() => {
      result.current.recordItem({ name: 'Eggs' });
    });
    act(() => {
      result.current.recordItem({ name: 'Milk' });
    });

    expect(result.current.recentItems[0].name).toBe('Milk');
    expect(result.current.frequentItems[0].name).toBe('Milk');

    nowSpy.mockRestore();
  });
});
