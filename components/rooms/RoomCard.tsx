
'use client';

import React from 'react';
import Link from 'next/link';
import { Room } from '@/types';

interface RoomCardProps {
  room: Room;
  activeDevices: number;
  totalDevices: number;
  currentTemp?: number | null;
  onEdit?: () => void;
  onDelete?: () => void;
}

const iconColorMap: Record<string, { color: string; bg: string }> = {
  living_room:  { color: 'text-warning',   bg: 'bg-warning/10'   },
  bed:          { color: 'text-secondary', bg: 'bg-secondary/10' },
  kitchen:      { color: 'text-tertiary',  bg: 'bg-tertiary/10'  },
  bathroom:     { color: 'text-primary',   bg: 'bg-primary/10'   },
  garage:       { color: 'text-on-surface-variant', bg: 'bg-surface-container-highest' },
  yard:         { color: 'text-tertiary',  bg: 'bg-tertiary/10'  },
  office:       { color: 'text-primary',   bg: 'bg-primary/10'   },
  dining_room:  { color: 'text-warning',   bg: 'bg-warning/10'   },
  living:       { color: 'text-warning',   bg: 'bg-warning/10'   },
  kitchen_set:  { color: 'text-tertiary',  bg: 'bg-tertiary/10'  },
};

function getIconStyle(icon: string) {
  return iconColorMap[icon] ?? { color: 'text-primary', bg: 'bg-primary/10' };
}

export default function RoomCard({ room, activeDevices, totalDevices, currentTemp, onEdit, onDelete }: RoomCardProps) {
  const style = getIconStyle(room.icon);
  const activityPct = totalDevices > 0 ? (activeDevices / totalDevices) * 100 : 0;

  return (
    <Link
      href={`/rooms/${room.id}`}
      className="group block bg-surface-container rounded-2xl border border-outline-variant/20 p-5 hover:border-outline-variant/50 hover:bg-surface-container-high transition-all duration-300 relative overflow-hidden"
    >
      {/* Background accent */}
      <div className={`absolute -top-8 -right-8 w-28 h-28 ${style.bg} rounded-full blur-2xl opacity-40 group-hover:opacity-70 transition-opacity`} />

      {/* Header */}
      <div className="flex items-start justify-between mb-4 relative z-10">
        <div className={`w-11 h-11 rounded-xl ${style.bg} flex items-center justify-center`}>
          <span
            className={`material-symbols-outlined ${style.color} text-[22px]`}
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            {room.icon}
          </span>
        </div>

        <div className="flex items-center gap-2 flex-col sm:flex-row">
          {currentTemp !== null && currentTemp !== undefined && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary/10 border border-secondary/20">
              <span className="material-symbols-outlined text-secondary text-[13px]">thermostat</span>
              <span className="text-xs font-semibold text-secondary tabular-nums">
                {currentTemp.toFixed(1)}°C
              </span>
            </div>
          )}
          
          <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            {onEdit && (
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEdit(); }}
                className="w-7 h-7 rounded bg-surface-container-high hover:bg-surface-container-highest flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors"
                title="Edit Room"
              >
                <span className="material-symbols-outlined text-[15px]">edit</span>
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(); }}
                className="w-7 h-7 rounded bg-surface-container-high hover:bg-surface-container-highest flex items-center justify-center text-on-surface-variant hover:text-error transition-colors"
                title="Delete Room"
              >
                <span className="material-symbols-outlined text-[15px]">delete</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Room info */}
      <div className="relative">
        <h3 className="font-semibold text-on-surface headline-font text-base mb-0.5 group-hover:text-primary transition-colors">
          {room.name}
        </h3>
        <p className="text-xs text-on-surface-variant/60">
          {activeDevices} of {totalDevices} device{totalDevices !== 1 ? 's' : ''} active
        </p>

        {/* Activity bar */}
        <div className="mt-3">
          <div className="h-1 rounded-full bg-surface-container-highest overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${style.color.replace('text-', 'bg-')}`}
              style={{ width: `${activityPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Arrow */}
      <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-1 group-hover:translate-x-0">
        <span className="material-symbols-outlined text-primary text-[18px]">arrow_forward</span>
      </div>
    </Link>
  );
}
