// ABOUTME: 編輯器內容組件，負責核心編輯邏輯和狀態管理
// ABOUTME: 包含內容同步、統計計算和初始化邏輯

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useEditorStore } from '@/store/editorStore';
import { useAutoSave } from '@/hooks/useAutoSave';
import { useDebounce } from '@/hooks/useDebounce';
import type { EditorStats, EditorCallbacks, EditorSettings } from '@/types/editor';

// 預設編輯器統計
const DEFAULT_STATS: EditorStats = {
  characters: 0,
  charactersNoSpaces: 0,
  words: 0,
  lines: 1,
  selectedText: '',
  selectedLength: 0,
  cursorLine: 1,
  cursorColumn: 1,
};

export interface EditorPanelContentProps {
  propContent?: string;
  settings?: Partial<EditorSettings>;
  callbacks?: EditorCallbacks;
}

export function useEditorPanelContent({
  propContent,
  settings,
  callbacks,
}: EditorPanelContentProps) {
  // 全域狀態管理
  const {
    content: storeContent,
    updateContent,
    setContent: setStoreContent,
    isModified: storeIsModified,
    lastSaveTime,
    autoSaveEnabled,
    error: storeError,
    isLargeFile,
    isExternalUpdate: storeIsExternalUpdate,
    clearError,
  } = useEditorStore();

  // 本地狀態
  const [stats, setStats] = useState<EditorStats>(DEFAULT_STATS);
  const [localContent, setLocalContent] = useState(propContent || '');
  const [isInitialized, setIsInitialized] = useState(false);

  const markdownEditorRef = useRef<HTMLTextAreaElement>(null);

  // 自動儲存 hook（記憶化配置）
  const autoSaveConfig = useMemo(() => ({
    interval: settings?.autoSaveInterval || 30000,
    key: 'markdown-editor-content',
    immediate: false,
    onSave: (content: string) => {
      callbacks?.onSave?.(content);
    },
    onError: (error: Error) => {
      console.error('Auto save error:', error);
    },
  }), [settings?.autoSaveInterval, callbacks]);

  const autoSave = useAutoSave(autoSaveConfig);

  // 使用 debounce 來同步到全域狀態（記憶化回調）
  const syncToStore = useCallback((content: string) => {
    updateContent(content);
  }, [updateContent]);

  const { debouncedCallback: debouncedSync } = useDebounce(
    syncToStore,
    300 // 固定使用 300ms 同步延遲
  );

  // 計算編輯器統計資訊
  const calculateStats = useCallback(
    (
      text: string,
      selectionStart: number,
      selectionEnd: number,
      cursorPosition: number
    ): EditorStats => {
      const lines = text.split('\n');
      const characters = text.length;
      const charactersNoSpaces = text.replace(/\s/g, '').length;
      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
      const selectedText = text.slice(selectionStart, selectionEnd);
      const selectedLength = selectedText.length;

      // 計算游標位置
      const textBeforeCursor = text.slice(0, cursorPosition);
      const linesBeforeCursor = textBeforeCursor.split('\n');
      const cursorLine = linesBeforeCursor.length;
      const lastLine = linesBeforeCursor[linesBeforeCursor.length - 1] || '';
      const cursorColumn = lastLine.length + 1;

      return {
        characters,
        charactersNoSpaces,
        words,
        lines: lines.length,
        selectedText,
        selectedLength,
        cursorLine,
        cursorColumn,
      };
    },
    []
  );

  // 更新統計資訊
  const updateStats = useCallback(() => {
    const textarea = markdownEditorRef.current;
    if (!textarea) return;

    const newStats = calculateStats(
      localContent,
      textarea.selectionStart,
      textarea.selectionEnd,
      textarea.selectionStart
    );

    setStats(newStats);

    // 呼叫回調函數
    if (callbacks?.onSelectionChange && newStats.selectedLength > 0) {
      callbacks.onSelectionChange(
        textarea.selectionStart,
        textarea.selectionEnd,
        newStats.selectedText
      );
    }

    if (callbacks?.onCursorChange) {
      callbacks.onCursorChange(newStats.cursorLine, newStats.cursorColumn);
    }
  }, [localContent, calculateStats, callbacks]);

  // 處理內容變更
  const handleContentChange = useCallback(
    (newContent: string) => {
      // 更新本地狀態
      setLocalContent(newContent);

      // 同步到全域狀態 (debounced)
      debouncedSync(newContent);

      // 更新統計資訊
      const textarea = markdownEditorRef.current;
      if (textarea) {
        const newStats = calculateStats(
          newContent,
          textarea.selectionStart,
          textarea.selectionEnd,
          textarea.selectionStart
        );
        setStats(newStats);

        // 呼叫回調函數
        callbacks?.onChange?.(newContent, newStats);
      }

      // 清除錯誤狀態
      if (storeError) {
        clearError();
      }
    },
    [calculateStats, callbacks, debouncedSync, storeError, clearError]
  );

  // 初始化邏輯 - 只執行一次
  useEffect(() => {
    if (isInitialized) return;

    // 優先順序：1. savedContent 2. propContent 3. storeContent
    const { content: savedContent, hasData } = autoSave.loadSavedContent();
    let contentToUse = '';

    if (hasData && savedContent.trim()) {
      contentToUse = savedContent;
      console.log('載入已儲存內容:', savedContent.slice(0, 50) + '...');
    } else if (propContent) {
      contentToUse = propContent;
    } else if (storeContent) {
      contentToUse = storeContent;
    }

    if (contentToUse !== localContent) {
      setLocalContent(contentToUse);
      setStoreContent(contentToUse);
    }

    setIsInitialized(true);
  }, [
    isInitialized,
    propContent,
    storeContent,
    localContent,
    autoSave,
    setStoreContent,
  ]);

  // 監聽本地內容變化並同步到全域狀態（避免無限循環）
  useEffect(() => {
    if (
      isInitialized &&
      localContent !== storeContent &&
      !storeIsExternalUpdate
    ) {
      debouncedSync(localContent);
    }
  }, [
    localContent,
    isInitialized,
    storeContent,
    storeIsExternalUpdate,
    debouncedSync,
  ]);

  // 監聽外部更新（AI 生成等）並更新本地內容
  useEffect(() => {
    if (
      isInitialized &&
      storeIsExternalUpdate &&
      storeContent !== localContent
    ) {
      console.log('檢測到外部更新 (AI 生成)，更新本地內容');
      setLocalContent(storeContent);
    }
  }, [storeIsExternalUpdate, storeContent, localContent, isInitialized]);

  return {
    // 狀態
    localContent,
    setLocalContent,
    stats,
    markdownEditorRef,
    
    // 全域狀態
    storeIsModified,
    lastSaveTime,
    autoSaveEnabled,
    storeError,
    isLargeFile,
    clearError,
    setStoreContent,
    
    // 方法
    handleContentChange,
    updateStats,
    autoSave,
    
    // 計算屬性
    lastSaved: lastSaveTime ? new Date(lastSaveTime) : null,
  };
}