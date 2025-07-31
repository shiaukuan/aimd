// ABOUTME: 主要的投影片預覽組件
// ABOUTME: 整合縮圖面板、投影片檢視器和控制列，提供完整的投影片預覽功能

'use client';

import React, { useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { SlidePreviewProps } from '@/types/slidePreview';
import { useSlideControls } from '@/hooks/useSlideControls';
import { useSlideThumbnails } from '@/hooks/useSlideThumbnails';
import { ThumbnailGrid } from './ThumbnailGrid';
import { SlideViewer } from './SlideViewer';
import { SlideControlBar } from './SlideControlBar';

export default function SlidePreview({
  renderResult,
  className,
  initialSlide = 0,
  initialZoom = 1,
  showThumbnails = true,
  thumbnailPanelWidth = 200,
  onSlideChange,
  onZoomChange,
  onFullscreenToggle,
  onThumbnailToggle,
  enableKeyboardShortcuts = true,
}: SlidePreviewProps) {
  // 計算總投影片數
  const totalSlides = useMemo(() => {
    return renderResult?.slides?.length || 0;
  }, [renderResult]);

  // 使用投影片控制 Hook
  const {
    state,
    navigation,
    zoom,
    toggleThumbnails,
    toggleFullscreen,
    setThumbnailPanelWidth,
  } = useSlideControls({
    totalSlides,
    initialSlide,
    initialZoom,
    enableKeyboardShortcuts,
    onSlideChange,
    onZoomChange,
    onFullscreenToggle,
  });

  // 使用縮圖生成 Hook
  const { thumbnails } = useSlideThumbnails(renderResult, state.currentSlide);

  // 處理縮圖點擊
  const handleThumbnailClick = useCallback(
    (index: number) => {
      navigation.goToSlide(index);
    },
    [navigation]
  );

  // 處理縮圖面板切換
  const handleThumbnailToggle = useCallback(() => {
    toggleThumbnails();
    onThumbnailToggle?.(state.showThumbnails);
  }, [toggleThumbnails, onThumbnailToggle, state.showThumbnails]);

  // 處理全螢幕切換
  const handleFullscreenToggle = useCallback(() => {
    toggleFullscreen();
  }, [toggleFullscreen]);

  // 獲取當前投影片的內容
  const currentSlideContent = useMemo(() => {
    if (!renderResult?.slides || state.currentSlide >= renderResult.slides.length) {
      return null;
    }
    return renderResult.slides[state.currentSlide];
  }, [renderResult, state.currentSlide]);

  // 如果沒有渲染結果，顯示空狀態
  if (!renderResult || totalSlides === 0) {
    return (
      <div className={cn('flex items-center justify-center h-full', className)}>
        <div className="text-center space-y-4 p-8">
          <div className="text-6xl">📝</div>
          <h3 className="text-lg font-semibold text-muted-foreground">
            沒有投影片內容
          </h3>
          <p className="text-sm text-muted-foreground max-w-md">
            請在編輯器中輸入 Markdown 內容來生成投影片
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex h-full bg-background',
        state.isFullscreen && 'fixed inset-0 z-50 bg-black',
        className
      )}
    >
      {/* 縮圖面板 */}
      {state.showThumbnails && (
        <div
          className="border-r bg-muted/30 flex-shrink-0 flex flex-col"
          style={{ width: state.thumbnailPanelWidth }}
        >
          <div className="p-3 border-b bg-background">
            <h3 className="text-sm font-medium">投影片</h3>
            <p className="text-xs text-muted-foreground">
              {totalSlides} 張投影片
            </p>
          </div>
          
          <div className="flex-1 overflow-auto">
            <ThumbnailGrid
              thumbnails={thumbnails}
              currentSlide={state.currentSlide}
              onThumbnailClick={handleThumbnailClick}
              className="p-2"
            />
          </div>
        </div>
      )}

      {/* 主預覽區域 */}
      <div className="flex-1 flex flex-col">
        {/* 控制列 */}
        <SlideControlBar
          navigation={navigation}
          zoom={zoom}
          slideInfo={{
            current: state.currentSlide,
            total: totalSlides,
          }}
          showThumbnailToggle={true}
          thumbnailsVisible={state.showThumbnails}
          onThumbnailToggle={handleThumbnailToggle}
          onFullscreenToggle={handleFullscreenToggle}
          isFullscreen={state.isFullscreen}
          className="border-b"
        />

        {/* 投影片檢視器 */}
        <div className="flex-1 overflow-hidden">
          {currentSlideContent && (
            <SlideViewer
              slideHtml={currentSlideContent.content}
              slideCss={renderResult.css}
              zoomLevel={state.zoomLevel}
              centered={true}
              className="h-full"
            />
          )}
        </div>

        {/* 投影片指示器（多張投影片時顯示） */}
        {totalSlides > 1 && !state.isFullscreen && (
          <div className="flex justify-center p-3 bg-background border-t">
            <div className="flex space-x-1">
              {Array.from({ length: totalSlides }, (_, i) => (
                <button
                  key={i}
                  onClick={() => navigation.goToSlide(i)}
                  className={cn(
                    'w-2 h-2 rounded-full transition-colors',
                    i === state.currentSlide
                      ? 'bg-primary'
                      : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                  )}
                  title={`投影片 ${i + 1}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}