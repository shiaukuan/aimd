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
- **專業輸出** - 生成高品質的投影片`;

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
        className="h-[calc(100vh-200px)]"
        minLeftWidth={300}
        minRightWidth={400}
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
        
        {/* 操作按鈕 */}
        <div className="flex gap-4 justify-center">
          <button
            data-testid="save"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            onClick={() => handleSave('')}
          >
            儲存
          </button>
          <button
            data-testid="export"
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            onClick={() => handleExport('', 'pptx')}
          >
            匯出 PPTX
          </button>
          <button
            data-testid="generate"
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            AI 生成投影片
          </button>
        </div>
      </div>

      <div className="mt-8 max-w-md mx-auto">
        <h3 className="text-lg font-semibold mb-4">AI 投影片生成</h3>
        <div className="space-y-4">
          <input
            data-testid="topic-input"
            type="text"
            placeholder="請輸入投影片主題..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            data-testid="api-key-input"
            type="password"
            placeholder="請輸入 API 金鑰..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </MainLayout>
  );
}
