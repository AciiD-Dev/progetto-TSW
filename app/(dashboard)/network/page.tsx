'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface NetworkRequest {
  id: string;
  method: string;
  url: string;
  status: number | null;
  duration: number;
  timestamp: string;
  size: number;
  type: 'fetch' | 'sse' | 'batch';
}

export default function NetworkPage() {
  const [requests, setRequests] = useState<NetworkRequest[]>([]);
  const [monitoring, setMonitoring] = useState(true);

  useEffect(() => {
    if (!monitoring) return;

    // Intercetta le fetch requests
    const originalFetch = window.fetch;
    let requestId = 0;

    window.fetch = function(...args: any[]) {
      const url = args[0];
      const options = args[1] || {};
      const method = options.method || 'GET';
      const id = `req-${++requestId}`;
      const startTime = performance.now();

      const newRequest: NetworkRequest = {
        id,
        method,
        url: typeof url === 'string' ? url : url.toString(),
        status: null,
        duration: 0,
        timestamp: new Date().toISOString(),
        size: 0,
        type: (typeof url === 'string' ? url : url.toString()).includes('/batch') ? 'batch' : (typeof url === 'string' ? url : url.toString()).includes('/stream') ? 'sse' : 'fetch',
      };

      setRequests(prev => [newRequest, ...prev.slice(0, 99)]);

      return originalFetch(...(args as [any, any?])).then((response: Response) => {
        const duration = performance.now() - startTime;
        const status = response.status;

        // Clona la response per leggere il body senza consumarla
        const clonedResponse = response.clone();
        clonedResponse.text().then(text => {
          const size = new Blob([text]).size;

          setRequests(prev =>
            prev.map(req =>
              req.id === id
                ? {
                    ...req,
                    status,
                    duration: Math.round(duration),
                    size,
                  }
                : req
            )
          );
        });

        return response;
      });
    } as any;

    return () => {
      window.fetch = originalFetch;
    };
  }, [monitoring]);

  const getStatusColor = (status: number | null) => {
    if (status === null) return 'text-gray-400';
    if (status >= 200 && status < 300) return 'text-green-400';
    if (status >= 300 && status < 400) return 'text-yellow-400';
    if (status >= 400 && status < 500) return 'text-orange-400';
    return 'text-red-400';
  };

  const getMethodColor = (method: string) => {
    const colors: Record<string, string> = {
      GET: 'bg-blue-500/20 text-blue-400',
      POST: 'bg-green-500/20 text-green-400',
      PUT: 'bg-yellow-500/20 text-yellow-400',
      DELETE: 'bg-red-500/20 text-red-400',
      PATCH: 'bg-purple-500/20 text-purple-400',
    };
    return colors[method] || 'bg-gray-500/20 text-gray-400';
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      fetch: '🔄',
      sse: '📡',
      batch: '📦',
    };
    return icons[type] || '❓';
  };

  const totalSize = requests.reduce((sum, req) => sum + req.size, 0);
  const avgDuration = requests.length > 0 ? Math.round(requests.reduce((sum, req) => sum + req.duration, 0) / requests.length) : 0;
  const successCount = requests.filter(req => req.status && req.status >= 200 && req.status < 300).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Network Inspector</h1>
          <p className="text-gray-400 mt-1">Monitora tutte le richieste client-server</p>
        </div>
        <Link
          href="/dashboard"
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
        >
          ← Torna alla Dashboard
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
          <p className="text-blue-400 text-sm">Richieste Totali</p>
          <p className="text-2xl font-bold text-blue-300 mt-1">{requests.length}</p>
        </div>

        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
          <p className="text-green-400 text-sm">Successo</p>
          <p className="text-2xl font-bold text-green-300 mt-1">{successCount}</p>
        </div>

        <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
          <p className="text-purple-400 text-sm">Durata Media</p>
          <p className="text-2xl font-bold text-purple-300 mt-1">{avgDuration}ms</p>
        </div>

        <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
          <p className="text-orange-400 text-sm">Dati Totali</p>
          <p className="text-2xl font-bold text-orange-300 mt-1">{(totalSize / 1024).toFixed(1)}KB</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-3">
        <button
          onClick={() => setMonitoring(!monitoring)}
          className={`px-4 py-2 rounded-lg transition ${
            monitoring
              ? 'bg-green-500/20 text-green-400 border border-green-500/50'
              : 'bg-gray-700 text-gray-300 border border-gray-600'
          }`}
        >
          {monitoring ? '● Monitoring ON' : '○ Monitoring OFF'}
        </button>

        <button
          onClick={() => setRequests([])}
          className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/50 rounded-lg hover:bg-red-500/30 transition"
        >
          Clear Requests
        </button>
      </div>

      {/* Requests Table */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700 bg-gray-700/50">
                <th className="text-left py-3 px-4 text-gray-400">Tipo</th>
                <th className="text-left py-3 px-4 text-gray-400">Metodo</th>
                <th className="text-left py-3 px-4 text-gray-400">URL</th>
                <th className="text-center py-3 px-4 text-gray-400">Status</th>
                <th className="text-right py-3 px-4 text-gray-400">Durata</th>
                <th className="text-right py-3 px-4 text-gray-400">Size</th>
                <th className="text-left py-3 px-4 text-gray-400">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-400">
                    {monitoring ? 'In attesa di richieste...' : 'Monitoraggio disabilitato'}
                  </td>
                </tr>
              ) : (
                requests.map((req, idx) => (
                  <tr key={req.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                    <td className="py-3 px-4">
                      <span className="text-lg">{getTypeIcon(req.type)}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getMethodColor(req.method)}`}>
                        {req.method}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-300 truncate max-w-xs">
                      {req.url.replace(/^.*\/api\//, '/api/').replace(/^.*\//, '/')}
                    </td>
                    <td className={`py-3 px-4 text-center font-medium ${getStatusColor(req.status)}`}>
                      {req.status ? req.status : '...'}
                    </td>
                    <td className="py-3 px-4 text-right text-gray-300">
                      {req.duration}ms
                    </td>
                    <td className="py-3 px-4 text-right text-gray-300">
                      {req.size > 0 ? `${(req.size / 1024).toFixed(1)}KB` : '-'}
                    </td>
                    <td className="py-3 px-4 text-gray-400 text-xs">
                      {new Date(req.timestamp).toLocaleTimeString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
        <h3 className="font-semibold text-white mb-3">Legenda</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-lg">🔄</span>
            <span className="text-gray-400">Fetch Standard</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">📡</span>
            <span className="text-gray-400">Server-Sent Events</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">📦</span>
            <span className="text-gray-400">Batch Operations</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 rounded text-xs font-medium bg-green-500/20 text-green-400">200-299</span>
            <span className="text-gray-400">Success</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 rounded text-xs font-medium bg-yellow-500/20 text-yellow-400">300-399</span>
            <span className="text-gray-400">Redirect</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 rounded text-xs font-medium bg-red-500/20 text-red-400">4xx-5xx</span>
            <span className="text-gray-400">Error</span>
          </div>
        </div>
      </div>
    </div>
  );
}
