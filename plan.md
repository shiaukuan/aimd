# Markdown 投影片產生器 - 詳細實作計劃

## 專案概述

基於 `spec.md` 建立一個網頁應用程式，使用者能透過 Markdown 產生、編輯、預覽並匯出投影片。

**技術棧**: Next.js 15, TypeScript 5, Tailwind CSS v4, shadcn/ui, Marp Core, pptxgenjs

## 實作策略

將專案分解為 16 個大型功能步驟，每個步驟：

- 一步到位完成獨立功能
- 合併相關的子系統
- 減少重複工作
- 明確的技術規格

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

**實作參考**:

- 請先閱讀 `docs/README.md` 了解專案架構和實作指引
- 參考文件中的程式碼範例和最佳實踐
- 更新 `docs/component-api-reference.md` 記錄新增的組件 API
- 在 `docs/types-reference.md` 中記錄新增的型別定義

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

**實作參考**:

- 請先閱讀 `docs/README.md` 了解專案測試策略和設定方式
- 參考 `docs/testing-setup-tutorial.md` 中的測試環境配置指引
- 更新 `docs/component-api-reference.md` 記錄測試相關的組件和 hooks
- 在專案根目錄的 `README.md` 中更新測試指令說明

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

**實作參考**:

- 請先閱讀 `docs/README.md` 了解專案的佈局設計原則
- 參考 `docs/component-api-reference.md` 中的佈局組件使用方式
- 更新 `docs/project-architecture-for-ai.md` 記錄佈局組件的設計決策
- 在 `docs/README.md` 中更新 UI 組件的使用說明

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

**實作參考**:

- 請先閱讀 `docs/README.md` 了解分割面板的設計規範和互動邏輯
- 參考 `docs/component-api-reference.md` 中關於面板組件的 API 設計
- 更新 `docs/hooks-reference.md` 記錄 `useSplitPanel` hook 的使用方式
- 在 `docs/state-management-guide.md` 中記錄面板狀態的管理方式

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

**實作參考**:

- 請先閱讀 `docs/README.md` 了解編輯器組件的設計架構
- 參考 `docs/component-api-reference.md` 中編輯器相關組件的 API 規範
- 更新 `docs/types-reference.md` 記錄編輯器相關的型別定義
- 在 `docs/state-management-guide.md` 中記錄編輯器狀態管理方式

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

**實作參考**:

- 請先閱讀 `docs/README.md` 了解預覽組件的設計架構和渲染流程
- 參考 `docs/component-api-reference.md` 中預覽相關組件的 API 設計
- 更新 `docs/types-reference.md` 記錄預覽組件的型別定義
- 在 `docs/state-management-guide.md` 中記錄預覽狀態的管理策略

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

**實作參考**:

- 請先閱讀 `docs/README.md` 了解 Markdown 編輯器的實作架構和語法高亮機制
- 參考 `docs/component-api-reference.md` 中編輯器組件的 API 設計
- 更新 `docs/hooks-reference.md` 記錄語法高亮相關的 hooks
- 在 `docs/codebase-architecture.md` 中記錄 highlight.js 的整合方式

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

**實作參考**:

- 請先閱讀 `docs/README.md` 了解編輯器增強功能和同步機制的設計原理
- 參考 `docs/hooks-reference.md` 中關於自動儲存、debounce 等 hooks 的使用方式
- 更新 `docs/state-management-guide.md` 記錄全域狀態管理的實作細節
- 在 `docs/component-api-reference.md` 中記錄錯誤邊界組件的 API

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

**實作參考**:

- 請先閱讀 `docs/README.md` 了解 Marp 引擎的整合方式和渲染流程
- 參考 `docs/component-api-reference.md` 中關於 Marp 相關組件的 API 設計
- 更新 `docs/types-reference.md` 記錄 Marp 相關的型別定義
- 在 `docs/codebase-architecture.md` 中記錄 Marp Core 的整合架構

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

**實作參考**:

- 請先閱讀 `docs/README.md` 了解投影片預覽組件的設計架構
- 參考 `docs/component-api-reference.md` 中預覽和導航組件的 API 規範
- 更新 `docs/hooks-reference.md` 記錄投影片導航相關的 hooks
- 在 `docs/state-management-guide.md` 中記錄投影片狀態管理方式

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

**實作參考**:

- 請先閱讀 `docs/README.md` 了解全螢幕預覽和鍵盤導航的實作方式
- 參考 `docs/hooks-reference.md` 中關於鍵盤事件處理的 hooks 使用方式
- 更新 `docs/component-api-reference.md` 記錄全螢幕和導航組件的 API
- 在 `docs/project-architecture-for-ai.md` 中記錄演示模式的設計決策

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

## Phase 5: 後端 API 與內容生成

### 步驟 13: 實作完整的投影片生成 API 系統

```

**背景**: 前端預覽功能已完成。現在建立完整的後端 API 系統，包含 OpenAI 整合、範本系統和投影片生成功能。

**任務**: 一次性實作完整的投影片生成後端系統，包含 API 路由、OpenAI 整合、範本引擎和快取機制

**技術要求**:

- 建立 Next.js 15 Route Handlers 完整架構
- 整合 OpenAI SDK 與安全的 API 金鑰處理
- 實作 Prompt 範本引擎和變數插值功能
- 建立 Zod schema 驗證和統一錯誤處理
- 實作請求快取和 Rate Limiting
- 完整的測試覆蓋

**實作步驟**:

1. 安裝相關依賴:
   ```bash
   pnpm add openai
   ```
2. 建立 API 路由結構 (`/api/v1/slides`)
3. 實作 OpenAI 客戶端封裝和錯誤處理
4. 建立 Prompt 範本引擎支援變數插值
5. 實作 Zod 驗證中間件和統一錯誤格式
6. 加入 Rate Limiting 和請求快取機制
7. 建立完整的 API 測試套件

**實作參考**:

- 請先閱讀 `docs/README.md` 了解完整的 API 架構和投影片生成流程
- 參考 `docs/project-architecture-for-ai.md` 中關於 OpenAI 整合和安全考量的指導原則
- 更新 `docs/types-reference.md` 記錄所有 API 相關的型別定義
- 在 `docs/codebase-architecture.md` 中記錄完整的後端架構設計

**核心功能**:

- `/api/v1/slides` POST 端點支援完整的投影片生成流程
- 支援 gpt-4o 和 gpt-4o-mini 模型
- Prompt 範本變數插值: `{{topic}}`, `{{maxPages}}`, `{{includeCode}}`, `{{includeImages}}`, `{{language}}`
- API 金鑰從 request header 安全讀取，不儲存於後端
- 自動重試機制（最多 3 次）和詳細的錯誤處理
- SHA-256 hash 快取機制，TTL 1 小時
- Rate limiting: 每 IP 每分鐘 5 次請求
- Token 使用統計和成本追蹤

**測試標準**:

- 完整的生成流程測試：主題輸入 → OpenAI 呼叫 → Markdown 回傳
- 所有錯誤情況測試：無效 API 金鑰、Rate limiting、OpenAI 錯誤等
- Prompt 範本測試：變數插值正確、缺少變數錯誤處理
- 快取機制測試：相同請求回傳快取結果
- API 契約測試：Zod schema 驗證、回應格式符合規格
- Token 統計準確性測試

```

### 步驟 14: 實作完整的前端內容生成與狀態管理系統

```

**背景**: 後端 API 系統已完成。現在建立完整的前端內容生成系統，包含表單、API 整合、狀態管理和用戶體驗功能。

**任務**: 一次性實作完整的前端內容生成功能，包含主題輸入表單、API 呼叫、Zustand 狀態管理、Token 統計和用戶體驗增強

**技術要求**:

- 建立完整的主題輸入表單與 Zod 驗證
- 實作前端 API 呼叫服務與錯誤處理
- 建立 Zustand 全域狀態管理系統
- 整合 Toast 通知和載入狀態 UI
- 實作 Token 統計、成本預估和用戶體驗功能
- 完整的前端測試覆蓋

**實作步驟**:

1. 安裝相關依賴:
   ```bash
   pnpm add zustand
   ```
2. 建立主題輸入表單組件與 Zod 驗證 schema
3. 實作 API 呼叫服務與錯誤處理機制
4. 建立 Zustand stores（編輯器、預覽、設定、生成狀態）
5. 實作載入狀態、進度指示和 Toast 通知系統
6. 建立 Token 統計組件和成本計算邏輯
7. 加入重試機制和用戶體驗增強功能
8. 整合所有功能到主頁面並建立測試

**實作參考**:

- 請先閱讀 `docs/README.md` 了解完整的前端架構和內容生成流程
- 參考 `docs/state-management-guide.md` 中關於 Zustand 使用指南和狀態設計
- 更新 `docs/component-api-reference.md` 記錄所有前端組件的 API 設計
- 在 `docs/hooks-reference.md` 中記錄所有自訂 hooks 的使用方式

**核心功能**:

- 主題輸入表單：主題（必填）、API 金鑰、模型選擇、最大頁數、程式碼選項
- API 金鑰安全儲存至 localStorage，不傳送至後端
- 完整的 API 呼叫流程：表單驗證 → API 請求 → 載入狀態 → 結果處理
- Zustand 狀態管理：編輯器內容、預覽狀態、設定偏好、生成狀態
- 狀態持久化：重要設定和內容自動儲存至 localStorage
- 載入狀態和進度指示：生成按鈕灰化、進度條、狀態文字
- 錯誤處理：Toast 通知、重試按鈕、詳細錯誤訊息
- Token 統計和成本預估：即時顯示使用量和預估費用（USD）
- 用戶體驗增強：智慧重試、使用提示、操作回饋

**測試標準**:

- 表單驗證：所有欄位驗證正確，錯誤訊息清楚
- API 整合：生成流程完整測試，錯誤情況處理正確
- 狀態管理：狀態在組件間正確共享，持久化功能正常
- 用戶體驗：載入狀態正確顯示，Toast 通知適時出現
- Token 統計：使用量計算準確，成本預估正確
- 整合測試：完整的使用者流程從輸入到生成成功

```

## Phase 6: 匯出功能與主題系統

### 步驟 15: 實作完整的 PPTX 匯出與主題切換系統

```

**背景**: 前端內容生成系統已完成。現在建立完整的匯出功能，包含 PPTX 匯出 API、前端匯出 UI 和主題切換系統。

**任務**: 一次性實作完整的匯出功能，包含後端 PPTX 生成 API、前端匯出 UI、主題系統和下載功能

**技術要求**:

- 建立 `/api/v1/export` 端點支援 Markdown 到 PPTX 轉換
- 整合 pptxgenjs 生成高品質 PPTX 檔案
- 實作完整的前端匯出 UI 和下載功能
- 建立主題系統支援多種投影片樣式
- 實作主題選擇器和即時預覽更新
- 整合主題到匯出功能中

**實作步驟**:

1. 建立 `/api/v1/export` 端點與 pptxgenjs 整合
2. 實作 Markdown 解析邏輯和投影片佈局範本
3. 建立前端匯出 UI 組件和下載功能
4. 建立主題系統架構和預設主題庫
5. 實作主題選擇器和即時預覽更新
6. 整合主題到匯出功能，確保 PPTX 應用選定主題
7. 建立完整的匯出測試套件

**實作參考**:

- 請先閱讀 `docs/README.md` 了解完整的匯出架構和主題系統設計
- 參考 `docs/project-architecture-for-ai.md` 中關於檔案生成和主題管理的指導原則
- 更新 `docs/component-api-reference.md` 記錄匯出和主題相關組件的 API
- 在 `docs/codebase-architecture.md` 中記錄 pptxgenjs 整合和主題系統架構

**核心功能**:

- `/api/v1/export` POST 端點：接收 Markdown 和主題設定，回傳 PPTX 二進位檔案
- pptxgenjs 整合：支援文字、圖片、程式碼區塊的正確轉換
- 檔案下載：正確的 MIME type，檔案名稱包含時間戳
- 前端匯出 UI：匯出按鈕、選項對話框、進度指示、錯誤處理
- 主題系統：4 個預設主題（Default, Dark, Blue, Green）
- 主題選擇器：即時預覽更新，主題設定自動儲存
- 主題整合：匯出的 PPTX 正確應用選定的主題樣式
- 匯出狀態管理：載入狀態、進度追蹤、錯誤恢復

**預設主題**:

- Default：簡潔白色主題，適合一般簡報
- Dark：深色主題，適合暗環境演示
- Blue：藍色商務主題，適合企業簡報
- Green：綠色自然主題，適合環保或自然主題

**測試標準**:

- PPTX 匯出：API 回傳有效檔案，可用 PowerPoint 開啟，內容轉換正確
- 下載功能：點擊匯出觸發下載，檔案名稱正確，進度指示正常
- 主題系統：主題切換即時反映在預覽，設定正確儲存和載入
- 主題整合：匯出的 PPTX 正確應用選定主題的顏色和樣式
- 錯誤處理：匯出失敗時顯示錯誤訊息，提供重試選項
- 整合測試：完整的匯出流程從主題選擇到檔案下載成功

```

## Phase 7: 測試、優化與部署

### 步驟 16: 實作完整的測試套件與生產優化

```

**背景**: 所有核心功能已實作完成。現在建立完整的測試套件，進行效能優化，並準備生產環境部署。

**任務**: 一次性建立完整的測試覆蓋（單元測試、E2E 測試），進行效能優化、無障礙改善和部署準備

**技術要求**:

- 建立完整的 Vitest 單元測試和 Playwright E2E 測試
- 達到 80% 以上的測試覆蓋率，涵蓋所有核心功能
- 進行效能分析和優化，確保符合規格要求
- 實作無障礙功能符合 WCAG AA 標準
- 完成技術文件和使用說明
- 建立 Docker 部署配置和 CI/CD 流程

**實作步驟**:

1. 建立完整的單元測試：API 端點、工具函數、React 組件
2. 實作 E2E 測試：完整用戶流程、錯誤處理、跨瀏覽器測試
3. Mock 外部服務：OpenAI API、檔案下載、網路請求
4. 進行效能分析和優化：Bundle size、載入時間、記憶體使用
5. 實作無障礙功能：鍵盤導航、screen reader 支援、對比度
6. 完成文件：README、API 文件、部署指南、故障排除
7. 建立部署配置：Docker、CI/CD、環境變數管理

**實作參考**:

- 請先閱讀 `docs/README.md` 了解完整的測試策略和部署架構
- 參考 `docs/testing-setup-tutorial.md` 中關於測試環境設定和最佳實踐
- 更新 `docs/project-architecture-for-ai.md` 記錄測試流程和生產環境優化
- 在專案根目錄建立完整的 `README.md` 和 `DEPLOYMENT.md`

**測試覆蓋重點**:

- 單元測試：Markdown 解析、Prompt 範本插值、API 錯誤處理、狀態管理邏輯
- API 測試：投影片生成端點、匯出端點、所有錯誤情況（401, 429, 500）
- 組件測試：編輯器互動、預覽更新、表單驗證、主題切換
- E2E 測試：完整生成→編輯→匯出流程、響應式佈局、跨瀏覽器相容性
- 效能測試：首頁載入 < 1.5s、預覽更新 < 300ms、大檔案處理

**優化與部署重點**:

- 效能優化：Bundle size 最小化、圖片壓縮、快取策略、lazy loading
- 無障礙：鍵盤導航、ARIA 標籤、color contrast、screen reader 友善
- 安全性：CSP 設定、XSS 防護、API rate limiting、輸入驗證
- 部署：Docker 容器化、環境變數管理、CI/CD pipeline、監控設定
- 文件：完整的 README、API 參考、部署指南、常見問題

**測試標準**:

- 測試覆蓋率：單元測試 > 80%，E2E 測試涵蓋所有主要流程
- 效能基準：首頁載入 < 1.5s，預覽更新 < 300ms，匯出處理 < 10s
- 跨瀏覽器：Chrome、Firefox、Safari 全部通過測試
- 無障礙：WCAG AA 檢測通過，鍵盤導航完整可用
- 部署：Docker 建置成功，CI/CD pipeline 正常運作
- 文件：完整清楚，開發者可依照文件獨立部署和維護

```

---

## 總結

這個優化後的計劃將 Markdown 投影片產生器重新組織為 **16 個大型功能步驟**，每個步驟都：

1. **一步到位完成獨立功能** - 避免來回修改，每步驟實作完整的功能模組
2. **合併相關的子系統** - 將原本分散的小步驟整合成完整的功能單元
3. **減少重複工作** - 一次性實作相關的前端、後端、測試功能
4. **明確的技術規格** - 每步驟包含完整的技術要求和實作細節

### 步驟概覽

**Phase 1-4: 基礎建設與核心功能** (步驟 1-12)
- 專案初始化、依賴安裝、測試環境 (步驟 1-3)
- 完整的 UI 結構：佈局、分割面板、編輯器、預覽 (步驟 4-7)
- Markdown 編輯器與同步機制 (步驟 8-9)
- Marp 整合與投影片預覽功能 (步驟 10-12)

**Phase 5-6: 後端整合與前端功能** (步驟 13-15)
- 完整的後端 API 系統：OpenAI 整合、範本引擎、快取 (步驟 13)
- 完整的前端生成系統：表單、狀態管理、UX 功能 (步驟 14)
- 完整的匯出與主題系統：PPTX 生成、主題切換 (步驟 15)

**Phase 7: 測試與部署** (步驟 16)
- 完整的測試套件、效能優化、部署準備 (步驟 16)

### 優化效果

- **從 26 個步驟縮減為 16 個步驟** (減少 38%)
- **每個步驟都是完整功能** - 避免重複修改同一個檔案
- **減少依賴關係** - 每步驟內部整合所有相關功能
- **提高開發效率** - 一次性完成整個子系統，減少 context switching

透過這種方式，整個專案可以透過更高效的 focused prompts 逐步實現，每個步驟完成後都有明顯的功能進展，確保開發過程順暢且高效。
```
