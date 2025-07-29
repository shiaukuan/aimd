# Markdown 投影片產生器 — 技術規格

## 1. 目的與範圍

建立一個網頁應用程式，使使用者能 **產生、編輯、預覽並匯出以 Markdown 撰寫的投影片**。\
MVP 聚焦於：

- 透過 OpenAI 模型，由主題提示產生投影片 Markdown。
- 分割檢視編輯器 —— 左側：可編輯 Markdown；右側：使用 Marp 的即時投影片預覽。
- 匯出為 PPTX（中優先）。
- 主題切換（低優先），為後續擴充預留。

## 2. 利害關係人與角色

| 角色                           | 需求                                            |
| ------------------------------ | ----------------------------------------------- |
| **終端使用者（教師／開發者）** | 能快速建立教學投影片、UI 流程簡潔。             |
| **開發團隊**                   | 清晰 API 契約、可擴充架構、完善測試、便利維護。 |
| **產品負責人**                 | 低維運成本，架構可隨後端系統成長。              |

## 3. 需求

### 3.1 功能性

#### Phase 1：基礎分割檢視 (MVP 核心)
| ID    | 描述                                                    | 測試重點                                    | 優先級 |
| ----- | ------------------------------------------------------- | ------------------------------------------- | ------ |
| FR-1a | 建立基礎頁面佈局與路由                                  | 頁面載入、響應式佈局                        | 高     |
| FR-1b | 實作左側 Markdown 編輯器組件                            | 文字輸入、語法高亮、鍵盤操作                | 高     |
| FR-1c | 實作右側 Marp 預覽組件                                  | Markdown 渲染、投影片格式化                 | 高     |
| FR-1d | 實作分割檢視佈局與拖拉調整                              | 面板大小調整、最小寬度限制                  | 高     |
| FR-1e | 實作編輯器與預覽即時同步                                | debounce 更新、錯誤處理、效能                | 高     |

#### Phase 2：內容生成功能
| ID    | 描述                                                    | 測試重點                                    | 優先級 |
| ----- | ------------------------------------------------------- | ------------------------------------------- | ------ |
| FR-2a | 建立 OpenAI API 整合基礎架構                            | API 呼叫、錯誤處理、rate limiting           | 高     |
| FR-2b | 實作主題輸入表單與驗證                                  | 表單驗證、API Key 處理                      | 高     |
| FR-2c | 實作預設 Prompt 範本系統                                | 範本插值、變數替換                          | 高     |
| FR-2d | 實作 Markdown 投影片生成功能                            | 完整生成流程、token 統計                    | 高     |
| FR-2e | 實作生成狀態管理與 UX 回饋                              | Loading 狀態、錯誤訊息、進度指示             | 高     |

#### Phase 3：匯出與擴充功能
| ID    | 描述                                                    | 測試重點                                    | 優先級 |
| ----- | ------------------------------------------------------- | ------------------------------------------- | ------ |
| FR-3a | 實作 PPTX 匯出 API 端點                                 | 檔案生成、下載流程                          | 中     |
| FR-3b | 實作前端匯出功能與 UI                                   | 按鈕狀態、檔案下載                          | 中     |
| FR-3c | 實作基礎主題切換系統                                    | 主題選擇、即時預覽更新                      | 低     |
| FR-3d | 實作進階主題自訂功能                                    | CSS 變數、主題預設                          | 低     |

#### Phase 4：優化與完善
| ID    | 描述                                                    | 測試重點                                    | 優先級 |
| ----- | ------------------------------------------------------- | ------------------------------------------- | ------ |
| FR-4a | 實作內容自動儲存與復原                                  | localStorage、資料持久化                   | 低     |
| FR-4b | 實作範本庫與範例投影片                                  | 範本載入、範例內容                          | 低     |
| FR-4c | 實作鍵盤快捷鍵與無障礙功能                              | 快捷鍵、screen reader 支援                  | 低     |

### 3.2 非功能性

- **效能**：初始頁面 TTFB < 1.5 s；預覽重新渲染 < 300 ms（≤ 40 張投影片）。
- **安全**：使用者 API Key 不落地至後端；渲染結果防 XSS。
- **成本意識**：對相同請求 1 小時內去重；顯示 Token 使用量。
- **無障礙**：符合 WCAG AA 對比度；編輯器可鍵盤導航。

## 4. 高階架構

```text
┌────────────┐        POST /api/v1/slides (Next.js Route Handler)
│   Client   │ ───────────────────────────────────────────────▶ GPT Proxy
│  (Next.js) │                                           ┌─────────────┐
│            │ ◀──────── markdown + meta ─────────────── │  OpenAI API │
└────────────┘                                           └─────────────┘
   │  live preview (Marp-Core)                                  ▲
   └───────────── PPTX binary (via /api/v1/export) ──────────────┘
```

- **前端（Next.js 15）** — 使用 React Server Components，編輯器區塊為 Client Component。
- **Route Handler** — `/api/v1/*` 為薄控制器；日後可抽換成獨立後端服務。
- **Marp Core** — 用於 client 端即時預覽；在 `/api/v1/export` 伺服器端產生 PPTX。

## 5. 資料流程

1. 使用者輸入 Topic 與 API Key → 點擊 _Generate_。
2. 前端 POST 至 `/api/v1/slides` → 伺服器代理 → OpenAI → 回傳 Markdown + token 統計。
3. Markdown 放入編輯器；預覽窗以 debounce 重新執行 `marp.render`。
4. 使用者可編輯；點擊 _Export_ 呼叫 `/api/v1/export`（markdown → pptxgenjs）→ 下載檔案。

## 6. API 契約

所有 API 端點使用 **Zod** 進行請求與回應的 schema 驗證，確保類型安全。

### 6.1 產生投影片 — `POST /api/v1/slides`

```jsonc
{
  "topic": "python 爬蟲", // 必填
  "model": "gpt-4o-mini", // 選填，預設 "gpt-4o"
  "maxPages": 15, // 選填
  "style": "default", // 選填：default | dark | ...
  "includeCode": true, // 選填
  "includeImages": false, // 選填
}
```

**成功 200**

```jsonc
{
  "id": "sl_12345",
  "markdown": "---\\n# Python 爬蟲…",
  "tokenUsage": { "prompt": 123, "completion": 456, "total": 579 },
  "createdAt": "2025-07-23T10:00:00Z",
}
```

**失敗範例**

```jsonc
{ "error": "MESSAGE", "code": "INVALID_MODEL" }
```

常見 `code`：`INVALID_INPUT`, `OPENAI_ERROR`, `RATE_LIMIT`, `INTERNAL_ERROR`。

### 6.2 匯出投影片 — `POST /api/v1/export`

```jsonc
{ "markdown": "…", "format": "pptx" }
```

_回傳_：Binary 檔流（`Content-Disposition: attachment; filename=deck.pptx`）。

## 7. Prompt 範本（預設）

````md
You are SlideBuilderGPT. Produce a Markdown slide deck for the topic **{{topic}}**.
Rules:

- Use `---` to separate slides.
- First slide: title only.
- Each slide ≤ 5 bullet points.
- Insert code blocks where helpful (```lang).
- Use `![alt](image_url)` placeholders if `includeImages` is true.
- Maximum {{maxPages}} slides.
- Language: same as the topic language.
- End with a summary slide.
````

（前端在呼叫 `/api/v1/slides` 前插入變數。）

## 8. 安全與成本控制

| 領域         | 策略                                                      |
| ------------ | --------------------------------------------------------- |
| API Key 處理 | 僅存在 `localStorage` (`sg_user_key`)，不寫後端、不記錄。 |
| Rate limit   | 中介層限制 `/api/v1/slides` 每 IP 每分鐘 5 次。           |
| 快取         | 以 SHA-256(topic+options) 為鍵，Redis TTL 1 小時。        |
| XSS          | 使用 `DOMPurify` 清理產生的 HTML 預覽。                   |

## 9. 錯誤處理與 UX

- Toast 顯示 `error.message`。
- 網路錯誤提供重試提示。
- _Generate_ 進行中按鈕灰化。
- 編輯器下方顯示 token 使用量與預估成本。

## 10. 技術選型

- **Next.js 15** + **TypeScript 5 (strict mode)**。
- **套件管理**：pnpm（更快的依賴安裝與磁碟空間節省）。
- **樣式系統**：Tailwind CSS v4（最新版本，改進的設計系統）。
- **UI 組件庫**：shadcn/ui（高度可客製化的組件系統）。
- **表單驗證**：Zod（類型安全的 schema 驗證）。
- **編輯器**：`<textarea>` + `highlight.js`（輕量），日後可升級 Monaco。
- **Marp Core**：`@marp-team/marp-core` 用 dynamic import 以確保 SSR 安全。
- **匯出**：Route Handler 內使用 `pptxgenjs`（Node 環境）；未來 PDF 使用 headless Chromium。
- **狀態管理**：React Context 儲存設定；Zustand 保存編輯內容。
- **測試**：Vitest（單元測試、API 測試）、Playwright（E2E）。
- **程式碼品質**：ESLint（語法檢查）+ Prettier（格式化）。

## 11. 部署

- Node 20 LTS。
- **套件管理**：使用 pnpm 進行依賴安裝（`pnpm install`）。
- `Dockerfile` 基底 `node:20-alpine`，預裝 pnpm。
- CI：GitHub Actions —— Lint（ESLint + Prettier）、單元測試、建置、部署至 Vercel 或 Container Registry。

## 12. 測試計畫

| 層級 | 工具       | 重點案例                                           |
| ---- | ---------- | -------------------------------------------------- |
| 單元 | Vitest     | Prompt 產生器、token 解析、錯誤對應器              |
| API  | Vitest     | 200 正常、400 無效、429 超速、500 例外             |
| 元件 | Vitest     | 編輯器變更觸發預覽、錯誤 Toast                     |
| E2E  | Playwright | 整個建立→編輯→匯出流程，跨瀏覽器                   |
| 壓力 | Playwright | 50 個並發 `/api/v1/slides` 仍於限制內（可選）      |

---

**已可進入開發階段。**
