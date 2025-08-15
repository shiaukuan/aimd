# Markdown 投影片產生器

一個基於 Next.js 15 的網頁應用程式，讓使用者透過 Markdown 建立、編輯、預覽並匯出投影片。

## 功能特色

- 📝 **Markdown 編輯器** - 支援語法高亮的即時編輯
- 🖼️ **投影片預覽** - 使用 Marp 引擎的即時預覽
- 🤖 **AI 內容生成** - 透過 OpenAI API 自動生成投影片內容
- 📤 **匯出功能** - 支援匯出為 PPTX 格式
- 🎨 **主題切換** - 多種預設主題選擇
- 💾 **自動儲存** - 編輯內容自動儲存到本地

## 技術棧

- **前端**: Next.js 15, React 19, TypeScript 5
- **樣式**: Tailwind CSS v4
- **UI 組件**: shadcn/ui
- **投影片引擎**: Marp Core
- **狀態管理**: Zustand
- **表單驗證**: Zod
- **程式碼品質**: ESLint + Prettier
- **套件管理**: pnpm

## 快速開始

### 環境要求

- Node.js 20 LTS
- pnpm

### 安裝與執行

```bash
# 安裝依賴
pnpm install

# 複製環境變數設定檔並填入您的 API 設定
cp .env.local.example .env.local

# 啟動開發伺服器
pnpm dev

# 類型檢查
pnpm typecheck

# 程式碼格式化
pnpm format

# 代碼檢查
pnpm lint
```

開啟 [http://localhost:3000](http://localhost:3000) 查看應用程式。

### AI 功能設定

要使用 AI 生成投影片功能，請：

1. 複製 `.env.local.example` 為 `.env.local`
2. 在 `.env.local` 中設定您的 API 金鑰和其他參數
3. 重啟開發伺服器

支援的 AI 服務：
- OpenAI GPT 系列
- GitHub Models
- 其他 OpenAI 兼容的 API

## 專案結構

```
src/
├── app/                 # Next.js App Router
│   ├── api/            # API 路由
│   ├── globals.css     # 全域樣式
│   ├── layout.tsx      # 根佈局
│   └── page.tsx        # 首頁
├── components/         # React 組件
├── hooks/              # 自訂 React Hooks
├── lib/                # 工具函數
├── store/              # 狀態管理
└── types/              # TypeScript 型別定義
```

## 開發指令

```bash
pnpm dev          # 啟動開發伺服器
pnpm build        # 建置產品版本
pnpm start        # 啟動產品伺服器
pnpm lint         # 執行 ESLint
pnpm lint:fix     # 修復 ESLint 問題
pnpm format       # 格式化程式碼
pnpm format:check # 檢查程式碼格式
pnpm typecheck    # TypeScript 類型檢查
```

## 授權條款

MIT License
