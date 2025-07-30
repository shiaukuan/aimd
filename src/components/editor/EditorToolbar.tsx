// ABOUTME: 編輯器工具列組件，提供檔案操作、格式化、插入等功能按鈕
// ABOUTME: 支援分組顯示、快捷鍵提示、主題切換等功能

'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { EditorToolbarProps, EditorAction, ToolbarGroup } from '@/types/editor';

// 工具列按鈕配置
const TOOLBAR_GROUPS: ToolbarGroup[] = [
  {
    id: 'file',
    label: '檔案操作',
    items: [
      {
        id: 'new',
        label: '新增',
        icon: '📄',
        tooltip: '新增文件 (Ctrl+N)',
        action: 'new',
        shortcut: 'Ctrl+N'
      },
      {
        id: 'save',
        label: '儲存',
        icon: '💾',
        tooltip: '儲存文件 (Ctrl+S)',
        action: 'save',
        shortcut: 'Ctrl+S'
      },
      {
        id: 'export',
        label: '匯出',
        icon: '📤',
        tooltip: '匯出投影片',
        action: 'export'
      }
    ]
  },
  {
    id: 'format',
    label: '格式化',
    items: [
      {
        id: 'bold',
        label: '粗體',
        icon: '𝐁',
        tooltip: '粗體 (Ctrl+B)',
        action: 'bold',
        shortcut: 'Ctrl+B'
      },
      {
        id: 'italic',
        label: '斜體',
        icon: '𝐼',
        tooltip: '斜體 (Ctrl+I)',
        action: 'italic',
        shortcut: 'Ctrl+I'
      },
      {
        id: 'code',
        label: '程式碼',
        icon: '</>', 
        tooltip: '內聯程式碼 (Ctrl+`)',
        action: 'code',
        shortcut: 'Ctrl+`'
      }
    ]
  },
  {
    id: 'headings',
    label: '標題',
    items: [
      {
        id: 'heading1',
        label: 'H1',
        icon: 'H₁',
        tooltip: '一級標題 (Ctrl+1)',
        action: 'heading1',
        shortcut: 'Ctrl+1'
      },
      {
        id: 'heading2',
        label: 'H2',
        icon: 'H₂',
        tooltip: '二級標題 (Ctrl+2)',
        action: 'heading2',
        shortcut: 'Ctrl+2'
      },
      {
        id: 'heading3',
        label: 'H3',
        icon: 'H₃',
        tooltip: '三級標題 (Ctrl+3)',
        action: 'heading3',
        shortcut: 'Ctrl+3'
      }
    ]
  },
  {
    id: 'lists',
    label: '清單',
    items: [
      {
        id: 'bulletList',
        label: '項目清單',
        icon: '•',
        tooltip: '無序清單 (Ctrl+Shift+8)',
        action: 'bulletList',
        shortcut: 'Ctrl+Shift+8'
      },
      {
        id: 'numberedList',
        label: '數字清單',
        icon: '1.',
        tooltip: '有序清單 (Ctrl+Shift+7)',
        action: 'numberedList',
        shortcut: 'Ctrl+Shift+7'
      }
    ]
  },
  {
    id: 'insert',
    label: '插入',
    items: [
      {
        id: 'link',
        label: '連結',
        icon: '🔗',
        tooltip: '插入連結 (Ctrl+K)',
        action: 'link',
        shortcut: 'Ctrl+K'
      },
      {
        id: 'image',
        label: '圖片',
        icon: '🖼️',
        tooltip: '插入圖片',
        action: 'image'
      },
      {
        id: 'codeBlock',
        label: '程式碼區塊',
        icon: '{ }',
        tooltip: '程式碼區塊 (Ctrl+Shift+`)',
        action: 'codeBlock',
        shortcut: 'Ctrl+Shift+`'
      }
    ]
  }
];

export function EditorToolbar({
  disabled = false,
  className,
  showFileOperations = true,
  showFormatting = true,
  showInsertOptions = true,
  showViewOptions = true,
  onAction,
  activeFormats = []
}: EditorToolbarProps) {
  
  const handleAction = (action: EditorAction) => {
    if (disabled) return;
    onAction?.(action);
  };

  const isActive = (action: EditorAction) => {
    return activeFormats.includes(action);
  };

  const shouldShowGroup = (groupId: string) => {
    switch (groupId) {
      case 'file':
        return showFileOperations;
      case 'format':
      case 'headings':
      case 'lists':
        return showFormatting;
      case 'insert':
        return showInsertOptions;
      default:
        return true;
    }
  };

  const filteredGroups = TOOLBAR_GROUPS.filter(group => 
    shouldShowGroup(group.id)
  );

  return (
    <div 
      className={cn(
        'flex items-center gap-1 p-2 border-b bg-background',
        'overflow-x-auto scrollbar-thin scrollbar-thumb-border',
        className
      )}
      data-testid="editor-toolbar"
    >
      {filteredGroups.map((group, groupIndex) => (
        <React.Fragment key={group.id}>
          <div className="flex items-center gap-1">
            {group.items.map((item) => (
              <Button
                key={item.id}
                variant={isActive(item.action) ? "default" : "ghost"}
                size="sm"
                disabled={disabled || item.disabled}
                onClick={() => handleAction(item.action)}
                title={item.tooltip}
                className={cn(
                  'h-8 px-2 text-xs font-medium',
                  'hover:bg-accent hover:text-accent-foreground',
                  isActive(item.action) && 'bg-accent text-accent-foreground'
                )}
                data-testid={`toolbar-${item.id}`}
              >
                <span className="mr-1 text-sm">{item.icon}</span>
                <span className="hidden sm:inline">{item.label}</span>
              </Button>
            ))}
          </div>
          
          {/* 組與組之間的分隔線 */}
          {groupIndex < filteredGroups.length - 1 && (
            <div className="w-px h-6 bg-border mx-1" />
          )}
        </React.Fragment>
      ))}

      {/* 右側額外選項 */}
      {showViewOptions && (
        <>
          <div className="w-px h-6 bg-border mx-1" />
          <div className="flex items-center gap-1 ml-auto">
            <Button
              variant="ghost"
              size="sm"
              disabled={disabled}
              onClick={() => handleAction('settings')}
              title="編輯器設定"
              className="h-8 px-2 text-xs"
              data-testid="toolbar-settings"
            >
              <span className="text-sm">⚙️</span>
              <span className="hidden sm:inline ml-1">設定</span>
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

// 匯出工具列按鈕配置供其他組件使用
export { TOOLBAR_GROUPS };