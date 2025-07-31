# 狀態管理指南

> 📋 **文件目的**：詳細說明 Zustand 狀態管理架構、使用模式和最佳實踐。

## 📊 狀態管理概覽

### 🏗️ 架構設計

本專案使用 **Zustand** 進行全域狀態管理，採用以下設計原則：

- **單一 Store**：所有編輯器相關狀態集中管理
- **類型安全**：完整的 TypeScript 型別覆蓋
- **不可變更新**：使用 Immer 確保狀態不可變性
- **DevTools 整合**：開發模式下支援 Redux DevTools

### 🗺️ 狀態結構圖

```
EditorStore
├── 📝 內容狀態
│   ├── content: string
│   ├── contentLength: number
│   └── isLargeFile: boolean
├── 🔄 同步狀態
│   ├── isSync: boolean
│   ├── lastSyncTime: number
│   └── isSyncing: boolean
├── 💾 儲存狀態
│   ├── isModified: boolean
│   ├── lastSaveTime: number
│   └── autoSaveEnabled: boolean
└── ❌ 錯誤狀態
    ├── error: string | null
    └── hasError: boolean
```

---

## 🏪 EditorStore 詳細說明

### 狀態介面定義

```typescript
interface EditorState {
  // 內容狀態
  content: string;                     // 編輯器當前內容
  contentLength: number;               // 內容長度（字符數）
  isLargeFile: boolean;               // 是否為大檔案（>10K 字符）
  
  // 同步狀態
  isSync: boolean;                     // 是否與預覽同步
  lastSyncTime: number | null;         // 上次同步時間戳
  isSyncing: boolean;                  // 是否正在同步中
  
  // 儲存狀態
  isModified: boolean;                 // 內容是否已修改
  lastSaveTime: number | null;         // 上次儲存時間戳
  autoSaveEnabled: boolean;            // 自動儲存是否啟用
  
  // 錯誤狀態
  error: string | null;                // 錯誤訊息
  hasError: boolean;                   // 是否有錯誤
}
```

### 動作介面定義

```typescript
interface EditorActions {
  // 內容操作
  setContent: (content: string) => void;
  updateContent: (content: string) => void;
  clearContent: () => void;
  
  // 同步控制
  setSyncStatus: (isSync: boolean) => void;
  startSyncing: () => void;
  stopSyncing: () => void;
  updateSyncTime: () => void;
  
  // 儲存控制
  setSaveStatus: (isModified: boolean) => void;
  updateSaveTime: () => void;
  toggleAutoSave: () => void;
  
  // 錯誤處理
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // 重置操作
  reset: () => void;
}
```

---

## 🔧 Store 實作細節

### 基本 Store 建立

```typescript
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

const useEditorStore = create<EditorState & EditorActions>()(
  devtools(
    (set, get) => ({
      // 初始狀態
      content: '',
      contentLength: 0,
      isLargeFile: false,
      isSync: true,
      lastSyncTime: null,
      isSyncing: false,
      isModified: false,
      lastSaveTime: null,
      autoSaveEnabled: true,
      error: null,
      hasError: false,

      // 動作實作
      setContent: (content) => 
        set((state) => {
          const length = content.length;
          return {
            content,
            contentLength: length,
            isLargeFile: length > 10000,
            isModified: content !== state.content,
          };
        }, false, 'setContent'),

      updateContent: (content) =>
        set((state) => {
          const length = content.length;
          return {
            content,
            contentLength: length,
            isLargeFile: length > 10000,
            isModified: true,
          };
        }, false, 'updateContent'),

      // ... 其他動作
    }),
    {
      name: 'editor-store',
      // 開發模式下啟用 DevTools
      enabled: process.env.NODE_ENV === 'development',
    }
  )
);
```

### 複雜狀態更新

```typescript
// 同步控制相關動作
startSyncing: () =>
  set((state) => ({
    isSyncing: true,
    lastSyncTime: Date.now(),
    error: null,  // 清除之前的錯誤
    hasError: false,
  }), false, 'startSyncing'),

stopSyncing: () =>
  set((state) => ({
    isSyncing: false,
  }), false, 'stopSyncing'),

// 錯誤處理
setError: (error) =>
  set((state) => ({
    error,
    hasError: error !== null,
    isSyncing: false,  // 錯誤時停止同步
  }), false, 'setError'),

// 重置所有狀態
reset: () =>
  set(() => ({
    content: '',
    contentLength: 0,
    isLargeFile: false,
    isSync: true,
    lastSyncTime: null,
    isSyncing: false,
    isModified: false,
    lastSaveTime: null,
    autoSaveEnabled: true,
    error: null,
    hasError: false,
  }), false, 'reset'),
```

---

## 🎯 使用模式

### 1. 基本讀取和更新

```typescript
function EditorComponent() {
  // 選擇性訂閱狀態
  const content = useEditorStore((state) => state.content);
  const isModified = useEditorStore((state) => state.isModified);
  const updateContent = useEditorStore((state) => state.updateContent);

  const handleContentChange = (newContent: string) => {
    updateContent(newContent);
  };

  return (
    <div>
      <textarea
        value={content}
        onChange={(e) => handleContentChange(e.target.value)}
      />
      {isModified && <span>* 未儲存</span>}
    </div>
  );
}
```

### 2. 多狀態組合訂閱

```typescript
function StatusBar() {
  // 組合多個狀態
  const {
    contentLength,
    isLargeFile,
    isModified,
    lastSaveTime,
    autoSaveEnabled
  } = useEditorStore((state) => ({
    contentLength: state.contentLength,
    isLargeFile: state.isLargeFile,
    isModified: state.isModified,
    lastSaveTime: state.lastSaveTime,
    autoSaveEnabled: state.autoSaveEnabled,
  }));

  return (
    <div className="status-bar">
      <span>字符數: {contentLength}</span>
      {isLargeFile && <span className="warning">大檔案</span>}
      {isModified && <span className="modified">未儲存</span>}
      {autoSaveEnabled && lastSaveTime && (
        <span>上次儲存: {new Date(lastSaveTime).toLocaleTimeString()}</span>
      )}
    </div>
  );
}
```

### 3. 條件性狀態訂閱

```typescript
function SyncIndicator() {
  // 只在同步相關狀態變更時重新渲染
  const syncState = useEditorStore(
    (state) => ({
      isSync: state.isSync,
      isSyncing: state.isSyncing,
      lastSyncTime: state.lastSyncTime,
    }),
    // 自訂比較函數（可選）
    (prev, next) =>
      prev.isSync === next.isSync &&
      prev.isSyncing === next.isSyncing &&
      prev.lastSyncTime === next.lastSyncTime
  );

  if (!syncState.isSync) {
    return <span className="sync-disabled">同步已停用</span>;
  }

  return (
    <div className="sync-indicator">
      {syncState.isSyncing ? (
        <span className="syncing">同步中...</span>
      ) : (
        <span className="synced">
          已同步 {syncState.lastSyncTime && 
            formatTime(syncState.lastSyncTime)}
        </span>
      )}
    </div>
  );
}
```

### 4. 動作組合使用

```typescript
function EditorToolbar() {
  const {
    clearContent,
    toggleAutoSave,
    setError,
    clearError,
    reset
  } = useEditorStore((state) => ({
    clearContent: state.clearContent,
    toggleAutoSave: state.toggleAutoSave,
    setError: state.setError,
    clearError: state.clearError,
    reset: state.reset,
  }));

  const handleNewDocument = () => {
    if (confirm('確定要建立新文件嗎？未儲存的內容將會遺失。')) {
      reset(); // 重置所有狀態
    }
  };

  const handleClearContent = () => {
    try {
      clearContent();
      clearError(); // 清除錯誤狀態
    } catch (error) {
      setError('清除內容時發生錯誤');
    }
  };

  return (
    <div className="toolbar">
      <button onClick={handleNewDocument}>新增</button>
      <button onClick={handleClearContent}>清除</button>
      <button onClick={toggleAutoSave}>切換自動儲存</button>
    </div>
  );
}
```

---

## 🎛️ 進階模式

### 1. 自訂 Hook 封裝

```typescript
// 自訂 Hook：編輯器內容管理
function useEditorContent() {
  const content = useEditorStore((state) => state.content);
  const isModified = useEditorStore((state) => state.isModified);
  const updateContent = useEditorStore((state) => state.updateContent);
  const setContent = useEditorStore((state) => state.setContent);

  const setValue = useCallback((value: string, markAsModified = true) => {
    if (markAsModified) {
      updateContent(value);
    } else {
      setContent(value);
    }
  }, [updateContent, setContent]);

  return {
    content,
    isModified,
    setValue,
  };
}

// 使用自訂 Hook
function Editor() {
  const { content, isModified, setValue } = useEditorContent();

  return (
    <textarea
      value={content}
      onChange={(e) => setValue(e.target.value)}
    />
  );
}
```

### 2. 狀態持久化

```typescript
import { persist } from 'zustand/middleware';

const useEditorStore = create<EditorState & EditorActions>()(
  devtools(
    persist(
      (set, get) => ({
        // Store 實作
      }),
      {
        name: 'editor-storage',
        // 選擇要持久化的狀態
        partialize: (state) => ({
          content: state.content,
          autoSaveEnabled: state.autoSaveEnabled,
        }),
        // 版本管理
        version: 1,
        migrate: (persistedState: any, version: number) => {
          if (version === 0) {
            // 從版本 0 遷移到版本 1
            return {
              ...persistedState,
              autoSaveEnabled: true,
            };
          }
          return persistedState;
        },
      }
    ),
    {
      name: 'editor-store',
    }
  )
);
```

### 3. 中間件組合

```typescript
import { subscribeWithSelector } from 'zustand/middleware';

const useEditorStore = create<EditorState & EditorActions>()(
  devtools(
    subscribeWithSelector(
      persist(
        (set, get) => ({
          // Store 實作
        }),
        {
          name: 'editor-storage',
        }
      )
    ),
    {
      name: 'editor-store',
    }
  )
);

// 訂閱特定狀態變更
useEditorStore.subscribe(
  (state) => state.content,
  (content, prevContent) => {
    console.log('內容變更:', prevContent, '->', content);
    // 觸發自動儲存、同步等操作
  }
);
```

### 4. 非同步動作處理

```typescript
// 在 store 中添加非同步動作
const useEditorStore = create<EditorState & EditorActions & AsyncActions>()(
  devtools((set, get) => ({
    // ... 其他狀態和動作

    // 非同步載入內容
    loadContent: async (id: string) => {
      set({ isLoading: true, error: null });
      
      try {
        const content = await fetchContent(id);
        set({
          content,
          contentLength: content.length,
          isLargeFile: content.length > 10000,
          isModified: false,
          isLoading: false,
        });
      } catch (error) {
        set({
          error: error.message,
          hasError: true,
          isLoading: false,
        });
      }
    },

    // 非同步儲存內容
    saveContent: async () => {
      const { content } = get();
      set({ isSaving: true });

      try {
        await saveToServer(content);
        set({
          lastSaveTime: Date.now(),
          isModified: false,
          isSaving: false,
        });
      } catch (error) {
        set({
          error: '儲存失敗: ' + error.message,
          hasError: true,
          isSaving: false,
        });
      }
    },
  }))
);
```

---

## 🔍 除錯和監控

### 1. Redux DevTools 使用

```typescript
// DevTools 動作標籤
set(
  (state) => ({ ...state, content: newContent }),
  false,  // 不替換整個狀態
  'updateContent'  // 動作名稱
);

// 複雜動作的除錯資訊
set(
  (state) => ({ ...state, content: newContent }),
  false,
  {
    type: 'updateContent',
    payload: { length: newContent.length },
  }
);
```

### 2. 狀態監控

```typescript
// 狀態變更日誌
useEditorStore.subscribe(
  (state) => state,
  (state, prevState) => {
    if (process.env.NODE_ENV === 'development') {
      console.group('State Changed');
      console.log('Previous:', prevState);
      console.log('Current:', state);
      console.groupEnd();
    }
  }
);

// 效能監控
useEditorStore.subscribe(
  (state) => state.contentLength,
  (length) => {
    if (length > 50000) {
      console.warn('內容長度過大，可能影響效能:', length);
    }
  }
);
```

### 3. 錯誤追蹤

```typescript
// 統一錯誤處理
const handleError = (error: Error, context: string) => {
  const errorMessage = `${context}: ${error.message}`;
  
  useEditorStore.getState().setError(errorMessage);
  
  // 發送錯誤報告
  if (typeof window !== 'undefined') {
    console.error('Editor Error:', error);
    // 可以整合錯誤追蹤服務
  }
};

// 在組件中使用
function EditorComponent() {
  const updateContent = useEditorStore((state) => state.updateContent);

  const handleContentChange = (content: string) => {
    try {
      updateContent(content);
    } catch (error) {
      handleError(error, '更新內容');
    }
  };

  return (
    // JSX...
  );
}
```

---

## 📋 最佳實踐

### 1. 選擇器優化

```typescript
// ❌ 避免：訂閱整個 store
const store = useEditorStore();

// ✅ 推薦：只訂閱需要的狀態
const content = useEditorStore((state) => state.content);
const isModified = useEditorStore((state) => state.isModified);

// ✅ 推薦：組合相關狀態
const editorState = useEditorStore((state) => ({
  content: state.content,
  isModified: state.isModified,
  lastSaveTime: state.lastSaveTime,
}));
```

### 2. 避免不必要的重新渲染

```typescript
// ✅ 使用 shallow 比較
import { shallow } from 'zustand/shallow';

const editorActions = useEditorStore(
  (state) => ({
    updateContent: state.updateContent,
    setError: state.setError,
    clearError: state.clearError,
  }),
  shallow
);
```

### 3. 狀態結構設計

```typescript
// ✅ 推薦：扁平的狀態結構
interface EditorState {
  content: string;
  isModified: boolean;
  lastSaveTime: number | null;
}

// ❌ 避免：深層嵌套的狀態
interface EditorState {
  editor: {
    content: {
      text: string;
      metadata: {
        isModified: boolean;
        timestamps: {
          lastSave: number | null;
        };
      };
    };
  };
}
```

### 4. 動作命名規範

```typescript
// ✅ 動作使用動詞開頭
updateContent();
setError();
clearContent();
toggleAutoSave();

// ❌ 避免名詞形式
content();
error();
```

### 5. 錯誤狀態管理

```typescript
// ✅ 統一的錯誤狀態結構
interface ErrorState {
  error: string | null;
  hasError: boolean;
}

// ✅ 清除錯誤的時機
const updateContent = (content: string) => {
  set((state) => ({
    content,
    isModified: true,
    error: null,      // 操作成功時清除錯誤
    hasError: false,
  }));
};
```

---

## 📚 相關資源

- [Zustand 官方文件](https://github.com/pmndrs/zustand)
- [TypeScript 最佳實踐](../typescript-best-practices.md)
- [效能優化指南](../performance-optimization.md)
- [測試指南](../testing-guide.md)

---

_📅 文件更新日期：2024年_  
_🤖 此文件為 Cursor AI 提供狀態管理指導_