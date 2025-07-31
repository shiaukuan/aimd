// ABOUTME: useMarpRenderer Hook 的單元測試
// ABOUTME: 測試渲染狀態管理、錯誤處理和回調功能

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useMarpRenderer, useSimpleMarpRenderer } from './useMarpRenderer';
import { MarpError } from '@/types/marp';

// Mock Marp 引擎
vi.mock('@/lib/marp', () => ({
  getMarpEngine: vi.fn(() => ({
    render: vi.fn().mockResolvedValue({
      html: '<section><h1>Test</h1></section>',
      css: 'section { background: white; }',
      slideCount: 1,
      slides: [{ content: '<h1>Test</h1>', title: 'Test' }],
      comments: [],
      timestamp: Date.now(),
    }),
    validateMarkdown: vi.fn().mockReturnValue({
      isValid: true,
      errors: [],
    }),
  })),
}));

// Mock useDebounce
vi.mock('./useDebounce', () => ({
  useDebounce: vi.fn((callback, delay) => ({
    debouncedCallback: callback,
    cancel: vi.fn(),
    flush: vi.fn(),
  })),
}));

describe('useMarpRenderer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('基本功能', () => {
    it('應正確初始化狀態', () => {
      const { result } = renderHook(() => useMarpRenderer());

      expect(result.current.result).toBeNull();
      expect(result.current.status.state).toBe('idle');
      expect(result.current.status.isRendering).toBe(false);
      expect(result.current.status.error).toBeNull();
      expect(result.current.status.renderCount).toBe(0);
    });

    it('應提供所有必要的方法', () => {
      const { result } = renderHook(() => useMarpRenderer());

      expect(typeof result.current.render).toBe('function');
      expect(typeof result.current.clear).toBe('function');
      expect(typeof result.current.retry).toBe('function');
      expect(typeof result.current.validate).toBe('function');
    });

    it('應能處理空的 Markdown', async () => {
      const { result } = renderHook(() => useMarpRenderer());

      await act(async () => {
        await result.current.render('');
      });

      expect(result.current.result).toBeNull();
      expect(result.current.status.state).toBe('idle');
    });

    it('應能處理只有空白字符的 Markdown', async () => {
      const { result } = renderHook(() => useMarpRenderer());

      await act(async () => {
        await result.current.render('   \n  \t  ');
      });

      expect(result.current.result).toBeNull();
      expect(result.current.status.state).toBe('idle');
    });
  });

  describe('渲染功能', () => {
    it('應能成功渲染 Markdown', async () => {
      const { result } = renderHook(() => useMarpRenderer());

      await act(async () => {
        await result.current.render('# 測試標題');
      });

      await waitFor(() => {
        expect(result.current.status.state).toBe('success');
      });

      expect(result.current.result).toBeDefined();
      expect(result.current.result?.html).toContain('<section>');
      expect(result.current.result?.slideCount).toBe(1);
      expect(result.current.status.renderCount).toBe(1);
      expect(result.current.status.isRendering).toBe(false);
    });

    it('應在渲染過程中正確設定載入狀態', async () => {
      const { result } = renderHook(() => useMarpRenderer());

      // 讓 render 函數延遲執行
      const mockEngine = {
        render: vi.fn(() => new Promise(resolve => setTimeout(resolve, 100))),
        validateMarkdown: vi
          .fn()
          .mockReturnValue({ isValid: true, errors: [] }),
      };

      const { getMarpEngine } = await import('@/lib/marp');
      vi.mocked(getMarpEngine).mockReturnValue(mockEngine as any);

      act(() => {
        void result.current.render('# 測試');
      });

      // 應該進入載入狀態
      expect(result.current.status.isRendering).toBe(true);
      expect(result.current.status.state).toBe('rendering');
    });

    it('應能處理渲染選項', async () => {
      const mockEngine = {
        render: vi.fn().mockResolvedValue({
          html: '<section><h1>Test</h1></section>',
          css: 'section { background: white; }',
          slideCount: 1,
          slides: [],
          comments: [],
          timestamp: Date.now(),
        }),
        validateMarkdown: vi
          .fn()
          .mockReturnValue({ isValid: true, errors: [] }),
      };

      const { getMarpEngine } = await import('@/lib/marp');
      vi.mocked(getMarpEngine).mockReturnValue(mockEngine as any);

      const { result } = renderHook(() => useMarpRenderer());
      const renderOptions = { theme: 'gaia', html: false };

      await act(async () => {
        await result.current.render('# 測試', renderOptions);
      });

      expect(mockEngine.render).toHaveBeenCalledWith('# 測試', renderOptions);
    });
  });

  describe('回調功能', () => {
    it('應觸發渲染開始回調', async () => {
      const onRenderStart = vi.fn();
      const { result } = renderHook(() =>
        useMarpRenderer(undefined, { onRenderStart })
      );

      await act(async () => {
        await result.current.render('# 測試');
      });

      expect(onRenderStart).toHaveBeenCalled();
    });

    it('應觸發渲染完成回調', async () => {
      const onRenderComplete = vi.fn();
      const { result } = renderHook(() =>
        useMarpRenderer(undefined, { onRenderComplete })
      );

      await act(async () => {
        await result.current.render('# 測試');
      });

      await waitFor(() => {
        expect(onRenderComplete).toHaveBeenCalled();
      });
    });
  });

  describe('清除功能', () => {
    it('應清除結果並重置狀態', async () => {
      const { result } = renderHook(() => useMarpRenderer());

      // 先進行渲染
      await act(async () => {
        await result.current.render('# 測試');
      });

      expect(result.current.result).toBeDefined();

      // 清除
      act(() => {
        result.current.clear();
      });

      expect(result.current.result).toBeNull();
      expect(result.current.status.state).toBe('idle');
      expect(result.current.status.isRendering).toBe(false);
      expect(result.current.status.error).toBeNull();
      expect(result.current.status.renderCount).toBe(0);
    });
  });

  describe('初始渲染', () => {
    it('應在 autoRender 為 false 時不自動渲染', () => {
      const { result } = renderHook(() =>
        useMarpRenderer('# 初始內容', { autoRender: false })
      );

      expect(result.current.status.state).toBe('idle');
      expect(result.current.result).toBeNull();
    });
  });
});

describe('useSimpleMarpRenderer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('應提供簡化的介面', () => {
    const { result } = renderHook(() => useSimpleMarpRenderer());

    expect(typeof result.current.renderMarkdown).toBe('function');
    expect(typeof result.current.clearError).toBe('function');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('應能成功渲染', async () => {
    const { result } = renderHook(() => useSimpleMarpRenderer());

    let renderResult;
    await act(async () => {
      renderResult = await result.current.renderMarkdown('# 測試');
    });

    expect(renderResult).toBeDefined();
    expect(renderResult?.html).toContain('<section>');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('應處理空 Markdown', async () => {
    const { result } = renderHook(() => useSimpleMarpRenderer());

    let renderResult;
    await act(async () => {
      renderResult = await result.current.renderMarkdown('');
    });

    expect(renderResult).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it('應處理渲染錯誤', async () => {
    const { result } = renderHook(() => useSimpleMarpRenderer());
    const mockEngine = {
      render: vi.fn().mockRejectedValue(new Error('渲染失敗')),
    };

    const { getMarpEngine } = await import('@/lib/marp');
    vi.mocked(getMarpEngine).mockReturnValue(mockEngine as any);

    let renderResult;
    await act(async () => {
      renderResult = await result.current.renderMarkdown('# 測試');
    });

    expect(renderResult).toBeNull();
    expect(result.current.error).toBe('渲染失敗');
    expect(result.current.isLoading).toBe(false);
  });

  it('應能清除錯誤', async () => {
    const { result } = renderHook(() => useSimpleMarpRenderer());

    // 先產生錯誤
    const mockEngine = {
      render: vi.fn().mockRejectedValue(new Error('測試錯誤')),
    };

    const { getMarpEngine } = await import('@/lib/marp');
    vi.mocked(getMarpEngine).mockReturnValue(mockEngine as any);

    await act(async () => {
      await result.current.renderMarkdown('# 測試');
    });

    expect(result.current.error).toBe('測試錯誤');

    // 清除錯誤
    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
  });
});
