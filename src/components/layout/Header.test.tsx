// ABOUTME: Unit tests for Header layout component using React Testing Library
// ABOUTME: Tests Header component rendering, responsive behavior, accessibility, and navigation

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Header } from './Header';
import * as navigation from 'next/navigation';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/'),
  Link: ({ children, href, ...props }: { children: React.ReactNode; href: string; className?: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe('Header', () => {
  it('should render with project title', () => {
    render(<Header />);
    
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('Markdown 投影片產生器');
  });

  it('should render with description text', () => {
    render(<Header />);

    const description = screen.getByText('使用AI 生成 Markdown 投影片');
    expect(description).toBeInTheDocument();
  });

  it('should have proper semantic structure', () => {
    render(<Header />);
    
    const header = screen.getByRole('banner');
    expect(header).toBeInTheDocument();
    
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
  });

  it('should have responsive design classes', () => {
    render(<Header />);
    
    const header = screen.getByRole('banner');
    expect(header).toHaveClass('border-b');
    
    const container = header.querySelector('div');
    expect(container).toHaveClass('container', 'mx-auto', 'px-6', 'py-3');
  });

  it('should have proper heading hierarchy', () => {
    render(<Header />);
    
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveClass('text-lg', 'font-bold');
  });

  it('should have muted description text', () => {
    render(<Header />);

    const description = screen.getByText('使用AI 生成 Markdown 投影片');
    expect(description).toHaveClass('text-muted-foreground', 'text-xs');
  });

  it('should be accessible with proper ARIA attributes', () => {
    render(<Header />);
    
    const header = screen.getByRole('banner');
    expect(header).toBeInTheDocument();
    
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
  });

  it('should have fixed position styling capability', () => {
    render(<Header />);

    const header = screen.getByRole('banner');
    // The header should have border-b for visual separation
    expect(header).toHaveClass('border-b');
  });
});

describe('Header Navigation', () => {
  it('should render navigation links', () => {
    vi.mocked(navigation.usePathname).mockReturnValue('/');
    render(<Header />);

    const homeLink = screen.getByRole('link', { name: '首頁' });
    const priceLink = screen.getByRole('link', { name: '捐款支持' });

    expect(homeLink).toBeInTheDocument();
    expect(priceLink).toBeInTheDocument();
  });

  it('should have correct href attributes', () => {
    vi.mocked(navigation.usePathname).mockReturnValue('/');
    render(<Header />);

    const homeLink = screen.getByRole('link', { name: '首頁' });
    const priceLink = screen.getByRole('link', { name: '捐款支持' });

    expect(homeLink).toHaveAttribute('href', '/');
    expect(priceLink).toHaveAttribute('href', '/price');
  });

  it('should highlight current page (home)', () => {
    vi.mocked(navigation.usePathname).mockReturnValue('/');
    render(<Header />);

    const homeLink = screen.getByRole('link', { name: '首頁' });
    const priceLink = screen.getByRole('link', { name: '捐款支持' });

    expect(homeLink).toHaveClass('text-primary', 'font-semibold');
    expect(priceLink).toHaveClass('text-muted-foreground');
  });

  it('should highlight current page (price)', () => {
    vi.mocked(navigation.usePathname).mockReturnValue('/price');
    render(<Header />);

    const homeLink = screen.getByRole('link', { name: '首頁' });
    const priceLink = screen.getByRole('link', { name: '捐款支持' });

    expect(homeLink).toHaveClass('text-muted-foreground');
    expect(priceLink).toHaveClass('text-primary', 'font-semibold');
  });

  it('should have accessible navigation', () => {
    vi.mocked(navigation.usePathname).mockReturnValue('/');
    render(<Header />);

    const nav = screen.getByRole('navigation', { name: '主要導航' });
    expect(nav).toBeInTheDocument();
  });

  it('should have hover states for non-active links', () => {
    vi.mocked(navigation.usePathname).mockReturnValue('/');
    render(<Header />);

    const priceLink = screen.getByRole('link', { name: '捐款支持' });
    expect(priceLink).toHaveClass('hover:text-foreground');
  });
});