// ABOUTME: 投影片縮放和自適應縮放控制 Hook
// ABOUTME: 根據視窗大小自動調整投影片的顯示比例和位置

import { useState, useLayoutEffect, RefObject } from 'react';

const SLIDE_BASE_WIDTH = 1280;
const SLIDE_BASE_HEIGHT = 720;

interface UseSlideScalingOptions {
  viewportRef: RefObject<HTMLDivElement | null>;
  wrapperRef: RefObject<HTMLDivElement | null>;
  isRendered: boolean;
}

export function useSlideScaling({
  viewportRef,
  wrapperRef,
  isRendered,
}: UseSlideScalingOptions) {
  const [style, setStyle] = useState({
    transform: 'scale(1)',
    transformOrigin: 'top center',
    width: `${SLIDE_BASE_WIDTH}px`,
    height: `${SLIDE_BASE_HEIGHT}px`,
  });

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    const wrapper = wrapperRef.current;

    if (!viewport || !wrapper || !isRendered) return;

    const resizeObserver = new ResizeObserver(() => {
      const { width: viewportWidth, height: viewportHeight } =
        viewport.getBoundingClientRect();

      if (viewportWidth === 0 || viewportHeight === 0) return;

      const scale = Math.min(
        viewportWidth / SLIDE_BASE_WIDTH,
        viewportHeight / SLIDE_BASE_HEIGHT
      );

      const newWidth = SLIDE_BASE_WIDTH;
      const newHeight = SLIDE_BASE_HEIGHT;

      const offsetX = (viewportWidth - newWidth * scale) / 2;
      const offsetY = (viewportHeight - newHeight * scale) / 2;

      setStyle({
        transform: `translate(${offsetX}px, ${offsetY}px) scale(${scale})`,
        transformOrigin: 'top left',
        width: `${newWidth}px`,
        height: `${newHeight}px`,
      });
    });

    resizeObserver.observe(viewport);

    return () => {
      resizeObserver.disconnect();
    };
  }, [viewportRef, wrapperRef, isRendered]);

  return style;
}
