// ABOUTME: Header layout component for the main application layout
// ABOUTME: Contains project title, description, and navigation links with responsive design

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export function Header() {
  const pathname = usePathname();

  return (
    <header role="banner" className="border-b border-border/50 backdrop-blur-sm bg-card/80">
      <div className="container mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          {/* 左側：Logo + 標題 */}
          <div className="flex items-center gap-3">
            <div className="h-6 w-6 rounded-md bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xs">M</span>
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                Markdown 投影片產生器
              </h1>
              <p className="text-muted-foreground text-xs">
                使用AI 生成 Markdown 投影片
              </p>
            </div>
          </div>

          {/* 右側：導航連結 */}
          <nav aria-label="主要導航">
            <ul className="flex gap-6">
              <li>
                <Link
                  href="/"
                  className={cn(
                    'text-sm transition-colors',
                    pathname === '/'
                      ? 'text-primary font-semibold'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  首頁
                </Link>
              </li>
              <li>
                <Link
                  href="/price"
                  className={cn(
                    'text-sm transition-colors',
                    pathname === '/price'
                      ? 'text-primary font-semibold'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  捐款支持
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
}
