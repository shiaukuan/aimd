# 📚 技術文件目錄

> 🎯 **目的**：為 Cursor AI 提供完整的專案技術文件，協助理解程式碼架構並進行高效開發。

## 📋 文件概覽

這個文件集合為 **Markdown 投影片編輯器** 專案提供全面的技術說明，涵蓋架構設計、元件使用、狀態管理和型別定義等各個面向。

---

## 🗂️ 核心文件

### 🏗️ [程式碼架構文件](./codebase-architecture.md)
**必讀基礎文件** - 了解專案整體架構

- 📊 專案概覽和目錄結構
- 🔧 Components、Hooks、Lib、Types 功能說明  
- 🔄 資料流程和設計模式
- 📖 開發指南和代碼規範

**適用場景**：新專案探索、架構理解、功能定位

---

### 🧩 [元件 API 參考](./component-api-reference.md)
**元件開發指南** - 詳細的 React 元件使用說明

- 📝 編輯器元件（EditorPanel、MarkdownEditor、EditorToolbar）
- 🖼️ 預覽元件（PreviewPanel）
- 🎨 UI 元件（ErrorBoundary、SplitPanel、Button）
- 🏗️ 佈局元件（MainLayout、Header）
- 🔄 元件組合範例和最佳實踐

**適用場景**：元件開發、Props 配置、事件處理

---

### 🪝 [Hook 使用參考](./hooks-reference.md)
**自定義 Hook 完整指南** - 功能性邏輯復用

- 🎯 `useMarpRenderer` - Marp 渲染管理
- 💾 `useAutoSave` - 自動儲存功能
- ⚡ `useDebounce` - 防抖動處理
- 🔧 `useSplitPanel` - 分割面板邏輯
- 🔄 Hook 組合模式和最佳實踐

**適用場景**：功能開發、狀態邏輯、效能優化

---

### 🏪 [狀態管理指南](./state-management-guide.md)
**Zustand 狀態管理完整指南** - 全域狀態架構

- 📊 EditorStore 狀態結構和動作
- 🎯 使用模式和選擇器優化
- 🎛️ 進階模式（持久化、中間件、非同步）
- 🔍 除錯監控和最佳實踐

**適用場景**：狀態管理、資料流控制、效能優化

---

### 📋 [型別定義參考](./types-reference.md)
**TypeScript 型別系統完整指南** - 型別安全開發

- 📝 核心型別（投影片、編輯器、預覽、API）
- 🔧 編輯器型別（工具列、統計、動作）
- 🎨 Marp 型別（渲染、主題、錯誤）
- 🔄 泛型型別和型別守衛
- 🛠️ 工具型別和最佳實踐

**適用場景**：型別開發、介面設計、程式碼安全

---

## 🎯 快速導航

### 依使用場景分類

#### 🚀 新手入門
1. [程式碼架構文件](./codebase-architecture.md) - 了解整體架構
2. [元件 API 參考](./component-api-reference.md) - 學習元件使用
3. [型別定義參考](./types-reference.md) - 理解資料結構

#### 🔧 功能開發  
1. [Hook 使用參考](./hooks-reference.md) - 實作業務邏輯
2. [狀態管理指南](./state-management-guide.md) - 管理應用狀態
3. [元件 API 參考](./component-api-reference.md) - 組合 UI 元件

#### 🎨 UI/UX 開發
1. [元件 API 參考](./component-api-reference.md) - UI 元件使用
2. [程式碼架構文件](./codebase-architecture.md) - 佈局結構理解
3. [型別定義參考](./types-reference.md) - Props 型別定義

#### 🔄 狀態邏輯
1. [狀態管理指南](./state-management-guide.md) - 全域狀態管理
2. [Hook 使用參考](./hooks-reference.md) - 本地狀態邏輯
3. [型別定義參考](./types-reference.md) - 狀態型別定義

### 依技術棧分類

#### ⚛️ React 開發
- [元件 API 參考](./component-api-reference.md)
- [Hook 使用參考](./hooks-reference.md)
- [程式碼架構文件](./codebase-architecture.md#components-目錄結構)

#### 📘 TypeScript 開發
- [型別定義參考](./types-reference.md)
- [程式碼架構文件](./codebase-architecture.md#types-目錄結構)

#### 🏪 狀態管理
- [狀態管理指南](./state-management-guide.md)
- [Hook 使用參考](./hooks-reference.md#狀態邏輯)

#### 🎨 Marp 投影片
- [程式碼架構文件](./codebase-architecture.md#lib-目錄結構)
- [型別定義參考](./types-reference.md#marp-型別定義)
- [Hook 使用參考](./hooks-reference.md#usemarprenderer)

---

## 🔍 搜尋指南

### 常見問題快速查找

| 問題 | 查看文件 | 章節 |
|------|----------|------|
| 如何新增編輯器功能？ | [程式碼架構](./codebase-architecture.md) | 添加新功能 → 新增編輯器功能 |
| 如何使用 EditorPanel？ | [元件 API](./component-api-reference.md) | EditorPanel |
| 如何實作自動儲存？ | [Hook 參考](./hooks-reference.md) | useAutoSave |
| 如何管理編輯器狀態？ | [狀態管理](./state-management-guide.md) | EditorStore 詳細說明 |
| 如何定義新的型別？ | [型別參考](./types-reference.md) | 型別使用最佳實踐 |
| 如何處理 Marp 渲染？ | [Hook 參考](./hooks-reference.md) | useMarpRenderer |
| 如何處理錯誤？ | [元件 API](./component-api-reference.md) | ErrorBoundary |
| 如何實作分割面板？ | [Hook 參考](./hooks-reference.md) | useSplitPanel |

### 關鍵字索引

#### 元件相關
- **EditorPanel**: [元件 API → EditorPanel](./component-api-reference.md#editorpanel)
- **PreviewPanel**: [元件 API → PreviewPanel](./component-api-reference.md#previewpanel)
- **ErrorBoundary**: [元件 API → ErrorBoundary](./component-api-reference.md#errorboundary)
- **SplitPanel**: [元件 API → SplitPanel](./component-api-reference.md#splitpanel)

#### Hook 相關  
- **useMarpRenderer**: [Hook 參考 → useMarpRenderer](./hooks-reference.md#usemarprenderer)
- **useAutoSave**: [Hook 參考 → useAutoSave](./hooks-reference.md#useautosave)
- **useDebounce**: [Hook 參考 → useDebounce](./hooks-reference.md#usedebounce)
- **useSplitPanel**: [Hook 參考 → useSplitPanel](./hooks-reference.md#usesplitpanel)

#### 狀態相關
- **EditorStore**: [狀態管理 → EditorStore](./state-management-guide.md#editorstore-詳細說明)
- **Zustand**: [狀態管理 → Store 實作](./state-management-guide.md#store-實作細節)
- **狀態更新**: [狀態管理 → 使用模式](./state-management-guide.md#使用模式)

#### 型別相關
- **EditorState**: [型別參考 → 編輯器狀態型別](./types-reference.md#編輯器狀態型別)
- **MarpRenderResult**: [型別參考 → 渲染結果](./types-reference.md#渲染相關型別)
- **型別守衛**: [型別參考 → 型別守衛](./types-reference.md#型別守衛-type-guards)

---

## 📊 文件統計

| 文件 | 章節數 | 程式碼範例 | 型別定義 | 適合讀者 |
|------|--------|------------|----------|----------|
| 程式碼架構 | 8 | 15+ | 10+ | 所有開發者 |
| 元件 API | 6 | 20+ | 15+ | 前端開發者 |
| Hook 參考 | 4 | 25+ | 12+ | React 開發者 |
| 狀態管理 | 7 | 18+ | 8+ | 狀態管理開發者 |
| 型別參考 | 5 | 30+ | 50+ | TypeScript 開發者 |

---

## 🚀 開始使用

### 第一次閱讀建議順序

1. **📖 閱讀架構文件** - 建立整體概念
   ```
   程式碼架構文件 → 專案概覽 → Components 目錄結構
   ```

2. **🧩 學習核心元件** - 了解主要功能
   ```
   元件 API 參考 → EditorPanel → PreviewPanel
   ```

3. **🔧 理解業務邏輯** - 掌握核心 Hook
   ```
   Hook 使用參考 → useMarpRenderer → useAutoSave
   ```

4. **🏪 掌握狀態管理** - 理解資料流
   ```
   狀態管理指南 → EditorStore 詳細說明 → 使用模式
   ```

5. **📋 查閱型別定義** - 確保型別安全
   ```
   型別定義參考 → 核心型別定義 → 編輯器型別
   ```

### 開發時快速參考

```bash
# 查找特定功能實作
grep -r "功能名稱" docs/

# 查找型別定義
grep -r "interface.*名稱" docs/types-reference.md

# 查找元件使用方法
grep -r "元件名稱" docs/component-api-reference.md

# 查找 Hook 使用方法  
grep -r "use.*Hook名稱" docs/hooks-reference.md
```

---

## 📝 文件維護

### 更新頻率
- **主要功能更新**：即時更新相關文件
- **型別定義變更**：同步更新型別參考
- **新增元件/Hook**：更新對應的 API 文件
- **架構調整**：更新架構文件

### 貢獻指南
1. 遵循現有的文件格式和風格
2. 提供充足的程式碼範例
3. 保持 TypeScript 型別定義的準確性
4. 更新相關的交叉引用連結

---

## 🤖 AI 協作提示

### 對 Cursor AI 的建議

1. **查閱文件**：開發前先查閱相關文件了解現有架構
2. **遵循模式**：按照文件中的設計模式和最佳實踐
3. **保持一致性**：與現有的程式碼風格和結構保持一致
4. **更新文件**：修改程式碼時同步更新相關文件

### 常用查詢模式

```typescript
// 查找元件使用方法
"如何使用 EditorPanel？" → 元件 API 參考

// 查找 Hook 實作
"如何實作自動儲存？" → Hook 使用參考 → useAutoSave

// 查找型別定義
"EditorState 型別定義？" → 型別定義參考

// 查找狀態管理
"如何更新編輯器狀態？" → 狀態管理指南
```

---

## 🔗 相關資源

### 外部文件
- [React 官方文件](https://react.dev/)
- [TypeScript 官方文件](https://www.typescriptlang.org/)
- [Zustand 文件](https://github.com/pmndrs/zustand)
- [Marp 官方文件](https://marp.app/)

### 專案文件
- [專案計畫](../plan.md)
- [技術規格](../spec.md)
- [開發指導原則](../CLAUDE.md)

---

**💡 提示**：這些文件是活的文件，會隨著專案發展持續更新。建議開發時經常參考最新版本。

---

_📅 文件建立日期：2024年_  
_🤖 此文件集合專為 Cursor AI 協作開發設計_