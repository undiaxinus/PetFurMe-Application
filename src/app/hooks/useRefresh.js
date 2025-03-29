import { useState, useCallback, useEffect, useRef } from 'react';
import { Platform } from 'react-native';

/**
 * Custom hook for managing refresh state and functionality
 * Works on both mobile and web platforms
 * 
 * @param {Function} onRefresh - The function to call when refreshing
 * @param {number} [cooldownPeriod=1000] - Cooldown period in ms to prevent rapid refreshes
 * @returns {Object} - Refresh state and handlers
 */
export const useRefresh = (onRefresh, cooldownPeriod = 1000) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState(0);
  const isWeb = Platform.OS === 'web';
  
  // For web platform - track scroll position
  const scrollStartY = useRef(0);
  const scrollThreshold = 80; // pixels to pull down to trigger refresh
  
  const startRefresh = useCallback(async () => {
    const now = Date.now();
    // Implement cooldown to prevent rapid successive refreshes
    if (now - lastRefreshTime < cooldownPeriod) {
      console.log('Refresh cooldown active, ignoring request');
      return;
    }

    setIsRefreshing(true);
    setLastRefreshTime(now);
    
    try {
      await onRefresh();
    } catch (error) {
      console.error('Error during refresh:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [onRefresh, lastRefreshTime, cooldownPeriod]);

  // Web-specific scroll event handlers
  const handleTouchStart = useCallback((e) => {
    if (!isWeb) return;
    // Store the starting Y position when the user touches the screen
    scrollStartY.current = e.touches[0].clientY;
  }, [isWeb]);

  const handleTouchMove = useCallback((e) => {
    if (!isWeb || isRefreshing) return;
    
    const scrollElement = document.documentElement;
    const scrollTop = scrollElement.scrollTop;
    const touchY = e.touches[0].clientY;
    
    // Only trigger pull-to-refresh when at the top of the page
    if (scrollTop <= 0) {
      const pullDistance = touchY - scrollStartY.current;
      
      // If pulled down far enough, trigger refresh
      if (pullDistance > scrollThreshold) {
        startRefresh();
        // Reset the starting Y position to prevent multiple triggers
        scrollStartY.current = 0;
      }
    }
  }, [isWeb, isRefreshing, startRefresh]);

  // Set up web-specific event listeners
  useEffect(() => {
    if (isWeb) {
      const scrollElement = document;
      
      scrollElement.addEventListener('touchstart', handleTouchStart);
      scrollElement.addEventListener('touchmove', handleTouchMove);
      
      return () => {
        scrollElement.removeEventListener('touchstart', handleTouchStart);
        scrollElement.removeEventListener('touchmove', handleTouchMove);
      };
    }
  }, [isWeb, handleTouchStart, handleTouchMove]);

  // For web, we also provide a refresh button option
  const RefreshButton = isWeb ? (
    <div 
      style={{
        display: 'flex',
        justifyContent: 'center',
        padding: '10px',
        backgroundColor: '#f5f5f5',
        borderBottom: '1px solid #ddd',
        cursor: 'pointer'
      }}
      onClick={startRefresh}
    >
      <div style={{ 
        display: 'flex', 
        alignItems: 'center',
        color: '#8146C1',
        fontWeight: 'bold',
        fontSize: '14px'
      }}>
        {isRefreshing ? 'Refreshing...' : 'Refresh'}
      </div>
    </div>
  ) : null;

  return {
    isRefreshing,
    startRefresh,
    RefreshButton,
    // Web event handlers for scroll container
    webProps: isWeb ? {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
    } : {},
    // Additional props for RefreshControl (mostly for mobile)
    refreshControlProps: {
      refreshing: isRefreshing,
      onRefresh: startRefresh,
      colors: ['#8146C1'], // Primary app color
      tintColor: '#8146C1',
      progressBackgroundColor: '#ffffff'
    }
  };
}; 