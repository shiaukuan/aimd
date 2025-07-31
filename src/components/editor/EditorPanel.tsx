// ABOUTME: 編輯器面板主組件，整合工具列、編輯區域和狀態列
// ABOUTME: 管理編輯器狀態、統計計算、格式化操作等核心功能

'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { EditorPanelProps, EditorStats, EditorAction } from '@/types/editor';
import { EditorToolbar } from './EditorToolbar';
import { EditorStatusBar } from './EditorStatusBar';
import { MarkdownEditor } from './MarkdownEditor';
import { useEditorStore } from '@/store/editorStore';
import { useAutoSave } from '@/hooks/useAutoSave';
import { useDebounce } from '@/hooks/useDebounce';
import { ErrorBoundaryWrapper } from '@/components/ui/ErrorBoundary';

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

export function EditorPanel({
  content: propContent,
  placeholder = '在這裡輸入你的 Markdown 內容...',
  readOnly = false,
  className,
  settings,
  callbacks,
}: EditorPanelProps) {
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
    clearError,
  } = useEditorStore();

  // 本地狀態
  const [stats, setStats] = useState<EditorStats>(DEFAULT_STATS);
  const [activeFormats] = useState<EditorAction[]>([]);
  const [localContent, setLocalContent] = useState(propContent || '');
  const [isInitialized, setIsInitialized] = useState(false);

  const markdownEditorRef = useRef<HTMLTextAreaElement>(null);

  // 自動儲存 hook
  const autoSave = useAutoSave({
    interval: settings?.autoSaveInterval || 30000,
    key: 'markdown-editor-content',
    immediate: false,
    onSave: (content) => {
      callbacks?.onSave?.(content);
    },
    onError: (error) => {
      console.error('Auto save error:', error);
    },
  });

  // 使用 debounce 來同步到全域狀態
  const { debouncedCallback: debouncedSync } = useDebounce(
    (content: string) => {
      updateContent(content);
    },
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

  // 處理工具列動作
  const handleToolbarAction = useCallback(
    async (action: EditorAction, data?: any) => {
      const textarea = markdownEditorRef.current;
      if (!textarea) return;
      const { selectionStart, selectionEnd } = textarea;
      const selectedText = localContent.slice(selectionStart, selectionEnd);

      let newContent = localContent;
      let newSelectionStart = selectionStart;
      let newSelectionEnd = selectionEnd;

      switch (action) {
        case 'bold':
          const boldText = selectedText || '粗體文字';
          newContent =
            localContent.slice(0, selectionStart) +
            `**${boldText}**` +
            localContent.slice(selectionEnd);
          newSelectionStart = selectionStart + 2;
          newSelectionEnd = newSelectionStart + boldText.length;
          break;

        case 'italic':
          const italicText = selectedText || '斜體文字';
          newContent =
            localContent.slice(0, selectionStart) +
            `*${italicText}*` +
            localContent.slice(selectionEnd);
          newSelectionStart = selectionStart + 1;
          newSelectionEnd = newSelectionStart + italicText.length;
          break;

        case 'code':
          const codeText = selectedText || '程式碼';
          newContent =
            localContent.slice(0, selectionStart) +
            `\`${codeText}\`` +
            localContent.slice(selectionEnd);
          newSelectionStart = selectionStart + 1;
          newSelectionEnd = newSelectionStart + codeText.length;
          break;

        case 'heading1':
        case 'heading2':
        case 'heading3':
          const level =
            action === 'heading1' ? 1 : action === 'heading2' ? 2 : 3;
          const headingText = selectedText || `標題 ${level}`;
          const headingPrefix = '#'.repeat(level) + ' ';
          newContent =
            localContent.slice(0, selectionStart) +
            headingPrefix +
            headingText +
            localContent.slice(selectionEnd);
          newSelectionStart = selectionStart + headingPrefix.length;
          newSelectionEnd = newSelectionStart + headingText.length;
          break;

        case 'bulletList':
          const bulletText = selectedText || '清單項目';
          newContent =
            localContent.slice(0, selectionStart) +
            `- ${bulletText}` +
            localContent.slice(selectionEnd);
          newSelectionStart = selectionStart + 2;
          newSelectionEnd = newSelectionStart + bulletText.length;
          break;

        case 'numberedList':
          const numberedText = selectedText || '清單項目';
          newContent =
            localContent.slice(0, selectionStart) +
            `1. ${numberedText}` +
            localContent.slice(selectionEnd);
          newSelectionStart = selectionStart + 3;
          newSelectionEnd = newSelectionStart + numberedText.length;
          break;

        case 'link':
          const linkText = selectedText || '連結文字';
          const linkMarkdown = `[${linkText}](url)`;
          newContent =
            localContent.slice(0, selectionStart) +
            linkMarkdown +
            localContent.slice(selectionEnd);
          newSelectionStart = selectionStart + linkText.length + 3;
          newSelectionEnd = newSelectionStart + 3; // 選中 "url"
          break;

        case 'image':
          const altText = selectedText || '圖片描述';
          const imageMarkdown = `![${altText}](image-url)`;
          newContent =
            localContent.slice(0, selectionStart) +
            imageMarkdown +
            localContent.slice(selectionEnd);
          newSelectionStart = selectionStart + altText.length + 4;
          newSelectionEnd = newSelectionStart + 9; // 選中 "image-url"
          break;

        case 'codeBlock':
          const codeBlockText = selectedText || '程式碼';
          const codeBlock = `\`\`\`\n${codeBlockText}\n\`\`\``;
          newContent =
            localContent.slice(0, selectionStart) +
            codeBlock +
            localContent.slice(selectionEnd);
          newSelectionStart = selectionStart + 4;
          newSelectionEnd = newSelectionStart + codeBlockText.length;
          break;

        case 'save':
          // 手動儲存：使用編輯器中的實際內容
          const currentContent = markdownEditorRef.current?.value || localContent;
          const saveSuccess = await autoSave.save();
          if (saveSuccess) {
            callbacks?.onSave?.(currentContent);
          }
          break;

        case 'export':
          callbacks?.onExport?.(localContent, 'pptx');
          break;

        case 'new':
          if (confirm('確定要新建文件嗎？未儲存的變更將會丟失。')) {
            setLocalContent('');
            setStoreContent('');
            autoSave.clearSavedContent();
          }
          break;

        default:
          // 其他動作交給回調函數處理
          callbacks?.onAction?.(action, data);
          return;
      }

      // 更新內容
      if (newContent !== localContent) {
        handleContentChange(newContent);

        // 恢復選取範圍
        setTimeout(() => {
          const textarea = markdownEditorRef.current;
          if (textarea) {
            textarea.setSelectionRange(newSelectionStart, newSelectionEnd);
            textarea.focus();
          }
        }, 0);
      }
    },
    [localContent, callbacks, handleContentChange, autoSave, setStoreContent]
  );

  // 處理鍵盤快捷鍵
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'b':
            e.preventDefault();
            handleToolbarAction('bold');
            break;
          case 'i':
            e.preventDefault();
            handleToolbarAction('italic');
            break;
          case 's':
            e.preventDefault();
            handleToolbarAction('save');
            break;
          case 'k':
            e.preventDefault();
            handleToolbarAction('link');
            break;
          case '`':
            e.preventDefault();
            if (e.shiftKey) {
              handleToolbarAction('codeBlock');
            } else {
              handleToolbarAction('code');
            }
            break;
          case '1':
          case '2':
          case '3':
            if (e.altKey) {
              e.preventDefault();
              handleToolbarAction(`heading${e.key}` as EditorAction);
            }
            break;
        }
      }
    },
    [handleToolbarAction]
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
  }, [isInitialized, propContent, storeContent, localContent, autoSave, setStoreContent]);

  // 監聽本地內容變化並同步到全域狀態（避免無限循環）
  useEffect(() => {
    if (isInitialized && localContent !== storeContent) {
      debouncedSync(localContent);
    }
  }, [localContent, isInitialized, storeContent, debouncedSync]);

  // 計算最後儲存時間
  const lastSaved = lastSaveTime ? new Date(lastSaveTime) : null;

  return (
    <ErrorBoundaryWrapper
      title="編輯器錯誤"
      description="編輯器遇到錯誤，請嘗試重新載入"
      onError={(error) => {
        console.error('Editor panel error:', error);
        callbacks?.onError?.(error);
      }}
    >
      <div
        className={cn(
          'flex flex-col h-full bg-background border rounded-lg overflow-hidden',
          className,
          isLargeFile && 'border-orange-200 dark:border-orange-800'
        )}
        data-testid="editor-panel"
      >
        {/* 錯誤提示 */}
        {storeError && (
          <div className="bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800 px-4 py-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-red-700 dark:text-red-400">
                {storeError}
              </span>
              <button
                onClick={clearError}
                className="text-red-500 hover:text-red-700 text-xs underline"
              >
                關閉
              </button>
            </div>
          </div>
        )}

        {/* 大檔案警告 */}
        {isLargeFile && (
          <div className="bg-orange-50 dark:bg-orange-900/20 border-b border-orange-200 dark:border-orange-800 px-4 py-2">
            <span className="text-sm text-orange-700 dark:text-orange-400">
              大檔案模式：檔案超過 10,000 字符，部分功能可能受到影響
            </span>
          </div>
        )}

        {/* 標題列 */}
        <div className="flex items-center justify-between p-3 border-b bg-background">
          <h2 className="text-lg font-semibold">Markdown 編輯器</h2>
        </div>

        {/* 工具列 */}
        <EditorToolbar
          disabled={readOnly}
          onAction={handleToolbarAction}
          activeFormats={activeFormats}
        />

        {/* 編輯區域 */}
        <div className="flex-1 relative overflow-hidden">
          <MarkdownEditor
            ref={markdownEditorRef}
            value={localContent}
            onChange={handleContentChange}
            onSelect={updateStats}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            readOnly={readOnly}
            className="w-full h-full"
            style={{
              fontSize: settings?.fontSize ? `${settings.fontSize}px` : undefined,
              tabSize: settings?.tabSize || 2,
            }}
            data-testid="markdown-editor"
          />
        </div>

        {/* 狀態列 */}
        <EditorStatusBar
          stats={stats}
          isModified={storeIsModified}
          lastSaved={lastSaved}
          showDetailedStats={true}
          autoSaveEnabled={autoSaveEnabled}
          syncStatus={{
            isSync: !storeIsModified,
            lastSyncTime: lastSaveTime,
          }}
        />
      </div>
    </ErrorBoundaryWrapper>
  );
}
