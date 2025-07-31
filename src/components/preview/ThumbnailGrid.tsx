// ABOUTME: 投影片縮圖網格組件
// ABOUTME: 顯示投影片縮圖列表，支援點擊導航和視覺狀態指示

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { ThumbnailGridProps, DEFAULT_THUMBNAIL_SIZE } from '@/types/slidePreview';

export function ThumbnailGrid({
  thumbnails,
  currentSlide,
  onThumbnailClick,
  thumbnailSize = DEFAULT_THUMBNAIL_SIZE,
  itemsPerRow = 1,
  showSlideNumbers = true,
  className,
}: ThumbnailGridProps) {
  if (thumbnails.length === 0) {
    return (
      <div className={cn('flex items-center justify-center p-4', className)}>
        <p className="text-sm text-muted-foreground">沒有縮圖</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      {thumbnails.map((thumbnail) => (
        <div
          key={thumbnail.index}
          className={cn(
            'relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all duration-200',
            thumbnail.isActive
              ? 'border-primary ring-2 ring-primary/20 shadow-md'
              : 'border-border hover:border-primary/50 hover:shadow-sm'
          )}
          onClick={() => onThumbnailClick(thumbnail.index)}
          title={thumbnail.title || `投影片 ${thumbnail.index + 1}`}
        >
          {/* 縮圖內容 */}
          <div
            className="bg-white"
            style={{
              width: thumbnailSize.width,
              height: thumbnailSize.height,
            }}
            dangerouslySetInnerHTML={{
              __html: thumbnail.html,
            }}
          />

          {/* 活躍狀態指示器 */}
          {thumbnail.isActive && (
            <div className="absolute inset-0 bg-primary/10 pointer-events-none" />
          )}

          {/* 投影片編號（如果啟用且沒有在縮圖 HTML 中顯示） */}
          {showSlideNumbers && !thumbnail.html.includes('position: absolute') && (
            <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
              {thumbnail.index + 1}
            </div>
          )}

          {/* 投影片標題（如果有） */}
          {thumbnail.title && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-2">
              <p className="text-white text-xs truncate">
                {thumbnail.title}
              </p>
            </div>
          )}

          {/* 選中指示器 */}
          {thumbnail.isActive && (
            <div className="absolute top-1 left-1 w-2 h-2 bg-primary rounded-full" />
          )}
        </div>
      ))}
    </div>
  );
}