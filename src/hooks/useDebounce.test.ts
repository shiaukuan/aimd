// ABOUTME: useDebounce hook 的單元測試
// ABOUTME: 測試防抖動功能、取消和立即執行功能

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebounce } from './useDebounce';

// Mock timers
beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('useDebounce', () => {
  describe('基本防抖功能', () => {
    it('應該延遲執行回調函數', () => {
      const mockCallback = vi.fn();
      const { result } = renderHook(() => useDebounce(mockCallback, 300));

      act(() => {
        result.current.debouncedCallback('test');
      });

      // 立即檢查，回調不應該被調用
      expect(mockCallback).not.toHaveBeenCalled();

      // 快進時間
      act(() => {
        vi.advanceTimersByTime(300);
      });

      // 現在回調應該被調用
      expect(mockCallback).toHaveBeenCalledWith('test');
      expect(mockCallback).toHaveBeenCalledTimes(1);
    });

    it('應該取消之前的調用', () => {
      const mockCallback = vi.fn();
      const { result } = renderHook(() => useDebounce(mockCallback, 300));

      // 第一次調用
      act(() => {
        result.current.debouncedCallback('first');
      });

      // 150ms 後第二次調用
      act(() => {
        vi.advanceTimersByTime(150);
        result.current.debouncedCallback('second');
      });

      // 再等 300ms
      act(() => {
        vi.advanceTimersByTime(300);
      });

      // 只應該執行最後一次調用
      expect(mockCallback).toHaveBeenCalledWith('second');
      expect(mockCallback).toHaveBeenCalledTimes(1);
    });

    it('應該使用最新的回調函數', () => {
      let mockCallback = vi.fn();
      const { result, rerender } = renderHook(
        ({ callback }) => useDebounce(callback, 300),
        { initialProps: { callback: mockCallback } }
      );

      act(() => {
        result.current.debouncedCallback('test');
      });

      // 更改回調函數
      const newMockCallback = vi.fn();
      mockCallback = newMockCallback;
      rerender({ callback: newMockCallback });

      // 快進時間
      act(() => {
        vi.advanceTimersByTime(300);
      });

      // 應該調用新的回調函數
      expect(newMockCallback).toHaveBeenCalledWith('test');
      expect(newMockCallback).toHaveBeenCalledTimes(1);
    });
  });

  describe('選項配置', () => {
    it('應該支援 leading edge 調用', () => {
      const mockCallback = vi.fn();
      const { result } = renderHook(() =>
        useDebounce(mockCallback, 300, { leading: true, trailing: false })
      );

      act(() => {
        result.current.debouncedCallback('test');
      });

      // 應該立即調用
      expect(mockCallback).toHaveBeenCalledWith('test');
      expect(mockCallback).toHaveBeenCalledTimes(1);

      // 快進時間，不應該再次調用
      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(mockCallback).toHaveBeenCalledTimes(1);
    });

    it('應該支援 trailing edge 調用（預設）', () => {
      const mockCallback = vi.fn();
      const { result } = renderHook(() =>
        useDebounce(mockCallback, 300, { trailing: true })
      );

      act(() => {
        result.current.debouncedCallback('test');
      });

      // 不應該立即調用
      expect(mockCallback).not.toHaveBeenCalled();

      // 快進時間
      act(() => {
        vi.advanceTimersByTime(300);
      });

      // 現在應該調用
      expect(mockCallback).toHaveBeenCalledWith('test');
      expect(mockCallback).toHaveBeenCalledTimes(1);
    });

    it('應該支援同時設置 leading 和 trailing', () => {
      const mockCallback = vi.fn();
      const { result } = renderHook(() =>
        useDebounce(mockCallback, 300, { leading: true, trailing: true })
      );

      act(() => {
        result.current.debouncedCallback('test');
      });

      // 應該立即調用（leading）
      expect(mockCallback).toHaveBeenCalledWith('test');
      expect(mockCallback).toHaveBeenCalledTimes(1);

      // 在 trailing 期間再次調用
      act(() => {
        vi.advanceTimersByTime(150);
        result.current.debouncedCallback('test2');
      });

      // 快進剩餘時間
      act(() => {
        vi.advanceTimersByTime(300);
      });

      // 應該有 trailing 調用
      expect(mockCallback).toHaveBeenCalledTimes(2);
    });
  });

  describe('控制方法', () => {
    it('cancel 應該取消待執行的調用', () => {
      const mockCallback = vi.fn();
      const { result } = renderHook(() => useDebounce(mockCallback, 300));

      act(() => {
        result.current.debouncedCallback('test');
      });

      // 取消調用
      act(() => {
        result.current.cancel();
      });

      // 快進時間
      act(() => {
        vi.advanceTimersByTime(300);
      });

      // 回調不應該被調用
      expect(mockCallback).not.toHaveBeenCalled();
    });

    it('flush 應該立即執行待執行的調用', () => {
      const mockCallback = vi.fn();
      const { result } = renderHook(() => useDebounce(mockCallback, 300));

      act(() => {
        result.current.debouncedCallback('test');
      });

      // 立即執行
      act(() => {
        result.current.flush('flushed');
      });

      // 回調應該立即被調用
      expect(mockCallback).toHaveBeenCalledWith('flushed');
      expect(mockCallback).toHaveBeenCalledTimes(1);

      // 快進時間，不應該再次調用
      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(mockCallback).toHaveBeenCalledTimes(1);
    });
  });

  describe('清理', () => {
    it('組件卸載時應該清理計時器', () => {
      const mockCallback = vi.fn();
      const { result, unmount } = renderHook(() =>
        useDebounce(mockCallback, 300)
      );

      act(() => {
        result.current.debouncedCallback('test');
      });

      // 卸載組件
      unmount();

      // 快進時間
      act(() => {
        vi.advanceTimersByTime(300);
      });

      // 回調不應該被調用
      expect(mockCallback).not.toHaveBeenCalled();
    });
  });
});

