/**
 * Hook React: useSSEStream
 * Consuma un Server-Sent Events stream per aggiornamenti real-time dal server.
 */

import { useEffect, useState, useCallback } from 'react';

export interface SSEMessage {
  type: 'connected' | 'update' | 'error' | 'closed';
  timestamp: string;
  data?: any;
  error?: string;
  reason?: string;
  messageNumber?: number;
}

export interface SSEStreamState {
  connected: boolean;
  messages: SSEMessage[];
  latestMessage: SSEMessage | null;
  error: string | null;
  messageCount: number;
}

export function useSSEStream(url: string, enabled: boolean = true) {
  const [state, setState] = useState<SSEStreamState>({
    connected: false,
    messages: [],
    latestMessage: null,
    error: null,
    messageCount: 0,
  });

  const connect = useCallback(() => {
    if (!enabled) return;

    try {
      const eventSource = new EventSource(url);

      eventSource.onopen = () => {
        console.log('[SSE] Connected');
        setState(prev => ({
          ...prev,
          connected: true,
          error: null,
        }));
      };

      eventSource.onmessage = (event: MessageEvent) => {
        try {
          const message: SSEMessage = JSON.parse(event.data);

          setState(prev => ({
            ...prev,
            messages: [...prev.messages.slice(-49), message], // Mantieni ultimi 50 messaggi
            latestMessage: message,
            messageCount: prev.messageCount + 1,
          }));

          // Log in console
          console.log('[SSE] Message:', message);
        } catch (err) {
          console.error('[SSE] Error parsing message:', err);
        }
      };

      eventSource.onerror = (err: Event) => {
        console.error('[SSE] Error:', err);
        setState(prev => ({
          ...prev,
          connected: false,
          error: 'Connection error',
        }));
        eventSource.close();
      };

      // Cleanup
      return () => {
        eventSource.close();
      };
    } catch (err) {
      console.error('[SSE] Failed to create EventSource:', err);
      setState(prev => ({
        ...prev,
        error: String(err),
      }));
    }
  }, [url, enabled]);

  useEffect(() => {
    if (!enabled) return;

    const cleanup = connect();
    return cleanup;
  }, [enabled, connect]);

  const disconnect = useCallback(() => {
    setState(prev => ({
      ...prev,
      connected: false,
    }));
  }, []);

  const clearMessages = useCallback(() => {
    setState(prev => ({
      ...prev,
      messages: [],
      messageCount: 0,
    }));
  }, []);

  return {
    ...state,
    connect,
    disconnect,
    clearMessages,
  };
}
