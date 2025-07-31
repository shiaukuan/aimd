# 元件 API 參考文件

> 📋 **文件目的**：提供所有 React 元件的詳細 API 說明，包括 Props、回調函數和使用範例。

## 📊 預覽元件

### SlidePreview

新的投影片預覽主組件，提供完整的投影片預覽功能，包含縮圖面板、投影片檢視器和控制列。

#### Props

```typescript
interface SlidePreviewProps {
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
```

#### 鍵盤快捷鍵

| 快捷鍵 | 功能 |
|--------|------|
| `←` / `↑` | 上一張投影片 |
| `→` / `↓` / `Space` | 下一張投影片 |
| `Home` | 第一張投影片 |
| `End` | 最後一張投影片 |
| `1-9` | 快速跳轉到對應投影片 |
| `F11` / `F` | 切換全螢幕 |
| `T` | 切換縮圖面板 |
| `Ctrl` + `+` | 放大 |
| `Ctrl` + `-` | 縮小 |
| `Ctrl` + `0` | 重置縮放 |

#### 使用範例

```typescript
<SlidePreview
  renderResult={marpRenderResult}
  initialSlide={0}
  initialZoom={1}
  showThumbnails={true}
  enableKeyboardShortcuts={true}
  onSlideChange={(index) => console.log('投影片變更到:', index)}
  onZoomChange={(level) => console.log('縮放級別:', level)}
  onFullscreenToggle={(isFullscreen) => console.log('全螢幕:', isFullscreen)}
/>
```

### ThumbnailGrid

投影片縮圖網格組件，顯示所有投影片的縮圖並支援點擊導航。

#### Props

```typescript
interface ThumbnailGridProps {
  /** 縮圖資料 */
  thumbnails: SlideThumbnail[];
  /** 當前選中的投影片索引 */
  currentSlide: number;
  /** 點擊縮圖的回調 */
  onThumbnailClick: (index: number) => void;
  /** 縮圖尺寸 */
  thumbnailSize?: { width: number; height: number };
  /** 每行顯示的縮圖數量 */
  itemsPerRow?: number;
  /** 是否顯示投影片編號 */
  showSlideNumbers?: boolean;
  /** CSS 類別名稱 */
  className?: string;
}
```

### SlideViewer

投影片檢視器組件，顯示單一投影片內容並支援縮放。

#### Props

```typescript
interface SlideViewerProps {
  /** 當前投影片的 HTML 內容 */
  slideHtml: string;
  /** 投影片 CSS */
  slideCss: string;
  /** 縮放級別 */
  zoomLevel: number;
  /** 投影片尺寸 */
  slideSize?: { width: number; height: number };
  /** 是否居中顯示 */
  centered?: boolean;
  /** CSS 類別名稱 */
  className?: string;
}
```

### SlideControlBar

投影片控制列組件，提供導航、縮放和其他控制功能。

#### Props

```typescript
interface SlideControlBarProps {
  /** 導航控制 */
  navigation: SlideNavigationControls;
  /** 縮放控制 */
  zoom: SlideZoomControls;
  /** 當前投影片資訊 */
  slideInfo: { current: number; total: number };
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
```

## 📝 編輯器元件

### EditorPanel

主編輯器容器元件，整合所有編輯功能。

#### Props

```typescript
interface EditorPanelProps {
  content?: string; // 可選，初始內容（現在使用全域狀態）
  placeholder?: string; // 預設：'在這裡輸入你的 Markdown 內容...'
  readOnly?: boolean; // 預設：false
  className?: string; // 自訂 CSS 類別
  settings?: Partial<EditorSettings>; // 編輯器設定覆蓋
  callbacks?: EditorCallbacks; // 事件回調函數
}
```

#### 回調函數

```typescript
interface EditorCallbacks {
  onChange?: (content: string, stats: EditorStats) => void;
  onSave?: (content: string) => void;
  onExport?: (content: string, format: string) => void;
  onAction?: (action: EditorAction, data?: any) => void;
  onSelectionChange?: (
    start: number,
    end: number,
    selectedText: string
  ) => void;
  onCursorChange?: (line: number, column: number) => void;
  onError?: (error: Error) => void;
}
```

#### 使用範例

```typescript
<EditorPanel
  placeholder="輸入您的投影片內容..."
  settings={{
    fontSize: 16,
    tabSize: 4,
    theme: 'dark'
  }}
  callbacks={{
    onChange: (content, stats) => {
      console.log(`內容長度: ${stats.characters}`);
    },
    onSave: (content) => {
      console.log('內容已儲存');
    }
  }}
/>
```

### EditorToolbar

編輯器工具列，提供格式化和功能按鈕。

#### Props

```typescript
interface EditorToolbarProps {
  disabled?: boolean; // 是否禁用所有按鈕
  className?: string; // 自訂 CSS 類別
  showFileOperations?: boolean; // 顯示檔案操作（新增、開啟、儲存）
  showFormatting?: boolean; // 顯示格式化按鈕
  showInsertOptions?: boolean; // 顯示插入選項（連結、圖片、表格）
  showViewOptions?: boolean; // 顯示檢視選項
  onAction?: (action: EditorAction, data?: any) => void;
  activeFormats?: EditorAction[]; // 當前啟用的格式
}
```

#### 支援的動作

```typescript
type EditorAction =
  // 檔案操作
  | 'new'
  | 'open'
  | 'save'
  | 'export'
  // 編輯操作
  | 'undo'
  | 'redo'
  // 格式化
  | 'bold'
  | 'italic'
  | 'strikethrough'
  | 'code'
  // 標題
  | 'heading1'
  | 'heading2'
  | 'heading3'
  // 清單
  | 'bulletList'
  | 'numberedList'
  // 區塊
  | 'blockquote'
  | 'codeBlock'
  // 插入
  | 'link'
  | 'image'
  | 'table'
  | 'horizontalRule'
  // 設定
  | 'theme'
  | 'settings';
```

### EditorStatusBar

顯示編輯器統計資訊和狀態。

#### Props

```typescript
interface EditorStatusBarProps {
  stats: EditorStats; // 編輯器統計資訊
  isModified?: boolean; // 是否已修改
  lastSaved?: Date | null; // 上次儲存時間
  className?: string; // 自訂 CSS 類別
  showDetailedStats?: boolean; // 顯示詳細統計
  autoSaveEnabled?: boolean; // 自動儲存是否啟用
  syncStatus?: {
    // 同步狀態
    isSync: boolean;
    lastSyncTime: number | null;
  };
}
```

#### 統計資訊

```typescript
interface EditorStats {
  characters: number; // 總字符數
  charactersNoSpaces: number; // 不含空格字符數
  words: number; // 單字數
  lines: number; // 行數
  selectedText: string; // 選取的文字
  selectedLength: number; // 選取的長度
  cursorLine: number; // 游標行號（從 1 開始）
  cursorColumn: number; // 游標列號（從 1 開始）
}
```

---

## 🖼️ 預覽元件

### PreviewPanel

Marp 投影片預覽面板。

#### Props

```typescript
interface PreviewPanelProps {
  className?: string; // 自訂 CSS 類別
  enableSync?: boolean; // 是否啟用與編輯器同步（預設：true）
  syncDelay?: number; // 同步延遲時間（預設：300ms）
  theme?: string; // Marp 主題名稱（預設：'default'）
  onError?: (error: Error) => void; // 錯誤回調
  onRenderComplete?: (slideCount: number) => void; // 渲染完成回調
}
```

#### 功能特色

- **即時同步**：與編輯器內容自動同步
- **投影片導航**：上一張/下一張按鈕
- **全螢幕模式**：支援全螢幕預覽
- **重新整理功能**：手動重新渲染
- **錯誤處理**：優雅的錯誤顯示

#### 使用範例

```typescript
<PreviewPanel
  enableSync={true}
  syncDelay={500}
  theme="gaia"
  onError={(error) => {
    console.error('預覽錯誤:', error);
  }}
  onRenderComplete={(count) => {
    console.log(`渲染完成，共 ${count} 張投影片`);
  }}
/>
```

---

## 🎨 UI 元件

### ErrorBoundary

React 錯誤邊界元件，捕獲並處理子元件錯誤。

#### Props

```typescript
interface ErrorBoundaryProps {
  children: ReactNode; // 要保護的子元件
  title?: string; // 自訂錯誤標題
  description?: string; // 自訂錯誤描述
  showErrorDetails?: boolean; // 是否顯示錯誤詳情（預設：false）
  maxRetries?: number; // 最大重試次數（預設：3）
  enableAutoRecover?: boolean; // 是否啟用自動恢復（預設：false）
  autoRecoverDelay?: number; // 自動恢復延遲（預設：5000ms）
  onError?: (error: Error, errorInfo: ErrorInfo, errorId: string) => void;
  onRetry?: (retryCount: number) => void;
  fallback?: (error: Error, retry: () => void, goHome: () => void) => ReactNode;
}
```

#### 包裝函數

```typescript
// 便捷的包裝函數
function ErrorBoundaryWrapper({
  children,
  componentName
}: {
  children: ReactNode;
  componentName?: string;
}) {
  return (
    <ErrorBoundary
      title={`${componentName || '元件'} 發生錯誤`}
      showErrorDetails={process.env.NODE_ENV === 'development'}
      maxRetries={3}
      onError={(error, errorInfo, errorId) => {
        console.error(`錯誤 ID: ${errorId}`, error, errorInfo);
      }}
    >
      {children}
    </ErrorBoundary>
  );
}
```

### SplitPanel

可調整大小的分割面板元件。

#### Props

```typescript
interface SplitPanelProps extends SplitPanelOptions {
  children: [React.ReactNode, React.ReactNode]; // 左右兩個面板內容
  className?: string; // 容器 CSS 類別
  leftClassName?: string; // 左面板 CSS 類別
  rightClassName?: string; // 右面板 CSS 類別
  separatorClassName?: string; // 分隔器 CSS 類別
}

interface SplitPanelOptions {
  direction?: 'horizontal' | 'vertical'; // 分割方向（預設：'horizontal'）
  initialSplit?: number; // 初始分割比例（預設：0.5）
  minSplit?: number; // 最小分割比例（預設：0.1）
  maxSplit?: number; // 最大分割比例（預設：0.9）
  disabled?: boolean; // 是否禁用調整（預設：false）
  onSplitChange?: (split: number) => void; // 分割比例變更回調
}
```

#### 使用範例

```typescript
<SplitPanel
  direction="horizontal"
  initialSplit={0.6}
  minSplit={0.3}
  maxSplit={0.8}
  onSplitChange={(split) => {
    console.log(`分割比例: ${split}`);
  }}
>
  <EditorPanel />
  <PreviewPanel />
</SplitPanel>
```

### Button

基礎按鈕元件。

#### Props

```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | 'default'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  asChild?: boolean;
}
```

#### 變體說明

- **default**：主要按鈕樣式
- **destructive**：危險操作按鈕（如刪除）
- **outline**：外框按鈕
- **secondary**：次要按鈕
- **ghost**：透明背景按鈕
- **link**：連結樣式按鈕

#### 使用範例

```typescript
<Button variant="default" size="sm">
  儲存
</Button>

<Button variant="destructive" size="lg">
  刪除
</Button>

<Button variant="ghost" size="icon">
  <SaveIcon />
</Button>
```

---

## 🏗️ 佈局元件

### MainLayout

主要應用佈局。

#### Props

```typescript
interface MainLayoutProps {
  children: React.ReactNode; // 主要內容
  className?: string; // 自訂 CSS 類別
}
```

### Header

應用標題欄。

#### Props

```typescript
interface HeaderProps {
  className?: string; // 自訂 CSS 類別
}
```

---

## 🔄 元件組合範例

### 完整編輯器頁面

```typescript
function EditorPage() {
  return (
    <MainLayout>
      <Header />
      <ErrorBoundaryWrapper componentName="編輯器">
        <SplitPanel
          direction="horizontal"
          initialSplit={0.6}
          minSplit={0.3}
          maxSplit={0.8}
        >
          <EditorPanel
            placeholder="在這裡輸入 Markdown..."
            settings={{
              fontSize: 14,
              tabSize: 2,
              wordWrap: true,
              theme: 'auto'
            }}
            callbacks={{
              onChange: (content, stats) => {
                // 處理內容變更
              },
              onSave: (content) => {
                // 處理儲存
              }
            }}
          />
          <PreviewPanel
            enableSync={true}
            syncDelay={300}
            theme="default"
            onRenderComplete={(slideCount) => {
              console.log(`渲染 ${slideCount} 張投影片`);
            }}
          />
        </SplitPanel>
      </ErrorBoundaryWrapper>
    </MainLayout>
  );
}
```

---

## 📋 最佳實踐

### 錯誤處理

- 所有主要元件都應包裝在 `ErrorBoundaryWrapper` 中
- 使用 `onError` 回調進行錯誤追蹤
- 開發模式下顯示詳細錯誤資訊

### 效能優化

- 使用 `useCallback` 和 `useMemo` 避免不必要的重新渲染
- 編輯器內容使用 debounce 處理
- 大檔案時啟用效能監控

### 無障礙設計

- 所有互動元素都有適當的 ARIA 標籤
- 支援鍵盤導航
- 提供語義化的 HTML 結構

### TypeScript 最佳實踐

- 嚴格的型別檢查
- 使用 `interface` 定義 Props
- 避免 `any` 型別，使用泛型

---

_📅 文件更新日期：2024年_  
_🤖 此文件為 Cursor AI 提供元件使用指導_
