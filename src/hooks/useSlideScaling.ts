// ABOUTME: 這個 hook 用於計算和應用投影片的響應式縮放
// ABOUTME: 它會監聽容器尺寸變化，並回傳一個 style 物件來保持投影片的長寬比

import { useState, useLayoutEffect, RefObject } from 'react';

const SLIDE_ASPECT_RATIO = 16 / 9;
const SLIDE_BASE_WIDTH = 1280;
const SLIDE_BASE_HEIGHT = 720;

interface UseSlideScalingOptions {
  viewportRef: RefObject<HTMLDivElement>;
  wrapperRef: RefObject<HTMLDivElement>;
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
