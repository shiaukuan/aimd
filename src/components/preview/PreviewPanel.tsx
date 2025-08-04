// ABOUTME: 投影片預覽組件，整合 Marp Core 將 Markdown 渲染為投影片
// ABOUTME: 支援即時同步、導航控制和錯誤處理

'use client';

import React, {
  useEffect,
  useState,
  useRef,
  useMemo,
  useCallback,
} from 'react';
import { Marp } from '@marp-team/marp-core';
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  RotateCcw,
  AlertTriangle,
  Download,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ErrorBoundaryWrapper } from '@/components/ui/ErrorBoundary';
import { useEditorStore } from '@/store/editorStore';
import { useDebounce } from '@/hooks/useDebounce';
import { useSlideScaling } from '@/hooks/useSlideScaling';

interface PreviewPanelProps {
  className?: string;
  /** 是否啟用同步 */
  enableSync?: boolean;
  /** 同步延遲時間 */
  syncDelay?: number;
  /** 自訂 Marp 主題 */
  theme?: string;
  /** 錯誤回調 */
  onError?: (error: Error) => void;
  /** 渲染完成回調 */
  onRenderComplete?: (slideCount: number) => void;
}

interface SlideData {
  html: string;
  css: string;
  slideCount: number;
  comments: string[];
}

export default function PreviewPanel({
  className = '',
  enableSync = true,
  syncDelay = 300,
  theme = 'default',
  onError,
  onRenderComplete,
}: PreviewPanelProps) {
  const { content, startSyncing, stopSyncing, setError } = useEditorStore();

  const [slideData, setSlideData] = useState<SlideData | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isRendering, setIsRendering] = useState(false);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMarpRendered, setIsMarpRendered] = useState(false);

  const previewRef = useRef<HTMLDivElement>(null);
  const marpRef = useRef<Marp | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const scalingWrapperRef = useRef<HTMLDivElement | null>(null);

  const scalingStyle = useSlideScaling({
    viewportRef,
    wrapperRef: scalingWrapperRef,
    isRendered: isMarpRendered,
  });

  // 初始化 Marp 實例
  useEffect(() => {
    try {
      marpRef.current = new Marp({
        html: true,
      });

      // TODO: 設置主題 (如果需要)
    } catch (error) {
      const errorMsg = '初始化 Marp 失敗';
      console.error(errorMsg, error);
      setRenderError(errorMsg);
      if (onError) {
        onError(error instanceof Error ? error : new Error(errorMsg));
      }
    }
  }, [theme, onError]);

  // 渲染 Markdown 為投影片
  const renderSlides = async (markdown: string): Promise<SlideData | null> => {
    if (!marpRef.current || !markdown.trim()) {
      return null;
    }

    try {
      setIsRendering(true);
      setRenderError(null);
      startSyncing();

      const result = marpRef.current.render(markdown);

      if (!result.html) {
        throw new Error('渲染結果為空');
      }

      // 計算投影片數量
      const slideCount = (result.html.match(/<section[^>]*>/g) || []).length;

      // 提取註釋
      const comments = markdown.match(/<!--[\s\S]*?-->/g) || [];

      const slideData: SlideData = {
        html: result.html,
        css: result.css,
        slideCount: Math.max(slideCount, 1),
        comments: comments.map(comment =>
          comment.replace(/<!--\s*|\s*-->/g, '').trim()
        ),
      };

      // 觸發完成回調
      if (onRenderComplete) {
        onRenderComplete(slideData.slideCount);
      }

      // 預設隱藏所有投影片，除了第一張
      setTimeout(() => {
        if (previewRef.current) {
          const slides = previewRef.current.querySelectorAll('section');
          slides.forEach((slide, index) => {
            if (index === 0) {
              (slide as HTMLElement).style.display = 'flex';
            } else {
              (slide as HTMLElement).style.display = 'none';
            }
          });
        }
      }, 0);

      return slideData;
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : '渲染投影片時發生錯誤';
      console.error('Render error:', error);
      setRenderError(errorMsg);
      setError(errorMsg);

      if (onError) {
        onError(error instanceof Error ? error : new Error(errorMsg));
      }

      return null;
    } finally {
      setIsRendering(false);
      stopSyncing();
    }
  };

  // 使用 debounce 來延遲渲染
  const { debouncedCallback: debouncedRender } = useDebounce(
    async (markdown: string) => {
      const result = await renderSlides(markdown);
      if (result) {
        setSlideData(result);
        setIsMarpRendered(true); // 標記為已渲染
        // 如果當前投影片超出範圍，重設為第一張
        if (currentSlide >= result.slideCount) {
          setCurrentSlide(0);
        }
      }
    },
    syncDelay
  );

  // 監聽內容變化並觸發同步渲染
  useEffect(() => {
    if (enableSync && content) {
      debouncedRender(content);
    }
  }, [content, enableSync, debouncedRender]);

  // 投影片導航函數
  const goToSlide = useCallback(
    (slideIndex: number) => {
      if (!slideData || !previewRef.current) return;

      const newIndex = Math.max(
        0,
        Math.min(slideIndex, slideData.slideCount - 1)
      );

      console.log(`Navigating to slide: ${newIndex + 1}`);

      // 直接操作 DOM 來顯示/隱藏投影片
      const slides = previewRef.current.querySelectorAll('section');
      slides.forEach((slide, index) => {
        const slideElement = slide as HTMLElement;
        if (index === newIndex) {
          slideElement.style.display = 'flex';
          // 確保滾動到可見區域
          slideElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else {
          slideElement.style.display = 'none';
        }
      });

      setCurrentSlide(newIndex);
    },
    [slideData]
  );

  const nextSlide = useCallback(() => {
    setCurrentSlide(prev => {
      const newIndex = Math.min(
        prev + 1,
        slideData ? slideData.slideCount - 1 : 0
      );
      goToSlide(newIndex);
      return newIndex;
    });
  }, [goToSlide, slideData]);

  const prevSlide = useCallback(() => {
    setCurrentSlide(prev => {
      const newIndex = Math.max(prev - 1, 0);
      goToSlide(newIndex);
      return newIndex;
    });
  }, [goToSlide]);

  const resetToFirstSlide = useCallback(() => {
    setCurrentSlide(0);
    goToSlide(0);
  }, [goToSlide]);

  // PDF下載功能
  const downloadPDF = useCallback(() => {
    if (!slideData) return;

    // 使用瀏覽器列印功能生成PDF
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('無法開啟列印視窗，請檢查瀏覽器彈出視窗設定');
      return;
    }

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>投影片PDF</title>
          <style>
            ${slideData.css}
            @media print {
              body { margin: 0; padding: 0; }
              .page-break { page-break-before: always; }
              section {
                width: 100vw !important;
                height: 100vh !important;
                display: flex !important;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                padding: 2rem;
                box-sizing: border-box;
                background: white;
                margin: 0;
                page-break-after: always;
              }
            }
          </style>
        </head>
        <body>
          ${slideData.html}
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // 等待內容載入後自動開啟列印對話框
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  }, [slideData]);

  // 全螢幕切換
  const toggleFullscreen = useCallback(async () => {
    if (!previewRef.current) return;

    try {
      if (!isFullscreen) {
        await previewRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.warn('Fullscreen toggle failed:', error);
    }
  }, [isFullscreen]);

  // 監聽全螢幕變化
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () =>
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // 鍵盤快捷鍵
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 如果焦點在輸入框或文字區域，則不觸發快捷鍵
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      if (!slideData || slideData.slideCount <= 1) return;

      switch (e.key) {
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault();
          prevSlide();
          break;
        case 'ArrowRight':
        case 'ArrowDown':
        case ' ':
          e.preventDefault();
          nextSlide();
          break;
        case 'Home':
          e.preventDefault();
          resetToFirstSlide();
          break;
        case 'End':
          e.preventDefault();
          goToSlide(slideData.slideCount - 1);
          break;
        case 'F11':
          e.preventDefault();
          toggleFullscreen();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    slideData,
    prevSlide,
    nextSlide,
    resetToFirstSlide,
    goToSlide,
    toggleFullscreen,
  ]);

  // 生成內聯樣式
  const inlineStyles = useMemo(() => {
    if (!slideData?.css) return '';

    return `
      <style>
        ${slideData.css}
        section {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 2rem;
          box-sizing: border-box;
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          margin-bottom: 1rem;
        }
        
        .marp-container {
          width: 100%;
          height: 100%;
          overflow: auto;
        }
      </style>
    `;
  }, [slideData?.css]);

  // 渲染錯誤狀態
  if (renderError) {
    return (
      <div
        className={`flex flex-col h-full ${className}`}
        data-testid="preview"
      >
        {/* 標題列 */}
        <div className="flex items-center justify-between p-3 border-b bg-background">
          <h2 className="text-lg font-semibold">預覽</h2>
        </div>
        <div className="flex items-center justify-center flex-1">
          <div className="text-center space-y-4 p-8">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto" />
            <h3 className="text-lg font-semibold text-red-700 dark:text-red-400">
              渲染錯誤
            </h3>
            <p className="text-sm text-muted-foreground max-w-md">
              {renderError}
            </p>
            <Button
              onClick={() => {
                setRenderError(null);
                if (content) {
                  debouncedRender(content);
                }
              }}
              size="sm"
            >
              重試
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // 渲染載入狀態
  if (isRendering) {
    return (
      <div
        className={`flex flex-col h-full ${className}`}
        data-testid="preview"
      >
        {/* 標題列 */}
        <div className="flex items-center justify-between p-3 border-b bg-background">
          <h2 className="text-lg font-semibold">預覽</h2>
        </div>
        <div className="flex items-center justify-center flex-1">
          <div className="text-center space-y-4">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
            <p className="text-sm text-muted-foreground">正在渲染投影片...</p>
          </div>
        </div>
      </div>
    );
  }

  // 渲染空狀態
  if (!slideData || !content.trim()) {
    return (
      <div
        className={`flex flex-col h-full ${className}`}
        data-testid="preview"
      >
        {/* 標題列 */}
        <div className="flex items-center justify-between p-3 border-b bg-background">
          <h2 className="text-lg font-semibold">預覽</h2>
        </div>
        <div className="flex items-center justify-center flex-1">
          <div className="text-center space-y-4 p-8">
            <div className="text-6xl">📝</div>
            <h3 className="text-lg font-semibold text-muted-foreground">
              開始寫 Markdown
            </h3>
            <p className="text-sm text-muted-foreground max-w-md">
              在左側編輯器中輸入 Markdown 內容，這裡會即時顯示投影片預覽
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundaryWrapper
      title="預覽區域錯誤"
      description="投影片預覽遇到錯誤，請嘗試重新載入"
    >
      <div
        ref={previewRef}
        className={`relative h-full flex flex-col ${className} ${isFullscreen ? 'bg-black' : ''}`}
        data-testid="preview"
      >
        {/* 標題列 */}
        <div className="flex items-center justify-between p-3 border-b bg-background">
          <h2 className="text-lg font-semibold">預覽</h2>
        </div>

        {/* 工具列 */}
        <div className="flex items-center justify-between p-2 border-b bg-background/80 backdrop-blur-sm">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={prevSlide}
              disabled={currentSlide === 0 || slideData.slideCount <= 1}
              data-testid="prev-slide"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <span
              className="text-sm text-muted-foreground min-w-[80px] text-center"
              data-testid="slide-counter"
            >
              {slideData.slideCount > 1
                ? `${currentSlide + 1} / ${slideData.slideCount}`
                : '1 / 1'}
            </span>

            <Button
              variant="ghost"
              size="sm"
              onClick={nextSlide}
              disabled={
                currentSlide === slideData.slideCount - 1 ||
                slideData.slideCount <= 1
              }
              data-testid="next-slide"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={downloadPDF}
              disabled={!slideData}
              title="下載PDF"
            >
              <Download className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={resetToFirstSlide}
              disabled={currentSlide === 0}
              title="回到第一張投影片"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFullscreen}
              title="全螢幕預覽 (F11)"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* 投影片內容 */}
        <div
          ref={viewportRef}
          className="flex-1 overflow-hidden relative bg-muted/30"
        >
          <div ref={scalingWrapperRef} style={scalingStyle}>
            <div
              className="marp-container"
              dangerouslySetInnerHTML={{
                __html: inlineStyles + slideData.html,
              }}
            />
          </div>
        </div>

        {/* 投影片指示器 */}
        {slideData.slideCount > 1 && (
          <div className="flex justify-center p-2 space-x-1">
            {Array.from({ length: slideData.slideCount }, (_, i) => (
              <button
                key={i}
                onClick={() => goToSlide(i)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === currentSlide
                    ? 'bg-primary'
                    : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                }`}
                title={`投影片 ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </ErrorBoundaryWrapper>
  );
}
