/**
 * useApi Hook
 *
 * Provides a convenient way to make API calls with loading and error states.
 * Handles common patterns like retries and error display.
 */

import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { ApiError } from '../services/api';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface UseApiState<T> {
  /** Response data */
  data: T | null;
  /** Whether request is in progress */
  isLoading: boolean;
  /** Error from last request */
  error: ApiError | null;
  /** Whether request was successful */
  isSuccess: boolean;
  /** Execute the API call */
  execute: (...args: unknown[]) => Promise<T | null>;
  /** Reset state */
  reset: () => void;
}

export interface UseApiOptions {
  /** Show alert on error */
  showErrorAlert?: boolean;
  /** Custom error message */
  errorMessage?: string;
  /** Callback on success */
  onSuccess?: (data: unknown) => void;
  /** Callback on error */
  onError?: (error: ApiError) => void;
}

// ═══════════════════════════════════════════════════════════════════════════
// HOOK
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Hook for making API calls with state management
 *
 * @example
 * ```tsx
 * const { data, isLoading, execute } = useApi(
 *   () => api.get('/coins/nearby?lat=37&lng=-122'),
 *   { showErrorAlert: true }
 * );
 *
 * useEffect(() => {
 *   execute();
 * }, []);
 * ```
 */
export function useApi<T>(
  apiFunction: (...args: unknown[]) => Promise<T>,
  options: UseApiOptions = {}
): UseApiState<T> {
  const {
    showErrorAlert = false,
    errorMessage,
    onSuccess,
    onError,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  /**
   * Execute the API call
   */
  const execute = useCallback(
    async (...args: unknown[]): Promise<T | null> => {
      setIsLoading(true);
      setError(null);
      setIsSuccess(false);

      try {
        const result = await apiFunction(...args);
        setData(result);
        setIsSuccess(true);
        onSuccess?.(result);
        return result;
      } catch (err) {
        const apiError =
          err instanceof ApiError
            ? err
            : new ApiError(
                err instanceof Error ? err.message : 'Unknown error',
                500
              );

        setError(apiError);

        if (showErrorAlert) {
          const message = errorMessage || apiError.message;
          Alert.alert('Error', message, [{ text: 'OK' }]);
        }

        onError?.(apiError);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [apiFunction, showErrorAlert, errorMessage, onSuccess, onError]
  );

  /**
   * Reset state
   */
  const reset = useCallback(() => {
    setData(null);
    setIsLoading(false);
    setError(null);
    setIsSuccess(false);
  }, []);

  return {
    data,
    isLoading,
    error,
    isSuccess,
    execute,
    reset,
  };
}

/**
 * Simplified mutation hook for POST/PUT/DELETE operations
 */
export function useMutation<T, TVariables = unknown>(
  mutationFn: (variables: TVariables) => Promise<T>,
  options: UseApiOptions = {}
): {
  mutate: (variables: TVariables) => Promise<T | null>;
  isLoading: boolean;
  error: ApiError | null;
  reset: () => void;
} {
  const { isLoading, error, execute, reset } = useApi(
    (vars) => mutationFn(vars as TVariables),
    options
  );

  const mutate = useCallback(
    (variables: TVariables) => execute(variables),
    [execute]
  );

  return {
    mutate,
    isLoading,
    error,
    reset,
  };
}

export default useApi;

