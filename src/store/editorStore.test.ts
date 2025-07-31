// ABOUTME: Zustand 編輯器狀態管理的單元測試
// ABOUTME: 測試狀態操作、內容同步和錯誤處理功能

import { describe, it, expect, beforeEach } from 'vitest';
import { useEditorStore } from './editorStore';

describe('editorStore', () => {
  beforeEach(() => {
    // 重置狀態
    useEditorStore.getState().resetState();
  });

  describe('初始狀態', () => {
    it('應該有正確的初始值', () => {
      const state = useEditorStore.getState();
      
      expect(state.content).toBe('');
      expect(state.isSync).toBe(true);
      expect(state.lastSyncTime).toBeNull();
      expect(state.isSyncing).toBe(false);
      expect(state.isModified).toBe(false);
      expect(state.lastSaveTime).toBeNull();
      expect(state.autoSaveEnabled).toBe(true);
      expect(state.error).toBeNull();
      expect(state.hasError).toBe(false);
      expect(state.contentLength).toBe(0);
      expect(state.isLargeFile).toBe(false);
    });
  });

  describe('內容操作', () => {
    it('setContent 應該設置內容並更新相關狀態', () => {
      const { setContent } = useEditorStore.getState();
      const testContent = 'Test content';
      
      setContent(testContent);
      
      const state = useEditorStore.getState();
      expect(state.content).toBe(testContent);
      expect(state.contentLength).toBe(testContent.length);
      expect(state.isLargeFile).toBe(false);
      expect(state.isSync).toBe(false);
    });

    it('updateContent 應該更新內容並標記為已修改', () => {
      const { updateContent } = useEditorStore.getState();
      const testContent = 'Updated content';
      
      updateContent(testContent);
      
      const state = useEditorStore.getState();
      expect(state.content).toBe(testContent);
      expect(state.isModified).toBe(true);
      expect(state.isSync).toBe(false);
    });

    it('clearContent 應該清空內容並重設狀態', () => {
      const { setContent, clearContent } = useEditorStore.getState();
      
      // 先設置一些內容
      setContent('Some content');
      
      // 然後清空
      clearContent();
      
      const state = useEditorStore.getState();
      expect(state.content).toBe('');
      expect(state.contentLength).toBe(0);
      expect(state.isLargeFile).toBe(false);
      expect(state.isModified).toBe(false);
      expect(state.isSync).toBe(true);
    });

    it('應該正確檢測大檔案', () => {
      const { setContent } = useEditorStore.getState();
      const largeContent = 'x'.repeat(10001); // 超過 10,000 字符
      
      setContent(largeContent);
      
      const state = useEditorStore.getState();
      expect(state.isLargeFile).toBe(true);
      expect(state.contentLength).toBe(10001);
    });
  });

  describe('同步控制', () => {
    it('setSyncStatus 應該設置同步狀態', () => {
      const { setSyncStatus } = useEditorStore.getState();
      
      setSyncStatus(false);
      expect(useEditorStore.getState().isSync).toBe(false);
      
      setSyncStatus(true);
      expect(useEditorStore.getState().isSync).toBe(true);
    });

    it('startSyncing 應該設置同步中狀態', () => {
      const { startSyncing } = useEditorStore.getState();
      
      startSyncing();
      
      const state = useEditorStore.getState();
      expect(state.isSyncing).toBe(true);
    });

    it('stopSyncing 應該停止同步並更新同步時間', () => {
      const { stopSyncing } = useEditorStore.getState();
      const beforeTime = Date.now();
      
      stopSyncing();
      
      const state = useEditorStore.getState();
      expect(state.isSyncing).toBe(false);
      expect(state.isSync).toBe(true);
      expect(state.lastSyncTime).toBeGreaterThanOrEqual(beforeTime);
    });

    it('updateSyncTime 應該更新同步時間', () => {
      const { updateSyncTime } = useEditorStore.getState();
      const beforeTime = Date.now();
      
      updateSyncTime();
      
      const state = useEditorStore.getState();
      expect(state.lastSyncTime).toBeGreaterThanOrEqual(beforeTime);
      expect(state.isSync).toBe(true);
    });
  });

  describe('儲存控制', () => {
    it('setSaveStatus 應該設置修改狀態', () => {
      const { setSaveStatus } = useEditorStore.getState();
      
      setSaveStatus(true);
      expect(useEditorStore.getState().isModified).toBe(true);
      
      setSaveStatus(false);
      expect(useEditorStore.getState().isModified).toBe(false);
    });

    it('updateSaveTime 應該更新儲存時間並清除修改狀態', () => {
      const { updateSaveTime, setSaveStatus } = useEditorStore.getState();
      const beforeTime = Date.now();
      
      // 先設置為已修改
      setSaveStatus(true);
      
      updateSaveTime();
      
      const state = useEditorStore.getState();
      expect(state.lastSaveTime).toBeGreaterThanOrEqual(beforeTime);
      expect(state.isModified).toBe(false);
    });

    it('toggleAutoSave 應該切換自動儲存狀態', () => {
      const { toggleAutoSave } = useEditorStore.getState();
      
      // 初始為 true
      expect(useEditorStore.getState().autoSaveEnabled).toBe(true);
      
      toggleAutoSave();
      expect(useEditorStore.getState().autoSaveEnabled).toBe(false);
      
      toggleAutoSave();
      expect(useEditorStore.getState().autoSaveEnabled).toBe(true);
    });
  });

  describe('錯誤處理', () => {
    it('setError 應該設置錯誤狀態', () => {
      const { setError } = useEditorStore.getState();
      const errorMessage = 'Test error';
      
      setError(errorMessage);
      
      const state = useEditorStore.getState();
      expect(state.error).toBe(errorMessage);
      expect(state.hasError).toBe(true);
    });

    it('clearError 應該清除錯誤狀態', () => {
      const { setError, clearError } = useEditorStore.getState();
      
      // 先設置錯誤
      setError('Test error');
      
      // 然後清除
      clearError();
      
      const state = useEditorStore.getState();
      expect(state.error).toBeNull();
      expect(state.hasError).toBe(false);
    });

    it('setError(null) 應該清除錯誤狀態', () => {
      const { setError } = useEditorStore.getState();
      
      // 先設置錯誤
      setError('Test error');
      expect(useEditorStore.getState().hasError).toBe(true);
      
      // 設置為 null
      setError(null);
      
      const state = useEditorStore.getState();
      expect(state.error).toBeNull();
      expect(state.hasError).toBe(false);
    });
  });

  describe('狀態重置', () => {
    it('resetState 應該重置所有狀態到初始值', () => {
      const { 
        setContent, 
        setError, 
        setSaveStatus, 
        startSyncing,
        resetState 
      } = useEditorStore.getState();
      
      // 修改一些狀態
      setContent('Test content');
      setError('Test error');
      setSaveStatus(true);
      startSyncing();
      
      // 重置狀態
      resetState();
      
      // 驗證所有狀態都回到初始值
      const state = useEditorStore.getState();
      expect(state.content).toBe('');
      expect(state.error).toBeNull();
      expect(state.hasError).toBe(false);
      expect(state.isModified).toBe(false);
      expect(state.isSyncing).toBe(false);
      expect(state.isSync).toBe(true);
      expect(state.contentLength).toBe(0);
      expect(state.isLargeFile).toBe(false);
    });
  });
});