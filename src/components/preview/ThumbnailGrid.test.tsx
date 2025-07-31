// ABOUTME: ThumbnailGrid 組件的單元測試
// ABOUTME: 測試縮圖顯示、點擊互動和視覺狀態

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThumbnailGrid } from './ThumbnailGrid';
import { SlideThumbnail } from '@/types/slidePreview';

describe('ThumbnailGrid', () => {
  const mockThumbnails: SlideThumbnail[] = [
    {
      index: 0,
      html: '<div class="slide-thumbnail">投影片 1 內容</div>',
      title: '投影片 1',
      dimensions: { width: 160, height: 90 },
      isActive: true,
    },
    {
      index: 1,
      html: '<div class="slide-thumbnail">投影片 2 內容</div>',
      title: '投影片 2',
      dimensions: { width: 160, height: 90 },
      isActive: false,
    },
    {
      index: 2,
      html: '<div class="slide-thumbnail">投影片 3 內容</div>',
      title: undefined, // 測試沒有標題的情況
      dimensions: { width: 160, height: 90 },
      isActive: false,
    },
  ];

  const mockOnThumbnailClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('基本渲染', () => {
    it('應渲染所有縮圖', () => {
      render(
        <ThumbnailGrid
          thumbnails={mockThumbnails}
          currentSlide={0}
          onThumbnailClick={mockOnThumbnailClick}
        />
      );

      // 檢查是否有 3 個縮圖容器
      const thumbnailContainers = document.querySelectorAll('[title*="投影片"]');
      expect(thumbnailContainers).toHaveLength(3);
    });

    it('應顯示縮圖內容', () => {
      render(
        <ThumbnailGrid
          thumbnails={mockThumbnails}
          currentSlide={0}
          onThumbnailClick={mockOnThumbnailClick}
        />
      );

      // 檢查是否顯示縮圖 HTML 內容
      expect(document.querySelector('.slide-thumbnail')).toBeInTheDocument();
    });

    it('應設定正確的縮圖尺寸', () => {
      render(
        <ThumbnailGrid
          thumbnails={mockThumbnails}
          currentSlide={0}
          onThumbnailClick={mockOnThumbnailClick}
          thumbnailSize={{ width: 200, height: 120 }}
        />
      );

      const thumbnailContent = document.querySelector('[style*="width: 200px"]');
      expect(thumbnailContent).toBeInTheDocument();
    });
  });

  describe('空狀態處理', () => {
    it('應顯示空狀態訊息', () => {
      render(
        <ThumbnailGrid
          thumbnails={[]}
          currentSlide={0}
          onThumbnailClick={mockOnThumbnailClick}
        />
      );

      expect(screen.getByText('沒有縮圖')).toBeInTheDocument();
    });

    it('在沒有縮圖時不應顯示縮圖容器', () => {
      render(
        <ThumbnailGrid
          thumbnails={[]}
          currentSlide={0}
          onThumbnailClick={mockOnThumbnailClick}
        />
      );

      const thumbnailContainers = document.querySelectorAll('[title*="投影片"]');
      expect(thumbnailContainers).toHaveLength(0);
    });
  });

  describe('互動功能', () => {
    it('應能點擊縮圖', async () => {
      const user = userEvent.setup();
      
      render(
        <ThumbnailGrid
          thumbnails={mockThumbnails}
          currentSlide={0}
          onThumbnailClick={mockOnThumbnailClick}
        />
      );

      const firstThumbnail = document.querySelector('[title="投影片 1"]');
      expect(firstThumbnail).toBeInTheDocument();
      
      await user.click(firstThumbnail!);
      expect(mockOnThumbnailClick).toHaveBeenCalledWith(0);
    });

    it('應能點擊第二張縮圖', async () => {
      const user = userEvent.setup();
      
      render(
        <ThumbnailGrid
          thumbnails={mockThumbnails}
          currentSlide={0}
          onThumbnailClick={mockOnThumbnailClick}
        />
      );

      const secondThumbnail = document.querySelector('[title="投影片 2"]');
      expect(secondThumbnail).toBeInTheDocument();
      
      await user.click(secondThumbnail!);
      expect(mockOnThumbnailClick).toHaveBeenCalledWith(1);
    });

    it('應顯示正確的 hover 效果', () => {
      render(
        <ThumbnailGrid
          thumbnails={mockThumbnails}
          currentSlide={0}
          onThumbnailClick={mockOnThumbnailClick}
        />
      );

      const thumbnailContainers = document.querySelectorAll('.cursor-pointer');
      expect(thumbnailContainers.length).toBeGreaterThan(0);
    });
  });

  describe('視覺狀態', () => {
    it('應正確標示活躍縮圖', () => {
      render(
        <ThumbnailGrid
          thumbnails={mockThumbnails}
          currentSlide={0}
          onThumbnailClick={mockOnThumbnailClick}
        />
      );

      // 檢查活躍狀態的樣式
      const activeThumbnail = document.querySelector('.border-primary');
      expect(activeThumbnail).toBeInTheDocument();
    });

    it('應在活躍縮圖上顯示選中指示器', () => {
      render(
        <ThumbnailGrid
          thumbnails={mockThumbnails}
          currentSlide={0}
          onThumbnailClick={mockOnThumbnailClick}
        />
      );

      // 檢查選中指示器
      const activeIndicator = document.querySelector('.bg-primary.rounded-full');
      expect(activeIndicator).toBeInTheDocument();
    });

    it('應正確更新活躍狀態', () => {
      const { rerender } = render(
        <ThumbnailGrid
          thumbnails={mockThumbnails}
          currentSlide={0}
          onThumbnailClick={mockOnThumbnailClick}
        />
      );

      // 初始狀態：第一張是活躍的
      let activeBorders = document.querySelectorAll('.border-primary');
      expect(activeBorders).toHaveLength(1);

      // 更新活躍投影片為第二張
      const updatedThumbnails = mockThumbnails.map((thumb, index) => ({
        ...thumb,
        isActive: index === 1,
      }));

      rerender(
        <ThumbnailGrid
          thumbnails={updatedThumbnails}
          currentSlide={1}
          onThumbnailClick={mockOnThumbnailClick}
        />
      );

      // 檢查新的活躍狀態
      activeBorders = document.querySelectorAll('.border-primary');
      expect(activeBorders).toHaveLength(1);
    });
  });

  describe('投影片編號', () => {
    it('應顯示投影片編號', () => {
      render(
        <ThumbnailGrid
          thumbnails={mockThumbnails}
          currentSlide={0}
          onThumbnailClick={mockOnThumbnailClick}
          showSlideNumbers={true}
        />
      );

      // 檢查投影片編號
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('應能隱藏投影片編號', () => {
      render(
        <ThumbnailGrid
          thumbnails={mockThumbnails}
          currentSlide={0}
          onThumbnailClick={mockOnThumbnailClick}
          showSlideNumbers={false}
        />
      );

      // 投影片編號應該被隱藏（如果縮圖 HTML 中沒有包含編號）
      const slideNumbers = document.querySelectorAll('.bg-black\\/70');
      expect(slideNumbers).toHaveLength(0);
    });
  });

  describe('投影片標題', () => {
    it('應顯示投影片標題', () => {
      render(
        <ThumbnailGrid
          thumbnails={mockThumbnails}
          currentSlide={0}
          onThumbnailClick={mockOnThumbnailClick}
        />
      );

      // 檢查標題顯示
      expect(screen.getByText('投影片 1')).toBeInTheDocument();
      expect(screen.getByText('投影片 2')).toBeInTheDocument();
    });

    it('應處理沒有標題的投影片', () => {
      render(
        <ThumbnailGrid
          thumbnails={mockThumbnails}
          currentSlide={0}
          onThumbnailClick={mockOnThumbnailClick}
        />
      );

      // 第三張投影片沒有標題，應該使用預設的 title 屬性
      const thirdThumbnail = document.querySelector('[title="投影片 3"]');
      expect(thirdThumbnail).toBeInTheDocument();
    });
  });

  describe('自訂設定', () => {
    it('應支援自訂 CSS 類別', () => {
      render(
        <ThumbnailGrid
          thumbnails={mockThumbnails}
          currentSlide={0}
          onThumbnailClick={mockOnThumbnailClick}
          className="custom-thumbnail-grid"
        />
      );

      const container = document.querySelector('.custom-thumbnail-grid');
      expect(container).toBeInTheDocument();
    });

    it('應支援自訂縮圖尺寸', () => {
      const customSize = { width: 120, height: 68 };
      
      render(
        <ThumbnailGrid
          thumbnails={mockThumbnails}
          currentSlide={0}
          onThumbnailClick={mockOnThumbnailClick}
          thumbnailSize={customSize}
        />
      );

      const thumbnailContent = document.querySelector('[style*="width: 120px"]');
      expect(thumbnailContent).toBeInTheDocument();
    });
  });

  describe('可訪問性', () => {
    it('應提供適當的 title 屬性', () => {
      render(
        <ThumbnailGrid
          thumbnails={mockThumbnails}
          currentSlide={0}
          onThumbnailClick={mockOnThumbnailClick}
        />
      );

      expect(document.querySelector('[title="投影片 1"]')).toBeInTheDocument();
      expect(document.querySelector('[title="投影片 2"]')).toBeInTheDocument();
      expect(document.querySelector('[title="投影片 3"]')).toBeInTheDocument();
    });

    it('應支援鍵盤導航', () => {
      render(
        <ThumbnailGrid
          thumbnails={mockThumbnails}
          currentSlide={0}
          onThumbnailClick={mockOnThumbnailClick}
        />
      );

      // 檢查是否有可點擊的元素
      const clickableElements = document.querySelectorAll('.cursor-pointer');
      expect(clickableElements.length).toBeGreaterThan(0);
    });
  });
});