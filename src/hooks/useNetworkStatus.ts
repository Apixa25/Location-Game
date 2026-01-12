/**
 * useNetworkStatus Hook
 *
 * Monitors network connectivity and provides status to components.
 * Shows network error banner when offline.
 */

import { useState, useEffect, useCallback } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface NetworkStatus {
  /** Whether device has internet connection */
  isConnected: boolean;
  /** Whether connection is wifi */
  isWifi: boolean;
  /** Whether connection is cellular */
  isCellular: boolean;
  /** Whether we're checking connection */
  isChecking: boolean;
  /** Check connection manually */
  checkConnection: () => Promise<boolean>;
}

// ═══════════════════════════════════════════════════════════════════════════
// HOOK
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Hook to monitor network connectivity
 *
 * @example
 * ```tsx
 * const { isConnected, checkConnection } = useNetworkStatus();
 *
 * if (!isConnected) {
 *   return <NetworkError onRetry={checkConnection} />;
 * }
 * ```
 */
export function useNetworkStatus(): NetworkStatus {
  const [isConnected, setIsConnected] = useState(true);
  const [isWifi, setIsWifi] = useState(false);
  const [isCellular, setIsCellular] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  /**
   * Handle network state change
   */
  const handleNetworkChange = useCallback((state: NetInfoState) => {
    const connected = state.isConnected ?? false;
    setIsConnected(connected);
    setIsWifi(state.type === 'wifi');
    setIsCellular(state.type === 'cellular');
    setIsChecking(false);

    if (!connected) {
      console.log('[Network] Connection lost');
    } else {
      console.log('[Network] Connected via', state.type);
    }
  }, []);

  /**
   * Check connection manually
   */
  const checkConnection = useCallback(async (): Promise<boolean> => {
    setIsChecking(true);
    try {
      const state = await NetInfo.fetch();
      handleNetworkChange(state);
      return state.isConnected ?? false;
    } catch (error) {
      console.error('[Network] Error checking connection:', error);
      setIsChecking(false);
      return false;
    }
  }, [handleNetworkChange]);

  /**
   * Subscribe to network changes on mount
   */
  useEffect(() => {
    // Initial check
    checkConnection();

    // Subscribe to changes
    const unsubscribe = NetInfo.addEventListener(handleNetworkChange);

    return () => {
      unsubscribe();
    };
  }, [checkConnection, handleNetworkChange]);

  return {
    isConnected,
    isWifi,
    isCellular,
    isChecking,
    checkConnection,
  };
}

export default useNetworkStatus;

