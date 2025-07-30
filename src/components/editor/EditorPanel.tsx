// ABOUTME: 編輯器面板主組件，整合工具列、編輯區域和狀態列
// ABOUTME: 管理編輯器狀態、統計計算、格式化操作等核心功能

'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { EditorPanelProps, EditorStats, EditorAction } from '@/types/editor';
import { EditorToolbar } from './EditorToolbar';
import { EditorStatusBar } from './EditorStatusBar';
import { MarkdownEditor } from './MarkdownEditor';

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
  content: initialContent = '',
  placeholder = '在這裡輸入你的 Markdown 內容...',
  readOnly = false,
  className,
  settings,
  callbacks,
}: EditorPanelProps) {
  const [content, setContent] = useState(initialContent);
  const [stats, setStats] = useState<EditorStats>(DEFAULT_STATS);
  const [isModified, setIsModified] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [activeFormats, setActiveFormats] = useState<EditorAction[]>([]);

  const markdownEditorRef = useRef<HTMLTextAreaElement>(null);

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
      const cursorColumn =
        linesBeforeCursor[linesBeforeCursor.length - 1].length + 1;

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
      content,
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
  }, [content, calculateStats, callbacks]);

  // 處理內容變更
  const handleContentChange = useCallback(
    (newContent: string) => {
      setContent(newContent);
      setIsModified(true);

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
    },
    [calculateStats, callbacks]
  );

  // 處理工具列動作
  const handleToolbarAction = useCallback(
    (action: EditorAction, data?: any) => {
      const textarea = markdownEditorRef.current;
      if (!textarea) return;
      const { selectionStart, selectionEnd } = textarea;
      const selectedText = content.slice(selectionStart, selectionEnd);

      let newContent = content;
      let newSelectionStart = selectionStart;
      let newSelectionEnd = selectionEnd;

      switch (action) {
        case 'bold':
          const boldText = selectedText || '粗體文字';
          newContent =
            content.slice(0, selectionStart) +
            `**${boldText}**` +
            content.slice(selectionEnd);
          newSelectionStart = selectionStart + 2;
          newSelectionEnd = newSelectionStart + boldText.length;
          break;

        case 'italic':
          const italicText = selectedText || '斜體文字';
          newContent =
            content.slice(0, selectionStart) +
            `*${italicText}*` +
            content.slice(selectionEnd);
          newSelectionStart = selectionStart + 1;
          newSelectionEnd = newSelectionStart + italicText.length;
          break;

        case 'code':
          const codeText = selectedText || '程式碼';
          newContent =
            content.slice(0, selectionStart) +
            `\`${codeText}\`` +
            content.slice(selectionEnd);
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
            content.slice(0, selectionStart) +
            headingPrefix +
            headingText +
            content.slice(selectionEnd);
          newSelectionStart = selectionStart + headingPrefix.length;
          newSelectionEnd = newSelectionStart + headingText.length;
          break;

        case 'bulletList':
          const bulletText = selectedText || '清單項目';
          newContent =
            content.slice(0, selectionStart) +
            `- ${bulletText}` +
            content.slice(selectionEnd);
          newSelectionStart = selectionStart + 2;
          newSelectionEnd = newSelectionStart + bulletText.length;
          break;

        case 'numberedList':
          const numberedText = selectedText || '清單項目';
          newContent =
            content.slice(0, selectionStart) +
            `1. ${numberedText}` +
            content.slice(selectionEnd);
          newSelectionStart = selectionStart + 3;
          newSelectionEnd = newSelectionStart + numberedText.length;
          break;

        case 'link':
          const linkText = selectedText || '連結文字';
          const linkMarkdown = `[${linkText}](url)`;
          newContent =
            content.slice(0, selectionStart) +
            linkMarkdown +
            content.slice(selectionEnd);
          newSelectionStart = selectionStart + linkText.length + 3;
          newSelectionEnd = newSelectionStart + 3; // 選中 "url"
          break;

        case 'image':
          const altText = selectedText || '圖片描述';
          const imageMarkdown = `![${altText}](image-url)`;
          newContent =
            content.slice(0, selectionStart) +
            imageMarkdown +
            content.slice(selectionEnd);
          newSelectionStart = selectionStart + altText.length + 4;
          newSelectionEnd = newSelectionStart + 9; // 選中 "image-url"
          break;

        case 'codeBlock':
          const codeBlockText = selectedText || '程式碼';
          const codeBlock = `\`\`\`\n${codeBlockText}\n\`\`\``;
          newContent =
            content.slice(0, selectionStart) +
            codeBlock +
            content.slice(selectionEnd);
          newSelectionStart = selectionStart + 4;
          newSelectionEnd = newSelectionStart + codeBlockText.length;
          break;

        case 'save':
          setLastSaved(new Date());
          setIsModified(false);
          callbacks?.onSave?.(content);
          break;

        case 'export':
          callbacks?.onExport?.(content, 'pptx');
          break;

        case 'new':
          if (confirm('確定要新建文件嗎？未儲存的變更將會丟失。')) {
            setContent('');
            setIsModified(false);
            setLastSaved(null);
          }
          break;

        default:
          // 其他動作交給回調函數處理
          callbacks?.onAction?.(action, data);
          return;
      }

      // 更新內容
      if (newContent !== content) {
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
    [content, callbacks, handleContentChange]
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

  // 初始化和清理
  useEffect(() => {
    updateStats();
  }, [updateStats]);

  // 監聽內容變化
  useEffect(() => {
    setContent(initialContent);
    setIsModified(false);
  }, [initialContent]);

  return (
    <div
      className={cn(
        'flex flex-col h-full bg-background border rounded-lg overflow-hidden',
        className
      )}
      data-testid="editor-panel"
    >
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
          value={content}
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
        isModified={isModified}
        lastSaved={lastSaved}
        showDetailedStats={true}
      />
    </div>
  );
}
