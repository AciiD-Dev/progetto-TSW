'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSSEStream } from '@/lib/hooks/use-sse-stream';

interface AnalyticsData {
  timestamp: string;
  activeDevices: number;
  avgTemperature: number | null;
  avgHumidity: number | null;
}

export default function AnalyticsPage() {
  const [dataPoints, setDataPoints] = useState<AnalyticsData[]>([]);
  const [streaming, setStreaming] = useState(true);
  const sse = useSSEStream('/api/events/stream', streaming);

  // Raccogli i dati dai messaggi SSE
  useEffect(() => {
    const msg = sse.latestMessage;
    if (msg?.type === 'update' && msg.data) {
      setDataPoints(prev => [
        ...prev.slice(-29), // Mantieni ultimi 30 punti
        {
          timestamp: msg.timestamp,
          activeDevices: msg.data.activeDevices,
          avgTemperature: msg.data.avgTemperature,
          avgHumidity: msg.data.avgHumidity,
        },
      ]);
    }
  }, [sse.latestMessage]);

  const getChartData = () => {
    if (dataPoints.length === 0) return null;

    const maxTemp = Math.max(...dataPoints.map(d => d.avgTemperature || 0));
    const minTemp = Math.min(...dataPoints.map(d => d.avgTemperature || 0));
    const maxHumidity = Math.max(...dataPoints.map(d => d.avgHumidity || 0));
    const maxDevices = Math.max(...dataPoints.map(d => d.activeDevices));

    return { maxTemp, minTemp, maxHumidity, maxDevices };
  };

  const chartData = getChartData();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Live Analytics</h1>
          <p className="text-gray-400 mt-1">Aggiornamenti in tempo reale via Server-Sent Events</p>
        </div>
        <Link
          href="/dashboard"
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
        >
          ← Torna alla Dashboard
        </Link>
      </div>

      {/* Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`border rounded-lg p-4 ${sse.connected ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
          <p className={sse.connected ? 'text-green-400' : 'text-red-400'}>
            {sse.connected ? '🟢 Connected' : '🔴 Disconnected'}
          </p>
          <p className={`text-2xl font-bold mt-1 ${sse.connected ? 'text-green-300' : 'text-red-300'}`}>
            SSE Stream
          </p>
        </div>

        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
          <p className="text-blue-400">Messaggi Ricevuti</p>
          <p className="text-2xl font-bold text-blue-300 mt-1">{sse.messageCount}</p>
        </div>

        <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
          <p className="text-purple-400">Punti Dati</p>
          <p className="text-2xl font-bold text-purple-300 mt-1">{dataPoints.length}</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-3">
        <button
          onClick={() => setStreaming(!streaming)}
          className={`px-4 py-2 rounded-lg transition ${
            streaming
              ? 'bg-green-500/20 text-green-400 border border-green-500/50'
              : 'bg-gray-700 text-gray-300 border border-gray-600'
          }`}
        >
          {streaming ? '▶ Streaming ON' : '⏸ Streaming OFF'}
        </button>

        <button
          onClick={() => {
            sse.clearMessages();
            setDataPoints([]);
          }}
          className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/50 rounded-lg hover:bg-red-500/30 transition"
        >
          Clear Data
        </button>
      </div>

      {/* Charts */}
      {dataPoints.length > 0 && chartData && (
        <div className="space-y-6">
          {/* Temperature Chart */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h2 className="font-semibold text-white mb-4">Temperatura Media (°C)</h2>
            <div className="flex items-end gap-1 h-48 bg-gray-700/30 p-4 rounded">
              {dataPoints.map((point, idx) => {
                const height = point.avgTemperature
                  ? ((point.avgTemperature - chartData.minTemp) / (chartData.maxTemp - chartData.minTemp + 1)) * 100
                  : 0;
                return (
                  <div
                    key={idx}
                    className="flex-1 bg-gradient-to-t from-secondary to-secondary/50 rounded-t hover:opacity-80 transition"
                    style={{ height: `${Math.max(height, 5)}%` }}
                    title={`${point.avgTemperature?.toFixed(1)}°C`}
                  />
                );
              })}
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-2">
              <span>Min: {chartData.minTemp.toFixed(1)}°C</span>
              <span>Max: {chartData.maxTemp.toFixed(1)}°C</span>
              <span>Avg: {(dataPoints.reduce((sum, p) => sum + (p.avgTemperature || 0), 0) / dataPoints.length).toFixed(1)}°C</span>
            </div>
          </div>

          {/* Humidity Chart */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h2 className="font-semibold text-white mb-4">Umidità Media (%)</h2>
            <div className="flex items-end gap-1 h-48 bg-gray-700/30 p-4 rounded">
              {dataPoints.map((point, idx) => {
                const height = point.avgHumidity ? (point.avgHumidity / 100) * 100 : 0;
                return (
                  <div
                    key={idx}
                    className="flex-1 bg-gradient-to-t from-primary to-primary/50 rounded-t hover:opacity-80 transition"
                    style={{ height: `${Math.max(height, 5)}%` }}
                    title={`${point.avgHumidity?.toFixed(1)}%`}
                  />
                );
              })}
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-2">
              <span>Min: {Math.min(...dataPoints.map(p => p.avgHumidity || 0)).toFixed(1)}%</span>
              <span>Max: {chartData.maxHumidity.toFixed(1)}%</span>
              <span>Avg: {(dataPoints.reduce((sum, p) => sum + (p.avgHumidity || 0), 0) / dataPoints.length).toFixed(1)}%</span>
            </div>
          </div>

          {/* Active Devices Chart */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h2 className="font-semibold text-white mb-4">Dispositivi Attivi</h2>
            <div className="flex items-end gap-1 h-48 bg-gray-700/30 p-4 rounded">
              {dataPoints.map((point, idx) => {
                const height = (point.activeDevices / chartData.maxDevices) * 100;
                return (
                  <div
                    key={idx}
                    className="flex-1 bg-gradient-to-t from-warning to-warning/50 rounded-t hover:opacity-80 transition"
                    style={{ height: `${Math.max(height, 5)}%` }}
                    title={`${point.activeDevices} dispositivi`}
                  />
                );
              })}
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-2">
              <span>Min: {Math.min(...dataPoints.map(p => p.activeDevices))}</span>
              <span>Max: {chartData.maxDevices}</span>
              <span>Avg: {Math.round(dataPoints.reduce((sum, p) => sum + p.activeDevices, 0) / dataPoints.length)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Data Table */}
      {dataPoints.length > 0 && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 overflow-x-auto">
          <h2 className="font-semibold text-white mb-4">Dati Grezzi</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-2 px-3 text-gray-400">#</th>
                <th className="text-left py-2 px-3 text-gray-400">Timestamp</th>
                <th className="text-left py-2 px-3 text-gray-400">Dispositivi Attivi</th>
                <th className="text-left py-2 px-3 text-gray-400">Temp Media</th>
                <th className="text-left py-2 px-3 text-gray-400">Umidità Media</th>
              </tr>
            </thead>
            <tbody>
              {dataPoints.map((point, idx) => (
                <tr key={idx} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                  <td className="py-2 px-3 text-gray-400">{idx + 1}</td>
                  <td className="py-2 px-3 text-gray-300">
                    {new Date(point.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="py-2 px-3 text-gray-300">{point.activeDevices}</td>
                  <td className="py-2 px-3 text-gray-300">
                    {point.avgTemperature?.toFixed(1) || '-'}°C
                  </td>
                  <td className="py-2 px-3 text-gray-300">
                    {point.avgHumidity?.toFixed(1) || '-'}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty State */}
      {dataPoints.length === 0 && sse.connected && (
        <div className="text-center py-12 text-gray-400">
          <p>In attesa dei dati in streaming...</p>
        </div>
      )}

      {/* Error State */}
      {sse.error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400">
          <p className="font-medium">Errore SSE</p>
          <p className="text-sm mt-1">{sse.error}</p>
        </div>
      )}
    </div>
  );
}
