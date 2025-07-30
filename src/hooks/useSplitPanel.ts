// ABOUTME: Custom hook for managing split panel resize functionality
// ABOUTME: Handles drag interactions, size constraints, and localStorage persistence

import { useState, useCallback, useEffect, useRef } from 'react';
import { getStorageItem, setStorageItem } from '@/lib/storage';

export interface SplitPanelOptions {
  defaultLeftWidth?: number;
  minLeftWidth?: number;
  minRightWidth?: number;
  storageKey?: string;
}

export interface SplitPanelReturn {
  leftWidth: number;
  isDragging: boolean;
  containerRef: React.RefObject<HTMLDivElement | null>;
  separatorProps: {
    onMouseDown: (e: React.MouseEvent) => void;
    style: React.CSSProperties;
  };
  leftPanelStyle: React.CSSProperties;
  rightPanelStyle: React.CSSProperties;
}

const DEFAULT_OPTIONS: Required<SplitPanelOptions> = {
  defaultLeftWidth: 50, // percentage
  minLeftWidth: 300, // pixels
  minRightWidth: 400, // pixels
  storageKey: 'split-panel-width',
};

export function useSplitPanel(options: SplitPanelOptions = {}): SplitPanelReturn {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  
  const [leftWidth, setLeftWidth] = useState(() => 
    getStorageItem(opts.storageKey, opts.defaultLeftWidth)
  );
  const [isDragging, setIsDragging] = useState(false);

  const updateWidth = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const containerWidth = containerRect.width;
    const relativeX = clientX - containerRect.left;
    
    // Calculate constraints in pixels
    const minLeft = opts.minLeftWidth;
    const minRight = opts.minRightWidth;
    const maxLeft = containerWidth - minRight;
    
    // Constrain the position
    const constrainedX = Math.max(minLeft, Math.min(maxLeft, relativeX));
    
    // Convert to percentage
    const newLeftWidth = (constrainedX / containerWidth) * 100;
    
    setLeftWidth(newLeftWidth);
    setStorageItem(opts.storageKey, newLeftWidth);
  }, [opts.minLeftWidth, opts.minRightWidth, opts.storageKey]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingRef.current = true;
    setIsDragging(true);
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      updateWidth(e.clientX);
    };
    
    const handleMouseUp = () => {
      isDraggingRef.current = false;
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, [updateWidth]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current) return;
      
      const containerWidth = containerRef.current.getBoundingClientRect().width;
      const currentLeftPixels = (leftWidth / 100) * containerWidth;
      
      // Check if current width violates constraints
      const minLeft = opts.minLeftWidth;
      const minRight = opts.minRightWidth;
      const maxLeft = containerWidth - minRight;
      
      if (currentLeftPixels < minLeft || currentLeftPixels > maxLeft) {
        const constrainedPixels = Math.max(minLeft, Math.min(maxLeft, currentLeftPixels));
        const newLeftWidth = (constrainedPixels / containerWidth) * 100;
        setLeftWidth(newLeftWidth);
        setStorageItem(opts.storageKey, newLeftWidth);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [leftWidth, opts.minLeftWidth, opts.minRightWidth, opts.storageKey]);

  const separatorProps = {
    onMouseDown: handleMouseDown,
    style: {
      cursor: isDragging ? 'col-resize' : 'col-resize',
      backgroundColor: isDragging ? 'rgb(59 130 246)' : undefined,
    } as React.CSSProperties,
  };

  const leftPanelStyle: React.CSSProperties = {
    width: `${leftWidth}%`,
  };

  const rightPanelStyle: React.CSSProperties = {
    width: `${100 - leftWidth}%`,
  };

  return {
    leftWidth,
    isDragging,
    containerRef,
    separatorProps,
    leftPanelStyle,
    rightPanelStyle,
  };
}