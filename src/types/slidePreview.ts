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
  /** 縮放級別 */
  zoomLevel: number;
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

export interface SlideZoomControls {
  /** 放大 */
  zoomIn: () => void;
  /** 縮小 */
  zoomOut: () => void;
  /** 重置縮放 */
  resetZoom: () => void;
  /** 設定縮放級別 */
  setZoom: (level: number) => void;
  /** 自適應縮放 */
  fitToWindow: () => void;
  /** 當前縮放級別 */
  currentZoom: number;
  /** 可用的縮放級別 */
  availableZoomLevels: number[];
}

export interface SlidePreviewProps {
  /** 渲染結果 */
  renderResult: MarpRenderResult | null;
  /** CSS 類別名稱 */
  className?: string;
  /** 初始投影片索引 */
  initialSlide?: number;
  /** 初始縮放級別 */
  initialZoom?: number;
  /** 是否顯示縮圖面板 */
  showThumbnails?: boolean;
  /** 縮圖面板寬度 */
  thumbnailPanelWidth?: number;
  /** 投影片變更回調 */
  onSlideChange?: (index: number) => void;
  /** 縮放變更回調 */
  onZoomChange?: (level: number) => void;
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
  /** 當前選中的投影片索引 */
  currentSlide: number;
  /** 點擊縮圖的回調 */
  onThumbnailClick: (index: number) => void;
  /** 縮圖尺寸 */
  thumbnailSize?: {
    width: number;
    height: number;
  };
  /** 每行顯示的縮圖數量 */
  itemsPerRow?: number;
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
  /** 縮放級別 */
  zoomLevel: number;
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
  /** 縮放控制 */
  zoom: SlideZoomControls;
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

export type ZoomLevel = 0.25 | 0.5 | 0.75 | 1 | 1.25 | 1.5 | 2;

export const ZOOM_LEVELS: ZoomLevel[] = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2];

export const DEFAULT_SLIDE_DIMENSIONS = {
  width: 1280,
  height: 720,
} as const;

export const DEFAULT_THUMBNAIL_SIZE = {
  width: 160,
  height: 90,
} as const;