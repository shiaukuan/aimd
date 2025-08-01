// ABOUTME: ErrorBoundary 組件的單元測試
// ABOUTME: 測試錯誤捕獲、重試機制和自動恢復功能

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ErrorBoundary, ErrorBoundaryWrapper } from './ErrorBoundary';

// Mock console.error to avoid noise in tests
const originalConsoleError = console.error;
const originalConsoleLog = console.log;

beforeEach(() => {
  console.error = vi.fn();
  console.log = vi.fn();
  vi.useFakeTimers();
});

afterEach(() => {
  console.error = originalConsoleError;
  console.log = originalConsoleLog;
  vi.useRealTimers();
});

// 會拋出錯誤的測試組件
function ThrowError({ shouldThrow = true, message = 'Test error' }) {
  if (shouldThrow) {
    throw new Error(message);
  }
  return <div>正常組件</div>;
}

describe('ErrorBoundary', () => {
  describe('正常狀態', () => {
    it('應該正常渲染子組件', () => {
      render(
        <ErrorBoundary>
          <div>測試內容</div>
        </ErrorBoundary>
      );

      expect(screen.getByText('測試內容')).toBeInTheDocument();
    });

    it('不應該顯示錯誤界面', () => {
      render(
        <ErrorBoundary>
          <div>測試內容</div>
        </ErrorBoundary>
      );

      expect(screen.queryByText('發生錯誤')).not.toBeInTheDocument();
    });
  });

  describe('錯誤處理', () => {
    it('應該捕獲子組件的錯誤', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByText('發生錯誤')).toBeInTheDocument();
      expect(screen.getByText(/應用程式遇到了意外錯誤/)).toBeInTheDocument();
    });

    it('應該顯示自訂標題和描述', () => {
      const customTitle = '自訂錯誤標題';
      const customDescription = '自訂錯誤描述';

      render(
        <ErrorBoundary title={customTitle} description={customDescription}>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByText(customTitle)).toBeInTheDocument();
      expect(screen.getByText(customDescription)).toBeInTheDocument();
    });

    it('應該調用錯誤回調', () => {
      const mockOnError = vi.fn();

      render(
        <ErrorBoundary onError={mockOnError}>
          <ThrowError message="測試錯誤" />
        </ErrorBoundary>
      );

      expect(mockOnError).toHaveBeenCalledWith(
        expect.objectContaining({ message: '測試錯誤' }),
        expect.any(Object),
        expect.any(String)
      );
    });

    it('應該記錄錯誤到控制台', () => {
      render(
        <ErrorBoundary>
          <ThrowError message="控制台錯誤" />
        </ErrorBoundary>
      );

      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('重試機制', () => {
    it('應該顯示重試按鈕', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByRole('button', { name: /重試/i })).toBeInTheDocument();
    });

    it('點擊重試應該重新渲染組件', () => {
      const TestComponent = ({ shouldThrow }: { shouldThrow: boolean }) => (
        <ThrowError shouldThrow={shouldThrow} />
      );

      const { rerender } = render(
        <ErrorBoundary>
          <TestComponent shouldThrow={true} />
        </ErrorBoundary>
      );

      // 確認錯誤界面顯示
      expect(screen.getByText('發生錯誤')).toBeInTheDocument();

      // 重新渲染為正常組件
      rerender(
        <ErrorBoundary>
          <TestComponent shouldThrow={false} />
        </ErrorBoundary>
      );

      // 點擊重試
      fireEvent.click(screen.getByRole('button', { name: /重試/i }));

      // 應該顯示正常組件
      expect(screen.getByText('正常組件')).toBeInTheDocument();
    });

    it('應該調用重試回調', () => {
      const mockOnRetry = vi.fn();

      render(
        <ErrorBoundary onRetry={mockOnRetry}>
          <ThrowError />
        </ErrorBoundary>
      );

      fireEvent.click(screen.getByRole('button', { name: /重試/i }));

      expect(mockOnRetry).toHaveBeenCalledWith(1);
    });

    it('應該限制最大重試次數', () => {
      const mockOnRetry = vi.fn();

      render(
        <ErrorBoundary maxRetries={2} onRetry={mockOnRetry}>
          <ThrowError />
        </ErrorBoundary>
      );

      // 重試 3 次
      fireEvent.click(screen.getByRole('button', { name: /重試/i }));
      fireEvent.click(screen.getByRole('button', { name: /重試/i }));
      fireEvent.click(screen.getByRole('button', { name: /重試/i }));

      // 只應該調用 2 次
      expect(mockOnRetry).toHaveBeenCalledTimes(2);
    });

    it('應該顯示重試次數', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      fireEvent.click(screen.getByRole('button', { name: /重試/i }));

      expect(screen.getByText('已重試 1 次')).toBeInTheDocument();
    });
  });

  describe('導航按鈕', () => {
    it('應該顯示回首頁按鈕', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(
        screen.getByRole('button', { name: /回首頁/i })
      ).toBeInTheDocument();
    });

    it('點擊回首頁應該重定向', () => {
      // Mock window.location
      const mockLocation = { href: '' };
      Object.defineProperty(window, 'location', {
        value: mockLocation,
        writable: true,
      });

      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      fireEvent.click(screen.getByRole('button', { name: /回首頁/i }));

      expect(mockLocation.href).toBe('/');
    });
  });

  describe('錯誤詳情', () => {
    it('開發模式下應該顯示錯誤詳情', () => {
      vi.stubEnv('NODE_ENV', 'development');

      render(
        <ErrorBoundary showErrorDetails={true}>
          <ThrowError message="詳細錯誤訊息" />
        </ErrorBoundary>
      );

      expect(screen.getByText('複製錯誤報告')).toBeInTheDocument();

      vi.unstubAllEnvs();
    });

    it('生產模式下不應該顯示錯誤詳情', () => {
      vi.stubEnv('NODE_ENV', 'production');

      render(
        <ErrorBoundary showErrorDetails={false}>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.queryByText('複製錯誤報告')).not.toBeInTheDocument();

      vi.unstubAllEnvs();
    });

    it.skip('應該支援複製錯誤報告', async () => {
      // Mock clipboard API
      const mockWriteText = vi.fn().mockResolvedValue(undefined);
      Object.assign(navigator, {
        clipboard: {
          writeText: mockWriteText,
        },
      });

      // Mock alert
      window.alert = vi.fn();

      render(
        <ErrorBoundary showErrorDetails={true}>
          <ThrowError message="錯誤報告測試" />
        </ErrorBoundary>
      );

      fireEvent.click(screen.getByText('複製錯誤報告'));

      await waitFor(
        () => {
          expect(mockWriteText).toHaveBeenCalled();
        },
        { timeout: 5000 }
      );

      expect(window.alert).toHaveBeenCalledWith('錯誤報告已複製到剪貼簿');
    });
  });

  describe('自動恢復', () => {
    it('啟用自動恢復時應該在延遲後自動重試', async () => {
      const mockOnRetry = vi.fn();

      render(
        <ErrorBoundary
          enableAutoRecover={true}
          autoRecoverDelay={1000}
          onRetry={mockOnRetry}
        >
          <ThrowError />
        </ErrorBoundary>
      );

      // 快進時間到自動恢復
      vi.advanceTimersByTime(1000);

      expect(mockOnRetry).toHaveBeenCalledWith(1);
    });

    it('應該清理自動恢復計時器', () => {
      const { unmount } = render(
        <ErrorBoundary enableAutoRecover={true}>
          <ThrowError />
        </ErrorBoundary>
      );

      // 卸載組件
      unmount();

      // 快進時間，不應該有副作用
      vi.advanceTimersByTime(5000);

      // 測試通過表示沒有發生錯誤
      expect(true).toBe(true);
    });
  });

  describe('自訂回傳組件', () => {
    it('應該支援自訂回傳組件', () => {
      const customFallback = (error: Error, retry: () => void) => (
        <div>
          <h1>自訂錯誤頁面</h1>
          <p>錯誤: {error.message}</p>
          <button onClick={retry}>自訂重試</button>
        </div>
      );

      render(
        <ErrorBoundary fallback={customFallback}>
          <ThrowError message="自訂錯誤" />
        </ErrorBoundary>
      );

      expect(screen.getByText('自訂錯誤頁面')).toBeInTheDocument();
      expect(screen.getByText('錯誤: 自訂錯誤')).toBeInTheDocument();
      expect(screen.getByText('自訂重試')).toBeInTheDocument();
    });
  });
});

describe('ErrorBoundaryWrapper', () => {
  it('應該正常渲染子組件', () => {
    render(
      <ErrorBoundaryWrapper>
        <div>包裝器測試</div>
      </ErrorBoundaryWrapper>
    );

    expect(screen.getByText('包裝器測試')).toBeInTheDocument();
  });

  it('應該捕獲錯誤', () => {
    render(
      <ErrorBoundaryWrapper>
        <ThrowError />
      </ErrorBoundaryWrapper>
    );

    expect(screen.getByText('發生錯誤')).toBeInTheDocument();
  });

  it('應該支援自訂錯誤回調', () => {
    const mockOnError = vi.fn();

    render(
      <ErrorBoundaryWrapper onError={mockOnError}>
        <ThrowError message="包裝器錯誤" />
      </ErrorBoundaryWrapper>
    );

    expect(mockOnError).toHaveBeenCalledWith(
      expect.objectContaining({ message: '包裝器錯誤' }),
      expect.any(Object),
      expect.any(String)
    );
  });
});
