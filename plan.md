# Markdown 投影片產生器 - 詳細實作計劃

## 專案概述

基於 `spec.md` 建立一個網頁應用程式，使用者能透過 Markdown 產生、編輯、預覽並匯出投影片。

**技術棧**: Next.js 15, TypeScript 5, Tailwind CSS v4, shadcn/ui, Marp Core, pptxgenjs

## 實作策略

將專案分解為 26 個小步驟，每個步驟：

- 可在 30-60 分鐘內完成
- 有明確的 UI 測試標準
- 建立在前一步驟之上
- 採用測試驅動開發

---

## Phase 1: 專案基礎建設

### 步驟 1: 初始化 Next.js 15 專案

```
你是一個專業的 Full-stack 開發者，正在開始建立一個 Markdown 投影片產生器專案。

**背景**: 需要建立一個允許使用者透過 Markdown 建立投影片的網頁應用程式。這是專案的第一步 - 建立基礎架構。

**任務**: 初始化 Next.js 15 專案並配置基礎開發環境

**技術要求**:
- 使用 Next.js 15 + TypeScript 5 (strict mode)
- 使用 pnpm 作為套件管理器
- 配置 Tailwind CSS v4
- 設定 ESLint + Prettier 進行程式碼品質控制
- 確保專案使用 Node.js 20 LTS

**實作步驟**:
1. 使用 `create-next-app` 建立 Next.js 15 專案，選擇 TypeScript
2. 配置 `package.json` 使用 pnpm
3. 安裝並配置 Tailwind CSS v4
4. 設定 ESLint 和 Prettier 規則
5. 建立基礎 `.gitignore` 和 `README.md`
6. 確保 `tsconfig.json` 開啟 strict mode

**檔案結構**:
```

/workspace/
├── package.json
├── next.config.js  
├── tailwind.config.js
├── tsconfig.json
├── .eslintrc.json
├── .prettierrc
├── .gitignore
├── README.md
└── src/
├── app/
│ ├── layout.tsx
│ ├── page.tsx
│ └── globals.css
└── components/

```

**測試標準**:
- `pnpm install` 成功安裝所有依賴
- `pnpm dev` 可正常啟動開發伺服器
- 瀏覽器訪問 http://localhost:3000 顯示 Next.js 預設頁面
- Tailwind CSS 樣式正常載入
```

### 步驟 2: 安裝核心依賴套件

````
**背景**: 上一步驟已成功建立 Next.js 15 基礎專案。現在需要安裝專案所需的核心依賴套件。

**任務**: 安裝並配置專案核心依賴套件

**技術要求**:
- 安裝 shadcn/ui 組件系統
- 安裝 Zod 進行 schema 驗證
- 安裝 @marp-team/marp-core 用於投影片渲染
- 安裝 pptxgenjs 用於 PPTX 匯出
- 安裝其他必要的工具套件

**實作步驟**:
1. 安裝 shadcn/ui:
   ```bash
   pnpm dlx shadcn@latest init
````

2. 安裝核心依賴:
   ```bash
   pnpm add zod @marp-team/marp-core pptxgenjs
   pnpm add -D @types/node
   ```
3. 安裝 shadcn/ui 基礎組件:
   ```bash
   pnpm dlx shadcn@latest add button input textarea toast
   ```
4. 建立基礎資料夾結構:
   - `src/lib/` - 工具函數
   - `src/types/` - TypeScript 型別定義
   - `src/components/ui/` - shadcn/ui 組件 (自動建立)

**需要建立的檔案**:

- `src/lib/utils.ts` - 工具函數
- `src/types/index.ts` - 專案型別定義
- `src/lib/validations.ts` - Zod schemas

**測試標準**:

- 所有套件成功安裝，無依賴衝突
- `pnpm build` 可成功編譯專案
- shadcn/ui 組件可正常匯入使用

```

### 步驟 3: 設定測試環境

```

**背景**: 專案基礎架構和依賴已安裝完成。需要建立測試環境以支援測試驅動開發。

**任務**: 配置 Vitest 單元測試和 Playwright E2E 測試環境

**技術要求**:

- 使用 Vitest 進行單元測試和 API 測試
- 使用 Playwright 進行端到端測試
- 採用 Colocation 測試架構 (測試檔案與源檔案同層)
- 配置測試覆蓋率報告
- 建立測試指令和 CI 友好的配置

**實作步驟**:

1. 安裝測試依賴:
   ```bash
   pnpm add -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom
   pnpm add -D playwright @playwright/test
   ```
2. 建立 `vitest.config.ts` (配置 colocation 測試檔案模式)
3. 建立 `playwright.config.ts`
4. 設定測試指令在 `package.json`
5. 建立範例測試檔案 (採用 colocation 同層同檔名方式)

**Colocation 測試方式特點**:

- 測試檔案與源檔案放在同一目錄
- 命名規則：`檔名.test.ts` 或 `檔名.spec.ts`
- 優點：便於維護、易於發現相關測試、減少檔案路徑複雜度

**需要建立的檔案**:

- `vitest.config.ts` - Vitest 配置
- `playwright.config.ts` - Playwright 配置
- `src/lib/utils.test.ts` - 範例單元測試 (colocation)
- `src/components/Button.test.tsx` - 範例組件測試 (colocation)
- `tests/e2e/basic.spec.ts` - 範例 E2E 測試

**測試標準**:

- `pnpm test` 執行單元測試並通過
- `pnpm test:e2e` 執行 E2E 測試並通過
- `pnpm test:coverage` 產生覆蓋率報告

```

---

## Phase 2: 基礎 UI 結構

### 步驟 4: 建立主頁面佈局

```

**背景**: 測試環境已配置完成。現在開始建立使用者介面，首先建立主頁面的基礎佈局。

**任務**: 建立響應式的主頁面佈局，包含 Header 和主要內容區域

**技術要求**:

- 使用 Next.js 15 App Router
- 實作響應式設計（桌機優先，支援平板和手機）
- 使用 Tailwind CSS 進行樣式設計
- 建立可重用的佈局組件

**實作步驟**:

1. 修改 `src/app/page.tsx` 建立主頁面
2. 建立 `src/components/layout/Header.tsx`
3. 建立 `src/components/layout/MainLayout.tsx`
4. 更新 `src/app/globals.css` 加入自訂樣式
5. 實作響應式網格佈局

**需要建立/修改的檔案**:

- `src/app/page.tsx` - 主頁面組件
- `src/components/layout/Header.tsx` - 頁面標題列
- `src/components/layout/MainLayout.tsx` - 主要佈局容器
- `src/app/globals.css` - 全域樣式

**設計要求**:

- Header: 包含專案標題 "Markdown 投影片產生器"
- Main content: 使用 CSS Grid 建立主要內容區域
- 響應式斷點: sm (640px), md (768px), lg (1024px)
- 配色使用 Tailwind 預設調色盤

**測試標準**:

- 頁面在不同螢幕尺寸下正確顯示
- Header 固定在頂部
- 主要內容區域佔滿剩餘空間
- 在手機上佈局不會破版

```

### 步驟 5: 實作分割面板結構

```

**背景**: 主頁面佈局已完成。現在需要建立核心的分割面板結構，讓使用者可以同時看到編輯器和預覽區域。

**任務**: 實作可調整大小的左右分割面板組件

**技術要求**:

- 建立可拖拉調整的分割面板
- 設定最小寬度限制避免面板過小
- 儲存面板大小設定到 localStorage
- 使用 CSS Flexbox 實作響應式佈局

**實作步驟**:

1. 建立 `SplitPanel` 組件與 hook
2. 實作拖拉調整邏輯
3. 加入最小/最大寬度限制
4. 實作 localStorage 持久化
5. 整合到主頁面

**需要建立的檔案**:

- `src/components/ui/SplitPanel.tsx` - 分割面板組件
- `src/hooks/useSplitPanel.ts` - 面板邏輯 hook
- `src/lib/storage.ts` - localStorage 工具函數

**功能要求**:

- 預設左右面板各佔 50% 寬度
- 最小寬度: 300px (左), 400px (右)
- 拖拉分隔線時顯示視覺回饋
- 面板大小設定會自動儲存

**測試標準**:

- 可用滑鼠拖拉中間分隔線調整面板大小
- 面板不會小於最小寬度限制
- 重新整理頁面後面板大小設定保留
- 在手機上自動切換為上下佈局

```

### 步驟 6: 建立編輯器容器

```

**背景**: 分割面板結構已完成。現在建立左側的編輯器容器，為後續的 Markdown 編輯功能做準備。

**任務**: 建立左側編輯器區域的基礎組件和工具列

**技術要求**:

- 建立編輯器容器組件
- 加入基礎工具列（標題、按鈕區域）
- 實作簡單的狀態管理
- 預留 Markdown 編輯器整合空間

**實作步驟**:

1. 建立 `EditorPanel` 組件
2. 建立 `EditorToolbar` 組件
3. 實作基礎狀態管理 (useState)
4. 加入預留的文字輸入區域
5. 整合到分割面板左側

**需要建立的檔案**:

- `src/components/editor/EditorPanel.tsx` - 編輯器面板
- `src/components/editor/EditorToolbar.tsx` - 編輯器工具列
- `src/types/editor.ts` - 編輯器相關型別

**設計要求**:

- 工具列包含: 檔案操作按鈕、文字格式化按鈕
- 主要編輯區域: 暫時使用 textarea 佔位
- 底部狀態列: 顯示字數、行數統計
- 深色/淺色主題支援

**測試標準**:

- 左側顯示完整的編輯器界面
- 工具列按鈕有 hover 效果
- 可在 textarea 中輸入文字
- 狀態列正確顯示統計資訊

```

### 步驟 7: 建立預覽容器

```

**背景**: 編輯器容器已建立完成。現在建立右側的預覽容器，為後續的 Marp 投影片預覽功能做準備。

**任務**: 建立右側預覽區域的基礎組件和控制界面

**技術要求**:

- 建立預覽容器組件
- 加入預覽控制工具列
- 實作載入狀態顯示
- 預留投影片渲染區域

**實作步驟**:

1. 建立 `PreviewPanel` 組件
2. 建立 `PreviewToolbar` 組件
3. 實作載入狀態組件
4. 加入預覽區域佔位符
5. 整合到分割面板右側

**需要建立的檔案**:

- `src/components/preview/PreviewPanel.tsx` - 預覽面板
- `src/components/preview/PreviewToolbar.tsx` - 預覽工具列
- `src/components/ui/LoadingSpinner.tsx` - 載入動畫
- `src/types/preview.ts` - 預覽相關型別

**設計要求**:

- 工具列包含: 縮放控制、全螢幕、匯出按鈕
- 主要預覽區域: 顯示載入動畫或佔位符
- 投影片導航: 頁碼指示和上下頁按鈕
- 錯誤狀態顯示

**測試標準**:

- 右側顯示完整的預覽界面
- 工具列按鈕功能正常（暫時只有 UI）
- 載入動畫正確顯示
- 預覽區域大小隨面板調整

```

---

## Phase 3: Markdown 編輯器實作

### 步驟 8: 實作 Markdown 編輯器

```

**背景**: 基礎 UI 結構已完成。現在實作核心的 Markdown 編輯器功能，提供語法高亮和基礎編輯體驗。

**任務**: 建立具備語法高亮功能的 Markdown 編輯器

**技術要求**:

- 使用 highlight.js 提供 Markdown 語法高亮
- 實作自訂 textarea 組件支援語法著色
- 加入行號顯示
- 確保編輯體驗流暢

**實作步驟**:

1. 安裝 highlight.js:
   ```bash
   pnpm add highlight.js @types/highlight.js
   ```
2. 建立 `MarkdownEditor` 組件
3. 實作語法高亮邏輯
4. 加入行號顯示功能
5. 整合到 `EditorPanel`

**需要建立的檔案**:

- `src/components/editor/MarkdownEditor.tsx` - Markdown 編輯器
- `src/hooks/useMarkdownHighlight.ts` - 語法高亮 hook
- `src/lib/highlight.ts` - highlight.js 配置

**功能要求**:

- 支援 Markdown 語法高亮（標題、粗體、斜體、程式碼等）
- 行號與內容對齊
- 捲軸同步（行號區域與編輯區域）
- 支援 Tab 鍵縮排

**測試標準**:

- 輸入 Markdown 語法時有顏色標示
- 行號正確顯示且與內容對齊
- 捲動時行號與內容同步
- 編輯效能良好，無明顯延遲

```

### 步驟 9: 編輯器增強功能與即時同步機制

```

**背景**: 基礎 Markdown 編輯器已實作完成，Tab/Shift+Tab 縮排功能和 undo/redo 支援 (Ctrl+Z/Ctrl+Y) 已實作。現在完善編輯器功能並建立與預覽區域的即時同步機制。

**任務**: 完善編輯器的進階功能並實作編輯器與預覽區域的即時同步

**技術要求**:

- 實作自動儲存到 localStorage
- 加入編輯器設定選項
- 使用 debounce 避免過度更新
- 建立編輯器與預覽的狀態橋接
- 實作錯誤邊界和錯誤恢復
- 優化效能避免阻塞 UI

**實作步驟**:

1. 建立自動儲存機制
2. 加入編輯器設定管理
3. 建立 `useDebounce` hook
4. 建立全域狀態管理 (Zustand)
5. 實作同步機制
6. 加入錯誤邊界組件
7. 整合到編輯器和預覽組件

**需要建立的檔案**:

- `src/hooks/useAutoSave.ts` - 自動儲存
- `src/lib/editor-settings.ts` - 編輯器設定
- `src/hooks/useDebounce.ts` - debounce hook
- `src/store/editorStore.ts` - Zustand store
- `src/components/ui/ErrorBoundary.tsx` - 錯誤邊界

**功能要求**:

- 每 30 秒自動儲存到 localStorage
- 可設定 Tab 大小、自動換行等選項
- 編輯停止 300ms 後觸發同步
- 錯誤不會中斷整體應用
- 同步狀態有視覺指示
- 支援大檔案編輯（>10K 字符）

**測試標準**:

- 重新整理頁面後內容保留
- 設定變更即時生效
- 編輯內容時預覽區會延遲更新
- 語法錯誤不會導致應用崩潰
- 有同步狀態指示器
- 大檔案編輯時效能良好

```

---

## Phase 4: Marp 預覽實作

### 步驟 10: 整合 Marp Core

```

**背景**: 編輯器與同步機制已完成。現在整合 Marp Core 引擎，實現 Markdown 到投影片的轉換。

**任務**: 整合 Marp Core 引擎，實現 Markdown 投影片渲染

**技術要求**:

- 整合 @marp-team/marp-core
- 實作 Markdown 到 HTML 投影片轉換
- 處理 Marp 特殊語法和指令
- 加入基礎錯誤處理

**實作步驟**:

1. 建立 Marp 引擎封裝
2. 實作渲染函數
3. 處理 Marp 語法解析
4. 加入錯誤處理
5. 整合到預覽組件

**需要建立的檔案**:

- `src/lib/marp.ts` - Marp 引擎封裝
- `src/hooks/useMarpRenderer.ts` - 渲染 hook
- `src/types/marp.ts` - Marp 相關型別

**功能要求**:

- 支援標準 Marp 語法（`---`, `<!-- _class: lead -->`）
- 正確解析投影片分頁
- 處理圖片和程式碼區塊
- 提供渲染錯誤資訊

**測試標準**:

- 輸入基礎 Marp Markdown 可看到投影片
- 支援多張投影片分頁
- 程式碼區塊正確語法高亮
- 錯誤 Markdown 顯示錯誤訊息

```

### 步驟 11: 實作投影片預覽 UI

```

**背景**: Marp 引擎已整合完成。現在建立完整的投影片預覽用戶界面。

**任務**: 建立投影片縮圖、導航和預覽控制功能

**技術要求**:

- 實作投影片縮圖顯示
- 建立投影片導航功能
- 加入縮放控制
- 支援鍵盤和滑鼠操作

**實作步驟**:

1. 建立 `SlidePreview` 組件
2. 實作縮圖生成邏輯
3. 建立導航控制
4. 加入縮放功能
5. 整合到 `PreviewPanel`

**需要建立的檔案**:

- `src/components/preview/SlidePreview.tsx` - 投影片預覽
- `src/components/preview/SlideNavigation.tsx` - 導航控制
- `src/hooks/useSlideNavigation.ts` - 導航邏輯

**功能要求**:

- 左側顯示投影片縮圖列表
- 右側顯示當前投影片大圖
- 點擊縮圖切換投影片
- 縮放控制（25%, 50%, 100%, 150%）

**測試標準**:

- 可看到所有投影片縮圖
- 點擊縮圖可切換到對應投影片
- 縮放功能正常運作
- 當前投影片有高亮顯示

```

### 步驟 12: 加入預覽增強功能

```

**背景**: 基礎投影片預覽功能已完成。現在加入進階功能提升預覽體驗。

**任務**: 實作全螢幕預覽、鍵盤導航和投影片資訊顯示

**技術要求**:

- 實作全螢幕預覽模式
- 加入鍵盤導航支援
- 顯示投影片頁碼和資訊
- 支援演示模式功能

**實作步驟**:

1. 建立全螢幕預覽組件
2. 實作鍵盤事件處理
3. 加入投影片資訊顯示
4. 建立演示模式
5. 更新預覽工具列

**需要建立的檔案**:

- `src/components/preview/FullscreenPreview.tsx` - 全螢幕預覽
- `src/hooks/useKeyboardNavigation.ts` - 鍵盤導航
- `src/components/preview/SlideInfo.tsx` - 投影片資訊

**功能要求**:

- F11 或按鈕進入全螢幕模式
- 方向鍵切換投影片
- 顯示 "第 X 頁 / 共 Y 頁"
- ESC 退出全螢幕

**測試標準**:

- 可正常進入和退出全螢幕
- 方向鍵可切換投影片
- 頁碼資訊正確顯示
- 全螢幕模式下工具列隱藏

```

---

## Phase 5: 後端 API 實作

### 步驟 13: 建立 API 路由結構

```

**背景**: 前端預覽功能已完成。現在開始建立後端 API，為 OpenAI 整合做準備。

**任務**: 建立 Next.js API 路由結構和基礎中間件

**技術要求**:

- 使用 Next.js 15 Route Handlers
- 實作 Zod schema 驗證
- 建立統一的錯誤處理機制
- 加入基礎安全防護

**實作步驟**:

1. 建立 API 路由結構
2. 實作 Zod 驗證中間件
3. 建立錯誤處理系統
4. 加入 CORS 和 Rate Limiting
5. 建立 API 測試

**需要建立的檔案**:

- `src/app/api/v1/slides/route.ts` - 投影片生成 API
- `src/app/api/v1/export/route.ts` - 匯出 API
- `src/lib/api/middleware.ts` - API 中間件
- `src/lib/api/errors.ts` - 錯誤處理
- `src/lib/validations/api.ts` - API 驗證 schemas

**功能要求**:

- `/api/v1/slides` - POST 生成投影片
- `/api/v1/export` - POST 匯出投影片
- 統一的錯誤回應格式
- Rate limiting: 每 IP 每分鐘 5 次請求

**測試標準**:

- 所有 API 端點回應正確的錯誤格式
- 驗證失敗時回傳 400 錯誤
- Rate limiting 正確運作
- API 測試通過

```

### 步驟 14: 實作 OpenAI API 整合

```

**背景**: API 路由結構已建立。現在整合 OpenAI API 以支援內容生成功能。

**任務**: 建立 OpenAI API 客戶端和安全的 API 金鑰處理

**技術要求**:

- 整合 OpenAI SDK
- 實作安全的 API 金鑰驗證
- 加入 Rate Limiting 保護
- 處理 OpenAI API 錯誤

**實作步驟**:

1. 安裝 OpenAI SDK:
   ```bash
   pnpm add openai
   ```
2. 建立 OpenAI 客戶端封裝
3. 實作 API 金鑰驗證
4. 加入錯誤處理和重試
5. 建立測試用的 mock

**需要建立的檔案**:

- `src/lib/openai.ts` - OpenAI 客戶端
- `src/lib/api/auth.ts` - API 金鑰驗證
- `src/lib/api/rate-limit.ts` - Rate limiting
- `src/lib/__tests__/openai.test.ts` - OpenAI 測試

**功能要求**:

- 支援 gpt-4o 和 gpt-4o-mini 模型
- API 金鑰從請求 header 中讀取
- 自動重試失敗的請求（最多 3 次）
- 記錄 token 使用量

**測試標準**:

- 使用有效 API 金鑰可成功呼叫 OpenAI
- 無效 API 金鑰回傳 401 錯誤
- Rate limiting 觸發時回傳 429 錯誤
- Token 使用量正確統計

```

### 步驟 15: 實作 Prompt 範本系統

```

**背景**: OpenAI API 整合已完成。現在建立可配置的 prompt 範本系統。

**任務**: 建立 prompt 範本引擎和變數插值功能

**技術要求**:

- 建立範本引擎支援變數插值
- 實作多語言 prompt 範本
- 加入範本驗證和錯誤處理
- 支援動態範本參數

**實作步驟**:

1. 建立範本引擎
2. 實作變數插值邏輯
3. 建立預設範本庫
4. 加入範本驗證
5. 建立範本測試

**需要建立的檔案**:

- `src/lib/prompt-templates.ts` - 範本引擎
- `src/templates/` - 範本檔案目錄
- `src/templates/default.md` - 預設範本
- `src/lib/__tests__/prompt-templates.test.ts` - 範本測試

**範本變數**:

- `{{topic}}` - 投影片主題
- `{{maxPages}}` - 最大頁數
- `{{includeCode}}` - 是否包含程式碼
- `{{includeImages}}` - 是否包含圖片
- `{{language}}` - 內容語言

**測試標準**:

- 範本可正確插入所有變數
- 缺少變數時顯示錯誤
- 多語言範本正確載入
- 範本驗證捕獲格式錯誤

```

### 步驟 16: 完成投影片生成 API

```

**背景**: Prompt 範本系統已建立。現在完成完整的投影片生成 API 端點。

**任務**: 實作完整的 `/api/v1/slides` 端點，整合所有組件

**技術要求**:

- 整合 OpenAI API、範本系統和驗證
- 實作請求快取機制
- 加入詳細的錯誤處理
- 提供完整的回應資訊

**實作步驟**:

1. 完成 `/api/v1/slides` 端點實作
2. 整合所有子系統
3. 實作 Redis 快取（或記憶體快取）
4. 加入詳細日誌記錄
5. 建立 API 整合測試

**需要建立的檔案**:

- 更新 `src/app/api/v1/slides/route.ts`
- `src/lib/cache.ts` - 快取系統
- `src/lib/logger.ts` - 日誌系統
- `src/lib/__tests__/api.test.ts` - API 整合測試

**API 功能**:

- 完整的請求驗證
- Prompt 生成和 OpenAI 呼叫
- Token 使用統計
- 1 小時 TTL 快取
- 詳細錯誤回應

**測試標準**:

- 完整的生成流程可正常運作
- 快取機制正確運作
- 所有錯誤情況都有適當處理
- API 回應格式符合規格

```

---

## Phase 6: 前端整合

### 步驟 17: 建立主題輸入表單

```

**背景**: 後端 API 已完成。現在建立前端的內容生成功能，首先是主題輸入表單。

**任務**: 建立主題輸入和設定表單，包含驗證和錯誤處理

**技術要求**:

- 使用 shadcn/ui 表單組件
- 實作 Zod 表單驗證
- 加入 API 金鑰輸入和儲存
- 建立直觀的用戶介面

**實作步驟**:

1. 建立表單組件和驗證 schema
2. 實作 API 金鑰管理
3. 加入表單狀態管理
4. 建立錯誤顯示和成功回饋
5. 整合到主頁面

**需要建立的檔案**:

- `src/components/forms/GenerateForm.tsx` - 生成表單
- `src/hooks/useGenerateForm.ts` - 表單邏輯
- `src/lib/validations/form.ts` - 表單驗證
- `src/components/ui/FormField.tsx` - 自訂表單欄位

**表單欄位**:

- 主題輸入（必填，最少 3 字符）
- API 金鑰輸入
- 模型選擇（gpt-4o, gpt-4o-mini）
- 最大頁數（5-30）
- 包含程式碼範例（checkbox）

**測試標準**:

- 所有欄位驗證正確運作
- API 金鑰儲存到 localStorage
- 表單提交前顯示驗證錯誤
- 成功提交時有視覺回饋

```

### 步驟 18: 實作內容生成功能

```

**背景**: 主題輸入表單已完成。現在連接前端表單與後端 API，實現內容生成功能。

**任務**: 實作完整的內容生成流程，包含 API 呼叫和狀態管理

**技術要求**:

- 建立 API 呼叫函數
- 實作載入狀態和進度指示
- 加入錯誤處理和重試機制
- 整合 Toast 通知系統

**實作步驟**:

1. 建立 API 呼叫服務
2. 實作生成狀態管理
3. 加入載入和錯誤狀態 UI
4. 建立重試機制
5. 整合 Toast 通知

**需要建立的檔案**:

- `src/lib/api/client.ts` - API 客戶端
- `src/hooks/useGenerateSlides.ts` - 生成邏輯
- `src/components/ui/Toast.tsx` - Toast 通知
- `src/store/generationStore.ts` - 生成狀態 store

**功能要求**:

- 點擊生成按鈕開始 API 呼叫
- 顯示生成進度和狀態
- 成功時將 Markdown 載入編輯器
- 失敗時顯示錯誤並允許重試

**測試標準**:

- 生成按鈕點擊後正確呼叫 API
- 載入狀態正確顯示
- 生成成功後 Markdown 出現在編輯器
- 錯誤時顯示 Toast 並可重試

```

### 步驟 19: 實作狀態管理

```

**背景**: 內容生成功能已實作。現在建立完整的應用狀態管理系統。

**任務**: 使用 Zustand 建立全域狀態管理，統一管理應用狀態

**技術要求**:

- 安裝並配置 Zustand
- 建立多個狀態 store
- 實作狀態持久化
- 加入狀態同步機制

**實作步驟**:

1. 安裝 Zustand:
   ```bash
   pnpm add zustand
   ```
2. 建立核心 stores
3. 實作 localStorage 持久化
4. 加入狀態同步邏輯
5. 重構現有組件使用 store

**需要建立的檔案**:

- `src/store/index.ts` - Store 統一匯出
- `src/store/editorStore.ts` - 編輯器狀態
- `src/store/previewStore.ts` - 預覽狀態
- `src/store/settingsStore.ts` - 設定狀態

**狀態內容**:

- 編輯器：Markdown 內容、游標位置、選取範圍
- 預覽：當前投影片、縮放比例、全螢幕狀態
- 設定：API 金鑰、主題偏好、編輯器設定
- 生成：生成狀態、token 使用量

**測試標準**:

- 狀態在組件間正確共享
- 重新整理後重要狀態保留
- 狀態變更觸發正確的 UI 更新
- 沒有狀態競爭條件

```

### 步驟 20: 加入用戶體驗增強

```

**背景**: 狀態管理已完成。現在加入各種用戶體驗增強功能。

**任務**: 實作 token 統計、成本預估、重試機制等 UX 功能

**技術要求**:

- 顯示 OpenAI token 使用統計
- 計算和顯示預估成本
- 實作智慧重試機制
- 加入使用提示和幫助

**實作步驟**:

1. 建立 token 統計組件
2. 實作成本計算邏輯
3. 加入重試和錯誤恢復
4. 建立幫助和提示系統
5. 整合到相關 UI 組件

**需要建立的檔案**:

- `src/components/ui/TokenUsage.tsx` - Token 使用顯示
- `src/lib/cost-calculator.ts` - 成本計算
- `src/components/ui/HelpTooltip.tsx` - 幫助提示
- `src/components/ui/RetryButton.tsx` - 重試按鈕

**功能要求**:

- 即時顯示 token 使用量
- 顯示預估成本（USD）
- 網路錯誤時自動重試
- 關鍵功能有幫助提示

**測試標準**:

- Token 統計正確顯示
- 成本計算準確
- 重試機制在錯誤時觸發
- 幫助提示內容清楚

```

---

## Phase 7: 匯出功能

### 步驟 21: 實作 PPTX 匯出 API

```

**背景**: 前端整合已完成。現在實作 PPTX 匯出功能的後端 API。

**任務**: 建立 `/api/v1/export` 端點，支援 Markdown 到 PPTX 轉換

**技術要求**:

- 使用 pptxgenjs 生成 PPTX 檔案
- 整合 Marp 渲染結果
- 處理圖片和程式碼區塊
- 確保檔案正確性

**實作步驟**:

1. 完成 pptxgenjs 整合
2. 實作 Markdown 解析邏輯
3. 建立投影片佈局範本
4. 處理特殊內容類型
5. 實作檔案下載回應

**需要建立的檔案**:

- 更新 `src/app/api/v1/export/route.ts`
- `src/lib/pptx-generator.ts` - PPTX 生成器
- `src/lib/markdown-parser.ts` - Markdown 解析
- `src/templates/slide-layouts.ts` - 投影片佈局

**功能要求**:

- 支援文字、圖片、程式碼區塊
- 保持 Marp 樣式風格
- 正確的檔案 MIME type
- 檔案名稱包含時間戳

**測試標準**:

- API 回傳有效的 PPTX 二進位檔案
- 生成的檔案可用 PowerPoint 開啟
- 所有投影片內容正確轉換
- 檔案下載回應正確

```

### 步驟 22: 實作匯出 UI 功能

```

**背景**: PPTX 匯出 API 已完成。現在建立前端的匯出功能界面。

**任務**: 建立匯出按鈕、進度指示和下載功能

**技術要求**:

- 建立匯出按鈕和選項面板
- 實作下載進度指示
- 處理匯出錯誤情況
- 加入匯出歷史記錄

**實作步驟**:

1. 建立匯出 UI 組件
2. 實作檔案下載邏輯
3. 加入進度和狀態指示
4. 建立錯誤處理
5. 整合到預覽面板

**需要建立的檔案**:

- `src/components/export/ExportButton.tsx` - 匯出按鈕
- `src/components/export/ExportDialog.tsx` - 匯出選項對話框
- `src/hooks/useExport.ts` - 匯出邏輯
- `src/lib/file-download.ts` - 檔案下載工具

**功能要求**:

- 匯出按鈕在工具列中
- 點擊顯示匯出選項對話框
- 顯示匯出進度
- 自動觸發檔案下載

**測試標準**:

- 點擊匯出按鈕開啟選項對話框
- 確認匯出後開始下載
- 進度指示正確顯示
- 錯誤時顯示錯誤訊息

```

### 步驟 23: 加入主題切換功能

```

**背景**: 基礎匯出功能已完成。現在加入主題切換功能，讓使用者可以自訂投影片樣式。

**任務**: 實作主題選擇、預覽和應用功能

**技術要求**:

- 建立預設主題庫
- 實作主題選擇器 UI
- 加入即時主題預覽
- 整合主題到匯出功能

**實作步驟**:

1. 建立主題系統架構
2. 建立預設主題庫
3. 實作主題選擇器
4. 加入即時預覽更新
5. 整合到匯出功能

**需要建立的檔案**:

- `src/lib/themes.ts` - 主題系統
- `src/components/themes/ThemeSelector.tsx` - 主題選擇器
- `src/themes/` - 主題檔案目錄
- `src/themes/default.css` - 預設主題

**預設主題**:

- Default - 簡潔白色主題
- Dark - 深色主題
- Blue - 藍色商務主題
- Green - 綠色自然主題

**測試標準**:

- 可在主題選擇器中切換主題
- 預覽區域即時反映主題變化
- 匯出的 PPTX 應用選定主題
- 主題設定會自動儲存

```

---

## Phase 8: 測試與完善

### 步驟 24: 實作單元測試

```

**背景**: 所有核心功能已實作完成。現在建立完整的測試套件，確保程式碼品質。

**任務**: 建立單元測試覆蓋所有核心功能

**技術要求**:

- 使用 Vitest 建立單元測試
- 測試所有 utility 函數
- Mock 外部 API 呼叫
- 達到 80% 以上的測試覆蓋率

**實作步驟**:

1. 為所有 lib 函數建立測試
2. 測試 API 端點和錯誤處理
3. 建立 React 組件測試
4. Mock OpenAI 和其他外部服務
5. 設定 CI 測試流程

**需要建立的檔案**:

- `src/lib/__tests__/` - 工具函數測試
- `src/components/__tests__/` - 組件測試
- `src/app/api/__tests__/` - API 測試
- `vitest.setup.ts` - 測試設定

**測試重點**:

- Markdown 解析和渲染
- Prompt 範本插值
- API 錯誤處理
- 狀態管理邏輯

**測試標準**:

- 所有測試通過
- 測試覆蓋率 > 80%
- API 測試涵蓋成功和錯誤情況
- 組件測試驗證關鍵用戶互動

```

### 步驟 25: 實作 E2E 測試

```

**背景**: 單元測試已完成。現在建立端到端測試，驗證完整的用戶流程。

**任務**: 使用 Playwright 建立 E2E 測試，涵蓋主要用戶流程

**技術要求**:

- 使用 Playwright 進行 E2E 測試
- 測試跨瀏覽器相容性
- 模擬真實的用戶操作
- 加入視覺回歸測試

**實作步驟**:

1. 設定 Playwright 測試環境
2. 建立核心流程測試
3. 加入錯誤情況測試
4. 設定跨瀏覽器測試
5. 建立 CI 測試流程

**需要建立的檔案**:

- `tests/e2e/` - E2E 測試目錄
- `tests/e2e/generate-slides.spec.ts` - 生成流程測試
- `tests/e2e/edit-preview.spec.ts` - 編輯預覽測試
- `tests/e2e/export.spec.ts` - 匯出功能測試

**測試場景**:

- 完整的生成→編輯→匯出流程
- 錯誤處理（無效 API 金鑰等）
- 響應式佈局測試
- 效能基準測試

**測試標準**:

- 所有主要用戶流程測試通過
- 支援 Chrome, Firefox, Safari
- 測試在 CI 環境中穩定運行
- 效能測試符合規格要求

```

### 步驟 26: 最終優化與文件

```

**背景**: 所有功能和測試已完成。現在進行最終優化和文件完善。

**任務**: 效能優化、無障礙改善、文件完善和部署準備

**技術要求**:

- 進行效能分析和優化
- 確保無障礙功能符合 WCAG AA
- 完成技術文件和使用說明
- 準備生產環境部署

**實作步驟**:

1. 進行效能分析和優化
2. 加入無障礙功能支援
3. 完成 README 和技術文件
4. 建立 Docker 部署配置
5. 設定 CI/CD 流程

**需要建立的檔案**:

- `README.md` - 專案說明
- `DEPLOYMENT.md` - 部署指南
- `Dockerfile` - Docker 配置
- `.github/workflows/ci.yml` - GitHub Actions

**優化重點**:

- Bundle size 優化
- 圖片和資源壓縮
- 快取策略改善
- SEO 和 meta tags

**測試標準**:

- 首頁載入時間 < 1.5s
- 預覽更新延遲 < 300ms
- 無障礙檢測通過 WCAG AA
- 文件清楚完整，易於理解

```

---

## 總結

這個計劃將 Markdown 投影片產生器分解為 26 個可測試的小步驟，每個步驟都：

1. **具體且可測試** - 每步驟都有明確的完成標準
2. **漸進式建構** - 每步驟都建立在前一步驟之上
3. **技術規格清晰** - 包含具體的技術要求和實作細節
4. **用戶可驗證** - 每步驟完成後都可在 UI 上看到進展

透過這種方式，整個專案可以透過一系列focused prompts逐步實現，確保每個環節都經過充分測試和驗證。
```
