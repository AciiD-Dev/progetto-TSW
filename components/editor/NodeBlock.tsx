"use client";

import React from 'react';
import { SequenceStep, NodeType } from '@/types';
import { useEditor } from '@/components/editor/EditorContext';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface NodeBlockProps {
  data: SequenceStep;
  index: number;
  isLast?: boolean;
  isDraggingOverlay?: boolean;
}

const themeMap: Record<NodeType, { bg: string; text: string; ringClass: string }> = {
  trigger: { bg: 'bg-tertiary/10', text: 'text-tertiary', ringClass: 'ring-tertiary' },
  ai: { bg: 'bg-secondary/10', text: 'text-secondary', ringClass: 'ring-secondary' },
  action: { bg: 'bg-primary/10', text: 'text-primary', ringClass: 'ring-primary' },
  notification: { bg: 'bg-slate-500/10', text: 'text-slate-400', ringClass: 'ring-slate-400' },
};

export const NodeBlock: React.FC<NodeBlockProps> = ({ 
  data, 
  index,
  isLast,
  isDraggingOverlay
}) => {
  const { selectedStepId, setSelectedStepId, moveStep, steps } = useEditor();
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: data.id });

  const theme = themeMap[data.type];
  const isActive = selectedStepId === data.id;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging || isDraggingOverlay ? 50 : 1,
    touchAction: 'none' // CRITICAL for mobile drag-and-drop stability
  };

  const formatDescription = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        const word = part.slice(2, -2);
        return (
          <span key={i} className={theme.text}>
            {word}
          </span>
        );
      }
      return part;
    });
  };

  const handleMoveUp = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (index > 0) moveStep(index, index - 1);
  };

  const handleMoveDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (index < steps.length - 1) moveStep(index, index + 1);
  };

  return (
    <div 
      ref={setNodeRef}
      style={style}
      className={`relative group touch-none select-none z-10 ${isDragging ? 'opacity-0' : 'opacity-100'} ${isDraggingOverlay ? 'scale-105 drop-shadow-2xl opacity-100' : 'drop-shadow-lg'}`}
      {...(isDraggingOverlay ? {} : attributes)}
      {...(isDraggingOverlay ? {} : listeners)}
    >
      {/* Desktop Drag Handle */}
      {!isDraggingOverlay && (
        <div 
          className="absolute -left-12 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity hidden lg:flex flex-col gap-2 cursor-grab active:cursor-grabbing px-4 py-6"
        >
          <span className="material-symbols-outlined text-slate-500">drag_indicator</span>
        </div>
      )}

      {/* Mobile-friendly / Accessible Arrow Controls */}
      {!isDraggingOverlay && (
        <div className="absolute -right-4 lg:-right-12 top-1/2 -translate-y-1/2 opacity-100 transition-opacity flex flex-col gap-1 z-20 xl:opacity-0 xl:group-hover:opacity-100">
          {index > 0 && (
            <button 
              onClick={handleMoveUp}
              onPointerDown={(e) => e.stopPropagation()} 
              className="bg-surface-container-high rounded-full w-8 h-8 flex items-center justify-center border border-outline-variant/20 hover:bg-surface-container-highest shadow-md hover:text-primary transition-colors text-on-surface-variant active:scale-95"
              aria-label="Move Node Up"
            >
              <span className="material-symbols-outlined text-[18px] leading-none">expand_less</span>
            </button>
          )}
          {!isLast && (
            <button 
              onClick={handleMoveDown} 
              onPointerDown={(e) => e.stopPropagation()} 
              className="bg-surface-container-high rounded-full w-8 h-8 flex items-center justify-center border border-outline-variant/20 hover:bg-surface-container-highest shadow-md hover:text-primary transition-colors text-on-surface-variant active:scale-95"
              aria-label="Move Node Down"
            >
              <span className="material-symbols-outlined text-[18px] leading-none">expand_more</span>
            </button>
          )}
        </div>
      )}

      {/* Main Node Card */}
      <div
        onClick={() => !isDraggingOverlay && setSelectedStepId(data.id)}
        className={`bg-surface-container-high border border-outline-variant/10 rounded-xl p-5 cursor-[inherit] hover:shadow-primary/5 transition-all w-full ${isActive ? 'ring-2 ring-primary' : ''}`}
      >
        <div className="flex items-center justify-between mb-3 pointer-events-none">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${theme.bg}`}>
              <span className={`material-symbols-outlined text-lg ${theme.text}`}>
                {data.icon}
              </span>
            </div>
            <span className="font-bold text-on-surface text-sm uppercase">
              {data.title}
            </span>
          </div>

          {data.badge && (
            <span className={`text-[10px] font-bold tracking-widest px-2 py-0.5 rounded uppercase shrink-0 ml-2 ${theme.bg} ${theme.text}`}>
              {data.badge}
            </span>
          )}
        </div>

        <div className="text-on-surface-variant text-sm font-medium leading-relaxed pr-6 lg:pr-0 pointer-events-none">
          {formatDescription(data.description)}
        </div>
      </div>

      {/* Spine Connector */}
      {!isLast && !isDraggingOverlay && (
        <div className="absolute left-1/2 -bottom-[22px] lg:-bottom-[26px] -translate-x-1/2 w-4 h-4 rounded-full bg-surface-container-high border-2 border-outline-variant z-20 flex items-center justify-center pointer-events-none">
          <div className="w-1.5 h-1.5 rounded-full bg-primary/40"></div>
        </div>
      )}
    </div>
  );
};
