// ABOUTME: 編輯器設定管理，包含 Tab 大小、自動換行等選項
// ABOUTME: 提供設定的持久化儲存和預設值管理

import { z } from 'zod';
import { setStorageItem, getStorageItem } from './storage';

// 編輯器設定 Schema
export const EditorSettingsSchema = z.object({
  // 基本編輯設定
  tabSize: z.number().min(1).max(8).default(2),
  insertSpaces: z.boolean().default(true),
  wordWrap: z.boolean().default(true),
  lineNumbers: z.boolean().default(true),
  
  // 字體設定
  fontSize: z.number().min(10).max(24).default(14),
  fontFamily: z.string().default('Monaco, Menlo, "Ubuntu Mono", monospace'),
  lineHeight: z.number().min(1).max(3).default(1.5),
  
  // 編輯器行為
  autoSave: z.boolean().default(true),
  autoSaveInterval: z.number().min(5000).max(300000).default(30000), // 5秒到5分鐘
  showWhitespace: z.boolean().default(false),
  highlightCurrentLine: z.boolean().default(true),
  
  // 同步設定
  syncDelay: z.number().min(100).max(2000).default(300), // 100ms 到 2秒
  previewSync: z.boolean().default(true),
  
  // 主題設定
  theme: z.enum(['light', 'dark', 'auto']).default('auto'),
  
  // 進階設定
  enableVimMode: z.boolean().default(false),
  showMinimap: z.boolean().default(false),
  enableCodeFolding: z.boolean().default(true),
});

export type EditorSettings = z.infer<typeof EditorSettingsSchema>;

// 預設設定
export const DEFAULT_EDITOR_SETTINGS: EditorSettings = {
  tabSize: 2,
  insertSpaces: true,
  wordWrap: true,
  lineNumbers: true,
  fontSize: 14,
  fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
  lineHeight: 1.5,
  autoSave: true,
  autoSaveInterval: 30000,
  showWhitespace: false,
  highlightCurrentLine: true,
  syncDelay: 300,
  previewSync: true,
  theme: 'auto',
  enableVimMode: false,
  showMinimap: false,
  enableCodeFolding: true,
};

const SETTINGS_STORAGE_KEY = 'editor-settings';

/**
 * 編輯器設定管理類
 */
export class EditorSettingsManager {
  private settings: EditorSettings;
  private listeners: Set<(settings: EditorSettings) => void> = new Set();

  constructor() {
    this.settings = this.loadSettings();
  }

  /**
   * 從 localStorage 載入設定
   */
  private loadSettings(): EditorSettings {
    try {
      const savedSettings = getStorageItem(SETTINGS_STORAGE_KEY, {});
      const parsed = EditorSettingsSchema.parse({
        ...DEFAULT_EDITOR_SETTINGS,
        ...savedSettings,
      });
      return parsed;
    } catch (error) {
      console.warn('Failed to load editor settings, using defaults:', error);
      return DEFAULT_EDITOR_SETTINGS;
    }
  }

  /**
   * 儲存設定到 localStorage
   */
  private saveSettings(): void {
    try {
      setStorageItem(SETTINGS_STORAGE_KEY, this.settings);
    } catch (error) {
      console.error('Failed to save editor settings:', error);
    }
  }

  /**
   * 獲取當前設定
   */
  getSettings(): EditorSettings {
    return { ...this.settings };
  }

  /**
   * 獲取特定設定值
   */
  getSetting<K extends keyof EditorSettings>(key: K): EditorSettings[K] {
    return this.settings[key];
  }

  /**
   * 更新設定
   */
  updateSettings(updates: Partial<EditorSettings>): void {
    try {
      const newSettings = EditorSettingsSchema.parse({
        ...this.settings,
        ...updates,
      });
      
      this.settings = newSettings;
      this.saveSettings();
      this.notifyListeners();
    } catch (error) {
      console.error('Invalid settings update:', error);
      throw error;
    }
  }

  /**
   * 更新單一設定
   */
  updateSetting<K extends keyof EditorSettings>(
    key: K, 
    value: EditorSettings[K]
  ): void {
    this.updateSettings({ [key]: value } as Partial<EditorSettings>);
  }

  /**
   * 重置為預設設定
   */
  resetToDefaults(): void {
    this.settings = { ...DEFAULT_EDITOR_SETTINGS };
    this.saveSettings();
    this.notifyListeners();
  }

  /**
   * 匯出設定
   */
  exportSettings(): string {
    return JSON.stringify(this.settings, null, 2);
  }

  /**
   * 匯入設定
   */
  importSettings(settingsJson: string): void {
    try {
      const parsed = JSON.parse(settingsJson);
      const validated = EditorSettingsSchema.parse(parsed);
      this.settings = validated;
      this.saveSettings();
      this.notifyListeners();
    } catch (error) {
      console.error('Failed to import settings:', error);
      throw new Error('Invalid settings format');
    }
  }

  /**
   * 訂閱設定變更
   */
  subscribe(listener: (settings: EditorSettings) => void): () => void {
    this.listeners.add(listener);
    
    // 返回取消訂閱函數
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * 通知所有監聽器
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.getSettings());
      } catch (error) {
        console.error('Settings listener error:', error);
      }
    });
  }

  /**
   * 獲取 CSS 變數對應的設定值
   */
  getCSSVariables(): Record<string, string> {
    return {
      '--editor-font-size': `${this.settings.fontSize}px`,
      '--editor-font-family': this.settings.fontFamily,
      '--editor-line-height': this.settings.lineHeight.toString(),
      '--editor-tab-size': this.settings.tabSize.toString(),
    };
  }

  /**
   * 驗證設定值
   */
  validateSettings(settings: unknown): EditorSettings {
    return EditorSettingsSchema.parse(settings);
  }
}

// 全域設定管理實例
export const editorSettingsManager = new EditorSettingsManager();

// 便利函數
export function useEditorSettings() {
  return {
    settings: editorSettingsManager.getSettings(),
    updateSettings: (updates: Partial<EditorSettings>) => 
      editorSettingsManager.updateSettings(updates),
    updateSetting: <K extends keyof EditorSettings>(key: K, value: EditorSettings[K]) =>
      editorSettingsManager.updateSetting(key, value),
    resetToDefaults: () => editorSettingsManager.resetToDefaults(),
    subscribe: (listener: (settings: EditorSettings) => void) =>
      editorSettingsManager.subscribe(listener),
  };
}