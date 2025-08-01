// ABOUTME: 投影片導航和縮放控制 Hook
// ABOUTME: 提供完整的投影片導航、縮放和鍵盤快捷鍵功能

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  SlideNavigationControls,
  SlidePreviewState,
} from '@/types/slidePreview';

export interface UseSlideControlsOptions {
  /** 總投影片數 */
  totalSlides: number;
  /** 初始投影片索引 */
  initialSlide?: number;
  /** 是否啟用鍵盤快捷鍵 */
  enableKeyboardShortcuts?: boolean;
  /** 投影片變更回調 */
  onSlideChange?: (index: number) => void;
  /** 全螢幕切換回調 */
  onFullscreenToggle?: (isFullscreen: boolean) => void;
}

export interface UseSlideControlsReturn {
  /** 當前狀態 */
  state: SlidePreviewState;
  /** 導航控制 */
  navigation: SlideNavigationControls;
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
    enableKeyboardShortcuts = true,
    onSlideChange,
    onFullscreenToggle,
  } = options;

  // 狀態管理
  const [state, setState] = useState<SlidePreviewState>({
    currentSlide: Math.max(0, Math.min(initialSlide, totalSlides - 1)),
    totalSlides,
    showThumbnails: false,
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

    goToSlide: useCallback(
      (index: number) => {
        const clampedIndex = Math.max(0, Math.min(index, totalSlides - 1));
        if (clampedIndex !== state.currentSlide) {
          setState(prev => ({ ...prev, currentSlide: clampedIndex }));
          onSlideChange?.(clampedIndex);
        }
      },
      [state.currentSlide, totalSlides, onSlideChange]
    ),

    canGoPrevious: state.currentSlide > 0,
    canGoNext: state.currentSlide < totalSlides - 1,
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
    setState(prev => ({
      ...prev,
      thumbnailPanelWidth: Math.max(150, Math.min(width, 400)),
    }));
  }, []);

  // 鍵盤快捷鍵處理
  useEffect(() => {
    if (!enableKeyboardShortcuts) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // 避免在輸入框中觸發快捷鍵
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
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
  }, [enableKeyboardShortcuts, navigation, toggleFullscreen, toggleThumbnails]);

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
    toggleThumbnails,
    toggleFullscreen,
    setThumbnailPanelWidth,
  };
}
