// ABOUTME: Markdown 語法高亮 Hook，使用 highlight.js 處理即時語法著色
// ABOUTME: 提供防抖機制和效能最佳化，確保流暢的編輯體驗

'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import hljs from 'highlight.js/lib/core';
import markdown from 'highlight.js/lib/languages/markdown';

// 註冊 Markdown 語言支援
hljs.registerLanguage('markdown', markdown);

const DEBOUNCE_DELAY = 150; // 防抖延遲時間（毫秒）

export function useMarkdownHighlight(initialContent: string = '') {
  const [highlightedCode, setHighlightedCode] = useState('');
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastContentRef = useRef(initialContent);

  // 高亮處理函數
  const highlightMarkdown = useCallback((content: string): string => {
    if (!content.trim()) {
      return '';
    }

    try {
      // 使用 highlight.js 處理 Markdown
      const result = hljs.highlight(content, { language: 'markdown' });
      return result.value;
    } catch (error) {
      console.warn('Markdown highlighting failed:', error);
      // 如果高亮失敗，返回轉義的純文字
      return escapeHtml(content);
    }
  }, []);

  // HTML 轉義函數
  const escapeHtml = useCallback((text: string): string => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }, []);

  // 防抖更新高亮
  const updateHighlight = useCallback((content: string) => {
    // 如果內容沒有變化，跳過更新
    if (content === lastContentRef.current) {
      return;
    }

    lastContentRef.current = content;

    // 清除之前的計時器
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // 設置新的防抖計時器
    debounceTimerRef.current = setTimeout(() => {
      const highlighted = highlightMarkdown(content);
      setHighlightedCode(highlighted);
    }, DEBOUNCE_DELAY);
  }, [highlightMarkdown]);

  // 立即更新高亮（用於初始化或需要即時更新的情況）
  const updateHighlightImmediately = useCallback((content: string) => {
    lastContentRef.current = content;
    
    // 清除防抖計時器
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    const highlighted = highlightMarkdown(content);
    setHighlightedCode(highlighted);
  }, [highlightMarkdown]);

  // 初始化高亮
  useEffect(() => {
    updateHighlightImmediately(initialContent);
  }, [initialContent, updateHighlightImmediately]);

  // 清理計時器
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return {
    highlightedCode,
    updateHighlight,
    updateHighlightImmediately
  };
}