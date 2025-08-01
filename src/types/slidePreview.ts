// ABOUTME: 投影片預覽相關型別定義
// ABOUTME: 包含縮圖、導航、縮放控制等功能的型別定義

import { MarpRenderResult } from './marp';

export interface SlideThumbnail {
  /** 投影片索引 */
  index: number;
  /** 縮圖 HTML 內容 */
  html: string;
  /** 投影片標題 */
  title?: string;
  /** 縮圖尺寸 */
  dimensions: {
    width: number;
    height: number;
  };
  /** 是否為當前選中的投影片 */
  isActive: boolean;
}

export interface SlidePreviewState {
  /** 當前投影片索引 */
  currentSlide: number;
  /** 總投影片數 */
  totalSlides: number;
  /** 是否顯示縮圖面板 */
  showThumbnails: boolean;
  /** 是否為全螢幕模式 */
  isFullscreen: boolean;
  /** 縮圖面板寬度 */
  thumbnailPanelWidth: number;
}

export interface SlideNavigationControls {
  /** 前往上一張投影片 */
  goToPrevious: () => void;
  /** 前往下一張投影片 */
  goToNext: () => void;
  /** 前往第一張投影片 */
  goToFirst: () => void;
  /** 前往最後一張投影片 */
  goToLast: () => void;
  /** 前往指定索引的投影片 */
  goToSlide: (index: number) => void;
  /** 是否可以前往上一張 */
  canGoPrevious: boolean;
  /** 是否可以前往下一張 */
  canGoNext: boolean;
}


export interface SlidePreviewProps {
  /** 渲染結果 */
  renderResult: MarpRenderResult | null;
  /** CSS 類別名稱 */
  className?: string;
  /** 初始投影片索引 */
  initialSlide?: number;
  /** 投影片變更回調 */
  onSlideChange?: (index: number) => void;
  /** 全螢幕切換回調 */
  onFullscreenToggle?: (isFullscreen: boolean) => void;
  /** 縮圖面板切換回調 */
  onThumbnailToggle?: (show: boolean) => void;
  /** 鍵盤快捷鍵是否啟用 */
  enableKeyboardShortcuts?: boolean;
}

export interface ThumbnailGridProps {
  /** 縮圖資料 */
  thumbnails: SlideThumbnail[];
  /** 點擊縮圖的回調 */
  onThumbnailClick: (index: number) => void;
  /** 縮圖尺寸 */
  thumbnailSize?: {
    width: number;
    height: number;
  };
  /** 是否顯示投影片編號 */
  showSlideNumbers?: boolean;
  /** CSS 類別名稱 */
  className?: string;
}

export interface SlideViewerProps {
  /** 當前投影片的 HTML 內容 */
  slideHtml: string;
  /** 投影片 CSS */
  slideCss: string;
  /** 投影片尺寸 */
  slideSize?: {
    width: number;
    height: number;
  };
  /** 是否居中顯示 */
  centered?: boolean;
  /** CSS 類別名稱 */
  className?: string;
}

export interface SlideControlBarProps {
  /** 導航控制 */
  navigation: SlideNavigationControls;
  /** 當前投影片資訊 */
  slideInfo: {
    current: number;
    total: number;
  };
  /** 是否顯示縮圖切換按鈕 */
  showThumbnailToggle?: boolean;
  /** 縮圖面板是否顯示 */
  thumbnailsVisible?: boolean;
  /** 縮圖切換回調 */
  onThumbnailToggle?: () => void;
  /** 全螢幕切換回調 */
  onFullscreenToggle?: () => void;
  /** 是否為全螢幕模式 */
  isFullscreen?: boolean;
  /** CSS 類別名稱 */
  className?: string;
}


export const DEFAULT_SLIDE_DIMENSIONS = {
  width: 1280,
  height: 720,
} as const;

export const DEFAULT_THUMBNAIL_SIZE = {
  width: 160,
  height: 90,
} as const;