"use client";

import React from 'react';
import { useEditor } from '@/components/editor/EditorContext';
import { NodeType } from '@/types';

const themeMap: Record<NodeType, { bg: string; text: string; }> = {
  trigger: { bg: 'bg-tertiary/10', text: 'text-tertiary' },
  ai: { bg: 'bg-secondary/10', text: 'text-secondary' },
  action: { bg: 'bg-primary/10', text: 'text-primary' },
  notification: { bg: 'bg-slate-500/10', text: 'text-slate-400' },
};

export default function PropertiesPanel() {
  const { steps, selectedStepId, setSelectedStepId, removeStep } = useEditor();
  
  const selectedStep = steps.find(s => s.id === selectedStepId);

  if (!selectedStep) {
    return (
      <aside className="hidden lg:flex fixed right-4 top-24 h-[calc(100vh-112px)] w-80 glass-panel border border-outline-variant/20 rounded-2xl flex-col items-center justify-center p-6 z-10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] opacity-80 transition-all">
        <span className="material-symbols-outlined text-4xl text-on-surface-variant/30 mb-4 block">touch_app</span>
        <p className="text-sm font-medium text-on-surface-variant text-center">Select a node to view its properties</p>
      </aside>
    );
  }

  const theme = themeMap[selectedStep.type];

  return (
    <>
      <div 
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity" 
        onClick={() => setSelectedStepId(null)}
      />
      
      <aside className="fixed inset-x-4 bottom-4 top-auto max-h-[85vh] lg:bottom-auto lg:right-4 lg:inset-auto lg:top-24 lg:h-[calc(100vh-112px)] lg:w-80 glass-panel border border-outline-variant/20 rounded-2xl flex flex-col p-6 overflow-y-auto z-50 shadow-[0_8px_32px_rgba(0,0,0,0.6)] transition-all custom-scrollbar">
        <div className="flex items-center justify-between mb-8 shrink-0">
          <h3 className="headline-font font-bold text-lg text-primary">Properties</h3>
          <span 
            onClick={() => setSelectedStepId(null)}
            className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-on-surface p-1 bg-white/5 rounded-full"
          >
            close
          </span>
        </div>
        
        <div className="space-y-8">
          <section>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-4">Selected Block</label>
            <div className="flex items-center gap-4 bg-surface-container p-3 rounded-lg border border-outline-variant/10 hover:border-primary/30 hover:bg-surface-container-high transition-colors">
              <div className={`w-10 h-10 rounded-lg ${theme.bg} flex items-center justify-center`}>
                <span className={`material-symbols-outlined ${theme.text}`}>{selectedStep.icon}</span>
              </div>
              <div>
                <p className="font-bold text-on-surface text-sm uppercase">{selectedStep.title}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">ID: {selectedStep.id.toUpperCase()}</p>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Parameters</label>
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-xs text-on-surface-variant ml-1 font-medium">Description</p>
                <div className="p-3 bg-surface-container-highest rounded-lg text-sm text-on-surface border border-outline-variant/10 leading-relaxed">
                  {selectedStep.description.replace(/\*\*/g, '')}
                </div>
              </div>
              <div className="space-y-2 pt-2">
                <p className="text-xs text-on-surface-variant ml-1 font-medium">Activity Logging</p>
                <div className="w-8 h-4 bg-primary/20 rounded-full relative cursor-pointer">
                  <div className="absolute right-1 top-1 w-2 h-2 rounded-full bg-primary shadow-sm hover:scale-110 transition-transform"></div>
                </div>
              </div>
            </div>
          </section>

          <section className="pt-6 border-t border-outline-variant/10">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-on-surface">Advanced Logic</span>
              <div className="w-8 h-4 bg-primary/20 rounded-full relative cursor-pointer">
                <div className="absolute right-1 top-1 w-2 h-2 rounded-full bg-primary shadow-sm hover:scale-110 transition-transform"></div>
              </div>
            </div>
            <p className="text-[10px] text-slate-500 italic leading-relaxed">
              Enabling advanced logic allows for nested sub-sequences and error boundary handling.
            </p>
          </section>

          <div className="pt-8 space-y-3 pb-6 border-t border-outline-variant/10">
            <button className="w-full py-3 px-4 rounded-lg ethereal-gradient text-[#0b0e14] font-bold text-sm shadow-lg shadow-primary/20 hover:shadow-primary/40 active:scale-[0.98] transition-all">
              Update Step
            </button>
            <button 
              onClick={() => removeStep(selectedStep.id)}
              className="w-full py-3 px-4 rounded-lg border border-outline-variant/20 text-error font-semibold text-sm hover:bg-error/5 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">delete</span>
              Remove Node
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
