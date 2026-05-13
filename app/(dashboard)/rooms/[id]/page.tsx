
'use client';

import React, { use, useEffect, useState, useCallback } from 'react';
import { useRouter,useParams, useSearchParams } from 'next/navigation';
import AddDeviceModal from '@/components/devices/AddDeviceModal';
import DeviceCard from '@/components/devices/DeviceCard';
import { useToast } from '@/components/ui/ToastProvider';
import { Room, Device, DeviceType } from '@/types';

interface LiveReading {
  device_id: number;
  value: number;
  unit: string;
}

const deviceTypeLabels: Record<string, string> = {
  light:      'Lights',
  thermostat: 'Thermostats',
  humidity:   'Humidity',
  blinds:     'Blinds',
  plug:       'Smart Plugs',
};

const deviceTypeOrder = ['light', 'thermostat', 'humidity', 'blinds', 'plug'];

export default function RoomDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router  = useRouter();
  const toast = useToast();
  const searchParams = useSearchParams();
  const searchText = (searchParams.get('q') || '').toLowerCase().trim();

  const [room,      setRoom]      = useState<Room | null>(null);
  const [devices,   setDevices]   = useState<Device[]>([]);
  const [liveData,  setLiveData]  = useState<LiveReading[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading,   setLoading]   = useState(true);
  const [filter,    setFilter]    = useState<string>('all');

  // Load room + devices
  useEffect(() => {
    Promise.all([
      fetch('/api/rooms').then((r) => r.json()),
      fetch(`/api/devices?roomId=${id}`).then((r) => r.json()),
    ])
      .then(([rooms, devs]: [Room[], Device[]]) => {
        const found = rooms.find((r: Room) => r.id === parseInt(id));
        setRoom(found ?? null);
        setDevices(devs);
        setLoading(false);
      })
      .catch(console.error);
  }, [id]);

  // Live polling
  const fetchLive = useCallback(async () => {
    try {
      const res = await fetch('/api/readings/live');
      setLiveData(await res.json());
    } catch (err) {
      console.error('[room detail live]', err);
    }
  }, []);

  useEffect(() => {
    fetchLive();
    const interval = setInterval(fetchLive, 5000);
    return () => clearInterval(interval);
  }, [fetchLive]);

  // Toggle device on/off
  const handleToggle = async (device: Device, newStatus: number) => {
    // Optimistic update
    setDevices((prev) =>
      prev.map((d) => (d.id === device.id ? { ...d, status: newStatus } : d))
    );

    try {
      await fetch(`/api/devices/${device.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      toast.success(`${device.name} is now ${newStatus === 1 ? 'ON' : 'OFF'}`);
    } catch {
      // Revert on error
      setDevices((prev) =>
        prev.map((d) => (d.id === device.id ? { ...d, status: device.status } : d))
      );
      toast.error(`Failed to toggle ${device.name}`);
    }
  };

  // Slider value change
  const handleSliderChange = async (device: Device, newValue: number) => {
    setDevices((prev) =>
      prev.map((d) => (d.id === device.id ? { ...d, value: newValue } : d))
    );

    try {
      await fetch(`/api/devices/${device.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: newValue }),
      });
      // Try to reduce toast spam for sliders, but for demo it's fine
      // toast.success(`${device.name} set to ${newValue}`);
    } catch {
      setDevices((prev) =>
        prev.map((d) => (d.id === device.id ? { ...d, value: device.value } : d))
      );
      toast.error(`Failed to update ${device.name}`);
    }
  };

  // Delete device
  const handleDelete = async (device: Device) => {
    setDevices((prev) => prev.filter((d) => d.id !== device.id));

    try {
      await fetch(`/api/devices/${device.id}`, { method: 'DELETE' });
      toast.success(`Deleted ${device.name}`);
    } catch {
      // Revert
      setDevices((prev) => [...prev, device]);
      toast.error(`Failed to delete ${device.name}`);
    }
  };

  // Add device
  const handleAddDevice = (newDevice: Device) => {
    setDevices((prev) => [...prev, newDevice]);
    toast.success(`Added ${newDevice.name}`);
  };

  const liveValueFor = (deviceId: number) =>
    liveData.find((l) => l.device_id === deviceId)?.value;

  //search devices 
  const searchedDevices = devices.filter((d) =>{
    const deviceName = d.name.toLowerCase();
    const deviceType = d.type.toLowerCase();
    return (
      searchText === '' ||
      deviceName.includes(searchText) ||
      deviceType.includes(searchText)
    );
  });
  // Filtered devices
  const filteredDevices = filter === 'all'
    ? searchedDevices
    : searchedDevices.filter((d) => d.type === filter);

  // Group by type
  const devicesByType = deviceTypeOrder.reduce<Record<string, Device[]>>((acc, type) => {
    const group = filteredDevices.filter((d) => d.type === type);
    if (group.length > 0) acc[type] = group;
    return acc;
  }, {});

  // Stats
  const activeCount = devices.filter((d) => d.status === 1).length;
  const deviceTypes = [...new Set(devices.map((d) => d.type))];

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in-up">
        <div className="h-8 w-48 rounded-xl bg-surface-container animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-40 rounded-2xl bg-surface-container animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-16 h-16 rounded-2xl bg-surface-container flex items-center justify-center">
          <span className="material-symbols-outlined text-4xl text-on-surface-variant/30">meeting_room</span>
        </div>
        <p className="text-on-surface-variant">Room not found.</p>
        <button
          onClick={() => router.push('/rooms')}
          className="text-sm text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          Back to Rooms
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6 animate-fade-in-up">
        {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => router.push('/rooms')}
            className="text-xs text-on-surface-variant hover:text-primary flex items-center gap-1 mb-1"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back_ios</span>
            Back to Rooms
          </button>
          <h1 className="headline-font text-2xl font-bold text-on-surface">
            {room.name}
          </h1>
          <p className="text-sm text-on-surface-variant mt-0.5">
            Manage devices in this room.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl primary-gradient text-on-primary text-sm font-bold shadow-lg shadow-primary/10 transition-all"
        >
          <span className="material-symbols-outlined text-[17px] font-bold">add</span>
          Add Device
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-surface-container rounded-xl border border-outline-variant/20 p-3.5 flex items-center gap-3">
          <span className="material-symbols-outlined text-[18px] text-primary">devices_other</span>
          <div>
            <p className="text-base font-bold text-on-surface headline-font leading-none tabular-nums">{devices.length}</p>
            <p className="text-[10px] text-on-surface-variant/60 mt-0.5">Total Devices</p>
          </div>
        </div>
        <div className="bg-surface-container rounded-xl border border-outline-variant/20 p-3.5 flex items-center gap-3">
          <span className="material-symbols-outlined text-[18px] text-secondary">power</span>
          <div>
            <p className="text-base font-bold text-on-surface headline-font leading-none tabular-nums">{activeCount}</p>
            <p className="text-[10px] text-on-surface-variant/60 mt-0.5">Active Devices</p>
          </div>
        </div>
        <div className="bg-surface-container rounded-xl border border-outline-variant/20 p-3.5 flex items-center gap-3">
          <span className="material-symbols-outlined text-[18px] text-tertiary">category</span>
          <div>
            <p className="text-base font-bold text-on-surface headline-font leading-none tabular-nums">{deviceTypes.length}</p>
            <p className="text-[10px] text-on-surface-variant/60 mt-0.5">Device Types</p>
          </div>
        </div>
        <div className="bg-surface-container rounded-xl border border-outline-variant/20 p-3.5 flex items-center gap-3">
          <span className="material-symbols-outlined text-[18px] text-warning">thermostat</span>
          <div>
            <p className="text-base font-bold text-on-surface headline-font leading-none tabular-nums">
              {(() => {
                const thermostats = devices.filter(d => d.type === 'thermostat');
                if (thermostats.length === 0) return '—';
                const vals = thermostats.map(d =>
                  liveData.find(l => l.device_id === d.id)?.value ?? d.value
                );
                const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
                return `${avg.toFixed(1)}°C`;
              })()}
            </p>
            <p className="text-[10px] text-on-surface-variant/60 mt-0.5">Avg Temp</p>
          </div>
        </div>
      </div>

      {/* Device Filter Tabs */}
      {devices.length > 0 && (
        <div className="bg-surface-container rounded-2xl border border-outline-variant/20 p-2 flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${filter === 'all' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
          >
            All Devices
          </button>
          {deviceTypeOrder.map((type) => {
            const count = devices.filter(d => d.type === type).length;
            return count > 0 && (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${filter === type ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
              >
                {deviceTypeLabels[type]} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Device List */}
      {filteredDevices.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-16 h-16 rounded-2xl bg-surface-container flex items-center justify-center">
            <span className="material-symbols-outlined text-4xl text-on-surface-variant/30">devices_other</span>
          </div>
          <p className="text-on-surface-variant/50">No devices found for this room or filter.</p>
          <button
            onClick={() => setShowModal(true)}
            className="text-sm text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            Add your first device
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {Object.entries(devicesByType).map(([type, typeDevices]) => (
            <React.Fragment key={type}>
              {typeDevices.map((device) => (
                <DeviceCard
                  key={device.id}
                  device={device}
                  liveValue={liveValueFor(device.id)}
                  onToggle={handleToggle}
                  onSliderChange={handleSliderChange}
                  onDelete={handleDelete}
                />
              ))}
            </React.Fragment>
          ))}
        </div>
      )}
    </div>

    {showModal && (
      <AddDeviceModal
        onClose={() => setShowModal(false)}
        roomId={parseInt(id)}
        onAdd={handleAddDevice}
      />
    )}
  </>
  );
}
