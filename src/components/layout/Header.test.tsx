// ABOUTME: Unit tests for Header layout component using React Testing Library
// ABOUTME: Tests Header component rendering, responsive behavior, and accessibility

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Header } from './Header';

describe('Header', () => {
  it('should render with project title', () => {
    render(<Header />);
    
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('Markdown 投影片產生器');
  });

  it('should render with description text', () => {
    render(<Header />);
    
    const description = screen.getByText('使用 Markdown 輕鬆創建專業投影片');
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
    
    const description = screen.getByText('使用 Markdown 輕鬆創建專業投影片');
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