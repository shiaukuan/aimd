# Hook 使用參考文件

> 📋 **文件目的**：詳細說明所有自定義 Hook 的使用方法、參數配置和最佳實踐。

## 🎯 核心 Hook 概覽

| Hook 名稱               | 主要用途              | 依賴 Hook        | 複雜度 |
| ----------------------- | --------------------- | ---------------- | ------ |
| `useMarpRenderer`       | Marp 投影片渲染       | `useDebounce`    | 🔴 高  |
| `useSlideControls`      | 投影片導航和縮放控制  | 無               | 🟡 中  |
| `useSlideThumbnails`    | 投影片縮圖生成        | 無               | 🟡 中  |
| `useAutoSave`           | 自動儲存功能          | `useEditorStore` | 🟡 中  |
| `useDebounce`           | 防抖動處理            | 無               | 🟢 低  |
| `useSplitPanel`         | 分割面板邏輯          | 無               | 🟡 中  |

---

## 🎨 useMarpRenderer

### 功能說明

封裝 Marp Core 渲染邏輯，提供 debounced 渲染、錯誤處理和狀態管理。

### 基本用法

```typescript
import { useMarpRenderer } from '@/hooks/useMarpRenderer';

function PreviewComponent() {
  const { result, status, render, clear, retry } = useMarpRenderer();

  // 渲染 Markdown
  const handleRender = async () => {
    await render('# 我的投影片\n\n內容...');
  };

  return (
    <div>
      {status === 'rendering' && <div>渲染中...</div>}
      {status === 'error' && (
        <div>
          渲染失敗
          <button onClick={retry}>重試</button>
        </div>
      )}
      {result && (
        <div dangerouslySetInnerHTML={{ __html: result.html }} />
      )}
    </div>
  );
}
```

### 參數配置

```typescript
interface UseMarpRendererOptions {
  debounceDelay?: number; // 渲染延遲時間（預設：300ms）
  autoRender?: boolean; // 是否自動渲染（預設：true）
  defaultRenderOptions?: Partial<MarpRenderOptions>; // 預設渲染選項
  onError?: (error: MarpError) => void; // 錯誤回調
  onRenderComplete?: (result: MarpRenderResult) => void; // 渲染完成回調
  onRenderStart?: () => void; // 渲染開始回調
}
```

### 回傳值

```typescript
interface UseMarpRendererReturn {
  result: MarpRenderResult | null; // 渲染結果
  status: MarpRenderStatus; // 渲染狀態
  render: (
    markdown: string,
    options?: Partial<MarpRenderOptions>
  ) => Promise<void>;
  clear: () => void; // 清除結果
  retry: () => Promise<void>; // 重試上次渲染
  validate: (markdown: string) => { isValid: boolean; errors: MarpError[] };
}
```

### 進階用法

```typescript
function AdvancedPreview() {
  const { result, status, render } = useMarpRenderer(undefined, {
    debounceDelay: 500,                // 延長 debounce 時間
    autoRender: false,                 // 手動控制渲染
    defaultRenderOptions: {
      theme: 'gaia',
      math: true,
      html: true
    },
    onError: (error) => {
      console.error('渲染錯誤:', error);
      // 發送錯誤報告
    },
    onRenderComplete: (result) => {
      console.log(`成功渲染 ${result.slideCount} 張投影片`);
    }
  });

  // 手動觸發渲染，使用自訂選項
  const handleCustomRender = async (markdown: string) => {
    await render(markdown, {
      theme: 'uncover',
      options: {
        paginate: true,
        size: 'A4'
      }
    });
  };

  return (
    // JSX...
  );
}
```

### 狀態說明

```typescript
type MarpRenderState = 'idle' | 'rendering' | 'success' | 'error';

interface MarpRenderStatus {
  state: MarpRenderState; // 當前狀態
  isRendering: boolean; // 是否正在渲染
  error: MarpError | null; // 錯誤資訊
  lastRenderTime: number | null; // 上次渲染時間
  renderCount: number; // 渲染計數
}
```

---

## 🎮 useSlideControls

### 功能說明

提供完整的投影片導航、縮放控制和鍵盤快捷鍵管理，專為 SlidePreview 組件設計。

### 基本用法

```typescript
import { useSlideControls } from '@/hooks/useSlideControls';

function SlideController({ totalSlides }: { totalSlides: number }) {
  const {
    state,
    navigation,
    zoom,
    toggleThumbnails,
    toggleFullscreen,
  } = useSlideControls({
    totalSlides,
    initialSlide: 0,
    initialZoom: 1,
    enableKeyboardShortcuts: true,
  });

  return (
    <div>
      <div>
        投影片 {state.currentSlide + 1} / {state.totalSlides}
        (縮放: {Math.round(state.zoomLevel * 100)}%)
      </div>
      
      <button 
        onClick={navigation.goToPrevious}
        disabled={!navigation.canGoPrevious}
      >
        上一張
      </button>
      
      <button 
        onClick={navigation.goToNext}
        disabled={!navigation.canGoNext}
      >
        下一張
      </button>
      
      <button onClick={zoom.zoomIn}>放大</button>
      <button onClick={zoom.zoomOut}>縮小</button>
      <button onClick={zoom.resetZoom}>重置</button>
      
      <button onClick={toggleThumbnails}>
        {state.showThumbnails ? '隱藏' : '顯示'}縮圖
      </button>
      
      <button onClick={toggleFullscreen}>
        {state.isFullscreen ? '退出' : '進入'}全螢幕
      </button>
    </div>
  );
}
```

### 參數配置

```typescript
interface UseSlideControlsOptions {
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
```

### 返回值結構

```typescript
interface UseSlideControlsReturn {
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
```

### 鍵盤快捷鍵

自動處理以下鍵盤快捷鍵（當 `enableKeyboardShortcuts` 為 true 時）：

- **導航**: `←`, `→`, `↑`, `↓`, `Space`, `Home`, `End`, `1-9`
- **縮放**: `Ctrl+` `+`, `Ctrl+` `-`, `Ctrl+` `0`
- **視圖**: `F11`, `F`, `T`

---

## 🖼️ useSlideThumbnails

### 功能說明

從 Marp 渲染結果生成投影片縮圖，支援自訂尺寸、標題提取和效能優化。

### 基本用法

```typescript
import { useSlideThumbnails } from '@/hooks/useSlideThumbnails';

function ThumbnailPanel({ 
  renderResult, 
  currentSlide 
}: {
  renderResult: MarpRenderResult | null;
  currentSlide: number;
}) {
  const { thumbnails } = useSlideThumbnails(renderResult, currentSlide, {
    thumbnailSize: { width: 200, height: 112 },
    showSlideNumbers: true,
  });

  return (
    <div className="thumbnail-panel">
      {thumbnails.map((thumbnail) => (
        <div
          key={thumbnail.index}
          className={`thumbnail ${thumbnail.isActive ? 'active' : ''}`}
          dangerouslySetInnerHTML={{ __html: thumbnail.html }}
        />
      ))}
    </div>
  );
}
```

### 參數配置

```typescript
interface UseSlideThumbnailsOptions {
  /** 縮圖尺寸 */
  thumbnailSize?: {
    width: number;
    height: number;
  };
  /** 是否啟用縮圖快取 */
  enableCache?: boolean;
  /** 是否顯示投影片編號 */
  showSlideNumbers?: boolean;
}
```

### 返回值結構

```typescript
interface UseSlideThumbnailsReturn {
  /** 縮圖陣列 */
  thumbnails: SlideThumbnail[];
  /** 生成單一縮圖 */
  generateThumbnail: (slideIndex: number) => SlideThumbnail | null;
  /** 更新縮圖尺寸 */
  updateThumbnailSize: (size: { width: number; height: number }) => void;
  /** 清除快取 */
  clearCache: () => void;
}
```

### 縮圖資料結構

```typescript
interface SlideThumbnail {
  /** 投影片索引 */
  index: number;
  /** 縮圖 HTML 內容 */
  html: string;
  /** 投影片標題 */
  title?: string;
  /** 縮圖尺寸 */
  dimensions: { width: number; height: number };
  /** 是否為當前選中的投影片 */
  isActive: boolean;
}
```

---

## 💾 useAutoSave

### 功能說明

提供自動儲存功能，定期將編輯器內容儲存到 localStorage。

### 基本用法

```typescript
import { useAutoSave } from '@/hooks/useAutoSave';

function Editor() {
  const {
    saveNow,
    enableAutoSave,
    disableAutoSave,
    status
  } = useAutoSave();

  return (
    <div>
      <textarea onChange={/* 處理內容變更 */} />

      <div>
        狀態：{status.isEnabled ? '自動儲存已啟用' : '自動儲存已停用'}
        {status.lastSaveTime && (
          <span>上次儲存：{new Date(status.lastSaveTime).toLocaleString()}</span>
        )}
      </div>

      <button onClick={saveNow}>立即儲存</button>
      <button onClick={status.isEnabled ? disableAutoSave : enableAutoSave}>
        {status.isEnabled ? '停用' : '啟用'}自動儲存
      </button>
    </div>
  );
}
```

### 參數配置

```typescript
interface UseAutoSaveOptions {
  interval?: number; // 自動儲存間隔（預設：30000ms）
  key?: string; // localStorage 鍵名
  immediate?: boolean; // 是否立即儲存變更（預設：false）
  validate?: (content: string) => boolean; // 儲存前驗證
  onSave?: (content: string, timestamp: number) => void; // 儲存成功回調
  onError?: (error: Error) => void; // 儲存失敗回調
}
```

### 回傳值

```typescript
interface UseAutoSaveReturn {
  saveNow: () => void; // 立即儲存
  enableAutoSave: () => void; // 啟用自動儲存
  disableAutoSave: () => void; // 停用自動儲存
  status: AutoSaveStatus; // 儲存狀態
  loadSavedContent: () => string | null; // 載入已儲存內容
}

interface AutoSaveStatus {
  isEnabled: boolean; // 是否啟用
  lastSaveTime: number | null; // 上次儲存時間
  nextSaveTime: number | null; // 下次儲存時間
  isSaving: boolean; // 是否正在儲存
  saveCount: number; // 儲存次數
}
```

### 進階用法

```typescript
function AdvancedEditor() {
  const { saveNow, status, loadSavedContent } = useAutoSave({
    interval: 10000,                   // 10 秒自動儲存
    key: 'my-custom-editor-content',   // 自訂儲存鍵名
    immediate: true,                   // 內容變更立即儲存
    validate: (content) => {
      // 只儲存非空內容
      return content.trim().length > 0;
    },
    onSave: (content, timestamp) => {
      console.log(`內容已儲存：${content.length} 字符`);
      // 可以發送到伺服器
    },
    onError: (error) => {
      console.error('儲存失敗:', error);
      // 顯示錯誤提示
    }
  });

  // 元件載入時恢復內容
  useEffect(() => {
    const savedContent = loadSavedContent();
    if (savedContent) {
      // 恢復編輯器內容
    }
  }, []);

  return (
    // JSX...
  );
}
```

---

## ⚡ useDebounce

### 功能說明

延遲觸發函數，避免過度頻繁的更新，主要用於搜尋和同步場景。

### 基本用法

```typescript
import { useDebounce } from '@/hooks/useDebounce';

function SearchInput() {
  const [query, setQuery] = useState('');

  // 延遲 500ms 執行搜尋
  const debouncedSearch = useDebounce((searchQuery: string) => {
    console.log('執行搜尋:', searchQuery);
    // 實際搜尋邏輯
  }, 500);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    debouncedSearch(value);  // 延遲執行
  };

  return (
    <input
      type="text"
      value={query}
      onChange={handleInputChange}
      placeholder="輸入搜尋關鍵字..."
    />
  );
}
```

### 參數配置

```typescript
interface UseDebounceOptions {
  delay?: number; // 延遲時間（預設：300ms）
  leading?: boolean; // 立即執行第一次（預設：false）
  trailing?: boolean; // 延遲後執行（預設：true）
}
```

### 回傳值

```typescript
interface UseDebounceReturn<T> {
  debouncedFn: (...args: Parameters<T>) => void; // debounced 函數
  cancel: () => void; // 取消執行
  flush: () => void; // 立即執行
  pending: boolean; // 是否有待執行的調用
}
```

### 進階用法

```typescript
function AdvancedSync() {
  const [content, setContent] = useState('');

  // Leading edge + Trailing edge
  const debouncedSync = useDebounce((newContent: string) => {
    console.log('同步內容:', newContent);
    // 同步到伺服器
  }, 1000, {
    leading: true,    // 第一次變更立即同步
    trailing: true    // 最後一次變更後延遲同步
  });

  const { debouncedFn, cancel, flush, pending } = debouncedSync;

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    debouncedFn(newContent);
  };

  // 緊急同步
  const handleEmergencySync = () => {
    flush();  // 立即執行待執行的同步
  };

  // 取消同步
  const handleCancelSync = () => {
    cancel();  // 取消待執行的同步
  };

  return (
    <div>
      <textarea
        value={content}
        onChange={(e) => handleContentChange(e.target.value)}
      />

      <div>
        {pending && <span>同步中...</span>}
        <button onClick={handleEmergencySync}>立即同步</button>
        <button onClick={handleCancelSync}>取消同步</button>
      </div>
    </div>
  );
}
```

### 多值 Debounce

```typescript
function useMultiDebounce() {
  // 為不同的值設定不同的 debounce 時間
  const debouncedTitle = useDebounce((title: string) => {
    console.log('更新標題:', title);
  }, 200);

  const debouncedContent = useDebounce((content: string) => {
    console.log('更新內容:', content);
  }, 500);

  const debouncedTags = useDebounce((tags: string[]) => {
    console.log('更新標籤:', tags);
  }, 1000);

  return {
    updateTitle: debouncedTitle,
    updateContent: debouncedContent,
    updateTags: debouncedTags,
  };
}
```

---

## 🔧 useSplitPanel

### 功能說明

管理可調整大小的分割面板，支援水平和垂直分割。

### 基本用法

```typescript
import { useSplitPanel } from '@/hooks/useSplitPanel';

function SplitPanelContainer() {
  const {
    containerRef,
    separatorProps,
    leftPanelStyle,
    rightPanelStyle,
    isDragging
  } = useSplitPanel({
    direction: 'horizontal',
    initialSplit: 0.5
  });

  return (
    <div ref={containerRef} className="split-container">
      <div style={leftPanelStyle} className="left-panel">
        左側內容
      </div>

      <div
        {...separatorProps}
        className={`separator ${isDragging ? 'dragging' : ''}`}
      />

      <div style={rightPanelStyle} className="right-panel">
        右側內容
      </div>
    </div>
  );
}
```

### 參數配置

```typescript
interface SplitPanelOptions {
  direction?: 'horizontal' | 'vertical'; // 分割方向（預設：'horizontal'）
  initialSplit?: number; // 初始分割比例（預設：0.5）
  minSplit?: number; // 最小分割比例（預設：0.1）
  maxSplit?: number; // 最大分割比例（預設：0.9）
  disabled?: boolean; // 是否禁用調整（預設：false）
  onSplitChange?: (split: number) => void; // 分割比例變更回調
  onDragStart?: () => void; // 拖拽開始回調
  onDragEnd?: () => void; // 拖拽結束回調
}
```

### 回傳值

```typescript
interface UseSplitPanelReturn {
  containerRef: RefObject<HTMLDivElement>; // 容器引用
  separatorProps: {
    // 分隔器屬性
    onMouseDown: (e: MouseEvent) => void;
    onTouchStart: (e: TouchEvent) => void;
  };
  leftPanelStyle: CSSProperties; // 左面板樣式
  rightPanelStyle: CSSProperties; // 右面板樣式
  isDragging: boolean; // 是否正在拖拽
  currentSplit: number; // 當前分割比例
  setSplit: (split: number) => void; // 手動設定分割比例
}
```

### 進階用法

```typescript
function ResponsiveSplitPanel() {
  const [direction, setDirection] = useState<'horizontal' | 'vertical'>('horizontal');

  const {
    containerRef,
    separatorProps,
    leftPanelStyle,
    rightPanelStyle,
    isDragging,
    currentSplit,
    setSplit
  } = useSplitPanel({
    direction,
    initialSplit: 0.6,
    minSplit: 0.2,
    maxSplit: 0.8,
    onSplitChange: (split) => {
      // 儲存使用者偏好
      localStorage.setItem('splitRatio', split.toString());
    },
    onDragStart: () => {
      document.body.style.cursor = direction === 'horizontal' ? 'col-resize' : 'row-resize';
    },
    onDragEnd: () => {
      document.body.style.cursor = '';
    }
  });

  // 響應式切換方向
  useEffect(() => {
    const handleResize = () => {
      setDirection(window.innerWidth < 768 ? 'vertical' : 'horizontal');
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 預設分割比例
  const resetSplit = () => setSplit(0.5);

  return (
    <div className="responsive-split-panel">
      <div className="controls">
        <button onClick={resetSplit}>重設</button>
        <span>分割比例: {Math.round(currentSplit * 100)}%</span>
      </div>

      <div ref={containerRef} className={`split-container ${direction}`}>
        <div style={leftPanelStyle}>
          {/* 左側內容 */}
        </div>

        <div
          {...separatorProps}
          className={`separator ${direction} ${isDragging ? 'dragging' : ''}`}
        />

        <div style={rightPanelStyle}>
          {/* 右側內容 */}
        </div>
      </div>
    </div>
  );
}
```

---

## 🔄 Hook 組合模式

### 編輯器 + 預覽組合

```typescript
function EditorWithPreview() {
  const { content, updateContent } = useEditorStore();

  // 自動儲存
  const { saveNow, status: saveStatus } = useAutoSave({
    interval: 30000,
    onSave: (content) => {
      console.log('內容已儲存');
    }
  });

  // Marp 渲染
  const { result, status: renderStatus, render } = useMarpRenderer(undefined, {
    debounceDelay: 300,
    onRenderComplete: (result) => {
      console.log(`渲染完成：${result.slideCount} 張投影片`);
    }
  });

  // 內容變更時觸發渲染
  useEffect(() => {
    if (content) {
      render(content);
    }
  }, [content, render]);

  return (
    <div>
      <div>
        儲存狀態：{saveStatus.isEnabled ? '已啟用' : '已停用'}
        渲染狀態：{renderStatus.state}
      </div>

      {/* 編輯器和預覽 */}
    </div>
  );
}
```

### 響應式分割 + 狀態同步

```typescript
function ResponsiveEditor() {
  const { content } = useEditorStore();

  // 分割面板
  const splitPanel = useSplitPanel({
    direction: 'horizontal',
    initialSplit: 0.6,
    onSplitChange: (split) => {
      localStorage.setItem('editorSplit', split.toString());
    }
  });

  // 防抖內容同步
  const debouncedSync = useDebounce((newContent: string) => {
    // 同步到雲端
    syncToCloud(newContent);
  }, 2000);

  useEffect(() => {
    if (content) {
      debouncedSync(content);
    }
  }, [content, debouncedSync]);

  return (
    <div ref={splitPanel.containerRef} className="editor-container">
      {/* 使用分割面板 */}
    </div>
  );
}
```

---

## 📋 最佳實踐

### 1. 效能優化

```typescript
// ✅ 使用 useCallback 避免不必要的重新渲染
const debouncedSearch = useCallback(
  useDebounce((query: string) => {
    performSearch(query);
  }, 300),
  [
    /* 依賴項 */
  ]
);

// ✅ 使用 useMemo 快取複雜計算
const memoizedOptions = useMemo(
  () => ({
    debounceDelay: 300,
    autoRender: true,
  }),
  []
);

const { result } = useMarpRenderer(undefined, memoizedOptions);
```

### 2. 錯誤處理

```typescript
// ✅ 總是處理 Hook 的錯誤
const { result, status } = useMarpRenderer(undefined, {
  onError: error => {
    console.error('渲染錯誤:', error);
    // 發送錯誤報告
    reportError(error);
  },
});

// ✅ 檢查狀態後再使用結果
if (status.state === 'success' && result) {
  // 安全使用 result
}
```

### 3. 清理資源

```typescript
// ✅ 在 useEffect 中清理資源
useEffect(() => {
  const { cancel } = debouncedFunction;

  return () => {
    cancel(); // 元件卸載時取消 debounce
  };
}, []);
```

### 4. TypeScript 最佳實踐

```typescript
// ✅ 明確的型別定義
const debouncedCallback = useDebounce<(data: MyDataType) => void>(data => {
  processData(data);
}, 500);

// ✅ 使用泛型確保型別安全
interface MyHookOptions<T> {
  onSuccess: (data: T) => void;
  onError: (error: Error) => void;
}
```

---

_📅 文件更新日期：2024年_  
_🤖 此文件為 Cursor AI 提供 Hook 使用指導_
