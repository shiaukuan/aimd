// ABOUTME: Markdown 編輯器組件，支援行號顯示和捲軸同步
// ABOUTME: 提供基本的 Markdown 編輯功能，包含縮排和鍵盤操作

'use client';

import React, {
  useRef,
  useCallback,
  useEffect,
  useState,
  useMemo,
} from 'react';
import { cn } from '@/lib/utils';

export interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  className?: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onSelect?: () => void;
  style?: React.CSSProperties;
  'data-testid'?: string;
}

export const MarkdownEditor = React.forwardRef<
  HTMLTextAreaElement,
  MarkdownEditorProps
>(function MarkdownEditor(
  {
    value,
    onChange,
    placeholder = '在這裡輸入你的 Markdown 內容...',
    readOnly = false,
    className,
    onKeyDown,
    onSelect,
    style,
    'data-testid': testId = 'markdown-editor',
  },
  forwardedRef
) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 合併內部 ref 和外部 ref
  const mergedRef = useCallback(
    (node: HTMLTextAreaElement | null) => {
      textareaRef.current = node;
      if (typeof forwardedRef === 'function') {
        forwardedRef(node);
      } else if (forwardedRef) {
        forwardedRef.current = node;
      }
    },
    [forwardedRef]
  );
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [, setIsComposing] = useState(false);

  // 處理輸入變更
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      onChange(newValue);
    },
    [onChange]
  );

  // 處理輸入法組合事件
  const handleCompositionStart = useCallback(() => {
    setIsComposing(true);
  }, []);

  const handleCompositionEnd = useCallback(() => {
    setIsComposing(false);
  }, []);

  // 同步捲軸位置
  const syncScroll = useCallback(() => {
    const textarea = textareaRef.current;
    const lineNumbers = lineNumbersRef.current;

    if (!textarea || !lineNumbers) return;

    lineNumbers.scrollTop = textarea.scrollTop;
  }, []);

  // 處理 Tab 鍵縮排
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Tab') {
        e.preventDefault();

        const textarea = e.currentTarget;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;

        if (e.shiftKey) {
          // Shift+Tab: 移除縮排
          const lines = value.split('\n');
          const startLine = value.substring(0, start).split('\n').length - 1;
          const endLine = value.substring(0, end).split('\n').length - 1;

          const newLines = lines.map((line, index) => {
            if (
              index >= startLine &&
              index <= endLine &&
              line.startsWith('  ')
            ) {
              return line.substring(2);
            }
            return line;
          });

          const newValue = newLines.join('\n');
          const lengthDiff = value.length - newValue.length;
          onChange(newValue);

          // 恢復選取範圍
          setTimeout(() => {
            textarea.setSelectionRange(
              Math.max(0, start - 2),
              Math.max(0, end - lengthDiff)
            );
          }, 0);
        } else {
          // Tab: 添加縮排
          const newValue =
            value.substring(0, start) + '  ' + value.substring(end);
          onChange(newValue);

          // 恢復選取範圍
          setTimeout(() => {
            textarea.setSelectionRange(start + 2, start + 2);
          }, 0);
        }
      }

      // 呼叫外部 keyDown 處理器
      onKeyDown?.(e);
    },
    [value, onChange, onKeyDown]
  );

  // 生成行號
  const lineNumbers = useMemo(() => {
    const lines = value.split('\n');
    return lines.map((_, index) => (
      <div
        key={index}
        className="text-right pr-3 text-muted-foreground select-none"
      >
        {index + 1}
      </div>
    ));
  }, [value]);

  // 設置捲軸同步監聽器
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.addEventListener('scroll', syncScroll);
    return () => textarea.removeEventListener('scroll', syncScroll);
  }, [syncScroll]);

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative flex overflow-hidden bg-background border rounded-lg',
        className
      )}
      data-testid={testId}
    >
      {/* 行號 */}
      <div
        ref={lineNumbersRef}
        className="flex flex-col py-4 text-sm font-mono leading-relaxed bg-muted/30 border-r overflow-hidden"
        style={{
          minWidth: '4rem',
          maxHeight: '100%',
        }}
        data-testid="line-numbers"
      >
        {lineNumbers}
      </div>

      {/* 編輯器容器 */}
      <div className="relative flex-1">
        {/* 文字輸入區 */}
        <textarea
          ref={mergedRef}
          value={value}
          onChange={handleChange}
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
          onKeyDown={handleKeyDown}
          onSelect={onSelect}
          onScroll={syncScroll}
          placeholder={placeholder}
          readOnly={readOnly}
          className={cn(
            'w-full h-full p-4 resize-none border-0 bg-transparent',
            'focus:outline-none focus:ring-0',
            'font-mono text-sm leading-relaxed',
            'text-foreground',
            'selection:bg-primary/20'
          )}
          style={{
            ...style,
            tabSize: 2,
            MozTabSize: 2,
          }}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          data-testid="editor-textarea"
        />
      </div>
    </div>
  );
});
