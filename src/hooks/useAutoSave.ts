// ABOUTME: 自動儲存 hook，定期將編輯器內容儲存到 localStorage
// ABOUTME: 支援自訂儲存間隔、手動儲存和儲存狀態監控

import { useEffect, useRef, useCallback, useMemo } from 'react';
import { useEditorStore } from '@/store/editorStore';
import { setStorageItem, getStorageItem } from '@/lib/storage';

export interface UseAutoSaveOptions {
  /** 自動儲存間隔（毫秒），預設 30 秒 */
  interval?: number;
  /** localStorage 鍵名 */
  key?: string;
  /** 是否立即儲存變更 */
  immediate?: boolean;
  /** 儲存前的內容驗證函數 */
  validate?: (content: string) => boolean;
  /** 儲存成功回調 */
  onSave?: (content: string, timestamp: number) => void;
  /** 儲存失敗回調 */
  onError?: (error: Error) => void;
}

export interface AutoSaveStatus {
  isEnabled: boolean;
  lastSaveTime: number | null;
  nextSaveTime: number | null;
  isSaving: boolean;
  saveCount: number;
}

const DEFAULT_OPTIONS: Required<UseAutoSaveOptions> = {
  interval: 30000, // 30 秒
  key: 'markdown-editor-content',
  immediate: false,
  validate: () => true,
  onSave: () => {},
  onError: () => {},
};

export function useAutoSave(options: UseAutoSaveOptions = {}) {
  const opts = useMemo(() => ({ ...DEFAULT_OPTIONS, ...options }), [options]);

  const { content, isModified, autoSaveEnabled, updateSaveTime, setError } =
    useEditorStore();

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isSavingRef = useRef(false);
  const saveCountRef = useRef(0);
  const lastSaveTimeRef = useRef<number | null>(null);

  // 執行儲存操作
  const performSave = useCallback(
    async (
      contentToSave: string,
      isManual: boolean = false
    ): Promise<boolean> => {
      if (isSavingRef.current && !isManual) {
        return false;
      }

      // 驗證內容
      if (!opts.validate(contentToSave)) {
        const error = new Error('Content validation failed');
        opts.onError(error);
        setError('內容驗證失敗');
        return false;
      }

      try {
        isSavingRef.current = true;

        // 儲存到 localStorage
        const saveData = {
          content: contentToSave,
          timestamp: Date.now(),
          version: '1.0',
        };

        setStorageItem(opts.key, saveData);

        // 更新狀態
        const saveTime = Date.now();
        lastSaveTimeRef.current = saveTime;
        saveCountRef.current += 1;
        updateSaveTime();

        // 觸發成功回調
        opts.onSave(contentToSave, saveTime);

        return true;
      } catch (error) {
        const errorObj =
          error instanceof Error ? error : new Error('Save failed');
        opts.onError(errorObj);
        setError(`儲存失敗: ${errorObj.message}`);
        return false;
      } finally {
        isSavingRef.current = false;
      }
    },
    [opts, updateSaveTime, setError]
  );

  // 手動儲存
  const save = useCallback(async (): Promise<boolean> => {
    return await performSave(content, true);
  }, [content, performSave]);

  // 載入儲存的內容
  const loadSavedContent = useCallback((): {
    content: string;
    timestamp: number | null;
    hasData: boolean;
  } => {
    try {
      const savedData = getStorageItem<{
        content: string;
        timestamp: number;
      } | null>(opts.key, null);

      if (
        savedData &&
        typeof savedData === 'object' &&
        'content' in savedData
      ) {
        return {
          content: savedData.content,
          timestamp: savedData.timestamp || null,
          hasData: true,
        };
      }

      return {
        content: '',
        timestamp: null,
        hasData: false,
      };
    } catch (error) {
      console.warn('Failed to load saved content:', error);
      return {
        content: '',
        timestamp: null,
        hasData: false,
      };
    }
  }, [opts.key]);

  // 清除儲存的內容
  const clearSavedContent = useCallback(() => {
    try {
      setStorageItem(opts.key, null);
      lastSaveTimeRef.current = null;
      saveCountRef.current = 0;
    } catch (error) {
      console.warn('Failed to clear saved content:', error);
    }
  }, [opts.key]);

  // 設置自動儲存定時器
  const startAutoSave = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      if (autoSaveEnabled && isModified && content.trim()) {
        performSave(content, false);
      }
    }, opts.interval);
  }, [autoSaveEnabled, isModified, content, opts.interval, performSave]);

  // 停止自動儲存
  const stopAutoSave = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // 獲取自動儲存狀態
  const getStatus = useCallback((): AutoSaveStatus => {
    const nextSaveTime = lastSaveTimeRef.current
      ? lastSaveTimeRef.current + opts.interval
      : null;

    return {
      isEnabled: autoSaveEnabled,
      lastSaveTime: lastSaveTimeRef.current,
      nextSaveTime,
      isSaving: isSavingRef.current,
      saveCount: saveCountRef.current,
    };
  }, [autoSaveEnabled, opts.interval]);

  // 啟動自動儲存
  useEffect(() => {
    if (autoSaveEnabled) {
      startAutoSave();
    } else {
      stopAutoSave();
    }

    return () => stopAutoSave();
  }, [autoSaveEnabled, startAutoSave, stopAutoSave]);

  // 立即儲存選項
  useEffect(() => {
    if (opts.immediate && isModified && content.trim()) {
      performSave(content, false);
    }
  }, [content, isModified, opts.immediate, performSave]);

  // 組件卸載時清理
  useEffect(() => {
    return () => {
      stopAutoSave();
    };
  }, [stopAutoSave]);

  return {
    save,
    loadSavedContent,
    clearSavedContent,
    getStatus,
    startAutoSave,
    stopAutoSave,
  };
}
