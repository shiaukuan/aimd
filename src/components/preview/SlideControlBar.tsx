// ABOUTME: 投影片控制列組件
// ABOUTME: 提供導航、縮放、縮圖切換和全螢幕等控制功能

'use client';

import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  SkipBack,
  SkipForward,
  Maximize2,
  Minimize2,
  Grid3X3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { SlideControlBarProps } from '@/types/slidePreview';

export function SlideControlBar({
  navigation,
  slideInfo,
  showThumbnailToggle = true,
  thumbnailsVisible = true,
  onThumbnailToggle,
  onFullscreenToggle,
  isFullscreen = false,
  className,
}: SlideControlBarProps) {
  return (
    <div className={cn('flex items-center justify-between p-2 bg-background', className)}>
      {/* 左側：導航控制 */}
      <div className="flex items-center space-x-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={navigation.goToFirst}
          disabled={!navigation.canGoPrevious}
          title="第一張投影片 (Home)"
        >
          <SkipBack className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={navigation.goToPrevious}
          disabled={!navigation.canGoPrevious}
          title="上一張投影片 (←)"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div className="mx-2 px-3 py-1 bg-muted rounded text-sm font-medium min-w-[80px] text-center">
          {slideInfo.current + 1} / {slideInfo.total}
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={navigation.goToNext}
          disabled={!navigation.canGoNext}
          title="下一張投影片 (→)"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={navigation.goToLast}
          disabled={!navigation.canGoNext}
          title="最後一張投影片 (End)"
        >
          <SkipForward className="h-4 w-4" />
        </Button>
      </div>


      {/* 右側：視圖控制 */}
      <div className="flex items-center space-x-1">
        {showThumbnailToggle && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onThumbnailToggle}
            title="切換縮圖面板 (T)"
            className={cn(thumbnailsVisible && 'bg-muted')}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
        )}
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onFullscreenToggle}
          title={isFullscreen ? '退出全螢幕 (F11)' : '全螢幕 (F11)'}
        >
          {isFullscreen ? (
            <Minimize2 className="h-4 w-4" />
          ) : (
            <Maximize2 className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}