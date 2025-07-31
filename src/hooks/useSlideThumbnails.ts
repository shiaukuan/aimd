// ABOUTME: 投影片縮圖生成和管理 Hook
// ABOUTME: 從 Marp 渲染結果生成縮圖，支援快取和效能優化

import { useMemo, useCallback } from 'react';
import { MarpRenderResult } from '@/types/marp';
import { SlideThumbnail, DEFAULT_THUMBNAIL_SIZE } from '@/types/slidePreview';

export interface UseSlideThumbnailsOptions {
  /** 縮圖尺寸 */
  thumbnailSize?: {
    width: number;
    height: number;
  };
  /** 是否啟用縮圖快取 */
  enableCache?: boolean;
  /** 是否顯示投影片編號 */
  showSlideNumbers?: boolean;
}

export interface UseSlideThumbnailsReturn {
  /** 縮圖陣列 */
  thumbnails: SlideThumbnail[];
  /** 生成單一縮圖 */
  generateThumbnail: (slideIndex: number) => SlideThumbnail | null;
  /** 更新縮圖尺寸 */
  updateThumbnailSize: (size: { width: number; height: number }) => void;
  /** 清除快取 */
  clearCache: () => void;
}

export function useSlideThumbnails(
  renderResult: MarpRenderResult | null,
  currentSlide: number,
  options: UseSlideThumbnailsOptions = {}
): UseSlideThumbnailsReturn {
  const {
    thumbnailSize = DEFAULT_THUMBNAIL_SIZE,
    enableCache = true,
    showSlideNumbers = true,
  } = options;

  // 從 Marp 渲染結果中提取投影片標題
  const extractSlideTitle = useCallback((slideHtml: string, slideIndex: number): string | undefined => {
    // 嘗試從 HTML 中提取第一個標題
    const titleMatch = slideHtml.match(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/i);
    if (titleMatch) {
      // 移除 HTML 標籤並取得純文字
      return titleMatch[1].replace(/<[^>]*>/g, '').trim();
    }

    // 如果沒有標題，使用投影片編號
    return `投影片 ${slideIndex + 1}`;
  }, []);

  // 生成縮圖 HTML，調整尺寸和樣式
  const generateThumbnailHtml = useCallback((
    slideHtml: string,
    slideCss: string,
    slideIndex: number
  ): string => {
    const scaleRatio = Math.min(
      thumbnailSize.width / DEFAULT_THUMBNAIL_SIZE.width,
      thumbnailSize.height / DEFAULT_THUMBNAIL_SIZE.height
    );

    return `
      <div class="slide-thumbnail" style="
        width: ${thumbnailSize.width}px;
        height: ${thumbnailSize.height}px;
        transform: scale(${scaleRatio});
        transform-origin: top left;
        overflow: hidden;
        position: relative;
        background: white;
        border-radius: 4px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      ">
        <style>${slideCss}</style>
        <div style="
          width: ${DEFAULT_THUMBNAIL_SIZE.width / scaleRatio}px;
          height: ${DEFAULT_THUMBNAIL_SIZE.height / scaleRatio}px;
          font-size: ${12 / scaleRatio}px;
        ">
          ${slideHtml}
        </div>
        ${showSlideNumbers ? `
          <div style="
            position: absolute;
            bottom: 4px;
            right: 4px;
            background: rgba(0, 0, 0, 0.7);
            color: white;
            font-size: 10px;
            padding: 2px 6px;
            border-radius: 2px;
            font-family: system-ui, sans-serif;
          ">
            ${slideIndex + 1}
          </div>
        ` : ''}
      </div>
    `;
  }, [thumbnailSize, showSlideNumbers]);

  // 生成縮圖陣列
  const thumbnails = useMemo((): SlideThumbnail[] => {
    if (!renderResult || !renderResult.slides || renderResult.slides.length === 0) {
      return [];
    }

    return renderResult.slides.map((slide, index) => {
      const title = extractSlideTitle(slide.content, index);
      const thumbnailHtml = generateThumbnailHtml(
        slide.content,
        renderResult.css,
        index
      );

      return {
        index,
        html: thumbnailHtml,
        title,
        dimensions: thumbnailSize,
        isActive: index === currentSlide,
      };
    });
  }, [renderResult, currentSlide, thumbnailSize, extractSlideTitle, generateThumbnailHtml]);

  // 生成單一縮圖
  const generateThumbnail = useCallback((slideIndex: number): SlideThumbnail | null => {
    if (!renderResult || !renderResult.slides || slideIndex >= renderResult.slides.length) {
      return null;
    }

    const slide = renderResult.slides[slideIndex];
    const title = extractSlideTitle(slide.content, slideIndex);
    const thumbnailHtml = generateThumbnailHtml(
      slide.content,
      renderResult.css,
      slideIndex
    );

    return {
      index: slideIndex,
      html: thumbnailHtml,
      title,
      dimensions: thumbnailSize,
      isActive: slideIndex === currentSlide,
    };
  }, [renderResult, currentSlide, thumbnailSize, extractSlideTitle, generateThumbnailHtml]);

  // 更新縮圖尺寸（這裡簡化實作，實際應該觸發重新生成）
  const updateThumbnailSize = useCallback((size: { width: number; height: number }) => {
    // 在實際實作中，這裡應該更新狀態並觸發縮圖重新生成
    console.log('更新縮圖尺寸:', size);
  }, []);

  // 清除快取
  const clearCache = useCallback(() => {
    // 在實際實作中，這裡應該清除縮圖快取
    console.log('清除縮圖快取');
  }, []);

  return {
    thumbnails,
    generateThumbnail,
    updateThumbnailSize,
    clearCache,
  };
}