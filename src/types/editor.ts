// ABOUTME: 編輯器組件專用的型別定義檔案
// ABOUTME: 包含工具列、編輯器面板、狀態管理等相關型別

// 編輯器設定
export interface EditorSettings {
  autoSave: boolean;
  autoSaveInterval: number;
  fontSize: number;
  tabSize: number;
  wordWrap: boolean;
  lineNumbers: boolean;
}

// 編輯器統計資訊
export interface EditorStats {
  characters: number;
  charactersNoSpaces: number;
  words: number;
  lines: number;
  selectedText: string;
  selectedLength: number;
  cursorLine: number;
  cursorColumn: number;
}

// 工具列按鈕項目
export interface ToolbarItem {
  id: string;
  label: string;
  icon: string;
  tooltip: string;
  action: EditorAction;
  shortcut?: string;
  separator?: boolean;
  disabled?: boolean;
}

// 工具列按鈕群組
export interface ToolbarGroup {
  id: string;
  label: string;
  items: ToolbarItem[];
}

// 編輯器動作類型
export type EditorAction =
  | 'new'
  | 'open'
  | 'save'
  | 'undo'
  | 'redo'
  | 'bold'
  | 'italic'
  | 'strikethrough'
  | 'code'
  | 'bulletList'
  | 'numberedList'
  | 'blockquote'
  | 'codeBlock'
  | 'link'
  | 'image'
  | 'table'
  | 'horizontalRule'
  | 'theme';

// 編輯器回調函數型別
export interface EditorCallbacks {
  onChange?: (content: string, stats: EditorStats) => void;
  onSave?: (content: string) => void;
  onExport?: (content: string, format: string) => void;
  onAction?: (action: EditorAction, data?: unknown) => void;
  onSelectionChange?: (
    start: number,
    end: number,
    selectedText: string
  ) => void;
  onCursorChange?: (line: number, column: number) => void;
  onError?: (error: Error) => void;
}

// 編輯器面板屬性
export interface EditorPanelProps {
  content?: string; // 可選，因為現在使用全域狀態
  placeholder?: string;
  readOnly?: boolean;
  className?: string;
  settings?: Partial<EditorSettings>;
  callbacks?: EditorCallbacks;
}

// 編輯器工具列屬性
export interface EditorToolbarProps {
  disabled?: boolean;
  className?: string;
  showFileOperations?: boolean;
  showFormatting?: boolean;
  showInsertOptions?: boolean;
  showViewOptions?: boolean;
  onAction?: (action: EditorAction, data?: unknown) => void;
  activeFormats?: EditorAction[];
}

// 編輯器狀態列屬性
export interface EditorStatusBarProps {
  stats: EditorStats;
  isModified?: boolean;
  lastSaved?: Date | null;
  className?: string;
  showDetailedStats?: boolean;
  autoSaveEnabled?: boolean;
  syncStatus?: {
    isSync: boolean;
    lastSyncTime: number | null;
  };
}

// 編輯器主題配置
export interface EditorTheme {
  name: string;
  background: string;
  foreground: string;
  border: string;
  accent: string;
  muted: string;
  selection: string;
  toolbar: {
    background: string;
    foreground: string;
    hover: string;
  };
  statusBar: {
    background: string;
    foreground: string;
  };
}

// 編輯器快捷鍵配置
export interface EditorKeyBindings {
  [key: string]: EditorAction;
}

// 編輯器格式化選項
export interface EditorFormat {
  action: EditorAction;
  prefix?: string;
  suffix?: string;
  wrapper?: string;
  block?: boolean;
  multiline?: boolean;
  placeholder?: string;
}

// 編輯器插入選項
export interface EditorInsertOptions {
  link: {
    url: string;
    text: string;
  };
  image: {
    url: string;
    alt: string;
    title?: string;
  };
  table: {
    rows: number;
    columns: number;
    headers: boolean;
  };
}

// 編輯器上下文型別
export interface EditorContext {
  content: string;
  stats: EditorStats;
  isModified: boolean;
  lastSaved: Date | null;
  settings: EditorSettings;
  theme: EditorTheme;
  keyBindings: EditorKeyBindings;
  actions: {
    updateContent: (content: string) => void;
    applyFormat: (format: EditorFormat) => void;
    insertText: (text: string, position?: number) => void;
    replaceSelection: (text: string) => void;
    save: () => void;
    export: (format: string) => void;
    undo: () => void;
    redo: () => void;
  };
}

// Marp 渲染結果
export interface RenderResult {
  slides: { id: string; content: string }[];
  css: string;
}
