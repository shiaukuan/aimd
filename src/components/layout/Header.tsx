// ABOUTME: Header layout component for the main application layout
// ABOUTME: Contains project title and description with responsive design

export function Header() {
  return (
    <header role="banner" className="border-b border-border/50 backdrop-blur-sm bg-card/80">
      <div className="container mx-auto px-6 py-3">
        <div className="flex items-center gap-3">
          <div className="h-6 w-6 rounded-md bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-xs">M</span>
          </div>
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              Markdown 投影片產生器
            </h1>
            <p className="text-muted-foreground text-xs">
              使用 Markdown 輕鬆創建專業投影片
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
