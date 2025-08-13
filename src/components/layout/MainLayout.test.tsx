// ABOUTME: Unit tests for MainLayout component using React Testing Library
// ABOUTME: Tests MainLayout component structure, children rendering, and responsive grid layout

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MainLayout } from './MainLayout';

describe('MainLayout', () => {
  it('should render children content', () => {
    render(
      <MainLayout>
        <div data-testid="test-content">Test Content</div>
      </MainLayout>
    );

    const content = screen.getByTestId('test-content');
    expect(content).toBeInTheDocument();
    expect(content).toHaveTextContent('Test Content');
  });

  it('should have proper semantic structure with header and main', () => {
    render(
      <MainLayout>
        <div>Content</div>
      </MainLayout>
    );

    const header = screen.getByRole('banner');
    expect(header).toBeInTheDocument();

    const main = screen.getByRole('main');
    expect(main).toBeInTheDocument();
  });

  it('should have full height container', () => {
    render(
      <MainLayout>
        <div>Content</div>
      </MainLayout>
    );

    const container = screen.getByTestId('main-layout-container');
    expect(container).toHaveClass('min-h-screen', 'bg-gradient-to-br');
  });

  it('should have proper main content styling', () => {
    render(
      <MainLayout>
        <div>Content</div>
      </MainLayout>
    );

    const main = screen.getByRole('main');
    expect(main).toHaveClass('px-4', 'py-4');
  });

  it('should render Header component within layout', () => {
    render(
      <MainLayout>
        <div>Content</div>
      </MainLayout>
    );

    const title = screen.getByRole('heading', { level: 1 });
    expect(title).toHaveTextContent('Markdown 投影片產生器');

    const description = screen.getByText('使用 Markdown 輕鬆創建專業投影片');
    expect(description).toBeInTheDocument();
  });

  it('should have CSS Grid layout structure', () => {
    render(
      <MainLayout>
        <div data-testid="grid-content">Grid Content</div>
      </MainLayout>
    );

    const container = screen.getByTestId('main-layout-container');
    expect(container).toHaveClass('min-h-screen');

    const main = screen.getByRole('main');
    expect(main).toHaveClass('px-4', 'py-4');
  });

  it('should support responsive design', () => {
    render(
      <MainLayout>
        <div className="grid grid-cols-1 lg:grid-cols-2">
          <div data-testid="col-1">Column 1</div>
          <div data-testid="col-2">Column 2</div>
        </div>
      </MainLayout>
    );

    const col1 = screen.getByTestId('col-1');
    const col2 = screen.getByTestId('col-2');

    expect(col1).toBeInTheDocument();
    expect(col2).toBeInTheDocument();
  });

  it('should have proper accessibility structure', () => {
    render(
      <MainLayout>
        <div>Accessible Content</div>
      </MainLayout>
    );

    const header = screen.getByRole('banner');
    const main = screen.getByRole('main');

    expect(header).toBeInTheDocument();
    expect(main).toBeInTheDocument();

    // Both elements should be accessible
    expect(header).toHaveAttribute('class', 'border-b border-border/50 backdrop-blur-sm bg-card/80');
    expect(main).toHaveAttribute('class', 'px-4 py-4');
  });

  it('should allow custom props to be passed to children', () => {
    const CustomComponent = ({ className }: { className?: string }) => (
      <div data-testid="custom-component" className={className}>
        Custom Component
      </div>
    );

    render(
      <MainLayout>
        <CustomComponent className="custom-class" />
      </MainLayout>
    );

    const customComponent = screen.getByTestId('custom-component');
    expect(customComponent).toHaveClass('custom-class');
  });
});
