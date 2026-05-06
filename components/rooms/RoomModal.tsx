'use client';

import React, { useState } from 'react';

interface RoomModalProps {
  initialData?: { id?: number; name: string; icon: string };
  onClose: () => void;
  onSave: (data: { name: string; icon: string }) => Promise<void>;
}

const suggestedIcons = [
  'living', 'kitchen', 'bed', 'bathroom', 'yard', 
  'garage', 'chair', 'desk', 'laptop_mac', 'deck', 'balcony'
];

export default function RoomModal({ initialData, onClose, onSave }: RoomModalProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [icon, setIcon] = useState(initialData?.icon || 'living');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Room name is required.');
      return;
    }
    setError('');
    setBusy(true);

    try {
      await onSave({ name: name.trim(), icon });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save room.');
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-sm glass-panel border border-outline-variant/20 rounded-2xl p-6 shadow-2xl z-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="headline-font font-bold text-lg text-on-surface">
            {initialData?.id ? 'Edit Room' : 'Add Room'}
          </h2>
          <button onClick={onClose} className="material-symbols-outlined text-on-surface-variant hover:text-on-surface p-1 rounded-full bg-white/5">
            close
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Room Name</label>
            <input 
              type="text"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Master Bedroom"
              className="w-full bg-surface-container-highest border-none rounded-lg px-4 py-3 outline-none text-on-surface text-sm"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Icon</label>
            <div className="grid grid-cols-5 gap-2">
              {suggestedIcons.map(ic => (
                <button
                  key={ic}
                  type="button"
                  onClick={() => setIcon(ic)}
                  className={`flex items-center justify-center h-12 rounded-lg border transition-all ${
                    icon === ic 
                      ? 'border-primary/50 bg-primary/10 text-primary' 
                      : 'border-outline-variant/15 hover:border-outline-variant/30 text-on-surface-variant'
                  }`}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>{ic}</span>
                </button>
              ))}
            </div>
            {/* Custom Icon fallback */}
            <input 
              type="text" 
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              placeholder="Or type Material icon name..."
              className="w-full bg-surface-container-highest border-none rounded-lg px-4 py-3 outline-none text-on-surface text-sm mt-3"
            />
          </div>

          {error && (
            <div className="px-4 py-3 rounded-lg border border-error/30 bg-error/10 text-error text-sm font-medium">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-lg border border-outline-variant/20 text-on-surface-variant font-medium text-sm hover:bg-surface-container"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy}
              className="flex-1 py-3 px-4 rounded-lg ethereal-gradient text-[#0b0e14] font-bold text-sm disabled:opacity-60"
            >
              {busy ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
