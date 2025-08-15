// ABOUTME: Marp 渲染 Hook，封裝投影片渲染邏輯和狀態管理
// ABOUTME: 提供 debounced 渲染、錯誤處理和載入狀態控制

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { getMarpEngine } from '@/lib/marp';
import { useDebounce } from '@/hooks/useDebounce';
import {
  MarpRenderResult,
  MarpError,
  MarpRenderOptions,
  MarpRenderStatus,
} from '@/types/marp';

export interface UseMarpRendererOptions {
  /** 渲染延遲時間 (ms) */
  debounceDelay?: number;
  /** 是否自動渲染 */
  autoRender?: boolean;
  /** 預設渲染選項 */
  defaultRenderOptions?: Partial<MarpRenderOptions>;
  /** 錯誤回調 */
  onError?: (error: MarpError) => void;
  /** 渲染完成回調 */
  onRenderComplete?: (result: MarpRenderResult) => void;
  /** 渲染開始回調 */
  onRenderStart?: () => void;
}

export interface UseMarpRendererReturn {
  /** 渲染結果 */
  result: MarpRenderResult | null;
  /** 渲染狀態 */
  status: MarpRenderStatus;
  /** 手動觸發渲染 */
  render: (markdown: string, options?: Partial<MarpRenderOptions>) => Promise<void>;
  /** 清除結果 */
  clear: () => void;
  /** 重試上次渲染 */
  retry: () => Promise<void>;
  /** 驗證 Markdown */
  validate: (markdown: string) => { isValid: boolean; errors: MarpError[] };
}

export function useMarpRenderer(
  initialMarkdown?: string,
  options: UseMarpRendererOptions = {}
): UseMarpRendererReturn {
  const {
    debounceDelay = 300,
    autoRender = true,
    defaultRenderOptions,
    onError,
    onRenderComplete,
    onRenderStart,
  } = options;

  // 狀態管理
  const [result, setResult] = useState<MarpRenderResult | null>(null);
  const [status, setStatus] = useState<MarpRenderStatus>({
    state: 'idle',
    isRendering: false,
    error: null,
    lastRenderTime: null,
    renderCount: 0,
  });

  // 追蹤上次渲染的參數以供重試使用
  const lastRenderParams = useRef<{
    markdown: string;
    options?: Partial<MarpRenderOptions>;
  } | null>(null);

  // Marp 引擎實例（記憶化）
  const marpEngine = useMemo(() => getMarpEngine(), []);

  // 渲染函數
  const performRender = useCallback(async (
    markdown: string,
    renderOptions?: Partial<MarpRenderOptions>
  ): Promise<void> => {
    try {
      // 更新狀態為渲染中
      setStatus(prev => ({
        ...prev,
        state: 'rendering',
        isRendering: true,
        error: null,
      }));

      // 觸發渲染開始回調
      onRenderStart?.();

      // 記錄渲染參數
      lastRenderParams.current = { 
        markdown,
        ...(renderOptions && { options: renderOptions })
      };

      // 合併渲染選項
      const finalOptions = { ...defaultRenderOptions, ...renderOptions };

      // 執行渲染
      const renderResult = await marpEngine.render(markdown, finalOptions);

      // 更新結果和狀態
      setResult(renderResult);
      setStatus(prev => ({
        ...prev,
        state: 'success',
        isRendering: false,
        lastRenderTime: Date.now(),
        renderCount: prev.renderCount + 1,
      }));

      // 觸發完成回調
      onRenderComplete?.(renderResult);

    } catch (error) {
      const marpError = error as MarpError;
      
      // 更新錯誤狀態
      setStatus(prev => ({
        ...prev,
        state: 'error',
        isRendering: false,
        error: marpError,
        renderCount: prev.renderCount + 1,
      }));

      // 觸發錯誤回調
      onError?.(marpError);

      console.error('Marp 渲染失敗:', marpError);
    }
  }, [marpEngine, defaultRenderOptions, onError, onRenderComplete, onRenderStart]);

  // 使用 debounce 包裝渲染函數
  const { debouncedCallback: debouncedRender } = useDebounce(performRender, debounceDelay);

  // 公開的渲染函數
  const render = useCallback(async (
    markdown: string,
    renderOptions?: Partial<MarpRenderOptions>
  ): Promise<void> => {
    if (!markdown || !markdown.trim()) {
      setResult(null);
      setStatus(prev => ({
        ...prev,
        state: 'idle',
        isRendering: false,
        error: null,
      }));
      return;
    }

    await debouncedRender(markdown, renderOptions);
  }, [debouncedRender]);

  // 清除結果
  const clear = useCallback(() => {
    setResult(null);
    setStatus({
      state: 'idle',
      isRendering: false,
      error: null,
      lastRenderTime: null,
      renderCount: 0,
    });
    lastRenderParams.current = null;
  }, []);

  // 重試上次渲染
  const retry = useCallback(async (): Promise<void> => {
    if (!lastRenderParams.current) {
      console.warn('沒有上次渲染的參數可以重試');
      return;
    }

    const { markdown, options } = lastRenderParams.current;
    await performRender(markdown, options);
  }, [performRender]);

  // 驗證 Markdown
  const validate = useCallback((markdown: string) => {
    return marpEngine.validateMarkdown(markdown);
  }, [marpEngine]);

  // 初始渲染
  useEffect(() => {
    if (autoRender && initialMarkdown && initialMarkdown.trim()) {
      render(initialMarkdown);
    }
  }, [autoRender, initialMarkdown, render]);

  return {
    result,
    status,
    render,
    clear,
    retry,
    validate,
  };
}


