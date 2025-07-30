// ABOUTME: Header layout component for the main application layout
// ABOUTME: Contains project title and description with responsive design

export function Header() {
  return (
    <header role="banner" className="border-b">
      <div className="container mx-auto px-4 py-4">
        <h1 className="text-2xl font-bold">Markdown 投影片產生器</h1>
        <p className="text-muted-foreground">
          使用 Markdown 輕鬆創建專業投影片
        </p>
      </div>
    </header>
  );
}