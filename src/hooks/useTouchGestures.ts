import { useRef, useEffect } from 'react';
import { TouchCoordinates } from '../types';
import { TOUCH_CONFIG } from '../constants';

interface UseTouchGesturesOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onBackGesture?: () => void;
  enabled?: boolean;
}

export const useTouchGestures = ({
  onSwipeLeft,
  onSwipeRight,
  onBackGesture,
  enabled = true
}: UseTouchGesturesOptions) => {
  const touchStart = useRef<TouchCoordinates | null>(null);
  const touchEnd = useRef<TouchCoordinates | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const handleTouchStart = (e: TouchEvent) => {
      touchStart.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      };
      touchEnd.current = null;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!touchStart.current) return;
      
      touchEnd.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      };
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStart.current || !touchEnd.current) return;

      const deltaX = touchEnd.current.x - touchStart.current.x;
      const deltaY = touchEnd.current.y - touchStart.current.y;
      
      const isHorizontalSwipe = Math.abs(deltaX) > Math.abs(deltaY);
      
      if (isHorizontalSwipe) {
        const distance = Math.abs(deltaX);
        
        if (distance > TOUCH_CONFIG.MIN_SWIPE_DISTANCE) {
          if (deltaX > 0 && onSwipeRight) {
            onSwipeRight();
          } else if (deltaX < 0 && onSwipeLeft) {
            onSwipeLeft();
          }
        }
        
        // Check for back gesture (right-to-left swipe)
        if (deltaX > TOUCH_CONFIG.BACK_GESTURE_THRESHOLD && onBackGesture) {
          e.preventDefault();
          onBackGesture();
        }
      }
      
      // Reset touch coordinates
      touchStart.current = null;
      touchEnd.current = null;
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [enabled, onSwipeLeft, onSwipeRight, onBackGesture]);

  return {
    touchStart: touchStart.current,
    touchEnd: touchEnd.current
  };
}; 