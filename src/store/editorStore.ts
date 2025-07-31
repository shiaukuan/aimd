// ABOUTME: 編輯器全域狀態管理，處理內容、同步狀態和錯誤狀態
// ABOUTME: 使用 Zustand 實現編輯器與預覽區域的狀態同步機制

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface EditorState {
  // 編輯器內容
  content: string;
  
  // 同步狀態
  isSync: boolean;
  lastSyncTime: number | null;
  isSyncing: boolean;
  
  // 儲存狀態
  isModified: boolean;
  lastSaveTime: number | null;
  autoSaveEnabled: boolean;
  
  // 錯誤狀態
  error: string | null;
  hasError: boolean;
  
  // 效能監控
  contentLength: number;
  isLargeFile: boolean; // >10K 字符
}

export interface EditorActions {
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
  
  // 重置狀態
  resetState: () => void;
}

export type EditorStore = EditorState & EditorActions;

const initialState: EditorState = {
  content: '',
  isSync: true,
  lastSyncTime: null,
  isSyncing: false,
  isModified: false,
  lastSaveTime: null,
  autoSaveEnabled: true,
  error: null,
  hasError: false,
  contentLength: 0,
  isLargeFile: false,
};

export const useEditorStore = create<EditorStore>()(
  devtools(
    (set, get) => ({
      ...initialState,
      
      // 內容操作
      setContent: (content: string) => {
        const contentLength = content.length;
        set({
          content,
          contentLength,
          isLargeFile: contentLength > 10000,
          isModified: content !== get().content,
          isSync: false,
        }, false, 'setContent');
      },
      
      updateContent: (content: string) => {
        const contentLength = content.length;
        set({
          content,
          contentLength,
          isLargeFile: contentLength > 10000,
          isModified: true,
          isSync: false,
        }, false, 'updateContent');
      },
      
      clearContent: () => {
        set({
          content: '',
          contentLength: 0,
          isLargeFile: false,
          isModified: false,
          isSync: true,
        }, false, 'clearContent');
      },
      
      // 同步控制
      setSyncStatus: (isSync: boolean) => {
        set({ isSync }, false, 'setSyncStatus');
      },
      
      startSyncing: () => {
        set({ isSyncing: true }, false, 'startSyncing');
      },
      
      stopSyncing: () => {
        set({ 
          isSyncing: false, 
          isSync: true,
          lastSyncTime: Date.now(),
        }, false, 'stopSyncing');
      },
      
      updateSyncTime: () => {
        set({ 
          lastSyncTime: Date.now(),
          isSync: true,
        }, false, 'updateSyncTime');
      },
      
      // 儲存控制
      setSaveStatus: (isModified: boolean) => {
        set({ isModified }, false, 'setSaveStatus');
      },
      
      updateSaveTime: () => {
        set({ 
          lastSaveTime: Date.now(),
          isModified: false,
        }, false, 'updateSaveTime');
      },
      
      toggleAutoSave: () => {
        set({ autoSaveEnabled: !get().autoSaveEnabled }, false, 'toggleAutoSave');
      },
      
      // 錯誤處理
      setError: (error: string | null) => {
        set({ 
          error, 
          hasError: error !== null,
        }, false, 'setError');
      },
      
      clearError: () => {
        set({ 
          error: null, 
          hasError: false,
        }, false, 'clearError');
      },
      
      // 重置狀態
      resetState: () => {
        set(initialState, false, 'resetState');
      },
    }),
    {
      name: 'editor-store',
      enabled: process.env.NODE_ENV === 'development',
    }
  )
);