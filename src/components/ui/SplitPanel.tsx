// ABOUTME: Resizable split panel component with drag-to-resize functionality
// ABOUTME: Supports responsive layout switching between horizontal and vertical splits

'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useSplitPanel, SplitPanelOptions } from '@/hooks/useSplitPanel';

export interface SplitPanelProps extends SplitPanelOptions {
  children: [React.ReactNode, React.ReactNode];
  className?: string;
  leftClassName?: string;
  rightClassName?: string;
  separatorClassName?: string;
}

export function SplitPanel({
  children,
  className,
  leftClassName,
  rightClassName,
  separatorClassName,
  ...options
}: SplitPanelProps) {
  const {
    containerRef,
    separatorProps,
    leftPanelStyle,
    rightPanelStyle,
    isDragging,
  } = useSplitPanel(options);

  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkIsDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    
    checkIsDesktop();
    window.addEventListener('resize', checkIsDesktop);
    
    return () => window.removeEventListener('resize', checkIsDesktop);
  }, []);

  const [leftPanel, rightPanel] = children;

  return (
    <div
      ref={containerRef}
      className={cn(
        'flex h-full w-full',
        // Desktop: horizontal split
        'lg:flex-row',
        // Mobile: vertical split
        'flex-col lg:gap-0 gap-6',
        className
      )}
      data-testid="split-panel-container"
    >
      {/* Left Panel */}
      <div
        className={cn(
          'flex-shrink-0',
          // Desktop: use calculated width
          'lg:h-full',
          // Mobile: full width, auto height
          'lg:w-auto w-full',
          leftClassName
        )}
        style={{
          // Only apply width on desktop
          ...(isDesktop ? leftPanelStyle : {}),
        }}
        data-testid="split-panel-left"
      >
        {leftPanel}
      </div>

      {/* Separator - only visible on desktop */}
      <div
        className={cn(
          'hidden lg:block',
          'w-1 bg-border hover:bg-blue-500 transition-colors cursor-col-resize',
          'relative group',
          isDragging && 'bg-blue-500',
          separatorClassName
        )}
        data-testid="split-panel-separator"
        {...separatorProps}
      >
        {/* Invisible drag area for better UX */}
        <div className="absolute inset-y-0 -left-2 -right-2 cursor-col-resize" />
        
        {/* Visual indicator */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex flex-col gap-1">
            <div className="w-1 h-1 bg-current rounded-full" />
            <div className="w-1 h-1 bg-current rounded-full" />
            <div className="w-1 h-1 bg-current rounded-full" />
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div
        className={cn(
          'flex-1',
          // Desktop: use calculated width
          'lg:h-full',
          // Mobile: full width, auto height
          'lg:w-auto w-full',
          rightClassName
        )}
        style={{
          // Only apply width on desktop
          ...(isDesktop ? rightPanelStyle : {}),
        }}
        data-testid="split-panel-right"
      >
        {rightPanel}
      </div>
    </div>
  );
}