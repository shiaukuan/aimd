# 程式碼架構文件

> 📋 **文件目的**：為 Cursor AI 提供完整的專案結構說明，協助理解現有程式碼並進行後續開發。

## 📊 專案概覽

這是一個基於 **React + TypeScript** 的 **Markdown 投影片編輯器**，使用 **Marp Core** 將 Markdown 轉換為投影片。

### 🏗️ 核心架構

```
src/
├── components/     # React 元件
├── hooks/         # 自定義 React Hook
├── lib/           # 工具函式和核心邏輯
├── store/         # 狀態管理 (Zustand)
├── types/         # TypeScript 型別定義
├── styles/        # 樣式檔案
└── app/           # Next.js 應用路由
```

---

## 🔧 Components 目錄結構

### 📝 Editor 元件 (`src/components/editor/`)

| 檔案                  | 功能描述         | 主要職責                                               |
| --------------------- | ---------------- | ------------------------------------------------------ |
| `EditorPanel.tsx`     | **主編輯器容器** | 整合工具列、編輯區域和狀態列；管理統計計算、格式化操作 |
| `MarkdownEditor.tsx`  | **核心編輯器**   | Markdown 文本編輯、語法高亮、游標管理                  |
| `EditorToolbar.tsx`   | **編輯器工具列** | 格式化按鈕、檔案操作、快捷功能                         |
| `EditorStatusBar.tsx` | **狀態欄**       | 顯示字數、行數、游標位置、儲存狀態                     |

### 🖼️ Preview 元件 (`src/components/preview/`)

| 檔案               | 功能描述           | 主要職責                                           |
| ------------------ | ------------------ | -------------------------------------------------- |
| `PreviewPanel.tsx` | **投影片預覽面板** | 整合 Marp Core，渲染投影片；投影片導航、全螢幕模式 |

### 🎨 UI 元件 (`src/components/ui/`)

| 檔案                | 功能描述           | 主要職責                                |
| ------------------- | ------------------ | --------------------------------------- |
| `ErrorBoundary.tsx` | **錯誤邊界元件**   | 捕獲 React 錯誤，提供恢復機制、錯誤報告 |
| `SplitPanel.tsx`    | **可調整分割面板** | 拖拽調整大小、響應式佈局切換            |
| `button.tsx`        | **按鈕元件**       | 基礎 UI 按鈕，支援不同變體和狀態        |
| `input.tsx`         | **輸入框元件**     | 基礎表單輸入元件                        |
| `textarea.tsx`      | **文本區域元件**   | 多行文本輸入                            |
| `sonner.tsx`        | **通知元件**       | Toast 通知系統                          |

### 🏗️ Layout 元件 (`src/components/layout/`)

| 檔案             | 功能描述       | 主要職責           |
| ---------------- | -------------- | ------------------ |
| `MainLayout.tsx` | **主佈局容器** | 整體頁面佈局結構   |
| `Header.tsx`     | **頁面標題欄** | 應用標題和主要導航 |

---

## 🪝 Hooks 目錄結構

### 核心 Hooks (`src/hooks/`)

| 檔案                 | 功能描述          | 使用場景   | 主要功能                                    |
| -------------------- | ----------------- | ---------- | ------------------------------------------- |
| `useMarpRenderer.ts` | **Marp 渲染管理** | 投影片預覽 | debounced 渲染、錯誤處理、載入狀態          |
| `useAutoSave.ts`     | **自動儲存功能**  | 編輯器     | 定期儲存到 localStorage、手動儲存、狀態監控 |
| `useDebounce.ts`     | **防抖動處理**    | 內容同步   | 延遲觸發函數、避免過度頻繁更新              |
| `useSplitPanel.ts`   | **分割面板邏輯**  | 佈局管理   | 拖拽調整、尺寸計算、響應式處理              |

### Hook 特性說明

#### 🎯 `useMarpRenderer`

```typescript
// 主要功能
- 封裝 Marp Core 渲染邏輯
- 提供 debounced 渲染（預設 300ms 延遲）
- 錯誤處理和重試機制
- 渲染狀態管理（idle/rendering/success/error）

// 回傳值
{
  result: MarpRenderResult | null,
  status: MarpRenderStatus,
  render: (markdown: string) => Promise<void>,
  clear: () => void,
  retry: () => Promise<void>
}
```

#### 💾 `useAutoSave`

```typescript
// 主要功能
- 自動儲存間隔（預設 30 秒）
- localStorage 持久化
- 儲存狀態追蹤
- 內容驗證機制

// 配置選項
{
  interval: number,      // 儲存間隔
  key: string,          // localStorage 鍵名
  immediate: boolean,   // 立即儲存
  validate: function    // 驗證函數
}
```

---

## 📚 Lib 目錄結構

### 核心庫檔案 (`src/lib/`)

| 檔案                 | 功能描述           | 主要用途                                 |
| -------------------- | ------------------ | ---------------------------------------- |
| `marp.ts`            | **Marp 引擎封裝**  | 統一的投影片渲染介面、主題管理、錯誤處理 |
| `editor-settings.ts` | **編輯器設定管理** | 設定持久化、預設值管理、Zod 驗證         |
| `validations.ts`     | **資料驗證**       | Zod schemas、表單驗證、API 請求/回應驗證 |
| `storage.ts`         | **本地儲存工具**   | localStorage 封裝、型別安全、錯誤處理    |
| `utils.ts`           | **通用工具函數**   | 共用的 utility 函數                      |

### 🔍 詳細功能說明

#### 🎯 `marp.ts` - Marp 引擎

```typescript
class MarpEngine {
  // 主要功能
  - render(markdown: string): Promise<MarpRenderResult>
  - setTheme(themeId: string): void
  - addCustomTheme(theme: MarpTheme): void
  - validateMarkdown(markdown: string): ValidationResult

  // 特色功能
  - 內建主題管理
  - 投影片解析
  - 註釋提取
  - 除錯模式支援
}
```

#### ⚙️ `editor-settings.ts` - 設定管理

```typescript
// 支援的設定項目
{
  tabSize: 1-8,                    // Tab 大小
  insertSpaces: boolean,           // 使用空格縮排
  wordWrap: boolean,              // 自動換行
  lineNumbers: boolean,           // 顯示行號
  fontSize: 10-24,                // 字體大小
  autoSave: boolean,              // 自動儲存
  autoSaveInterval: 5000-300000,  // 儲存間隔
  syncDelay: 100-2000,            // 同步延遲
  theme: 'light'|'dark'|'auto'    // 主題模式
}
```

---

## 🏪 Store 目錄結構

### 狀態管理 (`src/store/`)

| 檔案             | 功能描述           | 管理狀態                   |
| ---------------- | ------------------ | -------------------------- |
| `editorStore.ts` | **編輯器全域狀態** | 內容、同步、儲存、錯誤狀態 |

### 📊 EditorStore 狀態結構

```typescript
interface EditorState {
  // 內容狀態
  content: string; // 編輯器內容
  contentLength: number; // 內容長度
  isLargeFile: boolean; // 是否為大檔案（>10K 字符）

  // 同步狀態
  isSync: boolean; // 是否同步中
  lastSyncTime: number; // 上次同步時間
  isSyncing: boolean; // 同步進行中

  // 儲存狀態
  isModified: boolean; // 是否已修改
  lastSaveTime: number; // 上次儲存時間
  autoSaveEnabled: boolean; // 自動儲存開啟

  // 錯誤狀態
  error: string | null; // 錯誤訊息
  hasError: boolean; // 是否有錯誤
}
```

### 🔄 狀態管理操作

```typescript
// 內容操作
setContent(content: string)      // 設定內容
updateContent(content: string)   // 更新內容（觸發修改狀態）
clearContent()                   // 清除內容

// 同步控制
startSyncing()                   // 開始同步
stopSyncing()                    // 停止同步
updateSyncTime()                 // 更新同步時間

// 儲存控制
setSaveStatus(isModified: boolean)  // 設定修改狀態
updateSaveTime()                    // 更新儲存時間
toggleAutoSave()                    // 切換自動儲存

// 錯誤處理
setError(error: string | null)      // 設定錯誤
clearError()                        // 清除錯誤
```

---

## 📋 Types 目錄結構

### 型別定義檔案 (`src/types/`)

| 檔案        | 功能描述           | 定義內容                           |
| ----------- | ------------------ | ---------------------------------- |
| `index.ts`  | **核心型別定義**   | 投影片、編輯器、預覽、API 相關型別 |
| `editor.ts` | **編輯器專用型別** | 工具列、統計、動作、設定型別       |
| `marp.ts`   | **Marp 相關型別**  | 渲染選項、結果、錯誤、主題型別     |

### 🎯 主要型別類別

#### 📊 編輯器相關型別

```typescript
interface EditorStats {
  characters: number; // 字符數
  charactersNoSpaces: number; // 不含空格字符數
  words: number; // 單字數
  lines: number; // 行數
  selectedText: string; // 選取文字
  selectedLength: number; // 選取長度
  cursorLine: number; // 游標行號
  cursorColumn: number; // 游標列號
}

type EditorAction =
  | 'new'
  | 'open'
  | 'save'
  | 'export'
  | 'undo'
  | 'redo'
  | 'bold'
  | 'italic'
  | 'strikethrough'
  | 'heading1'
  | 'heading2'
  | 'heading3'
  | 'bulletList'
  | 'numberedList'
  | 'blockquote'
  | 'codeBlock'
  | 'link'
  | 'image'
  | 'table';
```

#### 🎨 Marp 相關型別

```typescript
interface MarpRenderResult {
  html: string; // 渲染後的 HTML
  css: string; // 相關的 CSS 樣式
  slideCount: number; // 投影片數量
  slides: MarpSlide[]; // 投影片內容陣列
  comments: string[]; // 註釋內容
  timestamp: number; // 渲染時間戳
}

interface MarpError {
  type: 'render' | 'parse' | 'theme' | 'config';
  message: string; // 錯誤訊息
  details?: string; // 錯誤詳細資訊
  line?: number; // 錯誤行號
  column?: number; // 錯誤列號
  originalError?: Error; // 原始錯誤物件
}
```

---

## 🔄 資料流程

### 📝 編輯流程

```
使用者輸入 → EditorPanel → updateContent() → EditorStore
                                    ↓
PreviewPanel ← useMarpRenderer ← useDebounce ← content 變更
```

### 💾 儲存流程

```
內容變更 → useAutoSave → localStorage → updateSaveTime() → EditorStore
```

### 🎨 渲染流程

```
Markdown 內容 → useMarpRenderer → MarpEngine.render() → PreviewPanel
```

---

## 🎯 關鍵設計模式

### 1. **錯誤邊界模式**

- 每個主要元件都包裝在 `ErrorBoundaryWrapper` 中
- 提供優雅的錯誤處理和恢復機制

### 2. **狀態管理模式**

- 使用 Zustand 進行全域狀態管理
- 本地狀態 + 全域狀態的混合模式

### 3. **Hook 組合模式**

- 功能性 Hook 的組合使用
- 如：`useAutoSave` + `useDebounce` + `useEditorStore`

### 4. **類型安全模式**

- 完整的 TypeScript 型別覆蓋
- Zod 執行期驗證

---

## 📖 開發指南

### 🔧 添加新功能

1. **新增編輯器功能**：
   - 在 `EditorAction` 型別中添加新動作
   - 在 `EditorToolbar` 中添加按鈕
   - 在 `EditorPanel` 中實作處理邏輯

2. **新增 Marp 功能**：
   - 在 `MarpEngine` 中添加方法
   - 更新 `MarpRenderOptions` 型別
   - 在 `useMarpRenderer` 中整合

3. **新增 UI 元件**：
   - 在 `components/ui/` 中建立元件
   - 添加對應的測試檔案
   - 更新型別定義

### 🧪 測試策略

- **單元測試**：每個 Hook 和工具函數都有對應測試
- **元件測試**：重要元件有 React Testing Library 測試
- **整合測試**：使用 Playwright 進行 E2E 測試

### 📋 代碼規範

- **檔案命名**：使用 PascalCase（元件）和 camelCase（工具）
- **註解規範**：每個檔案都有 `ABOUTME:` 開頭的說明註解
- **型別優先**：優先使用 TypeScript 型別，避免 `any`
- **錯誤處理**：統一的錯誤處理模式

---

## 🔗 相關文件

- [專案計畫](./plan.md)
- [技術規格](./spec.md)
- [測試設定教學](./testing-setup-tutorial.md)
- [AI 協作指南](./project-architecture-for-ai.md)

---

_📅 文件更新日期：2024年_  
_🤖 此文件為 Cursor AI 提供程式碼理解和開發指導_
