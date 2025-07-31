# 型別定義參考文件

> 📋 **文件目的**：完整的 TypeScript 型別定義參考，包括介面、型別別名和泛型使用指南。

## 📊 型別系統概覽

### 🗂️ 型別檔案結構

```
src/types/
├── editor.ts        # 編輯器專用型別（工具列、統計、動作）
├── marp.ts          # Marp 相關型別（渲染、主題、錯誤）
└── slidePreview.ts  # 投影片預覽型別（預覽狀態、縮圖、導航控制）
```

### 🎯 型別分類

| 分類 | 檔案 | 包含內容 |
|------|------|----------|
| **編輯器型別** | `editor.ts` | 編輯器元件、動作、統計 |
| **Marp 型別** | `marp.ts` | 渲染選項、結果、錯誤 |
| **投影片預覽型別** | `slidePreview.ts` | 預覽狀態、縮圖、導航控制 |

---

## 📝 核心型別定義 (`types/index.ts`)

### 投影片相關型別

```typescript
// 單張投影片
interface Slide {
  id: string;                          // 唯一標識符
  content: string;                     // Markdown 內容
  metadata: SlideMetadata;             // 元資料
  order: number;                       // 順序
}

// 投影片元資料
interface SlideMetadata {
  title?: string;                      // 投影片標題
  theme?: string;                      // 主題名稱
  class?: string;                      // CSS 類別
  paginate?: boolean;                  // 是否顯示頁碼
  backgroundColor?: string;            // 背景顏色
  color?: string;                      // 文字顏色
}

// 投影片集合
interface SlideCollection {
  id: string;                          // 集合 ID
  title: string;                       // 集合標題
  slides: Slide[];                     // 投影片陣列
  createdAt: Date;                     // 建立時間
  updatedAt: Date;                     // 更新時間
  metadata: {
    totalSlides: number;               // 總投影片數
    theme: string;                     // 預設主題
    language: string;                  // 語言設定
  };
}
```

### 編輯器狀態型別

```typescript
// 編輯器狀態
interface EditorState {
  content: string;                     // 編輯器內容
  cursorPosition: number;              // 游標位置
  selectionStart: number;              // 選取開始位置
  selectionEnd: number;                // 選取結束位置
  scrollTop: number;                   // 捲動位置
  isModified: boolean;                 // 是否已修改
  lastSaved: Date | null;              // 上次儲存時間
}

// 編輯器設定
interface EditorSettings {
  fontSize: number;                    // 字體大小 (10-24)
  tabSize: number;                     // Tab 大小 (2-8)
  wordWrap: boolean;                   // 自動換行
  showLineNumbers: boolean;            // 顯示行號
  theme: 'light' | 'dark';             // 主題模式
  autoSave: boolean;                   // 自動儲存
  autoSaveInterval: number;            // 自動儲存間隔 (ms)
}
```

### 預覽狀態型別

```typescript
// 預覽狀態
interface PreviewState {
  currentSlide: number;                // 當前投影片索引
  totalSlides: number;                 // 總投影片數
  zoom: number;                        // 縮放比例
  isFullscreen: boolean;               // 是否全螢幕
  showThumbnails: boolean;             // 顯示縮圖
  isLoading: boolean;                  // 是否載入中
  error: string | null;                // 錯誤訊息
}

// Marp 渲染結果
interface MarpRenderResult {
  html: string;                        // 渲染後的 HTML
  css: string;                         // 相關的 CSS
  slides: {
    content: string;                   // 投影片內容
    notes: string;                     // 投影片備註
  }[];
  comments: string[];                  // 註釋陣列
}
```

### API 相關型別

```typescript
// API 錯誤
interface ApiError {
  error: string;                       // 錯誤訊息
  code: string;                        // 錯誤代碼
  details?: Record<string, unknown>;   // 詳細資訊
}

// API 回應
interface ApiResponse<T> {
  success: boolean;                    // 是否成功
  data?: T;                           // 回應資料
  error?: ApiError;                   // 錯誤資訊
}

// Token 使用量
interface TokenUsage {
  prompt: number;                      // 提示 Token 數
  completion: number;                  // 完成 Token 數
  total: number;                       // 總 Token 數
}
```

### 生成相關型別

```typescript
// 生成請求
interface GenerationRequest {
  topic: string;                       // 主題
  model: 'gpt-4o' | 'gpt-4o-mini';     // 模型
  maxPages: number;                    // 最大頁數 (5-30)
  includeCode: boolean;                // 包含程式碼
  includeImages: boolean;              // 包含圖片
  language: string;                    // 語言
  apiKey: string;                      // API 金鑰
}

// 生成回應
interface GenerationResponse {
  id: string;                          // 生成 ID
  markdown: string;                    // 生成的 Markdown
  tokenUsage: TokenUsage;              // Token 使用量
  createdAt: string;                   // 建立時間
}

// 生成狀態
interface GenerationState {
  isLoading: boolean;                  // 是否載入中
  progress: number;                    // 進度 (0-100)
  status: 'idle' | 'generating' | 'completed' | 'error';
  error: string | null;                // 錯誤訊息
  result: GenerationResponse | null;   // 生成結果
}
```

### 主題相關型別

```typescript
// 主題定義
interface Theme {
  id: string;                          // 主題 ID
  name: string;                        // 主題名稱
  displayName: string;                 // 顯示名稱
  description: string;                 // 主題描述
  preview: string;                     // 預覽圖片 URL
  css: string;                         // CSS 樣式
  variables: Record<string, string>;   // CSS 變數
}

// 主題狀態
interface ThemeState {
  currentTheme: string;                // 當前主題
  availableThemes: Theme[];            // 可用主題
  customThemes: Theme[];               // 自訂主題
}
```

### 工具型別

```typescript
// 可選型別
type Nullable<T> = T | null;
type Optional<T> = T | undefined;

// 載入狀態
type LoadingState = 'idle' | 'loading' | 'success' | 'error';

// 事件型別
interface EditorChangeEvent {
  content: string;                     // 內容
  cursorPosition: number;              // 游標位置
  isModified: boolean;                 // 是否修改
}

interface SlideNavigationEvent {
  slideIndex: number;                  // 投影片索引
  totalSlides: number;                 // 總投影片數
}
```

---

## 🔧 編輯器型別定義 (`types/editor.ts`)

### 編輯器統計

```typescript
// 編輯器統計資訊
interface EditorStats {
  characters: number;                  // 總字符數
  charactersNoSpaces: number;          // 不含空格字符數
  words: number;                       // 單字數
  lines: number;                       // 行數
  selectedText: string;                // 選取的文字
  selectedLength: number;              // 選取的長度
  cursorLine: number;                  // 游標行號 (1-based)
  cursorColumn: number;                // 游標列號 (1-based)
}
```

### 工具列相關型別

```typescript
// 編輯器動作
type EditorAction = 
  // 檔案操作
  | 'new' | 'open' | 'save' | 'export'
  // 編輯操作
  | 'undo' | 'redo'
  // 格式化
  | 'bold' | 'italic' | 'strikethrough' | 'code'
  // 標題
  | 'heading1' | 'heading2' | 'heading3'
  // 清單
  | 'bulletList' | 'numberedList'
  // 區塊
  | 'blockquote' | 'codeBlock'
  // 插入
  | 'link' | 'image' | 'table' | 'horizontalRule'
  // 設定
  | 'theme' | 'settings';

// 工具列按鈕項目
interface ToolbarItem {
  id: string;                          // 按鈕 ID
  label: string;                       // 按鈕標籤
  icon: string;                        // 圖示名稱
  tooltip: string;                     // 提示文字
  action: EditorAction;                // 執行的動作
  shortcut?: string;                   // 快捷鍵
  separator?: boolean;                 // 是否為分隔符
  disabled?: boolean;                  // 是否禁用
}

// 工具列按鈕群組
interface ToolbarGroup {
  id: string;                          // 群組 ID
  label: string;                       // 群組標籤
  items: ToolbarItem[];                // 群組內的按鈕
}
```

### 回調函數型別

```typescript
// 編輯器回調函數
interface EditorCallbacks {
  onChange?: (content: string, stats: EditorStats) => void;
  onSave?: (content: string) => void;
  onExport?: (content: string, format: string) => void;
  onAction?: (action: EditorAction, data?: any) => void;
  onSelectionChange?: (start: number, end: number, selectedText: string) => void;
  onCursorChange?: (line: number, column: number) => void;
  onError?: (error: Error) => void;
}
```

### 元件 Props 型別

```typescript
// 編輯器面板 Props
interface EditorPanelProps {
  content?: string;                    // 初始內容
  placeholder?: string;                // 佔位符文字
  readOnly?: boolean;                  // 是否唯讀
  className?: string;                  // CSS 類別
  settings?: Partial<EditorSettings>;  // 編輯器設定
  callbacks?: EditorCallbacks;         // 回調函數
}

// 工具列 Props
interface EditorToolbarProps {
  disabled?: boolean;                  // 是否禁用
  className?: string;                  // CSS 類別
  showFileOperations?: boolean;        // 顯示檔案操作
  showFormatting?: boolean;            // 顯示格式化
  showInsertOptions?: boolean;         // 顯示插入選項
  showViewOptions?: boolean;           // 顯示檢視選項
  onAction?: (action: EditorAction, data?: any) => void;
  activeFormats?: EditorAction[];      // 啟用的格式
}

// 狀態列 Props
interface EditorStatusBarProps {
  stats: EditorStats;                  // 統計資訊
  isModified?: boolean;                // 是否已修改
  lastSaved?: Date | null;             // 上次儲存時間
  className?: string;                  // CSS 類別
  showDetailedStats?: boolean;         // 顯示詳細統計
  autoSaveEnabled?: boolean;           // 自動儲存啟用
  syncStatus?: {                       // 同步狀態
    isSync: boolean;
    lastSyncTime: number | null;
  };
}
```

### 格式化相關型別

```typescript
// 編輯器格式化選項
interface EditorFormat {
  action: EditorAction;                // 格式化動作
  prefix?: string;                     // 前綴文字
  suffix?: string;                     // 後綴文字
  wrapper?: string;                    // 包裹文字
  block?: boolean;                     // 是否為區塊格式
  multiline?: boolean;                 // 是否支援多行
  placeholder?: string;                // 佔位符
}

// 插入選項
interface EditorInsertOptions {
  link: {
    url: string;                       // 連結 URL
    text: string;                      // 連結文字
  };
  image: {
    url: string;                       // 圖片 URL
    alt: string;                       // 替代文字
    title?: string;                    // 圖片標題
  };
  table: {
    rows: number;                      // 行數
    columns: number;                   // 列數
    headers: boolean;                  // 是否有標題行
  };
}
```

---

## 🎨 Marp 型別定義 (`types/marp.ts`)

### 渲染相關型別

```typescript
// Marp 渲染選項
interface MarpRenderOptions {
  html?: boolean;                      // 啟用 HTML 標籤
  allowUnsafeInlineHtml?: boolean;     // 允許不安全的內聯 HTML
  theme?: string;                      // 主題名稱或 CSS
  math?: boolean;                      // 啟用數學公式
  css?: string;                        // 自訂 CSS
  options?: {                          // Marp 指令配置
    paginate?: boolean;                // 啟用分頁
    size?: [number, number] | string;  // 頁面大小
    orientation?: 'landscape' | 'portrait'; // 頁面方向
  };
}

// Marp 渲染結果
interface MarpRenderResult {
  html: string;                        // 渲染後的 HTML
  css: string;                         // 相關的 CSS 樣式
  slideCount: number;                  // 投影片數量
  slides: MarpSlide[];                 // 投影片內容陣列
  comments: string[];                  // 註釋內容
  timestamp: number;                   // 渲染時間戳
}

// 單張投影片
interface MarpSlide {
  content: string;                     // 投影片 HTML 內容
  notes?: string;                      // 投影片備註
  title?: string;                      // 投影片標題
  class?: string;                      // 投影片類別
  backgroundColor?: string;            // 投影片背景
  color?: string;                      // 投影片文字顏色
}
```

### 主題相關型別

```typescript
// Marp 主題
interface MarpTheme {
  id: string;                          // 主題 ID
  name: string;                        // 主題名稱
  displayName: string;                 // 顯示名稱
  description?: string;                // 主題描述
  css: string;                         // 主題 CSS
  isBuiltIn: boolean;                  // 是否為內建主題
  preview?: string;                    // 預覽圖片 URL
}
```

### 錯誤處理型別

```typescript
// Marp 錯誤
interface MarpError {
  type: 'render' | 'parse' | 'theme' | 'config'; // 錯誤類型
  message: string;                     // 錯誤訊息
  details?: string;                    // 錯誤詳細資訊
  line?: number;                       // 錯誤發生的行號
  column?: number;                     // 錯誤發生的列號
  originalError?: Error;               // 原始錯誤物件
}

// 渲染狀態
type MarpRenderState = 'idle' | 'rendering' | 'success' | 'error';

// 渲染狀態詳情
interface MarpRenderStatus {
  state: MarpRenderState;              // 當前狀態
  isRendering: boolean;                // 是否正在渲染
  error: MarpError | null;             // 錯誤資訊
  lastRenderTime: number | null;       // 上次渲染時間
  renderCount: number;                 // 渲染計數
}
```

### 引擎配置型別

```typescript
// Marp 引擎配置
interface MarpEngineConfig {
  defaultOptions: MarpRenderOptions;   // 預設渲染選項
  themes: MarpTheme[];                 // 可用主題列表
  currentTheme: string;                // 當前主題
  debug?: boolean;                     // 是否啟用除錯模式
}
```

---

## 🖼️ 投影片預覽型別定義 (`types/slidePreview.ts`)

### 縮圖相關型別

```typescript
// 投影片縮圖
interface SlideThumbnail {
  index: number;                           // 投影片索引
  html: string;                            // 縮圖 HTML 內容
  title?: string;                          // 投影片標題
  dimensions: {
    width: number;                         // 縮圖寬度
    height: number;                        // 縮圖高度
  };
  isActive: boolean;                       // 是否為當前選中的投影片
}
```

### 預覽狀態型別

```typescript
// 投影片預覽狀態
interface SlidePreviewState {
  currentSlide: number;                    // 當前投影片索引
  totalSlides: number;                     // 總投影片數
  zoomLevel: number;                       // 縮放級別
  showThumbnails: boolean;                 // 是否顯示縮圖面板
  isFullscreen: boolean;                   // 是否為全螢幕模式
  thumbnailPanelWidth: number;             // 縮圖面板寬度
}
```

### 控制相關型別

```typescript
// 導航控制
interface SlideNavigationControls {
  goToPrevious: () => void;                // 前往上一張投影片
  goToNext: () => void;                    // 前往下一張投影片
  goToFirst: () => void;                   // 前往第一張投影片
  goToLast: () => void;                    // 前往最後一張投影片
  goToSlide: (index: number) => void;      // 前往指定索引的投影片
  canGoPrevious: boolean;                  // 是否可以前往上一張
  canGoNext: boolean;                      // 是否可以前往下一張
}

// 縮放控制
interface SlideZoomControls {
  zoomIn: () => void;                      // 放大
  zoomOut: () => void;                     // 縮小
  resetZoom: () => void;                   // 重置縮放
  setZoom: (level: number) => void;        // 設定縮放級別
  fitToWindow: () => void;                 // 自適應縮放
  currentZoom: number;                     // 當前縮放級別
  availableZoomLevels: number[];           // 可用的縮放級別
}
```

### 組件 Props 型別

```typescript
// 投影片預覽組件 Props
interface SlidePreviewProps {
  renderResult: MarpRenderResult | null;  // 渲染結果
  className?: string;                      // CSS 類別名稱
  initialSlide?: number;                   // 初始投影片索引
  initialZoom?: number;                    // 初始縮放級別
  showThumbnails?: boolean;                // 是否顯示縮圖面板
  thumbnailPanelWidth?: number;            // 縮圖面板寬度
  onSlideChange?: (index: number) => void; // 投影片變更回調
  onZoomChange?: (level: number) => void;  // 縮放變更回調
  onFullscreenToggle?: (isFullscreen: boolean) => void; // 全螢幕切換回調
  onThumbnailToggle?: (show: boolean) => void; // 縮圖面板切換回調
  enableKeyboardShortcuts?: boolean;       // 鍵盤快捷鍵是否啟用
}
```

### 常數定義

```typescript
// 縮放級別類型
type ZoomLevel = 0.25 | 0.5 | 0.75 | 1 | 1.25 | 1.5 | 2;

// 可用縮放級別
const ZOOM_LEVELS: ZoomLevel[] = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2];

// 預設投影片尺寸
const DEFAULT_SLIDE_DIMENSIONS = {
  width: 1280,
  height: 720,
} as const;

// 預設縮圖尺寸
const DEFAULT_THUMBNAIL_SIZE = {
  width: 160,
  height: 90,
} as const;
```

---

## 🔄 泛型型別

### 通用泛型

```typescript
// API 回應泛型
type ApiResponse<T> = {
  success: true;
  data: T;
} | {
  success: false;
  error: ApiError;
};

// 狀態機泛型
interface StateMachine<TState extends string, TEvent extends string> {
  current: TState;
  transition: (event: TEvent) => TState;
  canTransition: (event: TEvent) => boolean;
}

// 事件處理器泛型
type EventHandler<T extends Event = Event> = (event: T) => void;

// 回調函數泛型
type Callback<TArgs extends unknown[] = [], TReturn = void> = 
  (...args: TArgs) => TReturn;
```

### Hook 相關泛型

```typescript
// Hook 選項泛型
interface HookOptions<T> {
  initialValue?: T;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

// Hook 回傳值泛型
interface HookReturn<T, E = Error> {
  data: T | null;
  loading: boolean;
  error: E | null;
  refetch: () => void;
}

// Debounce Hook 泛型
interface DebounceHook<T extends (...args: any[]) => any> {
  debouncedFn: T;
  cancel: () => void;
  flush: () => void;
  pending: boolean;
}
```

---

## 🎯 型別守衛 (Type Guards)

### 基本型別守衛

```typescript
// 檢查是否為字串
function isString(value: unknown): value is string {
  return typeof value === 'string';
}

// 檢查是否為數字
function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value);
}

// 檢查是否為有效的編輯器動作
function isEditorAction(value: string): value is EditorAction {
  const validActions: EditorAction[] = [
    'new', 'open', 'save', 'export',
    'undo', 'redo',
    'bold', 'italic', 'strikethrough',
    // ... 其他動作
  ];
  return validActions.includes(value as EditorAction);
}
```

### 複雜型別守衛

```typescript
// 檢查是否為有效的 Marp 渲染結果
function isMarpRenderResult(value: unknown): value is MarpRenderResult {
  return (
    typeof value === 'object' &&
    value !== null &&
    'html' in value &&
    'css' in value &&
    'slideCount' in value &&
    'slides' in value &&
    Array.isArray((value as any).slides)
  );
}

// 檢查是否為 API 錯誤
function isApiError(value: unknown): value is ApiError {
  return (
    typeof value === 'object' &&
    value !== null &&
    'error' in value &&
    'code' in value &&
    typeof (value as any).error === 'string' &&
    typeof (value as any).code === 'string'
  );
}

// 檢查是否為成功的 API 回應
function isSuccessResponse<T>(
  response: ApiResponse<T>
): response is { success: true; data: T } {
  return response.success === true;
}
```

---

## 🛠️ 工具型別 (Utility Types)

### 自訂工具型別

```typescript
// 深度可選
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// 深度唯讀
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

// 提取函數參數
type ExtractFunctionArgs<T> = T extends (...args: infer A) => any ? A : never;

// 提取函數回傳型別
type ExtractFunctionReturn<T> = T extends (...args: any[]) => infer R ? R : never;

// 條件型別：提取陣列元素型別
type ArrayElement<T> = T extends (infer U)[] ? U : never;

// 建立聯合型別的鍵
type KeysOfUnion<T> = T extends T ? keyof T : never;
```

### 狀態相關工具型別

```typescript
// 從狀態中提取特定部分
type StateSlice<TState, TKeys extends keyof TState> = Pick<TState, TKeys>;

// 狀態更新函數型別
type StateUpdater<T> = (prevState: T) => T;

// 動作創建器型別
type ActionCreator<TPayload = void> = TPayload extends void
  ? () => { type: string }
  : (payload: TPayload) => { type: string; payload: TPayload };

// 選擇器型別
type Selector<TState, TResult> = (state: TState) => TResult;
```

---

## 📋 型別使用最佳實踐

### 1. 介面 vs 型別別名

```typescript
// ✅ 使用 interface 定義物件結構
interface User {
  id: string;
  name: string;
  email: string;
}

// ✅ 使用 type 定義聯合型別、條件型別等
type Status = 'pending' | 'success' | 'error';
type EventHandler = (event: Event) => void;
```

### 2. 泛型使用

```typescript
// ✅ 為泛型提供預設值
interface ApiHook<T = unknown, E = Error> {
  data: T | null;
  error: E | null;
  loading: boolean;
}

// ✅ 使用約束確保型別安全
interface Repository<T extends { id: string }> {
  findById: (id: string) => T | null;
  save: (entity: T) => void;
}
```

### 3. 嚴格模式

```typescript
// ✅ 啟用嚴格的型別檢查
interface StrictEditorState {
  content: string;                     // 必須是字串
  isModified: boolean;                 // 必須是布林值
  lastSaved: Date | null;              // 明確允許 null
}

// ❌ 避免使用 any
const processData = (data: any) => {
  // 類型不安全
};

// ✅ 使用 unknown 並進行型別守衛
const processData = (data: unknown) => {
  if (isString(data)) {
    // 現在 data 的型別是 string
  }
};
```

### 4. 模組化型別定義

```typescript
// ✅ 按功能模組化型別
// types/editor.ts
export interface EditorState { /* ... */ }
export interface EditorActions { /* ... */ }

// types/marp.ts
export interface MarpOptions { /* ... */ }
export interface MarpResult { /* ... */ }

// types/index.ts
export * from './editor';
export * from './marp';
export type { /* 通用型別 */ };
```

---

## 🔗 相關資源

- [TypeScript 官方文件](https://www.typescriptlang.org/docs/)
- [TypeScript 工具型別](https://www.typescriptlang.org/docs/handbook/utility-types.html)
- [進階 TypeScript 模式](../advanced-typescript-patterns.md)
- [型別守衛最佳實踐](../type-guards-best-practices.md)

---

_📅 文件更新日期：2025年7月_  
_🤖 此文件為 Cursor AI 提供型別定義指導_  
_🔄 已新增投影片預覽系統的完整型別定義_