// ABOUTME: 防抖動 hook，用於延遲觸發函數，避免過度頻繁的更新
// ABOUTME: 支援自訂延遲時間和依賴項，主要用於編輯器內容同步

import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseDebounceOptions {
  delay?: number;
  leading?: boolean;
  trailing?: boolean;
}

/**
 * useDebounce hook
 * 
 * @param callback - 要執行的回調函數
 * @param delay - 延遲時間（毫秒），預設 300ms
 * @param options - 選項配置
 * @returns debounced 函數和取消函數
 */
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 300,
  options: UseDebounceOptions = {}
) {
  const { leading = false, trailing = true } = options;
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const callbackRef = useRef(callback);
  const lastInvokeTimeRef = useRef(0);
  const leadingRef = useRef(true);

  // 保持 callback 的最新引用
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      
      // 清除之前的計時器
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      // Leading edge 調用
      if (leading && leadingRef.current) {
        leadingRef.current = false;
        lastInvokeTimeRef.current = now;
        return callbackRef.current(...args);
      }

      // Trailing edge 調用
      if (trailing) {
        timeoutRef.current = setTimeout(() => {
          lastInvokeTimeRef.current = Date.now();
          leadingRef.current = true;
          callbackRef.current(...args);
          timeoutRef.current = null;
        }, delay);
      }
    },
    [delay, leading, trailing]
  );

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    leadingRef.current = true;
  }, []);

  const flush = useCallback(
    (...args: Parameters<T>) => {
      cancel();
      lastInvokeTimeRef.current = Date.now();
      return callbackRef.current(...args);
    },
    [cancel]
  );

  // 清理副作用
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    debouncedCallback,
    cancel,
    flush,
  };
}

/**
 * useDebounceValue hook
 * 用於防抖動數值變化
 * 
 * @param value - 要防抖的值
 * @param delay - 延遲時間（毫秒）
 * @returns 防抖後的值
 */
export function useDebounceValue<T>(value: T, delay: number = 300): T {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const valueRef = useRef(value);
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // 如果值沒有變化，直接返回
    if (valueRef.current === value) {
      return;
    }

    valueRef.current = value;

    // 清除之前的計時器
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // 設置新的計時器
    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(value);
      timeoutRef.current = null;
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay]);

  return debouncedValue;
}

