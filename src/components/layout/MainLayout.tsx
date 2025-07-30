// ABOUTME: Main layout component that provides the overall page structure
// ABOUTME: Includes Header component and renders children in a responsive container

import { Header } from './Header';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div data-testid="main-layout-container" className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}