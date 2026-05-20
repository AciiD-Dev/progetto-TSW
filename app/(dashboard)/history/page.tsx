
'use client';

import React, { useEffect, useState, useCallback, use } from 'react';
import dynamic from 'next/dynamic';
import { Device, Room, SensorReading } from '@/types';
import { getPlanFromStorage, PLAN_LIMITS, Plan  } from '@/lib/plans';
import PlanBlocked from '@/components/PlanBlocked';
const TemperatureChart = dynamic(
  () => import("@/components/dashboard/TemperatureChart"),
  {
    ssr: false,
    loading: () => (
      <div className="bg-surface-container rounded-2xl border border-outline-variant/20 h-[268px] flex items-center justify-center">
        <span className="material-symbols-outlined text-3xl text-on-surface-variant/20 animate-spin">progress_activity</span>
      </div>
    ),
  }
);

export default function HistoryPage() {
  const [plan, setPlan] = useState<Plan>('free');
  const [ready, setReady] = useState(false);
  const [rooms,      setRooms]      = useState<Room[]>([]);
  const [devices,    setDevices]    = useState<Device[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [range,      setRange]      = useState<'24h' | '7d'>('24h');
  const [readings,   setReadings]   = useState<SensorReading[]>([]);
  const [loading,    setLoading]    = useState(false);
  useEffect(() => {
    setPlan(getPlanFromStorage());
    setReady(true);
  }, []); 


  useEffect(() => {
    Promise.all([
      fetch('/api/rooms').then((r) => r.json()),
      fetch('/api/devices').then((r) => r.json()),
    ])
      .then(([roomsData, devicesData]: [Room[], Device[]]) => {
        setRooms(roomsData);
        const sensors = devicesData.filter(
          (d) => d.type === 'thermostat' || d.type === 'humidity'
        );
        setDevices(sensors);
        if (sensors.length > 0) setSelectedId(sensors[0].id);
      })
      .catch(console.error);
  }, []);

  const fetchReadings = useCallback(async () => {
    if (!selectedId) {
      setLoading(false);
      setReadings([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/readings?deviceId=${selectedId}&range=${range}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setReadings(await res.json());
    } catch (err) {
      console.error('[history]', err);
      setReadings([]);
    } finally {
      setLoading(false);
    }
  }, [selectedId, range]);

  useEffect(() => {
    fetchReadings();

    // Live polling: generate a new reading every 5s then refresh
    const interval = setInterval(() => {
      fetch('/api/cron/generate-readings')
        .catch(console.error)
        .finally(() => fetchReadings());
    }, 3000);

    return () => clearInterval(interval);
  }, [fetchReadings]);

  const getRoomName = (device: Device) =>
    rooms.find((r) => r.id === device.room_id)?.name ?? 'Unknown';

  const selectedDevice = devices.find((d) => d.id === selectedId);
  if (!ready) return null;
  const canSeeHistory = PLAN_LIMITS[plan].historyDays > 0;
  if (!canSeeHistory){
    return(
      <PlanBlocked
      title="storico non disponibile"
      message="Il tuo piano attuale non consente di visualizzare lo storico dei dati. Aggiorna il tuo piano per accedere a questa funzionalità e monitorare le tendenze dei tuoi sensori nel tempo."
      />);
  }

  // Stats from readings
  const values = readings.map((r) => r.value);
  const minVal  = values.length ? Math.min(...values) : null;
  const maxVal  = values.length ? Math.max(...values) : null;
  const avgVal  = values.length ? values.reduce((a, b) => a + b, 0) / values.length : null;

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div>
        <h1 className="headline-font text-2xl font-bold text-on-surface">History</h1>
        <p className="text-sm text-on-surface-variant mt-0.5">
          Sensor readings and historical trends
        </p>
      </div>

      {/* Filters */}
      <div className="bg-surface-container rounded-2xl border border-outline-variant/20 p-5">
        <div className="flex flex-wrap gap-4 items-end">
          {/* Device selector */}
          <div className="flex-1 min-w-[200px]">
            <label
              htmlFor="history-device-select"
              className="block text-[10px] font-semibold text-on-surface-variant/60 uppercase tracking-widest mb-2"
            >
              Sensor Device
            </label>
            <div className="relative">
              <select
                id="history-device-select"
                value={selectedId ?? ''}
                onChange={(e) => setSelectedId(Number(e.target.value))}
                className="w-full bg-surface-container-high border border-outline-variant/30 rounded-xl px-4 py-2.5 pr-10 outline-none text-on-surface text-sm focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all appearance-none cursor-pointer"
              >
                {devices.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} — {getRoomName(d)}
                  </option>
                ))}
              </select>
              <span className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[16px] text-on-surface-variant/60 pointer-events-none">
                expand_more
              </span>
            </div>
          </div>

          {/* Range toggle */}
          <div>
            <label className="block text-[10px] font-semibold text-on-surface-variant/60 uppercase tracking-widest mb-2">
              Time Range
            </label>
            <div className="flex rounded-xl overflow-hidden border border-outline-variant/30 bg-surface-container-high">
              {(['24h', '7d'] as const).map((r) => (
                <button
                  key={r}
                  id={`range-${r}`}
                  onClick={() => setRange(r)}
                  className={`px-5 py-2.5 text-sm font-medium transition-all ${
                    range === r
                      ? 'bg-primary text-background font-bold'
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest'
                  }`}
                >
                  {r === '24h' ? 'Last 24h' : 'Last 7 days'}
                </button>
              ))}
            </div>
          </div>

          {/* Refresh */}
          <button
            onClick={fetchReadings}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-container-high border border-outline-variant/30 text-on-surface-variant hover:text-on-surface hover:border-outline-variant/60 transition-all text-sm disabled:opacity-50"
          >
            <span className={`material-symbols-outlined text-[17px] ${loading ? 'animate-spin' : ''}`}>refresh</span>
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Row */}
      {readings.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Readings',  value: readings.length.toString(), icon: 'data_table',  color: 'text-primary'   },
            { label: 'Min',       value: minVal !== null ? `${minVal.toFixed(1)}${readings[0]?.unit ?? ''}` : '—', icon: 'arrow_downward', color: 'text-secondary' },
            { label: 'Max',       value: maxVal !== null ? `${maxVal.toFixed(1)}${readings[0]?.unit ?? ''}` : '—', icon: 'arrow_upward',   color: 'text-warning'   },
            { label: 'Average',   value: avgVal !== null ? `${avgVal.toFixed(1)}${readings[0]?.unit ?? ''}` : '—', icon: 'analytics',      color: 'text-tertiary'  },
          ].map((stat) => (
            <div key={stat.label} className="bg-surface-container rounded-xl border border-outline-variant/20 p-3.5 flex items-center gap-3">
              <span className={`material-symbols-outlined text-[18px] ${stat.color}`}>{stat.icon}</span>
              <div>
                <p className="text-base font-bold text-on-surface headline-font leading-none tabular-nums">{stat.value}</p>
                <p className="text-[10px] text-on-surface-variant/60 mt-0.5">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Chart */}
      {selectedDevice && (
        <div className="bg-surface-container rounded-2xl border border-outline-variant/20 p-5 overflow-hidden min-h-[300px]">
          <TemperatureChart
            readings={readings}
            title={`${selectedDevice.name} — ${getRoomName(selectedDevice)}`}
            subtitle={range === '24h' ? 'Last 24 hours' : 'Last 7 days'}
            color={selectedDevice.type === 'thermostat' ? 'secondary' : 'primary'}
            type={selectedDevice.type as 'thermostat' | 'humidity'}
          />
        </div>
      )}

      {/* Table */}
      <div className="bg-surface-container rounded-2xl border border-outline-variant/20 overflow-hidden">
        <div className="px-5 py-4 border-b border-outline-variant/20 flex items-center justify-between">
          <div>
            <h3 className="headline-font font-semibold text-on-surface text-sm">
              Raw Readings
            </h3>
            {readings.length > 0 && (
              <p className="text-xs text-on-surface-variant/60 mt-0.5">{readings.length} entries</p>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <span className="material-symbols-outlined text-3xl text-on-surface-variant/20 animate-spin">progress_activity</span>
          </div>
        ) : readings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-12 h-12 rounded-2xl bg-surface-container-high flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl text-on-surface-variant/30">history</span>
            </div>
            <p className="text-sm text-on-surface-variant/50">No readings found for the selected filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-outline-variant/20">
                  <th className="text-left px-5 py-3 text-[10px] font-semibold text-on-surface-variant/50 uppercase tracking-widest">#</th>
                  <th className="text-left px-5 py-3 text-[10px] font-semibold text-on-surface-variant/50 uppercase tracking-widest">Timestamp</th>
                  <th className="text-right px-5 py-3 text-[10px] font-semibold text-on-surface-variant/50 uppercase tracking-widest">Value</th>
                  <th className="text-left px-5 py-3 text-[10px] font-semibold text-on-surface-variant/50 uppercase tracking-widest">Unit</th>
                </tr>
              </thead>
              <tbody>
                {readings.slice().reverse().map((r, i) => (
                  <tr
                    key={r.id}
                    className="border-b border-outline-variant/10 hover:bg-surface-container-high/50 transition-colors"
                  >
                    <td className="px-5 py-3 text-on-surface-variant/30 text-xs tabular-nums">
                      {readings.length - i}
                    </td>
                    <td className="px-5 py-3 text-on-surface-variant font-mono text-xs">
                      {new Date(r.recorded_at).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </td>
                    <td className="px-5 py-3 text-right font-bold text-on-surface tabular-nums">
                      {r.value.toFixed(1)}
                    </td>
                    <td className="px-5 py-3 text-on-surface-variant/60">{r.unit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
