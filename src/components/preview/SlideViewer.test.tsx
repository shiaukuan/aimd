// ABOUTME: SlideViewer 組件的單元測試
// ABOUTME: 測試投影片內容顯示、縮放和樣式應用

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render } from '@testing-library/react';
import { SlideViewer } from './SlideViewer';

describe('SlideViewer', () => {
  const mockSlideHtml = '<h1>測試投影片</h1><p>這是投影片內容</p>';
  const mockSlideCss = `
    section {
      background: white;
      padding: 2rem;
    }
    h1 {
      color: #333;
      font-size: 2rem;
    }
  `;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('基本渲染', () => {
    it('應渲染投影片內容', () => {
      render(
        <SlideViewer
          slideHtml={mockSlideHtml}
          slideCss={mockSlideCss}
          zoomLevel={1}
        />
      );

      // 檢查投影片內容容器
      const slideContent = document.querySelector('.slide-viewer-content');
      expect(slideContent).toBeInTheDocument();
    });

    it('應包含投影片 HTML 內容', () => {
      render(
        <SlideViewer
          slideHtml={mockSlideHtml}
          slideCss={mockSlideCss}
          zoomLevel={1}
        />
      );

      // 檢查是否包含投影片內容
      expect(document.querySelector('h1')).toBeInTheDocument();
      expect(document.querySelector('p')).toBeInTheDocument();
    });

    it('應應用 CSS 樣式', () => {
      render(
        <SlideViewer
          slideHtml={mockSlideHtml}
          slideCss={mockSlideCss}
          zoomLevel={1}
        />
      );

      // 檢查是否包含樣式標籤
      const styleTag = document.querySelector('style');
      expect(styleTag).toBeInTheDocument();
      expect(styleTag?.textContent).toContain('background: white');
    });
  });

  describe('縮放功能', () => {
    it('應應用正確的縮放比例', () => {
      render(
        <SlideViewer
          slideHtml={mockSlideHtml}
          slideCss={mockSlideCss}
          zoomLevel={1.5}
        />
      );

      const slideContent = document.querySelector('.slide-viewer-content');
      expect(slideContent).toHaveStyle('transform: scale(1.5)');
    });

    it('應支援小於 1 的縮放比例', () => {
      render(
        <SlideViewer
          slideHtml={mockSlideHtml}
          slideCss={mockSlideCss}
          zoomLevel={0.5}
        />
      );

      const slideContent = document.querySelector('.slide-viewer-content');
      expect(slideContent).toHaveStyle('transform: scale(0.5)');
    });

    it('應支援大於 1 的縮放比例', () => {
      render(
        <SlideViewer
          slideHtml={mockSlideHtml}
          slideCss={mockSlideCss}
          zoomLevel={2}
        />
      );

      const slideContent = document.querySelector('.slide-viewer-content');
      expect(slideContent).toHaveStyle('transform: scale(2)');
    });

    it('應根據縮放比例調整容器尺寸', () => {
      const customSize = { width: 800, height: 600 };
      const zoomLevel = 1.5;
      
      render(
        <SlideViewer
          slideHtml={mockSlideHtml}
          slideCss={mockSlideCss}
          zoomLevel={zoomLevel}
          slideSize={customSize}
        />
      );

      // 檢查容器尺寸是否根據縮放調整
      const container = document.querySelector('[style*="width: 1200px"]'); // 800 * 1.5
      expect(container).toBeInTheDocument();
    });
  });

  describe('投影片尺寸', () => {
    it('應使用預設投影片尺寸', () => {
      render(
        <SlideViewer
          slideHtml={mockSlideHtml}
          slideCss={mockSlideCss}
          zoomLevel={1}
        />
      );

      const slideContent = document.querySelector('.slide-viewer-content');
      expect(slideContent).toHaveStyle('width: 1280px'); // DEFAULT_SLIDE_DIMENSIONS.width
      expect(slideContent).toHaveStyle('height: 720px'); // DEFAULT_SLIDE_DIMENSIONS.height
    });

    it('應支援自訂投影片尺寸', () => {
      const customSize = { width: 800, height: 600 };
      
      render(
        <SlideViewer
          slideHtml={mockSlideHtml}
          slideCss={mockSlideCss}
          zoomLevel={1}
          slideSize={customSize}
        />
      );

      const slideContent = document.querySelector('.slide-viewer-content');
      expect(slideContent).toHaveStyle('width: 800px');
      expect(slideContent).toHaveStyle('height: 600px');
    });
  });

  describe('居中顯示', () => {
    it('應預設居中顯示', () => {
      render(
        <SlideViewer
          slideHtml={mockSlideHtml}
          slideCss={mockSlideCss}
          zoomLevel={1}
          centered={true}
        />
      );

      const container = document.querySelector('.flex.items-center.justify-center');
      expect(container).toBeInTheDocument();
    });

    it('應支援非居中顯示', () => {
      render(
        <SlideViewer
          slideHtml={mockSlideHtml}
          slideCss={mockSlideCss}
          zoomLevel={1}
          centered={false}
        />
      );

      const centeredContainer = document.querySelector('.flex.items-center.justify-center');
      expect(centeredContainer).not.toBeInTheDocument();
      
      const nonCenteredContainer = document.querySelector('.mx-auto.my-4');
      expect(nonCenteredContainer).toBeInTheDocument();
    });
  });

  describe('樣式和佈局', () => {
    it('應應用預設背景樣式', () => {
      render(
        <SlideViewer
          slideHtml={mockSlideHtml}
          slideCss={mockSlideCss}
          zoomLevel={1}
        />
      );

      const container = document.querySelector('.bg-muted\\/20');
      expect(container).toBeInTheDocument();
    });

    it('應應用自訂 CSS 類別', () => {
      render(
        <SlideViewer
          slideHtml={mockSlideHtml}
          slideCss={mockSlideCss}
          zoomLevel={1}
          className="custom-slide-viewer"
        />
      );

      const container = document.querySelector('.custom-slide-viewer');
      expect(container).toBeInTheDocument();
    });

    it('應包含必要的佈局樣式', () => {
      render(
        <SlideViewer
          slideHtml={mockSlideHtml}
          slideCss={mockSlideCss}
          zoomLevel={1}
        />
      );

      const slideContent = document.querySelector('.slide-viewer-content');
      expect(slideContent).toHaveStyle('transform-origin: center center');
      expect(slideContent).toHaveStyle('border-radius: 8px');
      expect(slideContent).toHaveStyle('background: white');
    });
  });

  describe('內容處理', () => {
    it('應正確處理空內容', () => {
      render(
        <SlideViewer
          slideHtml=""
          slideCss={mockSlideCss}
          zoomLevel={1}
        />
      );

      const slideContent = document.querySelector('.slide-viewer-content');
      expect(slideContent).toBeInTheDocument();
    });

    it('應正確處理複雜 HTML 內容', () => {
      const complexHtml = `
        <h1>標題</h1>
        <ul>
          <li>項目 1</li>
          <li>項目 2</li>
        </ul>
        <img src="test.jpg" alt="測試圖片" />
        <code>console.log('hello');</code>
      `;

      render(
        <SlideViewer
          slideHtml={complexHtml}
          slideCss={mockSlideCss}
          zoomLevel={1}
        />
      );

      expect(document.querySelector('h1')).toBeInTheDocument();
      expect(document.querySelector('ul')).toBeInTheDocument();
      expect(document.querySelector('img')).toBeInTheDocument();
      expect(document.querySelector('code')).toBeInTheDocument();
    });

    it('應正確處理空 CSS', () => {
      render(
        <SlideViewer
          slideHtml={mockSlideHtml}
          slideCss=""
          zoomLevel={1}
        />
      );

      const slideContent = document.querySelector('.slide-viewer-content');
      expect(slideContent).toBeInTheDocument();
    });
  });

  describe('響應式設計', () => {
    it('應包含滾動容器', () => {
      render(
        <SlideViewer
          slideHtml={mockSlideHtml}
          slideCss={mockSlideCss}
          zoomLevel={1}
        />
      );

      const scrollContainer = document.querySelector('.overflow-auto');
      expect(scrollContainer).toBeInTheDocument();
    });

    it('應在高縮放比例下保持可滾動', () => {
      render(
        <SlideViewer
          slideHtml={mockSlideHtml}
          slideCss={mockSlideCss}
          zoomLevel={3}
        />
      );

      const scrollContainer = document.querySelector('.overflow-auto');
      expect(scrollContainer).toBeInTheDocument();
      
      // 檢查容器是否因為高縮放比例而變大
      const container = document.querySelector('[style*="width: 3840px"]'); // 1280 * 3
      expect(container).toBeInTheDocument();
    });
  });
});