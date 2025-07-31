// ABOUTME: 投影片導航和縮放控制 Hook
// ABOUTME: 提供完整的投影片導航、縮放和鍵盤快捷鍵功能

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  SlideNavigationControls,
  SlideZoomControls,
  SlidePreviewState,
  ZOOM_LEVELS,
  ZoomLevel,
} from '@/types/slidePreview';

export interface UseSlideControlsOptions {
  /** 總投影片數 */
  totalSlides: number;
  /** 初始投影片索引 */
  initialSlide?: number;
  /** 初始縮放級別 */
  initialZoom?: ZoomLevel;
  /** 是否啟用鍵盤快捷鍵 */
  enableKeyboardShortcuts?: boolean;
  /** 投影片變更回調 */
  onSlideChange?: (index: number) => void;
  /** 縮放變更回調 */
  onZoomChange?: (level: number) => void;
  /** 全螢幕切換回調 */
  onFullscreenToggle?: (isFullscreen: boolean) => void;
}

export interface UseSlideControlsReturn {
  /** 當前狀態 */
  state: SlidePreviewState;
  /** 導航控制 */
  navigation: SlideNavigationControls;
  /** 縮放控制 */
  zoom: SlideZoomControls;
  /** 切換縮圖面板 */
  toggleThumbnails: () => void;
  /** 切換全螢幕 */
  toggleFullscreen: () => void;
  /** 設定縮圖面板寬度 */
  setThumbnailPanelWidth: (width: number) => void;
}

export function useSlideControls(
  options: UseSlideControlsOptions
): UseSlideControlsReturn {
  const {
    totalSlides,
    initialSlide = 0,
    initialZoom = 0.5,
    enableKeyboardShortcuts = true,
    onSlideChange,
    onZoomChange,
    onFullscreenToggle,
  } = options;

  // 狀態管理
  const [state, setState] = useState<SlidePreviewState>({
    currentSlide: Math.max(0, Math.min(initialSlide, totalSlides - 1)),
    totalSlides,
    zoomLevel: initialZoom,
    showThumbnails: true,
    isFullscreen: false,
    thumbnailPanelWidth: 200,
  });

  const stateRef = useRef(state);
  stateRef.current = state;

  // 投影片導航控制
  const navigation: SlideNavigationControls = {
    goToPrevious: useCallback(() => {
      const newIndex = Math.max(0, state.currentSlide - 1);
      if (newIndex !== state.currentSlide) {
        setState(prev => ({ ...prev, currentSlide: newIndex }));
        onSlideChange?.(newIndex);
      }
    }, [state.currentSlide, onSlideChange]),

    goToNext: useCallback(() => {
      const newIndex = Math.min(totalSlides - 1, state.currentSlide + 1);
      if (newIndex !== state.currentSlide) {
        setState(prev => ({ ...prev, currentSlide: newIndex }));
        onSlideChange?.(newIndex);
      }
    }, [state.currentSlide, totalSlides, onSlideChange]),

    goToFirst: useCallback(() => {
      if (state.currentSlide !== 0) {
        setState(prev => ({ ...prev, currentSlide: 0 }));
        onSlideChange?.(0);
      }
    }, [state.currentSlide, onSlideChange]),

    goToLast: useCallback(() => {
      const lastIndex = totalSlides - 1;
      if (state.currentSlide !== lastIndex) {
        setState(prev => ({ ...prev, currentSlide: lastIndex }));
        onSlideChange?.(lastIndex);
      }
    }, [state.currentSlide, totalSlides, onSlideChange]),

    goToSlide: useCallback((index: number) => {
      const clampedIndex = Math.max(0, Math.min(index, totalSlides - 1));
      if (clampedIndex !== state.currentSlide) {
        setState(prev => ({ ...prev, currentSlide: clampedIndex }));
        onSlideChange?.(clampedIndex);
      }
    }, [state.currentSlide, totalSlides, onSlideChange]),

    canGoPrevious: state.currentSlide > 0,
    canGoNext: state.currentSlide < totalSlides - 1,
  };

  // 縮放控制
  const zoom: SlideZoomControls = {
    zoomIn: useCallback(() => {
      const currentIndex = ZOOM_LEVELS.indexOf(state.zoomLevel as ZoomLevel);
      const nextIndex = Math.min(currentIndex + 1, ZOOM_LEVELS.length - 1);
      const newZoom = ZOOM_LEVELS[nextIndex];
      
      setState(prev => ({ ...prev, zoomLevel: newZoom }));
      onZoomChange?.(newZoom);
    }, [state.zoomLevel, onZoomChange]),

    zoomOut: useCallback(() => {
      const currentIndex = ZOOM_LEVELS.indexOf(state.zoomLevel as ZoomLevel);
      const prevIndex = Math.max(currentIndex - 1, 0);
      const newZoom = ZOOM_LEVELS[prevIndex];
      
      setState(prev => ({ ...prev, zoomLevel: newZoom }));
      onZoomChange?.(newZoom);
    }, [state.zoomLevel, onZoomChange]),

    resetZoom: useCallback(() => {
      const newZoom = 1;
      setState(prev => ({ ...prev, zoomLevel: newZoom }));
      onZoomChange?.(newZoom);
    }, [onZoomChange]),

    setZoom: useCallback((level: number) => {
      // 找到最接近的縮放級別
      const closestZoom = ZOOM_LEVELS.reduce((prev, curr) => 
        Math.abs(curr - level) < Math.abs(prev - level) ? curr : prev
      );
      
      setState(prev => ({ ...prev, zoomLevel: closestZoom }));
      onZoomChange?.(closestZoom);
    }, [onZoomChange]),

    fitToWindow: useCallback(() => {
      // 這裡可以根據窗口大小計算最適合的縮放級別
      // 暫時設為 1
      const newZoom = 1;
      setState(prev => ({ ...prev, zoomLevel: newZoom }));
      onZoomChange?.(newZoom);
    }, [onZoomChange]),

    currentZoom: state.zoomLevel,
    availableZoomLevels: [...ZOOM_LEVELS],
  };

  // 切換縮圖面板
  const toggleThumbnails = useCallback(() => {
    setState(prev => ({ ...prev, showThumbnails: !prev.showThumbnails }));
  }, []);

  // 切換全螢幕
  const toggleFullscreen = useCallback(() => {
    const newFullscreen = !state.isFullscreen;
    setState(prev => ({ ...prev, isFullscreen: newFullscreen }));
    onFullscreenToggle?.(newFullscreen);
  }, [state.isFullscreen, onFullscreenToggle]);

  // 設定縮圖面板寬度
  const setThumbnailPanelWidth = useCallback((width: number) => {
    setState(prev => ({ ...prev, thumbnailPanelWidth: Math.max(150, Math.min(width, 400)) }));
  }, []);

  // 鍵盤快捷鍵處理
  useEffect(() => {
    if (!enableKeyboardShortcuts) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // 避免在輸入框中觸發快捷鍵
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      const current = stateRef.current;

      switch (event.key) {
        case 'ArrowLeft':
        case 'ArrowUp':
          event.preventDefault();
          navigation.goToPrevious();
          break;

        case 'ArrowRight':
        case 'ArrowDown':
        case ' ': // 空白鍵
          event.preventDefault();
          navigation.goToNext();
          break;

        case 'Home':
          event.preventDefault();
          navigation.goToFirst();
          break;

        case 'End':
          event.preventDefault();
          navigation.goToLast();
          break;

        case 'f':
        case 'F11':
          event.preventDefault();
          toggleFullscreen();
          break;

        case 't':
          event.preventDefault();
          toggleThumbnails();
          break;

        case '+':
        case '=':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            zoom.zoomIn();
          }
          break;

        case '-':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            zoom.zoomOut();
          }
          break;

        case '0':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            zoom.resetZoom();
          }
          break;

        default:
          // 數字鍵 1-9 快速跳轉到對應投影片
          if (event.key >= '1' && event.key <= '9') {
            const slideIndex = parseInt(event.key) - 1;
            if (slideIndex < current.totalSlides) {
              event.preventDefault();
              navigation.goToSlide(slideIndex);
            }
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [enableKeyboardShortcuts, navigation, zoom, toggleFullscreen, toggleThumbnails]);

  // 更新總投影片數時調整當前投影片索引
  useEffect(() => {
    setState(prev => ({
      ...prev,
      totalSlides,
      currentSlide: Math.min(prev.currentSlide, totalSlides - 1),
    }));
  }, [totalSlides]);

  return {
    state,
    navigation,
    zoom,
    toggleThumbnails,
    toggleFullscreen,
    setThumbnailPanelWidth,
  };
}