// ABOUTME: 投影片檢視器組件
// ABOUTME: 顯示單一投影片內容，支援縮放和居中顯示

'use client';

import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { SlideViewerProps, DEFAULT_SLIDE_DIMENSIONS } from '@/types/slidePreview';

export function SlideViewer({
  slideHtml,
  slideCss,
  zoomLevel,
  slideSize = DEFAULT_SLIDE_DIMENSIONS,
  centered = true,
  className,
}: SlideViewerProps) {
  // 生成內聯樣式
  const inlineStyles = useMemo(() => {
    return `
      <style>
        ${slideCss}
        
        .slide-viewer-content {
          width: ${slideSize.width}px;
          height: ${slideSize.height}px;
          transform: scale(${zoomLevel});
          transform-origin: center center;
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 2rem;
          box-sizing: border-box;
        }
        
        .slide-viewer-content section {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }
        
        .slide-viewer-content h1,
        .slide-viewer-content h2,
        .slide-viewer-content h3,
        .slide-viewer-content h4,
        .slide-viewer-content h5,
        .slide-viewer-content h6 {
          margin: 0 0 1rem 0;
          text-align: center;
        }
        
        .slide-viewer-content p {
          margin: 0 0 1rem 0;
          text-align: center;
        }
        
        .slide-viewer-content ul,
        .slide-viewer-content ol {
          margin: 0 0 1rem 0;
          text-align: left;
          display: inline-block;
        }
        
        .slide-viewer-content img {
          max-width: 100%;
          height: auto;
          margin: 1rem 0;
        }
        
        .slide-viewer-content code {
          background: rgba(0, 0, 0, 0.1);
          padding: 0.2em 0.4em;
          border-radius: 3px;
          font-family: 'Courier New', monospace;
        }
        
        .slide-viewer-content pre {
          background: rgba(0, 0, 0, 0.05);
          padding: 1rem;
          border-radius: 6px;
          overflow-x: auto;
          margin: 1rem 0;
        }
        
        .slide-viewer-content blockquote {
          border-left: 4px solid #ddd;
          margin: 1rem 0;
          padding-left: 1rem;
          color: #666;
        }
      </style>
    `;
  }, [slideCss, slideSize, zoomLevel]);

  // 計算容器樣式
  const containerStyle = useMemo(() => {
    const scaledWidth = slideSize.width * zoomLevel;
    const scaledHeight = slideSize.height * zoomLevel;
    
    return {
      width: scaledWidth,
      height: scaledHeight,
      minWidth: scaledWidth,
      minHeight: scaledHeight,
    };
  }, [slideSize, zoomLevel]);

  return (
    <div
      className={cn(
        'overflow-auto bg-muted/20',
        centered && 'flex items-center justify-center',
        className
      )}
    >
      <div
        className={cn(
          'relative',
          !centered && 'mx-auto my-4'
        )}
        style={containerStyle}
      >
        <div
          className="slide-viewer-content"
          dangerouslySetInnerHTML={{
            __html: inlineStyles + `<section>${slideHtml}</section>`,
          }}
        />
      </div>
    </div>
  );
}