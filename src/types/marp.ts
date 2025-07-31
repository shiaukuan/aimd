// ABOUTME: Marp 投影片引擎相關型別定義
// ABOUTME: 定義渲染選項、結果、錯誤和主題等核心型別

export interface MarpRenderOptions {
  /** 是否啟用 HTML 標籤 */
  html?: boolean;
  /** 是否允許不安全的內聯 HTML */
  allowUnsafeInlineHtml?: boolean;
  /** 主題名稱或 CSS */
  theme?: string;
  /** 是否啟用數學公式 */
  math?: boolean;
  /** 自訂 CSS */
  css?: string;
  /** Marp 指令配置 */
  options?: {
    /** 是否啟用分頁 */
    paginate?: boolean;
    /** 頁面大小 */
    size?: [number, number] | string;
    /** 頁面方向 */
    orientation?: 'landscape' | 'portrait';
  };
}

export interface MarpRenderResult {
  /** 渲染後的 HTML */
  html: string;
  /** 相關的 CSS 樣式 */
  css: string;
  /** 投影片數量 */
  slideCount: number;
  /** 投影片內容陣列 */
  slides: MarpSlide[];
  /** 註釋內容 */
  comments: string[];
  /** 渲染時間戳 */
  timestamp: number;
}

export interface MarpSlide {
  /** 投影片 HTML 內容 */
  content: string;
  /** 投影片備註 */
  notes?: string;
  /** 投影片標題 */
  title?: string;
  /** 投影片類別 */
  class?: string;
  /** 投影片背景 */
  backgroundColor?: string;
  /** 投影片文字顏色 */
  color?: string;
}

export interface MarpTheme {
  /** 主題 ID */
  id: string;
  /** 主題名稱 */
  name: string;
  /** 顯示名稱 */
  displayName: string;
  /** 主題描述 */
  description?: string;
  /** 主題 CSS */
  css: string;
  /** 是否為內建主題 */
  isBuiltIn: boolean;
  /** 預覽圖片 URL */
  preview?: string;
}

export interface MarpError {
  /** 錯誤類型 */
  type: 'render' | 'parse' | 'theme' | 'config';
  /** 錯誤訊息 */
  message: string;
  /** 錯誤詳細資訊 */
  details?: string;
  /** 錯誤發生的行號 */
  line?: number;
  /** 錯誤發生的列號 */
  column?: number;
  /** 原始錯誤物件 */
  originalError?: Error;
}

export interface MarpEngineConfig {
  /** 預設渲染選項 */
  defaultOptions: MarpRenderOptions;
  /** 可用主題列表 */
  themes: MarpTheme[];
  /** 當前主題 */
  currentTheme: string;
  /** 是否啟用除錯模式 */
  debug?: boolean;
}

export type MarpRenderState = 'idle' | 'rendering' | 'success' | 'error';

export interface MarpRenderStatus {
  /** 當前狀態 */
  state: MarpRenderState;
  /** 是否正在渲染 */
  isRendering: boolean;
  /** 錯誤資訊 */
  error: MarpError | null;
  /** 上次渲染時間 */
  lastRenderTime: number | null;
  /** 渲染計數 */
  renderCount: number;
}