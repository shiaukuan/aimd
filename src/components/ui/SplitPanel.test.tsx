import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SplitPanel } from './SplitPanel';

// Mock the hook
vi.mock('@/hooks/useSplitPanel', () => ({
  useSplitPanel: vi.fn(() => ({
    leftWidth: 50,
    isDragging: false,
    containerRef: { current: null },
    separatorProps: {
      onMouseDown: vi.fn(),
      style: { cursor: 'col-resize' },
    },
    leftPanelStyle: { width: '50%' },
    rightPanelStyle: { width: '50%' },
  })),
}));

import { useSplitPanel } from '@/hooks/useSplitPanel';
const mockUseSplitPanel = vi.mocked(useSplitPanel);

// Mock window.innerWidth for responsive behavior
Object.defineProperty(window, 'innerWidth', {
  writable: true,
  configurable: true,
  value: 1024,
});

describe('SplitPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render both panels with content', () => {
    render(
      <SplitPanel>
        <div data-testid="left-content">Left Panel</div>
        <div data-testid="right-content">Right Panel</div>
      </SplitPanel>
    );

    expect(screen.getByTestId('split-panel-container')).toBeInTheDocument();
    expect(screen.getByTestId('split-panel-left')).toBeInTheDocument();
    expect(screen.getByTestId('split-panel-right')).toBeInTheDocument();
    expect(screen.getByTestId('split-panel-separator')).toBeInTheDocument();
    
    expect(screen.getByTestId('left-content')).toBeInTheDocument();
    expect(screen.getByTestId('right-content')).toBeInTheDocument();
  });

  it('should apply custom class names', () => {
    render(
      <SplitPanel
        className="custom-container"
        leftClassName="custom-left"
        rightClassName="custom-right"
        separatorClassName="custom-separator"
      >
        <div>Left</div>
        <div>Right</div>
      </SplitPanel>
    );

    const container = screen.getByTestId('split-panel-container');
    const leftPanel = screen.getByTestId('split-panel-left');
    const rightPanel = screen.getByTestId('split-panel-right');
    const separator = screen.getByTestId('split-panel-separator');

    expect(container).toHaveClass('custom-container');
    expect(leftPanel).toHaveClass('custom-left');
    expect(rightPanel).toHaveClass('custom-right');
    expect(separator).toHaveClass('custom-separator');
  });

  it('should have correct responsive layout classes', () => {
    render(
      <SplitPanel>
        <div>Left</div>
        <div>Right</div>
      </SplitPanel>
    );

    const container = screen.getByTestId('split-panel-container');
    
    // Should have flex classes for responsive layout
    expect(container).toHaveClass('flex', 'h-full', 'w-full');
    expect(container).toHaveClass('lg:flex-row', 'flex-col');
    expect(container).toHaveClass('lg:gap-0', 'gap-6');
  });

  it('should handle mouse events on separator', () => {
    const mockOnMouseDown = vi.fn();
    
    mockUseSplitPanel.mockReturnValue({
      leftWidth: 50,
      isDragging: false,
      containerRef: { current: null },
      separatorProps: {
        onMouseDown: mockOnMouseDown,
        style: { cursor: 'col-resize' },
      },
      leftPanelStyle: { width: '50%' },
      rightPanelStyle: { width: '50%' },
    });

    render(
      <SplitPanel>
        <div>Left</div>
        <div>Right</div>
      </SplitPanel>
    );

    const separator = screen.getByTestId('split-panel-separator');
    
    fireEvent.mouseDown(separator);
    
    expect(mockOnMouseDown).toHaveBeenCalled();
  });

  it('should show dragging state visually', () => {
    mockUseSplitPanel.mockReturnValue({
      leftWidth: 50,
      isDragging: true,
      containerRef: { current: null },
      separatorProps: {
        onMouseDown: vi.fn(),
        style: { 
          cursor: 'col-resize',
          backgroundColor: 'rgb(59 130 246)',
        },
      },
      leftPanelStyle: { width: '50%' },
      rightPanelStyle: { width: '50%' },
    });

    render(
      <SplitPanel>
        <div>Left</div>
        <div>Right</div>
      </SplitPanel>
    );

    const separator = screen.getByTestId('split-panel-separator');
    
    expect(separator).toHaveClass('bg-blue-500');
  });

  it('should pass options to useSplitPanel hook', () => {
    render(
      <SplitPanel
        defaultLeftWidth={60}
        minLeftWidth={200}
        minRightWidth={300}
        storageKey="test-key"
      >
        <div>Left</div>
        <div>Right</div>
      </SplitPanel>
    );

    expect(mockUseSplitPanel).toHaveBeenCalledWith({
      defaultLeftWidth: 60,
      minLeftWidth: 200,
      minRightWidth: 300,
      storageKey: 'test-key',
    });
  });

  it('should have invisible drag area for better UX', () => {
    render(
      <SplitPanel>
        <div>Left</div>
        <div>Right</div>
      </SplitPanel>
    );

    const separator = screen.getByTestId('split-panel-separator');
    const dragArea = separator.querySelector('.absolute.inset-y-0.-left-2.-right-2');
    
    expect(dragArea).toBeInTheDocument();
    expect(dragArea).toHaveClass('cursor-col-resize');
  });

  it('should have hover indicator dots', () => {
    render(
      <SplitPanel>
        <div>Left</div>
        <div>Right</div>
      </SplitPanel>
    );

    const separator = screen.getByTestId('split-panel-separator');
    const indicator = separator.querySelector('.opacity-0.group-hover\\:opacity-100');
    const dots = separator.querySelectorAll('.w-1.h-1.bg-current.rounded-full');
    
    expect(indicator).toBeInTheDocument();
    expect(dots).toHaveLength(3);
  });
});