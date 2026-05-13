'use client';

import React, { useState, useEffect } from 'react';

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

  // Close on Escape and lock body scroll
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    
    return () => {
      document.body.style.overflow = originalStyle;
      window.removeEventListener('keydown', handler);
    };
  }, [onClose]);


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
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative w-full sm:max-w-md bg-surface-container border border-outline-variant/30 rounded-t-3xl sm:rounded-2xl shadow-2xl z-10 overflow-hidden">
        {/* Top drag handle (mobile) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-outline-variant/40" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/20">
          <div>
            <h2 className="headline-font font-bold text-base text-on-surface">
              {initialData?.id ? 'Edit Room' : 'Add Room'}
            </h2>
            <p className="text-xs text-on-surface-variant/60 mt-0.5">Define your living space</p>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 flex items-center justify-center rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Content (Scrollable) */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto custom-scrollbar max-h-[75vh]">
          <div>
            <label className="block text-[10px] font-semibold text-on-surface-variant/60 uppercase tracking-widest mb-2">
              Room Name
            </label>
            <input 
              type="text"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Master Bedroom"
              className="w-full bg-surface-container-high border border-outline-variant/30 rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/30 focus:outline-none focus:ring-2 focus:border-primary/50 focus:ring-primary/10 transition-all"
            />
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-on-surface-variant/60 uppercase tracking-widest mb-2">
              Select Icon
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
              {suggestedIcons.map(ic => (
                <button
                  key={ic}
                  type="button"
                  onClick={() => setIcon(ic)}
                  className={`
                    flex items-center justify-center h-12 rounded-xl border transition-all
                    ${icon === ic 
                      ? 'border-primary bg-primary/10 text-primary shadow-sm shadow-primary/10' 
                      : 'border-outline-variant/20 bg-surface-container-high text-on-surface-variant hover:border-outline-variant/40'
                    }
                  `}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>{ic}</span>
                </button>
              ))}
            </div>
            
            <div className="mt-4">
              <label className="block text-[10px] font-semibold text-on-surface-variant/60 uppercase tracking-widest mb-2">
                Custom Icon Name
              </label>
              <input 
                type="text" 
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                placeholder="Material icon name..."
                className="w-full bg-surface-container-high border border-outline-variant/30 rounded-xl px-4 py-3 text-xs text-on-surface placeholder:text-on-surface-variant/30 focus:outline-none focus:ring-2 focus:border-primary/50 focus:ring-primary/10 transition-all"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-3 px-4 py-3 rounded-xl border border-error/30 bg-error/10 text-error text-sm">
              <span className="material-symbols-outlined text-[16px] flex-shrink-0 mt-0.5">error</span>
              <p>{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              className="flex-1 py-2.5 px-4 rounded-xl border border-outline-variant/30 text-on-surface-variant font-medium text-sm hover:bg-surface-container-high transition-all disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy}
              className="flex-1 py-2.5 px-4 rounded-xl primary-gradient text-on-primary font-bold text-sm shadow-lg shadow-primary/20 transition-all disabled:opacity-60"
            >
              {busy ? 'Saving...' : 'Save Room'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
