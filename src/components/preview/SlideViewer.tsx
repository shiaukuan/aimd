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
  // 生成 Marp 樣式
  const marpStyles = useMemo(() => {
    return `
      <style>
        ${slideCss || ''}
        
        /* 確保 Marp 投影片正確顯示 */
        .slide-viewer-content {
          width: ${slideSize.width}px;
          height: ${slideSize.height}px;
          transform: scale(${zoomLevel});
          transform-origin: center center;
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          overflow: hidden;
          position: relative;
        }
        
        /* Marp 投影片樣式 */
        .slide-viewer-content section {
          width: 100% !important;
          height: 100% !important;
          padding: 60px !important;
          margin: 0 !important;
          display: flex !important;
          flex-direction: column !important;
          justify-content: center !important;
          align-items: center !important;
          box-sizing: border-box !important;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif !important;
          font-size: 28px !important;
          line-height: 1.4 !important;
          color: #333 !important;
          background: white !important;
        }
        
        .slide-viewer-content h1 {
          font-size: 2.5em !important;
          font-weight: 700 !important;
          margin: 0 0 0.5em 0 !important;
          text-align: center !important;
          color: #1a1a1a !important;
        }
        
        .slide-viewer-content h2 {
          font-size: 1.8em !important;
          font-weight: 600 !important;
          margin: 1em 0 0.5em 0 !important;
          text-align: center !important;
          color: #2d2d2d !important;
        }
        
        .slide-viewer-content h3 {
          font-size: 1.4em !important;
          font-weight: 600 !important;
          margin: 1em 0 0.5em 0 !important;
          color: #404040 !important;
        }
        
        .slide-viewer-content p {
          margin: 0.5em 0 !important;
          text-align: center !important;
          font-size: 1em !important;
          line-height: 1.6 !important;
        }
        
        .slide-viewer-content ul {
          margin: 1em 0 !important;
          text-align: left !important;
          display: inline-block !important;
          font-size: 1em !important;
        }
        
        .slide-viewer-content li {
          margin: 0.5em 0 !important;
          line-height: 1.6 !important;
        }
        
        .slide-viewer-content strong {
          font-weight: 700 !important;
          color: #1a1a1a !important;
        }
        
        .slide-viewer-content em {
          font-style: italic !important;
        }
        
        .slide-viewer-content code {
          background: rgba(0, 0, 0, 0.1) !important;
          padding: 0.2em 0.4em !important;
          border-radius: 3px !important;
          font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace !important;
          font-size: 0.85em !important;
        }
        
        .slide-viewer-content pre {
          background: rgba(0, 0, 0, 0.05) !important;
          padding: 1rem !important;
          border-radius: 6px !important;
          overflow-x: auto !important;
          margin: 1rem 0 !important;
          font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace !important;
        }
        
        .slide-viewer-content img {
          max-width: 100% !important;
          height: auto !important;
          margin: 1rem 0 !important;
        }
        
        .slide-viewer-content blockquote {
          border-left: 4px solid #ddd !important;
          margin: 1rem 0 !important;
          padding-left: 1rem !important;
          color: #666 !important;
          font-style: italic !important;
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
            __html: marpStyles + `<section>${slideHtml}</section>`,
          }}
        />
      </div>
    </div>
  );
}