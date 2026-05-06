/**
 * Hook React: useApiWithRetry
 * Gestisce le richieste API con retry automatico, exponential backoff e gestione degli errori.
 */

import { useState, useCallback } from 'react';

export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'PUT';
  body?: any;
  headers?: Record<string, string>;
  maxRetries?: number;
  retryDelay?: number; // ms
  backoffMultiplier?: number;
}

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
  retryCount: number;
  lastAttemptTime: number | null;
}

export function useApiWithRetry<T = any>() {
  const [state, setState] = useState<ApiResponse<T>>({
    data: null,
    error: null,
    loading: false,
    retryCount: 0,
    lastAttemptTime: null,
  });

  const request = useCallback(
    async (
      url: string,
      options: ApiRequestOptions = {}
    ): Promise<ApiResponse<T>> => {
      const {
        method = 'GET',
        body,
        headers = {},
        maxRetries = 3,
        retryDelay = 1000,
        backoffMultiplier = 2,
      } = options;

      let attempt = 0;
      let lastError: Error | null = null;

      setState(prev => ({ ...prev, loading: true, error: null }));

      while (attempt <= maxRetries) {
        try {
          setState(prev => ({
            ...prev,
            lastAttemptTime: Date.now(),
          }));

          const response = await fetch(url, {
            method,
            headers: {
              'Content-Type': 'application/json',
              ...headers,
            },
            body: body ? JSON.stringify(body) : undefined,
          });

          // Se la risposta non è ok, potrebbe essere un errore di validazione (400) che non dovrebbe essere retried
          if (!response.ok) {
            const errorData = await response.json();

            // Non fare retry per errori di validazione (400) o autorizzazione (401, 403)
            if (response.status === 400 || response.status === 401 || response.status === 403) {
              const errorMessage = errorData.error || `HTTP ${response.status}`;
              setState(prev => ({
                ...prev,
                error: errorMessage,
                loading: false,
                retryCount: attempt,
              }));
              return {
                data: null,
                error: errorMessage,
                loading: false,
                retryCount: attempt,
                lastAttemptTime: Date.now(),
              };
            }

            // Per altri errori (500, timeout, ecc.), fai retry
            throw new Error(`HTTP ${response.status}: ${errorData.error || 'Server error'}`);
          }

          const data = await response.json();

          setState(prev => ({
            ...prev,
            data,
            error: null,
            loading: false,
            retryCount: attempt,
          }));

          return {
            data,
            error: null,
            loading: false,
            retryCount: attempt,
            lastAttemptTime: Date.now(),
          };
        } catch (err) {
          lastError = err as Error;
          attempt++;

          if (attempt <= maxRetries) {
            const delay = retryDelay * Math.pow(backoffMultiplier, attempt - 1);
            console.warn(
              `[API Retry] Attempt ${attempt} failed. Retrying in ${delay}ms...`,
              lastError.message
            );

            // Aggiorna lo stato per mostrare il tentativo di retry
            setState(prev => ({
              ...prev,
              error: `Tentativo ${attempt} fallito. Riprovo tra ${Math.round(delay / 1000)}s...`,
              retryCount: attempt,
            }));

            // Attendi prima di riprovare
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      }

      // Tutti i retry sono falliti
      const errorMessage = lastError?.message || 'Request failed after multiple attempts';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        loading: false,
        retryCount: attempt,
      }));

      return {
        data: null,
        error: errorMessage,
        loading: false,
        retryCount: attempt,
        lastAttemptTime: Date.now(),
      };
    },
    []
  );

  return {
    ...state,
    request,
  };
}
