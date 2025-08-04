'use client';

import { MainLayout } from '@/components/layout/MainLayout';
import { SplitPanel } from '@/components/ui/SplitPanel';
import { EditorPanel } from '@/components/editor/EditorPanel';
import PreviewPanel from '@/components/preview/PreviewPanel';
import { useState } from 'react';

const DEFAULT_CONTENT = `# 歡迎使用 Markdown 投影片產生器

這是你的第一張投影片！

## 功能特色

- **即時預覽** - 邊寫邊看效果
- **簡單易用** - 使用熟悉的 Markdown 語法
- **專業輸出** - 生成高品質的投影片

---

## 使用說明

1. 在左側編輯器中輸入 Markdown 內容
2. 在右側預覽區域中即時預覽效果
3. 使用工具列進行格式調整
4. 在 Markdown 編輯區按 Ctrl+S，文件會保存在你的瀏覽器（不會上傳伺服器）

`;

export default function Home() {
  const [slideCount, setSlideCount] = useState(1);

  const handleSave = (content: string) => {
    console.log('儲存內容:', content);
    // TODO: 實作雲端儲存功能
  };

  const handleExport = (content: string, format: string) => {
    console.log('匯出內容:', content, '格式:', format);
    // TODO: 實作 PPTX 匯出功能
  };

  const handleError = (error: Error) => {
    console.error('應用程式錯誤:', error);
    // TODO: 實作錯誤報告功能
  };

  const handleRenderComplete = (count: number) => {
    setSlideCount(count);
  };

  return (
    <MainLayout>
      <SplitPanel
        className="h-[calc(100vh-120px)]"
        minLeftWidth={400}
        minRightWidth={500}
        storageKey="markdown-editor-split"
      >
        {/* Left Panel - Editor */}
        <EditorPanel
          content={DEFAULT_CONTENT}
          placeholder="在這裡輸入你的 Markdown 內容..."
          callbacks={{
            onSave: handleSave,
            onExport: handleExport,
            onError: handleError,
          }}
        />

        {/* Right Panel - Preview */}
        <PreviewPanel
          enableSync={true}
          syncDelay={300}
          onError={handleError}
          onRenderComplete={handleRenderComplete}
        />
      </SplitPanel>

      <div className="mt-8 space-y-4">
        {/* 投影片統計 */}
        <div className="text-center text-sm text-muted-foreground">
          目前有 {slideCount} 張投影片
        </div>
      </div>
    </MainLayout>
  );
}
