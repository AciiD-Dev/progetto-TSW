'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Device } from '@/types';
import { useApiWithRetry } from '@/lib/hooks/use-api-with-retry';

interface BatchOperation {
  device_id: number;
  action: 'toggle' | 'turn_on' | 'turn_off' | 'set_value';
  value?: number;
}

export default function BatchControlPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [action, setAction] = useState<'toggle' | 'turn_on' | 'turn_off'>('toggle');
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const api = useApiWithRetry();

  // Carica i dispositivi
  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const response = await fetch('/api/devices');
        const data = await response.json();
        setDevices(data);
      } catch (err) {
        console.error('Failed to fetch devices:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDevices();
  }, []);

  const toggleDevice = (deviceId: number) => {
    const newSelected = new Set(selected);
    if (newSelected.has(deviceId)) {
      newSelected.delete(deviceId);
    } else {
      newSelected.add(deviceId);
    }
    setSelected(newSelected);
  };

  const toggleAll = () => {
    if (selected.size === devices.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(devices.map(d => d.id)));
    }
  };

  const handleExecute = async () => {
    if (selected.size === 0) return;

    const operations: BatchOperation[] = Array.from(selected).map(deviceId => ({
      device_id: deviceId,
      action,
    }));

    const result = await api.request('/api/devices/batch', {
      method: 'POST',
      body: { operations },
      maxRetries: 3,
    });

    if (result.data) {
      setResults(result.data);
      setShowResults(true);
    }
  };

  const getDeviceTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      light: 'lightbulb',
      thermostat: 'thermostat',
      humidity: 'water_drop',
      blinds: 'blinds',
      plug: 'power',
    };
    return icons[type] || 'device_unknown';
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      toggle: 'Toggle',
      turn_on: 'Turn On',
      turn_off: 'Turn Off',
    };
    return labels[action] || action;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Batch Control</h1>
          <p className="text-gray-400 mt-1">Controlla più dispositivi contemporaneamente</p>
        </div>
        <Link
          href="/dashboard"
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
        >
          ← Torna alla Dashboard
        </Link>
      </div>

      {/* Selection Controls */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-white">Seleziona Dispositivi</h2>
            <p className="text-sm text-gray-400 mt-1">
              {selected.size} di {devices.length} dispositivi selezionati
            </p>
          </div>
          <button
            onClick={toggleAll}
            className="px-4 py-2 bg-primary/20 text-primary border border-primary/50 rounded-lg hover:bg-primary/30 transition"
          >
            {selected.size === devices.length ? 'Deseleziona Tutti' : 'Seleziona Tutti'}
          </button>
        </div>

        {/* Device Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
          {devices.map(device => (
            <button
              key={device.id}
              onClick={() => toggleDevice(device.id)}
              className={`p-4 rounded-lg border-2 transition text-left ${
                selected.has(device.id)
                  ? 'border-primary/50 bg-primary/10'
                  : 'border-gray-700 bg-gray-700/30 hover:border-gray-600'
              }`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={selected.has(device.id)}
                  onChange={() => {}}
                  className="mt-1"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">
                      {getDeviceTypeIcon(device.type)}
                    </span>
                    <p className="font-medium text-white truncate">{device.name}</p>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{device.type}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Status: {device.status ? 'On' : 'Off'} | Value: {device.value}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Action Selection */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 space-y-4">
        <h2 className="font-semibold text-white">Seleziona Azione</h2>
        <div className="grid grid-cols-3 gap-3">
          {(['toggle', 'turn_on', 'turn_off'] as const).map(act => (
            <button
              key={act}
              onClick={() => setAction(act)}
              className={`py-3 px-4 rounded-lg border transition font-medium ${
                action === act
                  ? 'border-primary/50 bg-primary/20 text-primary'
                  : 'border-gray-700 bg-gray-700/30 text-gray-300 hover:border-gray-600'
              }`}
            >
              {getActionLabel(act)}
            </button>
          ))}
        </div>
      </div>

      {/* Execute Button */}
      <button
        onClick={handleExecute}
        disabled={selected.size === 0 || api.loading}
        className="w-full py-3 px-6 bg-primary text-white font-bold rounded-lg hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        {api.loading ? (
          <span className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Esecuzione in corso... (Tentativo {api.retryCount + 1})
          </span>
        ) : (
          `Esegui su ${selected.size} dispositivi`
        )}
      </button>

      {/* Results */}
      {showResults && results && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-white text-lg">Risultati Operazione</h2>
            <button
              onClick={() => setShowResults(false)}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
              <p className="text-green-400 text-sm">Successo</p>
              <p className="text-2xl font-bold text-green-300">{results.successCount}</p>
            </div>
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
              <p className="text-yellow-400 text-sm">Totale</p>
              <p className="text-2xl font-bold text-yellow-300">{results.operationsCount}</p>
            </div>
            <div className={`${results.errorCount > 0 ? 'bg-red-500/10 border-red-500/30' : 'bg-gray-700/30 border-gray-600'} border rounded-lg p-3`}>
              <p className={results.errorCount > 0 ? 'text-red-400' : 'text-gray-400'}>
                Errori
              </p>
              <p className={`text-2xl font-bold ${results.errorCount > 0 ? 'text-red-300' : 'text-gray-300'}`}>
                {results.errorCount}
              </p>
            </div>
          </div>

          {/* Results List */}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {results.results.map((result: any, idx: number) => (
              <div
                key={idx}
                className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="text-green-400">
                    Device {result.device_id}: {getActionLabel(result.action)}
                  </span>
                  <span className="text-green-300">✓ Success</span>
                </div>
                <p className="text-xs text-green-400/70 mt-1">
                  Status: {result.status ? 'On' : 'Off'} | Value: {result.value}
                </p>
              </div>
            ))}

            {results.errors.map((error: any, idx: number) => (
              <div
                key={idx}
                className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="text-red-400">Device {error.device_id}</span>
                  <span className="text-red-300">✗ Error</span>
                </div>
                <p className="text-xs text-red-400/70 mt-1">{error.error}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error State */}
      {api.error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400">
          <p className="font-medium">Errore nell'operazione batch</p>
          <p className="text-sm mt-1">{api.error}</p>
          {api.retryCount > 0 && (
            <p className="text-xs text-red-400/70 mt-2">Tentativi: {api.retryCount}/3</p>
          )}
        </div>
      )}
    </div>
  );
}
