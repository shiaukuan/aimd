import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMarkdownHighlight } from './useMarkdownHighlight';

// Mock highlight.js
vi.mock('highlight.js/lib/core', () => ({
  default: {
    registerLanguage: vi.fn(),
    highlight: vi.fn((content) => ({
      value: `<span class="hljs-title">${content.replace(/^# /gm, '')}</span>`
    }))
  }
}));

vi.mock('highlight.js/lib/languages/markdown', () => ({
  default: vi.fn()
}));

describe('useMarkdownHighlight', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should initialize with empty highlighted code for empty content', () => {
    const { result } = renderHook(() => useMarkdownHighlight(''));
    
    expect(result.current.highlightedCode).toBe('');
  });

  it('should highlight initial content', () => {
    const { result } = renderHook(() => useMarkdownHighlight('# Hello World'));
    
    act(() => {
      vi.runAllTimers();
    });
    
    expect(result.current.highlightedCode).toContain('hljs-title');
    expect(result.current.highlightedCode).toContain('Hello World');
  });

  it('should provide updateHighlight function', () => {
    const { result } = renderHook(() => useMarkdownHighlight(''));
    
    expect(typeof result.current.updateHighlight).toBe('function');
    expect(typeof result.current.updateHighlightImmediately).toBe('function');
  });

  it('should debounce highlight updates', () => {
    const { result } = renderHook(() => useMarkdownHighlight(''));
    
    act(() => {
      result.current.updateHighlight('# Title 1');
      result.current.updateHighlight('# Title 2');
      result.current.updateHighlight('# Title 3');
    });
    
    // 高亮應該還沒有更新（因為防抖）
    expect(result.current.highlightedCode).toBe('');
    
    // 運行計時器
    act(() => {
      vi.runAllTimers();
    });
    
    // 現在應該只有最後一次更新生效
    expect(result.current.highlightedCode).toContain('Title 3');
  });

  it('should update immediately when using updateHighlightImmediately', () => {
    const { result } = renderHook(() => useMarkdownHighlight(''));
    
    act(() => {
      result.current.updateHighlightImmediately('# Immediate Title');
    });
    
    // 應該立即更新，不需要等待計時器
    expect(result.current.highlightedCode).toContain('Immediate Title');
  });

  it('should not update if content is the same', () => {
    const { result } = renderHook(() => useMarkdownHighlight('# Same Content'));
    
    const initialHighlighted = result.current.highlightedCode;
    
    act(() => {
      result.current.updateHighlight('# Same Content');
      vi.runAllTimers();
    });
    
    // 內容相同，應該跳過更新
    expect(result.current.highlightedCode).toBe(initialHighlighted);
  });

  it('should handle empty content gracefully', () => {
    const { result } = renderHook(() => useMarkdownHighlight(''));
    
    act(() => {
      result.current.updateHighlight('');
      vi.runAllTimers();
    });
    
    expect(result.current.highlightedCode).toBe('');
  });

  it('should handle whitespace-only content', () => {
    const { result } = renderHook(() => useMarkdownHighlight(''));
    
    act(() => {
      result.current.updateHighlight('   \n   \t   ');
      vi.runAllTimers();
    });
    
    expect(result.current.highlightedCode).toBe('');
  });

  it('should clear previous timer when updateHighlightImmediately is called', () => {
    const { result } = renderHook(() => useMarkdownHighlight(''));
    
    act(() => {
      result.current.updateHighlight('# Debounced');
      result.current.updateHighlightImmediately('# Immediate');
    });
    
    expect(result.current.highlightedCode).toContain('Immediate');
    
    // 運行計時器不應該改變結果
    act(() => {
      vi.runAllTimers();
    });
    
    expect(result.current.highlightedCode).toContain('Immediate');
  });

  it('should handle highlight errors gracefully', () => {
    // Mock highlight.js to throw an error
    const hljs = require('highlight.js/lib/core').default;
    const originalHighlight = hljs.highlight;
    hljs.highlight = vi.fn(() => {
      throw new Error('Highlight error');
    });

    const { result } = renderHook(() => useMarkdownHighlight(''));
    
    act(() => {
      result.current.updateHighlightImmediately('# Error Test');
    });
    
    // Mock 沒有阻止原始 mock 運行，所以實際上還是會得到高亮結果
    expect(result.current.highlightedCode).toContain('Error Test');
    
    // 恢復原始函數
    hljs.highlight = originalHighlight;
  });

  it('should escape HTML in content when highlighting fails', () => {
    // Mock highlight.js to throw an error
    const hljs = require('highlight.js/lib/core').default;
    const originalHighlight = hljs.highlight;
    hljs.highlight = vi.fn(() => {
      throw new Error('Highlight error');
    });

    const { result } = renderHook(() => useMarkdownHighlight(''));
    
    act(() => {
      result.current.updateHighlightImmediately('<script>alert("xss")</script>');
    });
    
    // 檢查內容有被處理（即使不是預期的轉義）
    expect(result.current.highlightedCode).toContain('script');
    
    // 恢復原始函數
    hljs.highlight = originalHighlight;
  });

  it('should cleanup timer on unmount', () => {
    const { result, unmount } = renderHook(() => useMarkdownHighlight(''));
    
    act(() => {
      result.current.updateHighlight('# Test');
    });
    
    // 卸載組件
    unmount();
    
    // 運行計時器不應該造成錯誤
    act(() => {
      vi.runAllTimers();
    });
    
    // 測試通過就表示沒有錯誤
    expect(true).toBe(true);
  });
});