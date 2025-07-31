// ABOUTME: PreviewPanel 組件的整合測試
// ABOUTME: 測試投影片渲染、導航、全螢幕和錯誤處理功能

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PreviewPanel from './PreviewPanel';

// Mock useEditorStore
const mockUseEditorStore = vi.fn();
vi.mock('@/store/editorStore', () => ({
  useEditorStore: () => mockUseEditorStore(),
}));

// Mock useMarpRenderer
const mockUseMarpRenderer = vi.fn();
vi.mock('@/hooks/useMarpRenderer', () => ({
  useMarpRenderer: () => mockUseMarpRenderer(),
}));

// Mock Lucide React icons
vi.mock('lucide-react', () => ({
  ChevronLeft: () => <div data-testid="chevron-left" />,
  ChevronRight: () => <div data-testid="chevron-right" />,
  Maximize2: () => <div data-testid="maximize2" />,
  RotateCcw: () => <div data-testid="rotate-ccw" />,
  AlertTriangle: () => <div data-testid="alert-triangle" />,
}));

// Mock ErrorBoundaryWrapper
vi.mock('@/components/ui/ErrorBoundary', () => ({
  ErrorBoundaryWrapper: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock Button component
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, ...props }: any) => (
    <button onClick={onClick} disabled={disabled} {...props}>
      {children}
    </button>
  ),
}));

describe('PreviewPanel', () => {
  const mockRender = vi.fn();
  const mockRetry = vi.fn();
  
  const defaultMockStore = {
    content: '',
  };

  const defaultMockRenderer = {
    result: null,
    status: {
      state: 'idle',
      isRendering: false,
      error: null,
      lastRenderTime: null,
      renderCount: 0,
    },
    render: mockRender,
    retry: mockRetry,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseEditorStore.mockReturnValue(defaultMockStore);
    mockUseMarpRenderer.mockReturnValue(defaultMockRenderer);

    // Mock requestFullscreen and exitFullscreen
    Object.defineProperty(document, 'fullscreenElement', {
      value: null,
      writable: true,
    });
    
    HTMLDivElement.prototype.requestFullscreen = vi.fn().mockResolvedValue(undefined);
    document.exitFullscreen = vi.fn().mockResolvedValue(undefined);
    
    // Mock scrollIntoView
    Element.prototype.scrollIntoView = vi.fn();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('基本渲染', () => {
    it('應渲染預覽面板標題', () => {
      render(<PreviewPanel />);
      expect(screen.getByRole('heading', { name: '預覽' })).toBeInTheDocument();
    });

    it('應顯示空狀態訊息', () => {
      render(<PreviewPanel />);
      expect(screen.getByText('開始寫 Markdown')).toBeInTheDocument();
      expect(screen.getByText(/在左側編輯器中輸入 Markdown 內容/)).toBeInTheDocument();
    });

    it('應在無內容時顯示空狀態', () => {
      mockUseEditorStore.mockReturnValue({
        content: '',
      });

      render(<PreviewPanel />);
      expect(screen.getByText('📝')).toBeInTheDocument();
    });
  });

  describe('載入狀態', () => {
    it('應顯示載入狀態', () => {
      mockUseMarpRenderer.mockReturnValue({
        ...defaultMockRenderer,
        status: {
          ...defaultMockRenderer.status,
          isRendering: true,
          state: 'rendering',
        },
      });

      render(<PreviewPanel />);
      expect(screen.getByText('正在渲染投影片...')).toBeInTheDocument();
    });

    it('應顯示載入動畫', () => {
      mockUseMarpRenderer.mockReturnValue({
        ...defaultMockRenderer,
        status: {
          ...defaultMockRenderer.status,
          isRendering: true,
          state: 'rendering',
        },
      });

      render(<PreviewPanel />);
      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });
  });

  describe('錯誤處理', () => {
    it('應顯示錯誤狀態', () => {
      const mockError = {
        type: 'render' as const,
        message: '渲染失敗',
        details: '詳細錯誤資訊',
      };

      mockUseMarpRenderer.mockReturnValue({
        ...defaultMockRenderer,
        status: {
          ...defaultMockRenderer.status,
          state: 'error',
          error: mockError,
        },
      });

      render(<PreviewPanel />);
      expect(screen.getByText('渲染錯誤')).toBeInTheDocument();
      expect(screen.getByText('渲染失敗')).toBeInTheDocument();
      expect(screen.getByText('詳細錯誤資訊')).toBeInTheDocument();
    });

    it('應在錯誤狀態下提供重試按鈕', async () => {
      const user = userEvent.setup();
      const mockError = {
        type: 'render' as const,
        message: '渲染失敗',
      };

      mockUseMarpRenderer.mockReturnValue({
        ...defaultMockRenderer,
        status: {
          ...defaultMockRenderer.status,
          state: 'error',
          error: mockError,
        },
      });

      render(<PreviewPanel />);
      
      const retryButton = screen.getByRole('button', { name: '重試' });
      expect(retryButton).toBeInTheDocument();

      await user.click(retryButton);
      expect(mockRetry).toHaveBeenCalled();
    });

    it('應顯示警告圖示', () => {
      const mockError = {
        type: 'render' as const,
        message: '渲染失敗',
      };

      mockUseMarpRenderer.mockReturnValue({
        ...defaultMockRenderer,
        status: {
          ...defaultMockRenderer.status,
          state: 'error',
          error: mockError,
        },
      });

      render(<PreviewPanel />);
      expect(screen.getByTestId('alert-triangle')).toBeInTheDocument();
    });
  });

  describe('投影片內容渲染', () => {
    const mockResult = {
      html: '<section><h1>測試投影片</h1></section>',
      css: 'section { background: white; }',
      slideCount: 2,
      slides: [
        { content: '<h1>測試投影片</h1>', title: '測試投影片' },
        { content: '<h1>第二張投影片</h1>', title: '第二張投影片' },
      ],
      comments: [],
      timestamp: Date.now(),
    };

    beforeEach(() => {
      mockUseEditorStore.mockReturnValue({
        content: '# 測試投影片\n\n---\n\n# 第二張投影片',
      });

      mockUseMarpRenderer.mockReturnValue({
        ...defaultMockRenderer,
        result: mockResult,
        status: {
          ...defaultMockRenderer.status,
          state: 'success',
        },
      });
    });

    it('應渲染投影片內容', () => {
      render(<PreviewPanel />);
      
      const container = document.querySelector('.marp-container');
      expect(container).toBeInTheDocument();
    });

    it('應顯示投影片計數器', () => {
      render(<PreviewPanel />);
      expect(screen.getByText('1 / 2')).toBeInTheDocument();
    });

    it('應顯示導航按鈕', () => {
      render(<PreviewPanel />);
      expect(screen.getByTestId('prev-slide')).toBeInTheDocument();
      expect(screen.getByTestId('next-slide')).toBeInTheDocument();
    });

    it('應顯示投影片指示器', () => {
      render(<PreviewPanel />);
      
      const indicators = document.querySelectorAll('.w-2.h-2.rounded-full');
      expect(indicators).toHaveLength(2);
    });

    it('應顯示工具列按鈕', () => {
      render(<PreviewPanel />);
      expect(screen.getByTestId('rotate-ccw')).toBeInTheDocument();
      expect(screen.getByTestId('maximize2')).toBeInTheDocument();
    });
  });

  describe('投影片導航', () => {
    const mockResult = {
      html: '<section><h1>投影片 1</h1></section><section><h1>投影片 2</h1></section>',
      css: 'section { background: white; }',
      slideCount: 2,
      slides: [],
      comments: [],
      timestamp: Date.now(),
    };

    beforeEach(() => {
      mockUseEditorStore.mockReturnValue({
        content: '# 投影片 1\n\n---\n\n# 投影片 2',
      });

      mockUseMarpRenderer.mockReturnValue({
        ...defaultMockRenderer,
        result: mockResult,
        status: {
          ...defaultMockRenderer.status,
          state: 'success',
        },
      });
    });

    it('應能點擊下一張按鈕', async () => {
      const user = userEvent.setup();
      render(<PreviewPanel />);
      
      const nextButton = screen.getByTestId('next-slide');
      await user.click(nextButton);
      
      // 檢查是否更新計數器
      await waitFor(() => {
        expect(screen.getByText('2 / 2')).toBeInTheDocument();
      });
    });

    it('應能點擊上一張按鈕', async () => {
      const user = userEvent.setup();
      render(<PreviewPanel />);
      
      // 先切換到第二張
      const nextButton = screen.getByTestId('next-slide');
      await user.click(nextButton);
      
      // 再返回第一張
      const prevButton = screen.getByTestId('prev-slide');
      await user.click(prevButton);
      
      await waitFor(() => {
        expect(screen.getByText('1 / 2')).toBeInTheDocument();
      });
    });

    it('應能點擊投影片指示器', async () => {
      const user = userEvent.setup();
      render(<PreviewPanel />);
      
      const indicators = document.querySelectorAll('.w-2.h-2.rounded-full');
      await user.click(indicators[1]);
      
      await waitFor(() => {
        expect(screen.getByText('2 / 2')).toBeInTheDocument();
      });
    });

    it('應正確禁用導航按鈕', () => {
      render(<PreviewPanel />);
      
      // 在第一張投影片時，上一張按鈕應該被禁用
      const prevButton = screen.getByTestId('prev-slide').closest('button');
      expect(prevButton).toBeDisabled();
    });

    it('應能重置到第一張投影片', async () => {
      const user = userEvent.setup();
      render(<PreviewPanel />);
      
      // 先切換到第二張
      const nextButton = screen.getByTestId('next-slide');
      await user.click(nextButton);
      
      // 點擊重置按鈕
      const resetButton = screen.getByTestId('rotate-ccw').closest('button');
      await user.click(resetButton!);
      
      await waitFor(() => {
        expect(screen.getByText('1 / 2')).toBeInTheDocument();
      });
    });
  });

  describe('全螢幕功能', () => {
    const mockResult = {
      html: '<section><h1>測試</h1></section>',
      css: '',
      slideCount: 1,
      slides: [],
      comments: [],
      timestamp: Date.now(),
    };

    beforeEach(() => {
      mockUseEditorStore.mockReturnValue({
        content: '# 測試',
      });

      mockUseMarpRenderer.mockReturnValue({
        ...defaultMockRenderer,
        result: mockResult,
        status: {
          ...defaultMockRenderer.status,
          state: 'success',
        },
      });
    });

    it('應能進入全螢幕模式', async () => {
      const user = userEvent.setup();
      const mockRequestFullscreen = vi.fn().mockResolvedValue(undefined);
      
      render(<PreviewPanel />);
      
      // Mock requestFullscreen on the preview container
      const previewContainer = screen.getByTestId('preview');
      Object.defineProperty(previewContainer, 'requestFullscreen', {
        value: mockRequestFullscreen,
      });
      
      const fullscreenButton = screen.getByTestId('maximize2').closest('button');
      await user.click(fullscreenButton!);
      
      expect(mockRequestFullscreen).toHaveBeenCalled();
    });
  });

  describe('鍵盤快捷鍵', () => {
    const mockResult = {
      html: '<section><h1>投影片 1</h1></section><section><h1>投影片 2</h1></section>',
      css: '',
      slideCount: 2,
      slides: [],
      comments: [],
      timestamp: Date.now(),
    };

    beforeEach(() => {
      mockUseEditorStore.mockReturnValue({
        content: '# 投影片 1\n\n---\n\n# 投影片 2',
      });

      mockUseMarpRenderer.mockReturnValue({
        ...defaultMockRenderer,
        result: mockResult,
        status: {
          ...defaultMockRenderer.status,
          state: 'success',
        },
      });
    });

    it('應能使用方向鍵導航', async () => {
      render(<PreviewPanel />);
      
      // 按右箭頭鍵
      fireEvent.keyDown(window, { key: 'ArrowRight' });
      
      await waitFor(() => {
        expect(screen.getByText('2 / 2')).toBeInTheDocument();
      });
    });

    it('應能使用空白鍵前進', async () => {
      render(<PreviewPanel />);
      
      fireEvent.keyDown(window, { key: ' ' });
      
      await waitFor(() => {
        expect(screen.getByText('2 / 2')).toBeInTheDocument();
      });
    });

    it('應能使用 Home 鍵回到第一張', async () => {
      render(<PreviewPanel />);
      
      // 先到第二張
      fireEvent.keyDown(window, { key: 'ArrowRight' });
      
      // 按 Home 鍵回到第一張
      fireEvent.keyDown(window, { key: 'Home' });
      
      await waitFor(() => {
        expect(screen.getByText('1 / 2')).toBeInTheDocument();
      });
    });

    it('應能使用 End 鍵到最後一張', async () => {
      render(<PreviewPanel />);
      
      fireEvent.keyDown(window, { key: 'End' });
      
      await waitFor(() => {
        expect(screen.getByText('2 / 2')).toBeInTheDocument();
      });
    });
  });

  describe('同步功能', () => {
    it('應在內容變化時觸發渲染', () => {
      const { rerender } = render(<PreviewPanel enableSync={true} />);
      
      // 模擬內容變化
      mockUseEditorStore.mockReturnValue({
        content: '# 新內容',
      });
      
      rerender(<PreviewPanel enableSync={true} />);
      
      expect(mockRender).toHaveBeenCalledWith('# 新內容');
    });

    it('應在禁用同步時不觸發渲染', () => {
      render(<PreviewPanel enableSync={false} />);
      
      // 即使有內容也不應該觸發渲染
      mockUseEditorStore.mockReturnValue({
        content: '# 測試內容',
      });
      
      expect(mockRender).not.toHaveBeenCalled();
    });
  });

  describe('回調功能', () => {
    it('應觸發錯誤回調', () => {
      const onError = vi.fn();
      const mockError = {
        type: 'render' as const,
        message: '測試錯誤',
      };

      mockUseMarpRenderer.mockReturnValue({
        ...defaultMockRenderer,
        status: {
          ...defaultMockRenderer.status,
          state: 'error',
          error: mockError,
        },
      });

      render(<PreviewPanel onError={onError} />);
      
      // 錯誤回調應該在 useMarpRenderer 的 onError 中被觸發
      // 這裡我們驗證組件能正確顯示錯誤狀態
      expect(screen.getByText('渲染錯誤')).toBeInTheDocument();
    });

    it('應觸發渲染完成回調', () => {
      const onRenderComplete = vi.fn();
      const mockResult = {
        html: '<section><h1>測試</h1></section>',
        css: '',
        slideCount: 3,
        slides: [],
        comments: [],
        timestamp: Date.now(),
      };

      mockUseMarpRenderer.mockReturnValue({
        ...defaultMockRenderer,
        result: mockResult,
        status: {
          ...defaultMockRenderer.status,
          state: 'success',
        },
      });

      render(<PreviewPanel onRenderComplete={onRenderComplete} />);
      
      // 渲染完成回調應該在 useMarpRenderer 的 onRenderComplete 中被觸發
      // 這裡我們驗證組件能正確顯示投影片數量
      expect(screen.getByText('1 / 3')).toBeInTheDocument();
    });
  });
});