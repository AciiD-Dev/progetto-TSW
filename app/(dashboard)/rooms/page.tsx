
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import RoomCard from '@/components/rooms/RoomCard';
import RoomModal from '@/components/rooms/RoomModal';
import { useToast } from '@/components/ui/ToastProvider';
import { Room, Device } from '@/types';
import { useSearchParams } from 'next/navigation';


interface LiveReading {
  device_id: number;
  value: number;
  unit: string;
}

export default function RoomsPage() {
  const [rooms,    setRooms]    = useState<Room[]>([]);
  const [devices,  setDevices]  = useState<Device[]>([]);
  const [liveData, setLiveData] = useState<LiveReading[]>([]);
  const [loading,  setLoading]  = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const toast = useToast();
  const searchParams = useSearchParams();
  const searchText = (searchParams.get('q') || '').toLowerCase().trim();

  useEffect(() => {
    Promise.all([
      fetch('/api/rooms').then((r) => r.json()),
      fetch('/api/devices').then((r) => r.json()),
    ])
      .then(([roomsData, devicesData]: [Room[], Device[]]) => {
        setRooms(roomsData);
        setDevices(devicesData);
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  // Real-time SSE
  useEffect(() => {
    const es = new EventSource('/api/events/stream');
    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.readings) setLiveData(data.readings);
      } catch (err) {
        console.error('[rooms SSE parse]', err);
      }
    };
    return () => es.close();
  }, []);
  // evita errory se dispostivi non formato array
  const safeRooms = Array.isArray(rooms) ? rooms : [];
  const safeDevices = Array.isArray(devices) ? devices : [];

  const filteredRooms = safeRooms.filter((room)=> {
    const roomName = room.name.toLowerCase();
    const roomDevices = safeDevices.filter((device)=> device.room_id === room.id);
    const hasMatchingDevice = roomDevices.some((device) => 
      device.name.toLowerCase().includes(searchText) ||
      device.type.toLowerCase().includes(searchText)
    );

    return(
      searchText === '' ||
      roomName.includes(searchText) ||
      hasMatchingDevice
    );
  });
  const filteredDevices = safeDevices.filter((device) => {
    const deviceName = device.name.toLowerCase();
    const deviceType = device.type.toLowerCase();
    const room = safeRooms.find((room) => room.id === device.room_id);
    const roomName = room ? room.name.toLowerCase() : '';
    return (searchText !== '' &&(
      deviceName.includes(searchText) ||
      deviceType.includes(searchText) ||
      roomName.includes(searchText)
    ));
  });
    
  const totalActive = safeDevices.filter((d) => d.status === 1).length;

  // Per-room computed values
  const getRoomStats = (roomId: number) => {
    const roomDevices = safeDevices.filter((d) => d.room_id === roomId);
    const activeCount = roomDevices.filter((d) => d.status === 1).length;
    const totalCount = roomDevices.length;

    // Find temperature from thermostat devices in this room
    const thermostatIds = roomDevices
      .filter((d) => d.type === 'thermostat')
      .map((d) => d.id);

    const tempReading = liveData.find(
      (l) => thermostatIds.includes(l.device_id) && l.unit === '°C'
    );

    return { activeCount, totalCount, currentTemp: tempReading?.value ?? null };
  };

  const handleSaveRoom = async (data: { name: string; icon: string }) => {
    if (editingRoom) {
      const res = await fetch(`/api/rooms/${editingRoom.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update');
      const updated = await res.json();
      setRooms(prev => prev.map(r => r.id === updated.id ? updated : r));
      toast.success('Room updated');
    } else {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create');
      const created = await res.json();
      setRooms(prev => [...prev, created]);
      toast.success('Room created');
    }
  };

  const handleDeleteRoom = async (id: number) => {
    if (!confirm('Are you sure you want to delete this room and all its devices?')) return;
    try {
      await fetch(`/api/rooms/${id}`, { method: 'DELETE' });
      setRooms(prev => prev.filter(r => r.id !== id));
      toast.success('Room deleted');
    } catch {
      toast.error('Failed to delete room');
    }
  };
  
 

  return (
    <>
      <div className="space-y-6 animate-fade-in-up">
        {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="headline-font text-2xl font-bold text-on-surface">Rooms</h1>
          <p className="text-sm text-on-surface-variant mt-0.5">
            {safeRooms.length} room{safeRooms.length !== 1 ? 's' : ''} · {totalActive} devices active
          </p>
        </div>

        {/* Summary chips */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container border border-outline-variant/20 text-xs text-on-surface-variant">
            <span className="material-symbols-outlined text-[14px] text-primary">meeting_room</span>
            {safeRooms.length} rooms
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container border border-outline-variant/20 text-xs text-on-surface-variant">
            <span className="material-symbols-outlined text-[14px] text-tertiary">devices</span>
            {safeDevices.length} devices
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-tertiary/10 border border-tertiary/20 text-xs text-tertiary">
            <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse" />
            {totalActive} active
          </div>
          <button 
            onClick={() => { setEditingRoom(null); setShowModal(true); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl primary-gradient text-on-primary text-sm font-bold shadow-lg shadow-primary/10 transition-all"
          >
            <span className="material-symbols-outlined text-base font-bold">add</span>
            Add Room
          </button>
        </div>
      </div>
      {searchText && (
  <div className="rounded-2xl border border-outline-variant/20 bg-surface-container p-4">
    <div className="flex items-center justify-between mb-4">
      <div>
        <h2 className="headline-font text-lg font-bold text-on-surface">
          Search results
        </h2>
        <p className="text-sm text-on-surface-variant">
          Results for "{searchText}"
        </p>
      </div>

      <span className="text-xs text-on-surface-variant">
        {filteredDevices.length} device{filteredDevices.length !== 1 ? 's' : ''} found
      </span>
    </div>

    {filteredDevices.length === 0 ? (
      <p className="text-sm text-on-surface-variant">
        No devices match your search.
      </p>
    ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredDevices.map((device) => {
          const room = safeRooms.find((room) => room.id === device.room_id);

          return (
            <a
              key={device.id}
              href={`/rooms/${device.room_id}?q=${encodeURIComponent(searchText)}`}
              className="rounded-xl border border-outline-variant/20 bg-background p-4 hover:border-primary/40 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-on-surface">
                    {device.name}
                  </h3>

                  <p className="text-xs text-on-surface-variant mt-1">
                    {device.type} · {room?.name || 'Unknown room'}
                  </p>
                </div>

                <span
                  className={`w-2 h-2 rounded-full mt-1 ${
                    device.status === 1 ? 'bg-tertiary' : 'bg-outline-variant'
                  }`}
                />
              </div>
            </a>
          );
        })}
      </div>
    )}
  </div>
)}
      {/* Rooms Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-surface-container rounded-2xl border border-outline-variant/20 h-44 animate-pulse"
              style={{ animationDelay: `${i * 80}ms` }}
            />
          ))}
        </div>
      ) : filteredRooms.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-16 h-16 rounded-2xl bg-surface-container flex items-center justify-center">
            <span className="material-symbols-outlined text-4xl text-on-surface-variant/30">meeting_room</span>
          </div>
          <p className="text-on-surface-variant text-sm">
            { searchText ? 'No rooms match your search.' : 'No rooms configured yet.' }
          </p>
          <button 
            onClick={() => { setEditingRoom(null); setShowModal(true); }}
            className="text-sm text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            Add your first room
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRooms.map((room) => {
            const { activeCount, totalCount, currentTemp } = getRoomStats(room.id);
            return (
              <RoomCard
                key={room.id}
                room={room}
                activeDevices={activeCount}
                totalDevices={totalCount}
                currentTemp={currentTemp}
                onEdit={() => { setEditingRoom(room); setShowModal(true); }}
                onDelete={() => handleDeleteRoom(room.id)}
              />
            );
          })}
        </div>
      )}
    </div>

    {showModal && (
        <RoomModal 
          initialData={editingRoom ? { id: editingRoom.id, name: editingRoom.name, icon: editingRoom.icon } : undefined}
          onClose={() => { setShowModal(false); setEditingRoom(null); }}
          onSave={handleSaveRoom}
        />
      )}
    </>
  );
}
