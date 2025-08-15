// ABOUTME: 編輯器動作處理模組，負責處理各種格式化和編輯操作
// ABOUTME: 將複雜的工具列動作邏輯從主組件中分離出來

import { useCallback } from 'react';
import type { EditorAction, EditorCallbacks } from '@/types/editor';
import type { UseAutoSaveReturn } from '@/hooks/useAutoSave';

export interface EditorPanelActionsProps {
  localContent: string;
  setLocalContent: (content: string) => void;
  setStoreContent: (content: string) => void;
  handleContentChange: (content: string) => void;
  markdownEditorRef: React.RefObject<HTMLTextAreaElement | null>;
  autoSave: UseAutoSaveReturn;
  callbacks?: EditorCallbacks;
}

export function useEditorPanelActions({
  localContent,
  setLocalContent,
  setStoreContent,
  handleContentChange,
  markdownEditorRef,
  autoSave,
  callbacks,
}: EditorPanelActionsProps) {
  // 處理工具列動作
  const handleToolbarAction = useCallback(
    async (action: EditorAction, data?: unknown) => {
      const textarea = markdownEditorRef.current;
      if (!textarea) return;
      
      const { selectionStart, selectionEnd } = textarea;
      const selectedText = localContent.slice(selectionStart, selectionEnd);

      let newContent = localContent;
      let newSelectionStart = selectionStart;
      let newSelectionEnd = selectionEnd;

      switch (action) {
        case 'bold':
          const boldText = selectedText || '粗體文字';
          newContent =
            localContent.slice(0, selectionStart) +
            `**${boldText}**` +
            localContent.slice(selectionEnd);
          newSelectionStart = selectionStart + 2;
          newSelectionEnd = newSelectionStart + boldText.length;
          break;

        case 'italic':
          const italicText = selectedText || '斜體文字';
          newContent =
            localContent.slice(0, selectionStart) +
            `*${italicText}*` +
            localContent.slice(selectionEnd);
          newSelectionStart = selectionStart + 1;
          newSelectionEnd = newSelectionStart + italicText.length;
          break;

        case 'code':
          const codeText = selectedText || '程式碼';
          newContent =
            localContent.slice(0, selectionStart) +
            `\`${codeText}\`` +
            localContent.slice(selectionEnd);
          newSelectionStart = selectionStart + 1;
          newSelectionEnd = newSelectionStart + codeText.length;
          break;

        case 'bulletList':
          const bulletText = selectedText || '清單項目';
          newContent =
            localContent.slice(0, selectionStart) +
            `- ${bulletText}` +
            localContent.slice(selectionEnd);
          newSelectionStart = selectionStart + 2;
          newSelectionEnd = newSelectionStart + bulletText.length;
          break;

        case 'numberedList':
          const numberedText = selectedText || '清單項目';
          newContent =
            localContent.slice(0, selectionStart) +
            `1. ${numberedText}` +
            localContent.slice(selectionEnd);
          newSelectionStart = selectionStart + 3;
          newSelectionEnd = newSelectionStart + numberedText.length;
          break;

        case 'link':
          const linkText = selectedText || '連結文字';
          const linkMarkdown = `[${linkText}](url)`;
          newContent =
            localContent.slice(0, selectionStart) +
            linkMarkdown +
            localContent.slice(selectionEnd);
          newSelectionStart = selectionStart + linkText.length + 3;
          newSelectionEnd = newSelectionStart + 3; // 選中 "url"
          break;

        case 'image':
          const altText = selectedText || '圖片描述';
          const imageMarkdown = `![${altText}](image-url)`;
          newContent =
            localContent.slice(0, selectionStart) +
            imageMarkdown +
            localContent.slice(selectionEnd);
          newSelectionStart = selectionStart + altText.length + 4;
          newSelectionEnd = newSelectionStart + 9; // 選中 "image-url"
          break;

        case 'codeBlock':
          const codeBlockText = selectedText || '程式碼';
          const codeBlock = `\`\`\`\n${codeBlockText}\n\`\`\``;
          newContent =
            localContent.slice(0, selectionStart) +
            codeBlock +
            localContent.slice(selectionEnd);
          newSelectionStart = selectionStart + 4;
          newSelectionEnd = newSelectionStart + codeBlockText.length;
          break;

        case 'save':
          // 手動儲存：使用編輯器中的實際內容
          const currentContent =
            markdownEditorRef.current?.value || localContent;
          const saveSuccess = await autoSave.save();
          if (saveSuccess) {
            callbacks?.onSave?.(currentContent);
          }
          break;

        case 'new':
          if (confirm('確定要新建文件嗎？未儲存的變更將會丟失。')) {
            setLocalContent('');
            setStoreContent('');
            autoSave.clearSavedContent();
          }
          break;

        case 'newTab':
          // 插入分隔線來表示新分頁
          const dividerText = '---';
          const needsNewLine =
            selectionStart > 0 && localContent[selectionStart - 1] !== '\n';
          const prefix = needsNewLine ? '\n' : '';
          // 分隔線後面總是加上換行符
          const suffix = '\n';

          newContent =
            localContent.slice(0, selectionStart) +
            prefix +
            dividerText +
            suffix +
            localContent.slice(selectionEnd);
          newSelectionStart =
            selectionStart + prefix.length + dividerText.length + suffix.length;
          newSelectionEnd = newSelectionStart;
          break;

        default:
          // 其他動作交給回調函數處理
          callbacks?.onAction?.(action, data);
          return;
      }

      // 更新內容
      if (newContent !== localContent) {
        handleContentChange(newContent);

        // 恢復選取範圍
        setTimeout(() => {
          const textarea = markdownEditorRef.current;
          if (textarea) {
            textarea.setSelectionRange(newSelectionStart, newSelectionEnd);
            textarea.focus();
          }
        }, 0);
      }
    },
    [localContent, callbacks, handleContentChange, autoSave, setStoreContent, setLocalContent, markdownEditorRef]
  );

  // 處理鍵盤快捷鍵
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'b':
            e.preventDefault();
            handleToolbarAction('bold');
            break;
          case 'i':
            e.preventDefault();
            handleToolbarAction('italic');
            break;
          case 's':
            e.preventDefault();
            handleToolbarAction('save');
            break;
          case 't':
            e.preventDefault();
            handleToolbarAction('newTab');
            break;
          case 'k':
            e.preventDefault();
            handleToolbarAction('link');
            break;
          case '`':
            e.preventDefault();
            if (e.shiftKey) {
              handleToolbarAction('codeBlock');
            } else {
              handleToolbarAction('code');
            }
            break;
          case '1':
          case '2':
          case '3':
            if (e.altKey) {
              e.preventDefault();
              handleToolbarAction(`heading${e.key}` as EditorAction);
            }
            break;
        }
      }
    },
    [handleToolbarAction]
  );

  return {
    handleToolbarAction,
    handleKeyDown,
  };
}