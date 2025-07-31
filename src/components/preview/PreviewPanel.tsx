// ABOUTME: 投影片預覽組件，整合 Marp Core 將 Markdown 渲染為投影片
// ABOUTME: 支援即時同步、導航控制和錯誤處理，現在使用新的 SlidePreview 組件

'use client';

import React, { useEffect, useState, useRef, useMemo } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ErrorBoundaryWrapper } from '@/components/ui/ErrorBoundary';
import { useEditorStore } from '@/store/editorStore';
import { useMarpRenderer } from '@/hooks/useMarpRenderer';
import { MarpRenderOptions } from '@/types/marp';
import SlidePreview from './SlidePreview';

interface PreviewPanelProps {
  className?: string;
  /** 是否啟用同步 */
  enableSync?: boolean;
  /** 同步延遲時間 */
  syncDelay?: number;
  /** 自訂 Marp 主題 */
  theme?: string;
  /** 渲染選項 */
  renderOptions?: Partial<MarpRenderOptions>;
  /** 錯誤回調 */
  onError?: (error: Error) => void;
  /** 渲染完成回調 */
  onRenderComplete?: (slideCount: number) => void;
}

export default function PreviewPanel({
  className = '',
  enableSync = true,
  syncDelay = 300,
  theme = 'default',
  renderOptions,
  onError,
  onRenderComplete,
}: PreviewPanelProps) {
  const { content } = useEditorStore();
  
  // 使用 Marp 渲染 Hook
  const {
    result: renderResult,
    status,
    render,
    retry,
  } = useMarpRenderer(undefined, {
    debounceDelay: syncDelay,
    autoRender: false,
    defaultRenderOptions: {
      html: true,
      theme,
      ...renderOptions,
    },
    onError: (error) => {
      console.error('Marp 渲染錯誤:', error);
      onError?.(new Error(error.message));
    },
    onRenderComplete: (result) => {
      onRenderComplete?.(result.slideCount);
    },
  });

  // 監聽內容變化並觸發同步渲染
  useEffect(() => {
    if (enableSync && content && content.trim()) {
      render(content);
    }
  }, [content, enableSync, render]);

  // 渲染錯誤狀態
  if (status.error) {
    return (
      <div className={`flex flex-col h-full ${className}`} data-testid="preview">
        {/* 標題列 */}
        <div className="flex items-center justify-between p-3 border-b bg-background">
          <h2 className="text-lg font-semibold">預覽</h2>
        </div>
        <div className="flex items-center justify-center flex-1">
          <div className="text-center space-y-4 p-8">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto" />
            <h3 className="text-lg font-semibold text-red-700 dark:text-red-400">
              渲染錯誤
            </h3>
            <p className="text-sm text-muted-foreground max-w-md">
              {status.error.message}
              {status.error.details && (
                <span className="block mt-2 text-xs">
                  {status.error.details}
                </span>
              )}
            </p>
            <Button 
              onClick={retry}
              size="sm"
            >
              重試
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // 渲染載入狀態
  if (status.isRendering) {
    return (
      <div className={`flex flex-col h-full ${className}`} data-testid="preview">
        {/* 標題列 */}
        <div className="flex items-center justify-between p-3 border-b bg-background">
          <h2 className="text-lg font-semibold">預覽</h2>
        </div>
        <div className="flex items-center justify-center flex-1">
          <div className="text-center space-y-4">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
            <p className="text-sm text-muted-foreground">正在渲染投影片...</p>
          </div>
        </div>
      </div>
    );
  }

  // 渲染空狀態
  if (!renderResult || !content.trim()) {
    return (
      <div className={`flex flex-col h-full ${className}`} data-testid="preview">
        {/* 標題列 */}
        <div className="flex items-center justify-between p-3 border-b bg-background">
          <h2 className="text-lg font-semibold">預覽</h2>
        </div>
        <div className="flex items-center justify-center flex-1">
          <div className="text-center space-y-4 p-8">
            <div className="text-6xl">📝</div>
            <h3 className="text-lg font-semibold text-muted-foreground">
              開始寫 Markdown
            </h3>
            <p className="text-sm text-muted-foreground max-w-md">
              在左側編輯器中輸入 Markdown 內容，這裡會即時顯示投影片預覽
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundaryWrapper
      title="預覽區域錯誤"
      description="投影片預覽遇到錯誤，請嘗試重新載入"
    >
      <div className={`h-full flex flex-col ${className}`} data-testid="preview">
        {/* 標題列 */}
        <div className="flex items-center justify-between p-3 border-b bg-background">
          <h2 className="text-lg font-semibold">預覽</h2>
        </div>

        {/* 使用新的 SlidePreview 組件 */}
        <div className="flex-1">
          <SlidePreview
            renderResult={renderResult}
            enableKeyboardShortcuts={true}
            showThumbnails={true}
            initialZoom={0.5}
            onSlideChange={(index) => {
              // 可以在這裡處理投影片變更的額外邏輯
              console.log('投影片變更到:', index);
            }}
            onZoomChange={(level) => {
              console.log('縮放級別變更到:', level);
            }}
            onFullscreenToggle={(isFullscreen) => {
              console.log('全螢幕狀態:', isFullscreen);
            }}
          />
        </div>
      </div>
    </ErrorBoundaryWrapper>
  );
}