// ABOUTME: Marp 相關類型定義
// ABOUTME: 定義投影片渲染、錯誤處理和配置相關的 TypeScript 介面

export interface MarpRenderOptions {
  /** 是否啟用 HTML 輸出 */
  html?: boolean;
  /** 是否允許不安全的內聯 HTML */
  allowUnsafeInlineHtml?: boolean;
  /** 是否啟用數學公式 */
  math?: boolean;
  /** 主題名稱 */
  theme?: string;
}

export interface MarpSlide {
  /** 投影片內容 HTML */
  content: string;
  /** 投影片標題 */
  title?: string;
  /** 投影片備註 */
  notes?: string;
  /** CSS 類別 */
  class?: string;
}

export interface MarpRenderResult {
  /** 渲染後的 HTML */
  html: string;
  /** 投影片 CSS 樣式 */
  css: string;
  /** 投影片數量 */
  slideCount: number;
  /** 解析的投影片 */
  slides: MarpSlide[];
  /** 註釋 */
  comments: string[];
  /** 渲染時間戳 */
  timestamp: number;
}

export interface MarpError {
  /** 錯誤類型 */
  type: 'parse' | 'render' | 'config' | 'unknown';
  /** 錯誤訊息 */
  message: string;
  /** 詳細描述 */
  details?: string;
  /** 錯誤行號 */
  line?: number;
  /** 錯誤列號 */
  column?: number;
  /** 原始錯誤物件 */
  originalError?: Error;
}

export interface MarpRenderStatus {
  /** 當前狀態 */
  state: 'idle' | 'rendering' | 'success' | 'error';
  /** 是否正在渲染 */
  isRendering: boolean;
  /** 錯誤資訊 */
  error: MarpError | null;
  /** 上次渲染時間 */
  lastRenderTime: number | null;
  /** 渲染次數 */
  renderCount: number;
}

export interface MarpTheme {
  /** 主題 ID */
  id: string;
  /** 主題名稱 */
  name: string;
  /** 顯示名稱 */
  displayName: string;
  /** 主題描述 */
  description: string;
  /** CSS 樣式 */
  css: string;
  /** 是否為內建主題 */
  isBuiltIn: boolean;
}

export interface MarpEngineConfig {
  /** 預設渲染選項 */
  defaultOptions: MarpRenderOptions;
  /** 可用主題 */
  themes: MarpTheme[];
  /** 當前主題 */
  currentTheme: string;
  /** 除錯模式 */
  debug: boolean;
}