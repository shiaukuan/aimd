export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Markdown 投影片產生器</h1>
          <p className="text-muted-foreground">
            使用 Markdown 輕鬆創建專業投影片
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-200px)]">
          <div className="flex flex-col">
            <h2 className="text-lg font-semibold mb-4">Markdown 編輯器</h2>
            <div className="flex-1 border rounded-lg">
              <textarea
                data-testid="markdown-editor"
                className="w-full h-full p-4 resize-none border-0 focus:outline-none rounded-lg"
                placeholder="在這裡輸入你的 Markdown 內容..."
                defaultValue="# 歡迎使用 Markdown 投影片產生器

這是你的第一張投影片！

## 功能特色

- **即時預覽** - 邊寫邊看效果
- **簡單易用** - 使用熟悉的 Markdown 語法
- **專業輸出** - 生成高品質的投影片"
              />
            </div>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">預覽</h2>
              <div className="flex items-center gap-2">
                <button
                  data-testid="prev-slide"
                  className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
                  disabled
                >
                  上一張
                </button>
                <span
                  data-testid="slide-counter"
                  className="text-sm text-muted-foreground"
                >
                  1 / 2
                </span>
                <button
                  data-testid="next-slide"
                  className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
                >
                  下一張
                </button>
              </div>
            </div>
            <div className="flex-1 border rounded-lg p-6 bg-white shadow-sm">
              <div data-testid="preview" className="preview-area h-full">
                <h1 className="text-3xl font-bold mb-6">
                  歡迎使用 Markdown 投影片產生器
                </h1>
                <p className="text-lg mb-4">這是你的第一張投影片！</p>
                <h2 className="text-2xl font-semibold mb-4">功能特色</h2>
                <ul className="list-disc list-inside space-y-2 mb-6">
                  <li>
                    <strong>即時預覽</strong> - 邊寫邊看效果
                  </li>
                  <li>
                    <strong>簡單易用</strong> - 使用熟悉的 Markdown 語法
                  </li>
                  <li>
                    <strong>專業輸出</strong> - 生成高品質的投影片
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex gap-4 justify-center">
          <button
            data-testid="save"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            儲存
          </button>
          <button
            data-testid="export"
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            匯出
          </button>
          <button
            data-testid="generate"
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            AI 生成投影片
          </button>
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
      </main>
    </div>
  );
}
