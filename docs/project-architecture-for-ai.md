# Markdown 投影片產生器 - 專案架構說明 (AI 開發參考)

## 專案概述

這是一個基於 Next.js 15 的 Markdown 投影片產生器應用程式，支援透過 AI 生成投影片內容，並可匯出為多種格式。

### 技術棧

- **前端框架**: Next.js 15.4.5 (App Router)
- **程式語言**: TypeScript 5 (嚴格模式)
- **React**: React 19.1.0 (最新版本)
- **包管理器**: pnpm 9.0.0
- **樣式**: Tailwind CSS v4
- **UI 元件**: shadcn/ui + Radix UI + Lucide React
- **狀態管理**: Zustand 5.0.7
- **驗證**: Zod 4.0.13
- **測試**: Vitest 3.2.4 (單元測試) + Playwright 1.54.1 (E2E 測試)
- **投影片引擎**: @marp-team/marp-core 4.1.0
- **匯出功能**: pptxgenjs 4.0.1
- **主題系統**: next-themes 0.4.6

## 專案結構

```
/workspace/
├── src/                          # 主要原始碼目錄
│   ├── app/                      # Next.js App Router 目錄
│   │   ├── layout.tsx           # 根佈局元件
│   │   ├── page.tsx             # 首頁元件
│   │   └── globals.css          # 全域樣式
│   ├── components/              # React 元件
│   │   └── ui/                  # shadcn/ui 元件
│   │       ├── button.tsx       # 按鈕元件
│   │       ├── button.test.tsx  # 按鈕元件測試
│   │       ├── input.tsx        # 輸入框元件
│   │       ├── textarea.tsx     # 文字區域元件
│   │       └── sonner.tsx       # 通知元件
│   ├── lib/                     # 工具函數和配置
│   │   ├── utils.ts             # 工具函數 (cn 等)
│   │   ├── utils.test.ts        # 工具函數測試
│   │   ├── validations.ts       # Zod 驗證 schemas
│   │   └── validations.test.ts  # 驗證測試
│   ├── types/                   # TypeScript 類型定義
│   │   └── index.ts             # 主要類型定義
│   └── test/                    # 測試配置
│       └── setup.ts             # Vitest 測試設定
├── tests/                       # E2E 測試目錄
│   └── e2e/
│       ├── basic.spec.ts        # 基礎功能測試
│       └── slide-editor.spec.ts # 編輯器功能測試
├── docs/                        # 文檔目錄
│   ├── testing-setup-tutorial.md
│   └── project-architecture-for-ai.md
├── public/                      # 靜態資源目錄
├── 配置檔案:
│   ├── package.json             # 專案配置和依賴
│   ├── tsconfig.json            # TypeScript 配置
│   ├── tailwind.config.ts       # Tailwind CSS 配置
│   ├── next.config.js           # Next.js 配置
│   ├── vitest.config.ts         # Vitest 測試配置
│   ├── playwright.config.ts     # Playwright E2E 測試配置
│   ├── .eslintrc.json           # ESLint 配置
│   ├── .prettierrc              # Prettier 配置
│   ├── .gitignore               # Git 忽略檔案
│   ├── README.md                # 專案說明
│   └── CLAUDE.md                # AI 開發指令和關係說明
```

## 核心模組說明

### 1. 類型系統 (`src/types/index.ts`)

定義了完整的 TypeScript 類型，包括：

```typescript
// 投影片相關類型
export interface Slide {
  id: string;
  title: string;
  content: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

// API 相關類型
export interface GenerateSlidesRequest {
  topic: string;
  model: 'gpt-4o' | 'gpt-4o-mini';
  maxPages: number;
  includeCode: boolean;
  includeImages: boolean;
  language: string;
}

// 編輯器相關類型
export interface EditorSettings {
  fontSize: number;
  tabSize: number;
  wordWrap: boolean;
  showLineNumbers: boolean;
  theme: 'light' | 'dark';
}
```

### 2. 驗證系統 (`src/lib/validations.ts`)

使用 Zod 建立的完整驗證 schemas：

```typescript
// 投影片生成驗證
export const slideGenerationSchema = z.object({
  topic: z
    .string()
    .min(3, 'Topic must be at least 3 characters')
    .max(200, 'Topic must be less than 200 characters'),
  apiKey: z.string().min(1, 'API key is required'),
  model: z.enum(['gpt-4o', 'gpt-4o-mini']).default('gpt-4o'),
  maxPages: z.number().min(1).max(30, 'Maximum 30 slides allowed').default(15),
  includeCode: z.boolean().default(true),
  includeImages: z.boolean().default(false),
  language: z.enum(['zh-TW', 'zh-CN', 'en']).default('zh-TW'),
});
```

### 3. UI 元件系統 (`src/components/ui/`)

基於 shadcn/ui 和 Radix UI 的元件系統：

- **設計原則**: 可組合、可存取、可主題化
- **變體支援**: 使用 `class-variance-authority` 管理樣式變體
- **TypeScript 支援**: 完整的類型定義和 prop 驗證
- **測試覆蓋**: 每個元件都有對應的測試檔案

### 4. 工具函數 (`src/lib/utils.ts`)

```typescript
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// 主要工具函數：合併 Tailwind CSS 類名
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

## 測試架構

### 測試策略

採用 **Colocation 測試架構**，測試檔案與原始檔並列：

- **單元測試**: 使用 Vitest + React Testing Library
- **E2E 測試**: 使用 Playwright
- **覆蓋率要求**: 70% 閾值（statements, branches, functions, lines）

### 測試檔案命名規則

- 單元測試: `*.test.ts`, `*.test.tsx`
- E2E 測試: `*.spec.ts`
- 測試位置: 與原始檔同目錄（單元測試）或 `tests/e2e/`（E2E 測試）

### 測試指令

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test"
  }
}
```

## 開發指令和工作流程

### 常用指令

```bash
# 開發
pnpm dev                    # 啟動開發服務器
pnpm build                  # 建構專案
pnpm start                  # 啟動生產服務器

# 測試
pnpm test                   # 執行單元測試（單次執行）
pnpm test:watch            # 監視模式執行測試
pnpm test:coverage         # 執行測試並生成覆蓋率報告
pnpm test:e2e              # 執行 E2E 測試

# 程式碼品質
pnpm lint                   # ESLint 檢查
pnpm lint:fix              # 自動修復 ESLint 問題
pnpm type-check            # TypeScript 類型檢查
```

### 開發工作流程 (遵循 CLAUDE.md 指令)

1. **TDD 實踐**: 先寫測試，再寫實作
2. **測試驅動**: 每個新功能都必須有對應測試
3. **程式碼品質**: 使用 ESLint + Prettier 確保程式碼一致性
4. **類型安全**: TypeScript 嚴格模式，完整類型覆蓋

## 功能模組規劃

### 已實現功能

1. **基礎架構**
   - ✅ Next.js 15.4.5 + TypeScript 5 設定
   - ✅ Tailwind CSS v4 配置
   - ✅ shadcn/ui 元件系統
   - ✅ 完整測試環境（Vitest + Playwright）
   - ✅ Zustand 狀態管理

2. **類型和驗證系統**
   - ✅ 完整 TypeScript 類型定義
   - ✅ Zod 驗證 schemas
   - ✅ 投影片預覽相關類型定義

3. **基礎 UI 結構**
   - ✅ 主版面佈局 (MainLayout, Header)
   - ✅ 錯誤邊界處理 (ErrorBoundary)
   - ✅ 分割面板系統 (SplitPanel)

4. **Markdown 編輯器系統**
   - ✅ 核心編輯器元件 (EditorPanel, MarkdownEditor)
   - ✅ 編輯器工具列 (EditorToolbar)
   - ✅ 狀態列顯示 (EditorStatusBar)
   - ✅ 自動儲存功能 (useAutoSave)

5. **投影片預覽系統**
   - ✅ Marp Core 整合 (useMarpRenderer)
   - ✅ 完整投影片預覽 (SlidePreview)
   - ✅ 縮圖網格導航 (ThumbnailGrid)
   - ✅ 投影片檢視器 (SlideViewer)
   - ✅ 控制列 (SlideControlBar)
   - ✅ 投影片導航和縮放 (useSlideControls)
   - ✅ 縮圖生成系統 (useSlideThumbnails)
   - ✅ 全螢幕模式支援
   - ✅ 鍵盤快捷鍵

6. **核心 Hook 系統**
   - ✅ Marp 渲染管理 (useMarpRenderer)
   - ✅ 投影片控制 (useSlideControls)
   - ✅ 縮圖生成 (useSlideThumbnails)
   - ✅ 自動儲存 (useAutoSave)
   - ✅ 防抖處理 (useDebounce)
   - ✅ 分割面板 (useSplitPanel)

7. **狀態管理**
   - ✅ 編輯器狀態管理 (EditorStore)
   - ✅ 內容同步機制
   - ✅ 錯誤狀態管理

### 待實現功能

8. **AI 投影片生成**
   - 🚧 OpenAI API 整合
   - 🚧 生成表單界面
   - 🚧 進度追蹤
   - 🚧 錯誤處理

9. **匯出功能**
   - 🚧 PDF 匯出
   - 🚧 PPTX 匯出
   - 🚧 HTML 匯出
   - 🚧 圖片匯出

10. **進階功能**
    - 🚧 專案儲存/載入
    - 🚧 範本系統
    - 🚧 分享功能
    - 🚧 協作編輯
    - 🚧 主題切換功能

## 配置檔案詳解

### TypeScript 配置 (`tsconfig.json`)

```json
{
  "compilerOptions": {
    "strict": true,
    "exactOptionalPropertyTypes": true, // 嚴格可選屬性類型
    "noUncheckedIndexedAccess": true, // 索引存取檢查
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] }
  }
}
```

### Tailwind CSS v4 配置 (`tailwind.config.ts`)

```typescript
import type { Config } from 'tailwindcss';

export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;
```

## 依賴套件說明

### 主要依賴

```json
{
  "dependencies": {
    "next": "15.4.5", // Next.js 框架
    "react": "19.0.0", // React 函式庫
    "react-dom": "19.0.0", // React DOM
    "typescript": "~5.7.2", // TypeScript
    "@radix-ui/react-slot": "^1.1.1", // Radix UI Slot
    "class-variance-authority": "^0.7.1", // 樣式變體管理
    "clsx": "^2.1.1", // 條件式類名
    "tailwind-merge": "^2.5.5", // Tailwind 類名合併
    "tailwindcss-animate": "^1.0.7", // Tailwind 動畫
    "zod": "^3.24.1", // 驗證函式庫
    "@marp-team/marp-core": "^4.0.1", // Markdown 投影片引擎
    "pptxgenjs": "^3.13.0", // PowerPoint 生成
    "sonner": "^1.7.1" // 通知系統
  }
}
```

### 開發依賴

```json
{
  "devDependencies": {
    "@types/node": "^22.10.2", // Node.js 類型
    "@types/react": "^19.0.2", // React 類型
    "@types/react-dom": "^19.0.2", // React DOM 類型
    "eslint": "^9.17.0", // 程式碼檢查
    "eslint-config-next": "15.4.5", // Next.js ESLint 配置
    "prettier": "^3.4.2", // 程式碼格式化
    "tailwindcss": "^4.0.0", // Tailwind CSS
    "vitest": "^3.2.4", // 測試框架
    "@vitejs/plugin-react": "^4.3.4", // Vite React 插件
    "@testing-library/react": "^16.1.0", // React 測試工具
    "@testing-library/jest-dom": "^6.6.4", // Jest DOM 匹配器
    "@testing-library/user-event": "^14.5.2", // 使用者事件模擬
    "@playwright/test": "^1.54.1", // E2E 測試框架
    "@vitest/coverage-v8": "^3.2.4", // 測試覆蓋率
    "jsdom": "^26.0.0" // DOM 模擬環境
  }
}
```

## 程式碼品質標準

### ESLint 規則

基於 Next.js 推薦配置，額外啟用：

- TypeScript 嚴格規則
- React Hooks 規則
- 可存取性規則

### Prettier 配置

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
```

### 檔案結構規範

1. **元件檔案**:
   - 以 `.tsx` 結尾
   - 使用 PascalCase 命名
   - 包含對應的 `.test.tsx` 測試檔案

2. **工具函數**:
   - 以 `.ts` 結尾
   - 使用 camelCase 命名
   - 包含對應的 `.test.ts` 測試檔案

3. **類型定義**:
   - 統一放在 `src/types/` 目錄
   - 使用 PascalCase 命名介面和類型

## 開發注意事項

### 必須遵循的規則 (來自 CLAUDE.md)

1. **TDD 實踐**: 先寫測試，再寫實作
2. **測試覆蓋**: 每個功能都必須有單元測試、整合測試和 E2E 測試
3. **程式碼品質**: 不允許 ESLint 錯誤或 TypeScript 類型錯誤
4. **簡潔原則**: 偏好簡單、乾淨、可維護的解決方案
5. **檔案註解**: 所有檔案以 `ABOUTME:` 開頭的 2 行註解

### 開發建議

1. **增量開發**: 每次只實作一個小功能
2. **測試優先**: 確保測試通過再進行下一步
3. **類型安全**: 充分利用 TypeScript 的類型系統
4. **效能考量**: 使用 React.memo、useMemo 等最佳化工具
5. **可存取性**: 確保所有互動元素都有適當的 aria 標籤

## AI 開發建議

### 開發順序建議

1. **Phase 1: 基礎 UI 結構**
   - 實作主版面佈局
   - 添加導航和主題切換
   - 建立響應式設計

2. **Phase 2: Markdown 編輯器**
   - 整合程式碼編輯器
   - 實作即時預覽
   - 添加語法高亮

3. **Phase 3: 投影片系統**
   - 整合 Marp Core
   - 實作投影片導航
   - 添加匯出功能

4. **Phase 4: AI 功能**
   - OpenAI API 整合
   - 生成表單和流程
   - 錯誤處理和重試機制

### 程式碼實作原則

1. **保持現有架構**: 不要改變已建立的檔案結構和命名規則
2. **遵循類型定義**: 使用 `src/types/index.ts` 中定義的類型
3. **使用驗證系統**: 所有輸入都應該通過 Zod schemas 驗證
4. **測試驅動**: 每個新功能都要有對應的測試
5. **效能優化**: 適當使用 React 最佳化技術

### 常見模式

```typescript
// 元件結構模式
export interface ComponentProps {
  // props 定義
}

export function Component({ ...props }: ComponentProps) {
  // 實作
  return (
    // JSX
  );
}

// 測試模式
describe('Component', () => {
  it('should render correctly', () => {
    // 測試實作
  });
});

// 驗證模式
const schema = z.object({
  // 驗證規則
});

// API 處理模式
export async function handler(request: Request) {
  try {
    const data = schema.parse(await request.json());
    // 處理邏輯
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: 'Invalid input' }, { status: 400 });
  }
}
```

這個架構說明提供了 AI 繼續開發所需的所有關鍵資訊，包括技術棧、檔案結構、開發規範和實作模式。

---

_📅 文件更新日期：2025年7月_  
_🤖 此文件專為 AI 協作開發設計_  
_🔄 已更新以反映完整的投影片預覽系統和最新技術棧_
