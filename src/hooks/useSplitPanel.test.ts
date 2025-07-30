import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSplitPanel } from './useSplitPanel';

// Mock the storage module
vi.mock('@/lib/storage', () => ({
  getStorageItem: vi.fn().mockReturnValue(50),
  setStorageItem: vi.fn(),
}));

// Mock getBoundingClientRect
const mockGetBoundingClientRect = vi.fn();

describe('useSplitPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetBoundingClientRect.mockReturnValue({
      left: 0,
      width: 1000,
    });
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useSplitPanel());
    
    expect(result.current.leftWidth).toBe(50);
    expect(result.current.isDragging).toBe(false);
    expect(result.current.containerRef.current).toBeNull();
  });

  it('should initialize with custom options', () => {
    const { result } = renderHook(() => 
      useSplitPanel({
        minLeftWidth: 200,
        minRightWidth: 300,
        storageKey: 'custom-key',
      })
    );
    
    expect(result.current.leftWidth).toBe(50);
  });

  it('should provide correct panel styles', () => {
    const { result } = renderHook(() => useSplitPanel());
    
    expect(result.current.leftPanelStyle).toEqual({ width: '50%' });
    expect(result.current.rightPanelStyle).toEqual({ width: '50%' });
  });

  it('should handle mouse down event', () => {
    const { result } = renderHook(() => useSplitPanel());
    
    // Mock container ref
    const mockContainer = document.createElement('div');
    mockContainer.getBoundingClientRect = mockGetBoundingClientRect;
    result.current.containerRef.current = mockContainer;
    
    const mockEvent = {
      preventDefault: vi.fn(),
      clientX: 400,
    } as unknown as React.MouseEvent;
    
    act(() => {
      result.current.separatorProps.onMouseDown(mockEvent);
    });
    
    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(result.current.isDragging).toBe(true);
  });

  it('should update width correctly during drag', () => {
    const { result } = renderHook(() => useSplitPanel());
    
    // Mock container ref
    const mockContainer = document.createElement('div');
    mockContainer.getBoundingClientRect = mockGetBoundingClientRect;
    result.current.containerRef.current = mockContainer;
    
    const mockEvent = {
      preventDefault: vi.fn(),
      clientX: 400,
    } as unknown as React.MouseEvent;
    
    act(() => {
      result.current.separatorProps.onMouseDown(mockEvent);
    });
    
    // Simulate mouse move
    act(() => {
      const mouseMoveEvent = new MouseEvent('mousemove', { clientX: 600 });
      document.dispatchEvent(mouseMoveEvent);
    });
    
    expect(result.current.leftWidth).toBe(60); // 600/1000 * 100
  });

  it('should respect minimum width constraints', () => {
    const { result } = renderHook(() => 
      useSplitPanel({
        minLeftWidth: 300,
        minRightWidth: 400,
      })
    );
    
    // Mock container ref  
    const mockContainer = document.createElement('div');
    mockContainer.getBoundingClientRect = mockGetBoundingClientRect;
    result.current.containerRef.current = mockContainer;
    
    const mockEvent = {
      preventDefault: vi.fn(),
      clientX: 100, // Try to drag to very small width
    } as unknown as React.MouseEvent;
    
    act(() => {
      result.current.separatorProps.onMouseDown(mockEvent);
    });
    
    // Simulate mouse move to position that would violate min constraints
    act(() => {
      const mouseMoveEvent = new MouseEvent('mousemove', { clientX: 100 });
      document.dispatchEvent(mouseMoveEvent);
    });
    
    // Should be constrained to minimum left width (300px / 1000px = 30%)
    expect(result.current.leftWidth).toBe(30);
  });

  it('should end dragging on mouse up', () => {
    const { result } = renderHook(() => useSplitPanel());
    
    // Mock container ref
    const mockContainer = document.createElement('div');
    mockContainer.getBoundingClientRect = mockGetBoundingClientRect;
    result.current.containerRef.current = mockContainer;
    
    const mockEvent = {
      preventDefault: vi.fn(),
      clientX: 400,
    } as unknown as React.MouseEvent;
    
    act(() => {
      result.current.separatorProps.onMouseDown(mockEvent);
    });
    
    expect(result.current.isDragging).toBe(true);
    
    // Simulate mouse up
    act(() => {
      const mouseUpEvent = new MouseEvent('mouseup');
      document.dispatchEvent(mouseUpEvent);
    });
    
    expect(result.current.isDragging).toBe(false);
  });

  it('should apply correct separator styles', () => {
    const { result } = renderHook(() => useSplitPanel());
    
    expect(result.current.separatorProps.style.cursor).toBe('col-resize');
    
    // Start dragging
    const mockContainer = document.createElement('div');
    mockContainer.getBoundingClientRect = mockGetBoundingClientRect;
    result.current.containerRef.current = mockContainer;
    
    const mockEvent = {
      preventDefault: vi.fn(),
      clientX: 400,
    } as unknown as React.MouseEvent;
    
    act(() => {
      result.current.separatorProps.onMouseDown(mockEvent);
    });
    
    expect(result.current.separatorProps.style.backgroundColor).toBe('rgb(59 130 246)');
  });
});