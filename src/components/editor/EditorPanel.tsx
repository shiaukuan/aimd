// ABOUTME: 重構後的編輯器面板主組件，整合分離的子模組
// ABOUTME: 現在組織更清晰，邏輯分離到專門的 Hook 和組件中

'use client';

import React from 'react';
import { EditorPanelProps } from '@/types/editor';
import { useEditorPanelContent } from './EditorPanelContent';
import { useEditorPanelActions } from './EditorPanelActions';
import { EditorPanelLayout } from './EditorPanelLayout';

export function EditorPanel({
  content: propContent,
  placeholder = '在這裡輸入你的 Markdown 內容...',
  readOnly = false,
  className,
  headerActions,
  settings,
  callbacks,
}: EditorPanelProps) {
  // 使用內容管理 Hook
  const contentState = useEditorPanelContent({
    propContent,
    settings,
    callbacks,
  });

  // 使用動作處理 Hook
  const actionsState = useEditorPanelActions({
    localContent: contentState.localContent,
    setLocalContent: contentState.setLocalContent,
    setStoreContent: contentState.setStoreContent,
    handleContentChange: contentState.handleContentChange,
    markdownEditorRef: contentState.markdownEditorRef,
    autoSave: contentState.autoSave,
    callbacks,
  });

  // 使用佈局組件進行渲染
  return (
    <EditorPanelLayout
      className={className}
      headerActions={headerActions}
      readOnly={readOnly}
      storeError={contentState.storeError}
      isLargeFile={contentState.isLargeFile}
      storeIsModified={contentState.storeIsModified}
      lastSaved={contentState.lastSaved}
      autoSaveEnabled={contentState.autoSaveEnabled}
      lastSaveTime={contentState.lastSaveTime}
      stats={contentState.stats}
      localContent={contentState.localContent}
      placeholder={placeholder}
      settings={settings}
      clearError={contentState.clearError}
      handleContentChange={contentState.handleContentChange}
      updateStats={contentState.updateStats}
      handleToolbarAction={actionsState.handleToolbarAction}
      handleKeyDown={actionsState.handleKeyDown}
      markdownEditorRef={contentState.markdownEditorRef}
      callbacks={callbacks}
    />
  );
}
