// ABOUTME: 編輯器狀態列組件，顯示統計資訊、游標位置、檔案狀態等
// ABOUTME: 支援詳細統計顯示、修改狀態指示、最後儲存時間等功能

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { EditorStatusBarProps } from '@/types/editor';

export function EditorStatusBar({
  stats,
  isModified = false,
  lastSaved = null,
  className,
  showDetailedStats = true,
  autoSaveEnabled = true,
  syncStatus
}: EditorStatusBarProps) {
  
  const formatLastSaved = (date: Date | null) => {
    if (!date) return '未儲存';
    
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (seconds < 60) {
      return '剛剛儲存';
    } else if (minutes < 60) {
      return `${minutes}分鐘前儲存`;
    } else if (hours < 24) {
      return `${hours}小時前儲存`;
    } else {
      return date.toLocaleDateString('zh-TW', { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString('zh-TW');
  };

  return (
    <div 
      className={cn(
        'flex items-center justify-between px-3 py-1.5',
        'border-t bg-muted/30 text-xs text-muted-foreground',
        'min-h-[32px]',
        className
      )}
      data-testid="editor-status-bar"
    >
      {/* 左側：統計資訊 */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span data-testid="stats-lines">
            第 {formatNumber(stats.cursorLine)} 行
          </span>
          <span>•</span>
          <span data-testid="stats-column">
            第 {formatNumber(stats.cursorColumn)} 列
          </span>
        </div>
        
        {showDetailedStats && (
          <>
            <div className="w-px h-4 bg-border" />
            <div className="flex items-center gap-2">
              <span data-testid="stats-words">
                {formatNumber(stats.words)} 字
              </span>
              <span>•</span>
              <span data-testid="stats-characters">
                {formatNumber(stats.characters)} 字元
              </span>
              {stats.lines > 1 && (
                <>
                  <span>•</span>
                  <span data-testid="stats-lines-total">
                    {formatNumber(stats.lines)} 行
                  </span>
                </>
              )}
            </div>
          </>
        )}

        {/* 選取範圍統計 */}
        {stats.selectedLength > 0 && (
          <>
            <div className="w-px h-4 bg-border" />
            <div className="flex items-center gap-1">
              <span className="text-accent-foreground font-medium">
                已選取:
              </span>
              <span data-testid="stats-selected">
                {formatNumber(stats.selectedLength)} 字元
              </span>
            </div>
          </>
        )}
      </div>

      {/* 右側：檔案狀態 */}
      <div className="flex items-center gap-3">
        {/* 修改狀態指示 */}
        <div className="flex items-center gap-1">
          {isModified && (
            <span 
              className="w-2 h-2 rounded-full bg-orange-500"
              title="文件已修改"
              data-testid="modified-indicator"
            />
          )}
          <span data-testid="save-status">
            {formatLastSaved(lastSaved)}
          </span>
        </div>

        {/* 同步狀態 */}
        {syncStatus && (
          <div className="flex items-center gap-1">
            <span className={cn(
              "w-2 h-2 rounded-full",
              syncStatus.isSync ? "bg-green-500" : "bg-yellow-500"
            )} title={syncStatus.isSync ? "已同步" : "同步中"} />
            <span className="text-xs">
              {syncStatus.isSync ? "已同步" : "同步中"}
            </span>
          </div>
        )}

        {/* 自動儲存狀態 */}
        <div className="flex items-center gap-1">
          <span className="text-muted-foreground/80">
            {autoSaveEnabled ? "自動儲存" : "手動儲存"}
          </span>
        </div>

        {/* 文件類型 */}
        <div className="flex items-center gap-1">
          <span className="text-muted-foreground/80">Markdown</span>
        </div>
      </div>
    </div>
  );
}