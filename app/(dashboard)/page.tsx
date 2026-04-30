'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import DeviceCard from '@/components/devices/DeviceCard';
import { SensorReading, Room, Device } from '@/types';

const TemperatureChart = dynamic(
  () => import('@/components/dashboard/TemperatureChart'),
  {
    ssr: false,
    loading: () => (
      <div className="bg-surface-container rounded-2xl border border-outline-variant/20 h-[268px] flex items-center justify-center">
        <span className="material-symbols-outlined text-3xl text-on-surface-variant/20 animate-spin">progress_activity</span>
      </div>
    ),
  }
);

const MetricCardsSection = dynamic(
  () => import('@/components/dashboard/MetricCardsSection'),
  {
    ssr: false,
    loading: () => (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-surface-container rounded-2xl border border-outline-variant/20 h-[120px] animate-pulse" />
        ))}
      </div>
    ),
  }
);

const QUICK_ACTIONS = [
  { label: 'All Lights Off',  icon: 'lightbulb',      color: 'text-warning',   bg: 'bg-warning/10',   border: 'border-warning/20'   },
  { label: 'Night Mode',      icon: 'bedtime',         color: 'text-secondary', bg: 'bg-secondary/10', border: 'border-secondary/20' },
  { label: 'Away Mode',       icon: 'directions_walk', color: 'text-primary',   bg: 'bg-primary/10',   border: 'border-primary/20'   },
  { label: 'Eco Mode',        icon: 'eco',             color: 'text-tertiary',  bg: 'bg-tertiary/10',  border: 'border-tertiary/20'  },
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function DashboardPage() {
  const [readings,    setReadings]    = useState<SensorReading[]>([]);
  const [rooms,       setRooms]       = useState<Room[]>([]);
  const [devices,     setDevices]     = useState<Device[]>([]);
  const [devicesOn,   setDevicesOn]   = useState<number>(0);
  const [avgTemp,     setAvgTemp]     = useState<string>('—');
  const [avgHum,      setAvgHum]      = useState<string>('—');
  const [activeAlerts,setActiveAlerts]= useState<number>(0);
  const [chartReady,  setChartReady]  = useState(false);

  const [cards, setCards] = useState([
    { id: 'temp',   props: { icon: "thermostat", label: "Avg Temperature", unit: "°C", color: "primary", description: "Across all thermostat sensors" } },
    { id: 'power',  props: { icon: "power", label: "Devices On", color: "secondary", description: "Currently active devices" } },
    { id: 'humidity', props: { icon: "humidity_mid", label: "Avg Humidity", unit: "%", color: "tertiary", description: "Across all humidity sensors" } },
    { id: 'alerts', props: { icon: "notifications_active", label: "Active Alerts" } },
  ]);

  // Single mount effect — waits for hydration to complete, then:
  // 1. restores card order from localStorage
  // 2. fetches devices, rooms, and chart data
  useEffect(() => {
    // Restore saved card order from localStorage
    try {
      const saved = localStorage.getItem('homehub-metric-cards');
      if (saved) {
        const order = JSON.parse(saved);
        setCards(prev => {
          const newCards = order.map((id: string) => prev.find(c => c.id === id)).filter(Boolean);
          if (newCards.length === prev.length) return newCards as typeof prev;
          return prev;
        });
      }
    } catch {}

    // Fetch initial data
    Promise.all([
      fetch('/api/devices').then((r) => r.json()),
      fetch('/api/rooms').then((r) => r.json()),
    ])
      .then(([devicesData, roomsData]: [Device[], Room[]]) => {
        setDevicesOn(devicesData.filter((d) => d.status === 1).length);
        setDevices(devicesData);
        setRooms(roomsData);

        const firstThermostat = devicesData.find((d) => d.type === 'thermostat');
        if (!firstThermostat) {
          setChartReady(true);
          return;
        }

        return fetch(`/api/readings?deviceId=${firstThermostat.id}&range=24h`)
          .then((r) => r.json())
          .then((data: SensorReading[]) => {
            setReadings(Array.isArray(data) ? data : []);
            setChartReady(true);
          });
      })
      .catch((err) => {
        console.error('[dashboard init]', err);
        setChartReady(true);
      });
  }, []);

  // KeyboardSensor disabled — it generates aria-describedby IDs that
  // mismatch between SSR and client, causing hydration errors.
  // Drag-and-drop logic is now in MetricCardsSection component and rendered client-only.

  // Real-time SSE — stream sends { type, data: { activeDevices, avgTemperature, avgHumidity } }
  useEffect(() => {
    const es = new EventSource('/api/events/stream');
    es.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'update' && msg.data) {
          const { avgTemperature, avgHumidity, activeDevices } = msg.data;
          if (avgTemperature !== null && avgTemperature !== undefined) {
            setAvgTemp(String(avgTemperature));
          }
          if (avgHumidity !== null && avgHumidity !== undefined) {
            setAvgHum(String(avgHumidity));
          }
          if (typeof activeDevices === 'number') {
            setDevicesOn(activeDevices);
          }
        }
      } catch (err) {
        console.error('[SSE parse]', err);
      }
    };
    return () => es.close();
  }, []);

  const handleToggle = async (device: Device, newStatus: number) => {
    setDevices((prev) => prev.map((d) => (d.id === device.id ? { ...d, status: newStatus } : d)));
    try {
      await fetch(`/api/devices/${device.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch {
      setDevices((prev) => prev.map((d) => (d.id === device.id ? { ...d, status: device.status } : d)));
    }
  };

  const handleSliderChange = async (device: Device, newValue: number) => {
    setDevices((prev) => prev.map((d) => (d.id === device.id ? { ...d, value: newValue } : d)));
    try {
      await fetch(`/api/devices/${device.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: newValue }),
      });
    } catch {
      setDevices((prev) => prev.map((d) => (d.id === device.id ? { ...d, value: device.value } : d)));
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div>
        <h1 className="headline-font text-2xl font-bold text-on-surface">
          {getGreeting()}, Daniele
        </h1>
        <p className="text-sm text-on-surface-variant mt-0.5">
          Your home at a glance · Live updates every 5s
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {QUICK_ACTIONS.map((action) => (
          <button
            key={action.label}
            className={`flex flex-col items-center justify-center p-4 rounded-xl border ${action.border} ${action.bg} text-on-surface-variant hover:text-on-surface hover:border-outline-variant/60 transition-all`}
          >
            <span className={`material-symbols-outlined text-2xl ${action.color}`}>{action.icon}</span>
            <span className="text-xs font-medium mt-2">{action.label}</span>
          </button>
        ))}
      </div>

      {/* Metric Cards */}
      <MetricCardsSection 
        cards={cards} 
        avgTemp={avgTemp} 
        devicesOn={devicesOn} 
        avgHum={avgHum} 
        activeAlerts={activeAlerts}
        onCardsChange={(updated) => setCards(updated as typeof cards)}
      />

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Chart */}
        <div className="lg:col-span-2 bg-surface-container rounded-2xl border border-outline-variant/20 p-5">
          <h3 className="headline-font font-bold text-on-surface mb-4">Temperature Trends</h3>
          {chartReady && <TemperatureChart readings={readings} title="Living Room Temperature" subtitle="Last 24 hours" color="primary" />}
        </div>

        {/* Rooms Panel */}
        <div className="bg-surface-container rounded-2xl border border-outline-variant/20 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="headline-font font-bold text-on-surface">Rooms</h3>
            <Link href="/rooms" className="text-sm text-primary hover:underline">View All</Link>
          </div>
          <div className="space-y-3">
            {rooms.map((room) => (
              <Link href={`/rooms/${room.id}`} key={room.id} className="flex items-center justify-between bg-surface-container-high rounded-xl p-3 border border-outline-variant/20 hover:border-primary/50 transition-all">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-xl text-on-surface-variant">{room.icon}</span>
                  <div>
                    <p className="font-medium text-on-surface">{room.name}</p>
                    <p className="text-xs text-on-surface-variant">{devices.filter(d => d.room_id === room.id).length} devices</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant">arrow_forward_ios</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Device Control Panel */}
        <div className="lg:col-span-3 bg-surface-container rounded-2xl border border-outline-variant/20 p-5">
          <h3 className="headline-font font-bold text-on-surface mb-4">Device Control</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {devices.map((device) => (
              <DeviceCard key={device.id} device={device} onToggle={handleToggle} onSliderChange={handleSliderChange} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
