// ABOUTME: Main layout component that provides the overall page structure
// ABOUTME: Includes Header component and renders children in a responsive container

import { Header } from './Header';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div
      data-testid="main-layout-container"
      className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30"
    >
      <Header />
      <main className="px-2 py-3">{children}</main>
    </div>
  );
}
