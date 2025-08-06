// ABOUTME: React 錯誤邊界組件，捕獲子組件的錯誤並提供優雅的恢復機制
// ABOUTME: 支援錯誤報告、重試操作和自動恢復功能

'use client';

import React, { Component, ReactNode, ErrorInfo as ReactErrorInfo } from 'react';
import { AlertCircle, RefreshCw, Home, Bug } from 'lucide-react';
import { Button } from './button';

export interface ErrorInfo {
  componentStack: string;
  errorBoundary?: string | undefined;
  errorBoundaryStack?: string | undefined;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
  retryCount: number;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  /** 自訂錯誤標題 */
  title?: string;
  /** 自訂錯誤描述 */
  description?: string;
  /** 是否顯示錯誤詳情 */
  showErrorDetails?: boolean;
  /** 最大重試次數 */
  maxRetries?: number;
  /** 是否啟用自動恢復 */
  enableAutoRecover?: boolean;
  /** 自動恢復延遲時間（毫秒） */
  autoRecoverDelay?: number;
  /** 錯誤報告回調 */
  onError?: (error: Error, errorInfo: ErrorInfo, errorId: string) => void;
  /** 重試回調 */
  onRetry?: (retryCount: number) => void;
  /** 自訂錯誤回傳組件 */
  fallback?: (error: Error, retry: () => void, goHome: () => void) => ReactNode;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private autoRecoverTimer: NodeJS.Timeout | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // 產生唯一錯誤 ID
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    
    return {
      hasError: true,
      error,
      errorId,
    };
  }

  componentDidCatch(error: Error, errorInfo: ReactErrorInfo) {
    const { onError } = this.props;
    const { errorId } = this.state;
    
    // 更新錯誤資訊
    this.setState({
      errorInfo: {
        componentStack: errorInfo.componentStack || '',
        errorBoundary: errorInfo.digest || undefined,
        errorBoundaryStack: errorInfo.componentStack || '',
      },
    });

    // 呼叫錯誤報告回調
    if (onError) {
      const customErrorInfo: ErrorInfo = {
        componentStack: errorInfo.componentStack || '',
        errorBoundary: errorInfo.digest || undefined,
        errorBoundaryStack: errorInfo.componentStack || '',
      };
      onError(error, customErrorInfo, errorId);
    }

    // 記錄錯誤到控制台
    console.group(`🚨 Error Boundary Caught Error [${errorId}]`);
    console.error('Error:', error);
    console.error('Error Info:', errorInfo);
    console.error('Component Stack:', errorInfo.componentStack);
    console.groupEnd();

    // 啟用自動恢復
    if (this.props.enableAutoRecover && this.state.retryCount === 0) {
      this.scheduleAutoRecover();
    }
  }

  componentWillUnmount() {
    if (this.autoRecoverTimer) {
      clearTimeout(this.autoRecoverTimer);
    }
  }

  private scheduleAutoRecover = () => {
    const delay = this.props.autoRecoverDelay || 5000;
    
    this.autoRecoverTimer = setTimeout(() => {
      this.handleRetry();
    }, delay);
  };

  private clearAutoRecover = () => {
    if (this.autoRecoverTimer) {
      clearTimeout(this.autoRecoverTimer);
      this.autoRecoverTimer = null;
    }
  };

  private handleRetry = () => {
    const { maxRetries = 3, onRetry } = this.props;
    const { retryCount } = this.state;
    
    if (retryCount >= maxRetries) {
      console.warn(`已達最大重試次數 (${maxRetries})，停止重試`);
      return;
    }

    this.clearAutoRecover();
    
    const newRetryCount = retryCount + 1;
    
    // 觸發重試回調
    if (onRetry) {
      onRetry(newRetryCount);
    }

    // 重設錯誤狀態
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      retryCount: newRetryCount,
    });
  };

  private handleGoHome = () => {
    // 清除所有狀態並重定向到首頁
    this.clearAutoRecover();
    window.location.href = '/';
  };

  private handleReportError = () => {
    const { error, errorInfo, errorId } = this.state;
    
    if (!error) return;

    // 建立錯誤報告
    const errorReport = {
      errorId,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    // 複製到剪貼簿
    navigator.clipboard.writeText(JSON.stringify(errorReport, null, 2))
      .then(() => {
        alert('錯誤報告已複製到剪貼簿');
      })
      .catch(() => {
        // 回退方案：顯示錯誤詳情
        console.log('Error Report:', errorReport);
        alert('請查看控制台中的錯誤詳情');
      });
  };

  render() {
    const { 
      children, 
      title = '發生錯誤',
      description = '應用程式遇到了意外錯誤，請嘗試重新載入或聯繫支援團隊。',
      showErrorDetails = process.env.NODE_ENV === 'development',
      fallback,
    } = this.props;
    
    const { hasError, error, errorInfo, retryCount, errorId } = this.state;

    if (!hasError) {
      return children;
    }

    // 使用自訂回傳組件
    if (fallback && error) {
      return fallback(error, this.handleRetry, this.handleGoHome);
    }

    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <div className="max-w-2xl w-full space-y-6">
          {/* 錯誤圖示和標題 */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="rounded-full bg-red-100 dark:bg-red-900/20 p-4">
                <AlertCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-foreground">{title}</h1>
              <p className="text-muted-foreground text-lg">{description}</p>
            </div>
            
            {retryCount > 0 && (
              <div className="text-sm text-orange-600 dark:text-orange-400">
                已重試 {retryCount} 次
              </div>
            )}
          </div>

          {/* 操作按鈕 */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              onClick={this.handleRetry}
              className="flex items-center gap-2"
              size="lg"
            >
              <RefreshCw className="h-4 w-4" />
              重試
            </Button>
            
            <Button 
              variant="outline"
              onClick={this.handleGoHome}
              className="flex items-center gap-2"
              size="lg"
            >
              <Home className="h-4 w-4" />
              回首頁
            </Button>
            
            {showErrorDetails && (
              <Button 
                variant="outline"
                onClick={this.handleReportError}
                className="flex items-center gap-2"
                size="lg"
              >
                <Bug className="h-4 w-4" />
                複製錯誤報告
              </Button>
            )}
          </div>

          {/* 錯誤詳情 */}
          {showErrorDetails && error && (
            <div className="mt-8 space-y-4">
              <details className="border rounded-lg">
                <summary className="p-4 cursor-pointer hover:bg-muted/50 font-medium">
                  錯誤詳情 (開發模式)
                </summary>
                <div className="p-4 border-t bg-muted/30 space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm text-red-600 dark:text-red-400 mb-2">
                      錯誤訊息:
                    </h4>
                    <pre className="text-xs bg-background p-3 rounded border overflow-auto">
                      {error.message}
                    </pre>
                  </div>
                  
                  {error.stack && (
                    <div>
                      <h4 className="font-semibold text-sm text-red-600 dark:text-red-400 mb-2">
                        錯誤堆疊:
                      </h4>
                      <pre className="text-xs bg-background p-3 rounded border overflow-auto max-h-40">
                        {error.stack}
                      </pre>
                    </div>
                  )}
                  
                  {errorInfo?.componentStack && (
                    <div>
                      <h4 className="font-semibold text-sm text-red-600 dark:text-red-400 mb-2">
                        組件堆疊:
                      </h4>
                      <pre className="text-xs bg-background p-3 rounded border overflow-auto max-h-40">
                        {errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                  
                  <div className="text-xs text-muted-foreground">
                    錯誤 ID: {errorId}
                  </div>
                </div>
              </details>
            </div>
          )}
        </div>
      </div>
    );
  }
}

// 函數式組件包裝器，提供 hook 式 API
interface ErrorBoundaryWrapperProps extends Omit<ErrorBoundaryProps, 'onError'> {
  onError?: (error: Error, errorInfo: ErrorInfo, errorId: string) => void | undefined;
}

export function ErrorBoundaryWrapper({ 
  children, 
  onError,
  ...props 
}: ErrorBoundaryWrapperProps) {
  return (
    <ErrorBoundary
      {...(onError && { onError })}
      {...props}
    >
      {children}
    </ErrorBoundary>
  );
}

