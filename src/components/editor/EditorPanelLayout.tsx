// ABOUTME: 編輯器面板佈局組件，負責整體結構和 UI 佈局
// ABOUTME: 處理標題列、錯誤提示、警告信息等視覺元素

import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { ErrorBoundaryWrapper } from '@/components/ui/ErrorBoundary';
import { EditorToolbar } from './EditorToolbar';
import { EditorStatusBar } from './EditorStatusBar';
import { MarkdownEditor } from './MarkdownEditor';
import type { EditorAction, EditorStats, EditorCallbacks, EditorSettings } from '@/types/editor';

export interface EditorPanelLayoutProps {
  className?: string;
  headerActions?: ReactNode;
  readOnly?: boolean;
  
  // 狀態
  storeError: string | null;
  isLargeFile: boolean;
  storeIsModified: boolean;
  lastSaved: Date | null;
  autoSaveEnabled: boolean;
  lastSaveTime: number | null;
  stats: EditorStats;
  
  // 內容和設定
  localContent: string;
  placeholder?: string;
  settings?: Partial<EditorSettings>;
  
  // 方法
  clearError: () => void;
  handleContentChange: (content: string) => void;
  updateStats: () => void;
  handleToolbarAction: (action: EditorAction, data?: unknown) => Promise<void>;
  handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  
  // Ref
  markdownEditorRef: React.RefObject<HTMLTextAreaElement | null>;
  
  // 回調
  callbacks?: EditorCallbacks;
}

export function EditorPanelLayout({
  className,
  headerActions,
  readOnly = false,
  storeError,
  isLargeFile,
  storeIsModified,
  lastSaved,
  autoSaveEnabled,
  lastSaveTime,
  stats,
  localContent,
  placeholder = '在這裡輸入你的 Markdown 內容...',
  settings,
  clearError,
  handleContentChange,
  updateStats,
  handleToolbarAction,
  handleKeyDown,
  markdownEditorRef,
  callbacks,
}: EditorPanelLayoutProps) {
  return (
    <ErrorBoundaryWrapper
      title="編輯器錯誤"
      description="編輯器遇到錯誤，請嘗試重新載入"
      onError={error => {
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
        <div className="flex items-center justify-between p-3 border-b bg-gradient-to-r from-background via-background to-muted/20 backdrop-blur-sm">
          <h2 className="text-lg font-semibold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Markdown 編輯器
          </h2>
          {headerActions && (
            <div className="flex items-center gap-2">{headerActions}</div>
          )}
        </div>

        {/* 工具列 */}
        <EditorToolbar
          disabled={readOnly}
          onAction={handleToolbarAction}
          activeFormats={[]} // TODO: 實現 activeFormats 邏輯
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
              fontSize: settings?.fontSize
                ? `${settings.fontSize}px`
                : undefined,
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