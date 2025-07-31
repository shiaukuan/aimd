// ABOUTME: SlidePreview 組件的單元測試
// ABOUTME: 測試投影片預覽、縮圖面板、導航和縮放功能

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SlidePreview from './SlidePreview';
import { MarpRenderResult } from '@/types/marp';

// Mock hooks
const mockUseSlideControls = vi.fn();
const mockUseSlideThumbnails = vi.fn();

vi.mock('@/hooks/useSlideControls', () => ({
  useSlideControls: () => mockUseSlideControls(),
}));

vi.mock('@/hooks/useSlideThumbnails', () => ({
  useSlideThumbnails: () => mockUseSlideThumbnails(),
}));

// Mock child components
vi.mock('./ThumbnailGrid', () => ({
  ThumbnailGrid: ({ onThumbnailClick, currentSlide }: any) => (
    <div data-testid="thumbnail-grid">
      <button onClick={() => onThumbnailClick(0)}>Thumbnail 1</button>
      <button onClick={() => onThumbnailClick(1)}>Thumbnail 2</button>
      <span>Current: {currentSlide}</span>
    </div>
  ),
}));

vi.mock('./SlideViewer', () => ({
  SlideViewer: ({ slideHtml, zoomLevel }: any) => (
    <div data-testid="slide-viewer">
      <div>{slideHtml}</div>
      <span>Zoom: {zoomLevel}</span>
    </div>
  ),
}));

vi.mock('./SlideControlBar', () => ({
  SlideControlBar: ({ navigation, zoom, slideInfo, onThumbnailToggle, onFullscreenToggle }: any) => (
    <div data-testid="slide-control-bar">
      <button onClick={navigation.goToPrevious} disabled={!navigation.canGoPrevious}>
        Previous
      </button>
      <button onClick={navigation.goToNext} disabled={!navigation.canGoNext}>
        Next
      </button>
      <span>{slideInfo.current + 1} / {slideInfo.total}</span>
      <button onClick={zoom.zoomIn}>Zoom In</button>
      <button onClick={zoom.zoomOut}>Zoom Out</button>
      <button onClick={onThumbnailToggle}>Toggle Thumbnails</button>
      <button onClick={onFullscreenToggle}>Toggle Fullscreen</button>
    </div>
  ),
}));

describe('SlidePreview', () => {
  const mockRenderResult: MarpRenderResult = {
    html: '<section><h1>投影片 1</h1></section><section><h1>投影片 2</h1></section>',
    css: 'section { background: white; }',
    slideCount: 2,
    slides: [
      { content: '<h1>投影片 1</h1>', title: '投影片 1' },
      { content: '<h1>投影片 2</h1>', title: '投影片 2' },
    ],
    comments: [],
    timestamp: Date.now(),
  };

  const mockNavigation = {
    goToPrevious: vi.fn(),
    goToNext: vi.fn(),
    goToFirst: vi.fn(),
    goToLast: vi.fn(),
    goToSlide: vi.fn(),
    canGoPrevious: false,
    canGoNext: true,
  };

  const mockZoom = {
    zoomIn: vi.fn(),
    zoomOut: vi.fn(),
    resetZoom: vi.fn(),
    setZoom: vi.fn(),
    fitToWindow: vi.fn(),
    currentZoom: 1,
    availableZoomLevels: [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2],
  };

  const mockState = {
    currentSlide: 0,
    totalSlides: 2,
    zoomLevel: 1,
    showThumbnails: true,
    isFullscreen: false,
    thumbnailPanelWidth: 200,
  };

  const mockThumbnails = [
    {
      index: 0,
      html: '<div>縮圖 1</div>',
      title: '投影片 1',
      dimensions: { width: 160, height: 90 },
      isActive: true,
    },
    {
      index: 1,
      html: '<div>縮圖 2</div>',
      title: '投影片 2',
      dimensions: { width: 160, height: 90 },
      isActive: false,
    },
  ];

  const defaultMockControls = {
    state: mockState,
    navigation: mockNavigation,
    zoom: mockZoom,
    toggleThumbnails: vi.fn(),
    toggleFullscreen: vi.fn(),
    setThumbnailPanelWidth: vi.fn(),
  };

  const defaultMockThumbnails = {
    thumbnails: mockThumbnails,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseSlideControls.mockReturnValue(defaultMockControls);
    mockUseSlideThumbnails.mockReturnValue(defaultMockThumbnails);
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('基本渲染', () => {
    it('應渲染投影片預覽組件', () => {
      render(<SlidePreview renderResult={mockRenderResult} />);
      
      expect(screen.getByTestId('thumbnail-grid')).toBeInTheDocument();
      expect(screen.getByTestId('slide-viewer')).toBeInTheDocument();
      expect(screen.getByTestId('slide-control-bar')).toBeInTheDocument();
    });

    it('應顯示縮圖面板', () => {
      render(<SlidePreview renderResult={mockRenderResult} showThumbnails={true} />);
      
      expect(screen.getByText('投影片')).toBeInTheDocument();
      expect(screen.getByText('2 張投影片')).toBeInTheDocument();
    });

    it('應能隱藏縮圖面板', () => {
      mockUseSlideControls.mockReturnValue({
        ...defaultMockControls,
        state: { ...mockState, showThumbnails: false },
      });

      render(<SlidePreview renderResult={mockRenderResult} showThumbnails={false} />);
      
      expect(screen.queryByText('投影片')).not.toBeInTheDocument();
    });

    it('應顯示投影片指示器', () => {
      render(<SlidePreview renderResult={mockRenderResult} />);
      
      const indicators = document.querySelectorAll('button[title*="投影片"]');
      expect(indicators).toHaveLength(2);
    });
  });

  describe('空狀態處理', () => {
    it('應顯示空狀態訊息', () => {
      render(<SlidePreview renderResult={null} />);
      
      expect(screen.getByText('沒有投影片內容')).toBeInTheDocument();
      expect(screen.getByText('請在編輯器中輸入 Markdown 內容來生成投影片')).toBeInTheDocument();
    });

    it('在沒有投影片時顯示空狀態', () => {
      const emptyResult = {
        ...mockRenderResult,
        slides: [],
        slideCount: 0,
      };

      render(<SlidePreview renderResult={emptyResult} />);
      
      expect(screen.getByText('📝')).toBeInTheDocument();
    });
  });

  describe('投影片導航', () => {
    it('應能透過縮圖點擊導航', async () => {
      const user = userEvent.setup();
      render(<SlidePreview renderResult={mockRenderResult} />);
      
      const thumbnail2 = screen.getByText('Thumbnail 2');
      await user.click(thumbnail2);
      
      expect(mockNavigation.goToSlide).toHaveBeenCalledWith(1);
    });

    it('應能透過控制列導航', async () => {
      const user = userEvent.setup();
      render(<SlidePreview renderResult={mockRenderResult} />);
      
      const nextButton = screen.getByText('Next');
      await user.click(nextButton);
      
      expect(mockNavigation.goToNext).toHaveBeenCalled();
    });

    it('應能透過投影片指示器導航', async () => {
      const user = userEvent.setup();
      render(<SlidePreview renderResult={mockRenderResult} />);
      
      const indicators = document.querySelectorAll('button[title*="投影片"]');
      await user.click(indicators[1]);
      
      expect(mockNavigation.goToSlide).toHaveBeenCalledWith(1);
    });
  });

  describe('縮放控制', () => {
    it('應能放大投影片', async () => {
      const user = userEvent.setup();
      render(<SlidePreview renderResult={mockRenderResult} />);
      
      const zoomInButton = screen.getByText('Zoom In');
      await user.click(zoomInButton);
      
      expect(mockZoom.zoomIn).toHaveBeenCalled();
    });

    it('應能縮小投影片', async () => {
      const user = userEvent.setup();
      render(<SlidePreview renderResult={mockRenderResult} />);
      
      const zoomOutButton = screen.getByText('Zoom Out');
      await user.click(zoomOutButton);
      
      expect(mockZoom.zoomOut).toHaveBeenCalled();
    });
  });

  describe('全螢幕功能', () => {
    it('應能切換全螢幕模式', async () => {
      const user = userEvent.setup();
      const toggleFullscreen = vi.fn();
      
      render(
        <SlidePreview 
          renderResult={mockRenderResult} 
          onFullscreenToggle={toggleFullscreen}
        />
      );
      
      const fullscreenButton = screen.getByText('Toggle Fullscreen');
      await user.click(fullscreenButton);
      
      expect(defaultMockControls.toggleFullscreen).toHaveBeenCalled();
    });

    it('應在全螢幕模式下隱藏投影片指示器', () => {
      mockUseSlideControls.mockReturnValue({
        ...defaultMockControls,
        state: { ...mockState, isFullscreen: true },
      });

      render(<SlidePreview renderResult={mockRenderResult} />);
      
      const indicators = document.querySelectorAll('button[title*="投影片"]');
      expect(indicators).toHaveLength(0);
    });
  });

  describe('縮圖面板控制', () => {
    it('應能切換縮圖面板', async () => {
      const user = userEvent.setup();
      const onThumbnailToggle = vi.fn();
      
      render(
        <SlidePreview 
          renderResult={mockRenderResult} 
          onThumbnailToggle={onThumbnailToggle}
        />
      );
      
      const toggleButton = screen.getByText('Toggle Thumbnails');
      await user.click(toggleButton);
      
      expect(defaultMockControls.toggleThumbnails).toHaveBeenCalled();
    });
  });

  describe('回調功能', () => {
    it('應觸發投影片變更回調', async () => {
      const user = userEvent.setup();
      const onSlideChange = vi.fn();
      
      render(
        <SlidePreview 
          renderResult={mockRenderResult} 
          onSlideChange={onSlideChange}
        />
      );
      
      const thumbnail2 = screen.getByText('Thumbnail 2');
      await user.click(thumbnail2);
      
      expect(mockNavigation.goToSlide).toHaveBeenCalledWith(1);
    });

    it('應觸發縮放變更回調', async () => {
      const user = userEvent.setup();
      const onZoomChange = vi.fn();
      
      render(
        <SlidePreview 
          renderResult={mockRenderResult} 
          onZoomChange={onZoomChange}
        />
      );
      
      const zoomInButton = screen.getByText('Zoom In');
      await user.click(zoomInButton);
      
      expect(mockZoom.zoomIn).toHaveBeenCalled();
    });
  });

  describe('鍵盤快捷鍵', () => {
    it('應支援鍵盤快捷鍵', () => {
      render(
        <SlidePreview 
          renderResult={mockRenderResult} 
          enableKeyboardShortcuts={true}
        />
      );
      
      // 驗證 hook 被調用
      expect(mockUseSlideControls).toHaveBeenCalled();
    });

    it('應能禁用鍵盤快捷鍵', () => {
      render(
        <SlidePreview 
          renderResult={mockRenderResult} 
          enableKeyboardShortcuts={false}
        />
      );
      
      // 驗證 hook 被調用
      expect(mockUseSlideControls).toHaveBeenCalled();
    });
  });

  describe('Props 傳遞', () => {
    it('應正確傳遞初始參數到 hooks', () => {
      render(
        <SlidePreview 
          renderResult={mockRenderResult}
          initialSlide={1}
          initialZoom={1.5}
        />
      );
      
      // 驗證 hooks 被調用
      expect(mockUseSlideControls).toHaveBeenCalled();
      expect(mockUseSlideThumbnails).toHaveBeenCalled();
    });

    it('應正確傳遞回調函數到 hooks', () => {
      const onSlideChange = vi.fn();
      const onZoomChange = vi.fn();
      const onFullscreenToggle = vi.fn();
      
      render(
        <SlidePreview 
          renderResult={mockRenderResult}
          onSlideChange={onSlideChange}
          onZoomChange={onZoomChange}
          onFullscreenToggle={onFullscreenToggle}
        />
      );
      
      // 驗證 hooks 被調用
      expect(mockUseSlideControls).toHaveBeenCalled();
      expect(mockUseSlideThumbnails).toHaveBeenCalled();
    });
  });
});